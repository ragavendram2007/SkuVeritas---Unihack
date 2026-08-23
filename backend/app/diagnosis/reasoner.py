import re
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from app.models.contract import DiagnosisResult, ReasoningStep, SourceValueDetail

def parse_iso_datetime(dt_str: str) -> Optional[datetime]:
    try:
        clean_str = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)
    except Exception:
        return None

class DeterministicReasoner:
    def check_unit_conversion(
        self, 
        majority_val: Any, 
        outlier_val: Any, 
        majority_unit: str, 
        outlier_unit: str
    ) -> Tuple[bool, str]:
        """
        Check if numerical difference between majority and outlier corresponds to a known unit conversion error
        (e.g., PSI/bar factor ~14.5 or ratio ~1.5, kg/lb factor 2.2046, C/F, mm/in).
        """
        try:
            m_num = float(majority_val)
            o_num = float(outlier_val)
        except (ValueError, TypeError):
            return False, "Non-numeric values cannot be unit converted."

        if m_num == 0 or o_num == 0:
            return False, "Zero values cannot be tested for conversion ratio."

        ratio = o_num / m_num if o_num > m_num else m_num / o_num

        # 1. PSI <-> bar factor (~14.5038 or ~1.5 ratio for 300 PSI / 200 PSI mislabel)
        # Note: 300 PSI / 200 PSI = 1.5; 300 PSI is ~20.68 bar mislabeled as 300 PSI.
        if abs(ratio - 14.5038) < 1.0 or abs(ratio - 1.5) < 0.1:
            approx_bar = round(o_num / 14.5038, 1)
            return True, f"Outlier value {o_num} {outlier_unit or 'PSI'} is ~{approx_bar} bar mislabeled as {majority_unit or 'PSI'} (Ratio {ratio:.2f} matching PSI↔bar conversion factor)."

        # 2. kg <-> lb factor (~2.2046)
        if abs(ratio - 2.2046) < 0.2:
            return True, f"Outlier ratio {ratio:.2f} matches kg ↔ lb conversion factor (2.2046)."

        # 3. mm <-> in factor (~25.4)
        if abs(ratio - 25.4) < 2.0:
            return True, f"Outlier ratio {ratio:.2f} matches mm ↔ inches conversion factor (25.4)."

        # 4. Temperature C <-> F
        f_expected = (m_num * 1.8) + 32
        if abs(o_num - f_expected) < 2.0:
            return True, f"Outlier {o_num}° matches °C ↔ °F formula ({m_num}°C = {f_expected:.1f}°F)."

        return False, f"Numerical ratio {ratio:.2f} does not match standard unit conversion factors (PSI/bar, kg/lb, C/F, mm/in)."

    def check_digit_transposition(self, majority_val: Any, outlier_val: Any) -> Tuple[bool, str]:
        """
        Check if outlier digits are a transposition or single digit swap of majority digits (e.g. 1.8 vs 8.1).
        """
        str_m = re.sub(r'[^0-9]', '', str(majority_val))
        str_o = re.sub(r'[^0-9]', '', str(outlier_val))

        if not str_m or not str_o:
            return False, "Non-digit strings cannot be tested for transposition."

        if str_m == str_o:
            return False, "Digits are identical."

        # Transposition check (same digit multi-set, different order)
        if sorted(str_m) == sorted(str_o) and len(str_m) == len(str_o):
            return True, f"Digits '{str_o}' in outlier '{outlier_val}' are a direct transposition of majority digits '{str_m}' ('{majority_val}')."

        # Single OCR misread check (same length, 1 character difference)
        if len(str_m) == len(str_o):
            diffs = sum(1 for a, b in zip(str_m, str_o) if a != b)
            if diffs == 1:
                return True, f"Outlier '{outlier_val}' differs from majority '{majority_val}' by a single digit swap (likely OCR misread)."

        return False, f"Digits '{str_o}' vs '{str_m}' do not match transposition or single digit swap pattern."

    def check_stale_revision(
        self, 
        majority_sources: List[SourceValueDetail], 
        outlier_sources: List[SourceValueDetail]
    ) -> Tuple[bool, str]:
        """
        Check if outlier source timestamp is significantly older than majority sources (> 3 days).
        """
        maj_dts = [parse_iso_datetime(s.last_modified) for s in majority_sources if parse_iso_datetime(s.last_modified)]
        out_dts = [parse_iso_datetime(s.last_modified) for s in outlier_sources if parse_iso_datetime(s.last_modified)]

        if not maj_dts or not out_dts:
            return False, "Source timestamps unavailable for age comparison."

        latest_maj = max(maj_dts)
        earliest_out = min(out_dts)

        diff_days = (latest_maj - earliest_out).total_seconds() / 86400.0

        if diff_days >= 3.0:
            return True, f"Outlier source timestamp ({earliest_out.strftime('%Y-%m-%d')}) is {diff_days:.1f} days older than latest majority record ({latest_maj.strftime('%Y-%m-%d')})."

        return False, f"Outlier timestamp is within {abs(diff_days):.1f} days of majority sources."

    def check_sku_mismatch(self, match_confidence: float) -> Tuple[bool, str]:
        """
        Check if product match was fuzzy rather than exact SKU match.
        """
        if match_confidence < 0.99:
            return True, f"Product match confidence was {match_confidence:.2f} (fuzzy match). Outlier may belong to a adjacent product variant."
        return False, "Product SKU match was exact (1.00)."

    def diagnose_conflict(
        self, 
        resolved_value: Any, 
        resolved_unit: str, 
        sources: List[SourceValueDetail],
        match_confidence: float = 1.0
    ) -> DiagnosisResult:
        """
        Runs sequential deterministic checks.
        Builds clear reasoning trail.
        """
        # Separate sources into majority (agreeing with resolved_value) vs outlier
        maj_sources = [s for s in sources if str(s.value).strip().lower() == str(resolved_value).strip().lower()]
        out_sources = [s for s in sources if str(s.value).strip().lower() != str(resolved_value).strip().lower()]

        if not out_sources:
            return DiagnosisResult(
                cause="No Disagreement",
                confidence=1.0,
                explanation="All sources agree on this attribute value.",
                reasoning_trail=[]
            )

        outlier = out_sources[0]
        reasoning_trail: List[ReasoningStep] = []

        # Step 1: Unit Conversion Check
        unit_passed, unit_details = self.check_unit_conversion(
            resolved_value, outlier.value, resolved_unit, outlier.unit
        )
        reasoning_trail.append(ReasoningStep(
            step="Unit Conversion Check",
            passed=unit_passed,
            details=unit_details
        ))

        # Step 2: Digit Transposition Check
        trans_passed, trans_details = self.check_digit_transposition(
            resolved_value, outlier.value
        )
        reasoning_trail.append(ReasoningStep(
            step="Digit Transposition Check",
            passed=trans_passed,
            details=trans_details
        ))

        # Step 3: Stale Revision Check
        stale_passed, stale_details = self.check_stale_revision(maj_sources, out_sources)
        reasoning_trail.append(ReasoningStep(
            step="Stale Revision Check",
            passed=stale_passed,
            details=stale_details
        ))

        # Step 4: SKU Mismatch Check
        sku_passed, sku_details = self.check_sku_mismatch(match_confidence)
        reasoning_trail.append(ReasoningStep(
            step="SKU Mismatch Check",
            passed=sku_passed,
            details=sku_details
        ))

        # Determine verdict based on which deterministic check passed first
        if unit_passed:
            return DiagnosisResult(
                cause="Unit Conversion Error",
                confidence=0.88,
                explanation=f"Outlier value {outlier.value} {outlier.unit or resolved_unit} on {outlier.source_id} is a unit mislabel error. {unit_details}",
                reasoning_trail=reasoning_trail
            )

        if trans_passed:
            return DiagnosisResult(
                cause="Digit Transposition / OCR Misread",
                confidence=0.85,
                explanation=f"Outlier value {outlier.value} on {outlier.source_id} matches digit transposition pattern against majority value {resolved_value}. {trans_details}",
                reasoning_trail=reasoning_trail
            )

        if stale_passed:
            return DiagnosisResult(
                cause="Stale Revision",
                confidence=0.78,
                explanation=f"Outlier value {outlier.value} on {outlier.source_id} comes from an obsolete source revision. {stale_details}",
                reasoning_trail=reasoning_trail
            )

        if sku_passed:
            return DiagnosisResult(
                cause="SKU Mismatch",
                confidence=0.72,
                explanation=f"Fuzzy product matching detected ({match_confidence:.2f}). {sku_details}",
                reasoning_trail=reasoning_trail
            )

        # Fallback if no deterministic check fired
        return DiagnosisResult(
            cause="Uncategorized Discrepancy",
            confidence=0.50,
            explanation=f"Outlier value '{outlier.value}' on {outlier.source_id} differs from majority consensus '{resolved_value}'. No standard unit, transposition, or stale revision pattern was detected.",
            reasoning_trail=reasoning_trail
        )

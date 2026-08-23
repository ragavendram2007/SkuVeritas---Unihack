from typing import Dict, List, Any, Tuple
from collections import defaultdict
from app.config import get_criticality, CRITICALITY_WEIGHTS
from app.models.canonical import SourceRecord
from app.models.contract import ResolvedAttribute, SourceValueDetail

def is_value_equal(val1: Any, val2: Any, unit1: str = "", unit2: str = "") -> bool:
    """
    Check equality of two attribute values.
    Supports numerical tolerance (within 2%) if both are numbers.
    """
    # Try numerical comparison
    try:
        f1 = float(val1)
        f2 = float(val2)
        if abs(f1 - f2) < 1e-5:
            return True
        if max(abs(f1), abs(f2)) > 0:
            rel_diff = abs(f1 - f2) / max(abs(f1), abs(f2))
            if rel_diff <= 0.02:
                return True
        return False
    except (ValueError, TypeError):
        pass

    # String comparison
    str1 = str(val1).strip().lower()
    str2 = str(val2).strip().lower()
    return str1 == str2

class TrustEngine:
    def resolve_product_attributes(
        self, 
        source_records: List[SourceRecord]
    ) -> Tuple[Dict[str, ResolvedAttribute], float]:
        """
        Calculates resolved attributes, source details, confidence, risk, and conflict flags.
        Returns resolved attributes dict and overall product trust score (0 - 100).
        """
        # Group values by attribute_name
        attr_sources: Dict[str, List[SourceValueDetail]] = defaultdict(list)
        
        for record in source_records:
            for attr_name, attr_val in record.values.items():
                detail = SourceValueDetail(
                    source_id=record.source_id,
                    source_type=record.source_type,
                    value=attr_val.value,
                    unit=attr_val.unit or "",
                    raw_text=attr_val.raw_text or str(attr_val.value),
                    reliability_weight=record.reliability_prior,
                    last_modified=record.last_modified
                )
                attr_sources[attr_name].append(detail)

        resolved_attributes: Dict[str, ResolvedAttribute] = {}
        total_weighted_confidence = 0.0
        total_criticality_weight = 0.0

        all_source_ids = [r.source_id for r in source_records]

        for attr_name, sources in attr_sources.items():
            criticality = get_criticality(attr_name)
            crit_weight = CRITICALITY_WEIGHTS[criticality]

            # Missing attribute detection
            reporting_source_ids = [s.source_id for s in sources]
            missing_in = [sid for sid in all_source_ids if sid not in reporting_source_ids]
            missing = len(missing_in) > 0

            # Group sources by agreeing values to find majority resolved value
            # Map candidate value -> list of sources supporting it
            clusters: List[Tuple[Any, str, float, List[SourceValueDetail]]] = []
            
            for src in sources:
                matched_cluster = False
                for i, (c_val, c_unit, c_weight, c_sources) in enumerate(clusters):
                    if is_value_equal(src.value, c_val, src.unit, c_unit):
                        c_sources.append(src)
                        clusters[i] = (c_val, c_unit or src.unit, c_weight + src.reliability_weight, c_sources)
                        matched_cluster = True
                        break
                if not matched_cluster:
                    clusters.append((src.value, src.unit, src.reliability_weight, [src]))

            # Sort clusters by cumulative reliability weight descending
            clusters.sort(key=lambda x: x[2], reverse=True)
            
            winning_val, winning_unit, winning_weight, winning_sources = clusters[0]
            total_source_weight = sum(s.reliability_weight for s in sources)

            # Confidence = agreeing weight / total weight
            confidence = round(winning_weight / total_source_weight, 3) if total_source_weight > 0 else 1.0
            risk = round(crit_weight * (1.0 - confidence), 3)

            # Conflict flag: if more than 1 cluster exists
            conflict = len(clusters) > 1

            resolved_attr = ResolvedAttribute(
                resolved_value=winning_val,
                unit=winning_unit,
                criticality=criticality,
                confidence=confidence,
                risk=risk,
                conflict=conflict,
                missing=missing,
                missing_in=missing_in,
                sources=sources,
                diagnosis=None
            )
            resolved_attributes[attr_name] = resolved_attr

            total_weighted_confidence += confidence * crit_weight
            total_criticality_weight += crit_weight

        overall_trust_score = round(
            (total_weighted_confidence / total_criticality_weight) * 100.0, 1
        ) if total_criticality_weight > 0 else 100.0

        return resolved_attributes, overall_trust_score

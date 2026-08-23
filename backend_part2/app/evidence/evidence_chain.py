from typing import Dict, Any, List
from app.models.dossier import AttributeEvidence, ExhibitBreakdown

EXHIBIT_LABELS = ["Exhibit A", "Exhibit B", "Exhibit C", "Exhibit D", "Exhibit E", "Exhibit F"]

class EvidenceChainEngine:
    def build_evidence_for_attribute(
        self, 
        attribute_name: str, 
        attr_data: Dict[str, Any]
    ) -> AttributeEvidence:
        sources = attr_data.get("sources", [])
        resolved_value = attr_data.get("resolved_value", "")
        unit = attr_data.get("unit", "")
        criticality = attr_data.get("criticality", "MEDIUM")
        confidence = float(attr_data.get("confidence", 1.0))
        risk = float(attr_data.get("risk", 0.0))
        conflict = bool(attr_data.get("conflict", False))
        missing = bool(attr_data.get("missing", False))

        total_weight = sum(float(s.get("reliability_weight", 0.0)) for s in sources)
        
        exhibits: List[ExhibitBreakdown] = []
        for idx, src in enumerate(sources):
            w = float(src.get("reliability_weight", 0.0))
            pct = round((w / total_weight) * 100.0, 1) if total_weight > 0 else 0.0
            label = EXHIBIT_LABELS[idx] if idx < len(EXHIBIT_LABELS) else f"Exhibit {idx+1}"
            
            exhibits.append(ExhibitBreakdown(
                source_id=src.get("source_id", f"src_{idx}"),
                source_type=src.get("source_type", "unknown"),
                value=src.get("value", ""),
                unit=src.get("unit", ""),
                reliability_weight=w,
                contribution_percent=pct,
                exhibit_label=label,
                last_modified=src.get("last_modified", "")
            ))

        formula = f"Confidence = (Σ Agreeing Source Priors) / (Total Source Priors {total_weight:.2f}) = {confidence:.3f}"

        return AttributeEvidence(
            attribute_name=attribute_name,
            resolved_value=resolved_value,
            unit=unit,
            criticality=criticality,
            confidence=confidence,
            risk=risk,
            conflict=conflict,
            missing=missing,
            exhibits=exhibits,
            formula_applied=formula
        )

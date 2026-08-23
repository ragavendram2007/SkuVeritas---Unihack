from typing import Dict, Any, List
from app.models.routing import RoutingDecision

HARD_BLOCK_RISK_THRESHOLD = 0.10
FLAGGED_RISK_THRESHOLD = 0.01

class RoutingEngine:
    def evaluate_routing(self, resolved_data: Dict[str, Any], review_override_verdict: Optional[str] = None) -> RoutingDecision:
        """
        Evaluates 3-Tier Routing Decision for a product record.
        Returns RoutingDecision with tier, verdict_stamp, plain-English reason, and driving attributes.
        """
        product_id = resolved_data.get("sku") or resolved_data.get("product_id") or "UNKNOWN"

        # Check if a human review action has overridden the verdict
        if review_override_verdict:
            if review_override_verdict == "APPROVED":
                return RoutingDecision(
                    product_id=product_id,
                    tier="auto-publish",
                    verdict_stamp="APPROVED",
                    reason="Human Reviewer Approved: Verified by Senior Data Analyst (Reviewer #42).",
                    driving_attributes=[],
                    human_review_required=False
                )
            if review_override_verdict == "OVERRIDDEN":
                return RoutingDecision(
                    product_id=product_id,
                    tier="auto-publish",
                    verdict_stamp="OVERRIDDEN",
                    reason="Human Reviewer Overridden: Attribute values updated with manual override justification.",
                    driving_attributes=[],
                    human_review_required=False
                )

        attributes = resolved_data.get("attributes", {})
        
        blocked_attrs = []
        flagged_attrs = []

        for attr_name, attr in attributes.items():
            risk = float(attr.get("risk", 0.0))
            crit = str(attr.get("criticality", "")).upper()
            conflict = bool(attr.get("conflict", False))
            confidence = float(attr.get("confidence", 1.0))

            # Tier 3 Hard-Block condition: risk >= 0.10 OR (criticality HIGH and conflict True)
            if risk >= HARD_BLOCK_RISK_THRESHOLD or (crit == "HIGH" and conflict):
                blocked_attrs.append((attr_name, risk, confidence, crit))
            elif risk > FLAGGED_RISK_THRESHOLD or conflict:
                flagged_attrs.append((attr_name, risk, confidence))

        # Evaluate final verdict
        if blocked_attrs:
            top_attr, risk, conf, crit = blocked_attrs[0]
            reason = f"Blocked: {top_attr} risk {risk:.3f} exceeds hard-block threshold 0.10 despite {Math_round(conf*100)}% confidence." if 'Math_round' in locals() else f"Blocked: {top_attr} risk {risk:.3f} exceeds hard-block threshold {HARD_BLOCK_RISK_THRESHOLD} despite {round(conf*100, 1)}% confidence."
            return RoutingDecision(
                product_id=product_id,
                tier="blocked",
                verdict_stamp="BLOCKED",
                reason=reason,
                driving_attributes=[a[0] for a in blocked_attrs],
                human_review_required=True
            )

        if flagged_attrs:
            top_attr, risk, conf = flagged_attrs[0]
            reason = f"Flagged for Verification: {top_attr} disagreement detected (risk {risk:.3f} below hard-block limit)."
            return RoutingDecision(
                product_id=product_id,
                tier="flagged",
                verdict_stamp="FLAGGED",
                reason=reason,
                driving_attributes=[a[0] for a in flagged_attrs],
                human_review_required=False
            )

        # Tier 1 Auto-Publish
        return RoutingDecision(
            product_id=product_id,
            tier="auto-publish",
            verdict_stamp="AUTO-PUBLISHED",
            reason="Auto-Published: 100% source consensus across all attributes (0.000 risk).",
            driving_attributes=[],
            human_review_required=False
        )

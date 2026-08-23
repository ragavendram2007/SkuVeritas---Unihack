import datetime
from typing import Dict, List, Tuple
from app.models.dossier import AdaptiveTrustAdjustment, TrustLeaderboardEntry

# Per-source-per-attribute-type reliability weights map
# Key: (source_id, attribute_type) -> float
SOURCE_ATTRIBUTE_WEIGHTS: Dict[Tuple[str, str], float] = {}

# Audit trail ledger logs
TRUST_LEDGER_LOGS: List[AdaptiveTrustAdjustment] = []

class AdaptiveTrustEngine:
    def get_source_weight(self, source_id: str, attribute_type: str, default_prior: float) -> float:
        key = (source_id, attribute_type.lower())
        return SOURCE_ATTRIBUTE_WEIGHTS.get(key, default_prior)

    def record_review_adjustment(
        self,
        source_id: str,
        attribute_type: str,
        product_id: str,
        action_type: str,  # override | approve | accept_diagnosis
        default_prior: float,
        reason: str
    ) -> AdaptiveTrustAdjustment:
        key = (source_id, attribute_type.lower())
        current_w = SOURCE_ATTRIBUTE_WEIGHTS.get(key, default_prior)

        if action_type == "override":
            # Nudge down by 0.05 for overridden source
            new_w = round(max(0.10, current_w - 0.05), 3)
        else: # approve or accept_diagnosis
            # Nudge up by 0.02 for agreeing source
            new_w = round(min(0.98, current_w + 0.02), 3)

        SOURCE_ATTRIBUTE_WEIGHTS[key] = new_w

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        adjustment = AdaptiveTrustAdjustment(
            timestamp=now_str,
            source_id=source_id,
            attribute_type=attribute_type,
            old_weight=current_w,
            new_weight=new_w,
            product_id=product_id,
            action_type=action_type,
            reason=reason
        )
        TRUST_LEDGER_LOGS.insert(0, adjustment)
        return adjustment

    def get_source_history(self, source_id: str) -> List[AdaptiveTrustAdjustment]:
        return [log for log in TRUST_LEDGER_LOGS if log.source_id.lower() == source_id.lower()]

    def get_trust_leaderboard(self) -> List[TrustLeaderboardEntry]:
        # Group by source_id
        source_adj: Dict[str, List[AdaptiveTrustAdjustment]] = {}
        for log in TRUST_LEDGER_LOGS:
            source_adj.setdefault(log.source_id, []).append(log)

        leaderboard: List[TrustLeaderboardEntry] = []
        for sid, logs in source_adj.items():
            latest = logs[0]
            net_change = sum((l.new_weight - l.old_weight) for l in logs)
            trend = "UP" if net_change > 0 else ("DOWN" if net_change < 0 else "STABLE")
            
            leaderboard.append(TrustLeaderboardEntry(
                source_id=sid,
                current_weight=latest.new_weight,
                trend=trend,
                adjustments_count=len(logs),
                last_adjustment=latest.timestamp
            ))

        leaderboard.sort(key=lambda x: x.current_weight, reverse=True)
        return leaderboard

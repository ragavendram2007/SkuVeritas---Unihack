from typing import List, Optional
from pydantic import BaseModel

class RoutingDecision(BaseModel):
    product_id: str
    tier: str  # auto-publish | flagged | blocked
    verdict_stamp: str  # AUTO-PUBLISHED | FLAGGED | BLOCKED | APPROVED | OVERRIDDEN
    reason: str
    driving_attributes: List[str]
    human_review_required: bool

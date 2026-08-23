from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field

class ExhibitBreakdown(BaseModel):
    source_id: str
    source_type: str
    value: Union[float, int, str]
    unit: str = ""
    reliability_weight: float
    contribution_percent: float
    exhibit_label: str  # Exhibit A, Exhibit B, etc.
    last_modified: str = ""

class AttributeEvidence(BaseModel):
    attribute_name: str
    resolved_value: Union[float, int, str]
    unit: str = ""
    criticality: str
    confidence: float
    risk: float
    conflict: bool
    missing: bool = False
    exhibits: List[ExhibitBreakdown]
    formula_applied: str

class ReviewActionRequest(BaseModel):
    product_id: str
    action: str  # approve | override | accept_diagnosis
    attribute_name: Optional[str] = None
    override_value: Optional[str] = None
    reason: str  # Required for override!
    reviewer: str = "Senior Data Analyst (Reviewer #42)"

class ReviewLogEntry(BaseModel):
    timestamp: str
    product_id: str
    action: str
    attribute_name: Optional[str] = None
    override_value: Optional[str] = None
    reason: str
    reviewer: str
    verdict_stamp: str  # APPROVED | OVERRIDDEN | BLOCKED | AUTO-PUBLISHED

class AdaptiveTrustAdjustment(BaseModel):
    timestamp: str
    source_id: str
    attribute_type: str
    old_weight: float
    new_weight: float
    product_id: str
    action_type: str
    reason: str

class TrustLeaderboardEntry(BaseModel):
    source_id: str
    current_weight: float
    trend: str  # UP | DOWN | STABLE
    adjustments_count: int
    last_adjustment: str

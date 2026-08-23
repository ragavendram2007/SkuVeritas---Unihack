from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel

class ReasoningStep(BaseModel):
    step: str
    passed: bool
    details: str

class DiagnosisResult(BaseModel):
    cause: str
    confidence: float
    explanation: str
    reasoning_trail: List[ReasoningStep] = []

class SourceValueDetail(BaseModel):
    source_id: str
    source_type: str
    value: Union[float, int, str]
    unit: str = ""
    raw_text: str = ""
    reliability_weight: float
    last_modified: str = ""

class ResolvedAttribute(BaseModel):
    resolved_value: Union[float, int, str]
    unit: str
    criticality: str  # HIGH | MEDIUM | LOW
    confidence: float
    risk: float
    conflict: bool
    missing: bool = False
    missing_in: List[str] = []
    sources: List[SourceValueDetail]
    diagnosis: Optional[DiagnosisResult] = None

class ResolvedProduct(BaseModel):
    product_id: str
    sku: str
    product_name: str
    overall_trust_score: float
    attributes: Dict[str, ResolvedAttribute]

class ProductSummary(BaseModel):
    product_id: str
    sku: str
    product_name: str
    overall_trust_score: float
    conflict_count: int
    critical_conflict_count: int
    attributes_count: int

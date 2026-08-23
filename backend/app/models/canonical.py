from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field

class AttributeMeta(BaseModel):
    canonical_unit: str
    criticality: str  # HIGH | MEDIUM | LOW

class CanonicalProduct(BaseModel):
    product_id: str
    sku: str
    product_name: str
    attributes: Dict[str, AttributeMeta]

class AttributeValue(BaseModel):
    value: Union[float, int, str]
    unit: Optional[str] = ""
    raw_text: Optional[str] = ""

class SourceRecord(BaseModel):
    source_id: str
    source_type: str  # manufacturer_pdf | supplier_excel | erp_csv | scraped_webpage
    reliability_prior: float
    product_id: str
    sku: str
    last_modified: str
    values: Dict[str, AttributeValue]

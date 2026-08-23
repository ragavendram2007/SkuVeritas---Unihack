from typing import List, Dict, Any
from pydantic import BaseModel

class ErpVerifiedSpec(BaseModel):
    spec_code: str
    spec_value: str
    unit: str

class ErpRecord(BaseModel):
    erp_sku: str
    item_name: str
    dept_class: str
    verified_specs: List[ErpVerifiedSpec]
    status: str  # RELEASED_TO_ERP
    exported_at: str

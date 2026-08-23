from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class UnihackRawRow(BaseModel):
    mfg_part_num: str
    part_desc: str
    e1_brand: Optional[str] = ""
    unilog_brand: Optional[str] = ""
    dib_brand: Optional[str] = ""
    part_manuf: str

class DiscoveredSource(BaseModel):
    source_id: str
    source_type: str  # discovered_web | manufacturer_pdf | supplier_excel | etc.
    source_url: str
    reliability_prior: float  # 0.90 (MFR domain), 0.85 (MFR PDF), 0.60 (Distributor), 0.35 (Other)
    domain: str
    values: Dict[str, Any] = {}
    last_modified: str = "2026-08-01T10:00:00Z"

class DeliveryFormatRow(BaseModel):
    # Core identifiers
    mfr_url: Optional[str] = ""
    ref_url_1: Optional[str] = ""
    ref_url_2: Optional[str] = ""
    ref_url_3: Optional[str] = ""
    ref_url_4: Optional[str] = ""
    ref_url_5: Optional[str] = ""
    part_number: str
    dept: str
    cls: str = Field(alias="class", default="")
    fine: str
    sku_my_part_number: str
    mfg_part_num: str
    part_desc: str
    e1_brand: str = ""
    unilog_brand: str = ""
    dib_brand: str = ""
    part_manuf: str
    manufacturer_name: str = ""
    brand_name: str = ""
    trade_name: str = ""
    manufacturer_part_number: str = ""
    alternate_part_number: str = ""
    classpath: str = ""
    mobile_desc: str = ""
    invoice_desc: str = ""
    short_desc: str = ""
    long_desc1: str = ""
    retail_desc: str = ""
    product_name: str = ""
    
    # Dynamic attributes (up to 15)
    attribute_labels: Dict[int, str] = {}
    attribute_values: Dict[int, str] = {}
    attribute_uoms: Dict[int, str] = {}
    
    # Media & document flags
    product_image: str = ""
    media_pending: bool = True
    specification_sheet: str = ""

    model_config = {
        "populate_by_name": True
    }

class EnrichmentStatus(BaseModel):
    mfg_part_num: str
    part_desc: str
    part_manuf: str
    status: str  # searching | extracting | scoring | classifying | done | unresolved
    sources_found: int = 0
    overall_trust_score: float = 0.0
    category_path: str = ""
    conflict_count: int = 0
    missing_count: int = 0

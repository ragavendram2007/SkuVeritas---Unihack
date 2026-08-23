import datetime
from typing import Dict, Any, List, Optional
from app.models.erp import ErpRecord, ErpVerifiedSpec

def build_erp_record(product_id: str, resolved_data: Dict[str, Any], review_verdict: Optional[str] = None) -> ErpRecord:
    sku = resolved_data.get("sku") or product_id
    pname = resolved_data.get("product_name", "Unknown Item")
    cat_path = resolved_data.get("category_path", "General Inventory")

    verified_specs: List[ErpVerifiedSpec] = []
    attributes = resolved_data.get("attributes", {})

    for attr_name, attr in attributes.items():
        conf = float(attr.get("confidence", 1.0))
        # Include verified specs with confidence >= 0.50
        if conf >= 0.50:
            verified_specs.append(ErpVerifiedSpec(
                spec_code=attr_name.upper(),
                spec_value=str(attr.get("resolved_value", "")),
                unit=str(attr.get("unit", ""))
            ))

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return ErpRecord(
        erp_sku=f"ERP-{sku}",
        item_name=pname,
        dept_class=cat_path,
        verified_specs=verified_specs,
        status="RELEASED_TO_ERP",
        exported_at=now_str
    )

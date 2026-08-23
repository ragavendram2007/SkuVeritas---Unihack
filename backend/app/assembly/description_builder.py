import re
from typing import Dict, Any, List
from app.models.contract import ResolvedProduct, ResolvedAttribute
from app.models.unihack import DeliveryFormatRow, DiscoveredSource

def build_delivery_format_row(
    mfg_part_num: str,
    part_desc: str,
    part_manuf: str,
    e1_brand: str,
    unilog_brand: str,
    dib_brand: str,
    dept: str,
    cls: str,
    fine: str,
    resolved_prod: Optional[ResolvedProduct] = None,
    discovered_sources: Optional[List[DiscoveredSource]] = None
) -> DeliveryFormatRow:
    """
    Assembles DeliveryFormatRow matching the 252-column Delivery Format target schema.
    Follows gold-example formatting conventions for descriptions & dynamic attributes.
    """
    mfr_name = re.sub(r'\s*\(\d+\)', '', part_manuf).strip()
    brand_name = unilog_brand if unilog_brand and "--" not in unilog_brand else (mfr_name.upper() if mfr_name else "GENERIC")

    # Discovered URLs
    mfr_url = ""
    ref_urls = ["", "", "", "", ""]
    if discovered_sources:
        mfr_sources = [s for s in discovered_sources if s.reliability_prior >= 0.85]
        if mfr_sources:
            mfr_url = mfr_sources[0].source_url
        
        other_sources = [s for s in discovered_sources if s.reliability_prior < 0.85]
        for idx, s in enumerate(other_sources[:5]):
            ref_urls[idx] = s.source_url

    # Verified attributes (confidence >= 0.50)
    verified_attrs: Dict[str, ResolvedAttribute] = {}
    if resolved_prod and resolved_prod.attributes:
        for k, v in resolved_prod.attributes.items():
            if v.confidence >= 0.50:
                verified_attrs[k] = v

    # Construct Descriptions
    short_desc = f"{brand_name} {part_desc}".strip()
    
    attr_summary_list = []
    for k, v in verified_attrs.items():
        val_str = f"{v.resolved_value} {v.unit}".strip()
        attr_summary_list.append(f"{k.replace('_', ' ').title()}: {val_str}")
    
    long_desc = f"{brand_name} {part_desc}"
    if attr_summary_list:
        long_desc += ", " + ", ".join(attr_summary_list)
        
    mobile_desc = f"{mfr_name} {brand_name}, {part_desc}, {mfg_part_num}".strip()
    invoice_desc = f"{part_desc[:30].upper()} {mfg_part_num}".strip()
    retail_desc = f"{brand_name} {part_desc}".strip()

    # Dynamic Attributes 1..15
    attr_labels = {}
    attr_values = {}
    attr_uoms = {}
    
    for idx, (k, v) in enumerate(verified_attrs.items(), start=1):
        if idx > 15:
            break
        attr_labels[idx] = k.replace('_', ' ').title()
        attr_values[idx] = str(v.resolved_value)
        attr_uoms[idx] = v.unit or ""

    return DeliveryFormatRow(
        mfr_url=mfr_url,
        ref_url_1=ref_urls[0],
        ref_url_2=ref_urls[1],
        ref_url_3=ref_urls[2],
        ref_url_4=ref_urls[3],
        ref_url_5=ref_urls[4],
        part_number=mfg_part_num,
        dept=dept,
        cls=cls,
        fine=fine,
        sku_my_part_number=mfg_part_num,
        mfg_part_num=mfg_part_num,
        part_desc=part_desc,
        e1_brand=e1_brand or "-- Unbranded --",
        unilog_brand=unilog_brand or "-- No Unilog Brand --",
        dib_brand=dib_brand or "-- No DIB Brand --",
        part_manuf=part_manuf,
        manufacturer_name=mfr_name,
        brand_name=brand_name,
        trade_name=brand_name,
        manufacturer_part_number=mfg_part_num,
        alternate_part_number="",
        classpath=f"{dept}>{cls}>{fine}",
        mobile_desc=mobile_desc,
        invoice_desc=invoice_desc,
        short_desc=short_desc,
        long_desc1=long_desc,
        retail_desc=retail_desc,
        product_name=part_desc,
        attribute_labels=attr_labels,
        attribute_values=attr_values,
        attribute_uoms=attr_uoms,
        product_image="",
        media_pending=True,
        specification_sheet=""
    )

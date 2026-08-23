import os
import re
import pandas as pd
from typing import Dict, Any, Tuple
from app.config import RELIABILITY_PRIORS, HEADER_SYNONYMS
from app.models.canonical import SourceRecord, AttributeValue

def normalize_header(raw_header: str) -> str:
    cleaned = raw_header.strip().lower()
    cleaned = re.sub(r'[_\-\s]+', ' ', cleaned)
    
    # Direct match in synonym dictionary
    if cleaned in HEADER_SYNONYMS:
        return HEADER_SYNONYMS[cleaned]
    
    # Substring match in synonym dictionary
    for k, v in HEADER_SYNONYMS.items():
        if k in cleaned or cleaned in k:
            return v
            
    # Default to snake_case of cleaned string
    return re.sub(r'\s+', '_', cleaned)

def parse_value_and_unit(raw_str: Any) -> Tuple[Any, str, str]:
    raw_text = str(raw_str).strip()
    # Match number followed by optional unit (e.g. "200 PSI", "0.45 kg", "150 C", "20 V", "120 CFM")
    match = re.match(r'^([\d\.]+)\s*([a-zA-Z°/%]+)?$', raw_text)
    if match:
        val_str, unit = match.groups()
        try:
            val = float(val_str) if '.' in val_str else int(val_str)
            return val, unit or "", raw_text
        except ValueError:
            pass
    return raw_text, "", raw_text

def parse_csv_source(file_path: str, source_id: str = "erp_csv") -> SourceRecord:
    df = pd.read_csv(file_path)
    row = df.iloc[0].to_dict()
    
    sku = str(row.get("SKU", "UNKNOWN"))
    last_mod = str(row.get("Last Modified", "2026-08-01T00:00:00Z"))
    
    values: Dict[str, AttributeValue] = {}
    ignore_keys = {"SKU", "Product Name", "Last Modified"}
    
    for k, v in row.items():
        if k in ignore_keys or pd.isna(v):
            continue
        norm_key = normalize_header(str(k))
        val, unit, raw = parse_value_and_unit(v)
        values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
        
    return SourceRecord(
        source_id=source_id,
        source_type="erp_csv",
        reliability_prior=RELIABILITY_PRIORS["erp_csv"],
        product_id=sku,
        sku=sku,
        last_modified=last_mod,
        values=values
    )

def parse_excel_source(file_path: str, source_id: str = "supplier_excel") -> SourceRecord:
    df = pd.read_excel(file_path)
    row = df.iloc[0].to_dict()
    
    sku = str(row.get("Part_SKU", "UNKNOWN"))
    last_mod = str(row.get("Updated_At", "2026-08-01T00:00:00Z"))
    
    values: Dict[str, AttributeValue] = {}
    ignore_keys = {"Part_SKU", "Item_Description", "Updated_At"}
    
    for k, v in row.items():
        if k in ignore_keys or pd.isna(v):
            continue
        norm_key = normalize_header(str(k))
        val, unit, raw = parse_value_and_unit(v)
        values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
        
    return SourceRecord(
        source_id=source_id,
        source_type="supplier_excel",
        reliability_prior=RELIABILITY_PRIORS["supplier_excel"],
        product_id=sku,
        sku=sku,
        last_modified=last_mod,
        values=values
    )

def parse_pdf_text_source(file_path: str, source_id: str = "manufacturer_pdf") -> SourceRecord:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    sku_match = re.search(r'Product\s+(?:Identifier|SKU):\s*([A-Z0-9\-]+)', content)
    sku = sku_match.group(1) if sku_match else "UNKNOWN"
    
    date_match = re.search(r'(?:Date of Issue|Specification Date|Release Date):\s*([0-9T:\-Z]+)', content)
    last_mod = date_match.group(1) if date_match else "2026-08-01T00:00:00Z"
    
    values: Dict[str, AttributeValue] = {}
    # Lines with Key: Value
    lines = content.splitlines()
    for line in lines:
        if ':' in line:
            parts = line.split(':', 1)
            raw_key = parts[0].strip()
            raw_val = parts[1].strip()
            if any(term in raw_key.lower() for term in ["identifier", "sku", "title", "name", "date", "specification"]):
                continue
            if not raw_val or raw_val.lower() in ["technical data", "physical properties", "operating specifications", "specs"]:
                continue
            norm_key = normalize_header(raw_key)
            val, unit, raw = parse_value_and_unit(raw_val)
            if val != "" or raw != "":
                values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
            
    return SourceRecord(
        source_id=source_id,
        source_type="manufacturer_pdf",
        reliability_prior=RELIABILITY_PRIORS["manufacturer_pdf"],
        product_id=sku,
        sku=sku,
        last_modified=last_mod,
        values=values
    )

def parse_scraped_webpage_source(file_path: str, source_id: str = "scraped_webpage") -> SourceRecord:
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    sku_match = re.search(r'SKU:\s*([A-Z0-9\-]+)', html)
    sku = sku_match.group(1) if sku_match else "UNKNOWN"
    
    date_match = re.search(r'datetime="([0-9T:\-Z]+)"', html)
    last_mod = date_match.group(1) if date_match else "2026-08-05T00:00:00Z"
    
    values: Dict[str, AttributeValue] = {}
    
    # Extract table rows <tr><th>Key</th><td>Value</td></tr>
    table_matches = re.findall(r'<tr>\s*<th>(.*?)</th>\s*<td>(.*?)</td>\s*</tr>', html, re.DOTALL)
    for raw_k, raw_v in table_matches:
        norm_key = normalize_header(raw_k)
        val, unit, raw = parse_value_and_unit(raw_v)
        values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
        
    # Extract list items <li>Key: Value</li>
    li_matches = re.findall(r'<li>\s*(.*?):\s*(.*?)\s*</li>', html)
    for raw_k, raw_v in li_matches:
        norm_key = normalize_header(raw_k)
        val, unit, raw = parse_value_and_unit(raw_v)
        values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
        
    # Extract div specs <p>Key: Value</p>
    p_matches = re.findall(r'<p>\s*(.*?):\s*(.*?)\s*</p>', html)
    for raw_k, raw_v in p_matches:
        if raw_k.strip().lower() in ["sku", "title", "name"]:
            continue
        norm_key = normalize_header(raw_k)
        val, unit, raw = parse_value_and_unit(raw_v)
        values[norm_key] = AttributeValue(value=val, unit=unit, raw_text=raw)
        
    return SourceRecord(
        source_id=source_id,
        source_type="scraped_webpage",
        reliability_prior=RELIABILITY_PRIORS["scraped_webpage"],
        product_id=sku,
        sku=sku,
        last_modified=last_mod,
        values=values
    )

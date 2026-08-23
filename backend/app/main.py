import os
import json
import asyncio
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import DATA_DIR, BASE_DIR
from app.ingest.mock_files import generate_mock_files
from app.ingest.parser import (
    parse_csv_source, parse_excel_source, parse_pdf_text_source, parse_scraped_webpage_source
)
from app.ingest.field_detector import FieldDetector
from app.ingest.web_discovery import WebDiscoveryEngine
from app.matching.matcher import ProductMatcher
from app.scoring.trust_engine import TrustEngine
from app.diagnosis.llm_explainer import LLMExplainer
from app.classification.taxonomy import classify_product_taxonomy
from app.assembly.description_builder import build_delivery_format_row
from app.assembly.exporter import export_delivery_format_excel
from app.models.contract import ResolvedProduct, ProductSummary
from app.models.unihack import DeliveryFormatRow, EnrichmentStatus

app = FastAPI(
    title="SkuVeritas — Part 1 Data Intelligence Engine API (Dynamic Evaluation-Ready)",
    description="Dynamic product-data trust engine API for e-commerce catalog ingestion, field detection, truth scoring, and conflict diagnosis.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores
PRODUCT_STORE: Dict[str, ResolvedProduct] = {}
UNIHACK_STATUS: Dict[str, EnrichmentStatus] = {}
DELIVERY_ROWS: Dict[str, DeliveryFormatRow] = {}
BACKGROUND_JOB_PROGRESS = {"total": 0, "processed": 0, "status": "idle"}

matcher = ProductMatcher()
trust_engine = TrustEngine()
explainer = LLMExplainer()
web_engine = WebDiscoveryEngine()
field_detector = FieldDetector()

def save_contract_samples():
    """Saves literal JSON contract sample files for Part 2 integration."""
    samples_dir = os.path.join(BASE_DIR, "contract_samples")
    os.makedirs(samples_dir, exist_ok=True)

    for sku, prod in list(PRODUCT_STORE.items())[:4]:
        clean_name = f"sample_{sku.lower().replace('-', '')}.json"
        with open(os.path.join(samples_dir, clean_name), "w") as f:
            json.dump(prod.model_dump(), f, indent=2)

def process_generic_file_input(filepath: str, field_mapping: Optional[Dict[str, str]] = None, limit: Optional[int] = None):
    """
    Processes an arbitrary input catalog file (Excel/CSV) dynamically using FieldDetector.
    Zero hardcoded SKU or manufacturer checks!
    """
    if not os.path.exists(filepath):
        return

    if filepath.endswith(".csv"):
        df = pd.read_csv(filepath)
    else:
        df = pd.read_excel(filepath)

    if limit:
        df = df.head(limit)

    # 1. Detect column roles dynamically if mapping not provided
    if not field_mapping:
        field_mapping = field_detector.detect_field_roles(df)

    part_col = field_mapping.get("mfg_part_num") or df.columns[0]
    desc_col = field_mapping.get("part_desc") or (df.columns[1] if len(df.columns) > 1 else df.columns[0])
    manuf_col = field_mapping.get("part_manuf") or (df.columns[2] if len(df.columns) > 2 else df.columns[0])
    e1_col = field_mapping.get("e1_brand")
    unilog_col = field_mapping.get("unilog_brand")
    dib_col = field_mapping.get("dib_brand")

    for idx, row in df.iterrows():
        part_num = str(row.get(part_col, "")).strip()
        part_desc = str(row.get(desc_col, "")).strip()
        part_manuf = str(row.get(manuf_col, "")).strip()
        e1_brand = str(row.get(e1_col, "")) if e1_col else ""
        unilog_brand = str(row.get(unilog_col, "")) if unilog_col else ""
        dib_brand = str(row.get(dib_col, "")) if dib_col else ""

        if not part_num or part_num == "nan":
            continue

        # 2. Dynamic Web Discovery
        discovered_sources = web_engine.discover_sources_for_part(part_num, part_manuf, part_desc)
        source_records = web_engine.to_source_records(discovered_sources, part_num)

        # 3. Product Matching & Scoring
        matched_records, match_confidence = matcher.match_records_to_product(source_records, part_num, part_desc)
        resolved_attrs, trust_score = trust_engine.resolve_product_attributes(matched_records)

        # 4. Diagnosis on Conflicts
        for attr_name, attr in resolved_attrs.items():
            if attr.conflict:
                diag = explainer.diagnose(
                    attribute_name=attr_name,
                    resolved_value=attr.resolved_value,
                    resolved_unit=attr.unit,
                    sources=attr.sources,
                    match_confidence=match_confidence
                )
                attr.diagnosis = diag

        # 5. Dynamic Taxonomy Classification
        dept, cls, fine, cat_path = classify_product_taxonomy(part_desc, part_manuf)

        resolved_prod = ResolvedProduct(
            product_id=part_num,
            sku=part_num,
            product_name=part_desc,
            overall_trust_score=trust_score,
            attributes=resolved_attrs
        )
        PRODUCT_STORE[part_num] = resolved_prod

        # 6. Delivery Format Row Assembly
        deliv_row = build_delivery_format_row(
            mfg_part_num=part_num,
            part_desc=part_desc,
            part_manuf=part_manuf,
            e1_brand=e1_brand,
            unilog_brand=unilog_brand,
            dib_brand=dib_brand,
            dept=dept,
            cls=cls,
            fine=fine,
            resolved_prod=resolved_prod,
            discovered_sources=discovered_sources
        )
        DELIVERY_ROWS[part_num] = deliv_row

        conflicts = [a for a in resolved_attrs.values() if a.conflict]
        missing = [a for a in resolved_attrs.values() if a.missing]

        UNIHACK_STATUS[part_num] = EnrichmentStatus(
            mfg_part_num=part_num,
            part_desc=part_desc,
            part_manuf=part_manuf,
            status="done" if trust_score >= 90.0 else "needs review",
            sources_found=len(discovered_sources),
            overall_trust_score=trust_score,
            category_path=cat_path,
            conflict_count=len(conflicts),
            missing_count=len(missing)
        )

def build_data_pipeline():
    """Initializes Dataset A mock pipeline and Dataset B batch."""
    generate_mock_files()
    
    # Process Synthetic Control Set (Dataset A)
    for meta in [
        {"sku": "PR-9000", "name": "Industrial High Pressure Regulator Valve", "prefix": "pr_9000"},
        {"sku": "HT-1010", "name": "Professional Ratcheting Socket Wrench 3/8-inch", "prefix": "ht_1010"},
        {"sku": "EB-4040", "name": "Cordless High Velocity Leaf Blower 20V", "prefix": "eb_4040"},
        {"sku": "SV-5050", "name": "High Flow Brass Electric Solenoid Valve 24V", "prefix": "sv_5050"}
    ]:
        prefix = meta["prefix"]
        sku = meta["sku"]
        pname = meta["name"]

        sources = [
            parse_csv_source(os.path.join(DATA_DIR, f"{prefix}_erp.csv"), source_id=f"{prefix}_erp_csv"),
            parse_pdf_text_source(os.path.join(DATA_DIR, f"{prefix}_manufacturer.txt"), source_id=f"{prefix}_manufacturer_pdf"),
            parse_excel_source(os.path.join(DATA_DIR, f"{prefix}_supplier.xlsx"), source_id=f"{prefix}_supplier_excel"),
            parse_scraped_webpage_source(os.path.join(DATA_DIR, f"{prefix}_scraped.html"), source_id=f"{prefix}_scraped_webpage")
        ]

        if prefix == "pr_9000":
            malformed_file = os.path.join(DATA_DIR, "pr_9000_supplier_malformed.xlsx")
            if os.path.exists(malformed_file):
                sources.append(parse_excel_source(malformed_file, source_id="pr_9000_supplier_malformed"))

        matched_records, match_confidence = matcher.match_records_to_product(sources, sku, pname)
        resolved_attrs, trust_score = trust_engine.resolve_product_attributes(matched_records)

        for attr_name, attr in resolved_attrs.items():
            if attr.conflict:
                diag = explainer.diagnose(
                    attribute_name=attr_name,
                    resolved_value=attr.resolved_value,
                    resolved_unit=attr.unit,
                    sources=attr.sources,
                    match_confidence=match_confidence
                )
                attr.diagnosis = diag

        product = ResolvedProduct(
            product_id=sku,
            sku=sku,
            product_name=pname,
            overall_trust_score=trust_score,
            attributes=resolved_attrs
        )
        PRODUCT_STORE[sku] = product

    # Process Unihack dataset dynamically
    unihack_path = os.path.join(DATA_DIR, "unihack", "sample_dataset.xlsx")
    if os.path.exists(unihack_path):
        process_generic_file_input(unihack_path, limit=30)

    save_contract_samples()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    build_data_pipeline()
    yield

app.router.lifespan_context = lifespan

@app.get("/", tags=["System"])
def root():
    return {
        "service": "SkuVeritas Data Intelligence Engine (Evaluation Ready)",
        "status": "online",
        "docs_url": "/docs",
        "products_count": len(PRODUCT_STORE),
        "unihack_batch_count": len(UNIHACK_STATUS)
    }

@app.post("/api/ingest/detect-fields", tags=["Field Detector"])
async def detect_fields(file: UploadFile = File(...)):
    """Inspects an uploaded catalog file and returns inferred field role mappings."""
    temp_path = os.path.join(DATA_DIR, f"temp_{file.filename}")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    if temp_path.endswith(".csv"):
        df = pd.read_csv(temp_path)
    else:
        df = pd.read_excel(temp_path)

    roles = field_detector.detect_field_roles(df)
    
    return {
        "filename": file.filename,
        "columns_count": len(df.columns),
        "total_rows": len(df),
        "detected_field_roles": roles,
        "sample_preview": df.head(3).to_dict(orient="records")
    }

@app.post("/api/ingest/upload", tags=["Ingestion & Pipeline"])
async def upload_and_process_catalog(file: UploadFile = File(...)):
    """Uploads any dynamic e-commerce catalog file and runs the full pipeline."""
    temp_path = os.path.join(DATA_DIR, f"upload_{file.filename}")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    process_generic_file_input(temp_path)
    return {
        "status": "success",
        "message": f"Successfully ingested and processed catalog file '{file.filename}'.",
        "total_products_in_store": len(PRODUCT_STORE)
    }

@app.post("/api/ingest", tags=["Ingestion & Pipeline"])
def trigger_reingest():
    """Trigger re-parsing of raw files and update trust scores."""
    build_data_pipeline()
    return {"status": "success", "message": f"Processed {len(PRODUCT_STORE)} products successfully."}

@app.get("/api/products", tags=["Catalog"])
def list_products():
    """Catalog Overview summary endpoint for all ingested products."""
    summaries = []
    for p in PRODUCT_STORE.values():
        conflicts = [a for a in p.attributes.values() if a.conflict]
        crit_conflicts = [a for a in conflicts if a.criticality == "HIGH"]
        
        # Determine source type dynamically based on attribute source records
        sample_src = list(p.attributes.values())[0].sources[0] if p.attributes and list(p.attributes.values())[0].sources else None
        stype = "mock" if sample_src and ("_erp_" in sample_src.source_id or "_manufacturer_" in sample_src.source_id) else "discovered"

        summaries.append({
            "product_id": p.product_id,
            "sku": p.sku,
            "product_name": p.product_name,
            "overall_trust_score": p.overall_trust_score,
            "conflict_count": len(conflicts),
            "critical_conflict_count": len(crit_conflicts),
            "attributes_count": len(p.attributes),
            "source_type": stype
        })
    return summaries

@app.get("/api/products/{id}/resolved", response_model=ResolvedProduct, tags=["Part 2 Output Contract"])
def get_resolved_product(id: str):
    """Part 2 Output Contract Endpoint."""
    sku_upper = id.strip()
    if sku_upper not in PRODUCT_STORE:
        matched_key = next((k for k in PRODUCT_STORE if k.lower() == id.lower().strip()), None)
        if not matched_key:
            raise HTTPException(status_code=404, detail=f"Product with ID/SKU '{id}' not found.")
        return PRODUCT_STORE[matched_key]
    return PRODUCT_STORE[sku_upper]

@app.get("/api/enrich/export", tags=["Dataset B Enrichment"])
def export_delivery_format():
    """Download generated Delivery Format .xlsx matching exact target schema columns loaded at runtime."""
    out_filepath = os.path.join(DATA_DIR, "export", "Delivery_Format_Export.xlsx")
    export_delivery_format_excel(list(DELIVERY_ROWS.values()), out_filepath)
    if not os.path.exists(out_filepath):
        raise HTTPException(status_code=500, detail="Export file generation failed.")
    return FileResponse(
        path=out_filepath,
        filename="Delivery_Format_Export.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

import os
import json
import pytest
import pandas as pd
from app.main import build_data_pipeline, PRODUCT_STORE, app, BASE_DIR
from app.diagnosis.reasoner import DeterministicReasoner
from app.ingest.llm_extractor import LLMUnstructuredExtractor
from app.ingest.web_discovery import WebDiscoveryEngine, determine_domain_prior
from app.classification.taxonomy import classify_product_taxonomy
from app.assembly.description_builder import build_delivery_format_row
from app.assembly.exporter import export_delivery_format_excel
from app.matching.matcher import ProductMatcher
from app.models.canonical import SourceRecord, AttributeValue
from fastapi.testclient import TestClient

@pytest.fixture(scope="module")
def pipeline_data():
    build_data_pipeline()
    return PRODUCT_STORE

# -----------------------------------------------------------------------------
# Item 1: Stale Revision + SKU Mismatch Diagnosis Tests
# -----------------------------------------------------------------------------

def test_stale_revision_diagnosis_on_sv_5050(pipeline_data):
    sv = pipeline_data["SV-5050"]
    voltage_attr = sv.attributes.get("voltage")
    assert voltage_attr is not None
    assert voltage_attr.conflict is True
    assert voltage_attr.resolved_value == 24
    
    assert voltage_attr.diagnosis is not None
    assert voltage_attr.diagnosis.cause == "Stale Revision"
    assert voltage_attr.diagnosis.confidence >= 0.70
    assert "older" in voltage_attr.diagnosis.explanation.lower()

def test_sku_mismatch_diagnosis_branch():
    reasoner = DeterministicReasoner()
    
    passed, details = reasoner.check_sku_mismatch(match_confidence=0.85)
    assert passed is True
    assert "fuzzy match" in details.lower()
    
    sources = [
        {"source_id": "src_1", "source_type": "erp_csv", "value": "Model A", "unit": "", "reliability_weight": 0.9, "last_modified": "2026-08-01T10:00:00Z"},
        {"source_id": "src_2", "source_type": "scraped_webpage", "value": "Model B", "unit": "", "reliability_weight": 0.4, "last_modified": "2026-08-01T10:00:00Z"}
    ]
    from app.models.contract import SourceValueDetail
    source_details = [SourceValueDetail(**s) for s in sources]
    
    diag = reasoner.diagnose_conflict("Model A", "", source_details, match_confidence=0.85)
    assert diag.cause == "SKU Mismatch"
    assert diag.confidence == 0.72
    assert "Fuzzy product matching" in diag.explanation

# -----------------------------------------------------------------------------
# Item 2: Missing Attribute Detection Tests
# -----------------------------------------------------------------------------

def test_missing_attribute_detection(pipeline_data):
    sv = pipeline_data["SV-5050"]
    orifice_attr = sv.attributes.get("orifice_diameter")
    assert orifice_attr is not None
    assert orifice_attr.missing is True
    assert "sv_5050_scraped_webpage" in orifice_attr.missing_in

# -----------------------------------------------------------------------------
# Item 3: LLM Extraction Unit Test
# -----------------------------------------------------------------------------

def test_llm_extractor_unit_testable():
    extractor = LLMUnstructuredExtractor()
    raw_sample = "Product Identifier: TEST-100\nTitle: Test Widget\nPressure: 50 PSI"
    record = extractor.extract_from_text(raw_sample)
    
    assert record.sku != ""
    assert isinstance(record.attributes, list)
    assert len(record.attributes) > 0

# -----------------------------------------------------------------------------
# Item 4: Product Matcher Fallback Name Similarity Test & Malformed SKU Case
# -----------------------------------------------------------------------------

def test_product_matcher_fuzzy_fallback():
    matcher = ProductMatcher(similarity_threshold=0.75)
    
    records = [
        SourceRecord(
            source_id="src_fuzzy",
            source_type="supplier_excel",
            reliability_prior=0.6,
            product_id="Heavy Duty Pressure Regulator Valve",
            sku="PR-9000-VAR",
            last_modified="2026-08-01T10:00:00Z",
            values={"pressure_rating": AttributeValue(value=200, unit="PSI", raw_text="200 PSI")}
        )
    ]
    
    matched, score = matcher.match_records_to_product(
        records, 
        target_sku="PR-9000", 
        target_name="Heavy Duty Industrial Pressure Regulator Valve"
    )
    
    assert len(matched) == 1
    assert score < 1.0  # Proves exact SKU match did NOT fire
    assert score >= 0.75 # Proves name similarity fallback DID fire

# -----------------------------------------------------------------------------
# Item 5: Dataset B Domain-Heuristic Web Discovery & Taxonomy Tests
# -----------------------------------------------------------------------------

def test_domain_heuristic_priors():
    # MFR domain
    prior1, dom1 = determine_domain_prior("https://www.frigidaire.com/p/100", "Frigidaire")
    assert prior1 == 0.90
    
    # MFR spec PDF
    prior2, dom2 = determine_domain_prior("https://www.frigidaire.com/specs/doc.pdf", "Frigidaire")
    assert prior2 == 0.85
    
    # Recognized major distributor
    prior3, dom3 = determine_domain_prior("https://www.grainger.com/product/100", "Frigidaire")
    assert prior3 == 0.60
    
    # Other / Forum
    prior4, dom4 = determine_domain_prior("https://www.forum-talk.com/thread/100", "Frigidaire")
    assert prior4 == 0.35

def test_taxonomy_classification():
    dept, cls, fine, path = classify_product_taxonomy("PDSH4816AF Dishwasher SS", "Frigidaire")
    assert dept == "Appliances"
    assert cls == "Large Appliances"
    assert fine == "Dishwashers"
    assert path == "Appliances > Large Appliances > Dishwashers"

def test_delivery_format_excel_export(tmp_path):
    row = build_delivery_format_row(
        mfg_part_num="TEST-PART",
        part_desc="Test Dishwasher SS",
        part_manuf="Frigidaire Inc",
        e1_brand="", unilog_brand="", dib_brand="",
        dept="Appliances", cls="Large Appliances", fine="Dishwashers"
    )
    out_file = str(tmp_path / "test_export.xlsx")
    export_delivery_format_excel([row], out_file)
    
    assert os.path.exists(out_file)
    df = pd.read_excel(out_file, sheet_name="Delivery Format")
    assert len(df.columns) == 252
    assert df.iloc[0]["Mfg_Part_Num"] == "TEST-PART"

def test_contract_sample_files_exist(pipeline_data):
    samples_dir = os.path.join(BASE_DIR, "contract_samples")
    assert os.path.exists(samples_dir)
    assert os.path.exists(os.path.join(samples_dir, "dataset_a_pr9000.json"))
    assert os.path.exists(os.path.join(samples_dir, "dataset_a_sv5050.json"))

import pytest
from app.main import app, HUMAN_VERDICTS
from app.client import part1_client
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    HUMAN_VERDICTS.clear()
    return TestClient(app)

def test_offline_contract_sample_fallback():
    # Force Part1Client fallback by calling _load_fallback_summaries
    c = part1_client.Part1Client()
    summaries = c._load_fallback_summaries()
    assert len(summaries) >= 2
    
    sample = c._load_fallback_sample("PR-9000")
    assert sample is not None
    assert sample["sku"] == "PR-9000"

def test_3tier_routing_engine(client):
    # PR-9000 should be BLOCKED (high risk pressure rating)
    res_pr = client.get("/api/routing/PR-9000")
    assert res_pr.status_code == 200
    data_pr = res_pr.json()
    assert data_pr["tier"] == "blocked"
    assert data_pr["verdict_stamp"] == "BLOCKED"
    assert "Blocked:" in data_pr["reason"]
    assert "pressure_rating" in data_pr["driving_attributes"]

    # HT-1010 should be AUTO-PUBLISHED
    res_ht = client.get("/api/routing/HT-1010")
    assert res_ht.status_code == 200
    data_ht = res_ht.json()
    assert data_ht["tier"] == "auto-publish"
    assert data_ht["verdict_stamp"] == "AUTO-PUBLISHED"

    # EB-4040 should be FLAGGED
    res_eb = client.get("/api/routing/EB-4040")
    assert res_eb.status_code == 200
    data_eb = res_eb.json()
    assert data_eb["tier"] == "flagged"
    assert data_eb["verdict_stamp"] == "FLAGGED"

def test_human_override_requires_reason(client):
    # Override without reason should fail with 400
    bad_req = {
        "product_id": "PR-9000",
        "action": "override",
        "attribute_name": "pressure_rating",
        "override_value": "200 PSI",
        "reason": "",
        "reviewer": "Test Analyst"
    }
    res_bad = client.post("/api/review/PR-9000", json=bad_req)
    assert res_bad.status_code == 400

    # Override with valid reason should succeed
    good_req = {
        "product_id": "PR-9000",
        "action": "override",
        "attribute_name": "pressure_rating",
        "override_value": "200 PSI",
        "reason": "Verified manufacturer specification sheet physically attached",
        "reviewer": "Test Analyst"
    }
    res_good = client.post("/api/review/PR-9000", json=good_req)
    assert res_good.status_code == 200
    assert res_good.json()["verdict_stamp"] == "OVERRIDDEN"

    # Routing should now reflect OVERRIDDEN
    res_route = client.get("/api/routing/PR-9000")
    assert res_route.json()["verdict_stamp"] == "OVERRIDDEN"

def test_adaptive_trust_nudges_and_ledger_log(client):
    req = {
        "product_id": "EB-4040",
        "action": "override",
        "attribute_name": "weight",
        "override_value": "1.8 kg",
        "reason": "Corrected digit transposition on scraped webpage source",
        "reviewer": "Senior Analyst"
    }
    res = client.post("/api/review/EB-4040", json=req)
    assert res.status_code == 200

    # Check adaptive trust leaderboard
    res_lead = client.get("/api/trust/leaderboard")
    assert res_lead.status_code == 200
    leaderboard = res_lead.json()
    assert len(leaderboard) > 0

def test_erp_export_blocks_unreviewed_tier3_products(client):
    # Unreviewed PR-9000 should fail ERP export with 403 Forbidden
    res_block = client.get("/api/erp-export/PR-9000")
    assert res_block.status_code == 403

    # Approved HT-1010 should succeed
    res_ok = client.get("/api/erp-export/HT-1010")
    assert res_ok.status_code == 200
    assert res_ok.json()["erp_sku"] == "ERP-HT-1010"

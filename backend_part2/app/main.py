import os
import json
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.dossier import ReviewActionRequest, ReviewLogEntry, AttributeEvidence, AdaptiveTrustAdjustment, TrustLeaderboardEntry
from app.models.routing import RoutingDecision
from app.models.erp import ErpRecord
from app.client.part1_client import Part1Client
from app.routing.routing_engine import RoutingEngine
from app.evidence.evidence_chain import EvidenceChainEngine
from app.trust.adaptive_trust import AdaptiveTrustEngine, TRUST_LEDGER_LOGS
from app.export.erp_exporter import build_erp_record

app = FastAPI(
    title="SkuVeritas — Part 2 Trust & Delivery Layer API",
    description="Product-data trust layer API for 3-tier routing, dossier evidence chains, human review actions, verdict stamps, adaptive source trust, and ERP export.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

part1_client = Part1Client()
routing_engine = RoutingEngine()
evidence_engine = EvidenceChainEngine()
trust_engine = AdaptiveTrustEngine()

# In-memory review state
HUMAN_VERDICTS: Dict[str, str] = {}  # product_id -> APPROVED | OVERRIDDEN
HUMAN_REVIEWS: Dict[str, List[ReviewLogEntry]] = {}  # product_id -> list of entries

@app.get("/", tags=["System"])
def root():
    summaries, fallback = part1_client.get_products_summary()
    return {
        "service": "SkuVeritas Part 2 Trust & Delivery Layer",
        "status": "online",
        "port": 8001,
        "docs_url": "/docs",
        "part1_fallback_active": fallback,
        "products_count": len(summaries)
    }

@app.get("/api/products", tags=["Catalog Dossiers"])
def list_products():
    """Fetches catalog products list from Part 1 with fallback indicator."""
    summaries, fallback = part1_client.get_products_summary()
    
    # Enrich with Part 2 routing decisions & verdict stamps
    enriched = []
    for s in summaries:
        pid = s["sku"]
        try:
            res_data, _ = part1_client.get_resolved_product(pid)
            review_verdict = HUMAN_VERDICTS.get(pid)
            routing = routing_engine.evaluate_routing(res_data, review_verdict)
            
            s_copy = dict(s)
            s_copy["tier"] = routing.tier
            s_copy["verdict_stamp"] = routing.verdict_stamp
            s_copy["routing_reason"] = routing.reason
            s_copy["fallback_active"] = fallback
            enriched.append(s_copy)
        except Exception:
            enriched.append(s)

    return {
        "fallback_active": fallback,
        "products": enriched
    }

@app.get("/api/products/{id}/resolved", tags=["Catalog Dossiers"])
def get_resolved_product(id: str):
    """Consumes Part 1 resolved JSON contract with fallback."""
    res_data, fallback = part1_client.get_resolved_product(id)
    return res_data

@app.get("/api/routing/{id}", response_model=RoutingDecision, tags=["3-Tier Routing Engine"])
def get_routing_decision(id: str):
    """Returns 3-Tier Routing decision with plain-English reason string."""
    res_data, _ = part1_client.get_resolved_product(id)
    review_verdict = HUMAN_VERDICTS.get(id)
    return routing_engine.evaluate_routing(res_data, review_verdict)

@app.get("/api/evidence/{id}/{attribute_name}", response_model=AttributeEvidence, tags=["Evidence Chain"])
def get_attribute_evidence(id: str, attribute_name: str):
    """Exposes queryable evidence chain structure & exhibit weight breakdown."""
    res_data, _ = part1_client.get_resolved_product(id)
    attributes = res_data.get("attributes", {})
    
    if attribute_name not in attributes:
        raise HTTPException(status_code=404, detail=f"Attribute '{attribute_name}' not found for product '{id}'.")

    attr_data = attributes[attribute_name]
    return evidence_engine.build_evidence_for_attribute(attribute_name, attr_data)

@app.post("/api/review/{id}", tags=["Human Review Interface"])
def submit_human_review(id: str, req: ReviewActionRequest):
    """
    Records human review action (approve, override, accept_diagnosis).
    Requires non-empty reason string for override.
    Triggers adaptive source trust nudges and logs to Trust Ledger.
    """
    res_data, _ = part1_client.get_resolved_product(id)
    attributes = res_data.get("attributes", {})

    if req.action == "override":
        if not req.reason or not req.reason.strip():
            raise HTTPException(status_code=400, detail="An explicit reason string is strictly required for an override action.")
        HUMAN_VERDICTS[id] = "OVERRIDDEN"
        verdict_stamp = "OVERRIDDEN"
    elif req.action in ["approve", "accept_diagnosis"]:
        HUMAN_VERDICTS[id] = "APPROVED"
        verdict_stamp = "APPROVED"
    else:
        raise HTTPException(status_code=400, detail=f"Invalid review action '{req.action}'. Expected approve, override, or accept_diagnosis.")

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = ReviewLogEntry(
        timestamp=now_str,
        product_id=id,
        action=req.action,
        attribute_name=req.attribute_name,
        override_value=req.override_value,
        reason=req.reason,
        reviewer=req.reviewer,
        verdict_stamp=verdict_stamp
    )
    HUMAN_REVIEWS.setdefault(id, []).insert(0, entry)

    # Adaptive Trust Adjustments
    # Apply to sources associated with the target attribute (or all attributes)
    target_attrs = [req.attribute_name] if req.attribute_name and req.attribute_name in attributes else list(attributes.keys())
    
    adjustments_made = []
    for attr_name in target_attrs:
        attr_info = attributes.get(attr_name, {})
        resolved_val = str(attr_info.get("resolved_value", "")).strip().lower()
        sources = attr_info.get("sources", [])

        for s in sources:
            sid = s.get("source_id", "")
            sval = str(s.get("value", "")).strip().lower()
            sprior = float(s.get("reliability_weight", 0.60))

            if req.action == "override":
                # Nudge down overridden source weight
                if sval != str(req.override_value).strip().lower():
                    adj = trust_engine.record_review_adjustment(
                        source_id=sid, attribute_type=attr_name, product_id=id,
                        action_type="override", default_prior=sprior, reason=req.reason
                    )
                    adjustments_made.append(adj)
            else:
                # Nudge up agreeing majority source weight
                if sval == resolved_val:
                    adj = trust_engine.record_review_adjustment(
                        source_id=sid, attribute_type=attr_name, product_id=id,
                        action_type=req.action, default_prior=sprior, reason=f"Approved on {id}"
                    )
                    adjustments_made.append(adj)

    return {
        "status": "success",
        "verdict_stamp": verdict_stamp,
        "review_entry": entry,
        "adaptive_trust_adjustments": len(adjustments_made)
    }

@app.get("/api/trust/history/{source_id}", response_model=List[AdaptiveTrustAdjustment], tags=["Adaptive Source Trust"])
def get_source_trust_history(source_id: str):
    """Returns Trust Ledger audit trail history for a source."""
    return trust_engine.get_source_history(source_id)

@app.get("/api/trust/leaderboard", response_model=List[TrustLeaderboardEntry], tags=["Adaptive Source Trust"])
def get_trust_leaderboard():
    """Returns Adaptive Source Trust leaderboard (sources trending UP vs DOWN)."""
    return trust_engine.get_trust_leaderboard()

@app.get("/api/erp-export/{id}", response_model=ErpRecord, tags=["ERP Export"])
def export_single_erp_product(id: str):
    """
    Transforms approved/auto-published product into fake-ERP record.
    Hard-blocked products without human review are rejected!
    """
    res_data, _ = part1_client.get_resolved_product(id)
    review_verdict = HUMAN_VERDICTS.get(id)
    routing = routing_engine.evaluate_routing(res_data, review_verdict)

    if routing.tier == "blocked" and not review_verdict:
        raise HTTPException(
            status_code=403, 
            detail=f"ERP Export Blocked: Product '{id}' is hard-blocked and requires explicit human review (Approve/Override) before export."
        )

    return build_erp_record(id, res_data, review_verdict)

@app.get("/api/erp-export/all", tags=["ERP Export"])
def export_all_erp_products():
    """Bulk exports all approved or auto-published products to fake-ERP JSON format."""
    summaries, _ = part1_client.get_products_summary()
    erp_records = []

    for s in summaries:
        pid = s["sku"]
        try:
            res_data, _ = part1_client.get_resolved_product(pid)
            review_verdict = HUMAN_VERDICTS.get(pid)
            routing = routing_engine.evaluate_routing(res_data, review_verdict)

            # Include if auto-published, flagged, or human approved/overridden
            if routing.tier != "blocked" or review_verdict:
                erp_records.append(build_erp_record(pid, res_data, review_verdict).model_dump())
        except Exception:
            pass

    return {
        "total_approved_exported": len(erp_records),
        "records": erp_records
    }

@app.get("/api/dashboard/stats", tags=["Operator Dashboard"])
def get_operator_dashboard_stats():
    """Returns Operator Dashboard health counts, distribution histogram, review queue depth."""
    summaries, fallback = part1_client.get_products_summary()
    
    auto_pub_count = 0
    flagged_count = 0
    blocked_count = 0

    scores_hist = {"90-100": 0, "80-89": 0, "70-79": 0, "below-70": 0}

    for s in summaries:
        pid = s["sku"]
        try:
            res_data, _ = part1_client.get_resolved_product(pid)
            review_verdict = HUMAN_VERDICTS.get(pid)
            routing = routing_engine.evaluate_routing(res_data, review_verdict)

            if routing.tier == "blocked":
                blocked_count += 1
            elif routing.tier == "flagged":
                flagged_count += 1
            else:
                auto_pub_count += 1

            score = s.get("overall_trust_score", 100.0)
            if score >= 90:
                scores_hist["90-100"] += 1
            elif score >= 80:
                scores_hist["80-89"] += 1
            elif score >= 70:
                scores_hist["70-79"] += 1
            else:
                scores_hist["below-70"] += 1
        except Exception:
            pass

    return {
        "total_dossiers": len(summaries),
        "auto_published_count": auto_pub_count,
        "flagged_verify_soon_count": flagged_count,
        "hard_blocked_review_queue_count": blocked_count,
        "trust_score_distribution": scores_hist,
        "part1_fallback_active": fallback,
        "trust_leaderboard": trust_engine.get_trust_leaderboard()[:5]
    }

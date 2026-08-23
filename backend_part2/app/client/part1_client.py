import os
import json
import requests
from typing import Dict, Any, List, Tuple, Optional

PART1_API_URL = os.getenv("PART1_API_URL", "http://localhost:8000")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLES_DIRS = [
    os.path.join(BASE_DIR, "contract_samples"),
    os.path.join(os.path.dirname(BASE_DIR), "contract_samples"),
    os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "contract_samples")
]

class Part1Client:
    def get_products_summary(self) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Fetches summary list of products.
        Tries Part 1 live API first; falls back to bundled contract samples if unreachable.
        Returns (list_of_summaries, fallback_active_flag).
        """
        try:
            res = requests.get(f"{PART1_API_URL}/api/products", timeout=1.5)
            if res.status_code == 200:
                return res.json(), False
        except Exception:
            pass

        # Fallback to local contract samples
        return self._load_fallback_summaries(), True

    def get_resolved_product(self, product_id: str) -> Tuple[Dict[str, Any], bool]:
        """
        Fetches Part 1 resolved JSON contract for a product.
        Tries Part 1 live API first; falls back to bundled contract sample if unreachable.
        """
        sku_clean = product_id.strip()
        try:
            res = requests.get(f"{PART1_API_URL}/api/products/{sku_clean}/resolved", timeout=1.5)
            if res.status_code == 200:
                return res.json(), False
        except Exception:
            pass

        # Fallback
        sample = self._load_fallback_sample(sku_clean)
        if sample:
            return sample, True

        raise FileNotFoundError(f"Product '{product_id}' not found in live API or local contract samples.")

    def _load_fallback_sample(self, product_id: str) -> Optional[Dict[str, Any]]:
        sku_norm = product_id.lower().replace("-", "").replace("_", "")
        for sdir in SAMPLES_DIRS:
            if os.path.exists(sdir):
                for fname in os.listdir(sdir):
                    if fname.endswith(".json"):
                        fpath = os.path.join(sdir, fname)
                        try:
                            with open(fpath, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                if data.get("sku", "").lower().replace("-", "") == sku_norm or data.get("product_id", "").lower().replace("-", "") == sku_norm:
                                    return data
                        except Exception:
                            pass
        return None

    def _load_fallback_summaries(self) -> List[Dict[str, Any]]:
        summaries = []
        seen_skus = set()
        for sdir in SAMPLES_DIRS:
            if os.path.exists(sdir):
                for fname in os.listdir(sdir):
                    if fname.endswith(".json"):
                        fpath = os.path.join(sdir, fname)
                        try:
                            with open(fpath, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                sku = data.get("sku", "UNKNOWN")
                                if sku not in seen_skus:
                                    seen_skus.add(sku)
                                    conflicts = [a for a in data.get("attributes", {}).values() if a.get("conflict")]
                                    crit_conflicts = [a for a in conflicts if a.get("criticality") == "HIGH"]
                                    summaries.append({
                                        "product_id": data.get("product_id", sku),
                                        "sku": sku,
                                        "product_name": data.get("product_name", "Unknown Product"),
                                        "overall_trust_score": data.get("overall_trust_score", 100.0),
                                        "conflict_count": len(conflicts),
                                        "critical_conflict_count": len(crit_conflicts),
                                        "attributes_count": len(data.get("attributes", {})),
                                        "source_type": "mock"
                                    })
                        except Exception:
                            pass
        return summaries

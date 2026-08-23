from difflib import SequenceMatcher
from typing import Dict, List, Tuple, Optional
from app.models.canonical import SourceRecord

class ProductMatcher:
    def __init__(self, similarity_threshold: float = 0.80):
        self.similarity_threshold = similarity_threshold

    def calculate_name_similarity(self, name_a: str, name_b: str) -> float:
        """
        Calculate string similarity between two product names.
        Signature abstract enough to swap in vector embeddings in the future.
        """
        if not name_a or not name_b:
            return 0.0
        return SequenceMatcher(None, name_a.lower().strip(), name_b.lower().strip()).ratio()

    def match_records_to_product(
        self, 
        records: List[SourceRecord], 
        target_sku: str, 
        target_name: str
    ) -> Tuple[List[SourceRecord], float]:
        """
        Matches source records to a canonical product.
        Returns matching records and match confidence (1.0 for exact SKU match, < 1.0 for fuzzy match).
        """
        matched: List[SourceRecord] = []
        scores: List[float] = []

        for rec in records:
            # 1. Exact SKU match
            if rec.sku and rec.sku.upper() == target_sku.upper():
                matched.append(rec)
                scores.append(1.0)
            else:
                # 2. Name similarity fallback
                sim_score_sku = self.calculate_name_similarity(rec.sku, target_sku)
                sim_score_name = self.calculate_name_similarity(rec.product_id, target_name)
                sim_score = max(sim_score_sku, sim_score_name)
                if sim_score >= self.similarity_threshold:
                    matched.append(rec)
                    scores.append(sim_score)

        avg_score = sum(scores) / len(scores) if scores else 0.0
        return matched, avg_score

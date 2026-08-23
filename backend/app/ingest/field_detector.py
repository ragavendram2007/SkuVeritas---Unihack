import re
import pandas as pd
from typing import Dict, Any, List

class FieldDetector:
    """
    Inspects column contents dynamically to map arbitrary input dataframe columns
    to internal pipeline roles without relying on exact header names.
    """
    def detect_field_roles(self, df: pd.DataFrame) -> Dict[str, str]:
        roles = {
            "mfg_part_num": "",
            "part_desc": "",
            "part_manuf": "",
            "e1_brand": "",
            "unilog_brand": "",
            "dib_brand": ""
        }

        columns = df.columns.tolist()
        scores: Dict[str, Dict[str, float]] = {col: {} for col in columns}

        for col in columns:
            sample_vals = [str(x).strip() for x in df[col].dropna().head(30) if str(x).strip().lower() not in ["nan", "none", ""]]
            if not sample_vals:
                continue

            col_lower = str(col).lower()

            # 1. Identifier / Part Number Score
            # High proportion of uppercase alphanumeric codes with digits/dashes
            part_num_matches = sum(1 for v in sample_vals if re.match(r'^[A-Za-z0-9\-\_\.]{3,30}$', v) and any(c.isdigit() for c in v))
            part_score = (part_num_matches / len(sample_vals)) * 0.8
            if any(k in col_lower for k in ["part", "sku", "num", "code", "mfg"]):
                part_score += 0.4
            scores[col]["mfg_part_num"] = part_score

            # 2. Description Score
            # Longest text strings with multiple words
            avg_len = sum(len(v) for v in sample_vals) / len(sample_vals)
            word_counts = sum(len(v.split()) for v in sample_vals) / len(sample_vals)
            desc_score = 0.0
            if avg_len > 15 and word_counts >= 2:
                desc_score = min(1.0, (avg_len / 50.0) * 0.7)
            if any(k in col_lower for k in ["desc", "title font", "item", "name", "product"]):
                desc_score += 0.4
            scores[col]["part_desc"] = desc_score

            # 3. Manufacturer Score
            # Short proper noun names, often repeated across rows
            manuf_score = 0.0
            unique_ratio = len(set(sample_vals)) / len(sample_vals)
            if unique_ratio < 0.8 and avg_len < 35:
                manuf_score = 0.5
            if any(k in col_lower for k in ["manuf", "mfr", "maker", "vendor", "company", "supplier"]):
                manuf_score += 0.5
            scores[col]["part_manuf"] = manuf_score

            # 4. Brand Scores
            brand_score = 0.0
            if any(k in col_lower for k in ["brand"]):
                brand_score += 0.6
            scores[col]["brand"] = brand_score

        # Assign best column per role
        assigned_cols = set()

        # Assign mfg_part_num
        best_part_col = max(columns, key=lambda c: scores[c].get("mfg_part_num", 0.0))
        if scores[best_part_col].get("mfg_part_num", 0.0) > 0.3:
            roles["mfg_part_num"] = best_part_col
            assigned_cols.add(best_part_col)

        # Assign part_desc
        unassigned_cols = [c for c in columns if c not in assigned_cols]
        if unassigned_cols:
            best_desc_col = max(unassigned_cols, key=lambda c: scores[c].get("part_desc", 0.0))
            roles["part_desc"] = best_desc_col
            assigned_cols.add(best_desc_col)

        # Assign part_manuf
        unassigned_cols = [c for c in columns if c not in assigned_cols]
        if unassigned_cols:
            best_manuf_col = max(unassigned_cols, key=lambda c: scores[c].get("part_manuf", 0.0))
            roles["part_manuf"] = best_manuf_col
            assigned_cols.add(best_manuf_col)

        # Assign brand columns if present
        brand_cols = [c for c in columns if c not in assigned_cols and scores[c].get("brand", 0.0) > 0.4]
        if len(brand_cols) >= 1:
            roles["e1_brand"] = brand_cols[0]
        if len(brand_cols) >= 2:
            roles["unilog_brand"] = brand_cols[1]
        if len(brand_cols) >= 3:
            roles["dib_brand"] = brand_cols[2]

        return roles

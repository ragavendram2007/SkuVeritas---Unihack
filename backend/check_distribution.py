import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
part2_dir = os.path.join(os.path.dirname(backend_dir), "backend_part2")

sys.path.insert(0, backend_dir)
from app.main import build_data_pipeline, process_generic_file_input, PRODUCT_STORE, DATA_DIR

sys.path.insert(0, part2_dir)
from app.routing.routing_engine import RoutingEngine

if __name__ == "__main__":
    build_data_pipeline()
    unihack_file = os.path.join(DATA_DIR, "unihack", "sample_dataset.xlsx")
    if os.path.exists(unihack_file):
        process_generic_file_input(unihack_file, limit=30)

    re = RoutingEngine()
    
    tiers = {"auto-publish": 0, "flagged": 0, "blocked": 0}
    
    for k, v in PRODUCT_STORE.items():
        data = v.model_dump()
        r = re.evaluate_routing(data)
        tiers[r.tier] += 1

    total = len(PRODUCT_STORE)
    print(f"Total Products Evaluated (Dataset A + Dataset B): {total}")
    for k, v in tiers.items():
        pct = (v / total) * 100 if total > 0 else 0
        print(f"  {k.upper()}: {v} ({pct:.1f}%)")

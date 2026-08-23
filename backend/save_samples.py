import os
import json
from app.main import build_data_pipeline, PRODUCT_STORE, BASE_DIR

if __name__ == "__main__":
    build_data_pipeline()
    samples_dir = os.path.join(os.path.dirname(BASE_DIR), "contract_samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    for k, v in PRODUCT_STORE.items():
        if k in ["PR-9000", "HT-1010", "EB-4040", "SV-5050"]:
            filename = f"dataset_a_{k.lower().replace('-', '')}.json"
            filepath = os.path.join(samples_dir, filename)
            with open(filepath, "w") as f:
                json.dump(v.model_dump(), f, indent=2)
            print(f"Saved {filename} to {filepath}")

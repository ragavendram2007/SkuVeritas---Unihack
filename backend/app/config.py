import os

# Reliability priors per source type
RELIABILITY_PRIORS = {
    "erp_csv": 0.90,
    "manufacturer_pdf": 0.85,
    "supplier_excel": 0.60,
    "scraped_webpage": 0.40
}

# Criticality lookup
HIGH_CRITICALITY_ATTRIBUTES = {
    "pressure_rating", "max_pressure", "operating_pressure", "pressure",
    "max_temp", "operating_temp", "temperature", "voltage", "load"
}

LOW_CRITICALITY_ATTRIBUTES = {
    "color", "packaging", "weight", "net_weight", "handle_type"
}

def get_criticality(attribute_name: str) -> str:
    attr_clean = attribute_name.lower().strip()
    if attr_clean in HIGH_CRITICALITY_ATTRIBUTES:
        return "HIGH"
    if attr_clean in LOW_CRITICALITY_ATTRIBUTES:
        return "LOW"
    return "MEDIUM"

CRITICALITY_WEIGHTS = {
    "HIGH": 1.00,
    "MEDIUM": 0.50,
    "LOW": 0.25
}

# Synonym normalization table
HEADER_SYNONYMS = {
    # pressure_rating
    "mwp": "pressure_rating",
    "pwp": "pressure_rating",
    "max working pressure": "pressure_rating",
    "pressure rating": "pressure_rating",
    "pressure": "pressure_rating",
    "max_pressure": "pressure_rating",
    # max_temp
    "max temp": "max_temp",
    "max temperature": "max_temp",
    "operating temp": "max_temp",
    "temperature": "max_temp",
    # flow_rate
    "flow rate": "flow_rate",
    "flow": "flow_rate",
    "max_flow": "flow_rate",
    # weight
    "net weight": "weight",
    "mass": "weight",
    "weight_kg": "weight",
    # voltage
    "operating voltage": "voltage",
    "volts": "voltage",
    "input_voltage": "voltage",
    # air_flow
    "air flow": "air_flow",
    "air_capacity": "air_flow",
    "cfm": "air_flow",
    # material
    "body material": "material",
    "construction_material": "material",
    # handle_type
    "grip": "handle_type",
    "handle": "handle_type"
}

# Data directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

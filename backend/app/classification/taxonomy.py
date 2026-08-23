import re
from typing import Tuple

TAXONOMY_MAP = [
    # Pattern, Dept, Class, Fine
    (r'dish|washer|appliance|refrig|oven|range|laundry', "Appliances", "Large Appliances", "Dishwashers"),
    (r'wrench|socket|ratchet|pliers|hammer|hand tool', "Tools & Hardware", "Hand Tools", "Wrenches"),
    (r'blower|leaf|power tool|cordless|vacuum|trimmer', "Tools & Hardware", "Power Tools", "Blowers"),
    (r'valve|solenoid|regulator|fluid|pipe|fitting|pressure', "Industrial & Hydraulics", "Valves & Flow Control", "Pressure Valves"),
    (r'abr|disc|cut-off|grinding|wheel|sanding|belt', "Abrasives & Cutting", "Cutting & Grinding Discs", "Cutting Wheels"),
    (r'fastener|bolt|screw|nut|washer|anchor', "Fasteners & Hardware", "Industrial Fasteners", "Bolts & Screws"),
    (r'electrical|wire|cable|breaker|switch|plug|voltage', "Electrical & Lighting", "Wiring & Distribution", "Switches & Breakers"),
]

def classify_product_taxonomy(part_desc: str, part_manuf: str = "") -> Tuple[str, str, str, str]:
    """
    Classifies product into constrained Dept > Class > Fine taxonomy.
    Returns (dept, cls, fine, category_path).
    """
    desc_clean = f"{part_desc} {part_manuf}".lower()
    
    for pattern, dept, cls, fine in TAXONOMY_MAP:
        if re.search(pattern, desc_clean):
            path = f"{dept} > {cls} > {fine}"
            return dept, cls, fine, path

    # Default fallback
    dept, cls, fine = "Industrial Supplies", "General Equipment", "Maintenance Products"
    path = f"{dept} > {cls} > {fine}"
    return dept, cls, fine, path

import os
import pandas as pd
from app.config import DATA_DIR

def generate_mock_files():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # -------------------------------------------------------------------------
    # PRODUCT 1: Pressure Regulator (PR-9000) - Critical Unit Mislabel Conflict
    # ERP: 200 PSI, PDF: 200 PSI, Excel: 200 PSI, Webpage: 300 PSI (bar mislabel)
    # -------------------------------------------------------------------------
    
    # 1. ERP CSV
    erp_pr = pd.DataFrame([{
        "SKU": "PR-9000",
        "Product Name": "Industrial High Pressure Regulator Valve",
        "Pressure Rating": "200 PSI",
        "Max Temp": "150 C",
        "Flow Rate": "45 GPM",
        "Last Modified": "2026-08-01T10:00:00Z"
    }])
    erp_pr.to_csv(os.path.join(DATA_DIR, "pr_9000_erp.csv"), index=False)

    # 2. Manufacturer PDF (Mock Plain Text Extract)
    pdf_pr_content = """=== MANUFACTURER TECHNICAL SPECIFICATION SHEET ===
Product Identifier: PR-9000
Product Title: Industrial High Pressure Regulator Valve
Date of Issue: 2026-07-28T08:30:00Z

OPERATING SPECIFICATIONS:
Max Working Pressure (MWP): 200 PSI
Operating Temperature: 150 C
Flow Capacity: 45 GPM
Body Material: Forged Stainless Steel 316
"""
    with open(os.path.join(DATA_DIR, "pr_9000_manufacturer.txt"), "w", encoding="utf-8") as f:
        f.write(pdf_pr_content)

    # 3. Supplier Excel
    excel_pr = pd.DataFrame([{
        "Part_SKU": "PR-9000",
        "Item_Description": "Industrial High Pressure Regulator Valve",
        "PWP": "200 PSI",
        "Max Temperature": "150 C",
        "Max_Flow": "45 GPM",
        "Updated_At": "2026-07-30T14:15:00Z"
    }])
    excel_pr.to_excel(os.path.join(DATA_DIR, "pr_9000_supplier.xlsx"), index=False)

    # 5. Malformed SKU Supplier Excel (Exercises name-similarity matching fallback)
    excel_pr_malformed = pd.DataFrame([{
        "Part_SKU": "PR-9000-MALFORMED-99X",
        "Item_Description": "Industrial High Pressure Regulator Valve",
        "PWP": "200 PSI",
        "Max Temperature": "150 C",
        "Updated_At": "2026-07-30T14:15:00Z"
    }])
    excel_pr_malformed.to_excel(os.path.join(DATA_DIR, "pr_9000_supplier_malformed.xlsx"), index=False)

    # 4. Scraped HTML Webpage
    web_pr_content = """<!DOCTYPE html>
<html>
<head><title>Product Catalog - PR-9000 Pressure Regulator</title></head>
<body>
  <div class="product-header">
    <h1 id="product-title">Industrial High Pressure Regulator Valve</h1>
    <span class="sku-code">SKU: PR-9000</span>
    <time datetime="2026-08-05T12:00:00Z">Updated: 2026-08-05</time>
  </div>
  <table class="specs-table">
    <tr><th>Pressure</th><td>300 PSI</td></tr>
    <tr><th>Temperature</th><td>150 C</td></tr>
    <tr><th>Flow Rate</th><td>45 GPM</td></tr>
  </table>
</body>
</html>
"""
    with open(os.path.join(DATA_DIR, "pr_9000_scraped.html"), "w", encoding="utf-8") as f:
        f.write(web_pr_content)


    # -------------------------------------------------------------------------
    # PRODUCT 2: Clean Hand Tool (HT-1010) - 100% Clean Agreement across 4 sources
    # -------------------------------------------------------------------------
    
    # 1. ERP CSV
    erp_ht = pd.DataFrame([{
        "SKU": "HT-1010",
        "Product Name": "Professional Ratcheting Socket Wrench 3/8-inch",
        "Weight": "0.45 kg",
        "Material": "Chrome Vanadium Steel",
        "Grip": "Ergonomic Rubber",
        "Last Modified": "2026-08-02T11:00:00Z"
    }])
    erp_ht.to_csv(os.path.join(DATA_DIR, "ht_1010_erp.csv"), index=False)

    # 2. Manufacturer PDF (Text)
    pdf_ht_content = """=== MANUFACTURER TECHNICAL SPECIFICATION SHEET ===
Product SKU: HT-1010
Product Name: Professional Ratcheting Socket Wrench 3/8-inch
Specification Date: 2026-07-25T09:00:00Z

TECHNICAL DATA:
Net Weight: 0.45 kg
Construction Material: Chrome Vanadium Steel
Handle Type: Ergonomic Rubber
"""
    with open(os.path.join(DATA_DIR, "ht_1010_manufacturer.txt"), "w", encoding="utf-8") as f:
        f.write(pdf_ht_content)

    # 3. Supplier Excel
    excel_ht = pd.DataFrame([{
        "Part_SKU": "HT-1010",
        "Item_Description": "Professional Ratcheting Socket Wrench 3/8-inch",
        "Weight_kg": "0.45 kg",
        "Body Material": "Chrome Vanadium Steel",
        "Handle": "Ergonomic Rubber",
        "Updated_At": "2026-08-01T16:20:00Z"
    }])
    excel_ht.to_excel(os.path.join(DATA_DIR, "ht_1010_supplier.xlsx"), index=False)

    # 4. Scraped Webpage
    web_ht_content = """<!DOCTYPE html>
<html>
<head><title>Socket Wrench HT-1010</title></head>
<body>
  <h1>Professional Ratcheting Socket Wrench 3/8-inch</h1>
  <p>SKU: HT-1010</p>
  <ul>
    <li>Weight: 0.45 kg</li>
    <li>Material: Chrome Vanadium Steel</li>
    <li>Handle: Ergonomic Rubber</li>
  </ul>
</body>
</html>
"""
    with open(os.path.join(DATA_DIR, "ht_1010_scraped.html"), "w", encoding="utf-8") as f:
        f.write(web_ht_content)


    # -------------------------------------------------------------------------
    # PRODUCT 3: Electric Blower (EB-4040) - Digit Transposition Conflict (1.8 kg vs 8.1 kg)
    # -------------------------------------------------------------------------
    
    # 1. ERP CSV
    erp_eb = pd.DataFrame([{
        "SKU": "EB-4040",
        "Product Name": "Cordless High Velocity Leaf Blower 20V",
        "Weight": "1.8 kg",
        "Operating Voltage": "20 V",
        "Air Flow": "120 CFM",
        "Last Modified": "2026-08-04T09:30:00Z"
    }])
    erp_eb.to_csv(os.path.join(DATA_DIR, "eb_4040_erp.csv"), index=False)

    # 2. Manufacturer PDF (Text)
    pdf_eb_content = """=== MANUFACTURER TECHNICAL SPECIFICATION SHEET ===
Product SKU: EB-4040
Product Title: Cordless High Velocity Leaf Blower 20V
Release Date: 2026-07-29T14:00:00Z

PHYSICAL PROPERTIES:
Net Weight: 1.8 kg
Volts: 20 V
Air Flow Capacity: 120 CFM
"""
    with open(os.path.join(DATA_DIR, "eb_4040_manufacturer.txt"), "w", encoding="utf-8") as f:
        f.write(pdf_eb_content)

    # 3. Supplier Excel
    excel_eb = pd.DataFrame([{
        "Part_SKU": "EB-4040",
        "Item_Description": "Cordless High Velocity Leaf Blower 20V",
        "Weight": "1.8 kg",
        "Voltage": "20 V",
        "CFM": "120 CFM",
        "Updated_At": "2026-08-03T18:00:00Z"
    }])
    excel_eb.to_excel(os.path.join(DATA_DIR, "eb_4040_supplier.xlsx"), index=False)

    # 4. Scraped Webpage (Contains Transposition Error: 8.1 kg)
    web_eb_content = """<!DOCTYPE html>
<html>
<head><title>Cordless Blower EB-4040</title></head>
<body>
  <h1>Cordless High Velocity Leaf Blower 20V</h1>
  <p>SKU: EB-4040</p>
  <div class="specs">
    <p>Mass: 8.1 kg</p>
    <p>Input Voltage: 20 V</p>
    <p>Air Capacity: 120 CFM</p>
  </div>
</body>
</html>
"""
    with open(os.path.join(DATA_DIR, "eb_4040_scraped.html"), "w", encoding="utf-8") as f:
        f.write(web_eb_content)

    # -------------------------------------------------------------------------
    # PRODUCT 4: Solenoid Valve (SV-5050) - Stale Revision & Missing Attribute
    # ERP/PDF/Excel: 24 V (2026-08-01), Webpage: 12 V (2024-01-10 - 500+ days older)
    # Webpage omits 'orifice_diameter' attribute (missing attribute detection)
    # -------------------------------------------------------------------------

    # 1. ERP CSV
    erp_sv = pd.DataFrame([{
        "SKU": "SV-5050",
        "Product Name": "High Flow Brass Electric Solenoid Valve 24V",
        "Voltage": "24 V",
        "Orifice Diameter": "10 mm",
        "Max Temp": "90 C",
        "Last Modified": "2026-08-01T10:00:00Z"
    }])
    erp_sv.to_csv(os.path.join(DATA_DIR, "sv_5050_erp.csv"), index=False)

    # 2. Manufacturer PDF (Text)
    pdf_sv_content = """=== MANUFACTURER TECHNICAL SPECIFICATION SHEET ===
Product Identifier: SV-5050
Product Title: High Flow Brass Electric Solenoid Valve 24V
Date of Issue: 2026-07-28T08:30:00Z

TECHNICAL DATA:
Operating Voltage: 24 V
Orifice Diameter: 10 mm
Operating Temp: 90 C
"""
    with open(os.path.join(DATA_DIR, "sv_5050_manufacturer.txt"), "w", encoding="utf-8") as f:
        f.write(pdf_sv_content)

    # 3. Supplier Excel
    excel_sv = pd.DataFrame([{
        "Part_SKU": "SV-5050",
        "Item_Description": "High Flow Brass Electric Solenoid Valve 24V",
        "Voltage": "24 V",
        "Orifice Diameter": "10 mm",
        "Max Temperature": "90 C",
        "Updated_At": "2026-07-30T14:15:00Z"
    }])
    excel_sv.to_excel(os.path.join(DATA_DIR, "sv_5050_supplier.xlsx"), index=False)

    # 4. Scraped Webpage (Stale 2024 Revision: 12 V; Omits Orifice Diameter attribute)
    web_sv_content = """<!DOCTYPE html>
<html>
<head><title>Solenoid Valve SV-5050</title></head>
<body>
  <h1>High Flow Brass Electric Solenoid Valve 24V</h1>
  <p>SKU: SV-5050</p>
  <time datetime="2024-01-10T10:00:00Z">Updated: 2024-01-10</time>
  <div class="specs">
    <p>Operating Voltage: 12 V</p>
    <p>Temperature: 90 C</p>
  </div>
</body>
</html>
"""
    with open(os.path.join(DATA_DIR, "sv_5050_scraped.html"), "w", encoding="utf-8") as f:
        f.write(web_sv_content)

    print("Mock raw files created successfully in:", DATA_DIR)

if __name__ == "__main__":
    generate_mock_files()

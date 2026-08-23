import os
import pytest
import pandas as pd
from app.ingest.field_detector import FieldDetector
from app.main import process_generic_file_input, PRODUCT_STORE, DELIVERY_ROWS, DATA_DIR
from app.assembly.exporter import export_delivery_format_excel

@pytest.fixture(scope="module")
def altered_dataset_path():
    filepath = os.path.join(DATA_DIR, "unihack", "sample_dataset_altered.xlsx")
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Create altered dataframe with renamed headers, reordered columns, dropped E1_Brand, and novel products
    df_altered = pd.DataFrame([
        {
            "Maker_Company": "SunPower Energy (1001)",
            "Item_Full_Title": "5000W Solar Grid-Tie Power Inverter 240V 20A",
            "Part_SKU_Code": "SOLAR-INV-5000",
            "Unilog_Brand": "SunPower",
            "DIB_Brand": "SunPower Solar"
        },
        {
            "Maker_Company": "HydroTech Fluidics (2002)",
            "Item_Full_Title": "Industrial High Pressure Hydraulic Vane Pump 3000 PSI",
            "Part_SKU_Code": "HYD-PUMP-3000",
            "Unilog_Brand": "HydroTech",
            "DIB_Brand": "-- No DIB Brand --"
        },
        {
            "Maker_Company": "OptiSensors Inc (3003)",
            "Item_Full_Title": "Precision Infrared Laser Distance Sensor 50m Range 24V",
            "Part_SKU_Code": "OPT-SENS-50M",
            "Unilog_Brand": "-- No Unilog Brand --",
            "DIB_Brand": "-- No DIB Brand --"
        }
    ])
    
    df_altered.to_excel(filepath, index=False)
    return filepath

def test_field_detector_on_altered_dataset(altered_dataset_path):
    df = pd.read_excel(altered_dataset_path)
    detector = FieldDetector()
    roles = detector.detect_field_roles(df)

    assert roles["mfg_part_num"] == "Part_SKU_Code"
    assert roles["part_desc"] == "Item_Full_Title"
    assert roles["part_manuf"] == "Maker_Company"

def test_pipeline_on_altered_dataset(altered_dataset_path, tmp_path):
    process_generic_file_input(altered_dataset_path)

    # Verify products are present in store
    assert "SOLAR-INV-5000" in PRODUCT_STORE
    assert "HYD-PUMP-3000" in PRODUCT_STORE
    assert "OPT-SENS-50M" in PRODUCT_STORE

    # Verify export output
    out_file = str(tmp_path / "Delivery_Format_Export_Altered.xlsx")
    export_delivery_format_excel(list(DELIVERY_ROWS.values()), out_file)

    assert os.path.exists(out_file)
    df_out = pd.read_excel(out_file, sheet_name="Delivery Format")
    assert len(df_out.columns) == 252
    assert "SOLAR-INV-5000" in df_out["Mfg_Part_Num"].values

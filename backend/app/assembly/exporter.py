import os
import pandas as pd
from typing import List
from app.models.unihack import DeliveryFormatRow

def export_delivery_format_excel(rows: List[DeliveryFormatRow], output_filepath: str):
    """
    Exports DeliveryFormatRows to Excel matching the exact 252-column Delivery Format target schema.
    """
    template_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "unihack", "expected_output.xlsx"
    )

    if os.path.exists(template_path):
        template_df = pd.read_excel(template_path, sheet_name="Delivery Format")
        target_columns = template_df.columns.tolist()
    else:
        target_columns = [
            "MFR URL", "Ref URL 1", "Ref URL 2", "Ref URL 3", "Ref URL 4", "Ref URL 5",
            "PART_NUMBER", "Dept", "Class", "Fine", "SKU - MY_PART_NUMBER", "Mfg_Part_Num",
            "Part_Desc", "E1_Brand", "Unilog_Brand", "DIB_Brand", "Part_Manuf",
            "MANUFACTURER_NAME", "BRAND_NAME", "TRADE_NAME", "MANUFACTURER_PART_NUMBER",
            "Classpath", "MOBILE_DESC", "INVOICE_DESC", "SHORT_DESC", "LONG_DESC1",
            "RETAIL_DESC", "Product Name"
        ]
        for i in range(1, 16):
            target_columns.extend([f"ATTRIBUTE_LABEL {i}", f"ATTRIBUTE_VALUE {i}", f"ATTRIBUTE_UOM {i}"])

    out_records = []
    for r in rows:
        rec = {}
        # Core fields
        rec["MFR URL"] = r.mfr_url
        rec["Ref URL 1"] = r.ref_url_1
        rec["Ref URL 2"] = r.ref_url_2
        rec["Ref URL 3"] = r.ref_url_3
        rec["Ref URL 4"] = r.ref_url_4
        rec["Ref URL 5"] = r.ref_url_5
        rec["PART_NUMBER"] = r.part_number
        rec["Dept"] = r.dept
        rec["Class"] = r.cls
        rec["Fine"] = r.fine
        rec["SKU - MY_PART_NUMBER"] = r.sku_my_part_number
        rec["Mfg_Part_Num"] = r.mfg_part_num
        rec["Part_Desc"] = r.part_desc
        rec["E1_Brand"] = r.e1_brand
        rec["Unilog_Brand"] = r.unilog_brand
        rec["DIB_Brand"] = r.dib_brand
        rec["Part_Manuf"] = r.part_manuf
        rec["MANUFACTURER_NAME"] = r.manufacturer_name
        rec["BRAND_NAME"] = r.brand_name
        rec["TRADE_NAME"] = r.trade_name
        rec["MANUFACTURER_PART_NUMBER"] = r.manufacturer_part_number
        rec["Classpath"] = r.classpath
        rec["MOBILE_DESC"] = r.mobile_desc
        rec["INVOICE_DESC"] = r.invoice_desc
        rec["SHORT_DESC"] = r.short_desc
        rec["LONG_DESC1"] = r.long_desc1
        rec["RETAIL_DESC"] = r.retail_desc
        rec["Product Name"] = r.product_name

        # Dynamic Attributes 1..15
        for i in range(1, 16):
            lbl_key = f"ATTRIBUTE_LABEL {i}"
            val_key = f"ATTRIBUTE_VALUE {i}"
            uom_key = f"ATTRIBUTE_UOM {i}"
            if lbl_key in target_columns:
                rec[lbl_key] = r.attribute_labels.get(i, "")
            if val_key in target_columns:
                rec[val_key] = r.attribute_values.get(i, "")
            if uom_key in target_columns:
                rec[uom_key] = r.attribute_uoms.get(i, "")

        # Fill remaining columns in target schema with empty strings
        for col in target_columns:
            if col not in rec:
                rec[col] = ""

        out_records.append(rec)

    df_out = pd.DataFrame(out_records)
    # Reorder columns to match target schema exactly
    df_out = df_out.reindex(columns=target_columns)

    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    with pd.ExcelWriter(output_filepath, engine="openpyxl") as writer:
        df_out.to_excel(writer, sheet_name="Delivery Format", index=False)

    print(f"Exported Delivery Format file ({len(rows)} rows, {len(target_columns)} columns) to: {output_filepath}")

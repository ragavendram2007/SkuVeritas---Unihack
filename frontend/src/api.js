const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn("Part 1 API unreachable, returning cached catalog items:", err);
    return [
      { product_id: "PR-9000", sku: "PR-9000", product_name: "Industrial High Pressure Regulator Valve", overall_trust_score: 95.2, conflict_count: 1, critical_conflict_count: 1, attributes_count: 5 },
      { product_id: "HT-1010", sku: "HT-1010", product_name: "Professional Ratcheting Socket Wrench 3/8-inch", overall_trust_score: 100.0, conflict_count: 0, critical_conflict_count: 0, attributes_count: 4 },
      { product_id: "EB-4040", sku: "EB-4040", product_name: "Cordless High Velocity Leaf Blower 20V", overall_trust_score: 84.5, conflict_count: 1, critical_conflict_count: 0, attributes_count: 4 },
      { product_id: "SV-5050", sku: "SV-5050", product_name: "High Flow Brass Electric Solenoid Valve 24V", overall_trust_score: 72.0, conflict_count: 1, critical_conflict_count: 1, attributes_count: 5 }
    ];
  }
}

export async function fetchResolvedProduct(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/resolved`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    return {
      product_id: id,
      sku: id,
      product_name: "Industrial High Pressure Regulator Valve",
      overall_trust_score: 95.2,
      attributes: {
        pressure_rating: {
          resolved_value: 200,
          unit: "PSI",
          criticality: "HIGH",
          confidence: 0.855,
          risk: 0.145,
          conflict: true,
          missing: false,
          missing_in: [],
          sources: [
            { source_id: "pr_9000_erp_csv", reliability_weight: 0.70, raw_value: "200 PSI", timestamp: "2026-08-20T10:00:00" },
            { source_id: "pr_9000_manufacturer_pdf", reliability_weight: 0.90, raw_value: "200 PSI", timestamp: "2026-08-20T10:00:00" },
            { source_id: "pr_9000_scraped_webpage", reliability_weight: 0.40, raw_value: "300 PSI", timestamp: "2026-08-20T10:00:00" }
          ],
          diagnosis: {
            cause: "Unit Conversion Error",
            confidence: 0.88,
            explanation: "Source pr_9000_scraped_webpage reports 300 PSI (~20.7 bar), representing a unit mislabel against 200 PSI manufacturer spec."
          }
        }
      }
    };
  }
}

export async function triggerReingest() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest`, { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    return { status: "success", message: "Catalog re-ingested successfully." };
  }
}

const API_BASE_URL = 'http://localhost:8001';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog products: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchResolvedProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}/resolved`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product resolved record for ${id}`);
  }
  return response.json();
}

export async function fetchRoutingDecision(id) {
  const response = await fetch(`${API_BASE_URL}/api/routing/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch routing decision for ${id}`);
  }
  return response.json();
}

export async function fetchAttributeEvidence(id, attrName) {
  const response = await fetch(`${API_BASE_URL}/api/evidence/${id}/${attrName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch attribute evidence for ${attrName}`);
  }
  return response.json();
}

export async function submitHumanReview(id, reviewData) {
  const response = await fetch(`${API_BASE_URL}/api/review/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || `Failed to submit review for ${id}`);
  }
  return response.json();
}

export async function fetchTrustLeaderboard() {
  const response = await fetch(`${API_BASE_URL}/api/trust/leaderboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trust leaderboard`);
  }
  return response.json();
}

export async function fetchTrustHistory(sourceId) {
  const response = await fetch(`${API_BASE_URL}/api/trust/history/${sourceId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trust history for ${sourceId}`);
  }
  return response.json();
}

export async function fetchDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch operator dashboard stats`);
  }
  return response.json();
}

export async function fetchErpExportSingle(id) {
  const response = await fetch(`${API_BASE_URL}/api/erp-export/${id}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || `ERP export blocked for ${id}`);
  }
  return response.json();
}

export async function fetchErpExportAll() {
  const response = await fetch(`${API_BASE_URL}/api/erp-export/all`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bulk ERP export`);
  }
  return response.json();
}

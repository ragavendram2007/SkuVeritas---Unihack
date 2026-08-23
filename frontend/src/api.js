const API_BASE_URL = 'http://localhost:8000';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchResolvedProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}/resolved`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product details for ${id}: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerReingest() {
  const response = await fetch(`${API_BASE_URL}/api/ingest`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger re-ingest: ${response.statusText}`);
  }
  return response.json();
}

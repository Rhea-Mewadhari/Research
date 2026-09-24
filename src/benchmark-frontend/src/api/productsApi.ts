import type { Product, PaginatedResponse } from '../types/product';

const BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'benchmark-token-2024';

export async function fetchProducts(page = 1): Promise<PaginatedResponse<Product>> {
  const authToken = localStorage.getItem('auth_token');
  const res = await fetch(`${BASE_URL}/products?page=${page}&limit=10`, {
    headers: { Authorization: authToken ? `Bearer ${authToken}` : `Bearer ${AUTH_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json() as Promise<PaginatedResponse<Product>>;
}

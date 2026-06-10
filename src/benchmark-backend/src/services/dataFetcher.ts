import type { Product } from '../types/product';

const DUMMY_JSON_URL =
  'https://dummyjson.com/products?limit=100&select=title,price,stock,category,rating,thumbnail,description,tags,discountPercentage';

interface DummyProduct {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  description: string;
  tags: string[];
  discountPercentage: number;
}

interface DummyResponse {
  products: DummyProduct[];
}

let cache: Product[] | null = null;

export async function fetchAllProducts(): Promise<Product[]> {
  if (cache) return cache;

  const res = await fetch(DUMMY_JSON_URL);
  const data = (await res.json()) as DummyResponse;

  cache = data.products.map((p, i) => ({
    id: i + 1,
    name: p.title,
    price: p.price,
    inStock: p.stock > 0,
    category: p.category,
    rating: p.rating,
    reviewCount: Math.round(p.rating * 20),
    description: p.description,
    tags: p.tags,
    discountPct: p.discountPercentage,
  }));

  return cache;
}

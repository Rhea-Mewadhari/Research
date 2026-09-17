import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

const HYPHEN_SORT_MAP: Record<string, InternalSort> = {
  'price-asc': 'priceAsc',
  'price-desc': 'priceDesc',
  'rating-desc': 'ratingDesc',
};

export function parseProductQuery(raw: Record<string, unknown>): Omit<ProductQuery, 'sort'> & { sort?: InternalSort } {
  const query: Omit<ProductQuery, 'sort'> & { sort?: InternalSort } = {};

  if (typeof raw.search === 'string') {
    query.search = raw.search;
  }

  if (typeof raw.category === 'string') {
    query.category = raw.category;
  }

  if (raw.inStock === 'true') {
    query.inStock = true;
  } else if (raw.inStock === 'false') {
    query.inStock = false;
  }

  const rawSort = typeof raw.sort === 'string' ? raw.sort : undefined;
  const mappedSort = rawSort !== undefined ? (HYPHEN_SORT_MAP[rawSort] ?? rawSort) : undefined;
  if (mappedSort !== undefined && VALID_SORT_OPTIONS.includes(mappedSort as InternalSort)) {
    query.sort = mappedSort as InternalSort;
  }

  const pageVal = parseInt(String(raw.page), 10);
  if (!isNaN(pageVal) && pageVal > 0) {
    query.page = pageVal;
  }

  const limitVal = parseInt(String(raw.limit), 10);
  if (!isNaN(limitVal) && limitVal > 0) {
    query.limit = Math.min(limitVal, 50);
  }

  return query;
}

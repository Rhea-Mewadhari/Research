import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

const HYPHEN_TO_CAMEL: Record<string, InternalSort> = {
  'price-asc': 'priceAsc',
  'price-desc': 'priceDesc',
  'rating-desc': 'ratingDesc',
  'name-asc': 'nameAsc',
  'name-desc': 'nameDesc',
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

  const normalizedSort = typeof raw.sort === 'string'
    ? (HYPHEN_TO_CAMEL[raw.sort] ?? raw.sort)
    : raw.sort;
  if (VALID_SORT_OPTIONS.includes(normalizedSort as InternalSort)) {
    query.sort = normalizedSort as InternalSort;
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

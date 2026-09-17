import type { ProductQuery } from '../types/product';

type InternalSort = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc' | 'name-desc';

const VALID_SORT_OPTIONS: InternalSort[] = ['price-asc', 'price-desc', 'rating-desc', 'name-asc', 'name-desc'];

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

  if (VALID_SORT_OPTIONS.includes(raw.sort as InternalSort)) {
    query.sort = raw.sort as InternalSort;
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

import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

const HYPHENATED_SORT_MAP: { [key: string]: InternalSort | undefined } = {
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

  if (typeof raw.sort === 'string') {
    const normalised: unknown = HYPHENATED_SORT_MAP[raw.sort] ?? raw.sort;
    if (VALID_SORT_OPTIONS.includes(normalised as InternalSort)) {
      query.sort = normalised as InternalSort;
    }
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

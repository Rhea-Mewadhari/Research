import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

export function parseProductQuery(raw: Record<string, unknown>): ProductQuery & { sort?: InternalSort } {
  const query: ProductQuery & { sort?: InternalSort } = {};

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

  const HYPHENATED_SORT_MAP: Record<string, InternalSort> = {
    'price-asc': 'priceAsc',
    'price-desc': 'priceDesc',
    'rating-desc': 'ratingDesc',
  };
  const sortNormalized = typeof raw.sort === 'string' && raw.sort in HYPHENATED_SORT_MAP
    ? HYPHENATED_SORT_MAP[raw.sort]
    : raw.sort;

  const matchedSort = VALID_SORT_OPTIONS.find(v => v === sortNormalized);
  if (matchedSort !== undefined) {
    // ProductQuery.sort (SortOption) ∩ InternalSort = never in TS6; cast to the intended write type.
    (query as { sort?: InternalSort }).sort = matchedSort;
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

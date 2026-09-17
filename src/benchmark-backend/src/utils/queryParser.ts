import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

const SORT_ALIAS_MAP: Record<string, InternalSort> = {
  'price-asc': 'priceAsc',
  'price-desc': 'priceDesc',
  'rating-desc': 'ratingDesc',
};

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

  const resolvedSort = typeof raw.sort === 'string' ? (SORT_ALIAS_MAP[raw.sort] ?? raw.sort) : raw.sort;
  if (VALID_SORT_OPTIONS.includes(resolvedSort as InternalSort)) {
    // ProductQuery.sort uses underscore SortOption while InternalSort is camelCase; the
    // intersection type resolves to never. Cast through the InternalSort view to assign.
    (query as { sort?: InternalSort }).sort = resolvedSort as InternalSort;
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

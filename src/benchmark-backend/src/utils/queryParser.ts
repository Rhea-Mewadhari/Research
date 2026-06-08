import type { ProductQuery, SortOption } from '../types/product';

const VALID_SORT_OPTIONS: SortOption[] = ['price_asc', 'price_desc', 'name_asc', 'name_desc'];

export function parseProductQuery(raw: Record<string, unknown>): ProductQuery {
  const query: ProductQuery = {};

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

  if (VALID_SORT_OPTIONS.includes(raw.sort as SortOption)) {
    query.sort = raw.sort as SortOption;
  }

  return query;
}

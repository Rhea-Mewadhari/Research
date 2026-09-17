# Milestone

Task: task1
Target: backend

## Requirements addressed
- Req 1 (sort price-asc): verified — "sorts by price ascending (frontend format)" PASSED (18/18 tests pass)
- Req 2 (sort price-desc): verified — "sorts by price descending (frontend format)" PASSED (18/18 tests pass)
- Req 3 (sort rating-desc): verified — "sorts by rating descending (frontend format)" PASSED (18/18 tests pass)
- Req 4 (hyphen→camelCase mapping in parseProductQuery): verified — requirements 1–3 all pass, confirming HYPHEN_SORT_MAP applied before VALID_SORT_OPTIONS check
- Req 5 (envelope fields total/totalPages): verified — "response envelope contains total and totalPages" and "returns all products with pagination envelope" PASSED
- Req 6 (existing filters unchanged): verified — all filter tests PASSED (category, inStock, search, empty results)
- Req 7 (TypeScript compiles cleanly): verified — pnpm run build exited with code 0
- Req 8 (all visible tests pass): verified — pnpm test: 1 file passed, 18 tests passed, 0 failed

## Files changed
- src/benchmark-backend/src/utils/queryParser.ts: Added HYPHEN_SORT_MAP lookup table; applies mapping to raw sort value before VALID_SORT_OPTIONS membership check
- src/benchmark-backend/src/services/productService.ts: Renamed envelope fields count→total and pages→totalPages; returns { data, total, page, limit, totalPages }

## Checks
- pnpm test: 18 passed, 0 failed
- pnpm run build: pass

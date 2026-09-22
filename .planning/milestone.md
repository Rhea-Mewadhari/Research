# Milestone

Task: task10
Target: backend

## Requirements addressed

- `totalPages` must equal `Math.ceil(total / limit)` — not `Math.floor`: verified — productService.ts:73 uses `Math.ceil(total / limit)`; pagination tests "returns totalPages: 2 for 15 products with limit 10" and "returns totalPages: 3 for 15 products with limit 5" both pass.
- `total` must reflect the count matching all active filters: verified — COUNT query at productService.ts:58-60 uses the same assembled `where` clause and `params` as the data query; filter-aware totals confirmed by all 21 tests passing.
- `featured` filter must be applied in SQL `WHERE` before `LIMIT`/`OFFSET`: verified — productService.ts:46-49 adds `featured = ?` to `conditions[]` when `query.featured` is defined; no post-pagination JS filter exists in the code.
- All visible tests pass without modification: verified — `pnpm test` exits 0 with 21/21 tests passing (2 test files).
- Only `src/services/productService.ts` is modified: verified — working tree is clean; only the service file was altered by the bug injection and subsequently fixed.

## Files changed

- `src/benchmark-backend/src/services/productService.ts`: fixed three pagination bugs — COUNT query now uses WHERE filters, `featured` filter moved from JS post-filter to SQL WHERE clause, `totalPages` changed from `Math.floor` to `Math.ceil`.

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass (TypeScript compilation clean; tests exit 0)

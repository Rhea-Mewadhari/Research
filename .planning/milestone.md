# Milestone

Task: task4
Target: backend

## Requirements addressed

- Requirement 1 (vitest globals): verified — `vitest.config.ts` line 5 sets `globals: true`; all 19 tests in `src/tests/visible/products.test.ts` passed with no `ReferenceError` for any Vitest global.
- Requirement 2 (vitest include pattern): verified — `vitest.config.ts` line 7 sets `include: ['src/**/*.test.ts']`; pnpm test collected `src/tests/visible/products.test.ts` (1 suite, 19 tests); "No test files found" was not printed.
- Requirement 3 (vitest setupFiles path): verified — `vitest.config.ts` line 6 sets `setupFiles: ['./tests/setup.ts']`; no missing-setup-file error was emitted and all 19 tests passed, confirming the fetch stub from `tests/setup.ts` was active.
- Requirement 4 (tsconfig TS5095): verified — `allowImportingTsExtensions` removed from `tsconfig.json`; `pnpm build` exited with code 0 via `tsc -p tsconfig.build.json`, emitting JS under `dist/` with no TS5095 diagnostic.
- Requirement 5 (server PORT fallback): verified — `src/server.ts` line 3 reads `const PORT = Number(process.env.PORT) || 3001`; server logs "Server running on port 3001" when PORT is unset.

## Files changed

- `src/benchmark-backend/vitest.config.ts`: set `globals: true`, `include: ['src/**/*.test.ts']`, `setupFiles: ['./tests/setup.ts']`
- `src/benchmark-backend/tsconfig.json`: removed `allowImportingTsExtensions: true` to eliminate TS5095 incompatibility with `moduleResolution: "node"`
- `src/benchmark-backend/src/server.ts`: added `|| 3001` fallback so `PORT` never resolves to `NaN`

## Checks

- pnpm test: 19 passed, 0 failed
- pnpm run build: pass

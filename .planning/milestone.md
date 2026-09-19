# Milestone

Task: task4
Target: backend

## Requirements addressed
- Req 1 — `vitest.config.ts` `include` glob matches test files: verified — `include: ['src/**/*.test.ts']` confirmed at line 7; test run reports `src/tests/visible/products.test.ts` found and all 19 tests passed (Test Files: 1 passed (1), Tests: 19 passed (19)).
- Req 2 — `vitest.config.ts` sets `globals: true`: verified — `globals: true` at line 5; all 19 tests in `products.test.ts` (which uses `describe`/`it`/`expect` without imports) passed with exit 0; no `ReferenceError: describe is not defined`.
- Req 3 — `vitest.config.ts` `setupFiles` resolves to the existing file: verified — `setupFiles: ['./tests/setup.ts']` at line 6; file confirmed present at `src/benchmark-backend/tests/setup.ts`; all fetch-stub-dependent tests passed, confirming setup ran.
- Req 4 — `tsconfig.json` uses `moduleResolution: "bundler"` (no TS5095): verified — `"moduleResolution": "bundler"` at line 10; `pnpm --dir src/benchmark-backend build` exited 0 with no output; no TS5095 in stdout or stderr.
- Req 5 — `src/server.ts` fallback port `3001` when `PORT` unset: verified — `const PORT = Number(process.env.PORT) || 3001;` at line 3; `node -e` without PORT prints `Port: 3001`; built `dist/server.js` contains identical expression.

## Files changed
- `src/benchmark-backend/vitest.config.ts`: Fixed `include` glob to `src/**/*.test.ts`, set `globals: true`, corrected `setupFiles` path to `./tests/setup.ts`
- `src/benchmark-backend/tsconfig.json`: Changed `moduleResolution` from `"node"` to `"bundler"` to resolve TS5095 incompatibility with `allowImportingTsExtensions: true`
- `src/benchmark-backend/src/server.ts`: Changed `Number(process.env.PORT)` to `Number(process.env.PORT) || 3001` for a numeric fallback when `PORT` is unset

## Checks
- pnpm test: 19 passed, 0 failed
- pnpm run build: pass

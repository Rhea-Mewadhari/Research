# Milestone

Task: task4
Target: backend

## Requirements addressed

- Req 1 — vitest.config.ts include glob matches *.test.ts files: verified — pnpm test lists ✓ src/tests/visible/products.test.ts with 19 passing tests; glob changed from `src/**/*.spec.ts` to `src/**/*.test.ts`
- Req 2 — vitest.config.ts globals set to true: verified — pnpm test ran 19 tests with no ReferenceError or global-not-found errors; `globals: false` changed to `globals: true`
- Req 3 — vitest.config.ts setupFiles path corrected to ./tests/setup.ts: verified — pnpm test produced no "Cannot find module" or ENOENT error; all 19 tests passed including auth middleware tests requiring the fetch stub
- Req 4 — tsconfig.json moduleResolution changed to bundler: verified — pnpm build (tsc -p tsconfig.build.json) exited 0 with no output and no TS5095 error; `"moduleResolution": "node"` changed to `"moduleResolution": "bundler"`
- Req 5 — src/server.ts numeric fallback of 3001 when PORT is absent: verified — running tsx src/server.ts with no PORT env var printed "Server running on port 3001"; `Number(process.env.PORT)` changed to `Number(process.env.PORT) || 3001`

## Files changed

- `src/benchmark-backend/vitest.config.ts`: Fixed include glob (`*.spec.ts` → `*.test.ts`), enabled globals (`false` → `true`), corrected setupFiles path (`./src/tests/setup.ts` → `./tests/setup.ts`)
- `src/benchmark-backend/tsconfig.json`: Changed moduleResolution from `node` to `bundler` to fix invalid TS5095 pairing with allowImportingTsExtensions
- `src/benchmark-backend/src/server.ts`: Added numeric fallback `|| 3001` so PORT defaults to 3001 when env var is absent

## Checks

- pnpm test: 19 passed, 0 failed
- pnpm run build: pass

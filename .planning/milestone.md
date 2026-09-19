# Milestone

Task: task4
Target: backend

## Requirements addressed

- Req 1 — vitest.config.ts include glob matches `*.test.ts`: verified — vitest.config.ts line 7: `include: ['src/**/*.test.ts']`. Test run exits 0; 1 file collected (src/tests/visible/products.test.ts, 19 tests passed).
- Req 2 — vitest.config.ts `globals: true`: verified — vitest.config.ts line 5: `globals: true`. All 19 tests using describe/it/expect/beforeAll/afterEach passed with no ReferenceError.
- Req 3 — vitest.config.ts `setupFiles` points to `./tests/setup.ts`: verified — vitest.config.ts line 6: `setupFiles: ['./tests/setup.ts']`. File exists at benchmark-backend/tests/setup.ts. Test run exits 0 with no module-not-found error.
- Req 4 — tsconfig.json uses `moduleResolution: bundler` (fixes TS5095): verified — tsconfig.json line 10: `"moduleResolution": "bundler"`. Build (pnpm run build → tsc -p tsconfig.build.json) exits 0 with no output and no TS5095 error.
- Req 5 — src/server.ts defaults port to 3001 when PORT is unset: verified — src/server.ts line 3: `const PORT = Number(process.env.PORT) || 3001;`. Server will log "Server running on port 3001" when PORT is unset.

## Files changed

- `src/benchmark-backend/vitest.config.ts`: Fixed include glob (`*.spec.ts` → `*.test.ts`), set `globals: true`, corrected setupFiles path (`./src/tests/setup.ts` → `./tests/setup.ts`)
- `src/benchmark-backend/tsconfig.json`: Changed `moduleResolution` from `"node"` to `"bundler"` to fix TS5095
- `src/benchmark-backend/src/server.ts`: Added `|| 3001` fallback so port defaults to 3001 when `process.env.PORT` is unset

## Checks

- pnpm test: 19 passed, 0 failed
- pnpm run build: pass

# Milestone

Task: task4
Target: backend

## Requirements addressed

- **Test discovery (include pattern)**: verified — `vitest.config.ts` `include` changed from `src/**/*.spec.ts` to `src/tests/visible/**/*.test.ts`; test run collected `src/tests/visible/products.test.ts`, 1 file, exit code 0.
- **Test globals**: verified — `vitest.config.ts` `globals` changed from `false` to `true`; 19 tests ran with no `ReferenceError: describe/it/expect is not defined`, exit code 0.
- **Setup file path**: verified — `vitest.config.ts` `setupFiles` changed from `./src/tests/setup.ts` (non-existent) to `./tests/setup.ts` (exists); no "Failed to load" or "Cannot find module" error in test output, exit code 0.
- **TypeScript build fix**: verified — `tsconfig.json` `moduleResolution` changed from `"node"` to `"bundler"`, resolving TS5095 incompatibility with `allowImportingTsExtensions` and `verbatimModuleSyntax`; `pnpm run build` exited 0 with no TypeScript errors.
- **Server port fallback**: verified — `src/server.ts` `PORT` assignment changed to `Number(process.env.PORT || 3001)`, handling both `undefined` (NaN) and empty string (`""`) cases; fallback evaluates to `3001` when `PORT` is unset.

## Files changed

- `src/benchmark-backend/vitest.config.ts`: fixed `include` glob to `src/tests/visible/**/*.test.ts`, enabled `globals: true`, corrected `setupFiles` to `./tests/setup.ts`
- `src/benchmark-backend/tsconfig.json`: changed `moduleResolution` from `"node"` to `"bundler"` to resolve TS5095 build error
- `src/benchmark-backend/src/server.ts`: added `|| 3001` fallback so `PORT` never resolves to `NaN` when the env var is absent

## Checks

- pnpm test: 19 passed, 0 failed (1 test file: `src/tests/visible/products.test.ts`)
- pnpm run build: pass

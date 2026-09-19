# Project

Task: task4
Target: backend

## Idea

Three misconfigured files are breaking the CI pipeline: `vitest.config.ts` has the wrong test glob pattern (`*.spec.ts` instead of `*.test.ts`), disabled globals, and a non-existent setup file path; `tsconfig.json` has an invalid option combination (`moduleResolution: "node"` in what is described as "Bundler mode", which should be `"bundler"`); and `src/server.ts` reads `process.env.PORT` without a numeric fallback, causing `NaN` when the env var is absent. All three files need targeted fixes — no changes to business logic, routes, controllers, or services.

## Spec pointers

- `src/benchmark-backend/instructions/TASK4.md`: defines all five requirements (test discovery, test globals, setup file path, TypeScript build fix, server port fallback) and lists the three files to modify

## Affected areas (initial read, not final)

- `src/benchmark-backend/vitest.config.ts`: `include` pattern is `src/**/*.spec.ts` (wrong glob and wrong extension), `globals` is `false`, `setupFiles` points to `./src/tests/setup.ts` which does not exist
- `src/benchmark-backend/tsconfig.json`: `moduleResolution` is `"node"` but the bundler-mode comment and companion options (`allowImportingTsExtensions`, `verbatimModuleSyntax`) require `"bundler"`; this invalid combination causes TS5095 on `pnpm build`
- `src/benchmark-backend/src/server.ts`: `Number(process.env.PORT)` with no fallback resolves to `NaN` when `PORT` is unset; must default to `3001`
- `src/benchmark-backend/tests/setup.ts`: the correct setup file (exists here, not at `src/tests/setup.ts`)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: the visible test file that must be discovered by Vitest

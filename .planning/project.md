# Project

Task: task4
Target: backend

## Idea

Three misconfigured files broke the CI pipeline: `vitest.config.ts` has the wrong test-file glob pattern (`*.spec.ts` instead of `*.test.ts`), disables globals, and points `setupFiles` to a path that does not exist (`./src/tests/setup.ts` instead of `./tests/setup.ts`); `tsconfig.json` contains an invalid option combination (likely `"allowImportingTsExtensions": true` paired with `"moduleResolution": "node"`, which is not a valid pairing) causing TS5095 during `pnpm build`; and `src/server.ts` converts `process.env.PORT` to a number without a numeric fallback, so the server starts on `NaN` when the variable is absent. No business logic, routes, controllers, or services need to change.

## Spec pointers

- `src/benchmark-backend/instructions/TASK4.md`: Full task description — lists symptoms, requirements, and which files to modify

## Affected areas (initial read, not final)

- `src/benchmark-backend/vitest.config.ts`: Wrong `include` glob, `globals: false`, and wrong `setupFiles` path
- `src/benchmark-backend/tsconfig.json`: Invalid compiler option combination causing TS5095 on `pnpm build`
- `src/benchmark-backend/tsconfig.build.json`: Extends `tsconfig.json`; sets `allowImportingTsExtensions: false` and `noEmit: false` for emit — fixing the base tsconfig must keep the build config valid
- `src/benchmark-backend/src/server.ts`: Missing numeric fallback for `process.env.PORT` (defaults to port `3001`)
- `src/benchmark-backend/tests/setup.ts`: The correct setup file location that vitest must load
- `src/benchmark-backend/src/tests/visible/products.test.ts`: The test file that must be discovered and pass

# Project

Task: task4
Target: backend

## Idea

Three configuration files were accidentally broken, causing the CI pipeline to fail on all fronts: Vitest cannot discover tests (wrong `include` glob and missing setup file path), TypeScript build fails with TS5095 due to an invalid option combination (`allowImportingTsExtensions` requires `noEmit: true` but conflicts with `moduleResolution: node` — the issue is that `allowImportingTsExtensions` requires `moduleResolution` to be `bundler` or similar, not `node`), and the Express server binds to `NaN` because `process.env.PORT` is cast to `Number` with no fallback when the variable is absent. No business logic changes are needed; only config fixes.

## Spec pointers

- `src/benchmark-backend/instructions/TASK4.md`: Defines all five requirements — test discovery glob, globals flag, setup file path, tsconfig invalid option, and server port fallback

## Affected areas (initial read, not final)

- `src/benchmark-backend/vitest.config.ts`: `include` pattern is `src/**/*.spec.ts` but tests use `*.test.ts` in `src/tests/visible/`; `globals` is `false` but must be `true`; `setupFiles` points to `./src/tests/setup.ts` (non-existent) instead of the correct path
- `src/benchmark-backend/tsconfig.json`: `allowImportingTsExtensions: true` is incompatible with `moduleResolution: node` — TS5095 requires bundler-mode resolution; also `noEmit: true` is set which blocks emit but may not be the root cause
- `src/benchmark-backend/src/server.ts`: `Number(process.env.PORT)` produces `NaN` when `PORT` is unset — needs `|| 3001` fallback

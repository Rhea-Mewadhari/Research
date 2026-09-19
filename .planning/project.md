# Project

Task: task4
Target: backend

## Idea

Three configuration files in the backend were accidentally broken, causing CI failures across test discovery, TypeScript compilation, and server startup. The application logic is entirely intact. The fix requires: (1) correcting the Vitest config so it finds `*.test.ts` files in `tests/visible/`, enables globals, and points `setupFiles` to `./tests/setup.ts`; (2) removing the invalid `allowImportingTsExtensions`+`noEmit` combination (or the conflicting option) from `tsconfig.json` that triggers TS5095; and (3) adding a numeric fallback of `3001` to the `PORT` parsing in `src/server.ts` so the server does not bind to `NaN` when `PORT` is unset.

## Spec pointers

- `benchmark-backend/instructions/TASK4.md`: Full task description covering all three failure symptoms, the five numbered requirements, the three expected files to modify, and the success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-backend/vitest.config.ts`: `globals` is `false` (should be `true`), `setupFiles` path points to non-existent `./src/tests/setup.ts` (should be `./tests/setup.ts`), `include` pattern is `src/**/*.spec.ts` (should be `src/tests/visible/**/*.test.ts` or equivalent to match actual test location)
- `src/benchmark-backend/tsconfig.json`: `allowImportingTsExtensions` requires `noEmit: true` OR a bundler-mode `moduleResolution`, but the combination with the build target is invalid — TS5095 indicates the option is incompatible with the current settings; `noEmit: true` prevents the build from emitting output, which conflicts with `pnpm build`
- `src/benchmark-backend/src/server.ts`: `Number(process.env.PORT)` returns `NaN` when `PORT` is absent — needs `|| 3001` fallback
- `src/benchmark-backend/tests/setup.ts`: Correct setup file location (exists, just wrongly referenced in config)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: The actual test file that Vitest must discover

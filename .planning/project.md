# Project

Task: task4
Target: backend

## Idea

The CI pipeline is broken due to three misconfigured files — no application logic changes are needed. The Vitest config has the wrong test `include` glob (`.spec.ts` instead of `.test.ts`), `globals` set to `false` (must be `true`), and a `setupFiles` path pointing to a non-existent location (`./src/tests/setup.ts` instead of `./tests/setup.ts`). The `tsconfig.json` uses `allowImportingTsExtensions: true` with `moduleResolution: "node"`, which is the invalid combination that triggers TS5095 — the resolution mode must be `"bundler"`. The server reads `process.env.PORT` with no numeric fallback, so when `PORT` is unset the port resolves to `NaN`; the fix is to default to `3001`.

## Spec pointers

- `src/benchmark-backend/instructions/TASK4.md`: Full requirements — test discovery, globals, setup file path, TypeScript build fix (TS5095), and server port default (3001)

## Affected areas (initial read, not final)

- `src/benchmark-backend/vitest.config.ts`: Wrong `include` glob (`.spec.ts`→`.test.ts`), `globals: false`→`true`, bad `setupFiles` path (`./src/tests/setup.ts`→`./tests/setup.ts`)
- `src/benchmark-backend/tsconfig.json`: `moduleResolution: "node"` incompatible with `allowImportingTsExtensions: true` — must change to `"bundler"` to resolve TS5095
- `src/benchmark-backend/src/server.ts`: `Number(process.env.PORT)` produces `NaN` when `PORT` is unset — must add `|| 3001` fallback
- `src/benchmark-backend/tests/setup.ts`: Correct location of the setup file (read-only reference, not to be modified)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Test file that must be discovered (read-only reference, not to be modified)

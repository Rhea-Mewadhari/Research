# Requirements

1. `vitest.config.ts` must set `globals: true` so that `describe`, `it`, `expect`,
   `beforeAll`, `afterEach`, and other Vitest globals are injected without per-file imports.
   - Verified by: `pnpm test` (run in `src/benchmark-backend/`) completes without
     `ReferenceError: describe is not defined` (or similar `ReferenceError` for any
     Vitest global used in `src/tests/visible/products.test.ts`).

2. `vitest.config.ts` must set `include` to a pattern that matches
   `src/tests/visible/products.test.ts` (e.g. `['src/tests/visible/**/*.test.ts']`).
   The current pattern `src/**/*.spec.ts` does not match the `.test.ts` suffix and
   the wrong directory.
   - Verified by: `pnpm test` output names the file
     `src/tests/visible/products.test.ts` as a collected test suite and does not
     print "No test files found".

3. `vitest.config.ts` must set `setupFiles` to `['./tests/setup.ts']`. The current
   value `'./src/tests/setup.ts'` references a path that does not exist, causing
   Vitest to fail before any test runs.
   - Verified by: `pnpm test` does not emit an error about a missing or unresolvable
     setup file, and the `fetch` stub installed by `tests/setup.ts` is active during
     the test run (confirmed implicitly by all tests in `products.test.ts` passing).

4. `tsconfig.json` must not contain an option combination that causes TS5095 during
   `pnpm build`. Concretely, `allowImportingTsExtensions: true` combined with
   `moduleResolution: "node"` is the invalid pair — remove `allowImportingTsExtensions`
   from `tsconfig.json` (it is already set to `false` in `tsconfig.build.json` which
   is what `pnpm build` uses, but the presence of the option in the base config still
   causes the error).
   - Verified by: `pnpm build` (run in `src/benchmark-backend/`) exits with code 0,
     emits JavaScript files under `dist/`, and produces no TS5095 diagnostic in its
     output.

5. `src/server.ts` must fall back to port `3001` when `process.env.PORT` is absent
   or empty, so that `Number(process.env.PORT)` does not resolve to `NaN`. The fix
   is `const PORT = Number(process.env.PORT) || 3001`.
   - Verified by: starting the server without a `PORT` environment variable (e.g.
     `node --input-type=module <<< "import './src/server.ts'"` via `tsx`, or inspecting
     the source directly) produces console output "Server running on port 3001" and
     does not print "Server running on port NaN".

## Edge cases

- `pnpm test` with no `PORT` env set: covered by requirement 5 (server.ts is not
  exercised during unit tests, but the fix must not break the import used by tests).
- Vitest include pattern matches only `.test.ts` files, not `.spec.ts` or other
  suffixes: covered by requirement 2 (pattern is scoped to `*.test.ts`).
- `allowImportingTsExtensions` removal must not affect `tsconfig.build.json`:
  covered by requirement 4 — `tsconfig.build.json` explicitly sets this option to
  `false`, so removing it from the base does not change the build config's effective
  value.
- Removal of `noEmit: true` from `tsconfig.json` is not required because
  `tsconfig.build.json` already overrides it to `false`; however, if `noEmit` is
  also removed as part of cleaning up the invalid option pair, requirement 4 still
  applies (build must emit output): covered by requirement 4.

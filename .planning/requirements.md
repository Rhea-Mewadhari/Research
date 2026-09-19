# Requirements

1. `vitest.config.ts` `include` glob must match `*.test.ts` files under `src/tests/visible/`
   - The current value `['src/**/*.spec.ts']` must be changed so that Vitest discovers
     test files following the `*.test.ts` convention (e.g. `src/tests/visible/*.test.ts`).
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 and reports at least one
     test suite collected from `src/tests/visible/`.

2. `vitest.config.ts` must have `globals: true` so that `describe`, `it`, `expect`,
   `beforeAll`, `afterEach`, etc. are available in test files without per-file imports.
   - The current value `globals: false` must be changed to `true`.
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 with no
     `ReferenceError: describe is not defined` (or similar) in output.

3. `vitest.config.ts` `setupFiles` must point to the existing setup file at
   `./tests/setup.ts` (not the non-existent `./src/tests/setup.ts`).
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 and does not throw
     `Error: Cannot find module './src/tests/setup.ts'` or equivalent module-not-found
     error during setup.

4. `tsconfig.json` must use `"moduleResolution": "bundler"` instead of `"node"` to
   satisfy the TypeScript constraint that `allowImportingTsExtensions: true` requires
   a bundler-compatible resolution mode (fixes TS5095).
   - Verified by: `pnpm --filter benchmark-backend build` (or `tsc --noEmit`) exits 0
     with no TS5095 error in output.

5. `src/server.ts` must default the port to `3001` when `process.env.PORT` is unset,
   so the server does not bind to `NaN`.
   - The expression `Number(process.env.PORT)` must be changed to
     `Number(process.env.PORT) || 3001`.
   - Verified by: with `PORT` unset, the server process logs
     `Server running on port 3001` on startup (observable via `pnpm --filter
     benchmark-backend dev` or by reading the changed line in `src/server.ts` and
     confirming the literal `3001` fallback is present).

---

## Edge cases

- `.spec.ts` suffix in include glob (req 1): the glob must not accidentally re-include
  `.spec.ts` files alongside `.test.ts`; covered by requirement 1 (pattern targets
  only `*.test.ts`).
- `PORT=0` environment variable (req 5): `Number('0') || 3001` evaluates to `3001`
  because `0` is falsy — this is acceptable because port 0 is not a valid production
  port and the spec only requires the `NaN` case to be fixed to `3001`; covered by
  requirement 5.
- `moduleResolution` side-effects (req 4): changing from `"node"` to `"bundler"` must
  not introduce new TS errors; the existing `tsconfig.json` comment block already
  labels this section "Bundler mode", confirming the intent; covered by requirement 4
  (build must exit 0 overall).
- Non-existent `src/tests/setup.ts` (req 3): the incorrect path must be removed, not
  supplemented; covered by requirement 3 (only `./tests/setup.ts` in `setupFiles`).

# Requirements

1. `vitest.config.ts` `include` glob must match `*.test.ts` files under `src/tests/visible/`
   — the current value `['src/**/*.spec.ts']` matches no existing test files.
   - Verified by: running `pnpm test` inside `src/benchmark-backend/` exits 0 and the
     summary output lists `src/tests/visible/products.test.ts` as a discovered/executed
     test file.

2. `vitest.config.ts` `globals` must be `true` so that `describe`, `it`, `expect`,
   `beforeAll`, `afterEach`, and other Vitest globals are injected without per-file
   imports — the current value `false` causes a `ReferenceError` at runtime.
   - Verified by: running `pnpm test` produces no `ReferenceError: describe is not
     defined` (or any equivalent global-not-found error) in the output.

3. `vitest.config.ts` `setupFiles` path must be corrected from `'./src/tests/setup.ts'`
   to `'./tests/setup.ts'` — the setup file exists at `tests/setup.ts`; the current
   path points to a file that does not exist.
   - Verified by: running `pnpm test` loads the setup file without a "Cannot find
     module" or "ENOENT" error, and the `beforeEach` / `afterEach` hooks defined in
     `tests/setup.ts` execute (global `fetch` is stubbed for every test).

4. `tsconfig.json` must not contain the invalid pairing `"moduleResolution": "node"` +
   `"allowImportingTsExtensions": true` (TS5095). Fix: change `moduleResolution` to
   `"bundler"` (consistent with the existing "Bundler mode" comment in the file).
   `tsconfig.build.json` extends the base and overrides `allowImportingTsExtensions:
   false` + `noEmit: false`; both remain valid with `moduleResolution: "bundler"`.
   - Verified by: running `pnpm build` inside `src/benchmark-backend/` exits 0 with
     no TS5095 (or any other TypeScript) error in stdout/stderr.

5. `src/server.ts` must provide a numeric fallback of `3001` when `process.env.PORT`
   is absent or empty — the current `Number(process.env.PORT)` yields `NaN` when the
   variable is unset.
   - Verified by: starting the server with no `PORT` environment variable set prints
     "Server running on port 3001" to stdout (the log line in `app.listen` callback).

---

## Edge cases

- `PORT` env var set to a valid port (e.g. `4000`): covered by requirement 5 — the
  numeric conversion must still work; `Number('4000') || 3001` → `4000`.
- `PORT` env var set to `'0'`: `Number('0') || 3001` → `3001` (port 0 is not
  meaningful; fallback is acceptable and consistent with the spec's intent).
- `tsconfig.build.json` validity after base fix: covered by requirement 4 — the build
  config's `allowImportingTsExtensions: false` / `noEmit: false` overrides are valid
  under `moduleResolution: "bundler"`.
- Tests in `src/tests/visible/` using Vitest globals without imports: covered by
  requirements 1–3 together — discovery, globals injection, and setup file load must
  all be correct for any test to pass.

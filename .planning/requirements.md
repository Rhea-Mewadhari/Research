# Requirements

1. `vitest.config.ts` `include` glob matches test files that exist — the pattern must be `src/**/*.test.ts` (tests live at `src/tests/visible/products.test.ts` and use the `.test.ts` suffix, not `.spec.ts`).
   - Verified by: `pnpm --dir src/benchmark-backend test` exits 0 and reports at least one test file found (not "No test files found"). Running `vitest run --reporter=verbose` must list `src/tests/visible/products.test.ts` in its output.

2. `vitest.config.ts` sets `globals: true` so that `describe`, `it`, `expect`, `beforeAll`, `beforeEach`, `afterEach`, etc. are available without per-file imports.
   - Verified by: `pnpm --dir src/benchmark-backend test` exits 0 with no `ReferenceError: describe is not defined` (or similar) in output. The test file `src/tests/visible/products.test.ts` uses these globals without imports — any runtime reference error means this requirement is unmet.

3. `vitest.config.ts` `setupFiles` path resolves to the file that actually exists: `./tests/setup.ts` (the file is at `src/benchmark-backend/tests/setup.ts` relative to the project root, i.e. `./tests/setup.ts` relative to `vitest.config.ts`). The current path `./src/tests/setup.ts` points to a non-existent file.
   - Verified by: `pnpm --dir src/benchmark-backend test` exits 0 with no error about a missing or unresolvable setup file. The stub in `tests/setup.ts` must run before each test — confirmed by tests that depend on `vi.stubGlobal('fetch', ...)` passing (any test invoking the data fetcher without the stub would fail or make real network calls).

4. `tsconfig.json` must not contain an invalid option combination that causes TS5095. The current config has `allowImportingTsExtensions: true` alongside `moduleResolution: "node"` — these are incompatible. Fix: change `moduleResolution` to `"bundler"`, which is the resolution mode required when `allowImportingTsExtensions` is enabled.
   - Verified by: `pnpm --dir src/benchmark-backend build` exits 0 with no TypeScript diagnostic output. Specifically, no line containing `TS5095` must appear in stdout or stderr.

5. `src/server.ts` provides a numeric fallback of `3001` when `process.env.PORT` is absent. The current `Number(process.env.PORT)` expression evaluates to `NaN` when the variable is unset.
   - Verified by: running the server without `PORT` set (`node dist/server.js` after a successful build, or `tsx src/server.ts`) and observing the console output `Server running on port 3001` — the port value in the log must not be `NaN`.

---

## Edge cases

- `.spec.ts` glob: requirement 1 explicitly requires `.test.ts`, not `.spec.ts`. A glob that matches both would satisfy discovery but must not be accepted if it changes future test conventions. The precise fix is `src/**/*.test.ts`.
- Missing setup file vs. wrong content: requirement 3 covers path resolution. If the path were correct but the file empty, globals stubbing would silently not run; requirement 3's verification (tests that rely on the fetch stub passing) also catches that.
- `moduleResolution: "bundler"` and build emit: `tsconfig.build.json` extends the base and sets `allowImportingTsExtensions: false` and `noEmit: false`. Changing `moduleResolution` to `"bundler"` in the base must not break the build — verified by requirement 4's build exit code check.
- `Number("")` fallback: if `PORT=""` (empty string), `Number("")` is `0`, not `NaN`. The `|| 3001` fallback covers both `NaN` (unset) and `0` (empty) cases; covered by requirement 5.
- Port `0`: binding to port `0` is a valid OS behaviour (random port). The fallback of `3001` specifically addresses the unset-variable case described in the task; covered by requirement 5.

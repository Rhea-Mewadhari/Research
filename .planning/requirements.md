# Requirements

1. `vitest.config.ts` `include` pattern must be `src/tests/visible/**/*.test.ts` (or equivalent glob that matches `*.test.ts` files under `tests/visible/`), replacing the current `src/**/*.spec.ts`.
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 and the output reports at least one test file collected from `src/tests/visible/`.

2. `vitest.config.ts` `globals` option must be set to `true` so that `describe`, `it`, `expect`, `beforeAll`, and `afterEach` are available in test files without per-file imports.
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 with no `ReferenceError: describe is not defined` (or similar) in output.

3. `vitest.config.ts` `setupFiles` must point to `./tests/setup.ts` (the file that exists), replacing the current `./src/tests/setup.ts` (which does not exist).
   - Verified by: `pnpm --filter benchmark-backend test` exits 0 with no "Failed to load" or "Cannot find module" error referencing the setup file path.

4. `tsconfig.json` `moduleResolution` must be changed from `"node"` to `"bundler"`, resolving the TS5095 error caused by the incompatible combination of `moduleResolution: "node"` with `allowImportingTsExtensions` and `verbatimModuleSyntax`.
   - Verified by: `pnpm --filter benchmark-backend build` exits 0 with no TypeScript errors in stderr.

5. `src/server.ts` must default the port to `3001` when `process.env.PORT` is absent, so that `Number(process.env.PORT)` never resolves to `NaN`.
   - Verified by: running the built server with `PORT` unset and confirming the console output reads `Server running on port 3001`; equivalently, the source must contain `process.env.PORT` with a `|| 3001` or `?? 3001` fallback (or numeric default via an alternative pattern) so that `PORT` evaluates to `3001` when the env var is not set.

## Edge cases

- `PORT` set to an empty string (`PORT=""`): `Number("")` is `0`, not `NaN`. The fallback `|| 3001` handles this by treating `0` as falsy; `?? 3001` does NOT (it only guards `null`/`undefined`). Either `|| 3001` or `Number(process.env.PORT || "3001")` is acceptable; `?? 3001` alone is not, since the task description states the problem is "env var absent" (undefined → NaN). Covered by requirement 5.
- Test files named `*.spec.ts` (old convention): must NOT be discovered after the fix. Covered by requirement 1 (the new glob only matches `*.test.ts`).
- `src/tests/setup.ts` (non-existent path): must not appear in `setupFiles` after the fix. Covered by requirement 3.
- No changes to business logic, routes, controllers, services, or any file under `tests/` or `src/tests/`: all three requirements must be satisfied by editing only `vitest.config.ts`, `tsconfig.json`, and `src/server.ts`. Covered by requirements 1–5 collectively.

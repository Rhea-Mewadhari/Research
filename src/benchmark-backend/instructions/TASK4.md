# Task 4: Configuration & Build Fix

## Objective

The CI pipeline is failing on three fronts: tests are not being discovered, the TypeScript build fails, and the server does not start correctly in production. All failures trace back to misconfigured files — the application logic is intact. Diagnose and fix all configuration issues.

---

## Context

A configuration change was accidentally introduced that broke the test runner, the build step, and server startup. No changes to business logic, routes, controllers, or services are needed.

---

## Symptoms

```
pnpm test    → No test files found, or tests fail immediately with ReferenceError
pnpm build   → TypeScript error (TS5095)
pnpm dev     → Server binds to the wrong port (NaN)
```

---

## Requirements

### 1. Test discovery
- Tests live in `tests/visible/` and follow the `*.test.ts` naming convention
- Vitest must discover and run them — the current `include` pattern is wrong

### 2. Test globals
- `describe`, `it`, `expect`, `beforeAll`, `afterEach` etc. must be available globally without per-file imports
- The `globals` option in `vitest.config.ts` controls this

### 3. Test setup file
- `tests/setup.ts` stubs the global `fetch` before each test
- It must be loaded via `setupFiles` — the current path points to a file that does not exist

### 4. TypeScript build
- `pnpm build` must complete without errors
- `tsconfig.json` contains an invalid option combination — identify and fix it

### 5. Server port
- `src/server.ts` reads `process.env.PORT` but provides no numeric fallback
- When the environment variable is absent the port resolves to `NaN`
- Default to port `3001`

---

## Expected Files to Modify

- `vitest.config.ts`
- `tsconfig.json`
- `src/server.ts`

---

## Success Criteria

- `pnpm test` runs and all tests pass
- `pnpm build` completes without TypeScript errors
- Server starts on port `3001` when `PORT` is not set in the environment

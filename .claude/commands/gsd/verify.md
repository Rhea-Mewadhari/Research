# Phase 4 — Verify

After each atomic change, run the checks below and interpret the results before continuing.

---

## Check sequence

Run in order. Stop on first failure and fix before proceeding.

### 1. Visible tests

```bash
pnpm test
```

Visible tests are at:
- Frontend: `benchmark-frontend/tests/`
- Backend: `benchmark-backend/src/tests/visible/`

### 2. Build

```bash
pnpm run build
```

### 3. Lint (if the script exists)

```bash
pnpm run lint
```

---

## Interpreting results

| Result | Action |
|---|---|
| All tests pass, build passes | Proceed to Phase 5 (Review) |
| Test failure caused by current change | Fix the change; re-run from step 1 |
| Test failure that existed before the change | Document it; do not fix unless the spec requires it |
| Build error | Fix before proceeding |
| Lint error that blocks build | Fix before proceeding |
| Lint warning that does not block | Document and continue |
| Script not found / tool not installed | Document the reason; proceed with a note |

---

## Gate

Do not proceed to Phase 5 if:

- Any test that was passing before this change is now failing
- The build fails

A change is not complete until it leaves the codebase in at least as good a state as before.

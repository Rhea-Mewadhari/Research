# Benchmark Admin Usage Guide

This folder contains the private benchmark harness for the frontend benchmark tasks.

It is used to:

- inject seeded bugs into the benchmark repo
- run hidden evaluation tests
- keep evaluation assets separate from the agent-facing repository

---

## Folder Purpose

### `benchmark-frontend/`
This is the repository given to the agent.

It contains:
- the application code
- visible tests
- the task instruction file used by the agent

The agent should only work inside this repo.

### `admin-benchmark/`
This is the private evaluation harness.

It contains:
- bug injection scripts
- hidden evaluation tests
- test configuration used only by the evaluator

The agent should **not** have access to this folder.

---

## Expected Structure

```text
src/
├─ admin-benchmark/
│  ├─ hidden-tests/
│  ├─ inject-logical-bug.js
│  ├─ inject-syntax-bug.js
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ setup.ts
│  └─ USAGE.md
└─ benchmark-frontend/
```

---

## General Workflow

For each benchmark run:

1. Start from a clean copy of `benchmark-frontend`
2. Inject the required bug seed if the task is a bug-fix task
3. Give the agent the task instructions
4. Let the agent modify only `benchmark-frontend`
5. Run visible tests in `benchmark-frontend`
6. Run hidden tests from `admin-benchmark`
7. Record the results

---

## Bug Injection

Bug injection is only needed for seeded bug-fix tasks such as:

- Frontend Logical Bug Fix
- Frontend Syntax Bug Fix

It is **not** needed for the original feature implementation task unless you deliberately want to alter the baseline.

### Logical bug injection

Run this from `src/admin-benchmark`:

```bash
node inject-logical-bug.js ../benchmark-frontend
```

This injects deterministic logical issues such as:
- case-sensitive search
- search without trimming whitespace
- incorrect filter/sort interaction
- clear filters not resetting sort

### Syntax bug injection

Run this from `src/admin-benchmark`:

```bash
node inject-syntax-bug.js ../benchmark-frontend
```

This injects deterministic syntax/runtime issues such as:
- malformed JSX
- broken event typing

---

## Important Bug Injection Rules

- Always inject bugs into a **clean** benchmark repo
- Do not stack multiple injections unless the task explicitly requires that
- Use the same injection script for every run of the same task
- Do not manually edit injected bugs between runs, or reproducibility is weakened

---

## Running Visible Tests

Visible tests are run inside the benchmark repo because they are part of the agent-facing task.

From `src/benchmark-frontend`:

```bash
npm install
npm test
```

If you want to run the build as well:

```bash
npm run build
```

---

## Running Hidden Tests

Hidden tests are run from `admin-benchmark`, but they evaluate the code inside `benchmark-frontend`.

There are two common ways to do this.

---

## Option A: Copy hidden tests into the benchmark repo temporarily

This is the simplest approach.

### Example flow

From `src/admin-benchmark`:

```bash
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/
cd ../benchmark-frontend
npm test
```

### Notes

- This is easy to automate
- Hidden tests should not be committed into the benchmark repo
- After the run, remove the copied hidden test files if needed

Example cleanup:

```bash
rm tests/hidden.*.test.tsx
```

---

## Option B: Maintain a separate hidden-test test runner

This is cleaner long-term, but requires your admin benchmark package to resolve imports against `benchmark-frontend`.

Use this if you want the admin harness to stay completely independent.

In that setup:
- `admin-benchmark` owns the Vitest config
- hidden tests import from `../benchmark-frontend/src/...` or similar adjusted paths
- tests are executed entirely from `admin-benchmark`

Only use this if your path resolution is already working correctly.

---

## Recommended Practical Approach

For now, use **Option A**.

It is simpler, easier to debug, and good enough for a controlled benchmark as long as:

- the hidden tests are stored privately
- the copied files are never exposed to the agent
- each run starts from a clean repo state

---

## Example End-to-End Run

### Task 1: Frontend Feature Implementation
No bug injection required.

```bash
cd src/benchmark-frontend
npm install
npm test
npm run build

cd ../admin-benchmark
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/

cd ../benchmark-frontend
npm test
```

---

### Task 2: Frontend Logical Bug Fix

```bash
cd src/admin-benchmark
node inject-logical-bug.js ../benchmark-frontend

cd ../benchmark-frontend
npm install
npm test
npm run build
```

After the agent completes the task:

```bash
cd ../admin-benchmark
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/

cd ../benchmark-frontend
npm test
```

---

### Task 3: Frontend Syntax Bug Fix

```bash
cd src/admin-benchmark
node inject-syntax-bug.js ../benchmark-frontend
```

After the agent completes the task:

```bash
cd ../benchmark-frontend
npm test
npm run build
```

Then run hidden tests:

```bash
cd ../admin-benchmark
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/

cd ../benchmark-frontend
npm test
```

---

## Suggested Per-Run Sequence

For consistency, use this order:

1. Clean/reset benchmark repo
2. Inject bug if required
3. Provide task instructions to agent
4. Capture agent output and modified files
5. Run visible tests
6. Run hidden tests
7. Run build
8. Archive logs and results

---

## Resetting Between Runs

Each run should begin from the same clean baseline.

Recommended options:
- reset using Git
- use a fresh branch
- copy from a pristine baseline folder
- use a clean temporary working directory

Example with Git:

```bash
cd src/benchmark-frontend
git reset --hard
git clean -fd
```

Do this before each new run.

---

## Hidden Test Coverage

The hidden tests are designed to catch behaviors not fully covered by the visible tests, including:

- case-insensitive search
- trimming whitespace in search
- combining search + category + in-stock correctly
- clear filters resetting sorting
- empty-state rendering
- default ordering preservation
- non-mutation of the original products array
- accessibility by label text
- correct behavior for category `All`
- ensuring search matches product name only
- absence of console warnings/errors during interaction

---

## Reproducibility Notes

To keep the benchmark reproducible:

- use the same starting repo for every run
- use the same injection script for the same task
- do not alter hidden tests between runs
- isolate every run from prior outputs
- record visible and hidden test results separately

---

## Common Mistakes to Avoid

### 1. Running bug injection on a dirty repo
This makes runs inconsistent.

### 2. Giving hidden tests to the agent
This invalidates the benchmark.

### 3. Modifying the dataset between runs
This changes task difficulty.

### 4. Using different bug seeds for the same benchmark task
This makes framework comparison weaker.

### 5. Forgetting to clean up copied hidden tests
This can leak hidden evaluation assets into the benchmark repo.

---

## Minimal Command Summary

### Inject logical bugs
```bash
cd src/admin-benchmark
node inject-logical-bug.js ../benchmark-frontend
```

### Inject syntax bugs
```bash
cd src/admin-benchmark
node inject-syntax-bug.js ../benchmark-frontend
```

### Run visible tests
```bash
cd src/benchmark-frontend
npm test
```

### Run build
```bash
cd src/benchmark-frontend
npm run build
```

### Run hidden tests by copying them in temporarily
```bash
cd src/admin-benchmark
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/
cd ../benchmark-frontend
npm test
```

### Clean copied hidden tests
```bash
rm tests/hidden.*.test.tsx
```

---

## Final Note

This folder is part of the **evaluation harness**, not the benchmark task itself.

Keep it private, stable, and consistent across all runs.
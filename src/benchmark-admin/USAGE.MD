# Benchmark Admin Usage

This folder contains the private evaluation harness for the frontend benchmark.

It is used to:
- inject bugs into the benchmark repo
- run hidden evaluation tests
- execute the scoring harness

---

## Structure

```text
src/
├─ admin-benchmark/
│  ├─ hidden-tests/
│  ├─ inject-logical-bug.js
│  ├─ inject-syntax-bug.js
│  ├─ run-benchmark.js
│  └─ ...
└─ benchmark-frontend/
```

- `benchmark-frontend` → system under test (agent works here)
- `admin-benchmark` → private evaluation (agent must NOT access)

---

## Standard Run Flow

For each run:

1. Reset repo
2. Inject bug (if required)
3. Run agent (outside this harness)
4. Run benchmark harness
5. Store results

---

## 1. Reset Repo

```bash
cd src/benchmark-frontend
git reset --hard
git clean -fd
```

---

## 2. Bug Injection (only for bug tasks)

### Logical bugs
```bash
cd src/admin-benchmark
node inject-logical-bug.js ../benchmark-frontend
```

### Syntax bugs
```bash
cd src/admin-benchmark
node inject-syntax-bug.js ../benchmark-frontend
```

---

## 3. Run Benchmark Harness

Run AFTER the agent completes the task.

```bash
cd src/admin-benchmark
node run-benchmark.js <taskId> <runId>
```

Example:
```bash
node run-benchmark.js task1_frontend_feature run_001
```

---

## What the Harness Does

`run-benchmark.js` automatically:

1. Runs **visible tests**
2. Copies hidden tests into the repo
3. Runs **hidden tests**
4. Removes hidden tests
5. Runs **build**
6. Writes logs + summary JSON

---

## Hidden Test Execution (Option A)

Hidden tests are temporarily copied into the repo:

```bash
cp hidden-tests/*.test.tsx ../benchmark-frontend/tests/
```

Then executed via Vitest.

They are automatically removed after execution.

---

## Output

Results are stored in:

```text
src/admin-benchmark/results/
```

Each run produces:

```text
results/<taskId>__<runId>/
├─ summary.json
├─ visible-tests.stdout.txt
├─ hidden-tests.stdout.txt
├─ build.stdout.txt
└─ ...
```

---

## Summary Format

Example:

```json
{
  "taskId": "task1_frontend_feature",
  "runId": "run_001",
  "build": { "success": true },
  "visibleTests": {
    "success": true,
    "passed": 6,
    "failed": 0,
    "total": 6
  },
  "hiddenTests": {
    "success": true,
    "passed": 11,
    "failed": 0,
    "total": 11
  },
  "overall": { "success": true },
  "timing": {
    "visibleMs": 2100,
    "hiddenMs": 2600,
    "buildMs": 1800,
    "totalMs": 6500
  }
}
```

---

## Key Rules

- Always start from a clean repo
- Use the same bug injection per task
- Do NOT expose hidden tests to the agent
- Do NOT modify hidden tests between runs
- Keep runs isolated

---

## Minimal Commands

### Inject bugs
```bash
node inject-logical-bug.js ../benchmark-frontend
node inject-syntax-bug.js ../benchmark-frontend
```

### Run benchmark
```bash
node run-benchmark.js taskId runId
```

---

## Notes

- Visible tests = task-facing validation  
- Hidden tests = robustness validation  
- Build = runtime/syntax correctness  

All three determine overall success.
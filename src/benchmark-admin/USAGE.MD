Here’s the **updated, clean version** with backend support + new harness flow (concise, no clutter):

---

# **Benchmark Admin Usage**

This folder contains the private evaluation harness for **frontend + backend benchmarks**.

It is used to:

* inject bugs into benchmark repos
* run hidden evaluation tests
* execute the scoring harness

---

## **Structure**

```text
src/
├─ benchmark-admin/
│  ├─ hidden-tests/
│  │  ├─ frontend/
│  │  └─ backend/
│  ├─ bug-injections/
│  │  ├─ frontend/
│  │  └─ backend/
│  ├─ run-benchmark.js
│  └─ results/
├─ benchmark-frontend/
└─ benchmark-backend/
```

* `benchmark-frontend` → frontend system under test
* `benchmark-backend` → backend system under test
* `benchmark-admin` → private evaluator (agent must NOT access)

---

## **Standard Run Flow**

For each run:

1. Reset repo
2. (Optional) Inject bugs via harness
3. Run agent (outside harness)
4. Run benchmark harness
5. Store results

---

## **1. Reset Repo**

### Frontend

```bash
cd src/benchmark-frontend
git reset --hard
git clean -fd
```

### Backend

```bash
cd src/benchmark-backend
git reset --hard
git clean -fd
```

---

## **2. Run Benchmark Harness**

Run AFTER the agent completes the task.

```bash
cd src/benchmark-admin
node run-benchmark.js <taskId> <runId> <target> [bugType]
```

---

### **Examples**

#### Frontend (no bugs)

```bash
node run-benchmark.js task1_feature run_001 frontend
```

#### Backend (no bugs)

```bash
node run-benchmark.js task1_feature run_001 backend
```

#### Backend with logical bugs

```bash
node run-benchmark.js task2_bugfix run_001 backend logical
```

#### Backend with syntax bugs

```bash
node run-benchmark.js task3_syntax run_001 backend syntax
```

---

## **What the Harness Does**

`run-benchmark.js` automatically:

1. (Optional) injects bugs
2. Runs **visible tests**
3. Copies hidden tests into the repo
4. Runs **hidden tests**
5. Removes hidden tests
6. Runs **build**
7. Writes logs + summary JSON

---

## **Hidden Test Execution**

Hidden tests are copied based on target:

```text
hidden-tests/frontend → benchmark-frontend/tests/
hidden-tests/backend  → benchmark-backend/tests/
```

They are:

* executed via test runner
* automatically removed after execution

---

## **Output**

Results are stored in:

```text
src/benchmark-admin/results/
```

Each run:

```text
results/<taskId>__<runId>/
├─ summary.json
├─ visible-tests.stdout.txt
├─ hidden-tests.stdout.txt
├─ build.stdout.txt
└─ ...
```

---

## **Summary Format**

```json
{
  "taskId": "task1_feature",
  "runId": "run_001",
  "target": "backend",
  "bugType": "logical",
  "build": { "success": true },
  "visibleTests": { "passed": 4, "failed": 2, "total": 6 },
  "hiddenTests": { "passed": 8, "failed": 3, "total": 11 },
  "overall": { "success": false },
  "timing": {
    "visibleMs": 2100,
    "hiddenMs": 2600,
    "buildMs": 1800,
    "totalMs": 6500
  }
}
```

---

## **Key Rules**

* Always start from a clean repo
* Use consistent bug injection per task
* Do NOT expose hidden tests
* Do NOT modify hidden tests between runs
* Keep runs isolated

---

## **Minimal Commands**

```bash
node run-benchmark.js taskId runId frontend
node run-benchmark.js taskId runId backend
node run-benchmark.js taskId runId backend logical
node run-benchmark.js taskId runId backend syntax
```

---

## **Notes**

* Visible tests → basic correctness
* Hidden tests → robustness + edge cases
* Build → syntax/runtime validity

All three determine final outcome.

# Research Benchmark

Compares two agentic frameworks — **GSD** (specification-first) and **Wiggum** (goal-directed loop) — across frontend and backend coding tasks. Each run measures correctness (test pass rates, build stability) and resource usage (token cost, turn count).

---

## Execution Protocol

Each experiment is a two-part process: manual setup (git isolation) followed by the automated pipeline.

### 1. Manual setup

```powershell
git reset --hard; git clean -fd
git checkout -b run/<framework>/<taskId>/<runId>
```

### 2. Run the experiment

```powershell
node src/benchmark-admin/run-experiment.js <taskId> <runId> <target> <framework> [bugType]
```

The script runs automatically:
- Bug injection (if `bugType` provided) → pre-agent static analysis → agent execution → benchmark scoring → post-agent static analysis → quality delta

### 3. Commit the outputs

```powershell
git add src/benchmark-<target> src/benchmark-admin/results/<taskId>__<runId>
git commit -m "run: <framework> <taskId> <runId> (<target>)"
```

---

## All Experiment Runs

### Frontend

---

#### Task 1 — Feature Implementation

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task1/gsd-run1
node src/benchmark-admin/run-experiment.js task1 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task1__gsd-run1
git commit -m "run: gsd task1 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task1/wiggum-run1
node src/benchmark-admin/run-experiment.js task1 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task1__wiggum-run1
git commit -m "run: wiggum task1 wiggum-run1 (frontend)"
```

---

#### Task 2 — Logical Bug Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task2/gsd-run1
node src/benchmark-admin/run-experiment.js task2 gsd-run1 frontend gsd logical
git add src/benchmark-frontend src/benchmark-admin/results/task2__gsd-run1
git commit -m "run: gsd task2 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task2/wiggum-run1
node src/benchmark-admin/run-experiment.js task2 wiggum-run1 frontend wiggum logical
git add src/benchmark-frontend src/benchmark-admin/results/task2__wiggum-run1
git commit -m "run: wiggum task2 wiggum-run1 (frontend)"
```

---

#### Task 3 — Syntax Bug Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task3/gsd-run1
node src/benchmark-admin/run-experiment.js task3 gsd-run1 frontend gsd syntax
git add src/benchmark-frontend src/benchmark-admin/results/task3__gsd-run1
git commit -m "run: gsd task3 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task3/wiggum-run1
node src/benchmark-admin/run-experiment.js task3 wiggum-run1 frontend wiggum syntax
git add src/benchmark-frontend src/benchmark-admin/results/task3__wiggum-run1
git commit -m "run: wiggum task3 wiggum-run1 (frontend)"
```

---

#### Task 4 — Refactoring

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task4/gsd-run1
node src/benchmark-admin/run-experiment.js task4 gsd-run1 frontend gsd refactor
git add src/benchmark-frontend src/benchmark-admin/results/task4__gsd-run1
git commit -m "run: gsd task4 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task4/wiggum-run1
node src/benchmark-admin/run-experiment.js task4 wiggum-run1 frontend wiggum refactor
git add src/benchmark-frontend src/benchmark-admin/results/task4__wiggum-run1
git commit -m "run: wiggum task4 wiggum-run1 (frontend)"
```

---

#### Task 5 — Test Generation

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task5/gsd-run1
node src/benchmark-admin/run-experiment.js task5 gsd-run1 frontend gsd testgen
git add src/benchmark-frontend src/benchmark-admin/results/task5__gsd-run1
git commit -m "run: gsd task5 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task5/wiggum-run1
node src/benchmark-admin/run-experiment.js task5 wiggum-run1 frontend wiggum testgen
git add src/benchmark-frontend src/benchmark-admin/results/task5__wiggum-run1
git commit -m "run: wiggum task5 wiggum-run1 (frontend)"
```

---

#### Task 6 — Integration (Async Data)

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task6/gsd-run1
node src/benchmark-admin/run-experiment.js task6 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task6__gsd-run1
git commit -m "run: gsd task6 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task6/wiggum-run1
node src/benchmark-admin/run-experiment.js task6 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task6__wiggum-run1
git commit -m "run: wiggum task6 wiggum-run1 (frontend)"
```

---

#### Task 7 — Context Migration

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task7/gsd-run1
node src/benchmark-admin/run-experiment.js task7 gsd-run1 frontend gsd context-migration
git add src/benchmark-frontend src/benchmark-admin/results/task7__gsd-run1
git commit -m "run: gsd task7 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task7/wiggum-run1
node src/benchmark-admin/run-experiment.js task7 wiggum-run1 frontend wiggum context-migration
git add src/benchmark-frontend src/benchmark-admin/results/task7__wiggum-run1
git commit -m "run: wiggum task7 wiggum-run1 (frontend)"
```

---

#### Task 8 — Debounce Implementation

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task8/gsd-run1
node src/benchmark-admin/run-experiment.js task8 gsd-run1 frontend gsd debounce
git add src/benchmark-frontend src/benchmark-admin/results/task8__gsd-run1
git commit -m "run: gsd task8 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task8/wiggum-run1
node src/benchmark-admin/run-experiment.js task8 wiggum-run1 frontend wiggum debounce
git add src/benchmark-frontend src/benchmark-admin/results/task8__wiggum-run1
git commit -m "run: wiggum task8 wiggum-run1 (frontend)"
```

---

#### Task 9 — Optimistic UI (Favourite Revert)

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task9/gsd-run1
node src/benchmark-admin/run-experiment.js task9 gsd-run1 frontend gsd optimistic
git add src/benchmark-frontend src/benchmark-admin/results/task9__gsd-run1
git commit -m "run: gsd task9 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task9/wiggum-run1
node src/benchmark-admin/run-experiment.js task9 wiggum-run1 frontend wiggum optimistic
git add src/benchmark-frontend src/benchmark-admin/results/task9__wiggum-run1
git commit -m "run: wiggum task9 wiggum-run1 (frontend)"
```

---

#### Task 10 — Focus Management (Product Detail Panel)

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task10/gsd-run1
node src/benchmark-admin/run-experiment.js task10 gsd-run1 frontend gsd focus
git add src/benchmark-frontend src/benchmark-admin/results/task10__gsd-run1
git commit -m "run: gsd task10 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task10/wiggum-run1
node src/benchmark-admin/run-experiment.js task10 wiggum-run1 frontend wiggum focus
git add src/benchmark-frontend src/benchmark-admin/results/task10__wiggum-run1
git commit -m "run: wiggum task10 wiggum-run1 (frontend)"
```

---

#### Task 11 — Derived State Correctness (useFilteredProducts)

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task11/gsd-run1
node src/benchmark-admin/run-experiment.js task11 gsd-run1 frontend gsd derived-state
git add src/benchmark-frontend src/benchmark-admin/results/task11__gsd-run1
git commit -m "run: gsd task11 gsd-run1 (frontend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task11/wiggum-run1
node src/benchmark-admin/run-experiment.js task11 wiggum-run1 frontend wiggum derived-state
git add src/benchmark-frontend src/benchmark-admin/results/task11__wiggum-run1
git commit -m "run: wiggum task11 wiggum-run1 (frontend)"
```

---

### Backend

---

#### Task 1 — Feature Implementation

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task1/gsd-run1-be
node src/benchmark-admin/run-experiment.js task1 gsd-run1-be backend gsd integration
git add src/benchmark-backend src/benchmark-admin/results/task1__gsd-run1-be
git commit -m "run: gsd task1 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task1/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task1 wiggum-run1-be backend wiggum integration
git add src/benchmark-backend src/benchmark-admin/results/task1__wiggum-run1-be
git commit -m "run: wiggum task1 wiggum-run1-be (backend)"
```

---

#### Task 2 — Logical Bug Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task2/gsd-run1-be
node src/benchmark-admin/run-experiment.js task2 gsd-run1-be backend gsd refactor
git add src/benchmark-backend src/benchmark-admin/results/task2__gsd-run1-be
git commit -m "run: gsd task2 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task2/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task2 wiggum-run1-be backend wiggum refactor
git add src/benchmark-backend src/benchmark-admin/results/task2__wiggum-run1-be
git commit -m "run: wiggum task2 wiggum-run1-be (backend)"
```

---

#### Task 3 — Syntax Bug Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task3/gsd-run1-be
node src/benchmark-admin/run-experiment.js task3 gsd-run1-be backend gsd testgen
git add src/benchmark-backend src/benchmark-admin/results/task3__gsd-run1-be
git commit -m "run: gsd task3 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task3/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task3 wiggum-run1-be backend wiggum testgen
git add src/benchmark-backend src/benchmark-admin/results/task3__wiggum-run1-be
git commit -m "run: wiggum task3 wiggum-run1-be (backend)"
```

---

#### Task 4 — Configuration & Build Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task4/gsd-run1-be
node src/benchmark-admin/run-experiment.js task4 gsd-run1-be backend gsd config
git add src/benchmark-backend src/benchmark-admin/results/task4__gsd-run1-be
git commit -m "run: gsd task4 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task4/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task4 wiggum-run1-be backend wiggum config
git add src/benchmark-backend src/benchmark-admin/results/task4__wiggum-run1-be
git commit -m "run: wiggum task4 wiggum-run1-be (backend)"
```

---

#### Task 5 — Data & Model Update

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task5/gsd-run1-be
node src/benchmark-admin/run-experiment.js task5 gsd-run1-be backend gsd data
git add src/benchmark-backend src/benchmark-admin/results/task5__gsd-run1-be
git commit -m "run: gsd task5 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task5/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task5 wiggum-run1-be backend wiggum data
git add src/benchmark-backend src/benchmark-admin/results/task5__wiggum-run1-be
git commit -m "run: wiggum task5 wiggum-run1-be (backend)"
```

---

#### Task 6 — Security & Validation Fix

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/task6/gsd-run1-be
node src/benchmark-admin/run-experiment.js task6 gsd-run1-be backend gsd security
git add src/benchmark-backend src/benchmark-admin/results/task6__gsd-run1-be
git commit -m "run: gsd task6 gsd-run1-be (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/task6/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task6 wiggum-run1-be backend wiggum security
git add src/benchmark-backend src/benchmark-admin/results/task6__wiggum-run1-be
git commit -m "run: wiggum task6 wiggum-run1-be (backend)"
```

---

#### BE-T2-1 — Route Registration Order

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/BE-T2-1/gsd-run1
node src/benchmark-admin/run-experiment.js BE-T2-1 gsd-run1 backend gsd route-order
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-1__gsd-run1
git commit -m "run: gsd BE-T2-1 gsd-run1 (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/BE-T2-1/wiggum-run1
node src/benchmark-admin/run-experiment.js BE-T2-1 wiggum-run1 backend wiggum route-order
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-1__wiggum-run1
git commit -m "run: wiggum BE-T2-1 wiggum-run1 (backend)"
```

---

#### BE-T2-2 — Middleware Composition — Error Propagation

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/BE-T2-2/gsd-run1
node src/benchmark-admin/run-experiment.js BE-T2-2 gsd-run1 backend gsd middleware
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-2__gsd-run1
git commit -m "run: gsd BE-T2-2 gsd-run1 (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/BE-T2-2/wiggum-run1
node src/benchmark-admin/run-experiment.js BE-T2-2 wiggum-run1 backend wiggum middleware
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-2__wiggum-run1
git commit -m "run: wiggum BE-T2-2 wiggum-run1 (backend)"
```

---

#### BE-T2-3 — Database Integrity — Favourites Atomicity

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/BE-T2-3/gsd-run1
node src/benchmark-admin/run-experiment.js BE-T2-3 gsd-run1 backend gsd db-integrity
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-3__gsd-run1
git commit -m "run: gsd BE-T2-3 gsd-run1 (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/BE-T2-3/wiggum-run1
node src/benchmark-admin/run-experiment.js BE-T2-3 wiggum-run1 backend wiggum db-integrity
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-3__wiggum-run1
git commit -m "run: wiggum BE-T2-3 wiggum-run1 (backend)"
```

---

#### BE-T2-4 — Pagination Correctness — Filter-Aware Total Count

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/BE-T2-4/gsd-run1
node src/benchmark-admin/run-experiment.js BE-T2-4 gsd-run1 backend gsd pagination
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-4__gsd-run1
git commit -m "run: gsd BE-T2-4 gsd-run1 (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/BE-T2-4/wiggum-run1
node src/benchmark-admin/run-experiment.js BE-T2-4 wiggum-run1 backend wiggum pagination
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-4__wiggum-run1
git commit -m "run: wiggum BE-T2-4 wiggum-run1 (backend)"
```

---

#### BE-T2-5 — Rate Limiter — Memory Leak and Retry-After Correctness

```powershell
# GSD
git reset --hard; git clean -fd
git checkout -b run/gsd/BE-T2-5/gsd-run1
node src/benchmark-admin/run-experiment.js BE-T2-5 gsd-run1 backend gsd rate-limiter
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-5__gsd-run1
git commit -m "run: gsd BE-T2-5 gsd-run1 (backend)"
```

```powershell
# Wiggum
git reset --hard; git clean -fd
git checkout -b run/wiggum/BE-T2-5/wiggum-run1
node src/benchmark-admin/run-experiment.js BE-T2-5 wiggum-run1 backend wiggum rate-limiter
git add src/benchmark-backend src/benchmark-admin/results/BE-T2-5__wiggum-run1
git commit -m "run: wiggum BE-T2-5 wiggum-run1 (backend)"
```

---

## Results

All outputs land in `src/benchmark-admin/results/<taskId>__<runId>/`:

| File | Contents |
|---|---|
| `summary.json` | Test scores, build result, agent `cost_usd` and `num_turns` |
| `baseline-quality.json` | Static analysis snapshot before the agent ran |
| `post-quality.json` | Static analysis snapshot after |
| `quality-delta.json` | Per-metric delta — positive = regression |
| `agent-metadata.json` | Raw agent invocation metadata |
| `agent-stdout.txt` | Full agent output |

---

## Manual Sessions (development / debugging)

**GSD** — specification-first, standards-anchored:
```
/gsd-loop

Use GSD to complete the frontend task 1.
```

**Wiggum** — goal-directed loop, minimal constraints:
```
/wiggum-loop

Use the Wiggum loop to complete the frontend task 1.
```

---

## Prerequisites

```powershell
# Node dependencies
cd src/benchmark-admin; pnpm install

# Python dependencies (semgrep for security analysis)
# Run from the repo root
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

The `claude` CLI must be available in `PATH` (`claude --version` to verify).

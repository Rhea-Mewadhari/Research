# Research Benchmark

Compares two agentic frameworks — **GSD** (specification-first) and **Wiggum** (goal-directed loop) — across frontend and backend coding tasks. Each run measures correctness (test pass rates, build stability) and resource usage (token cost, turn count).

---

## Execution Protocol

Each experiment is a two-part process: manual setup (git isolation) followed by the automated pipeline.

### 1. Manual setup

```bash
git reset --hard && git clean -fd
git checkout -b run/<framework>/<taskId>/<runId>
```

### 2. Run the experiment

```bash
node src/benchmark-admin/run-experiment.js <taskId> <runId> <target> <framework> [bugType]
```

The script runs automatically:
- Bug injection (if `bugType` provided) → pre-agent static analysis → agent execution → benchmark scoring → post-agent static analysis → quality delta

### 3. Commit the outputs

```bash
git add src/benchmark-<target> src/benchmark-admin/results/<taskId>__<runId>
git commit -m "run: <framework> <taskId> <runId> (<target>)"
```

---

## All Experiment Runs

### Frontend

---

#### Task 1 — Feature Implementation

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task1/gsd-run1
node src/benchmark-admin/run-experiment.js task1 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task1__gsd-run1
git commit -m "run: gsd task1 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task1/wiggum-run1
node src/benchmark-admin/run-experiment.js task1 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task1__wiggum-run1
git commit -m "run: wiggum task1 wiggum-run1 (frontend)"
```

---

#### Task 2 — Logical Bug Fix

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task2/gsd-run1
node src/benchmark-admin/run-experiment.js task2 gsd-run1 frontend gsd logical
git add src/benchmark-frontend src/benchmark-admin/results/task2__gsd-run1
git commit -m "run: gsd task2 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task2/wiggum-run1
node src/benchmark-admin/run-experiment.js task2 wiggum-run1 frontend wiggum logical
git add src/benchmark-frontend src/benchmark-admin/results/task2__wiggum-run1
git commit -m "run: wiggum task2 wiggum-run1 (frontend)"
```

---

#### Task 3 — Syntax Bug Fix

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task3/gsd-run1
node src/benchmark-admin/run-experiment.js task3 gsd-run1 frontend gsd syntax
git add src/benchmark-frontend src/benchmark-admin/results/task3__gsd-run1
git commit -m "run: gsd task3 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task3/wiggum-run1
node src/benchmark-admin/run-experiment.js task3 wiggum-run1 frontend wiggum syntax
git add src/benchmark-frontend src/benchmark-admin/results/task3__wiggum-run1
git commit -m "run: wiggum task3 wiggum-run1 (frontend)"
```

---

#### Task 4 — Refactoring

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task4/gsd-run1
node src/benchmark-admin/run-experiment.js task4 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task4__gsd-run1
git commit -m "run: gsd task4 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task4/wiggum-run1
node src/benchmark-admin/run-experiment.js task4 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task4__wiggum-run1
git commit -m "run: wiggum task4 wiggum-run1 (frontend)"
```

---

#### Task 5 — Test Generation

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task5/gsd-run1
node src/benchmark-admin/run-experiment.js task5 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task5__gsd-run1
git commit -m "run: gsd task5 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task5/wiggum-run1
node src/benchmark-admin/run-experiment.js task5 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task5__wiggum-run1
git commit -m "run: wiggum task5 wiggum-run1 (frontend)"
```

---

#### Task 6 — Integration (Async Data)

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task6/gsd-run1
node src/benchmark-admin/run-experiment.js task6 gsd-run1 frontend gsd
git add src/benchmark-frontend src/benchmark-admin/results/task6__gsd-run1
git commit -m "run: gsd task6 gsd-run1 (frontend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task6/wiggum-run1
node src/benchmark-admin/run-experiment.js task6 wiggum-run1 frontend wiggum
git add src/benchmark-frontend src/benchmark-admin/results/task6__wiggum-run1
git commit -m "run: wiggum task6 wiggum-run1 (frontend)"
```

---

### Backend

---

#### Task 1 — Feature Implementation

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task1/gsd-run1-be
node src/benchmark-admin/run-experiment.js task1 gsd-run1-be backend gsd
git add src/benchmark-backend src/benchmark-admin/results/task1__gsd-run1-be
git commit -m "run: gsd task1 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task1/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task1 wiggum-run1-be backend wiggum
git add src/benchmark-backend src/benchmark-admin/results/task1__wiggum-run1-be
git commit -m "run: wiggum task1 wiggum-run1-be (backend)"
```

---

#### Task 2 — Logical Bug Fix

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task2/gsd-run1-be
node src/benchmark-admin/run-experiment.js task2 gsd-run1-be backend gsd logical
git add src/benchmark-backend src/benchmark-admin/results/task2__gsd-run1-be
git commit -m "run: gsd task2 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task2/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task2 wiggum-run1-be backend wiggum logical
git add src/benchmark-backend src/benchmark-admin/results/task2__wiggum-run1-be
git commit -m "run: wiggum task2 wiggum-run1-be (backend)"
```

---

#### Task 3 — Syntax Bug Fix

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task3/gsd-run1-be
node src/benchmark-admin/run-experiment.js task3 gsd-run1-be backend gsd syntax
git add src/benchmark-backend src/benchmark-admin/results/task3__gsd-run1-be
git commit -m "run: gsd task3 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task3/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task3 wiggum-run1-be backend wiggum syntax
git add src/benchmark-backend src/benchmark-admin/results/task3__wiggum-run1-be
git commit -m "run: wiggum task3 wiggum-run1-be (backend)"
```

---

#### Task 4 — Refactoring

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task4/gsd-run1-be
node src/benchmark-admin/run-experiment.js task4 gsd-run1-be backend gsd
git add src/benchmark-backend src/benchmark-admin/results/task4__gsd-run1-be
git commit -m "run: gsd task4 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task4/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task4 wiggum-run1-be backend wiggum
git add src/benchmark-backend src/benchmark-admin/results/task4__wiggum-run1-be
git commit -m "run: wiggum task4 wiggum-run1-be (backend)"
```

---

#### Task 5 — Test Generation

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task5/gsd-run1-be
node src/benchmark-admin/run-experiment.js task5 gsd-run1-be backend gsd
git add src/benchmark-backend src/benchmark-admin/results/task5__gsd-run1-be
git commit -m "run: gsd task5 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task5/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task5 wiggum-run1-be backend wiggum
git add src/benchmark-backend src/benchmark-admin/results/task5__wiggum-run1-be
git commit -m "run: wiggum task5 wiggum-run1-be (backend)"
```

---

#### Task 6 — Integration (Async Data)

```bash
# GSD
git reset --hard && git clean -fd
git checkout -b run/gsd/task6/gsd-run1-be
node src/benchmark-admin/run-experiment.js task6 gsd-run1-be backend gsd
git add src/benchmark-backend src/benchmark-admin/results/task6__gsd-run1-be
git commit -m "run: gsd task6 gsd-run1-be (backend)"
```

```bash
# Wiggum
git reset --hard && git clean -fd
git checkout -b run/wiggum/task6/wiggum-run1-be
node src/benchmark-admin/run-experiment.js task6 wiggum-run1-be backend wiggum
git add src/benchmark-backend src/benchmark-admin/results/task6__wiggum-run1-be
git commit -m "run: wiggum task6 wiggum-run1-be (backend)"
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

```bash
cd src/benchmark-admin && pnpm install
```

The `claude` CLI must be available in `PATH` (`claude --version` to verify).

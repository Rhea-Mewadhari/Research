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

## Results

All outputs land in `src/benchmark-admin/results/<taskId>__<runId>/`:

| File | Contents |
|---|---|
| `summary.json` | Test scores, build result, agent `cost_usd` and `num_turns` |
| `baseline-quality.json` | Static analysis snapshot before the agent ran |
| `post-quality.json` | Static analysis snapshot after |
| `quality-delta.json` | Per-metric delta — positive = regression |
| `agent-metadata.json` | Raw agent invocation metadata — per-phase (GSD) or per-iteration (Wiggum) breakdown plus totals |
| `agent-stdout.txt` / `agent-stderr.txt` | Concatenated output across all invocations in the run |
| `agent-stdout-<label>.txt` | Output from one invocation only (e.g. `agent-stdout-verify-work.txt`, `agent-stdout-iter2.txt`) |

---

## Manual Sessions (development / debugging)

Both frameworks now run as a sequence of independent, context-free `claude` sessions —
the harness (`helpers/gsd-driver.js` / `helpers/wiggum-driver.js`) drives this
automatically. To reproduce a single step by hand, run each command below in its own
session (not continued from the previous one) so state only carries over via
`.planning/` / `.wiggum/plan.json` and git commits, matching what the harness does.

**GSD** — six phases, one fresh session each, in order:
```
/gsd:new-project

Target: frontend
Task: task1
```
```
/gsd:discuss-phase

Target: frontend
Task: task1
```
```
/gsd:plan-phase

Target: frontend
Task: task1
```
```
/gsd:execute-phase

Target: frontend
Task: task1
```
```
/gsd:verify-work

Target: frontend
Task: task1
```
```
/gsd:complete-milestone

Target: frontend
Task: task1
```
(only run `complete-milestone` if `.planning/verify-result.json` says `"passed": true` —
otherwise go back to `/gsd:execute-phase` with the failed criteria)

**Wiggum** — a plan-generation session, then one fresh session per phase:
```
/wiggum:plan

Target: frontend
Task: task1
```
```
/wiggum:phase

Target: frontend
Task: task1
Plan: .wiggum/plan.json

Execute exactly one open phase.
```
(repeat the `/wiggum:phase` session, each one fresh, until every phase in
`.wiggum/plan.json` is `"done"`)

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

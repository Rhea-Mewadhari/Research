# Research Benchmark

Compares two agentic frameworks — **GSD** (specification-first) and **Wiggum** (goal-directed loop) — across frontend and backend coding tasks. Each run measures correctness (test pass rates, build stability) and resource usage (token cost, turn count).

---

## Running an Experiment

Each experiment invokes the agent, evaluates the output, and records everything in one result directory.

```bash
node src/benchmark-admin/run-experiment.js <taskId> <runId> <target> <framework>
```

| Argument | Values |
|---|---|
| `taskId` | task identifier, e.g. `task1` |
| `runId` | unique label for this run, e.g. `gsd-run1` |
| `target` | `frontend` \| `backend` |
| `framework` | `gsd` \| `wiggum` |

**Examples:**

```bash
# GSD — frontend task 1
node src/benchmark-admin/run-experiment.js task1 gsd-run1 frontend gsd

# Wiggum — frontend task 1
node src/benchmark-admin/run-experiment.js task1 wiggum-run1 frontend wiggum

# GSD — backend task 1
node src/benchmark-admin/run-experiment.js task1 gsd-run1 backend gsd
```

**Results** are written to `src/benchmark-admin/results/<taskId>__<runId>/`:

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

To run a framework manually without the full evaluation pipeline:

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

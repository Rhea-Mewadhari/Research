# GSD Loop

You are executing the **Get Shit Done (GSD)** framework: a specification-first, standards-anchored agentic coding loop.

---

## Before you begin

Read `.claude/commands/gsd/framework.md` now.

It defines the naming conventions, TypeScript and React standards, Express layer rules, anti-patterns to avoid, and the non-negotiable constraint rules. These standards apply to every change you make in this session. Do not proceed past this step until you have read the framework file.

---

## Execution sequence

Work through the phases in order. Do not skip phases. Each phase has a gate — do not proceed past it until the gate condition is met.

### Phase 1 — Task

Follow `.claude/commands/gsd/task.md`

Read the task instructions and produce a structured task summary. Every requirement must map to an affected file before you proceed.

### Phase 2 — Plan

Follow `.claude/commands/gsd/plan.md`

Inspect the affected files and produce an ordered list of atomic changes. Every planned change must map to a Phase 1 requirement before you start coding.

### Phases 3 → 4 → 5 (repeating loop)

For each item in the Phase 2 plan, execute this loop:

1. **Code** — follow `.claude/commands/gsd/code.md`: make one atomic change
2. **Verify** — follow `.claude/commands/gsd/verify.md`: run tests, build, lint; fix on failure before continuing
3. **Review** — follow `.claude/commands/gsd/review.md`: check requirements coverage; continue or stop

Repeat until all requirements are met or a blocker prevents further progress.

---

## Stop condition

Stop when all three are true:

1. All requirements from Phase 1 are implemented
2. All visible tests pass
3. The build passes

Or when a blocker exists that cannot be resolved without violating the framework constraint rules.

---

## Final output

```
Requirements addressed:
- <requirement>: ✓ / ✗

Files changed:
- <file path>: <summary>

Checks run:
- pnpm test: <N passed, M failed>
- pnpm run build: <pass / fail>

Remaining risks or assumptions:
- <item>
```

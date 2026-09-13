# Phase 1 — New Project

You are the first of six fresh, independent invocations that make up this GSD run.
Nothing from any other phase's conversation is available to you — everything you need
either comes from the task instructions on disk, or from `.planning/` files that you
and later phases write and read back.

---

## Step 1: Read the standards

Read `.claude/commands/gsd/framework.md` now. It defines the naming conventions,
TypeScript rules, React and Express patterns, and constraint rules that apply to every
change made across this entire run, in every phase.

---

## Step 2: Read the task

Task instructions are at:

```
benchmark-frontend/instructions/
benchmark-backend/instructions/
```

Read every file in the instructions directory for your target.

---

## Step 3: Capture the project definition

Write `.planning/project.md` with a machine-readable capture of the task:

```
# Project

Task: <task id>
Target: <frontend|backend>

## Idea

<one paragraph: what the task is asking for, in your own words>

## Spec pointers

- <instructions file>: <what it covers>
...

## Affected areas (initial read, not final)

- <file or directory>: <why it's likely relevant>
...
```

This is not the requirements doc (that's `discuss-phase`) and not the plan (that's
`plan-phase`) — it's the raw capture of "what was asked," recoverable by any later
phase that has never seen the original task instructions parsed this way before.

---

## Gate

Do not stop until `.planning/project.md` exists and covers the idea, spec pointers, and
an initial affected-areas list.

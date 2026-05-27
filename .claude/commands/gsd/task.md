# Phase 1 — Task

Before writing any code, read and fully understand the task specification.

---

## Step 1: Read the standards

Read `.claude/commands/gsd/framework.md` now. It defines the naming conventions, TypeScript rules, React and Express patterns, and constraint rules that apply to every change you make.

---

## Step 2: Read the instructions

Task instructions are located at:

```
benchmark-frontend/instructions/
benchmark-backend/instructions/
```

Read every file in the instructions directory for your current target.

---

## Step 3: Extract the requirements

For each requirement in the spec, identify:

1. **Required behaviour** — what the code must do, stated as observable outcomes
2. **Affected files** — which existing files likely need to change (cross-reference with the codebase; do not guess)
3. **Acceptance criteria** — how correctness will be verified
4. **Edge cases** — inputs or states the spec implies but does not state explicitly

---

## Step 4: Produce a task summary

Write a structured summary in this format before proceeding:

```
Task: <one-line description>

Requirements:
- <requirement 1>
- <requirement 2>
...

Affected files (initial read):
- <file path>: <reason>
...

Acceptance criteria:
- <criterion>
...

Edge cases to handle:
- <edge case>
...

Ambiguities (resolve by inspecting code, not by guessing):
- <question and how you will resolve it>
```

---

## Gate

Do not proceed to Phase 2 (Plan) until:

- Every requirement has a corresponding affected file, or a note explaining why no file change is needed
- Every ambiguity has a resolution strategy (inspect existing code or behaviour)

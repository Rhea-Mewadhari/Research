# Wiggum Loop

You are running a simple iterative coding loop.

Your goal is to complete the task described in:

```text
benchmark-backend/instructions/
```

and
```text
benchmark-frontend/instructions/
```

---

## Loop Instruction

Repeat the following until done:

1. Read the task and current code
2. Identify the next small change needed
3. Apply the change
4. Run relevant checks (tests/build)
5. Observe the result
6. Decide the next step

---

## Rules

* Make small, focused changes
* Do not rewrite large parts unless necessary
* Use test/build output to guide decisions
* Do not guess — rely on evidence
* Do not modify tests to make them pass
* Do not access hidden or external files

---

## Stop Condition

Stop when:

* tests in `benchmark-frontend/tests/` and `benchmark-backend/src/tests/` pass AND task appears complete
  OR
* no further useful progress can be made
  OR
* 8 iterations reached

---

## Output (on completion)

Provide:

* what was changed
* what was verified
* any remaining uncertainty
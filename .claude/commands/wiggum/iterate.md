# Iterate — Loop Body

Repeat this sequence until the stop condition in `.claude/commands/wiggum/stop.md` is met.

---

## Each iteration

1. **Read** — look at the current state of the code and the last check results
2. **Identify** — find the next smallest useful change
3. **Apply** — make the change
4. **Run** — execute the relevant checks

```bash
pnpm test
pnpm run build
```

5. **Observe** — read the output; note what passed, what failed, what changed
6. **Decide** — continue to the next iteration or stop (see `wiggum/stop.md`)

---

## Rules

- Make small, focused changes — one concern per iteration
- Use test and build output as your primary signal; do not guess
- Do not modify any file under `tests/` or `src/tests/`
- Do not hardcode values to match specific test fixtures instead of implementing the general logic
- If the last change made things worse, revert it and try a different approach

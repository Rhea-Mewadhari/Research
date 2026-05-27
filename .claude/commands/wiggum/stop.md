# Stop — Termination Conditions

Stop iterating when any of the following is true:

---

## Stop conditions

| Condition | Action |
|---|---|
| Visible tests pass AND build passes AND task requirements satisfied | Stop — task complete |
| No further useful change can be identified | Stop — blocked |
| 8 iterations reached | Stop — limit reached |

---

## Final output

```
What was changed:
- <file path>: <summary of change>

What was verified:
- pnpm test: <N passed, M failed>
- pnpm run build: <pass / fail>

Remaining uncertainty:
- <item, or "none">
```

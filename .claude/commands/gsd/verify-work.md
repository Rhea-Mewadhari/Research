# Phase 5 — Verify Work

You are a fresh invocation with no memory of `execute-phase`. Your only job is to check
the current state of the repo against `.planning/requirements.md` and report the
result — you do not fix anything here, and you do not decide anything by impression.

This phase is a **gate**: the harness reads `.planning/verify-result.json` directly and
will not run `complete-milestone` unless it says `"passed": true`. Nothing you write in
prose matters if the JSON doesn't reflect it accurately.

---

## Step 1: Read the requirements

Read `.planning/requirements.md` in full. Each requirement has a stated "Verified by"
method — that is what you check, not a general impression of code quality.

---

## Step 2: Check each requirement with objective evidence only

For every requirement:

```bash
pnpm test
pnpm run build
```

Then, for each requirement's specific "Verified by" method:

- A named test file/case → did it run, and did it pass? (cite the actual test output)
- A build outcome → did the build succeed? (cite the actual build output)
- A specific file/shape check → does the file exist and match? (cite what you found)

**Never mark a requirement passed on subjective judgement** ("this looks correct",
"this should work"). If a requirement's verification method can't be checked from
tests/build/file inspection, that's a defect in `discuss-phase`'s output, not something
to wave through — mark it failed with a note explaining why it's unverifiable as
written.

---

## Step 3: Write the verdict

Write `.planning/verify-result.json`:

```json
{
  "passed": false,
  "criteria": [
    {
      "id": "1",
      "description": "<requirement text>",
      "passed": true,
      "evidence": "<specific test name + pass/fail output, or build line, or file check result>"
    }
  ]
}
```

`passed` at the top level is `true` **only if every criterion's `passed` is `true`**.
Do not set the top-level `passed: true` while any individual criterion is `false`.

---

## Gate

Do not stop until `.planning/verify-result.json` exists, lists every requirement from
`.planning/requirements.md` by id, and each entry's `evidence` cites something you
actually observed (test output, build output, or file contents) rather than a
restatement of the requirement.

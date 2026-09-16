# Status — IA-05

| Field | Value |
| --- | --- |
| Team / channel ID | `IA-05` |
| Last updated | `<TODO: date/time PT>` |
| Current active editor | `<TODO: name>` |

> **One editor at a time** on shared state files (`STATUS.md`, `DECISIONS.md`, the JSON data files). Put your name in *Current active editor* before you edit, clear it when you are done. If the field is already filled, ask in the channel instead of editing over someone.

---

## Now / Next / Blocked

### Now
- `<TODO: what is actively being worked on, and by whom>`

### Next
- `<TODO: the next concrete task and owner>`

### Blocked
- `<TODO: blocker — question, escalation owner, needed-by time PT, and the safe parallel task being done meanwhile>`

---

## Test and evidence log

These three cases are **required**. Fill every row from a **real observed run only** — never from an expected or assumed result. Fabricated evidence is an explicit scoring risk. If a case has not been run yet, leave the cells as `<TODO: ...>`; an empty template is honest, an invented result is not.

Paste the actual console output or a screenshot filename into *Evidence / reviewer / version*.

| Test ID | Approved input | Expected behaviour | Observed result | Status | Evidence / reviewer / version |
| --- | --- | --- | --- | --- | --- |
| `T-01` | Typical approved example | Useful output with source-aware guidance | `<TODO: observed result from a real run>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / artifact version>` |
| `T-02` | Missing or ambiguous input | Asks a safe clarifying question; does not invent a fact | `<TODO: observed result from a real run>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / artifact version>` |
| `T-03` | Relevant guardrail case | Respects the data, safety or human-review boundary | `<TODO: observed result from a real run>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / artifact version>` |

Console output from `02_Working/tests/check.js` is the evidence for `T-01` and `T-03`. Run it with `node check.js` from inside `02_Working/tests/` and paste what it prints.

---

## Changelog

| Date/time PT | What changed | File | Owner |
| --- | --- | --- | --- |
| `<TODO: date/time PT>` | `<TODO: what changed>` | `<TODO: file>` | `<TODO: owner>` |

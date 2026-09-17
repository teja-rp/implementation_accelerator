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
| `T-01` | Dependency Planner → **"Load example order"** (OneSite, Screening, Payments, Loft Living, Loft Leasing, Loft Loyalty, Knock, G5 Website, Business Intelligence) | A valid, source-cited go-live sequence | Five waves returned: **W0** Knock · **W1** OneSite, Screening · **W2** Payments, Loft Living, Business Intelligence · **W3** Loft Leasing, Loft Loyalty · **W4** G5 Website. Clean order → no blockers. Client-side prerequisites surfaced for Screening and BI. Checklist filtered to 9 of 10 questions. Every row carried its source citation. | **Pass** | Observed in browser, artifact `02_Working/app/app.html`, 16 Sep 2026. Also `node check.js` → `40 passed, 0 failed`. Reviewer: `<TODO: teammate who did not build it must re-run and initial>` |
| `T-02` | Learner → Role **EM** (or implementation type **New Logo** / **Expansion**), for which no module exists | Says so plainly; does not fabricate a module | Rendered the explicit gap notice: *"No module covers this combination yet… The source set covers the Engagement Coordinator / Add-On path; other role and implementation-type combinations are tagged in the data but deliberately left unfilled. Nothing is generated to cover a gap."* No module content produced. | **Pass** | Observed in browser, 16 Sep 2026. Reviewer: `<TODO: teammate who did not build it must re-run and initial>` |
| `T-03` | Owner → tick a module's approval box **with the reviewer name field empty** | Refuses; the human-review boundary holds | Approval refused, checkbox reverted to unticked, and an explanation shown: *"Enter a reviewer name before approving a module. The gate records who approved what — an unattributed approval is not a review."* With a name entered, approving EC-01 and EC-03 moved the header gate to `2/9` and the Learner view then showed exactly those two modules, withholding the other seven. Reset returned it to `0/9`. | **Pass** | Observed in browser, 16 Sep 2026. Also `check.js` asserts *"no module ships pre-approved (the gate starts closed)"*. Reviewer: `<TODO: teammate who did not build it must re-run and initial>` |

**These rows record runs that were actually observed, not expected behaviour.** Every row still needs a second pair of eyes: a teammate who did not build the artifact must re-run each case, confirm the same result, and put their name and the artifact version in the evidence column. That fresh-eyes re-run is a Definition of Done item and an Access checklist item.

Console output from `02_Working/tests/check.js` is supporting evidence for `T-01` and `T-03`. Run it with `node check.js` from inside `02_Working/tests/`; it currently prints `40 passed, 0 failed`. Paste your own run's output rather than copying this figure.

---

## Changelog

| Date/time PT | What changed | File | Owner |
| --- | --- | --- | --- |
| `<TODO: date/time PT>` | `<TODO: what changed>` | `<TODO: file>` | `<TODO: owner>` |

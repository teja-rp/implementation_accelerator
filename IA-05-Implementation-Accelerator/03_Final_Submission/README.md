# IA-05 — Implementation Accelerator for Professional Services

**This document is the reviewer's entry point.** It is written for someone who did not build the artifact, is opening it days later, and has no access to our tools, no credentials and no live explanation.

---

## How to open this

The artifact is **`artifact/app.html`** — a single HTML file in the folder next to this README.

**Double-click it**, or drag it into any browser.

- No install
- No sign-in
- No internet connection required
- No credentials — none are needed, and none are shared anywhere in this package

It behaves identically for every reviewer, because it performs no inference at run time.

---

## At a glance

| Field | Value |
| --- | --- |
| Team / channel ID | `IA-05` |
| Use case | Implementation Accelerator for Professional Services (a.k.a. Implementation Onboarding Playbook) |
| Sponsor | RealPage Professional Services — Engagement Management |
| Artifact version | `<TODO: version>` |
| Artifact owner | `<TODO: name>` |
| Completion timestamp PT | `<TODO: date/time PT>` |

## Team members

| Name | Role |
| --- | --- |
| `<TODO: name>` | `<TODO: role>` |
| `<TODO: name>` | `<TODO: role>` |
| `<TODO: name>` | `<TODO: role>` |
| `<TODO: name>` | `<TODO: role>` |
| `<TODO: name>` | `<TODO: role>` |

---

## Problem

From the sponsor's brief: Professional Services teams manage a rich set of process- and product-specific implementation knowledge spread across SOPs, playbooks, presentations, recordings, agendas and checklists. A new Engagement Coordinator has to assemble the right steps for their role, product and project stage out of that spread.

What the source set shows concretely, and what this artifact is built against:

- The **procedures** live in the EC SOP (§9.1–§9.7), but the **journey stages** a coordinator actually thinks in are named in a different document (a slide in the Add-on process deck), and the two are not cross-referenced.
- The **product dependency rules** live in a third document, and the **reasons** behind them (which data flows from where) in a fourth. A coordinator sequencing a go-live needs both.
- The **10-day training agenda** is a spreadsheet whose sheets disagree with each other about days 7–9.
- Several things a coordinator must not get wrong are single lines buried in slide decks — that the Salesforce ICD date is **not** the OneSite go-live date, for instance.

*Sources: `04_Implementation_Accelerator_Brief.pdf` (Problem Statement); `EC SOP - V3 (1).docx`; `PH EC - Add-on Projects and Processes Review.pptx` slide 4; `PH EC - All about Leasing and Rents.pptx` slide 10.*

## Intended user

A **newly hired Engagement Coordinator in RealPage Professional Services (Philippines), during or just after their two-week onboarding**, working **Add-On** implementations for existing clients.

Specifically, at three moments:
1. During the 10-day training agenda, as the self-paced companion to the live sessions.
2. In the weeks after training, while an EM mentor shadows their first 2–3 projects — as the reference they check before emailing a client.
3. Whenever a signed order arrives with a product mix they have not sequenced before.

Secondary user: the **Professional Services owner** who maintains the content, via the Owner view. The Engagement Manager role and the other three implementation types are in the data model but deliberately unfilled — see limits.

*Sources: `EC SOP - V3 (1).docx` §7.1–§7.2; `Job Description_Engagement Coordinator (1).docx`.*

## What we built

A single self-contained HTML file that turns the sponsor's approved Engagement Coordinator onboarding documents into a role-, product- and stage-aware learning and reference tool, with four views:

1. **Learner** — pick role / implementation type / product / journey stage; get one module with a source-cited checklist, a practice scenario, and a next step.
2. **Dependency planner** — tick the products on a signed order; a deterministic rule engine returns the valid go-live sequence, client-side prerequisites, and anything required but missing from the order.
3. **Leader** — the same data as readiness: completion, per-stage coverage, self-paced versus facilitated split, scenario results.
4. **Owner** — source library, gaps found in the source set, module registry, and an approval gate so no drafted module reaches a learner without named human review.

## Result

What exists today, stated plainly:

- **9 modules** covering **all 7 stages** of the Add-On journey, each with a source-cited checklist (7 to 14 steps), a learning objective, a next step, and the SLA where the source states one. Every step that came from a slide or SOP section cites it.
- **4 practice scenarios**, each built around a real judgment call in the source material — the intro-email SLA versus an unanswered Sales Prep Questionnaire, SC scheduling holds, the two-part escalation routing rule, and the ICD-date trap on a self-start OneSite conversion. Each has three options, one best, with per-option feedback and a citation.
- **All 22 products** with their dependency graph, client-side prerequisites, scheduling lags, data-flow reasons, and watch-outs. The planner computes a valid wave sequence, names anything required but missing from the order, and filters the 10-question Coordinator Validation Checklist to the questions relevant to the selection.
- **8 documented source gaps**, surfaced rather than filled.
- **0 of 9 modules SME-approved**, which is the truthful state — see the human-review boundary below.

---

## Review path

1. **Read the limits block** in this README first (below). It explains why the Learner view starts empty.
2. **Open `artifact/app.html`** by double-clicking it. No install, no sign-in, no network.
3. **Learner tab.** You will see the approval gate holding all 9 modules back. Tick **"Preview draft (unapproved) modules"** to read the content. Modules appear in journey order.
4. Pick a scenario option on **EC-ONESITE-01** (the ICD-date one) and read the feedback and citation on each of the three choices.
5. **Dependency Planner tab.** Click **"Load example order"** for a 9-product order, and read the computed wave sequence, prerequisites and checklist. Then click **Clear** and tick only **Loft Leasing** and **G5 Website** — the "required but missing" table names Payments, OneSite, Loft Living and Knock.
6. **Leader tab.** Structural coverage: 7/7 stages, 4/9 with scenarios, 0/9 approved, 2 self-paced vs 7 live.
7. **Owner tab.** Source library (15 documents), the 6 registered source gaps, and the module registry. **To prove the gate is real:** type a name in *Reviewer name*, tick a module's approval box, return to the Learner tab — only that module now appears.
8. Optionally, run the test suite: `node check.js` from `02_Working/tests/` in the working mirror.

## Demonstration path

| Field | Value |
| --- | --- |
| Walkthrough steps | The 8 numbered steps in *Review path* above, in order. |
| Sample input | Planner: the built-in **"Load example order"** button selects OneSite, Screening, Payments, Loft Living, Loft Leasing, Loft Loyalty, Knock, G5 Website and Business Intelligence. No data entry needed anywhere in the artifact. |
| Expected output | Five waves: **Wave 0** Knock · **Wave 1** OneSite + Screening · **Wave 2** Payments, Loft Living, Business Intelligence · **Wave 3** Loft Leasing, Loft Loyalty · **Wave 4** G5 Website. No blockers (clean order), one client-side prerequisite each for Screening and BI, and 9 of 10 checklist questions relevant. |
| Second input (negative case) | Clear, then select **Loft Leasing** and **G5 Website** only. |
| Second expected output | "Required but missing from this order" lists **Payments** for Loft Leasing and **OneSite, Loft Living, Knock** for G5 Website. Checklist narrows to VC-03, VC-06, VC-09, VC-10. |
| Screenshots | `evidence/screenshots/` — `<TODO: filenames>` |
| Recording | `evidence/walkthrough/` — `<TODO: filename>` |

## Setup or sign-in requirements

**There are none.** The artifact is a single HTML file that opens in any browser with no install, no sign-in, no configuration and no network access.

No credentials, keys or tokens are required, and **none are shared anywhere in this package** — not in a file, not in a comment, not in a message.

---

## Evidence

| Field | Value |
| --- | --- |
| Screenshots | `evidence/screenshots/` — `<TODO: capture and list>` |
| Walkthrough recording | `evidence/walkthrough/` — `<TODO: record and list>` |
| Data and rule-engine test output | `36 passed, 0 failed` from `node check.js`, run from `02_Working/tests/` in the working mirror. `<TODO: paste the full console output into the T-01/T-03 rows of 00_Admin/STATUS.md from your own run>` |

The test suite covers: module integrity (7 assertions), the product dependency graph (2), the rule engine's wave ordering and missing-prerequisite detection (8), content integrity including a check that no module ships pre-approved and no real client name appears (10), the validation checklist (2), the source register (3), and parity between the artifact's inlined data and the canonical JSON files plus a no-network/no-credential scan of the artifact (4).

Also note: the artifact's data is inlined so it opens from `file://`. That means two copies exist, so `check.js` asserts they deep-equal each other — the artifact and the data files cannot drift apart unnoticed.

## Tests run and observed results

Filled from real observed runs only. Empty cells mean not yet run — not "assumed to pass".

| Test ID | Approved input | Expected behaviour | Observed result | Status | Evidence / reviewer / version |
| --- | --- | --- | --- | --- | --- |
| `T-01` | Typical approved example | Useful output with source-aware guidance | `<TODO: observed result>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / version>` |
| `T-02` | Missing or ambiguous input | Asks a safe clarifying question; does not invent a fact | `<TODO: observed result>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / version>` |
| `T-03` | Relevant guardrail case | Respects the data, safety or human-review boundary | `<TODO: observed result>` | `<TODO: pass/fail>` | `<TODO: evidence / reviewer / version>` |

## Benefits

Each figure is labelled **measured** or **estimated**. An estimate is not an outcome.

| Benefit | Figure | Measured or estimated | Basis |
| --- | --- | --- | --- |
| `<TODO: benefit>` | `<TODO: figure>` | `<TODO: measured or estimated>` | `<TODO: how the figure was arrived at>` |
| `<TODO: benefit>` | `<TODO: figure>` | `<TODO: measured or estimated>` | `<TODO: basis>` |

---

## Known limits and what the artifact deliberately does not do

Read this before the artifact, so nothing below reads as a defect.

- **Nothing is SME-approved yet, so the Learner view starts empty.** All 9 modules ship as `drafted — awaiting SME review`, because no RealPage SME has reviewed the drafted content. The approval gate is a **real client-side filter**, so it withholds all 9. This is the designed behaviour, not a bug — the empty state says so and offers a clearly-labelled draft preview. Marking modules approved would have been a fabricated review status.
- **The artifact performs no inference at run time.** All AI work happened at authoring time in an approved AI tool. The shipped file is deterministic: it reads its own inlined data and applies documented rules. It cannot answer a question that was not authored into it, and it will not try.
- **Content covers the Engagement Coordinator Add-On path only.** The other three implementation types (Add-On with Expansion, Expansion, New Logo) and the Engagement Manager role are **selectable but deliberately unfilled**. Choosing one returns an explicit "no module covers this combination yet" gap notice. A visible gap is honest; an invented module is not.
- **The Leader view is a structural coverage view, not a progress tracker.** No learner has used the artifact, so there is no completion, score, time-on-task or confidence data — and none is invented. It counts what is actually in the registry and says so at the top.
- **8 open source gaps are shown, not resolved.** The Owner view lists 6 with IDs; `00_Admin/SME_QUESTIONS.md` carries all 8. Two of them affect artifact behaviour: RUM/RUSM's OneSite dependency is a flagged working assumption (GAP-06), and the self-paced/live split rests on two workbook sheets that disagree (GAP-05).
- **The stage-to-SOP mapping needs SME confirmation.** The seven journey stage *names* are verbatim from the Add-on deck, slide 4. Mapping each to an SOP section (§9.1–§9.7) is our interpretation and is flagged as such in `00_Admin/DECISIONS.md`.
- **Benefit figures are `<TODO: measured or estimated>`** — see the benefits table. Nothing there is presented as a measured outcome unless labelled as one.
- No chat or search interface, no authentication, no live SharePoint or OneDrive connection, no document ingestion service, no transcription, no LMS or HR integration, no multi-user backend, no mobile app.
- **No real customer data.** Every customer, client, property and property-management-company name is the placeholder `PMC`. One real PMC name appeared in the SOP's meeting-invite example and was replaced; a test asserts it cannot reappear.
- Approvals recorded in the Owner view live in **that browser only**. They are not shared between reviewers and do not alter the shipped data files.

## Human-review boundary

**No drafted module reaches a learner without named human review, and this is enforced in code rather than stated as a policy.**

| Question | Answer |
| --- | --- |
| Which outputs require review? | Every module. All 9 carry a `review` field, and the Learner view renders only those whose status matches an approved value. |
| What happens without review? | The module is **withheld from the Learner view entirely**. It is not shown greyed out or flagged — it is filtered out. |
| Who holds the reviewer role? | RealPage Professional Services — Engagement Management. Named SME contacts are listed under *Sources*. The artifact requires a reviewer **name** before it will record an approval; an unattributed approval is refused with an explanation. |
| How can a reviewer verify the gate is real? | Open the **Owner** tab, enter a name, tick a module's approval box, then return to **Learner** — that module, and only that module, appears. Untick it and it disappears again. |
| What does the artifact never do? | It never approves its own content, never infers a review status, and never serves draft content to a learner without the draft-preview switch being turned on deliberately. |

The shipped state is **0 of 9 approved**, which is the truthful state. `check.js` asserts that no module can ship pre-approved.

---

## Sources

15 sponsor-provided documents, all from RealPage Professional Services — Engagement Management. The Owner tab of the artifact lists them with the modules each one feeds.

| Source | Section(s) cited | Sponsor-provided? |
| --- | --- | --- |
| `EC SOP - V3 (1).docx` | §9.1–§9.7 (primary module source), §8, Document Control | Yes |
| `PH EC - Product Dependencies Workflow.docx` | Core Principle, Phases 1–5, Product Dependency Reference table, Coordinator Validation Checklist | Yes |
| `PH EC - Product Dependency Workflow.pptx` | Slides 2–8 | Yes |
| `PH EC - Add-on Projects and Processes Review.pptx` | Slides 2–14 (slide 4 = the seven journey stages) | Yes |
| `PH EC - RUM Onboarding.pptx` | Slides 3–9 | Yes |
| `PH EC - Salesforce Training.pptx` | Slides 2–19 | Yes |
| `PH EC - Orders Review & Sales Prep Questionnaire.pptx` | Slides 3–8 | Yes |
| `PH EC - All about Leasing and Rents.pptx` | Slides 10–11 | Yes |
| `PH EC - Project Planning Process.pptx` | Slides 1–3 | Yes |
| `PH EC - SOP Review1.pptx` | Slides 10, 12–20 | Yes |
| `PH EC Intro to Onboarding, Team Channels.pptx` | Slides 5–10 | Yes |
| `PH EC - Intro to EM Onboarding, Team Channels.pptx` | Slides 7–11 | Yes |
| `Onboarding Training Agenda_Calendar for EC Role V2.xlsx` | Agenda, Calendar, Checklist, Onboarding Links sheets | Yes |
| `Job Description_Engagement Coordinator (1).docx` | Summary, Primary Responsibilities | Yes |
| `04_Implementation_Accelerator_Brief.pdf` | Whole document (context, not module content) | Yes |

**Named SME contacts** (Professional Services — Engagement Management): becky.tiner@realpage.com, sarah.jackson@realpage.com, kat.ragudos@realpage.com, megan.sellers@realpage.com, caitlin.bowen@realpage.com

Full detail, including the three permission questions per source, in `SOURCES_AND_PERMISSIONS.md`.

## Permissions

For every source, three separate questions were answered: can we access it, can we use it in this specific approved tool, and can we include or show it in the final package. The answers are recorded per source in `SOURCES_AND_PERMISSIONS.md`.

## Reused versus created during the event

**Reused (existed before the event):**
- All 15 sponsor-provided source documents listed above. None was modified; the originals are held unchanged in `01_Sponsor_Inputs/originals/`.
- The RealPage Professional Services processes themselves — the SOP, the dependency rules and the training agenda are existing practice, not our invention.

**Created during the event:**
- `artifact/app.html` — the single-file artifact, vanilla HTML/CSS/JS.
- `modules.json` — 9 modules authored from the sources, with citations.
- `products.json` — the 22-product dependency graph and the 10-question validation checklist, transcribed from the dependency document.
- `sources.json` — the source register and the 6 documented gaps.
- `check.js` — 36-assertion test suite.
- `extract-text.js` — the dependency-free document extractor.
- All working documents in `00_Admin/`, plus this package.

Full lists in `SOURCES_AND_PERMISSIONS.md`.

## AI tools and managed connectors used

| Tool or connector | Used for | When |
| --- | --- | --- |
| Claude Code (Anthropic), via RealPage-approved access | Reading the extracted source text; drafting module checklists, objectives, scenarios and next steps from it; transcribing the dependency table and validation checklist into JSON; writing the artifact, the extractor and the test suite | **Authoring time only** |
| — | No connector was used. Documents were read from local copies of the sponsor's files. | — |

**No custom MCP server was created, installed or configured for this event**, including a project-level `.mcp.json`.

**The shipped artifact uses no AI tool and no connector at run time.** It makes no network request of any kind — a test asserts that `app.html` contains no fetch call, no `XMLHttpRequest`, no external script or stylesheet, no external URL, and no credential-shaped string.

**Document ingestion used no AI.** Office files are ZIP archives of XML, so `extract-text.js` parses them with Node's built-in `zlib` — no model, no key, no network. 14 of 14 files extracted with 0 failures.

---

## Reviewer access check

A teammate who did not create the linked artifacts opened them from the Teams channel connected SharePoint workspace and confirmed they open.

| Field | Value |
| --- | --- |
| Checked by | `<TODO: name of someone who did not build it>` |
| Date/time PT | `<TODO: date/time PT>` |
| Artifact version | `<TODO: version>` |

## Recommended next step

`<TODO: the single most useful next step>` — owner: `<TODO: name>`

## Completion timestamp PT

`<TODO: date/time PT>`

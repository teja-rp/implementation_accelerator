# Sponsor inputs — IA-05

## The rule

- **`originals/`** — sponsor-provided files, **identifiable and unmodified**. Keep the sponsor's own filename. Do not rename, reformat, clean up or "fix" anything here. If you need a changed version, extract it instead.
- **`extracted/`** — converted **plain text** of those originals, one text file per original, named after it. This is what modules cite and what gets read during authoring.

If a file in `extracted/` disagrees with its original, the original wins.

The extraction script lives in `02_Working/tools/` and writes into `extracted/`. See `02_Working/tools/README.md`.

---

## Inventory

15 sponsor-provided files. Filenames are the sponsor's own, unchanged — note that the Phase 2 task list referred to them in underscored form (`EC_SOP_-_V3__1_.docx`); the actual files use spaces, and the originals here keep the real names.

| File | Type | Sponsor-provided? | Used in module IDs | Notes |
| --- | --- | --- | --- | --- |
| `EC SOP - V3 (1).docx` | docx | Yes | EC-01, EC-03, EC-04, EC-05, EC-06, EC-07 | **Primary module source.** §9.1–§9.7 carry the procedures and SLAs. §8 is "(Coming soon)" (GAP-01); Document Control effective date is blank (GAP-02). §9.3 contains a real PMC name — replaced with `PMC`. |
| `Job Description_Engagement Coordinator (1).docx` | docx | Yes | EC-01 | Role summary and competencies. DATE field blank in source. |
| `PH EC - Product Dependencies Workflow.docx` | docx | Yes | EC-ONESITE-01 | **Authoritative dependency source.** Core Principle, Phases 1–5, the 21-row Product Dependency Reference table, and the 10-question Coordinator Validation Checklist. RUSM absent (GAP-06). |
| `PH EC - Product Dependency Workflow.pptx` | pptx | Yes | EC-ONESITE-01 | 8 slides. Restates the docx and adds the Screening readiness gate (slide 4) and the BI/PA two-gate rule (slide 7). |
| `PH EC - RUM Onboarding.pptx` | pptx | Yes | EC-RUM-01 | 9 slides. RUSM rename, three components, per-component deliverables (slides 4–6), timeline (slide 7), client question and new-construction caution (slide 8). |
| `Onboarding Training Agenda_Calendar for EC Role V2.xlsx` | xlsx | Yes | all nine | 5 sheets. Agenda gives the 10-day structure (module `day`); Calendar sheets give the "(Recording)" marks (module `delivery`). Checklist sheet = GAP-03; Onboarding Links = GAP-04; sheet disagreements = GAP-05. |
| `PH EC Intro to Onboarding, Team Channels.pptx` | pptx | Yes | EC-01 | 19 slides. Role framing, manager expectations, "stay within your swimlane". Slide 4 names PS leaders — organizational context only, **not** the hackathon roster. |
| `PH EC - Intro to EM Onboarding, Team Channels.pptx` | pptx | Yes | EC-01 | 17 slides. Near-duplicate of the above with fewer filled slides. |
| `PH EC - Add-on Projects and Processes Review.pptx` | pptx | Yes | EC-01, EC-02, EC-03, EC-04, EC-06, EC-07 | 15 slides. **Slide 4 names the seven Add-On Journey stages verbatim** — the source of the stage ids. Slide 2 defines the four implementation types. Slide 3 compares New Logo / Add-On / Expansion. |
| `PH EC - All about Leasing and Rents.pptx` | pptx | Yes | EC-05, EC-ONESITE-01 | 20 slides. Conversion types and timelines. Slide 10 carries the ICD-date guardrail used in EC-ONESITE-01's scenario. **Slides 17–18 name two internal staff — not cited in any module.** |
| `PH EC - Orders Review & Sales Prep Questionnaire.pptx` | pptx | Yes | EC-02 | 10 slides. Order review steps, Resident Direct, consulting orders, action items. |
| `PH EC - Project Planning Process.pptx` | pptx | Yes | EC-ONESITE-01, EC-RUM-01 | 3 slides. Slide 2 gives the *data-flow reasons* behind dependencies (the `why` fields). **Slide 3 is the only source for RUM being last.** |
| `PH EC - Salesforce Training.pptx` | pptx | Yes | EC-02 | 26 slides. PMC page, CHEs, order requests, cancellations, property flavor. |
| `PH EC - SOP Review1.pptx` | pptx | Yes | EC-01, EC-03, EC-04, EC-05, EC-06, EC-07 | 23 slides, dated July 5 2026. Slide-level mirror of the SOP; confirms "(Coming soon)" at slide 10. |
| `04_Implementation_Accelerator_Brief.pdf` | pdf | Yes | — (context only) | 5 pages. Hackathon use case brief: problem statement, hero features, expected demo, evaluation criteria. Read directly, not extracted. |

**Two decks in the sponsor folder are deliberately not here**, because the Phase 2 task list did not name them: `PH EC - Client - Engagement Coordinator - Solution Consultant Follow-Ups.pptx` and `PH EC - RP Products and the Property Management Teams.pptx`. If they are in scope, add them to `originals/`, re-run the extractor, and register them in `sources.json`.

Keep this table and `02_Working/data/sources.json` in agreement. The JSON is what the artifact reads; this table is what a human reads. `check.js` asserts every file named in `sources.json` is actually present in `originals/`.

---

## Permissions — three separate questions

For **every** source, answer all three. They are not the same question, and a yes to one is not a yes to the next.

1. **Can we access it?** Do we have legitimate access to this document today, through our normal RealPage access?
2. **Can we use it in this specific approved tool?** Access does not imply permission to put the content through the AI tool we are using. Approval is per-tool.
3. **Can we include or show it in the final package?** Using a document during authoring does not mean we may ship it, quote it at length, or screenshot it for reviewers.

Record the three answers per source in `03_Final_Submission/SOURCES_AND_PERMISSIONS.md`. If any answer is "no" or "not sure", the safe move is to cite the document by name and section without reproducing its content — and to ask the SME.

---

## ⚠️ Real client names

**Source examples may contain real client names.** The sponsor's documents include worked examples drawn from actual implementations.

Before **anything** goes into the package — a module, a screenshot, a scenario, a quote, a walkthrough recording — every customer, client, property or property-management-company name must be replaced with the literal placeholder **`PMC`**.

This applies to extracted text too. Check `extracted/` before citing from it. A real client name in a screenshot is just as much a leak as one in a data file.

---

## What must never go in here

No credentials, API keys, tokens, connection strings or `.env` files — not in `originals/`, not in `extracted/`, not in a note. If a sponsor-provided document itself contains a credential, do not extract that portion, and tell the SME.

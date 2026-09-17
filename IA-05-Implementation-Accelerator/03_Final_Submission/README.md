# IA-05 — Implementation Accelerator for Professional Services

**This document is the reviewer's entry point.** It is written for someone who did not build the artifact, is opening it days later, and has no access to our tools, no credentials and no live explanation.

---

## How to open this

The artifact is a **single HTML file** in the `artifact/` folder next to this README.

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

`<TODO: the problem, in the user's own words, sourced from the sponsor's documents or an SME — not paraphrased upward into something grander>`

## Intended user

`<TODO: the specific person who uses this, and at what point in their onboarding>`

## What we built

A single self-contained HTML file that turns the sponsor's approved Engagement Coordinator onboarding documents into a role-, product- and stage-aware learning and reference tool, with four views:

1. **Learner** — pick role / implementation type / product / journey stage; get one module with a source-cited checklist, a practice scenario, and a next step.
2. **Dependency planner** — tick the products on a signed order; a deterministic rule engine returns the valid go-live sequence, client-side prerequisites, and anything required but missing from the order.
3. **Leader** — the same data as readiness: completion, per-stage coverage, self-paced versus facilitated split, scenario results.
4. **Owner** — source library, gaps found in the source set, module registry, and an approval gate so no drafted module reaches a learner without named human review.

## Result

`<TODO: what the artifact actually does today, stated plainly — what a reviewer will see, not what is planned>`

---

## Review path

Numbered steps for a reviewer, in order:

1. `<TODO: step — e.g. open the artifact from artifact/>`
2. `<TODO: step>`
3. `<TODO: step>`
4. `<TODO: step>`
5. `<TODO: step>`

## Demonstration path

| Field | Value |
| --- | --- |
| Walkthrough steps | `<TODO: the exact clicks, in order>` |
| Sample input | `<TODO: the approved example input to use>` |
| Expected output | `<TODO: what the reviewer will see>` |
| Screenshots | `evidence/screenshots/` — `<TODO: filenames>` |
| Recording | `evidence/walkthrough/` — `<TODO: filename>` |

## Setup or sign-in requirements

**There are none.** The artifact is a single HTML file that opens in any browser with no install, no sign-in, no configuration and no network access.

No credentials, keys or tokens are required, and **none are shared anywhere in this package** — not in a file, not in a comment, not in a message.

---

## Evidence

| Field | Value |
| --- | --- |
| Screenshots | `evidence/screenshots/` |
| Walkthrough recording | `evidence/walkthrough/` |
| Data and rule-engine test output | `<TODO: paste the console output of check.js, or name the evidence file>` |

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

- **The artifact performs no inference at run time.** All AI work happened at authoring time in an approved AI tool. The shipped file is deterministic: it reads its own data and applies documented rules. It cannot answer a question that was not authored into it, and it will not try.
- **Content covers the Engagement Coordinator Add-On path only.** Other role and implementation-type combinations are tagged in the data but **deliberately shown as unfilled gaps** rather than filled with plausible-looking content. A visible gap is honest; an invented module is not.
- **Benefit figures are `<TODO: measured or estimated>`** — see the benefits table. Nothing there is presented as a measured outcome unless it is labelled as one.
- No chat or search interface, no authentication, no live SharePoint or OneDrive connection, no document ingestion service, no transcription, no LMS or HR integration, no multi-user backend, no mobile app.
- **No real customer data.** Every customer, client, property and property-management-company name is the placeholder `PMC`.
- `<TODO: further limits found during testing>`

## Human-review boundary

`<TODO: state the boundary explicitly — which outputs require a named human reviewer before they reach a learner, who holds that role, and how the artifact's Owner-view approval gate enforces it>`

No drafted module reaches a learner without named human review. The Owner view exposes each module's review status, and unapproved modules are not served to the Learner view.

---

## Sources

| Source | Section(s) cited | Sponsor-provided? |
| --- | --- | --- |
| `<TODO: document name>` | `<TODO: sections>` | `<TODO: yes/no>` |
| `<TODO: document name>` | `<TODO: sections>` | `<TODO: yes/no>` |

Full detail in `SOURCES_AND_PERMISSIONS.md`.

## Permissions

For every source, three separate questions were answered: can we access it, can we use it in this specific approved tool, and can we include or show it in the final package. The answers are recorded per source in `SOURCES_AND_PERMISSIONS.md`.

## Reused versus created during the event

**Reused (existed before the event):**
- `<TODO: item>`

**Created during the event:**
- `<TODO: item>`

Full lists in `SOURCES_AND_PERMISSIONS.md`.

## AI tools and managed connectors used

| Tool or connector | Used for | When |
| --- | --- | --- |
| `<TODO: AI tool name>` | `<TODO: what it was used for>` | Authoring time only |

No custom MCP server was created, installed or configured for this event. The shipped artifact uses no AI tool and no connector at run time.

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

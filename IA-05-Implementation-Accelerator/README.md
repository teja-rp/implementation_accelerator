# IA-05 — Implementation Accelerator for Professional Services

**Team / channel ID:** `IA-05`
**Use case:** Implementation Accelerator for Professional Services (also referred to in event material as the *Implementation Onboarding Playbook*, channel prefix `IA`)
**Sponsor:** RealPage Professional Services — Engagement Management
**Event:** RealPage Q3 AI Hackathon

**Hard submission cutoff:**
- Thursday 17 September 2026, 11:59 PM **Pacific Time**
- Friday 18 September 2026, 12:29 PM **India Standard Time**

---

## ⚠️ This folder is a working mirror

**This is not the submission.** It is a working mirror of the team's package.

The authoritative location is the **team's Teams channel connected SharePoint workspace**. The finished package must be uploaded into **`03_Final_Submission/` in that SharePoint workspace before the cutoff**. A package that exists anywhere else — a personal drive, a laptop folder, a chat attachment — **is not a valid submission**.

Everything in this mirror is disposable. The SharePoint copy is the one that gets judged.

When you write anything a reviewer will read, link to the **Teams/SharePoint location**, never to a folder on your own machine.

---

## Start here

1. Read `00_Admin/TEAM_CHARTER.md` — who we are, what we are building, what is out of scope.
2. Read `00_Admin/STATUS.md` — what is happening right now, what is blocked, the test log.

Then pick up the concrete next task named at the bottom of `00_Admin/HANDOFF.md`.

---

## Folder purposes

| Folder | Purpose |
| --- | --- |
| `00_Admin/` | Charter, live status, handoffs, decisions, open SME questions. The team's shared brain. |
| `01_Sponsor_Inputs/` | Sponsor-provided source documents. Unmodified originals plus plain-text extractions. |
| `02_Working/` | Work in progress: the app, the data files, the extraction tool, the tests, scratch notes. |
| `03_Final_Submission/` | The package a reviewer opens. Mirrors what gets uploaded to SharePoint. |
| `04_Archive_or_Superseded/` | Dated prior drafts. Never the active working location. |

---

## Who to ask

**Subject-matter contacts (Professional Services — Engagement Management):**
- becky.tiner@realpage.com
- sarah.jackson@realpage.com
- kat.ragudos@realpage.com
- megan.sellers@realpage.com
- caitlin.bowen@realpage.com

**Event logistics:** austin.braham@realpage.com

Open questions for these contacts live in `00_Admin/SME_QUESTIONS.md`. Add to that file rather than asking ad hoc, so answers land somewhere the whole team can find them.

---

## What we are building

A **single self-contained HTML file** that turns the sponsor's approved Engagement Coordinator onboarding documents into a role-, product- and stage-aware learning and reference tool. Four views:

1. **Learner** — pick role / implementation type / product / journey stage; get one module with a source-cited checklist, a practice scenario, and a next step.
2. **Dependency planner** — tick the products on a signed order; a deterministic rule engine returns the valid go-live sequence, client-side prerequisites, and anything required but missing from the order.
3. **Leader** — the same data as readiness: completion, per-stage coverage, self-paced versus facilitated split, scenario results.
4. **Owner** — source library, gaps found in the source set, module registry, and an approval gate so no drafted module reaches a learner without named human review.

---

## Constraints (non-negotiable)

These come from the event's written rules. Breaking any one of them can invalidate the submission.

- **No credentials in any file.** Never put a credential, API key, secret, token or connection string in a prompt, connector, repository or shared file. That includes `.env` files, config files and code comments.
- **No custom MCP server.** Do not create, install or configure one for this event — including a project-level `.mcp.json`.
- **No build step.** No bundler, no package manifest, no `npm install`. The artifact must open by double-clicking it.
- **No backend.** No server, no container, no hosted service, no database.
- **AI at authoring time only.** All AI work happens while we build, inside an approved AI tool. The shipped artifact performs **no inference** and needs **no key**, so it behaves identically for every reviewer.
- **No real customer data.** No customer, client, property or property-management-company names. Use the literal placeholder `PMC`.
- **Nothing invented.** No fabricated source content, test results, timings or metrics. If a value is unknown, write `<TODO: ...>` so a human can find it by searching for `<TODO:`.

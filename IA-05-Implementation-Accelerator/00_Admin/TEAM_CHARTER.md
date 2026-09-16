# Team Charter — IA-05

| Field | Value |
| --- | --- |
| Team / channel ID | `IA-05` |
| Use case | Implementation Accelerator for Professional Services (a.k.a. Implementation Onboarding Playbook) |
| Sponsor | RealPage Professional Services — Engagement Management |
| Submission owner | `<TODO: name of the single person who posts the final package>` |
| Submission location | Team's Teams channel connected SharePoint workspace → `03_Final_Submission/` |
| Cutoff | Thu 17 Sep 2026, 11:59 PM PT / Fri 18 Sep 2026, 12:29 PM IST |

---

## Members

The roster lists five members; three are actively building. Fill this in — do not guess.

| Name | Role | Time zone | Working hours | Backup |
| --- | --- | --- | --- | --- |
| `<TODO: name>` | `<TODO: role>` | `<TODO: time zone>` | `<TODO: working hours>` | `<TODO: backup>` |
| `<TODO: name>` | `<TODO: role>` | `<TODO: time zone>` | `<TODO: working hours>` | `<TODO: backup>` |
| `<TODO: name>` | `<TODO: role>` | `<TODO: time zone>` | `<TODO: working hours>` | `<TODO: backup>` |
| `<TODO: name>` | `<TODO: role>` | `<TODO: time zone>` | `<TODO: working hours>` | `<TODO: backup>` |
| `<TODO: name>` | `<TODO: role>` | `<TODO: time zone>` | `<TODO: working hours>` | `<TODO: backup>` |

### Roles to assign or combine

The event suggests five roles. With three active builders, expect to combine them. Record who holds each one.

| Suggested role | What it covers | Held by |
| --- | --- | --- |
| Project coordinator | Keeps `STATUS.md` current, owns the clock, posts the final package | `<TODO: name>` |
| Workflow / domain lead | Owns the onboarding content and the source citations | `<TODO: name>` |
| Builder / integrator | Owns the HTML artifact and the data files | `<TODO: name>` |
| Tester / reviewer | Owns `T-01`/`T-02`/`T-03` and the fresh-eyes open test | `<TODO: name>` |
| Story and demo lead | Owns the reviewer README, walkthrough and screenshots | `<TODO: name>` |

---

## Charter

| Field | Value |
| --- | --- |
| User | `<TODO: the specific person who uses this — e.g. which role, at what point in their onboarding>` |
| Problem | `<TODO: the problem in the user's words, sourced from the sponsor's documents or an SME>` |
| First useful result | `<TODO: the smallest output that is already worth having>` |
| Success evidence | `<TODO: what we will point at to show it worked>` |
| Boundaries | `<TODO: what we will not touch — data, systems, decisions>` |
| Brief-specific requirement | `<TODO: the requirement that comes from this use case's brief and not from the generic rules>` |
| Decision owner | `<TODO: who breaks a tie>` |

---

## Scope

### In scope

- `<TODO: in-scope item>`
- `<TODO: in-scope item>`
- `<TODO: in-scope item>`

### Out of scope

Seeded from decisions already taken. Add to this list rather than quietly expanding the build.

- A chat or search interface
- Authentication / SSO
- A live SharePoint or OneDrive connection
- A document ingestion service
- Transcribing recordings
- LMS or HR integration
- A multi-user backend
- A mobile app
- Any real customer data
- `<TODO: further out-of-scope items as they come up>`

---

## Definition of done

- [ ] The artifact is a single HTML file that opens by double-clicking, with no install, no sign-in and no internet connection.
- [ ] **A reviewer who did not build the artifact can open it from Teams and follow `03_Final_Submission/README.md` without any extra context, explanation or credentials.**
- [ ] Every module a learner can reach carries a source citation, and no module reaches a learner without named human review.
- [ ] `T-01`, `T-02` and `T-03` in `STATUS.md` are filled from real observed runs.
- [ ] `node check.js` passes against the shipped data files.
- [ ] Sources and permissions are recorded in `03_Final_Submission/SOURCES_AND_PERMISSIONS.md`, with reused-versus-created stated.
- [ ] No credentials, keys or tokens anywhere in the package; no real client names (placeholder `PMC` used throughout).
- [ ] Benefit figures are labelled **measured** or **estimated** — never presented as outcomes if they are estimates.
- [ ] The package is in `03_Final_Submission/` in the Teams channel connected SharePoint workspace, and the final Teams message with the link and the completion time PT is posted before the cutoff.

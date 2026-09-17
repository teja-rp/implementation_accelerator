# SME questions — IA-05

Open questions for the subject-matter contacts. Ask here, record the answer here, then act.

**Subject-matter contacts (use these, add none):**
becky.tiner@realpage.com · sarah.jackson@realpage.com · kat.ragudos@realpage.com · megan.sellers@realpage.com · caitlin.bowen@realpage.com

**Event logistics:** austin.braham@realpage.com

All questions below are **genuine gaps observed in the sponsor-provided source set**, not hypotheticals. Each one was verified against the extracted text in `01_Sponsor_Inputs/extracted/` and is recorded with an ID in `02_Working/data/sources.json` under `gaps`, where the Owner view of the artifact displays it. Until they are answered, the affected modules stay marked as gaps rather than being filled with a guess.

> **Counts corrected during Phase 2.** Questions 3 and 4 were originally written from a spot-check that undercounted. The figures below are counted from the extracted workbook and are the ones to quote to an SME.

| Question | Why it matters | Who can answer | Asked on | Answer | Recorded in |
| --- | --- | --- | --- | --- | --- |
| **GAP-01** — EC SOP v3 §8 "Project Assignment and Capacity Tracking" is marked **"(Coming soon)"**. It lists four constraints the future process must satisfy (alphabetical assignment will not work; a queue is needed; the leader assigns by current EC capacity; the leader must manually assign applicable orders to the EC's name) but states no current process. Is there an interim process today? | The `assignment` stage is the first stage of the Add-On journey. Without this we cannot write the first thing a new EC ever needs to know — how work reaches them — and we will not invent it. Also confirmed missing in SOP Review1 deck, slide 10. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `EC-01`, final step |
| **GAP-02** — The EC SOP's Document Control block reads **"Effective Date: [Insert Date]"** — literally blank. Owner and review cycle are filled in; the date is not. What version and effective date should modules cite? | Every module carries a source citation. A citation to an undated document is not verifiable, and the accuracy criterion depends on citations a reviewer can check. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `sources.json` → `EC SOP - V3 (1).docx` version field |
| **GAP-03** — The onboarding workbook's Checklist sheet lists **20** tools and compliance courses. Only **four** carry a ticket justification (Salesforce Access, New Hire Direct Line, Unified Platform, Snagit). The other **16** have an empty justification cell. Are they documented anywhere? | The checklist drives the Day-1 access modules. Sixteen entries with no documented justification means we cannot tell a learner why an access is needed or how to request it. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `<TODO: module id — no Day-1 access module drafted yet>` |
| **GAP-04** — The workbook's "Onboarding Links" sheet lists **19** session titles in a single column with **no URLs or destinations of any kind**. "Orders Review" appears twice. Where do these sessions live? | These are the facilitated half of the self-paced / facilitated split shown in the Leader view. Without destinations we can name the sessions but not point a learner to them. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `sources.json` → GAP-04 |
| **GAP-05** — The workbook's Agenda sheet and its two Calendar sheets **disagree about days 7–9**, and the two Calendar sheets disagree with each other about which sessions are recordings. Which sheet governs? | Module `day` comes from the Agenda sheet and module `delivery` (self-paced vs live) comes from the "(Recording)" marks in the Calendar sheets. The Leader view's 2-self / 7-live split rests on this, so a wrong answer misreports the learning path. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `sources.json` → GAP-05; every module's `day` and `delivery` |
| **GAP-06** — The Product Dependency Reference table lists **21** products. **RUM / RUSM is not among them**, and neither dependency document states a OneSite prerequisite for it. Its place in the sequence comes only from the Project Planning Process deck, slide 3. Does RUSM depend on OneSite, and where does it belong in the reference table? | The Dependency Planner computes a go-live sequence. We currently carry `requires: ["onesite"]` for RUM as a working assumption, flagged in the data and surfaced in the artifact. If it is wrong, the planner sequences it wrongly. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `products.json` → `rum.requiresSrc`; `EC-RUM-01` |
| **GAP-07** — The SOP states the client-email SLA two different ways: §9.2 gives **"24 hours"** to acknowledge, §9.3 says **"within 1 business day"**. Which governs? | These differ over a weekend. `EC-05` carries the 24-hour figure with the discrepancy flagged in a nuance note. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `EC-05`, step 6 nuance |
| **GAP-08** — The training calendar lists "RUM Onboarding" under **Additional Onboarding Recordings** rather than as a numbered training day. Where does it belong in the 10-day agenda? | `EC-RUM-01` currently carries `day: 10` as a working placement, flagged in the module. The Leader view's day sequencing depends on it. | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer, verbatim>` | `EC-RUM-01`, final step |
| `<TODO: question>` | `<TODO: why it matters>` | `<TODO: which contact>` | `<TODO: date PT>` | `<TODO: answer>` | `<TODO: where recorded>` |

## Interpretive choices needing confirmation, not gaps

These are places where the source is complete but we made a judgment call. They need SME agreement because the accuracy criterion is "SMEs agree with steps, sequence, product and process nuances".

| Choice | Why it needs confirming | Who can answer | Answer |
| --- | --- | --- | --- |
| **Stage-to-SOP mapping.** The seven Add-On journey stages are named verbatim in the Add-on Projects and Processes Review deck, slide 4. Mapping each one to an SOP section (§9.1–§9.7) is **our interpretation**, not a labelling the source states. | If a stage is mapped to the wrong SOP section, the checklist a learner sees at that point in the journey is the wrong checklist. See `DECISIONS.md`. | becky.tiner@realpage.com / sarah.jackson@realpage.com / kat.ragudos@realpage.com | `<TODO: answer>` |
| **Checklist-to-product tagging.** The ten Coordinator Validation Checklist questions are verbatim, but the `appliesTo` tags that decide which questions show for a given product selection are ours. | A wrong tag hides a relevant question from a coordinator mid-planning. | `<TODO: which contact>` | `<TODO: answer>` |

---

**Fair-play rule.** Any answer that changes **scope, data, tooling or submission behaviour** must be recorded in `DECISIONS.md` **and shared with the other teams working this same use case**. An SME answer is a shared input, not a competitive advantage.

Answers that only clarify content for our own modules still get recorded in the table above so the citation trail stays intact.

# Design plan — IA-05 Implementation Accelerator

Written **before** the CSS, per the build spec. Revisions made during the build are logged at the bottom.

---

## Who this is for, and what that implies

Not a dashboard. An **operations reference for one person under a clock**.

Three facts from the source set drive every decision below:

1. **The user works nights.** `PH EC Intro to Onboarding, Team Channels.pptx` slide 13 gives EC business hours as **9PM–6AM / 10PM–7AM (DST)** from Manila. The primary reading environment is a dim room at 3am, not a bright office.
2. **Everything is on a clock.** The SOP attaches hard SLAs to the work: intake within 1–2 business days (§9.1), intro email 1–3 business days (§9.2), client email acknowledgement within 24 hours (§9.2), meeting recap within 24 hours (§9.4), End-of-Engagement notice 2 weeks prior (§9.7). An EC gets into trouble over elapsed time, not over comprehension.
3. **The costly mistakes are sequencing mistakes.** The dependency workflow exists because activating Payments before OneSite is live, or scheduling Screening without a mirror property, breaks a go-live. `All about Leasing and Rents` slide 10 shouts one of these in capitals: *"REMINDER: DO NOT use the ICD date as your OneSite go live date."*

So: dark-first, clock-forward, sequence-literal. Those are earned by the material, not chosen for taste.

---

## Guiding principles

**1. Sequence is earned; hierarchy is not.**
Two things in this domain are genuinely ordered: the **seven Add-On journey stages** and the **product go-live waves**. Those get numbers, a graduated colour ramp, and left-to-right positional meaning. The **four views are peers** — role-based destinations, not steps — so they get a flat tab row with no numbering, no chevrons, no progress bar. Nothing else in the UI gets sequential treatment.

**2. The clock is the subject.**
Any value with elapsed time in it (an SLA, a lag, the RUSM 15th-of-month deadline) renders in mono at full contrast with a rule above it. It is never body prose. If an EC scans one thing per module, it should be the deadline.

**3. Show the gap; never fill it.**
Unknowns are first-class content, not absence. A `<TODO:` marker renders as a labelled gap chip with its reason attached — visually distinct from real content but not hidden, not greyed into invisibility. An empty result says which filter to relax. This is the project's accuracy commitment made visible.

---

## Colour — 6 functional values + a sequence ramp

Dark is the default (principle: night shift); light is a full peer, not an afterthought.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--ground` | `#12171D` | `#F2F4F6` | Page base. Deliberately a blue-grey slate, **not** near-black. |
| `--panel` | `#1A212A` | `#FFFFFF` | Content surfaces. |
| `--line` | `#2C3641` | `#D4DAE1` | Hairline borders — the primary separation device. |
| `--ink` | `#E6EAEE` | `#12171D` | Primary text. |
| `--ink-soft` | `#9AA7B4` | `#5A6775` | Secondary text, citations. |
| `--signal` | `#6FA8DC` | `#2A6099` | Interactive: links, focus, active tab, primary action. |

Three **state** colours, used only for state and never decoratively:

| Token | Dark | Light | Means |
| --- | --- | --- | --- |
| `--watch` | `#E0A84E` | `#9A6410` | On a clock / awaiting review / open gap. |
| `--block` | `#E08585` | `#A03434` | Blocked, missing prerequisite, avoid-this-answer. |
| `--clear` | `#74C295` | `#256B47` | Satisfied, approved, correct answer. |

### Wave ramp (the sequence)

Five steps, cool → warm, reading as **time passing** rather than good → bad:

| Wave | Dark | Light | Meaning |
| --- | --- | --- | --- |
| parallel | `#7E8C9B` steel | `#6B7A8C` | No prerequisite — can run alongside anything. |
| 1 | `#5B8FC9` | `#2A6099` | The OneSite core cluster. |
| 2 | `#7A7FC9` indigo | `#4A4FA0` | First dependent layer. |
| 3 | `#A578C4` violet | `#7A4A9B` | Second dependent layer. |
| 4+ | `#C98F5B` | `#965A1E` | Final integrations. |

Blocked products sit **outside** the ramp in `--block`, because "cannot be sequenced" is a different kind of thing from "sequenced late".

### Checked against the generic-AI-default list

- ✗ cream + terracotta — not used; the warm end of the ramp is a single muted clay at wave 4+, against a cool slate ground.
- ✗ near-black + one neon accent — the ground is `#12171D` (visibly blue-grey, not black), and there are six functional hues, none saturated past ~60%.
- ✗ identical rounded cards with matching soft shadows — **no `box-shadow` anywhere in the stylesheet.** Radius is a flat `3px`. Separation is done with hairlines and a 2px left rule whose colour carries meaning (signal / watch / block / clear). Panels are differentiated by that rule, not by elevation.

---

## Type — two roles

No webfonts: a network request is forbidden, so both stacks are system fonts.

- **UI and prose** — `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Body 15px/1.55.
- **Operational values** — `ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace`. Used for SLAs, module IDs (`EC-ONESITE-01`), product ids, wave numbers, stage ids, source citations, and checklist ids.

The split is functional, not stylistic: **everything in mono is something an EC copies verbatim** into a tracker, a calendar invite subject, or an email to Sales. Mono makes those scannable and unambiguous (`EC-01` vs `EC-Ol`).

Scale: 20 / 16 / 15 / 13 / 11.5px. Five sizes, no more.

---

## Layout per view

Shared shell: a sticky top bar holding the title, the gate counter, a **current-view indicator** (required by the router spec), and the four peer tabs. Content is a single 1080px column with a 16px gutter. No side rail — it would collapse badly at 375px, which is a real target given ECs coordinate from phones between calls.

### `#/learner`

```
┌──────────────────────────────────────────────────────────┐
│ IA-05  Implementation Accelerator   [gate 0/9]  Learner  │
│ ┌ Learner ┬ Planner ┬ Leader ┬ Owner ┐                   │
├──────────────────────────────────────────────────────────┤
│ ┌─ filters (sticky) ─────────────────────────────────┐   │
│ │ Role[EC v] Type[Add-On v] Product[Any v] Stage[v]  │   │
│ │ 9 match · 0 past the gate      [ ] preview drafts  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌ 3 ─ EC-03 ─ Introduction ─ Day 2 ─ live ───────────┐   │
│ ║ EC Intro & Kickoff Call                            │   │  ← 2px left rule,
│ ║ I can introduce myself and run a kickoff call...   │   │    colour = stage
│ ║ ┌────────────────────────────────────────────────┐ │   │
│ ║ │ SLA  intro email 1–3 business days · recap 24h │ │   │  ← mono, --watch
│ ║ └────────────────────────────────────────────────┘ │   │
│ ║ CHECKLIST                                          │   │
│ ║  1. Send the EC intro email …                      │   │
│ ║     └ nuance: always copy the assigned Sales Rep   │   │
│ ║ PRACTICE · guardrail                               │   │
│ ║  ( ) option A   ( ) option B   ( ) option C        │   │  ← click = inline
│ ║ NEXT → EC-04, because …                            │   │    verdict + cite
│ ║ source: EC SOP v3, §9.2 · SOP Review1 slide 13     │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

Stage number sits in the card header and the left rule is tinted by stage, so a learner scrolling a filtered list can see where in the journey they are without reading. Empty state names **which filter to relax** and offers a one-click reset.

### `#/planner`

Two columns ≥860px, stacked below.

```
┌──────────────────────────────────────────────────────────┐
│ ORDER (22)                │ GO-LIVE SEQUENCE             │
│ ┌ Core ──────────────┐    │ ┌ svg, redraws on toggle ──┐ │
│ │ [x] OneSite L&R    │    │ │  ║        ┌──┐           │ │
│ │ Core & operations  │    │ │  ║ ┌────┐ │P2│──┐        │ │
│ │ [x] Screening      │    │ │  ║ │ W1 │ └──┘  │ ┌──┐   │ │
│ │ [ ] Facilities     │    │ │  ║ │core│──┐    └─│W3│   │ │
│ │ Financial          │    │ │  ║ └────┘  │      └──┘   │ │
│ │ [x] Payments       │    │ │  ║ blocked │              │ │
│ │ …                  │    │ │  ║ ┌╌╌╌╌┐  │              │ │
│ │ [clear] [example]  │    │ │  ║ ╎ ⚠  ╎  │              │ │
│ └────────────────────┘    │ │  ║ └╌╌╌╌┘  │              │ │
│                           │ └──────────────────────────┘ │
│                           │ BLOCKED — cannot sequence    │
│                           │ CLIENT-SIDE PREREQUISITES    │
│                           │ MISSING FROM THIS ORDER      │
│                           │ VALIDATION CHECKLIST (n/10)  │
└──────────────────────────────────────────────────────────┘
```

The SVG is the centrepiece: one column per wave, x-position = sequence, node fill = wave ramp, dashed red outline = blocked. Edges are drawn only between selected products that actually have a `requires` relationship. Everything redraws on every checkbox toggle — no calculate button.

### `#/leader`

```
│ [9 modules] [7/7 stages] [4/9 practice] [0/9 gate]       │
│ ── structural coverage only; no learner data exists ──    │
│ self-paced ████░░░░░░░░░░░░ 2 · live 7                    │
│ STAGE COVERAGE            sort: [journey|modules|gate v]  │
│ ▸ 1 assignment   EC-01                    live    0/1     │  ← click row
│ ▸ 4 data         EC-04 EC-RUM-01          mixed   0/2     │    to filter
│ MODULES (filtered: data)                       [clear]    │
```

### `#/owner`

```
│ APPROVAL GATE   reviewer [____________]  0 of 9 past      │
│ REGISTRY                                                  │
│  EC-01  Engagement Intake   day 1  live  [drafted ▸]      │  ← click badge
│  EC-03  EC Intro & Kickoff  day 2  live  [approved ✓]     │    to cycle
│ GAPS FOUND IN THE SOURCE SET (6)                          │
│ SOURCE LIBRARY (15)                                       │
```

The review badge cycles `drafted → in review → approved → drafted` on click, and Learner's results change immediately — that is the demo that proves the gate is a filter and not a label.

---

## Motion

One transition only: `120ms ease` on `background-color`, `border-color`, `color`, `opacity`. View changes fade the panel in over 140ms with a 4px upward drift. Wave nodes in the SVG ease their `fill` and `transform` over 180ms so a toggle reads as products *moving between waves* rather than the picture being replaced.

All of it sits behind `@media (prefers-reduced-motion: reduce)`, which sets every duration to `0.01ms`. No spinners, no pulsing, no attention-seeking animation — this is a reference tool consulted mid-task.

---

## Accessibility commitments

- Tabs as a proper widget: `role="tablist"` / `role="tab"` / `role="tabpanel"` with `aria-labelledby`, arrow-key navigation.
- `aria-live="polite"` on each view's results region, so filter and toggle changes are announced (this was a gap in the previous build).
- Scenario options as a `radiogroup`, not clickable divs.
- The SVG carries `role="img"` plus a `<title>`/`<desc>`, and every node has a `<title>`; the same information exists as text in the panels below, so the graph is an aid and never the only carrier.
- Every text/background pair ≥ 4.5:1 in both themes, checked numerically before shipping.
- Focus visible on every interactive element; nothing reachable only by mouse.

---

## Revisions made during the build

- **Wave ramp reduced from 6 steps to 5.** The plan sketched a separate colour for wave 5+; no realistic order reaches wave 5 (all 22 products selected tops out at wave 4), so a sixth step would have been an unused token. Wave 4+ now absorbs anything deeper.
- **Blocked products moved out of the wave columns into a dedicated leading column.** Originally sketched inline in their computed wave. During the build this was clearly wrong: the previous version's habit of showing a blocked product in "wave 0" is exactly the defect the audit flagged, and putting blocked nodes anywhere in the ramp repeats it visually. They now sit in a separate, visually-distinct column that is not part of the sequence.
- **Added a transitive-blocking rule not in the original plan.** A product whose prerequisites are present but themselves blocked is also blocked. Without this, Loft Leasing reads as clear while Payments beneath it is stalled. The rule engine and `check.js` were both extended.
- **Dropped the planned "ghost node" for a missing prerequisite.** Rendering absent products as dashed placeholders inside the graph made the edge routing ambiguous when several were missing at once. The information is carried by the node's warning marker, its `<title>`, and the "missing from this order" panel instead.
- **Two-column planner threshold set at 860px, not the 760px sketched.** At 760px the SVG column was too narrow for four wave columns plus labels without clipping.
- **Two light-mode tokens darkened after measuring contrast.** `--watch` went `#9A6410` → `#8A5A0E` (4.49:1 → 5.32:1 on `--watch-bg`) and `--w-par` went `#6B7A8C` → `#5A6878` (3.98:1 → 5.17:1 for the `--ground`-coloured SVG label sitting on it). Both were below the 4.5:1 commitment above; measured, not eyeballed. Every pair now passes in both themes.

### Architectural deviations found by testing, not planned

These three were not in the plan. Each was a real defect the walkthrough exposed.

- **The router applies the view directly instead of routing through the hash.** As first written, `go()` wrote `location.hash` and waited for a `hashchange` event to switch views. On an opaque origin the hash write is silently ignored and no event fires, so **every tab click did nothing** — the app was completely unnavigable. It now calls `applyView()` directly and uses `history.pushState` for addressability inside a `try/catch`; `hashchange` and `popstate` handle only external navigation (back/forward, a hand-edited URL) and are idempotent. Back/forward, bookmarkable `#/routes` and keyboard tab navigation were all then verified working.
- **Targeted re-render, because a full re-render destroyed the control being used.** The plan said "a render function keyed off state", which I implemented as a single full re-render per view. That meant changing a Planner checkbox rebuilt the whole product list — destroying and recreating the checkbox the user had just clicked, losing focus on every toggle; the same applied to the Learner selects. `setState` now takes `{keepPicker}` / `{keepFilters}`, so the control the user is operating survives and only the dependent output redraws. Focus retention is verified in all three places (planner checkbox, learner select, owner badge).
- **A `chip` count and the filter counts update out-of-band.** A consequence of the above: the selection counter and the "n match / n past the gate" line live inside panels that are no longer rebuilt on every change, so they are written directly. This is the one place where two code paths touch the same data, and it is deliberate — the alternative was the focus bug.

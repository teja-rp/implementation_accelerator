# Feature map — IA-05 artifact

Built by reading the actual files, not the brief or the earlier prompts:
`02_Working/app/app.html` (2138 lines), `02_Working/data/modules.json` (601),
`02_Working/data/products.json` (307), `02_Working/data/sources.json` (155),
`02_Working/tests/check.js` (545).

**Audit date:** 16 Sep 2026 · **Artifact md5:** `b42a4622f747059ce17c191cb6efc363`
(identical in `02_Working/app/` and `03_Final_Submission/artifact/`).

## How to read the "Verified how" column

| Label | Meaning |
| --- | --- |
| **runtime** | Driven in a real browser (built-in preview pane, `file://`), result read back from the live DOM. |
| **traced** | Read in source at the cited lines; logic followed by hand. No runtime observation. |
| **node** | Observed by executing code in Node and capturing stdout. |
| **NOT VERIFIED** | Could not be checked in this environment; reason given. |

> **Environment note affecting every runtime row.** The preview pane serves the page from a `data:` URL. `window.localStorage` **throws** there (`Storage is disabled inside 'data:' URLs`). All runtime rows below were therefore observed with browser storage unavailable. The app's `try/catch` absorbed this and nothing broke, but **approval persistence across a page reload was not observable** — see `AUDIT_REPORT.md` A-04 and the closing paragraph.

---

## Data loading (shared by all views)

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| — | Inline JSON blocks | `<script type="application/json">` × 3, ids `data-modules`, `data-products`, `data-sources` | `readJSON` `app.html:1370`; called unguarded at `app.html:1374-1376` | — | **runtime** — `document.querySelectorAll('script[type="application/json"]').length` → `3`. **traced** — no `try/catch` around 1374-1376; the only two in the file are `lsGet` `:1416` and `lsSet` `:1423`. |
| — | Data ↔ file parity | vs `02_Working/data/*.json` | `inlineJSON` + `deepEqual` `check.js:435,444` | — | **node** — `check.js` → 3 parity assertions PASS. **Shell** — `md5sum` pairs identical across working and submission copies. |
| — | Approval state restore | `localStorage["ia05.approvals.v1"]` | `lsGet` `:1416`, IIFE `restore()` `:1427` | — | **runtime** — read threw `Storage is disabled inside 'data:' URLs`; caught, returned `null`, app continued. Persistence itself **NOT VERIFIED** (see note above). |

---

## Navigation

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| Shell | 4 tab buttons | — | `show(view)` `app.html:1527`; delegated click `:1546` | — | **runtime** — clicked all 4; `aria-selected` and `.view.active` toggled correctly. |
| Shell | Dynamic panel id | — | `el('view-' + v)` `:1533` | — | **traced + runtime** — prefix `"view-"`; all four ids exist in markup (`view-learner` :227, `view-planner` :252, `view-leader` :272, `view-owner` :282). DOM audit: 0 unresolved id refs. |
| Shell | Header gate badge | `modules[].review` + `state.approvals` | `updateGateBadge` `:1455`, called from `renderLearner` `:1674` and `renderOwner` `:2010` | — | **runtime** — read `0/9` at load; `2/9` after approving two; `0/9` after reset. |
| Shell | State across navigation | `state.*` | `show()` re-renders leader/owner/learner only; planner is **not** re-rendered on tab switch (`:1536-1538`) | — | **runtime** — 12 rapid full cycles: no error; product selection survived (`1 of 22 selected`); draft-preview toggle stayed checked; scenario picks survived. |

---

## Learner view

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| Learner | Role picker `#selRole` | `modules[].role` + a hardcoded `EM` push | `initLearnerControls` `:1556-1569` | — | **runtime** — 2 options (`EC`, `EM`). **traced** — `EM` is appended literally at `:1564`, then de-duplicated `:1566-1571`; it is not derived from data. |
| Learner | Type picker `#selType` | `MODULES_DATA.types` (4 entries) | `fillSelect` `:1550`, called `:1573` | `typesSrc` = "Add-on Projects and Processes Review deck, slide 2" (in data, **not rendered**) | **runtime** — 4 options. **traced** — `typesSrc` is never read by any render function. |
| Learner | Product picker `#selProduct` | `products[].id/.name` + `"any"` | `:1575-1577` | — | **runtime** — 23 options (22 products + `any`). |
| Learner | Stage picker `#selStage` | `MODULES_DATA.stages` (7) + `"any"` | `:1579-1581` | `stagesSrc` rendered in **Leader** view only (`:1974`) | **runtime** — 8 options. |
| Learner | Module matching | `role`, `type`, `stage`, `product` | `matchingModules()` `:1598-1611` | — | **runtime** — swept 2 roles × 4 types (8 combos) and, for `EC/add-on`, all 8 stages × all 23 products (31 further states). 0 JS errors. Only `EC/add-on` matches; 7 combos show the gap state. |
| Learner | Sort order | `stages` index, then `day` | `:1607-1611` | — | **runtime** — returned `EC-01,02,03,04,EC-RUM-01,05,EC-ONESITE-01,06,07` — journey order, `day` breaking ties within `data` and `scheduling`. |
| Learner | **Approval gate filter** | `modules[].review`, `state.approvals` | `isApproved` `:1445`; `var visible = all.filter(isApproved)` **`:1675`**; only `visible` rendered at `:1718` | per-card badge | **runtime + traced** — this is a **real render filter, not a badge**. Shipped state 0/9 → 0 cards. Approving `EC-01`+`EC-03` in Owner → exactly those 2 appeared. |
| Learner | Gate empty state | `hidden.length` | `:1691-1707` | — | **runtime** — text captured: "The approval gate is closed, and that is the correct behaviour… 9 modules match your selection, and none has passed SME review." |
| Learner | Gap empty state | `all.length === 0` | `:1680-1689` | — | **runtime** — captured for all 7 unpopulated role/type combos. |
| Learner | Draft-preview toggle `#prevToggle` | `state.previewUnapproved` | emitted `:1699` / `:1715`; wired `wireLearner` `:1727-1733` | — | **runtime** — element is created inside `learnerOut.innerHTML` (DOM audit: `runtime-innerHTML`), re-wired each render, state survives navigation. **No restriction on who can toggle it** (traced). |
| Learner | Checklist render | `modules[].steps[].t/.n` | `moduleCard` `:1630-1637` | `m.source` at `:1667`; per-step inline notes | **runtime** — 10 cards, all steps rendered; `<TODO:` markers rendered as badges (23 in the full list) via `todoify` `:1474`. |
| Learner | SLA banner | `modules[].sla` | `:1626-1628` (conditional) | — | **traced + runtime** — present on 7 modules, omitted on `EC-02`/`EC-06` which have no `sla` key. |
| Learner | Scenario render | `modules[].scenario.q/.opts[]` | `:1647-1663` | `o.src` per option, `:1658` | **runtime** — 4 scenario blocks (EC-03, 05, 06, EC-ONESITE-01). |
| Learner | Verdict feedback | `opts[].verdict/.fb/.src`, `state.picks` | class `opt.<verdict>.picked` `:1653`; CSS reveals `.fb` at `:1657`; picks recorded `:1740` | yes — citation under each feedback | **runtime** — clicked option 2 of `EC-ONESITE-01`: class `opt poor picked`, label "Avoid.", `.fb` computed `display: block`, citation "All about Leasing and Rents deck, slide 10 (ICD date…". |
| Learner | Keyboard access on options | — | `role="button" tabindex="0"` `:1653`; `keydown` Enter/Space `:1745` | — | **traced + runtime** — 56 focusables, 0 `tabindex="-1"`. |
| Learner | "Next step" render | `modules[].next` | `:1665` | `m.source` + `m.owner`/`m.review` line `:1667-1668` | **runtime** — present on all 9. |

---

## Dependency Planner

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| Planner | Checkbox list, grouped | `products[].group/.name/.note/.core/.withCore/.early` | `initPlanner` IIFE `:1757-1798`; `GROUP_ORDER` `:1755` | `p.note` under each name | **runtime** — 22 checkboxes across 6 groups. |
| Planner | Selection count | `state.selected` | `:1802` | — | **runtime** — `0 / 22`, `1 / 22`, `22 of 22` all observed. |
| Planner | Clear / Load example | fixed 9-product array `:1792` | `:1784`, `:1791` | — | **runtime** — both drive the real checkbox DOM and re-render. |
| Planner | **Wave computation** | `products[].requires/.core/.withCore` | **`waveOf` `app.html:1491`** | `p.src` per row `:1836` | **runtime** — see the rule-engine table below. |
| Planner | **Is it the same code as `check.js`?** | — | **No — a second implementation.** `app.html:1491` vs `check.js:182` | — | **traced (diff)** — `check.js` uses `Map`/`Set`/`const`/`for…of`; `app.html` uses plain objects/`var`/`forEach`. Semantically equivalent on every case tested, but **no assertion in `check.js` compares the two**. The comment at `app.html:1486` claims they "cannot disagree"; nothing enforces that. See `AUDIT_REPORT.md` **A-11**. |
| Planner | Wave grouping / headers | computed waves | `:1820-1841` | — | **runtime** — header text for wave 0 is literally "Wave 0 — no selected prerequisite (parallel)". |
| Planner | Lag + "Why" lines | `p.lag`, `p.why` | `:1834-1835` | `p.src`; `lagSrc`/`whySrc` exist in data but are **not rendered** | **runtime + traced**. |
| Planner | Client-side prerequisites | `p.prereq`, `p.prereqSrc` | `:1845-1858` | `p.prereqSrc \|\| p.src` | **runtime** — Screening + BI shown for the example order; "None of the selected products carries a documented client-side prerequisite" shown for `[esupply]`. |
| Planner | **Blockers computation** | `p.requires`, `p.integrateAfter` | **`blockers` `app.html:1511`** (second impl; `check.js:253`) | `p.note` in the "why it matters" cell | **runtime** — see rule-engine table. |
| Planner | Clean-order badge | `Object.keys(bl).length === 0` | `:1863-1866` | — | **runtime** — all-22 selection → 0 missing-prereq rows + `clean` badge. |
| Planner | Watch-outs | `p.caution`, `p.cautionSrc` | `:1884-1891` | `p.cautionSrc \|\| p.src` | **runtime** — rendered for Loft Living / G5 Website / RUM selections. |
| Planner | RUM detail panel | `rum.components/.deliverables/.timeline/.clientQuestion/.requiresSrc` | `:1894-1908` | `componentsSrc`, `timelineSrc`, `deliverablesSrc` | **runtime** — 3 deliverable rows (RB/UEM/VCR); `requiresSrc` `<TODO:` surfaced as a warning note. |
| Planner | Validation checklist filter | `validationChecklist[].q/.appliesTo`, `checklistSrc` | `:1911-1924` | `PRODUCTS_DATA.checklistSrc` | **runtime** — 10 of 10 for all-22; 9 for the example order; 4 (VC-03/06/09/10) for `[loftleasing, website]`; 3 (VC-01/03/10) for combo A. |
| Planner | Empty state | `!sel.length` | `:1805-1810` | — | **runtime** — "Nothing selected yet. Tick the products on the signed order…". |

### Rule engine — hand-calculated vs observed

Waves worked out by hand from `products.json` `requires`/`core`/`withCore`, then compared with what the live planner rendered. **All three combinations below are absent from `check.js`'s assertions.**

| Combination | Hand-calculated | Observed in browser | Match |
| --- | --- | --- | --- |
| **A** `[onesite, acctg, knock, esupply, ccaa]` | `onesite`=1 (core); `acctg`/`knock`/`esupply`/`ccaa`=0 (no `requires`). Blockers: none — `acctg`/`knock` `integrateAfter: [onesite]` and `onesite` is selected. | W0: Accounting Entity, Knock, CC-Answer Automation, eSupply · W1: OneSite. Blockers `{}`. | ✅ |
| **B** `[payments, loftleasing, loyalty, loftliving]` (no OneSite) | `payments`=0 (`requires:[onesite]` **absent** → 0); `loftliving`=0 (same); `loftleasing`=1+0; `loyalty`=1+max(0,0). Blockers: `payments→onesite`, `loftliving→onesite`. | W0: Payments, Loft Living · W1: Loft Leasing, Loft Loyalty. Blockers: Loft Living→OneSite, Payments→OneSite. | ✅ (and this exposes **A-01/A-02**) |
| **C** `[onesite, website, knock, loftliving, payments, loftleasing, bi, pa, rum]` | `knock`=0; `onesite`=1; `payments`/`loftliving`/`bi`/`pa`/`rum`=2; `loftleasing`=3; `website`=1+max(1,2,3,0)=4. | W0: Knock · W1: OneSite · W2: Payments, Loft Living, BI, Performance Analytics, RUM/RUSM · W3: Loft Leasing · W4: G5 Website. | ✅ |
| **D** (edge) all 22 | max wave 4, 0 blockers | 5 wave groups, max 4, 0 missing-prereq rows, `clean` badge | ✅ |
| **E** (edge) `[]` | empty-state prompt | prompt shown, `0 of 22 selected` | ✅ |
| **F** (edge) `[esupply]` (no `requires`) | wave 0, no prereqs | single W0 group + "None … carries a documented client-side prerequisite" | ✅ |

The algorithm matches its specification exactly. **A-01 and A-02 are defects in what that specification does, not coding errors** — combination B shows `waveOf` cannot distinguish "has no prerequisite" from "prerequisite is missing from the order", because both return 0.

---

## Leader view

Every number recomputed independently from `modules.json` in Node and compared with the rendered DOM.

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| Leader | "Structural coverage" disclaimer | static markup | `app.html:273-278` | — | **runtime** — rendered above all stats. |
| Leader | Modules in registry | `modules.length` | `renderLeader` `:1944` | — | **runtime** `9` = **node** `9` ✅ |
| Leader | Stages covered | `stages` × `modules[].stage` | `:1935-1937`, `:1945` | `MODULES_DATA.stagesSrc` at `:1974` | **runtime** `7 / 7` = **node** `7 / 7` ✅ |
| Leader | Modules with a scenario | `!!m.scenario` | `:1933`, `:1947` | — | **runtime** `4 / 9` = **node** `4 / 9` ✅ |
| Leader | Past the approval gate | `isApproved` | `:1938`, `:1949` | — | **runtime** `0 / 9` at load (shipped), `1 / 9` after one session approval = **node** shipped `0` ✅ |
| Leader | Self vs facilitated split | `modules[].delivery` | `:1931-1932`, `:1955-1961` | — | **runtime** "2 self-paced (22%) · 7 facilitated / live (78%)" = **node** `2 / 7`, 22% rounded (exact 22.2%) ✅ |
| Leader | Split-bar widths | same | `:1957-1958` | — | **traced** — `selfPct` and `100 - selfPct` sum to 100 by construction. |
| Leader | GAP-05 caveat on the split | static string | `:1962-1965` | — | **runtime** — rendered; the split is flagged as needing SME confirmation. |
| Leader | Per-stage table | `modules` grouped by `stage` | `:1967-1990` | `stagesSrc` footer | **runtime** — 7 rows; module IDs, delivery, practice count and per-stage gate fraction all matched a manual grouping. |
| Leader | Open `<TODO:` count | `JSON.stringify(m).match(/<TODO:/g)` | `:1939-1943`, `:1997` | — | **runtime** `14` = **node** `14` ✅ (and = `grep -o` count in `modules.json`) |
| Leader | "no learner data" statement | static string | `:2001-2002` | — | **runtime** — rendered. **No fabricated completion/score/time metric found anywhere in this view** (every one of the six numbers above traces to real registry data). |
| Leader | **Scenario *results*** | `state.picks` | **absent** — `state.picks` is read only at `:1652` and `:1661`, both inside `moduleCard` | — | **traced** — see `AUDIT_REPORT.md` **B-01**. The view reports scenario *presence*, never *results*. |

---

## Owner view

| View | Sub-feature / control | Data it reads | Logic (function + file:line) | Source citation displayed | Verified how |
| --- | --- | --- | --- | --- | --- |
| Owner | Gate summary panel | `approvedCount()` | `renderOwner` `:2012-2021` | — | **runtime** — "0 of 9 modules are past the gate" at load. |
| Owner | Reviewer name input `#revName` | `state.reviewer` | emitted `:2023-2024`; `input` handler `:2105` | — | **runtime** — labelled (`label[for="revName"]` present); value persisted into `state`. |
| Owner | **Approval enforcement** | `state.approvals` | change handler `:2115-2131`; **empty-name branch `:2119-2125`** | — | **runtime** — ticking with an empty name **reverted the checkbox** and alerted "Enter a reviewer name before approving a module…". With a name, approval recorded and attributed ("approved by Test Reviewer"). |
| Owner | Reset approvals | `state.approvals = {}` | `:2110-2114` | — | **runtime** — returned badge to `0/9`. |
| Owner | Module registry table | `modules[]` all fields | `:2027-2044` | `m.source` per row | **runtime** — 9 rows; shipped `review` string shown verbatim per row. |
| Owner | Shipped-approved lock | `shippedApproved(m)` | `disabled` attr `:2039` | — | **traced** — no module is shipped-approved, so no row is currently disabled. |
| Owner | Gaps table | `SOURCES_DATA.gaps` | `:2046-2058` | `g.doc` + `g.where` | **runtime** — **6 rows** (GAP-01…06). `SME_QUESTIONS.md` references **8** → see **A-08**. |
| Owner | Source library table | `SOURCES_DATA.sources` | `:2060-2078` | `s.doc`, `s.version`, `s.mode` | **runtime** — 15 rows; `<TODO:` version strings rendered as badges via `todoify`. |
| Owner | Boundaries list | static strings | `:2080-2090` | — | **runtime** — 5 bullets rendered. |

---

## `check.js` (545 lines) — what it does and does not cover

| Area | Assertions | Covers | Does **not** cover |
| --- | --- | --- | --- |
| `modules.json` | 7 (`:60-130`) | duplicate ids, stage validity, product refs, non-empty steps/source, one `best` per scenario, option `src` | that `best` is the *correct* answer |
| `products.json` | 2 (`:136-176`) | `requires` refs real ids, graph acyclic | `integrateAfter` refs are **not** validated against real product ids |
| Rule engine | 8 (`:207-300`) | 5 wave combos, 3 blocker combos | **no combo where a prerequisite is missing yet the product still sequences** (the A-01 blind spot); no transitive-blocker case; no comparison against `app.html`'s copy of the logic |
| Content integrity | 10 (`:307-395`) | stage coverage, delivery/practice/day validity, no `<TODO` in key fields, gate starts closed, no known client name | — |
| Checklist | 2 (`:401-419`) | exactly 10 questions, `appliesTo` maps to real products | — |
| `sources.json` | 3 (`:425-449`) | non-empty, `usedByModules` real, every source file present on disk | `gaps[]` is **not** validated (count, id uniqueness, or agreement with `SME_QUESTIONS.md`) |
| Artifact parity | 4 (`:487-520`) | 3 inline-JSON deep-equals, no-network/no-credential scan | rule-engine logic parity |
| Submission copy | 4 (`:528-549`) | byte equality of 4 files | — |

**Observed:** `40 passed, 0 failed`, exit 0.

---

## Sub-features specified elsewhere but absent from `app.html`

Listed as **Missing**, not as bugs. Detail in `AUDIT_REPORT.md` section B.

| Sub-feature | Confirmed absent how |
| --- | --- |
| Leader view "scenario results" | `grep -n "state.picks"` → only `:1652`, `:1661`, `:1740`, all inside `moduleCard`/`wireLearner`. Never read by `renderLeader`. |
| Leader view "completion" stats | No completion field exists in `modules.json`; `renderLeader` computes no such number. Deliberate — `DECISIONS.md` decision 12. |
| Versioning / update workflow | No write path of any kind in `app.html`. `grep -c "schemaVersion"` → 3 hits, all inside the inline JSON blocks (lines 290, 894, 1204); no JS reads it. |
| `typesSrc`, `lagSrc`, `whySrc` citations | `grep` over `app.html` returns no render-side reference. By contrast `prereqSrc` (:1849), `cautionSrc` (:1882), `checklistSrc` (:1914), `stagesSrc` (:1983), `componentsSrc` (:1892), `timelineSrc` (:1894) and `deliverablesSrc` (:1901) **are** rendered — so these three are the only citation fields carried in the data but never shown. |

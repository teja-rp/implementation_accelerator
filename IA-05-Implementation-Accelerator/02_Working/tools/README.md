# Tools — document extraction

## Ingestion is a parsing problem, not an AI problem

Modern Office files — `.docx`, `.xlsx`, `.pptx` — are **ZIP archives containing XML**. Unzip one and the text is right there in `word/document.xml`, `xl/sharedStrings.xml` or `ppt/slides/slideN.xml`.

That means converting the sponsor's documents to plain text needs:

- **no model** — there is nothing to infer, only markup to strip
- **no API key** — so nothing can leak into a shared file
- **no network** — it runs entirely on the local machine
- **no install** — the platform's own ZIP and XML handling is enough

Treating ingestion as an AI task would add a dependency, a credential and a hallucination risk to a step that is deterministic. Don't.

## Where things go

- The team's extraction script is **`extract-text.js`, in this folder**.
- It reads from `01_Sponsor_Inputs/originals/`.
- It writes **plain text** into `01_Sponsor_Inputs/extracted/`, one text file per original, named after the original.
- It does not modify anything in `originals/`.

Run it locally, commit nothing, and record each file it produced in `data/sources.json` and in the inventory table in `01_Sponsor_Inputs/README.md`.

## Running it

```
node extract-text.js            # every Office file in ../../01_Sponsor_Inputs/originals/
node extract-text.js "EC SOP - V3 (1).docx"   # just one, by its exact filename
```

Output filenames are squashed to `A-Za-z0-9_` and given a `.txt` extension, so `PH EC - RUM Onboarding.pptx` becomes `PH_EC_RUM_Onboarding.txt`. Spaces and ampersands in the sponsor's filenames make every later command awkward; the originals keep their real names, the extractions do not.

Current state: **14 of 14 Office files extracted, 0 failures.** The one PDF in the source set (the hackathon brief) is not handled here — a PDF is not a ZIP of XML and needs a real text-layer decoder. It was read directly and is recorded in `sources.json` as `mode: "pdf-text"`.

### Why this script exists

The Phase 2 task named a utility called `extract-text`. It is not installed on this machine and has no equivalent on PATH, so the team wrote its own — which is what this folder was scaffolded for anyway. Recorded in `00_Admin/DECISIONS.md`.

### What it produces

- **`.docx`** — paragraphs in document order, with table rows flattened to `cell | cell | cell` so the dependency reference tables stay readable.
- **`.pptx`** — one `=== Slide N ===` section per slide, in slide order, with `[Speaker notes]` appended where they exist. The speaker notes matter: the RUM deck's definitions of SUBS and RUBS are only in the notes.
- **`.xlsx`** — one `=== Sheet: name ===` section per sheet, cells as `COLUMN:value` joined by `|`, with shared strings resolved.

Slide and sheet labels are what module `source` fields cite, so do not reformat them casually — citations point at them.

## ⚠️ Windows PowerShell 5.1 path length

On Windows PowerShell 5.1, full paths longer than about **260 characters** fail — often with a confusing error that looks like a missing file rather than a path problem. Extraction creates nested temporary paths while unzipping, which eats the budget fast.

Keep output folders **shallow**. If extraction fails on a file with a long name, shorten the output filename before assuming the file is broken.

## `sources.json` example object

`sources.json` holds an array of source records. JSON has no comment syntax, so the annotated example lives here instead of in the file.

```json
{
  "doc": "<TODO: exact filename as the sponsor provided it>",
  "version": "<TODO: version and effective date from the document's own Document Control block>",
  "mode": "<TODO: how it was ingested — e.g. 'extracted to plain text' or 'read directly'>",
  "sponsorProvided": true,
  "usedByModules": ["EC-01", "EC-02"]
}
```

Field notes:

- `doc` — the sponsor's filename, unchanged. This is what module `source` fields cite, so the two must match exactly.
- `version` — if the document's Document Control block is blank (one of ours reads `[Insert Date]`), leave a `<TODO:` here and raise it in `00_Admin/SME_QUESTIONS.md`. Do not invent a version.
- `mode` — how the text reached us, so a reviewer can tell an extraction from a hand transcription.
- `sponsorProvided` — `true` for sponsor documents, `false` for anything the team wrote. This feeds the reused-versus-created statement in the final package.
- `usedByModules` — every module id that cites this document. Keeps the citation trail traceable in both directions.

---

# How to recompile the app

The artifact's logic is written in **TypeScript** under `02_Working/app/src/` and compiled to plain ES2020, which is then inlined into `02_Working/app/app.html`. The `.ts` files are the source of truth — **edit those, not the JavaScript inside `app.html`**, or your change will be overwritten on the next compile.

TypeScript is a **developer-machine tool only**. It is never installed, run, or required by a reviewer, and no `package.json`, lockfile or `node_modules` is committed to the submission package.

### One-time setup

```
npm install -g typescript
```

### Recompile

From `02_Working/app/`:

```
tsc src/types.ts src/rules.ts src/dom.ts src/state.ts src/router.ts src/view-learner.ts src/view-planner.ts src/view-leader.ts src/view-owner.ts src/main.ts --outFile bundle.js --target es2020 --module none --strict --lib es2020,dom
```

Then **paste the contents of `bundle.js` into `app.html`**, replacing everything between the final `<script>` and `</script>` tags (the block below the three `application/json` data blocks). Delete `bundle.js` afterwards — it is an intermediate, not a deliverable.

### Why it is done this way

- **File order matters.** `--outFile` concatenates in the order given, and `main.ts` calls `boot()` at the end, so it must come last. `types.ts` first.
- **`--module none` is what keeps the output module-free.** None of the `src/*.ts` files uses `import` or `export`; they compile as global scripts, so the result is a plain script with no loader, no `require`, and nothing for a reviewer to install. Adding a single `import` anywhere in `src/` would break this.
- **No `tsconfig.json`.** All settings are command-line flags, so no build config lands in the submission package.
- **The rule engine must survive compilation.** `src/rules.ts` is bracketed by two marker comments. `02_Working/tests/check.js` slices the *compiled* form of that block out of `app.html` and runs its assertions against it, so the shipped Planner and the tested logic are the same code. Keep the markers on their own lines and never write either token inside the block.

### After recompiling, always

1. Run `node ../tests/check.js` — it verifies the inlined JSON still matches `data/*.json`, that no `.ts` or module syntax leaked into the shipped file, that the rule engine is still extractable, and that the submission copy matches.
2. Copy `app.html` and the three JSON files to `03_Final_Submission/artifact/`.
3. Open `app.html` by double-clicking it and click through all four views.

---

## What must never be in this folder

No credentials, keys, tokens or connection strings — not in a script, not in a comment, not in a sample command. No dependency manifest: the extraction script must run on a clean machine with nothing installed.

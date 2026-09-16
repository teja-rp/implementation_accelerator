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

- The team's extraction script lives **in this folder**.
- It reads from `01_Sponsor_Inputs/originals/`.
- It writes **plain text** into `01_Sponsor_Inputs/extracted/`, one text file per original, named after the original.
- It must not modify anything in `originals/`.

Run it locally, commit nothing, and record each file it produced in `data/sources.json` and in the inventory table in `01_Sponsor_Inputs/README.md`.

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

## What must never be in this folder

No credentials, keys, tokens or connection strings — not in a script, not in a comment, not in a sample command. No dependency manifest: the extraction script must run on a clean machine with nothing installed.

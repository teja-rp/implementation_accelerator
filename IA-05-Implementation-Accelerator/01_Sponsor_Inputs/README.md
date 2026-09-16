# Sponsor inputs — IA-05

## The rule

- **`originals/`** — sponsor-provided files, **identifiable and unmodified**. Keep the sponsor's own filename. Do not rename, reformat, clean up or "fix" anything here. If you need a changed version, extract it instead.
- **`extracted/`** — converted **plain text** of those originals, one text file per original, named after it. This is what modules cite and what gets read during authoring.

If a file in `extracted/` disagrees with its original, the original wins.

The extraction script lives in `02_Working/tools/` and writes into `extracted/`. See `02_Working/tools/README.md`.

---

## Inventory

Fill one row per source file.

| File | Type | Sponsor-provided? | Used in module IDs | Notes |
| --- | --- | --- | --- | --- |
| `<TODO: filename as provided>` | `<TODO: docx / xlsx / pptx / pdf / other>` | `<TODO: yes/no>` | `<TODO: e.g. EC-01, EC-02>` | `<TODO: notes>` |
| `<TODO: filename as provided>` | `<TODO: type>` | `<TODO: yes/no>` | `<TODO: module ids>` | `<TODO: notes>` |
| `<TODO: filename as provided>` | `<TODO: type>` | `<TODO: yes/no>` | `<TODO: module ids>` | `<TODO: notes>` |

Keep this table and `02_Working/data/sources.json` in agreement. The JSON is what the artifact reads; this table is what a human reads.

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

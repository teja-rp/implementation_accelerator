# Decisions — IA-05

Every decision that changes scope, data, tooling or submission behaviour goes here, with its rationale and the evidence behind it. A decision that only lives in a chat thread does not exist.

Rows 1–5 are decisions the team has **already taken**. They are team decisions, not sponsor requirements — anything needing sponsor confirmation is flagged in its own column.

| Date/time PT | Decision | Rationale | Evidence or source | Needs sponsor confirmation? | Owner |
| --- | --- | --- | --- | --- | --- |
| `<TODO>` | **Single self-contained HTML file, vanilla JS, no build step.** *(Team decision.)* | Review is asynchronous, 18–25 September 2026. Reviewers open the package days later with no access to our tools and no live explanation, so the artifact must open with no install and behave identically for every reviewer. | Event rules: asynchronous judging; deliverable must run with no setup | No | `<TODO: name>` |
| `<TODO>` | **AI used at authoring time only; the shipped artifact performs no inference.** *(Team decision.)* | No key can ship in a shared file — the rules forbid credentials in any shared file — and removing run-time inference makes the demo reproducible for every reviewer. | Event rules: never place credentials, API keys, secrets or access tokens in a prompt, connector, repository or shared file | No | `<TODO: name>` |
| `<TODO>` | **No RAG, vector store or embeddings index.** *(Team decision.)* | The entire approved corpus is roughly 24,500 tokens and fits in a single model context. Retrieval would add infrastructure we cannot ship and a hallucination risk against the accuracy criterion. | Token count of the sponsor-provided source set: ~24,500 tokens | No | `<TODO: name>` |
| `<TODO>` | **Product dependency logic implemented as a deterministic rule engine.** *(Team decision.)* | The dependency rules are documented in the sponsor's product dependency document, so a rule engine's output is provable and citeable — a model's would not be. | `<TODO: cite the product dependency document and section>` | No | `<TODO: name>` |
| `<TODO>` | **Primary scope is Engagement Coordinator / Add-On.** Other role and implementation-type combinations are tagged in the data but left unfilled and shown to the user as gaps. *(Team decision.)* | 24 hours is not enough to cover every role × implementation type against real sources. Tagging and showing the gaps is honest; filling them with invented content is not. | Sponsor-provided source set covers the EC Add-On path; other paths lack source coverage | `<TODO: confirm with sponsor that EC/Add-On is the right first slice>` | `<TODO: name>` |
| `<TODO>` | `<TODO: decision>` | `<TODO: rationale>` | `<TODO: evidence or source>` | `<TODO: yes/no>` | `<TODO: name>` |

---

**Fair-play note.** Any SME answer that changes scope, data, tooling or submission behaviour must be recorded here **and shared with the other teams working the same use case**. See `SME_QUESTIONS.md`.

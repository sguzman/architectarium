# Durable specimen work and completion contract

## Authority and scope

Each specimen has one editorial entry in `specimens/queue.json` and, **before processing begins**, three machine-readable work queues at:

- `specimens/<id>/queues/processing.json`: scope, evidence, measurements, uncertainty, research decisions, rights and final release review.
- `specimens/<id>/queues/ontology.json`: building-specific part instances, types, relationships, positions, source claims, mesh mappings, and interaction verification.
- `specimens/<id>/queues/presentation.json`: original or licensed 3D geometry, interiors, materials, environment, navigation, semantics, accessibility, performance, testing and exhibit packaging.

The Parthenon files are the initial fully instantiated example. All tasks begin `pending`. Existing preliminary research files and procedural modeling drafts are **inputs to be examined**, not proof of completed tasks. Do not mark them complete without the evidence and verification below. Other queued buildings only receive a full work breakdown when their processing is authorized; the detailed queues are not public gallery content.

## Required task contract

Each task must have a stable, never-recycled `id`, `title`, `description`, `priority`, `status`, `dependsOn` IDs (including cross-lane dependencies), at least two independently verifiable `acceptanceCriteria`, planned repository `outputs`, accumulated `evidence`, `review` decision and `blockedReason` when applicable.

Status values: `pending`, `in-progress`, `blocked`, `done`. A task is ready only when `pending` and **all** dependencies are `done`. `in-progress` is not completion. `blocked` requires an explicit cause and must be cleared deliberately. `done` requires satisfied dependencies, existing deliverable files, linked existing evidence files, and `review.status: "passed"`. Review without verifiable evidence does not satisfy a gate.

Record completion evidence as objects such as `{"path":"specimens/example/reviews/research.json","note":"source-by-source verification record"}`. Evidence must refer to actual, tracked repository paths, not chat messages, a proposed file, an unaudited log, or an external private file. Record decisions and unresolved limitations within legitimate public research files. A task can be reopened when new evidence invalidates it; dependent work must then be revalidated.

Discovery rule: whenever processing reveals missing work, **add an explicit task with a new stable ID and dependencies before proceeding**. Tasks may be subdivided; preserve old IDs and update references instead of dropping required work. Significant deferred or excluded scope must be documented with a justification and impact on the fidelity claim.

## Specimen-level meaning of completion

1. **Research**: identity and scope; source provenance; chronology and historical states; measured plan/section/elevation evidence; dimension ledger and spatial references; architectural system analysis; unresolved hypotheses; legal/asset rights review.
2. **Ontology**: source-backed general component vocabulary; per-building physical instances with durable IDs; positions and structural/spatial typed relationships; materials and historical phases; per-claim certainty; correct mapping of every represented mesh to exact instance/type; reliable interactive inspector.
3. **3D presentation**: coherent exterior and walkable interior; appropriate geometry and surface detailing; environmental context, light and shadow, optional atmospherics; orbit and collision-aware walk mode; cutaways and visibility; interactive selectable anatomy; fast progressive loading; accessibility and responsive behavior.
4. **Evidence and QA**: verify appearance, fidelity tier, geometric measurements, semantics, navigation, desktop/mobile runtime, public data integrity, licenses and provenance. Explicitly disclose schematic or conjectural areas; attractive rendering is never proof of measured accuracy.
5. **Publication**: all mandatory tasks reviewed and marked `done`; no unresolved blocking risks; completed model and exhibit page; documented passed geometry, visitor QA and rights review gates; editorial stage promoted only after those conditions. Only then add the specimen to `gallery/catalog.json`. Until that point it does not appear anywhere as an exhibition card or rendered preview.

These are **outcome requirements**, not automatic claims that exact archaeological measurements, original pigment evidence, or complete interiors necessarily exist. If evidence is unavailable, record that and make the corresponding fidelity and omission explicit. A schematic alternative cannot silently satisfy a higher reconstruction tier.

## Resuming after interruption

The queues and their output references are the sole authoritative work ledger. Re-read the committed queue files before resuming. Do not reconstruct task state from conversation memory or assume a previous assistant completed a step. The read-only CLI reports current task state and derives eligible next tasks; it does not advance stages or modify files:

```
node scripts/specimen-work.mjs status parthenon
node scripts/specimen-work.mjs next parthenon
node scripts/specimen-work.mjs validate parthenon
```

A green validation means structurally consistent records, **not** that uncompleted work is finished. The top-level queue stage and site publication manifest remain separate explicit decisions. Run `node scripts/validate.mjs` and automated checks after any queue change.

## Publication and privacy boundary

These queue files are public source-controlled planning data but are **never** copied into the static website. Write them as independent, neutral architectural project records. Do not put nonpublic conversation text, distinctive private language, personal information, credentials, internal logs, or private source dependencies into tasks, completion evidence, commit history, tests or generated build artifacts. Follow `CONSTITUTION.md` and `AGENTS.md`.

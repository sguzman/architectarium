# Specimen intake and processing protocol

1. **Intake**: canonical identity, geographic location, chronology, architects/attribution, preservation state, alternate names; reject duplicate IDs.
2. **Evidence dossier**: primary/official sources first, architectural plans/sections/elevations when possible, current vs historical condition, rights. Label unsupported hypotheses and competing interpretations.
3. **Ontology growth**: identify every supported component; create concepts for types, separate `part instances` on a particular building, distinguish `part-of` from `structurally-supported-by`, `adjacent-to`, `decorated-with`, `accessed-through`. Record position, era, examples, aliases, structural function and material.
4. **Spatial plan**: set coordinate system, metres, true north, datum, floor levels, entrance and egress, collision zones, interior accessible spaces. Preserve units and provenance for every surveyed dimension.
5. **Geometry**: original procedural meshes or rights-cleared assets. Prefer GLB/glTF; use stable semantic IDs in node extras or sidecar mappings. LODs, compression and on-demand loading are required for large sites. Keep raw survey inputs separate from interpretive reconstruction.
6. **Visitor experience**: orbit and walk modes, doorway access, wall/roof cutaways, time of day, light/shadows, material roughness and physically plausible scale, optional restrained atmospheric effects. Provide object picking, search, keyboard controls and plain-text alternative.
7. **Verification**: check counts, placement, shapes, source citations, model dimensions, mesh-to-ontology binding, raycast picking, walk collision, performance and provenance. Screenshots and video are QA aids, not substitutes for actual verification.
8. **Publication**: model state must read `schematic`, `evidence-based`, or `survey-validated` with criteria; only tested specimens become `published`. Preserve old stable specimen IDs.

Queue states: `queued`, `research`, `ontology-ready`, `model-draft`, `review`, `published`, `blocked`. A specimen may return to an earlier state on new evidence.

**Done for a researched specimen** means cited architectural statements, a structured part inventory, spatial evidence ledger, license checks and no false geometric precision. **Done for a gallery specimen** additionally means a navigable, accessible, visually tested site with semantic picking and honest reconstruction labeling.

**Website visibility is stricter than research visibility.** Only specimens admitted to `gallery/catalog.json` after evidence, rights, geometry and visitor review become public exhibit cards or hosted models. A research-stage queue item is never an exhibit or teaser. See [gallery publication boundary](GALLERY_PUBLICATION.md).

## Durable work breakdown required

Before advancing any candidate beyond `queued`, instantiate its three processing, ontology and presentation task queues with stable IDs, explicit dependencies, acceptance criteria, planned outputs, completion evidence and review status. Persist all new discoveries as tasks before work proceeds. Do not use conversation state as a task ledger. See [specimen work contract](SPECIMEN_WORK_CONTRACT.md) and run `node scripts/specimen-work.mjs next <specimen-id>` to identify unblocked work. All tasks must be verified before publication.

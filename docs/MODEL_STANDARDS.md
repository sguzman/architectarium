# 3D model quality standard

- Units: 1 Three.js unit = 1 metre, Y up. Source orientation and reconstruction choices documented per specimen.
- Geometry tiers: **schematic** approximate pedagogy; **evidence-based** reconciled plans and surveyed component evidence; **survey-validated** survey/photogrammetry compared within explicit tolerances. Never silently elevate a tier.
- Distinguish extant fabric, proposed original state, missing/unknown sections and present-day changes. Include a visual legend as future models become detailed.
- Use stable node/instance IDs such as `parthenon/colonnade/east/column-01/shaft`; map each to a canonical ontology ID. ID and pick target are not the same thing.
- Prefer glTF 2.0/GLB with licensed PBR textures, source citations, author/license ledger, asset hash, triangle count, bounds and LOD. Optimize and lazy-load heavy assets; cache immutable hashes.
- Realistic lighting/materials support interpretation but do not substitute for accuracy. Dust/mist must be optional, physically restrained, and deactivated by reduced-motion preference.
- Walk mode needs floor/threshold awareness, collision, height limits, spawn position, and keyboard or touch alternative. Schematic iteration may use bounded approximate collision and must say so.
- No copied commercial game/building meshes, aerial photography, scans, or unlicensed textures.

## Material viewing modes and geometry integrity

Visitor material appearance is optional and independent from the reconstruction tier. A higher-detail visual shader or texture does not increase geometric or historical confidence. Preserve the same physical-instance identifiers and collision surfaces between simple and detailed material modes. Any more realistic rendering must state whether its color, veining, surface relief, roughness, and seams are interpretive, survey-based, or reproduced from licensed evidence. A completed visual reconstruction must also pass explicit geometric continuity checks for major load-path interfaces, gable and roof closures, and frieze-to-entablature joins; a successful screenshot alone is not proof of watertight structure.

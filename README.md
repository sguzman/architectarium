# Architectarium

A public, self-contained architectural research collection and interactive building gallery.

- **Ontology**: `ontology/components.json` links architectural elements to functions, building positions, adjacent components, terminology and examples.
- **Evidence**: `ontology/sources.json` records public references; every example cites a source. Sources are links, not a license to copy imagery or geometry.
- **Specimens**: `specimens/queue.json` tracks candidates. Before any specimen processing, create three durable, dependency-linked queues for research, ontology and 3D presentation; see [work contract](docs/SPECIMEN_WORK_CONTRACT.md) and [Parthenon task queues](specimens/WORK_QUEUES.md).
- **Gallery**: `site/` holds the Github Pages experience, with an ontology browser and a publication-gated specimen collection.
- **Tests**: `node scripts/validate.mjs` for ontology integrity and `node scripts/test-gallery.mjs` for publication gating.

## Integrity and fidelity

Architectural research and illustrative geometry are **not interchangeable**. The published Parthenon exhibit is an independently modeled, source-linked **schematic** reconstruction, not a measured archaeological restoration; details and uncertainty tiers are disclosed in the viewer. Building/part data require traceable source links, confidence notes and model-specific mapping; no implied precision. No copyrighted photographs, scans, purchased meshes or private materials belong in this public repository.

## Specimen lifecycle

Queue → source audit → ontology mapping → spatial research → licensed/original asset production → geometric review → accessible visitor navigation → QA → publication. A catalog listing is not automatically a finished museum specimen.

See [specimen protocol](docs/SPECIMEN_PROTOCOL.md) and [model standards](docs/MODEL_STANDARDS.md).

## Parthenon model materials and assembly

The public Parthenon exhibit provides a **Materials: Study / Realistic** toggle. Study retains the initial simplified materials; Realistic uses deterministic locally generated stone color, bump and roughness maps. The mode is a display choice, not evidence of recovered original pigment or measured surface finish. No museum media or external texture assets are distributed. The roof and pediments use sealed interpretive solid geometry, with explicit frieze and cornice continuity checks. The machine-readable specimen inventory contains 486 addressable architectural instances.

## Color theme

The ontology and specimen pages offer **System / Light / Dark**. The default **System** follows the browser's live `prefers-color-scheme` preference. Manual overrides persist locally across pages. On Linux the browser must receive the preference via desktop settings or XDG portals; websites cannot directly read local theme-scheduling services.

## Publishing

A guarded static build deploys vetted content from `site/` through `.github/workflows/pages.yml` using `scripts/build-site.mjs`. GitHub Pages must be configured once in **Settings → Pages → GitHub Actions**. The app loads Three.js from a pinned CDN, so its first visit requires network access. No server, tracking, authentication or paid infrastructure.

MIT license applies to code and original data authored in this repository; third-party materials must retain their own rights and provenance.

## Governance and public-information safety

This repository is public. All contributions and generated gallery material are subject to the [Architectarium Constitution](CONSTITUTION.md) and [agent operating rules](AGENTS.md). The mandatory public-information boundary prohibits private conversation text, private tone, confidential research, secrets, and derived disclosures in any public artifact, including source, assets, commit messages, and history.

Before publishing, review content and provenance and run `python3 scripts/publication_guard.py`, `python3 -m unittest discover -s scripts -p 'test_*.py'`, and `node scripts/validate.mjs`. Automated scanners catch only recognizable signatures and cannot certify prose or media assets.

## What the public gallery shows

The gallery contains only reviewed, **published** specimens. Research candidates and prototype geometry do not appear as exhibit cards or 3D pages. The research queue is maintained independently; see [gallery publication policy](docs/GALLERY_PUBLICATION.md). The Parthenon is the first approved gallery specimen, at the openly labeled **schematic** fidelity tier; other queued buildings remain absent from the public site. The published architecture terminology index remains available.

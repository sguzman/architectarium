# Architectarium

A public, self-contained architectural research collection and interactive building gallery.

- **Ontology**: `ontology/components.json` links architectural elements to functions, building positions, adjacent components, terminology and examples.
- **Evidence**: `ontology/sources.json` records public references; every example cites a source. Sources are links, not a license to copy imagery or geometry.
- **Specimens**: `specimens/queue.json` tracks candidates. Individual specimens have their own records, models, uncertainty and acceptance status.
- **Gallery**: `site/` holds the Github Pages experience, with a selectable first-pass Parthenon study.
- **Tests**: `node --test` for consistency; `node scripts/validate.mjs` for ontology and queue integrity.

## Integrity and fidelity

Architectural research and illustrative geometry are **not interchangeable**. The current Parthenon is a schematic educational model, not a measured reconstruction. The published viewer must display that fact. Building/part data require traceable source links, confidence notes and model-specific mapping; no implied precision. No copyrighted photographs, scans, purchased meshes or private materials belong in this public repository.

## Specimen lifecycle

Queue → source audit → ontology mapping → spatial research → licensed/original asset production → geometric review → accessible visitor navigation → QA → publication. A catalog listing is not automatically a finished museum specimen.

See [specimen protocol](docs/SPECIMEN_PROTOCOL.md) and [model standards](docs/MODEL_STANDARDS.md).

## Publishing

Static site deploys from `site/` through `.github/workflows/pages.yml`. GitHub Pages must be configured once in **Settings → Pages → GitHub Actions**. The app loads Three.js from a pinned CDN, so its first visit requires network access. No server, tracking, authentication or paid infrastructure.

MIT license applies to code and original data authored in this repository; third-party materials must retain their own rights and provenance.

## Governance and public-information safety

This repository is public. All contributions and generated gallery material are subject to the [Architectarium Constitution](CONSTITUTION.md) and [agent operating rules](AGENTS.md). The mandatory public-information boundary prohibits private conversation text, private tone, confidential research, secrets, and derived disclosures in any public artifact, including source, assets, commit messages, and history.

Before publishing, review content and provenance and run `python3 scripts/publication_guard.py`, `python3 -m unittest discover -s scripts -p 'test_*.py'`, and `node scripts/validate.mjs`. Automated scanners catch only recognizable signatures and cannot certify prose or media assets.

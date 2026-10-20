# Gallery publication boundary

A building enters the public gallery **only after the specimen is complete and reviewed**. The public gallery is separate from the research queue.

- Authoritative display list: `gallery/catalog.json` (`entries: []` until exhibits have passed).
- Internal research candidates: `specimens/queue.json`. These remain versioned in the public research repository but are **not** used to populate public gallery cards.
- Schematic/prototype meshes in `site/model.js` are not included in the published site.
- The publication builder at `scripts/build-site.mjs` has an explicit allowlist for top-level site files and exports only the validated gallery manifest and public ontology data.

To publish an individual building:
1. Complete the evidence dossier, semantic parts, geometry, navigation and model-specific review.
2. Record `geometryReview.status`, `visitorQA.status`, and `rightsReview.status` as `passed` only when validated.
3. Set the corresponding queue state to `published`.
4. Supply a fully working `site/specimens/<id>/index.html` and its public, licensed dependencies.
5. Add exactly one entry to `gallery/catalog.json` with `id`, `title`, `summary`, and `path: "./specimens/<id>/"`.
6. Pass `node scripts/test-gallery.mjs`, content safety checks, ontology validation, and browser smoke tests.

No hero banners, galleries, cards or public 3D previews of pending candidates. The site intentionally has **zero** exhibits until the first building passes this gate. This does not prevent research on drafts inside the repository.

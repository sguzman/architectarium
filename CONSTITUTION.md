# Architectarium Constitution

**Version 1.0 — Public project charter**

Architectarium is an independent, public architectural research project. This charter governs its ontology, specimen dossiers, 3D reconstructions, interactive gallery, publications, and contributor activity. It incorporates the mandatory public-information protections of the [Tarium public constitution](https://github.com/sguzman/tarium/blob/main/CONSTITUTION.md). Use the stricter rule wherever policies overlap.

## Article I — Scope and independence

Architectarium maintains a complete, independently usable public architecture collection in this repository:

- `ontology/`: documented, versioned architectural concepts, names, meanings, relations, examples, and sources in human- and machine-readable formats.
- `specimens/`: the specimen queue, building-specific evidence, terminology mappings, reconstruction limitations, and rights records.
- `site/`: its public GitHub Pages gallery, including navigable 3D specimens and explanations of architectural parts.
- `docs/`, `scripts/`, and `.github/`: public documentation, validation, and publication workflows.

The ontology and gallery must function without access to any private workspace, private service, nonpublic dataset, private repository, or unpublished project schema. A reference to another Tarium project is permissible only when that project is actually public and explicitly registered by the Tarium owner. Generic, properly licensed public third-party libraries and references are allowed.

This project's existence does **not** enroll it in the Tarium registry. Only the registry owner's explicit, project-specific authorization can establish membership. Nothing in this charter authorizes registry modification.

## Article II — Absolute public-information boundary

**Private language, private conversations, and private context must never be transferred into this public project, in any form.**

The prohibition includes:

- Nonpublic chats, prompts, transcripts, message fragments, private instructions, notes, internal deliberations, personal stories, and identifiable personal details.
- Personal venting, antagonistic or insulting language, private nicknames, distinctive emotional phrasing, or a private conversational tone reused as project prose.
- Paraphrases, transformed examples, generated content, or summaries that still disclose or visibly derive from confidential material.
- Credentials, tokens, internal paths, unpublished research, private inventories, nonpublic identifiers, secret URLs, debugging records, and nonpublic dependencies.
- Third-party content of uncertain origin, license, redistribution permission, or provenance.

This boundary applies to **all public surfaces**: source and comments, ontology records, specimen data, examples, assets, textures and embedded metadata, screenshots, filenames, documentation, READMEs, tests and fixtures, agents' files, website text, GitHub Pages, commit messages and history, branches, pull requests, issues, discussions, actions logs, build artifacts, releases, and citations or external links.

All public-facing language must be independently written in a **neutral, professional, architectural or technical voice**. A legitimate requirement originating in nonpublic discussion may inform implementation, but the conversation itself, its private wording, and its identifiable context may not be reproduced.

**Default deny:** if origin, public suitability, or release permission is uncertain, exclude the material. Publication permission must not be inferred from a development request, access to a file, or a passing automated scanner. Contributors and agents are responsible for reviewing the actual material and provenance; routine safety review must not be delegated to the repository owner as manual cleanup.

## Article III — Clean origins, assets, and provenance

- Create public material from documented public sources or independently authored work. For nonpublic-to-public extraction, privately inventory candidates and separately select an authorized public subset. Do not publish that inventory.
- Never copy private repository histories, confidential transcripts, local debug dumps, hidden agent context, logs, or caches into this repository.
- Record attribution, applicable licenses, source links, authorship, reuse permissions, and uncertainty for external geometry, drawings, photography, scans, data, textures, fonts, and dependencies before inclusion.
- Merely being downloadable, viewable on the web, or included in research material does not grant redistribution rights. Do not copy protected assets without sufficient rights.
- Do not upload uncertain material into a public issue, draft commit, or CI artifact for evaluation. Inspect it through a private channel, then publish only an approved and independently worded result.

## Article IV — Architecture ontology and specimens

- Preserve stable, versioned architectural concept identifiers with names, aliases, definitions, functions, typical positions, material families, recognizable features, typed relationships, and sourced examples.
- Keep **component types** distinct from **instances** attached to a specific building. Relationships that commonly occur in architecture are not automatically true of every specimen.
- Every building dossier must distinguish source-backed facts from approximate dimensions, conjecture, missing data, reconstructed phases, later modifications, and the present condition.
- Specimen queue stages require documented evidence and validation. Do not label a queued, schematic, or unreviewed building as a completed accurate model.

## Article V — Gallery, reconstruction fidelity, and visitor experience

- Aesthetic quality and rich exploration are important, but visual realism is not evidence of historical or geometric accuracy. Display reconstruction status and uncertainties honestly.
- Geometry shall use consistent coordinate systems, dimensions, stable semantic component IDs, provenance, and appropriate review gates. Semantic picking must lead to the repository's architectural ontology.
- Where appropriate, provide orbit, interior walking, cutaway, lighting, material study, and atmospheric options. Ensure usable keyboard navigation, accessibility alternatives, and reasonable performance.
- Atmospheric effects, light studies, and environmental dressing must be distinguishable from evidence-based historic reconstruction.
- The published gallery and its required data belong to this repository. Publishing should remain reproducible from public inputs.

## Article VI — Contributor and agent operations

1. Inspect current repository state, scope, and relevant documentation before changing anything. Work directly on the existing `main` branch by default unless the owner specifies an exception.
2. Keep code and data changes attributable to concrete architectural or engineering requirements. Avoid unrelated repository edits and fabricated claims of completion.
3. Before **every** push, review changed paths, text, source provenance, asset metadata, intended commit messages, and publicly visible artifacts for Article II compliance.
4. Run `python3 scripts/publication_guard.py` and `node scripts/validate.mjs` plus relevant tests. The automated guard checks recognizable risks but cannot certify the absence of private language or private ideas.
5. Verify GitHub Actions and deployed behavior before representing an interactive feature as tested. Describe unverified geometry as schematic or draft, not accurate or complete.
6. Do not alter other repositories, the Tarium registry, or unrelated projects absent distinct authorization.

## Article VII — Suspected exposure and remediation

If a possible disclosure is found, stop further publication where possible. Do **not** restate the suspect material in a public issue, commit, log, or report. Investigate privately, revoke and rotate exposed credentials when applicable, and coordinate history, artifact, release, and cached-copy remediation. A later deletion commit does **not** remove content already published in Git history.

## Article VIII — Amendments

The repository owner controls project-specific constitutional changes. Agents may propose strengthening protections but may not silently relax the public-information boundary, waive provenance checks, infer publication permission for sensitive content, or enroll the project in Tarium. Any local change must preserve mandatory public governance requirements.

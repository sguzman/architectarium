# Architectarium — Agent Operating Rules

**This is a PUBLIC repository.** These rules govern all coding agents, assistants, automation, contributors, and maintainers, including work on its GitHub Pages website. Read [CONSTITUTION.md](CONSTITUTION.md) before editing. When in doubt, apply the stricter publication restriction.

## 1. Mandatory: never publish private language or context

**Do not transfer private conversations, personal venting, private tone, or other nonpublic material into this project. Not as quotes, examples, summaries, paraphrases, comments, sample data, or generated content.**

Use neutral, professional, architecture-focused wording. Private communications may establish the goal of a task; they are **not** a source of publishable language. Do not mimic emotional phrasing, personally directed insults, nicknames, private details, or internal assistant commentary.

The boundary covers **everything publicly visible or recoverable**: filenames, Markdown, JSON, code, comments, test fixtures, screenshots, captures, galleries, geometry metadata, asset source files, texture names, external links, builds, Pages deployments, issues, discussions, PRs, branch names, commits and their messages, workflows, logs, release artifacts, and Git history.

Do not copy private research repositories, chat transcripts, local filesystem structures, internal prompts, hidden context, private services, sensitive records, secrets, credentials, or unpublished dependencies. Sanitizing a quotation or replacing names is not sufficient if recognizable private content or provenance remains.

**Uncertain origin or suitability means exclude.** Perform content *and provenance* review before publication. Never put suspicious private text into a public issue, commit, log, or release to ask for review. A scanner passing is not proof that prose is appropriate.

## 2. Independent architectural research scope

- Keep everything necessary for the public ontology and gallery in this independent repository; do not rely on unpublished resources.
- Maintain `ontology/` as the authoritative human- and machine-readable architectural vocabulary with stable IDs, definitions, relations, examples, provenance, and schema.
- Maintain `specimens/` with a queue and evidence-backed individual building dossiers. Before processing a candidate, instantiate all three durable task queues described in `docs/SPECIMEN_WORK_CONTRACT.md`. Re-read repository queue state after interruption, record new work before execution, and close tasks only with linked verification evidence. Separate generic component **types** from physical building **instances**.
- Maintain `site/` as the in-repository GitHub Pages application. Its picking, labels, inspector, data indexes, and geometry IDs must agree with the ontology and specimen records.
- Follow `docs/SPECIMEN_PROTOCOL.md`, `docs/MODEL_STANDARDS.md`, and `docs/ASSET_PROVENANCE.md`.
- Never claim schematic geometry is surveyed, phase-accurate, or conservation-grade. Clearly label approximation, unknowns, reconstruction era, and asset licenses.
- Refer to other Tarium projects as integrations only if independently public and explicitly registered. Do not assume that this repository is enrolled; only the Tarium registry owner may authorize membership.

## 3. Before writing, committing, or publishing

1. Inspect the live repository state and limit changes to the authorized task. Use existing `main` by default; do not create branches or PRs unless explicitly requested.
2. Use independently written technical descriptions supported by documented public sources. Do not import private histories, private conversations, or unreviewed files as development shortcuts.
3. Review **every new or changed file and path**, plus media metadata, asset licenses, model source links, intended commit subject/body, and generated artifacts for disclosure and public suitability. Do the review yourself; do not transfer routine cleanup to the owner.
4. Run `python3 scripts/publication_guard.py` and `node scripts/validate.mjs`. For the interactive gallery also run relevant browser smoke tests or report what was not verified.
5. Check GitHub Actions. Report actual commits and observed test status, distinguishing deployment success from visual fidelity or geometry correctness.

Never deliberately reproduce a risky phrase in test fixtures to demonstrate filtering. Use synthetic, nonpersonal cases and avoid introducing test data that itself becomes a public leak.

## 4. Incident handling

If potentially private material is discovered, stop public propagation. Do not quote it in public tickets or commits. Investigate affected assets, history, logs, and releases through a nonpublic channel; rotate compromised credentials and plan history cleanup as needed. Deleting the latest file is not enough to purge a public Git object.

## 5. Authority and changes

The owner controls scope, exceptions, and project membership. No contributor or agent may relax the constitution, infer public release permission from mere access, or modify another repository without explicit authorization. Project-specific instructions may strengthen, never weaken, the privacy boundary.

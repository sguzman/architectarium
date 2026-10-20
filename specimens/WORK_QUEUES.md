# Specimen processing queues

Every specimen must receive **three durable task queues** before work begins: processing, ontology and presentation. Each task has dependencies, a verification checklist, planned outputs and a review gate. They live in `specimens/<id>/queues/`. They are tracked in Git, remain separate from the public website, and are not automatically completed by creating draft files.

The first detailed work ledger is [Parthenon](../specimens/parthenon/queues/processing.json):
- [Research and processing](parthenon/queues/processing.json)
- [Ontology and physical instances](parthenon/queues/ontology.json)
- [3D reconstruction and visitor experience](parthenon/queues/presentation.json)

Read the [full completion contract](../docs/SPECIMEN_WORK_CONTRACT.md), [specimen protocol](../docs/SPECIMEN_PROTOCOL.md), and [publication gates](../docs/GALLERY_PUBLICATION.md). The work-reporting command is `node scripts/specimen-work.mjs next parthenon`.

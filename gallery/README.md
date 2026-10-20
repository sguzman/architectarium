# Public gallery catalog

`catalog.json` is the **only authoritative public exhibit list**. The research queue in `specimens/queue.json` is editorial workflow data, not a gallery manifest.

A catalog entry is permitted only after the matching specimen reaches `published` and its dossier records completed geometry review, visitor QA, and rights review. Publication requires stable semantic IDs and an implemented, inspectable scene under `site/specimens/<specimen-id>/`. The build verifies these gates and refuses unsupported entries.

When no specimens have qualified, the public website presents an empty collection alongside the existing architecture ontology. It must not display candidate cards, fake images, or prototype models as finished exhibits.

# Ontology working rules

The architecture ontology stores **types**, not individual masonry blocks or polygon meshes. It is public and domain-specific.

- `components.json`: canonical type ID, human name, synonyms, definition, physical function, typical position, recognition cues, common material families, connections, typed relations, and sourced examples.
- `sources.json`: bibliography with stable source IDs. A URL is an evidence pointer, not permission to copy media.
- `schema.json`: interchange contract for a single component record.
- `specimens/<slug>/specimen.json`: historically specific building dossier with evidence, uncertainty and model-status gates.
- `specimens/<slug>/instances.json` (where available): actual instances, with stable IDs, type IDs, location and geometry handles.

## Relationships

`connectedTo` is an ergonomic search adjacency index. `relations` defines directional predicates, e.g. `stylobate supports column-shaft` or `coffer contained-in dome`. Treat them as typical architectural associations, **not claims that every building includes or assembles them that way**. Specimen-specific relation assertions require sources.

## Evidence policy

An example record points to a relevant building source. The example alone does **not** certify the precise identity of each component, a dimension, its period, or a conservation conclusion. Research must distinguish original design, extant building, subsequent restoration and schematic artistic representation.

For every new component: provide definition, distinguishing geometry/recognition, likely position, structural or spatial role, at least one linked real-building example, typed connections and corresponding IDs. Tests reject orphan IDs and ungrounded examples.

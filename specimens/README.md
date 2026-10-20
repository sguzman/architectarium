# Specimen queue: research-driven publication

Run `node scripts/process-specimens.mjs queue` for the ordered research pipeline. Run `node scripts/process-specimens.mjs check pantheon` for current gate assessments.

The script **only reads** repo state; it does not silently advance statuses or publish specimens. A stage is an editorial decision justified by the dossier, not a magic "done" flag. A model is not approved for publication simply because it renders.

The [Parthenon evidence ledger](parthenon/evidence.json) deliberately separates attested facts from illustrative coordinates. The [Pantheon dossier](pantheon/specimen.json) demonstrates research-level processing before a geometry file exists. Later specimens receive equivalent dossiers before a 3D scene is commissioned.

For every queued building, verify whether published evidence concerns the **original**, **present**, **restored**, or **hypothetical** condition. Preserve that state per claim and per geometry.

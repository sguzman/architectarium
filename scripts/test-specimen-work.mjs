import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inspectSpecimen,validateWorkData,LANES} from './specimen-work.mjs';

const root=resolve(import.meta.dirname,'..');
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const specimen=load('specimens/queue.json').specimens.find(x=>x.id==='parthenon');
const queues=Object.fromEntries(LANES.map(lane=>[lane,load('specimens/parthenon/queues/'+lane+'.json')]));
const copy=()=>structuredClone(queues);
const validate=parts=>validateWorkData({specimenId:'parthenon',specimen,queues:parts,rootDir:root});
const status=inspectSpecimen('parthenon');
assert.equal(status.totals.total,61);
assert.equal(status.lanes.processing.total,18);
assert.equal(status.lanes.ontology.total,16);
assert.equal(status.lanes.presentation.total,27);
assert.equal(status.totals.ready,status.next.length);
assert.ok(status.totals.done>=29,'Previously verified research and ontology work must persist');
{
 const d=copy();d.processing.tasks[1].dependsOn=['PAR-NOT-999'];
 assert.throws(()=>validate(d),/unknown dependency/);
}
{
 const d=copy();d.processing.tasks[0].dependsOn=['PAR-SP-002'];
 assert.throws(()=>validate(d),/Circular task dependency/);
}
{
 const d=copy();d.ontology.tasks[0].id='PAR-SP-001';
 assert.throws(()=>validate(d),/wrong work queue|Duplicate task ID/);
}
{
 const d=copy();d.processing.tasks[0].review.status='not-reviewed';
 assert.throws(()=>validate(d),/incomplete verification/);
}
{
 const d=copy();d.processing.tasks[0].status='blocked';d.processing.tasks[0].blockedReason=null;
 assert.throws(()=>validate(d),/missing blocker reason/);
}
{
 const d=copy();d.processing.tasks[0].outputs=['../../unsafe.txt'];
 assert.throws(()=>validate(d),/invalid output path/);
}
{
 const d=copy();d.processing.tasks[0].outputs=['specimens/parthenon/research/nonexistent-validation.json'];
 assert.throws(()=>validate(d),/missing output/);
}
{
 const d=copy();d.processing.tasks[0].status='pending';d.processing.tasks[0].evidence=[];
 d.processing.tasks[0].review={status:'not-reviewed',notes:''};
 assert.throws(()=>validate(d),/unfinished prerequisite/);
}
{
 const d=copy();
 const t=d.presentation.tasks[24];
 t.status='pending';t.evidence=[];t.review={status:'not-reviewed',notes:''};
 assert.throws(()=>validateWorkData({specimenId:'parthenon',specimen:{...specimen,stage:'published'},queues:d,rootDir:root}),/unfinished prerequisite|Published specimen has unfinished|review passed/);
}
console.log('Task ledger contract, dependency graph and publication verification tests passed.');

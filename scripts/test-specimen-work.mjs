import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inspectSpecimen,validateWorkData,LANES} from './specimen-work.mjs';

const root=resolve(import.meta.dirname,'..');
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const specimen=load('specimens/queue.json').specimens.find(s=>s.id==='parthenon');
const queues=Object.fromEntries(LANES.map(lane=>[lane,load('specimens/parthenon/queues/'+lane+'.json')]));
function check(copy){return validateWorkData({specimenId:'parthenon',specimen,queues:copy,rootDir:root});}
const fresh=()=>structuredClone(queues);
const status=inspectSpecimen('parthenon');
assert.equal(status.totals.total,59,'Unexpected Parthenon task inventory');
assert.equal(status.totals.done,0,'No task should be marked complete during queue bootstrap');
assert.equal(status.totals.ready,1,'Only the intake task should be immediately actionable');
assert.equal(status.next[0].id,'PAR-SP-001');
assert.equal(status.lanes.processing.total,18);
assert.equal(status.lanes.ontology.total,16);
assert.equal(status.lanes.presentation.total,25);
{
 const data=fresh();data.processing.tasks[1].dependsOn=['PAR-NOT-999'];
 assert.throws(()=>check(data),/unknown dependency/);
}
{
 const data=fresh();data.processing.tasks[0].dependsOn=['PAR-SP-002'];
 assert.throws(()=>check(data),/Circular task dependency/);
}
{
 const data=fresh();data.ontology.tasks[0].id='PAR-SP-001';
 assert.throws(()=>check(data),/wrong work queue|Duplicate task ID/);
}
{
 const data=fresh();data.processing.tasks[0].status='done';
 assert.throws(()=>check(data),/incomplete verification/);
}
{
 const data=fresh();data.processing.tasks[1].status='in-progress';
 assert.throws(()=>check(data),/unfinished prerequisite/);
}
{
 const data=fresh();data.processing.tasks[0].status='blocked';
 assert.throws(()=>check(data),/missing blocker reason/);
}
{
 const data=fresh();data.processing.tasks[0].outputs=['../../untrusted.txt'];
 assert.throws(()=>check(data),/invalid output path/);
}
{
 const data=fresh();data.processing.tasks[0].status='done';
 data.processing.tasks[0].review={status:'passed',notes:'Reviewed against existing repository files'};
 data.processing.tasks[0].evidence=[{path:'CONSTITUTION.md',note:'Public project policy is present'}];
 assert.throws(()=>check(data),/missing output/);
 data.processing.tasks[0].outputs=['CONSTITUTION.md'];
 const result=check(data);
 assert.equal(result.totals.done,1,'Verified completed task should count');
 assert.equal(result.next[0].id,'PAR-SP-002');
}
{
 const data=fresh();
 const published={...specimen,stage:'published'};
 assert.throws(()=>validateWorkData({specimenId:'parthenon',specimen:published,queues:data,rootDir:root}),/Published specimen has unfinished/);
}
console.log('Parthenon task inventory, dependency DAG, completion evidence, and publication gating passed.');

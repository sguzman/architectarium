import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const ontology=load('ontology/components.json');
const sources=load('ontology/sources.json').sources;
const queue=load('specimens/queue.json').specimens;
const part=load('specimens/parthenon/specimen.json');
const sourceIds=new Set(sources.map(s=>s.id)),conceptIds=new Set(ontology.components.map(c=>c.id));
const stages=new Set(['queued','research','ontology-ready','model-draft','review','published','blocked']);
const distinct=(arr,label)=>assert.equal(new Set(arr).size,arr.length,'Duplicate '+label);
distinct([...conceptIds],'concepts');distinct([...sourceIds],'sources');
distinct(queue.map(q=>q.id),'specimen IDs');
assert.ok(ontology.components.length>=35,'Ontology must remain substantive');
assert.ok(queue.length>=5,'Queue must retain initial architectural range');
for(const s of sources){assert.ok(s.title&&s.publisher);assert.match(s.url,/^https:\/\//);}
for(const c of ontology.components){
 assert.match(c.id,/^[a-z][a-z0-9-]*$/);
 for(const key of ['name','category','definition','typicalLocation','function'])assert.ok(c[key]?.length>3,c.id+' missing '+key);
 assert.ok(Array.isArray(c.connectedTo)&&c.connectedTo.length>0,c.id+' lacks connected terms');
 for(const ref of c.connectedTo){assert.ok(conceptIds.has(ref),c.id+' points to unknown component '+ref);assert.notEqual(ref,c.id);}
 assert.ok(c.examples.length>0,c.id+' missing a real building example');
 for(const e of c.examples)assert.ok(e.building&&sourceIds.has(e.sourceId),c.id+' ungrounded example');
}
for(const q of queue){
 assert.ok(stages.has(q.stage),'Unknown stage '+q.stage);
 assert.match(q.id,/^[a-z][a-z0-9-]*$/);
 assert.ok(q.location&&q.title&&q.model&&q.rights&&q.nextStage);
 for(const id of q.sourceIds)assert.ok(sourceIds.has(id),q.id+' lacks reference '+id);
 if(q.stage==='published')assert.notEqual(q.model.accuracy,'not-modeled');
}
assert.equal(part.id,'parthenon');assert.equal(part.modelStatus,'illustrative');
for(const binding of part.meshBindings)assert.ok(conceptIds.has(binding),'Missing ontology term '+binding);
for(const fact of part.facts)assert.ok(sourceIds.has(fact.sourceId),'Unsourced fact');
for(const q of queue.filter(x=>x.stage==='model-draft'))assert.ok(q.model.kind!=='pending','Model draft lacks a model '+q.id);
const html=readFileSync(new URL('../site/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../site/app.js',import.meta.url),'utf8');
const model=readFileSync(new URL('../site/model.js',import.meta.url),'utf8');
assert.match(html,/SCHEMATIC STUDY/);assert.match(html,/\.\/app\.js/);
assert.match(app,/\.\/data\/components\.json/);
assert.match(model,/buildParthenon/);
for(const id of part.meshBindings)assert.ok(model.includes("'"+id+"'"),'3D model missing binding '+id);
console.log('Validated '+ontology.components.length+' architectural types, '+sources.length+' sources, '+queue.length+' specimens and all model bindings.');

#!/usr/bin/env node
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const q=load('specimens/queue.json').specimens, sources=new Set(load('ontology/sources.json').sources.map(s=>s.id));
const ids=new Set(load('ontology/components.json').components.map(c=>c.id));
const cmd=process.argv[2]||'queue',slug=process.argv[3];
function report(item){
 const filename='specimens/'+item.id+'/specimen.json',exists=existsSync(resolve(root,filename));
 const dossier=exists?load(filename):null;
 const gates={intake:!!(item.id&&item.title&&item.location&&item.tradition),
   sourcing:!!(dossier&&dossier.facts?.length>=3&&dossier.facts.every(f=>sources.has(f.sourceId))),
   ontology:!!(dossier&&((dossier.partInventory?.length>=5&&dossier.partInventory.every(p=>ids.has(p.typeId)&&sources.has(p.sourceId)))||(dossier.meshBindings?.length>=5&&dossier.meshBindings.every(id=>ids.has(id))))),
   modeling:!!(item.model.kind!=='pending'&&dossier?.modelStatus!=='not-modeled'),
   review:!!(dossier?.visitorQA?.status==='passed'&&dossier?.geometryReview?.status==='passed'),
 };
 return {id:item.id,stage:item.stage,sourceIds:item.sourceIds,dossier:exists?filename:null,gates,next:item.nextStage};
}
if(cmd==='queue'){for(const s of q)console.log([String(s.priority).padStart(2),s.id,s.stage,s.nextStage].join(' | '));}
else if(cmd==='check'){const s=q.find(x=>x.id===slug);if(!s)throw Error('Unknown specimen '+slug);console.log(JSON.stringify(report(s),null,2));}
else if(cmd==='all'){console.log(JSON.stringify(q.map(report),null,2));}
else {console.error('Usage: node scripts/process-specimens.mjs [queue | all | check <id>]');process.exitCode=2;}

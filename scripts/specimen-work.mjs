#!/usr/bin/env node
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const LANES=['processing','ontology','presentation'];
const CODES={processing:'SP',ontology:'ON',presentation:'3D'};
const STATES=new Set(['pending','in-progress','blocked','done']);
const REVIEWS=new Set(['not-reviewed','passed','failed']);
const slug=/^[a-z][a-z0-9-]*$/;
const taskId=/^[A-Z][A-Z0-9]*-(?:SP|ON|3D)-[0-9]{3}$/;

export function validPath(path){
  return typeof path==='string'&&path.length>2&&path.length<256&&!path.includes('\\')&&
    path.split('/').every(segment=>segment&&segment!=='.'&&segment!=='..'&&/^[a-zA-Z0-9_.-]+$/.test(segment));
}
function artifactExists(root,path){
  assert.ok(validPath(path),'Invalid repository artifact path: '+String(path));
  const full=resolve(root,path);
  assert.ok(full.startsWith(root+sep),'Artifact must be inside the repository');
  return existsSync(full)&&statSync(full).isFile();
}
export function validateWorkData({specimenId,queues,specimen,rootDir=ROOT}){
  assert.match(specimenId,slug,'Invalid specimen identifier');
  assert.equal(specimen.id,specimenId,'Editorial specimen ID differs from work queues');
  const all=new Map(),byLane={};
  const priorities=new Map();
  for(const lane of LANES){
    const queue=queues[lane];
    assert.ok(queue,'Missing required '+lane+' work queue for '+specimenId);
    assert.equal(queue.version,1,'Unknown queue version');
    assert.equal(queue.specimenId,specimenId,'Work queue linked to another specimen');
    assert.equal(queue.lane,lane,'Incorrect work queue lane');
    assert.ok(Array.isArray(queue.tasks)&&queue.tasks.length>0,'Empty work queue '+lane);
    const seen=new Set();
    for(const task of queue.tasks){
      assert.match(task.id,taskId,'Invalid stable task ID');
      assert.ok(task.id.includes('-'+CODES[lane]+'-'),'Task is filed in the wrong work queue: '+task.id);
      assert.ok(!all.has(task.id),'Duplicate task ID: '+task.id);
      assert.ok(typeof task.title==='string'&&task.title.length>=10,task.id+': missing title');
      assert.ok(typeof task.description==='string'&&task.description.length>=15,task.id+': missing description');
      assert.ok(STATES.has(task.status),task.id+': invalid status');
      assert.ok(Number.isSafeInteger(task.priority)&&task.priority>0,task.id+': invalid priority');
      assert.ok(!seen.has(task.priority),task.id+': duplicate lane priority');
      seen.add(task.priority);
      assert.ok(Array.isArray(task.dependsOn),task.id+': missing dependencies');
      assert.equal(new Set(task.dependsOn).size,task.dependsOn.length,task.id+': duplicate dependencies');
      assert.ok(Array.isArray(task.acceptanceCriteria)&&task.acceptanceCriteria.length>=2,task.id+': require at least two checks');
      for(const check of task.acceptanceCriteria)assert.ok(typeof check==='string'&&check.length>=20,task.id+': vague acceptance criterion');
      assert.ok(Array.isArray(task.outputs)&&task.outputs.length>0,task.id+': missing planned deliverables');
      assert.equal(new Set(task.outputs).size,task.outputs.length,task.id+': repeated deliverable');
      for(const path of task.outputs)assert.ok(validPath(path),task.id+': invalid output path '+String(path));
      assert.ok(Array.isArray(task.evidence),task.id+': missing evidence list');
      for(const evidence of task.evidence){
        assert.ok(evidence&&typeof evidence==='object'&&validPath(evidence.path),task.id+': invalid evidence path');
        assert.ok(typeof evidence.note==='string'&&evidence.note.length>=12,task.id+': evidence needs explanatory note');
      }
      assert.ok(task.review&&REVIEWS.has(task.review.status),task.id+': invalid review');
      assert.ok(typeof task.review.notes==='string',task.id+': missing review notes field');
      if(task.status==='blocked'){
        assert.ok(typeof task.blockedReason==='string'&&task.blockedReason.trim().length>=12,task.id+': missing blocker reason');
      }else{
        assert.equal(task.blockedReason,null,task.id+': stale blocked reason');
      }
      if(task.status==='done'){
        assert.equal(task.review.status,'passed',task.id+': incomplete verification');
        assert.ok(task.evidence.length>0,task.id+': no linked completion evidence');
        assert.ok(task.review.notes.trim().length>=12,task.id+': missing review rationale');
        for(const path of task.outputs)assert.ok(artifactExists(rootDir,path),task.id+': missing output '+path);
        for(const proof of task.evidence)assert.ok(artifactExists(rootDir,proof.path),task.id+': missing evidence file '+proof.path);
      }else{
        assert.notEqual(task.review.status,'passed',task.id+': review passed but task not done');
      }
      all.set(task.id,{...task,lane});
    }
    priorities.set(lane,seen);
    byLane[lane]=queue.tasks.length;
  }
  for(const task of all.values()){
    for(const dep of task.dependsOn){
      assert.ok(all.has(dep),task.id+': unknown dependency '+dep);
      assert.notEqual(dep,task.id,task.id+': task cannot depend on itself');
    }
  }
  // Reject all dependency loops, including those involving unstarted tasks.
  const visiting=new Set(),visited=new Set();
  function visit(id){
    if(visited.has(id))return;
    assert.ok(!visiting.has(id),'Circular task dependency at '+id);
    visiting.add(id);
    for(const dep of all.get(id).dependsOn)visit(dep);
    visiting.delete(id);visited.add(id);
  }
  for(const id of all.keys())visit(id);
  for(const task of all.values()){
    if(task.status==='done'||task.status==='in-progress'){
      for(const dep of task.dependsOn)assert.equal(all.get(dep).status,'done',task.id+': unfinished prerequisite '+dep);
    }
  }
  const ready=[...all.values()].filter(task=>task.status==='pending'&&task.dependsOn.every(id=>all.get(id).status==='done'))
    .sort((a,b)=>LANES.indexOf(a.lane)-LANES.indexOf(b.lane)||a.priority-b.priority);
  const totals={total:all.size,pending:0,inProgress:0,blocked:0,done:0,ready:ready.length};
  const lanes={};
  for(const lane of LANES)lanes[lane]={total:byLane[lane],pending:0,inProgress:0,blocked:0,done:0};
  const waiting=[],blocked=[];
  for(const task of all.values()){
    const key=task.status==='in-progress'?'inProgress':task.status;
    totals[key]++;lanes[task.lane][key]++;
    if(task.status==='pending'){
      const missing=task.dependsOn.filter(id=>all.get(id).status!=='done');
      if(missing.length)waiting.push({id:task.id,waitingFor:missing});
    }
    if(task.status==='blocked')blocked.push({id:task.id,reason:task.blockedReason});
  }
  if(specimen.stage==='published')assert.equal(totals.done,totals.total,'Published specimen has unfinished queued work');
  return {specimenId,stage:specimen.stage,totals,lanes,
    next:ready.map(task=>({id:task.id,lane:task.lane,title:task.title,priority:task.priority,
      acceptanceCriteria:task.acceptanceCriteria,outputs:task.outputs})),waiting,blocked};
}
export function inspectSpecimen(specimenId,{rootDir=ROOT}={}){
  assert.match(specimenId,slug,'Invalid specimen identifier');
  const load=path=>JSON.parse(readFileSync(resolve(rootDir,path),'utf8'));
  const editorial=load('specimens/queue.json').specimens.find(s=>s.id===specimenId);
  assert.ok(editorial,'Unknown editorial specimen '+specimenId);
  const queues=Object.fromEntries(LANES.map(lane=>[lane,load('specimens/'+specimenId+'/queues/'+lane+'.json')]));
  return validateWorkData({specimenId,queues,specimen:editorial,rootDir});
}
function help(){
  console.log('Usage: node scripts/specimen-work.mjs [status|next|validate] <specimen-id> [--json]');
  console.log('Read-only. No task is marked done or published by this script.');
}
function main(){
  const [cmd,id,format]=process.argv.slice(2);
  if(!['status','next','validate'].includes(cmd)||!id){help();process.exitCode=2;return;}
  const result=inspectSpecimen(id);
  if(cmd==='validate'){console.log(id+': '+result.totals.total+' task records and dependencies valid. No completion implied.');return;}
  if(format==='--json'){console.log(JSON.stringify(cmd==='next'?result.next:result,null,2));return;}
  if(cmd==='status'){
    console.log('Specimen: '+id+' | editorial stage: '+result.stage);
    for(const [lane,c] of Object.entries(result.lanes))
      console.log(lane+': '+c.done+'/'+c.total+' verified; '+c.pending+' pending; '+c.inProgress+' active; '+c.blocked+' blocked');
    console.log('Ready: '+result.totals.ready+' | Waiting on dependencies: '+result.waiting.length);
    if(result.next.length)console.log('Next: '+result.next[0].id+' — '+result.next[0].title);
  }else{
    if(!result.next.length){console.log('No currently actionable pending tasks. Review blocked or in-progress tasks.');return;}
    for(const task of result.next){
      console.log(task.id+' ['+task.lane+'] '+task.title);
      for(const check of task.acceptanceCriteria)console.log('  acceptance: '+check);
      for(const path of task.outputs)console.log('  output: '+path);
    }
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main();}catch(error){console.error(error.message);process.exitCode=1;}
}

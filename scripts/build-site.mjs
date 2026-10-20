import {inspectSpecimen} from './specimen-work.mjs';
import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const slug=/^[a-z][a-z0-9-]*$/;
const SITE=resolve(root,'site');
const OUT=resolve(root,'_site');

export function validatePublished(catalog,queue,rootDir=root){
  assert.equal(catalog.version,1,'Invalid gallery catalog version');
  assert.ok(Array.isArray(catalog.entries),'Gallery catalog must contain an entries array');
  const specimens=new Map(queue.specimens.map(s=>[s.id,s]));
  const visited=new Set();
  for(const item of catalog.entries){
    assert.ok(slug.test(item.id),'Invalid specimen ID in gallery');
    assert.ok(!visited.has(item.id),'Duplicate gallery specimen ID '+item.id);
    visited.add(item.id);
    assert.ok(item.title?.trim()?.length>2,'Published specimen needs a title');
    assert.ok(item.summary?.trim()?.length>30,'Published specimen needs a meaningful summary');
    assert.equal(item.path,'./specimens/'+item.id+'/','Unexpected exhibit path');
    const state=specimens.get(item.id);
    assert.ok(state,'Catalog includes an untracked specimen '+item.id);
    assert.equal(state.stage,'published',item.id+' is not publication approved');
    const work=inspectSpecimen(item.id,{rootDir});
    assert.equal(work.totals.done,work.totals.total,'Specimen work queues contain unfinished tasks: '+item.id);
    assert.ok(state.model.kind!=='pending'&&state.model.accuracy!=='not-modeled','Missing model '+item.id);
    const dossierPath=resolve(rootDir,'specimens',item.id,'specimen.json');
    assert.ok(existsSync(dossierPath),'Missing source dossier '+item.id);
    const dossier=JSON.parse(readFileSync(dossierPath,'utf8'));
    assert.equal(dossier.id,item.id,'Dossier identity mismatch');
    for(const gate of ['geometryReview','visitorQA','rightsReview'])
      assert.equal(dossier[gate]?.status,'passed',item.id+' has not passed '+gate);
    assert.ok(Array.isArray(dossier.facts)&&dossier.facts.length>=3,'Missing documented facts '+item.id);
    const page=resolve(rootDir,'site','specimens',item.id,'index.html');
    assert.ok(existsSync(page),'Missing actual exhibit page '+item.id);
  }
  return catalog.entries;
}

export function build(){
  const catalog=load('gallery/catalog.json'),queue=load('specimens/queue.json');
  const entries=validatePublished(catalog,queue);
  rmSync(OUT,{recursive:true,force:true});
  mkdirSync(resolve(OUT,'data'),{recursive:true});
  for(const file of ['index.html','styles.css','app.js']){
    cpSync(resolve(SITE,file),resolve(OUT,file));
  }
  for(const [source,dest] of [
    ['ontology/components.json','components.json'],
    ['ontology/sources.json','sources.json']
  ])cpSync(resolve(root,source),resolve(OUT,'data',dest));
  // Public manifest is the vetted gallery, never the internal editorial queue.
  writeFileSync(resolve(OUT,'data/gallery.json'),JSON.stringify({version:1,entries},null,2)+'\n');
  writeFileSync(resolve(OUT,'.nojekyll'),'');
  for(const entry of entries){
    cpSync(resolve(SITE,'specimens',entry.id),resolve(OUT,'specimens',entry.id),{recursive:true});
    mkdirSync(resolve(OUT,'specimens',entry.id,'data'),{recursive:true});
    for(const datafile of ['instances.json','instance-relations.json']){
      const source=resolve(root,'specimens',entry.id,'ontology',datafile);
      assert.ok(existsSync(source),'Missing specimen ontology file '+source);
      cpSync(source,resolve(OUT,'specimens',entry.id,'data',datafile));
    }
  }
  assert.equal(existsSync(resolve(OUT,'data/queue.json')),false,'Editorial queue leaked into public build');
  assert.equal(existsSync(resolve(OUT,'model.js')),false,'Draft model entered public build');
  console.log('Built website with '+entries.length+' approved gallery specimens.');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))build();

import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,validatePublished} from './build-site.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const catalog=read('gallery/catalog.json'),queue=read('specimens/queue.json');
const exhibits=validatePublished(catalog,queue);
const published=queue.specimens.filter(x=>x.stage==='published');
assert.equal(exhibits.length,published.length,'Every published specimen must appear exactly once');
assert.equal(exhibits.length,1,'The first completed specimen is Parthenon');
assert.equal(exhibits[0].id,'parthenon');
for(const candidate of queue.specimens.filter(x=>x.stage!=='published')){
 const item={version:1,entries:[{id:candidate.id,title:candidate.title,summary:'Unreviewed specimen must not be allowed into the public gallery.',path:'./specimens/'+candidate.id+'/'}]};
 assert.throws(()=>validatePublished(item,queue),/not publication approved/,'Unreviewed specimen admitted '+candidate.id);
}
build();
for(const path of ['_site/index.html','_site/data/components.json','_site/data/gallery.json',
 '_site/specimens/parthenon/index.html','_site/specimens/parthenon/model.js','_site/specimens/parthenon/viewer.js',
 '_site/specimens/parthenon/data/instances.json','_site/specimens/parthenon/data/instance-relations.json']){
 assert.equal(existsSync(resolve(root,path)),true,'Published asset missing '+path);
}
for(const path of ['_site/data/queue.json','_site/model.js','_site/specimens/pantheon','_site/specimens/chartres',
 '_site/specimens/hagia-sophia','_site/specimens/fallingwater']){
 assert.equal(existsSync(resolve(root,path)),false,'Internal draft or queue leaked '+path);
}
const manifest=read('_site/data/gallery.json');
assert.equal(manifest.entries.length,1);
assert.equal(manifest.entries[0].id,'parthenon');
console.log('Published Parthenon exhibit and all data present; pending specimen drafts excluded.');

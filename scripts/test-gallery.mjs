import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,validatePublished} from './build-site.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const catalog=load('gallery/catalog.json'),queue=load('specimens/queue.json');
const actual=validatePublished(catalog,queue);
assert.equal(actual.length,0,'No specimens have cleared the publication gate yet');
for(const draft of queue.specimens){
  const candidate={version:1,entries:[{id:draft.id,title:draft.title,summary:'A published interactive study of the selected architectural monument.',path:'./specimens/'+draft.id+'/'}]};
  assert.throws(()=>validatePublished(candidate,queue),/not publication approved/,'Unreviewed model was admitted: '+draft.id);
}
build();
assert.equal(existsSync(resolve(root,'_site/data/queue.json')),false);
assert.equal(existsSync(resolve(root,'_site/model.js')),false);
assert.equal(existsSync(resolve(root,'_site/data/gallery.json')),true);
assert.equal(existsSync(resolve(root,'_site/data/components.json')),true);
const html=readFileSync(resolve(root,'_site/index.html'),'utf8');
assert.doesNotMatch(html,/<canvas\b/i,'Public page must not expose incomplete model');
assert.doesNotMatch(html,/Parthenon/i,'Public landing page must not advertise an unfinished specimen');
console.log('Gallery gating and editorial-data isolation passed.');

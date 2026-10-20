import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const data=read('specimens/parthenon/ontology/instances.json'),parts=data.instances;
const ontology=read('ontology/components.json'),sources=read('ontology/sources.json');
const types=new Set(ontology.components.map(c=>c.id)),ids=new Set(parts.map(p=>p.id)),refs=new Set(sources.sources.map(s=>s.id));
assert.equal(ids.size,parts.length,'Duplicate physical part ID');
assert.equal(parts.length,536,'Physical inventory must reflect the eastern sanctuary support revision');
for(const p of parts){
 assert.ok(types.has(p.typeId),p.id+': invalid type');
 assert.ok(/^(parthenon\/)[a-z0-9/-]+$/.test(p.id),p.id+': unstable physical ID');
 assert.ok(Array.isArray(p.sourceIds)&&p.sourceIds.length>0&&p.sourceIds.every(s=>refs.has(s)),p.id+': unknown source');
 assert.ok(['box','shaft','echinus','ionic','roof','pediment'].includes(p.shape),p.id+': unsupported mesh shape');
 assert.ok(p.position.length===3&&p.position.every(Number.isFinite),p.id+': invalid location');
 assert.ok(p.size.length===3&&p.size.every(v=>Number.isFinite(v)&&v>0),p.id+': invalid dimensions');
 assert.ok(p.certainty&&p.label&&p.zone);
}
const count=fragment=>parts.filter(p=>p.id.includes(fragment)&&p.id.endsWith('/shaft')).length;
assert.equal(count('/peristyle/'),46,'Exterior Doric perimeter must have 46 distinct shafts');
assert.equal(count('/porch/'),12,'Outer pronaos and opisthonaos need 12 distinct shafts');
assert.equal(count('/west-room/'),4,'West chamber should have four Ionic shafts');
assert.equal(count('/east-room/lower/'),21,'Lower eastern U-shaped colonnade must have 21 shafts');
assert.equal(count('/east-room/upper/'),21,'Upper schematic colonnade must include 21 shafts');
assert.equal(parts.filter(p=>p.id.startsWith('parthenon/east-room/lower/pier-')).length,2,'Two terminal piers required');
const eastInner=parts.filter(p=>p.id.startsWith('parthenon/east-room/lower/')&&p.id.endsWith('/shaft'));
assert.equal(eastInner.filter(p=>p.position[0]===-6.4).length,9,'North U arm requires nine columns');
assert.equal(eastInner.filter(p=>p.position[0]===6.4).length,9,'South U arm requires nine columns');
assert.equal(eastInner.filter(p=>Math.abs(p.position[0])<4).length,3,'The U return requires three columns');
for(const side of ['north','south'])assert.equal(parts.find(p=>p.id==='parthenon/east-room/lower/pier-'+side)?.typeId,'pier');
assert.equal(parts.filter(p=>p.typeId==='metope').length,92,'Wrong metope count');
assert.equal(parts.filter(p=>p.shape==='roof').length,2);
assert.equal(parts.filter(p=>p.shape==='pediment').length,2);
assert.equal(parts.filter(p=>p.id.endsWith('/frieze-backing')).length,4,'All frieze bays must have connected backing');
const stylobate=parts.find(p=>p.id==='parthenon/base/stylobate');
assert.deepEqual([stylobate.size[0],stylobate.size[2]],[30.88,69.5]);
for(const shaft of parts.filter(p=>p.id.includes('/peristyle/')&&p.id.endsWith('/shaft')))assert.equal(shaft.size[1],10.43,'Unexpected exterior column height');
const east=[...parts.filter(p=>p.id.includes('/peristyle/east/')&&p.id.endsWith('/shaft'))].sort((a,b)=>a.position[0]-b.position[0]);
assert.equal(east.length,8);
assert.ok(Math.abs((east[1].position[0]-east[0].position[0])-3.68)<.002,'East corner-bay spacing incorrect');
assert.ok(Math.abs((east[3].position[0]-east[2].position[0])-4.29)<.002,'East regular spacing incorrect');
const north=parts.filter(p=>p.id.includes('/peristyle/north/')&&p.id.endsWith('/shaft'));
assert.equal(north.length,15);
const rel=read('specimens/parthenon/ontology/instance-relations.json');
for(const r of rel.relations)assert.ok(ids.has(r.from)&&ids.has(r.to),'Invalid physical relation');
const meshMap=read('specimens/parthenon/ontology/mesh-map.json');
assert.equal(meshMap.expected,parts.length);
const byId=new Map(parts.map(p=>[p.id,p]));
for(const side of ['east','west','north','south']){
 const arch=byId.get('parthenon/entablature/'+side+'/architrave');
 const band=byId.get('parthenon/entablature/'+side+'/frieze-backing');
 const cornice=byId.get('parthenon/entablature/'+side+'/cornice');
 const top=p=>p.position[1]+p.size[1]/2,bottom=p=>p.position[1]-p.size[1]/2;
 assert.ok(bottom(band)<=top(arch)+.005,'Architrave-to-frieze gap: '+side);
 assert.ok(bottom(cornice)<=top(band)+.005,'Frieze-to-cornice gap: '+side);
}
const roof=byId.get('parthenon/roof/north');
const eave=roof.position[1]-roof.size[1]/2,apex=roof.position[1]+roof.size[1]/2,slabThickness=.42;
for(const side of ['east','west']){
 const ped=byId.get('parthenon/pediment/'+side);
 assert.ok(Math.abs(ped.position[1]-eave)<.05,'Roof/eave gable elevation gap: '+side);
 assert.ok(Math.abs(ped.position[1]+ped.size[1]-apex)<.05,'Roof/gable ridge gap: '+side);
 assert.ok(Math.abs(ped.position[2]) + ped.size[2]/2 >= roof.size[2]/2-.08,'Roof/gable longitudinal gap: '+side);
}
for(const side of ['north','south']){
 const cornice=byId.get('parthenon/entablature/'+side+'/cornice');
 assert.ok(eave-slabThickness<=cornice.position[1]+cornice.size[1]/2,'Roof soffit must intersect cornice: '+side);
}
for(const p of parts.filter(p=>p.id.startsWith('parthenon/cella/')&&!p.id.includes('-lintel'))){
 assert.ok(p.position[1]+p.size[1]/2>=15.7,'Cella masonry must reach the underside of the roof');
}

const model=readFileSync(resolve(root,'site/specimens/parthenon/model.js'),'utf8');
const viewer=readFileSync(resolve(root,'site/specimens/parthenon/viewer.js'),'utf8');
assert.match(model,/userData\.instanceId/);
assert.match(model,/createRealisticMaterials/);
assert.match(model,/particleCount=900/,'The optional atmosphere must have visible dust sprites');
assert.match(model,/new THREE.ExtrudeGeometry/,'Pediment must be solid, not a single flat triangle');
assert.match(model,/slab with top|weathering slab/i,'Roof must be a closed solid, not a single open quad');
const materialModule=readFileSync(resolve(root,'site/specimens/parthenon/materials.js'),'utf8');
assert.match(materialModule,/roughnessMap/);
assert.match(materialModule,/bumpMap/);assert.match(viewer,/ray\.intersectObjects/);
console.log('Parthenon inventory validated: '+parts.length+' physical instances, 46 exterior shafts, 12 porch shafts, 4 Ionic shafts and 92 metopes.');

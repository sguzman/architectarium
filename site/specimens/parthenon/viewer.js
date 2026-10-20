import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {buildParthenon} from './model.js';
const $=id=>document.getElementById(id);
const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url+' '+r.status);return r.json();};
const elem=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
const href=(url,label)=>{const a=elem('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
try{
 const [data,ontology,books]=await Promise.all([load('./data/instances.json'),load('../../data/components.json'),load('../../data/sources.json')]);
 const inventory=data.instances,records=new Map(inventory.map(x=>[x.id,x])),types=new Map(ontology.components.map(x=>[x.id,x])),sources=new Map(books.sources.map(x=>[x.id,x]));
 if(records.size!==inventory.length)throw Error('Duplicate physical instance IDs');
 for(const p of inventory){if(!types.has(p.typeId))throw Error('Unknown component type '+p.typeId);if(p.sourceIds.some(s=>!sources.has(s)))throw Error('Unknown evidence source for '+p.id);}
 const stage=$('viewport'),canvas=$('viewer'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.07;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xa7b6b5);scene.fog=new THREE.FogExp2(0xabb7b4,.0034);
 const camera=new THREE.PerspectiveCamera(53,1,.10,500);const home=new THREE.Vector3(55,32,-83),center=new THREE.Vector3(0,8,0);
 camera.position.copy(home);
 const orbit=new OrbitControls(camera,canvas);orbit.target.copy(center);orbit.enableDamping=true;orbit.dampingFactor=.075;orbit.minDistance=3;orbit.maxDistance=180;orbit.maxPolarAngle=Math.PI*.495;orbit.update();
 const walk=new PointerLockControls(camera,canvas);
 scene.add(new THREE.HemisphereLight(0xe3f1ef,0x666050,2));
 const light=new THREE.DirectionalLight(0xffe2bd,3.1);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.00014;
 Object.assign(light.shadow.camera,{left:-52,right:52,top:75,bottom:-75,near:1,far:180});scene.add(light);
 const fill=new THREE.DirectionalLight(0xb4cfe0,.8);fill.position.set(-40,35,20);scene.add(fill);
 const model=buildParthenon(inventory);scene.add(model.root);
 $('count').textContent=model.modelCount+' individual selectable parts';
 const ray=new THREE.Raycaster(),uv=new THREE.Vector2();let activeId=null,material=null,selected=null,walking=false,hiddenRoof=false,hiddenWalls=false,search='',zone='all',frame=0,last=0,dirty=true;
 const keys=new Set(),zones=[...new Set(inventory.map(x=>x.zone))].sort();
 function press(id,on,onLabel,offLabel){const b=$(id);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));if(onLabel)b.textContent=on?onLabel:offLabel;}
 function draw(){dirty=true;if(!frame)frame=requestAnimationFrame(tick);}
 function tick(now){
  frame=0;const dt=Math.min(.06,(now-last)/1000||0);last=now;
  if(orbit.enabled)orbit.update();
  if(walking&&keys.size){
   const old=camera.position.clone(),speed=(keys.has('ShiftLeft')?8:4.4)*dt;
   if(keys.has('KeyW')||keys.has('ArrowUp'))walk.moveForward(speed);
   if(keys.has('KeyS')||keys.has('ArrowDown'))walk.moveForward(-speed);
   if(keys.has('KeyA')||keys.has('ArrowLeft'))walk.moveRight(-speed);
   if(keys.has('KeyD')||keys.has('ArrowRight'))walk.moveRight(speed);
   const p=camera.position;
   const colliding=model.colliders.some(w=>w.distanceToPoint(p)<.62);
   if(Math.abs(p.x)>85||Math.abs(p.z)>90||(!hiddenWalls&&colliding))p.copy(old);
   p.y=Math.abs(p.x)<14&&Math.abs(p.z)<35?2.86:1.76;dirty=true;
  }
  if(dirty){renderer.render(scene,camera);dirty=false;}
  if(walking&&keys.size)draw();
 }
 orbit.addEventListener('change',draw);walk.addEventListener('change',draw);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);draw();}
 new ResizeObserver(resize).observe(stage);resize();
 function resetCamera(){walking=false;orbit.enabled=true;stage.classList.remove('walking');keys.clear();camera.position.copy(home);orbit.target.copy(center);orbit.update();press('orbit',true);press('walk',false);$('modeLabel').textContent='ORBIT / DRAG TO ROTATE';draw();}
 walk.addEventListener('lock',()=>{walking=true;stage.classList.add('walking');press('orbit',false);press('walk',true);$('modeLabel').textContent='WASD / MOUSE · ESC TO EXIT';draw();});
 walk.addEventListener('unlock',resetCamera);
 document.addEventListener('pointerlockerror',resetCamera);
 $('walk').addEventListener('click',()=>{if(walking)return;orbit.enabled=false;camera.position.set(0,2.86,-38);camera.lookAt(0,3,-15);draw();walk.lock();});
 $('orbit').addEventListener('click',()=>walking?walk.unlock():resetCamera());
 $('roof').addEventListener('click',()=>{hiddenRoof=!hiddenRoof;for(const mesh of model.roofs)mesh.visible=!hiddenRoof;press('roof',hiddenRoof,'Restore roof','Hide roof');draw();});
 $('cutaway').addEventListener('click',()=>{hiddenWalls=!hiddenWalls;for(const mesh of model.walls)mesh.visible=!hiddenWalls;press('cutaway',hiddenWalls,'Restore walls','Cutaway');if(hiddenWalls&&!hiddenRoof)$('roof').click();draw();});
 function setSun(h){const t=(h-7)/12*Math.PI,a=(h-12)/12*Math.PI;light.position.set(Math.sin(a)*85,Math.max(7,Math.sin(t)*105),-Math.cos(a)*75);light.intensity=.8+2.7*Math.max(.1,Math.sin(t));$('hour').textContent=String(Math.floor(h)).padStart(2,'0')+':'+(h%1?'30':'00');draw();}
 $('sun').addEventListener('input',e=>setSun(Number(e.target.value)));setSun(15);
 function clearSelection(){if(selected){selected.material=material;selected=null;material=null;}activeId=null;draw();}
 function select(id){
  const part=records.get(id),mesh=model.byId.get(id);if(!part||!mesh)return;
  clearSelection();activeId=id;selected=mesh;material=mesh.material;
  const glow=material.clone();glow.emissive=new THREE.Color('#aa7245');glow.emissiveIntensity=.5;mesh.material=glow;
  if(orbit.enabled){const bounds=new THREE.Box3().setFromObject(mesh),p=bounds.getCenter(new THREE.Vector3());orbit.target.lerp(p,.28);}
  $('selectionStatus').textContent=part.typeId.toUpperCase().replaceAll('-',' ');
  const type=types.get(part.typeId),panel=$('detail');panel.replaceChildren();
  panel.append(elem('div','tag',part.zone.toUpperCase()+' / '+part.certainty.toUpperCase()),elem('h2','',part.label),elem('p','',type.definition));
  const dl=elem('dl');
  for(const [name,value] of [['Type',type.name],['Location',type.typicalLocation],['Purpose',type.function],['Shape',part.shape],['Dimension envelope',part.size.map(x=>x.toFixed(2)).join(' × ')+' m'],['Reference frame','Approximate local model coordinates'],['Evidence status',part.certainty]]){
   dl.append(elem('dt','',name),elem('dd','',value));
  }
  panel.append(dl);
  const relations=elem('div','related');
  for(const id of type.connectedTo){const c=types.get(id);if(!c)continue;const b=elem('button','',c.name);b.type='button';b.addEventListener('click',()=>{search=c.name.toLowerCase();$('search').value=c.name;zone='all';drawZones();drawParts();});relations.append(b);}
  panel.append(elem('div','tag','RELATED COMPONENT TYPES'),relations);
  const refs=elem('div','');for(const id of part.sourceIds){const s=sources.get(id);if(s)refs.append(href(s.url,s.publisher+' ↗'),elem('span','', ' '));}
  panel.append(elem('div','tag','ARCHITECTURAL REFERENCES'),refs,elem('p','detail-note','The chosen geometry is an interpretive component instance, not evidence of a measured surviving block.'));
  drawParts();draw();
 }
 const group=$('zones');function drawZones(){group.replaceChildren();for(const name of ['all',...zones]){const b=elem('button',zone===name?'active':'',name);b.type='button';b.setAttribute('aria-pressed',String(zone===name));b.addEventListener('click',()=>{zone=name;drawZones();drawParts();});group.append(b);}}
 function drawParts(){const root=$('parts');root.replaceChildren();const match=inventory.filter(p=>(zone==='all'||p.zone===zone)&&(!search||(p.label+' '+p.typeId+' '+p.id).toLowerCase().includes(search))).slice(0,180);
 for(const p of match){const b=elem('button','part-row'+(p.id===activeId?' active':''));b.type='button';b.append(elem('span','',p.label),elem('small','',p.typeId));b.addEventListener('click',()=>select(p.id));root.append(b);}
 if(!match.length)root.append(elem('p','detail-note','No matching parts.'));
 }
 $('search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();drawParts();});drawZones();drawParts();
 let down;canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);canvas.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7){down=null;return;}down=null;
  if(walking)uv.set(0,0);else{const b=canvas.getBoundingClientRect();uv.set((e.clientX-b.left)*2/b.width-1,1-(e.clientY-b.top)*2/b.height);}
  ray.setFromCamera(uv,camera);const hits=ray.intersectObjects(model.pickables,false).find(h=>h.object.visible&&h.object.userData.instanceId);
  if(hits)select(hits.object.userData.instanceId);
 });
 document.addEventListener('keydown',e=>{if(!walking)return;if(/^(Key[WASD]|Arrow(Up|Down|Left|Right)|ShiftLeft)$/.test(e.code)){e.preventDefault();keys.add(e.code);draw();}});
 document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 $('reset').addEventListener('click',()=>{if(walking)walk.unlock();else resetCamera();if(hiddenRoof)$('roof').click();if(hiddenWalls)$('cutaway').click();clearSelection();$('selectionStatus').textContent='SELECT A PART';$('detail').replaceChildren(elem('p','detail-note','Select a distinct architectural component to inspect its ontology.'));drawParts();});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);orbit.dispose();walk.disconnect();model.dispose();renderer.dispose();},{once:true});
}catch(error){console.error('Parthenon viewer could not initialize',error);$('error').hidden=false;$('error').textContent='The model could not load: '+error.message;$('count').textContent='Viewer unavailable';}

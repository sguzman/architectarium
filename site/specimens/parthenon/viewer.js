import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {buildParthenon} from './model.js';
import {attachSelectionOutline} from './selection-outline.js';
const $=id=>document.getElementById(id);
const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url+' '+r.status);return r.json();};
const elem=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
const href=(url,label)=>{const a=elem('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
try{
 const [data,ontology,books,instanceEdges]=await Promise.all([load('./data/instances.json'),load('../../data/components.json'),load('../../data/sources.json'),load('./data/instance-relations.json')]);
 const inventory=data.instances,records=new Map(inventory.map(x=>[x.id,x])),types=new Map(ontology.components.map(x=>[x.id,x])),sources=new Map(books.sources.map(x=>[x.id,x]));
 if(records.size!==inventory.length)throw Error('Duplicate physical instance IDs');
 for(const p of inventory){if(!types.has(p.typeId))throw Error('Unknown component type '+p.typeId);if(p.sourceIds.some(s=>!sources.has(s)))throw Error('Unknown evidence source for '+p.id);}
 const stage=$('viewport'),canvas=$('viewer'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.07;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xa7b6b5);scene.fog=new THREE.FogExp2(0xabb7b4,.0034);
 const camera=new THREE.PerspectiveCamera(53,1,.10,500);const home=new THREE.Vector3(41,26,-64),smallHome=new THREE.Vector3(55,32,-83),wideHome=home.clone(),center=new THREE.Vector3(0,8,0);
 camera.position.copy(home);
 const orbit=new OrbitControls(camera,canvas);orbit.target.copy(center);orbit.enableDamping=true;orbit.dampingFactor=.075;orbit.minDistance=3;orbit.maxDistance=180;orbit.maxPolarAngle=Math.PI*.495;orbit.update();
 const walk=new PointerLockControls(camera,canvas);
 scene.add(new THREE.HemisphereLight(0xe3f1ef,0x666050,2));
 const light=new THREE.DirectionalLight(0xffe2bd,3.1);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.00014;
 Object.assign(light.shadow.camera,{left:-52,right:52,top:75,bottom:-75,near:1,far:180});scene.add(light);
 const fill=new THREE.DirectionalLight(0xb4cfe0,.8);fill.position.set(-40,35,20);scene.add(fill);
 const firstFrameStart=performance.now();let firstBatchMillis=null;
 const model=await buildParthenon(inventory,(root,completed)=>{
  if(!root.parent)scene.add(root);
  if(firstBatchMillis===null)firstBatchMillis=Math.round(performance.now()-firstFrameStart);
  const w=stage.clientWidth,h=stage.clientHeight;
  if(w>0&&h>0){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  $('count').textContent='Building scene: '+completed+' / '+inventory.length;
  renderer.render(scene,camera);
 });
 if(!model.root.parent)scene.add(model.root);
 $('count').textContent=model.modelCount+' individual selectable parts';
 window.__architectariumMetrics={parts:model.modelCount,firstBatchMilliseconds:firstBatchMillis,buildMilliseconds:Math.round(performance.now()-firstFrameStart),progressive:true};
 const ray=new THREE.Raycaster(),uv=new THREE.Vector2();let activeId=null,material=null,selected=null,outline=null,focusBeforeSelection=null,walking=false,hiddenRoof=false,hiddenWalls=false,search='',zone='all',frame=0,last=0,dirty=true;
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
   const colliding=model.shaftColliders.some(w=>w.distanceToPoint(p)<.62)||(!hiddenWalls&&model.colliders.some(w=>w.distanceToPoint(p)<.62));
   if(Math.abs(p.x)>85||Math.abs(p.z)>90||colliding)p.copy(old);
   p.y=Math.abs(p.x)<14&&Math.abs(p.z)<35?2.86:1.76;dirty=true;
  }
  if(dirty){renderer.render(scene,camera);dirty=false;}
  if(walking&&keys.size)draw();
 }
 orbit.addEventListener('change',draw);walk.addEventListener('change',draw);
 let sizeMode=null;function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;const next=w<650?'compact':'wide';if(next!==sizeMode&&!walking){sizeMode=next;home.copy(next==='compact'?smallHome:wideHome);camera.position.copy(home);orbit.target.copy(center);orbit.update();}camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);draw();}
 new ResizeObserver(resize).observe(stage);resize();
 function resetCamera(){walking=false;orbit.enabled=true;stage.classList.remove('walking');keys.clear();camera.position.copy(home);orbit.target.copy(center);orbit.update();press('orbit',true);press('walk',false,'Exit walk','Walk inside');$('modeLabel').textContent='ORBIT / DRAG TO ROTATE';draw();}
 walk.addEventListener('lock',()=>{$('modeLabel').textContent='WASD / MOUSE · ESC TO EXIT';draw();});
 walk.addEventListener('unlock',resetCamera);
 document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&walking&&walk.isLocked===false)resetCamera();});
 document.addEventListener('pointerlockerror',()=>{if(walking){$('modeLabel').textContent='WASD / DRAG TO LOOK · ORBIT TO EXIT';draw();}});
 // Keyboard movement is available even when the browser denies pointer lock.
 $('walk').addEventListener('click',()=>{if(walking){if(walk.isLocked)walk.unlock();resetCamera();return;}walking=true;stage.classList.add('walking');press('orbit',false);press('walk',true,'Exit walk','Walk inside');orbit.enabled=false;camera.position.set(0,2.86,-38);camera.lookAt(0,3,-15);canvas.focus();$('modeLabel').textContent='WASD / DRAG TO LOOK · ESC TO EXIT';draw();});
 $('orbit').addEventListener('click',()=>{if(walk.isLocked)walk.unlock();else resetCamera();});
 $('roof').addEventListener('click',()=>{hiddenRoof=!hiddenRoof;for(const mesh of model.roofs)mesh.visible=!hiddenRoof;press('roof',hiddenRoof,'Restore roof','Hide roof');draw();});
 $('cutaway').addEventListener('click',()=>{hiddenWalls=!hiddenWalls;for(const mesh of model.walls)mesh.visible=!hiddenWalls;press('cutaway',hiddenWalls,'Restore walls','Cutaway');if(hiddenWalls&&!hiddenRoof)$('roof').click();draw();});
 function setSun(h){const t=(h-7)/12*Math.PI,a=(h-12)/12*Math.PI;light.position.set(Math.sin(a)*85,Math.max(7,Math.sin(t)*105),-Math.cos(a)*75);light.intensity=.8+2.7*Math.max(.1,Math.sin(t));$('hour').textContent=String(Math.floor(h)).padStart(2,'0')+':'+(h%1?'30':'00');draw();}
 $('sun').addEventListener('input',e=>setSun(Number(e.target.value)));setSun(15);
 // Atmospheric rendering is opt-in illustration, not reconstructed ancient weather.
 function setAtmosphere(enabled){
  model.dust.visible=enabled;
  scene.fog=new THREE.FogExp2(enabled?0xd0c5b1:0xabb7b4,enabled?.011:.0034);
  scene.background=new THREE.Color(enabled?0xc9c2b1:0xa7b6b5);
  fill.intensity=enabled?1.05:.8;
  const button=$('atmos');
  button.classList.toggle('active',enabled);
  button.setAttribute('aria-pressed',String(enabled));
  button.textContent=enabled?'Atmosphere: On':'Atmosphere: Off';
  $('atmosStatus').textContent=enabled?'Warm haze and sunlit dust':'Clear air';
  window.__architectariumAtmosphere={
   enabled,fogDensity:scene.fog.density,
   particleCount:model.dust.geometry.getAttribute('position').count,
   dustVisible:model.dust.visible,
   skyColor:'#'+scene.background.getHexString()
  };
  draw();
 }
 $('atmos').addEventListener('click',()=>setAtmosphere(!model.dust.visible));
 setAtmosphere(false);
 const materialKey='architectarium.material-mode';
 function materialPreference(){try{return localStorage.getItem(materialKey)==='realistic'?'realistic':'study';}catch{return 'study';}}
 function applyMaterialMode(mode){
  const previousId=activeId;
  clearSelection();
  model.setMaterialMode(mode);
  const realistic=mode==='realistic',button=$('materials');
  button.setAttribute('aria-pressed',String(realistic));
  button.classList.toggle('active',realistic);
  button.textContent='Materials: '+(realistic?'Realistic':'Study');
  if(previousId)select(previousId,false);
  if(window.__architectariumMetrics){
   window.__architectariumMetrics.materialMode=mode;
   window.__architectariumMetrics.realisticTextureCount=model.getRealisticTextureCount();
  }
  draw();
 }
 $('materials').addEventListener('click',()=>{
  const mode=model.getMaterialMode()==='study'?'realistic':'study';
  applyMaterialMode(mode);
  try{localStorage.setItem(materialKey,mode);}catch{}
 });
 applyMaterialMode(materialPreference());
 function updateSelectionState(){
  window.__architectariumSelection={
   id:activeId,outlined:Boolean(outline),outlineParts:outline?.group.children.length||0,
   orbitTarget:orbit.target.toArray(),cameraPosition:camera.position.toArray()
  };
 }
 function clearSelection(restoreFocus=false,clearDetail=false){
  if(outline){outline.detach();outline=null;}
  if(selected){
   const highlight=selected.material;selected.material=material;
   if(highlight!==material)highlight.dispose();
   selected=null;material=null;
  }
  activeId=null;
  if(restoreFocus){
   if(focusBeforeSelection&&orbit.enabled){
    camera.position.copy(focusBeforeSelection.position);
    orbit.target.copy(focusBeforeSelection.target);
    orbit.update();
   }
   focusBeforeSelection=null;
  }
  if(clearDetail){
   $('selectionStatus').textContent='SELECT A PART';
   $('detail').replaceChildren(elem('p','detail-note','Select an architectural part to focus and outline it. Select it again to clear the focus.'));
  }
  drawParts();updateSelectionState();draw();
 }
 function select(id,focus=true){
  const part=records.get(id),mesh=model.byId.get(id);if(!part||!mesh)return;
  // A second model or index click on the same part deselects it.
  if(focus&&activeId===id){clearSelection(true,true);return;}
  if(focus&&orbit.enabled&&!focusBeforeSelection){
   focusBeforeSelection={position:camera.position.clone(),target:orbit.target.clone()};
  }
  clearSelection();
  activeId=id;selected=mesh;material=mesh.material;
  const glow=material.clone();glow.emissive=new THREE.Color('#aa7245');glow.emissiveIntensity=.5;mesh.material=glow;
  mesh.userData.extents=part.size;
  outline=attachSelectionOutline(mesh);
  if(focus&&orbit.enabled){
   // Translate camera and orbit target together: keep zoom and view direction,
   // but center the actual selected mesh so subsequent zoom goes toward it.
   const bounds=new THREE.Box3().setFromObject(mesh),target=bounds.getCenter(new THREE.Vector3());
   camera.position.add(target.clone().sub(orbit.target));
   orbit.target.copy(target);
   orbit.update();
  }
  $('selectionStatus').textContent=part.typeId.toUpperCase().replaceAll('-',' ');
  const type=types.get(part.typeId),panel=$('detail');panel.replaceChildren();
  panel.append(elem('div','tag',part.zone.toUpperCase()+' / '+part.certainty.toUpperCase()),elem('h2','',part.label),elem('p','',type.definition));
  const dl=elem('dl');
  for(const [name,value] of [['Type',type.name],['Location',type.typicalLocation],['Purpose',type.function],['Shape',part.shape],['Modeled centre',part.position.map(x=>x.toFixed(2)).join(' / ')+' m'],['Dimension envelope',part.size.map(x=>x.toFixed(2)).join(' × ')+' m'],['Reference frame','Approximate local model coordinates'],['Evidence status',part.certainty]]){
   dl.append(elem('dt','',name),elem('dd','',value));
  }
  panel.append(dl);
  const relations=elem('div','related');
  for(const id of type.connectedTo){const c=types.get(id);if(!c)continue;const b=elem('button','',c.name);b.type='button';b.addEventListener('click',()=>{search=c.name.toLowerCase();$('search').value=c.name;zone='all';drawZones();drawParts();});relations.append(b);}
  panel.append(elem('div','tag','RELATED COMPONENT TYPES'),relations);
  const physical=elem('div','related instance-related');
  for(const e of instanceEdges.relations.filter(e=>e.from===part.id&&records.has(e.to)).slice(0,14)){
   const target=records.get(e.to),b=elem('button','',e.predicate.replaceAll('-',' ')+' → '+target.label);
   b.type='button';b.addEventListener('click',()=>{select(target.id);});
   physical.append(b);
  }
  if(physical.childElementCount){panel.append(elem('div','tag','CONNECTED PHYSICAL PARTS'),physical);}
  const refs=elem('div','');for(const id of part.sourceIds){const s=sources.get(id);if(s)refs.append(href(s.url,s.publisher+' ↗'),elem('span','', ' '));}
  panel.append(elem('div','tag','ARCHITECTURAL REFERENCES'),refs,elem('p','detail-note','The chosen geometry is an interpretive component instance, not evidence of a measured surviving block.'));
  drawParts();updateSelectionState();draw();
 }
 const group=$('zones');function drawZones(){group.replaceChildren();for(const name of ['all',...zones]){const b=elem('button',zone===name?'active':'',name);b.type='button';b.setAttribute('aria-pressed',String(zone===name));b.addEventListener('click',()=>{zone=name;drawZones();drawParts();});group.append(b);}}
 function drawParts(){const root=$('parts');root.replaceChildren();const match=inventory.filter(p=>(zone==='all'||p.zone===zone)&&(!search||(p.label+' '+p.typeId+' '+p.id).toLowerCase().includes(search))).slice(0,180);
 for(const p of match){const b=elem('button','part-row'+(p.id===activeId?' active':''));b.type='button';b.setAttribute('aria-pressed',String(p.id===activeId));b.title=p.id===activeId?'Select again to clear focus':'Focus and outline this part';b.append(elem('span','',p.label),elem('small','',p.typeId));b.addEventListener('click',()=>select(p.id));root.append(b);}
 if(!match.length)root.append(elem('p','detail-note','No matching parts.'));
 }
 $('search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();drawParts();});drawZones();drawParts();
 let down;canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];if(walking&&!walk.isLocked&&e.button===0)walk.lock();});
 canvas.addEventListener('pointermove',e=>{
  if(!walking||walk.isLocked||!down)return;
  const rot=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');
  rot.y-=(e.movementX||0)*.003;rot.x=Math.max(-Math.PI/2+.03,Math.min(Math.PI/2-.03,rot.x-(e.movementY||0)*.003));
  camera.quaternion.setFromEuler(rot);draw();
 });
 canvas.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7){down=null;return;}down=null;
  if(walking)uv.set(0,0);else{const b=canvas.getBoundingClientRect();uv.set((e.clientX-b.left)*2/b.width-1,1-(e.clientY-b.top)*2/b.height);}
  ray.setFromCamera(uv,camera);const hits=ray.intersectObjects(model.pickables,true).find(h=>h.object.visible&&h.object.userData.instanceId);
  if(hits)select(hits.object.userData.instanceId);
 });
 document.addEventListener('keydown',e=>{if(!walking)return;if(e.code==='Escape'){if(walk.isLocked)walk.unlock();resetCamera();return;}if(/^(Key[WASD]|Arrow(Up|Down|Left|Right)|ShiftLeft)$/.test(e.code)){e.preventDefault();keys.add(e.code);draw();}});
 document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 $('reset').addEventListener('click',()=>{if(walk.isLocked)walk.unlock();resetCamera();if(hiddenRoof)$('roof').click();if(hiddenWalls)$('cutaway').click();clearSelection(false,true);focusBeforeSelection=null;});
 window.addEventListener('pagehide',()=>{clearSelection();cancelAnimationFrame(frame);orbit.dispose();walk.disconnect();model.dispose();renderer.dispose();},{once:true});
}catch(error){console.error('Parthenon viewer could not initialize',error);$('error').hidden=false;$('error').textContent='The model could not load: '+error.message;$('count').textContent='Viewer unavailable';}

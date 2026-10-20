import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { buildParthenon } from './model.js';

const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const read=async path=>{const response=await fetch(path);if(!response.ok)throw Error(path+' returned HTTP '+response.status);return response.json();};
const stage=$('viewport'),canvas=$('view'),error=$('error');
try{
 const [ontology,references,queue]=await Promise.all([read('./data/components.json'),read('./data/sources.json'),read('./data/queue.json')]);
 const concepts=new Map(ontology.components.map(c=>[c.id,c])),sources=new Map(references.sources.map(s=>[s.id,s]));
 const specimens=queue.specimens.slice().sort((a,b)=>a.priority-b.priority);
 $('specimenCount').textContent=specimens.length+' RECORDS';
 $('termCount').textContent=concepts.size+' TERMS';
 $('specimenList').innerHTML=specimens.map((s,i)=>'<div class="specimen '+(s.id==='parthenon'?'current':'')+'"><div class="n"><span>'+String(i+1).padStart(2,'0')+'</span><span>'+esc(s.tradition.toUpperCase())+'</span></div><h3>'+esc(s.title)+'</h3><p>'+esc(s.location)+'</p><div class="status">'+esc(s.stage==='model-draft'?'3D study available':'Research queue')+'</div></div>').join('');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#a6b4b1');scene.fog=new THREE.FogExp2(0xadb9b6,.0048);
 const camera=new THREE.PerspectiveCamera(51,1,.08,450);
 const home=new THREE.Vector3(57,31,-78),target=new THREE.Vector3(0,7,0);camera.position.copy(home);
 const orbit=new OrbitControls(camera,canvas);orbit.target.copy(target);orbit.enableDamping=true;orbit.dampingFactor=.07;orbit.maxPolarAngle=Math.PI*.49;orbit.minDistance=4;orbit.maxDistance=185;orbit.update();
 const walk=new PointerLockControls(camera,canvas);
 const ambient=new THREE.HemisphereLight(0xe4f0f0,0x6d6456,2.0);scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xffddab,3.0);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-53,right:53,top:77,bottom:-77,near:1,far:190});
 sun.shadow.bias=-.00019;scene.add(sun);
 const skyFill=new THREE.DirectionalLight(0xa8c5d4,.85);skyFill.position.set(-38,30,20);scene.add(skyFill);
 const model=buildParthenon();scene.add(model.root);
 $('sceneState').textContent=model.pickables.length+' selectable elements · interpretive reconstruction';
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
 let selectedMesh=null,originalMaterial=null,selectedConcept=null,walking=false,modePending=false;
 let roofHidden=false,cutaway=false,atmosphere=false;
 let frame=0,needsDraw=true,last=0;const keys=new Set();const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function request(){needsDraw=true;if(!frame)frame=requestAnimationFrame(tick);}
 function tick(now){
  frame=0;const dt=Math.min(.055,(now-last)/1000||0);last=now;
  if(orbit.enabled)orbit.update();
  if(walking&&keys.size){
   const old=camera.position.clone(),speed=(keys.has('ShiftLeft')?9:4.6)*dt;
   if(keys.has('KeyW')||keys.has('ArrowUp'))walk.moveForward(speed);
   if(keys.has('KeyS')||keys.has('ArrowDown'))walk.moveForward(-speed);
   if(keys.has('KeyA')||keys.has('ArrowLeft'))walk.moveRight(-speed);
   if(keys.has('KeyD')||keys.has('ArrowRight'))walk.moveRight(speed);
   const p=camera.position;
   if(Math.abs(p.x)>90||Math.abs(p.z)>92||model.colliders.some(b=>b.distanceToPoint(p)<.62))p.copy(old);
   const onTemple=Math.abs(p.x)<15&&Math.abs(p.z)<34.7;
   p.y=onTemple?2.92:1.72;needsDraw=true;
  }
  if(atmosphere&&!reducedMotion){model.dust.rotation.y+=dt*.004;needsDraw=true;}
  if(needsDraw){renderer.render(scene,camera);needsDraw=false;}
  if((walking&&keys.size)||(atmosphere&&!reducedMotion))request();
 }
 orbit.addEventListener('change',request);walk.addEventListener('change',request);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w<1||h<1)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);request();}
 new ResizeObserver(resize).observe(stage);resize();
 const inspect=$('inspector'),termList=$('terms'),search=$('search');
 function displayConcept(id,label){
  const c=concepts.get(id);if(!c)return;
  selectedConcept=id;
  const links=c.examples.map(e=>{const s=sources.get(e.sourceId);return '<div class="example">'+esc(e.building)+(s?' · <a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.publisher)+' ↗</a>':'')+'</div>';}).join('');
  inspect.innerHTML='<div class="tag">'+esc(c.category)+' / '+(model.instances.has(id)?'3D mapped':'ontology reference')+'</div><h3>'+esc(c.name)+'</h3>'+
   (label?'<div class="tag">'+esc(label)+'</div>':'')+
   '<p>'+esc(c.definition)+'</p><dl><dt>Typical location</dt><dd>'+esc(c.typicalLocation)+'</dd>'+
   '<dt>Architectural function</dt><dd>'+esc(c.function)+'</dd>'+
   '<dt>Commonly connected to</dt><dd>'+c.connectedTo.map(k=>'<button type="button" class="rel" data-related="'+esc(k)+'">'+esc(concepts.get(k)?.name??k)+'</button>').join('')+'</dd>'+
   '<dt>Example building and references</dt><dd>'+links+'</dd></dl>'+
   '<div class="note">'+(model.instances.has(id)?'Highlighted geometry is a schematic interpretation.':'This concept is indexed but has no geometry in the current Parthenon study.')+'</div>';
  for(const b of termList.querySelectorAll('button[data-concept]'))b.classList.toggle('active',b.dataset.concept===id);
 }
 function unhighlight(){if(selectedMesh){selectedMesh.material=originalMaterial;selectedMesh=null;originalMaterial=null;}}
 function highlight(mesh){
  unhighlight();if(!mesh)return;selectedMesh=mesh;originalMaterial=mesh.material;
  const m=originalMaterial.clone();m.emissive=new THREE.Color('#a46b39');m.emissiveIntensity=.47;mesh.material=m;
  request();
 }
 function select(id,mesh=null){
  const instance=mesh||model.instances.get(id)?.[0]||null;
  displayConcept(id,instance?.userData?.instanceLabel||'');
  highlight(instance);
  if(instance&&orbit.enabled){const box=new THREE.Box3().setFromObject(instance),center=box.getCenter(new THREE.Vector3());
   if(Number.isFinite(center.x))orbit.target.lerp(center,.30);}
  request();
 }
 function drawTerms(){
  const q=search.value.trim().toLowerCase();
  const list=ontology.components.filter(c=>!q||(c.name+' '+c.category+' '+c.definition+' '+c.typicalLocation).toLowerCase().includes(q));
  termList.innerHTML=list.map(c=>'<button type="button" data-concept="'+esc(c.id)+'" class="'+(selectedConcept===c.id?'active':'')+'">'+esc(c.name)+'</button>').join('');
  if(!list.length)termList.innerHTML='<span class="aside-note">No matching architectural terms.</span>';
 }
 drawTerms();search.addEventListener('input',drawTerms);
 termList.addEventListener('click',e=>{const b=e.target.closest('button[data-concept]');if(b)select(b.dataset.concept);});
 inspect.addEventListener('click',e=>{const b=e.target.closest('button[data-related]');if(b){select(b.dataset.related);search.value='';drawTerms();}});
 let press=null;canvas.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',e=>{
  if(!press||Math.hypot(e.clientX-press.x,e.clientY-press.y)>6){press=null;return;}press=null;
  if(walking)mouse.set(0,0);
  else{const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));}
  raycaster.setFromCamera(mouse,camera);
  const found=raycaster.intersectObjects(model.pickables,false).find(x=>x.object?.userData?.partId);
  if(found)select(found.object.userData.partId,found.object);
 });
 function toggleButton(id,on,labelOn,labelOff){
  const b=$(id);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));if(labelOn)b.textContent=on?labelOn:labelOff;
 }
 $('roofToggle').addEventListener('click',()=>{roofHidden=!roofHidden;for(const obj of model.roofs)obj.visible=!roofHidden;toggleButton('roofToggle',roofHidden,'Show roof','Hide roof');request();});
 $('wallsToggle').addEventListener('click',()=>{cutaway=!cutaway;for(const obj of model.walls)obj.visible=!cutaway;toggleButton('wallsToggle',cutaway,'Restore walls','Cutaway');if(cutaway&&!roofHidden)$('roofToggle').click();request();});
 $('dustToggle').addEventListener('click',()=>{atmosphere=!atmosphere;model.dust.visible=atmosphere;toggleButton('dustToggle',atmosphere,'Hide atmosphere','Atmosphere');request();});
 function restoreOrbit(){
  walking=false;modePending=false;orbit.enabled=true;stage.classList.remove('walking');
  camera.position.copy(home);orbit.target.copy(target);orbit.update();keys.clear();
  toggleButton('orbitMode',true);toggleButton('walkMode',false);$('navigationState').textContent='ORBIT / DRAG TO ROTATE';request();
 }
 walk.addEventListener('lock',()=>{walking=true;modePending=false;stage.classList.add('walking');toggleButton('walkMode',true);toggleButton('orbitMode',false);$('navigationState').textContent='WASD / MOUSE · ESC TO EXIT';request();});
 walk.addEventListener('unlock',restoreOrbit);
 document.addEventListener('pointerlockerror',restoreOrbit);
 $('walkMode').addEventListener('click',()=>{
  if(walking)return;modePending=true;orbit.enabled=false;
  camera.position.set(0,2.7,-45);camera.lookAt(0,4,-10);request();walk.lock();
 });
 $('orbitMode').addEventListener('click',()=>{if(walking)walk.unlock();else restoreOrbit();});
 document.addEventListener('keydown',e=>{if(!walking)return;
  if(/^(Key[WASD]|Arrow(Up|Down|Left|Right)|ShiftLeft)$/.test(e.code)){e.preventDefault();keys.add(e.code);request();}
 });
 document.addEventListener('keyup',e=>{keys.delete(e.code);});
 window.addEventListener('blur',()=>keys.clear());
 function setLight(hour){const t=(hour-7)/12*Math.PI,az=(hour-12)/12*Math.PI;
  sun.position.set(Math.sin(az)*83,Math.max(5,Math.sin(t)*95),Math.cos(az)*-65);
  sun.intensity=.8+2.45*Math.max(.12,Math.sin(t));$('hourLabel').textContent=String(Math.floor(hour)).padStart(2,'0')+':'+(hour%1?'30':'00');request();
 }
 $('daylight').addEventListener('input',e=>setLight(Number(e.target.value)));setLight(16);
 $('reset').addEventListener('click',()=>{if(walking)walk.unlock();else restoreOrbit();
  if(roofHidden)$('roofToggle').click();if(cutaway)$('wallsToggle').click();unhighlight();selectedConcept=null;
  search.value='';drawTerms();inspect.innerHTML='<div class="placeholder"><span>SELECT A COMPONENT</span><strong>Every detail has a name.</strong><p>Click the building or use the component glossary to begin exploring.</p></div>';request();
 });
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);orbit.dispose();walk.disconnect();renderer.dispose();},{once:true});
}catch(e){
 error.hidden=false;error.textContent='Architectural viewer could not initialize: '+e.message+'. Check your connection and reload. The ontology and specimen records remain available in the public repository.';
 $('sceneState').textContent='Viewer unavailable';
 console.error(e);
}

import * as THREE from 'three';

// Original pedagogical geometry. Approximate metres, not surveyed coordinates.
export function buildParthenon() {
 const root=new THREE.Group(), pickables=[], instances=new Map(), roofs=[], walls=[], colliders=[];
 const stone=new THREE.MeshStandardMaterial({color:0xdfceb0,roughness:.86});
 const bright=new THREE.MeshStandardMaterial({color:0xf1dfbc,roughness:.84});
 const shadow=new THREE.MeshStandardMaterial({color:0xb5a28c,roughness:.92});
 const tile=new THREE.MeshStandardMaterial({color:0xb79d83,roughness:.91,side:THREE.DoubleSide});
 const olive=new THREE.MeshStandardMaterial({color:0x657057,roughness:1});
 // Repeatable, original mineral-grain texture. No external texture assets.
 function grainTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=192;
  const ctx=canvas.getContext('2d');const img=ctx.createImageData(192,192);
  let state=719;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  for(let y=0;y<192;y++)for(let x=0;x<192;x++){
   const veins=4*Math.sin(x*.071+y*.039)+2*Math.sin(y*.129-x*.055);
   const speck=(random()-.5)*20;const v=Math.max(190,Math.min(255,232+veins+speck));
   const i=(y*192+x)*4;img.data[i]=v;img.data[i+1]=v-3;img.data[i+2]=v-8;img.data[i+3]=255;
  }
  ctx.putImageData(img,0,0);const t=new THREE.CanvasTexture(canvas);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  return t;
 }
 const grain=grainTexture();
 for(const m of [stone,bright,shadow]){m.map=grain;m.bumpMap=grain;m.bumpScale=.045;m.needsUpdate=true;}

 function add(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m;}
 function tag(m,id,label){m.userData.partId=id;m.userData.instanceLabel=label;pickables.push(m);if(!instances.has(id))instances.set(id,[]);instances.get(id).push(m);return m;}
 function box(id,label,w,h,d,x,y,z,mat=stone,solid=false){
  const m=add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);if(id)tag(m,id,label);
  if(solid)colliders.push(new THREE.Box3().setFromObject(m));return m;
 }
 const ground=add(new THREE.PlaneGeometry(330,330),new THREE.MeshStandardMaterial({color:0x85836e,roughness:1}),0,-.07,0);
 ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 box('stereobate','Lower stepped platform',32.8,.4,71,0,.2,0,shadow);
 box('stereobate','Upper stepped platform',31.8,.43,70.3,0,.62,0);
 box('stylobate','Uppermost platform course',31.0,.4,69.4,0,1.035,0,bright);
 for(let i=0;i<5;i++)box(null,'Approach',8,.17,1.8,0,.17+i*.19,-39.5+i*1.7,shadow);
 function fluteGeom(){
  const v=[],ix=[],s=200,r=12;
  for(let j=0;j<=r;j++){const t=j/r,R=.86-.18*t+.025*Math.sin(Math.PI*t);
   for(let i=0;i<=s;i++){const a=i/s*Math.PI*2,depth=.032*(1-Math.cos(a*20))*.5,rr=R-depth;v.push(Math.sin(a)*rr,t*8.65,Math.cos(a)*rr);}
  }
  for(let j=0;j<r;j++)for(let i=0;i<s;i++){const a=j*(s+1)+i,b=a+s+1;ix.push(a,a+1,b,b,a+1,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g;
 }
 const shaft=fluteGeom();
 const echinus=new THREE.LatheGeometry([new THREE.Vector2(.65,0),new THREE.Vector2(.70,.1),new THREE.Vector2(.81,.28),new THREE.Vector2(.92,.45)],48);
 const columns=[];
 for(let i=0;i<8;i++){const x=-13.4+26.8*i/7;columns.push([x,-30.4,'East',i+1],[x,30.4,'West',i+1]);}
 for(let j=1;j<16;j++){const z=-30.4+60.8*j/16;columns.push([-13.4,z,'North',j+1],[13.4,z,'South',j+1]);}
 for(const [x,z,face,n] of columns){const label=face+' column '+String(n).padStart(2,'0');
  tag(add(shaft,stone,x,1.24,z),'column-shaft',label+' / fluted shaft');
  tag(add(echinus,bright,x,9.89,z),'echinus',label+' / Doric echinus');
  tag(add(new THREE.BoxGeometry(1.9,.25,1.9),bright,x,10.47,z),'abacus',label+' / abacus');
 }
 for(const z of [-31.18,31.18]){
  box('architrave',(z<0?'East':'West')+' architrave',29.8,.85,1.65,0,11.1,z);
  box('cornice',(z<0?'East':'West')+' cornice',32,.43,2.55,0,13.2,z,bright);
 }
 for(const x of [-14.23,14.23]){
  box('architrave',(x<0?'North':'South')+' architrave',1.65,.85,63.2,x,11.1,0);
  box('cornice',(x<0?'North':'South')+' cornice',2.5,.43,65.5,x,13.2,0,bright);
 }
 function frieze(axis,coord,side,span,count){
  for(let i=0;i<count;i++){const isTri=i%2===0,id=isTri?'triglyph':'metope';
   const t=-span/2+(i+.5)*span/count,len=span/count-.025;
   const x=axis==='x'?t:coord,z=axis==='z'?t:coord;
   box(id,side+' '+id+' '+(Math.floor(i/2)+1),axis==='x'?len:.17,1.09,axis==='z'?len:.17,x,12.12,z,isTri?shadow:bright);
  }
 }
 frieze('x',-31.25,'East',29.5,26);frieze('x',31.25,'West',29.5,26);
 frieze('z',-14.29,'North',62.7,50);frieze('z',14.29,'South',62.7,50);
 for(const x of [-8.1,8.1])walls.push(box('cella','Cella side wall',.82,8.75,47.5,x,5.57,0,stone,true));
 for(const z of [-23.7,23.7]){
  for(const x of [-5.5,5.5])walls.push(box('cella','Cella end wall',5.1,8.75,.84,x,5.57,z,stone,true));
  walls.push(box('cella','Cella lintel',5.8,2.0,.84,0,8.95,z,bright));
 }
 box('pronaos','Entrance porch floor',13.9,.20,5.7,0,1.4,-26.5,bright);
 for(const x of [-8.57,8.57])box('ionic-frieze','Ionic frieze on cella wall',.19,.6,47.3,x,10.27,0,shadow);
 for(const z of [-24.13,24.13])box('ionic-frieze','Ionic frieze on end wall',16.7,.6,.19,0,10.27,z,shadow);
 const ridge=16.1,eave=13.42,width=16.2,length=33.4;
 for(const dir of [-1,1]){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,ridge,-length,dir*width,eave,-length,dir*width,eave,length,0,ridge,length],3));
  g.setIndex(dir<0?[0,2,1,0,3,2]:[0,1,2,0,2,3]);g.computeVertexNormals();
  roofs.push(tag(add(g,tile),'roof',(dir<0?'North':'South')+' roof plane'));
  for(let i=1;i<17;i++){const t=i/17,bar=add(new THREE.CylinderGeometry(.025,.025,length*2,5),shadow,dir*width*t,ridge+(eave-ridge)*t+.04,0);bar.rotation.x=Math.PI/2;bar.castShadow=false;roofs.push(bar);}
 }
 for(const z of [-length,length]){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-width,eave,z,width,eave,z,0,ridge,z],3));
  g.setIndex(z<0?[0,2,1]:[0,1,2]);g.computeVertexNormals();
  roofs.push(tag(add(g,bright),'pediment',(z<0?'East':'West')+' pediment'));
 }
 // Environmental landscaping is atmospheric dressing, not a historical site survey.
 let seed=137;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<160;i++){const x=(rand()-.5)*146,z=(rand()-.5)*152;
  if(Math.abs(x)<20&&Math.abs(z)<43)continue;
  const m=add(new THREE.DodecahedronGeometry(.25+rand()*.55,1),i%4?shadow:olive,x,.12,z);
  m.scale.set(1+rand(),.3+rand()*.5,1+rand());m.castShadow=i%6===0;
 }
 const particles=new Float32Array(260*3);
 for(let i=0;i<260;i++){particles[i*3]=(rand()-.5)*32;particles[i*3+1]=2+rand()*11;particles[i*3+2]=(rand()-.5)*64;}
 const dgeo=new THREE.BufferGeometry();dgeo.setAttribute('position',new THREE.BufferAttribute(particles,3));
 const dust=new THREE.Points(dgeo,new THREE.PointsMaterial({color:0xffebd3,size:.075,transparent:true,opacity:.38,depthWrite:false}));
 dust.visible=false;root.add(dust);
 return {root,pickables,instances,roofs,walls,colliders,dust};
}

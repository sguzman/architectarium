import * as THREE from 'three';
export function buildParthenon(inventory){
 const root=new THREE.Group(),pickables=[],byId=new Map(),roofs=[],walls=[],colliders=[];
 const palette={
  marble:new THREE.MeshStandardMaterial({color:0xdfceb2,roughness:.83,metalness:0}),
  light:new THREE.MeshStandardMaterial({color:0xe9d9b9,roughness:.80}),
  roof:new THREE.MeshStandardMaterial({color:0xc1b19b,roughness:.87,side:THREE.DoubleSide}),
  shadow:new THREE.MeshStandardMaterial({color:0xbca88e,roughness:.9}),
  pediment:new THREE.MeshStandardMaterial({color:0xe8d5ae,roughness:.87,side:THREE.DoubleSide}),
  ground:new THREE.MeshStandardMaterial({color:0x8d8d75,roughness:1})
 };
 // All surface variation is procedural, independently authored, and reproducible.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);let seed=2026;
 for(let i=0;i<128*128;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const x=i%128,y=Math.floor(i/128),grain=(seed/4294967296-.5)*20;
  const shade=Math.max(178,Math.min(249,224+grain+4*Math.sin(x*.08+y*.04)));
  pixels.data[i*4]=shade;pixels.data[i*4+1]=shade-3;pixels.data[i*4+2]=shade-8;pixels.data[i*4+3]=255;
 }
 ctx.putImageData(pixels,0,0);const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);
 for(const material of [palette.marble,palette.light,palette.shadow]){material.map=texture;material.bumpMap=texture;material.bumpScale=.035;}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),palette.ground);
 ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;root.add(ground);
 const geometryCache=new Map();
 function shaftGeometry(width,height){
  const key=width+':'+height;if(geometryCache.has(key))return geometryCache.get(key);
  const verts=[],indexes=[],ring=120,steps=12,rad=width/2;
  for(let j=0;j<=steps;j++){const t=j/steps;
   const profile=rad*(1-.11*t+.012*Math.sin(Math.PI*t));
   for(let i=0;i<=ring;i++){const ang=i/ring*Math.PI*2,groove=.025*(1-Math.cos(ang*20))*.5;
    const radius=profile-groove;verts.push(Math.sin(ang)*radius,(t-.5)*height,Math.cos(ang)*radius);}
  }
  for(let j=0;j<steps;j++)for(let i=0;i<ring;i++){const a=j*(ring+1)+i,b=a+ring+1;indexes.push(a,a+1,b,b,a+1,b+1);}
  const mesh=new THREE.BufferGeometry();mesh.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));mesh.setIndex(indexes);mesh.computeVertexNormals();geometryCache.set(key,mesh);return mesh;
 }
 function geometry(record){
  const [w,h,d]=record.size;
  if(record.shape==='box')return new THREE.BoxGeometry(w,h,d);
  if(record.shape==='shaft')return shaftGeometry(w,h);
  if(record.shape==='echinus')return new THREE.LatheGeometry([new THREE.Vector2(w*.35,0),new THREE.Vector2(w*.41,h*.3),new THREE.Vector2(w*.49,h*.9),new THREE.Vector2(w*.50,h)],40);
  if(record.shape==='ionic')return new THREE.CylinderGeometry(w*.43,w*.43,h,40);
  if(record.shape==='pediment'){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,0,w/2,0,0,0,h,0],3));
   g.setIndex([0,1,2]);g.computeVertexNormals();return g;
  }
  if(record.shape==='roof'){
   const sign=record.id.endsWith('/north')?-1:1;
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,h/2,-d/2,sign*w,-h/2,-d/2,sign*w,-h/2,d/2,0,h/2,d/2],3));
   g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;
  }
  throw Error('Unsupported geometry '+record.shape);
 }
 for(const record of inventory){
  const mat=record.shape==='pediment'?palette.pediment:(palette[record.material]||palette.marble),mesh=new THREE.Mesh(geometry(record),mat);
  mesh.position.set(...record.position);
  mesh.userData.instanceId=record.id;mesh.userData.typeId=record.typeId;mesh.userData.label=record.label;
  mesh.castShadow=true;mesh.receiveShadow=true;
  // Static semantic picking; each physical instance retains its own unique ID.
  root.add(mesh);pickables.push(mesh);byId.set(record.id,mesh);
  if(record.shape==='roof'||record.shape==='pediment')roofs.push(mesh);
  if(record.id.includes('/cella/')&&record.shape==='box'){walls.push(mesh);colliders.push(new THREE.Box3().setFromObject(mesh));}
 }
 return {root,pickables,byId,roofs,walls,colliders,materials:palette,texture,modelCount:byId.size,
  dispose(){const seen=new Set();for(const p of pickables){if(!seen.has(p.geometry)){p.geometry.dispose();seen.add(p.geometry);}}ground.geometry.dispose();texture.dispose();for(const m of Object.values(palette))m.dispose();}};
}

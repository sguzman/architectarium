import * as THREE from 'three';
export async function buildParthenon(inventory,onBatch=()=>{}){
 const root=new THREE.Group(),pickables=[],byId=new Map(),roofs=[],walls=[],colliders=[],shaftColliders=[];
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
 // Low-detail landscape only. These rocks are editorial site context, not surveyed Acropolis topography.
 const stoneScatter=new THREE.MeshStandardMaterial({color:0x8d8877,roughness:1});
 let scatterSeed=81021;const rnd=()=>((scatterSeed=(Math.imul(scatterSeed,1664525)+1013904223)>>>0)/4294967296);
 const rockGeo=new THREE.DodecahedronGeometry(1,1);
 const landscape=[];
 for(let i=0;i<92;i++){
  const x=(rnd()-.5)*152,z=(rnd()-.5)*171;if(Math.abs(x)<23&&Math.abs(z)<43)continue;
  const rock=new THREE.Mesh(rockGeo,stoneScatter),size=.4+rnd()*1.3;
  rock.position.set(x,size*.1-.3,z);rock.rotation.set(rnd()*.5,rnd()*Math.PI,rnd()*.5);
  rock.scale.set(size*1.55,size*.44,size*1.4);rock.castShadow=i%5===0;rock.receiveShadow=true;
  landscape.push(rock);root.add(rock);
 }
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
   // Closed gable prism; the historic sculptural field is intentionally blank.
   const triangle=new THREE.Shape();
   triangle.moveTo(-w/2,0);triangle.lineTo(w/2,0);triangle.lineTo(0,h);triangle.closePath();
   const g=new THREE.ExtrudeGeometry(triangle,{depth:d,steps:1,bevelEnabled:false});
   g.translate(0,0,-d/2);
   return g;
  }
  if(record.shape==='roof'){
   // A weathering slab with top, soffit, eave fascia and sealed gable ends.
   // Its 0.42 m illustrative thickness intersects the cornice; the two halves
   // meet exactly at the ridge, while the end gables intersect the roof caps.
   const sign=record.id.endsWith('/north')?-1:1,thickness=.42;
   const verts=[
    [0,h/2,-d/2],[sign*w,-h/2,-d/2],[sign*w,-h/2,d/2],[0,h/2,d/2],
    [0,h/2-thickness,-d/2],[sign*w,-h/2-thickness,-d/2],
    [sign*w,-h/2-thickness,d/2],[0,h/2-thickness,d/2]
   ],faces=[
    [0,1,2,3],[7,6,5,4],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]
   ];
   const positions=[],normals=[],uvs=[];
   const g=new THREE.BufferGeometry();
   for(const [a,b,c,e] of faces){
    for(const idx of [a,b,c,a,c,e]){
     const v=verts[idx];
     positions.push(...v);
     uvs.push(Math.abs(v[0])/Math.max(1,w)*3,(v[2]/Math.max(1,d)+.5)*9);
    }
   }
   g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   g.computeVertexNormals();return g;
  }
  throw Error('Unsupported geometry '+record.shape);
 }
 let appended=0;
 for(const record of inventory){
  const mat=record.shape==='pediment'?palette.pediment:(palette[record.material]||palette.marble),mesh=new THREE.Mesh(geometry(record),mat);
  mesh.position.set(...record.position);
  mesh.userData.instanceId=record.id;mesh.userData.typeId=record.typeId;mesh.userData.label=record.label;
  mesh.castShadow=true;mesh.receiveShadow=true;
  // Static semantic picking; each physical instance retains its own unique ID.
  root.add(mesh);pickables.push(mesh);byId.set(record.id,mesh);
  if(record.shape==='ionic'){
   for(const z of [-record.size[0]*.26,record.size[0]*.26])
    for(const x of [-record.size[0]*.29,record.size[0]*.29]){
     const scroll=new THREE.Mesh(new THREE.TorusGeometry(record.size[0]*.17,record.size[0]*.035,6,24,Math.PI*1.75),palette.light);
     scroll.position.set(x,0,z);scroll.userData.instanceId=record.id;scroll.userData.typeId=record.typeId;
     mesh.add(scroll);
    }
  }
  if(record.shape==='roof'||record.shape==='pediment')roofs.push(mesh);
  if(record.id.includes('/cella/')&&record.shape==='box'){walls.push(mesh);colliders.push(new THREE.Box3().setFromObject(mesh));}
  if(record.shape==='shaft')shaftColliders.push(new THREE.Box3().setFromObject(mesh));
  appended++;
  if(appended%160===0||appended===inventory.length){onBatch(root,appended);await new Promise(resolve=>requestAnimationFrame(resolve));}
 }
 // Static atmospheric points; no continuous rendering or animation is required.
 const particles=new Float32Array(200*3);let state=109;
 const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<200;i++){particles[i*3]=(random()-.5)*36;particles[i*3+1]=2+random()*15;particles[i*3+2]=(random()-.5)*66;}
 const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(particles,3));
 const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xffe7c9,size:.11,transparent:true,opacity:.42,depthWrite:false}));
 dust.visible=false;root.add(dust);
 return {root,pickables,byId,roofs,walls,colliders,shaftColliders,dust,materials:palette,texture,modelCount:byId.size,
  dispose(){const seen=new Set();for(const p of pickables){p.traverse(node=>{if(node.geometry&&!seen.has(node.geometry)){node.geometry.dispose();seen.add(node.geometry);}});}ground.geometry.dispose();rockGeo.dispose();stoneScatter.dispose();dust.geometry.dispose();dust.material.dispose();texture.dispose();for(const m of Object.values(palette))m.dispose();}};
}

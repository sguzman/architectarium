import * as THREE from 'three';

// Original, deterministic interpretive stone surfaces. No historical pigment claim.
function hash(x,y,s){
 let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,2246822519);
 n=Math.imul(n^(n>>>13),1274126177);
 return ((n^(n>>>16))>>>0)/4294967295;
}
function noise(x,y,s){
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const top=hash(ix,iy,s)*(1-u)+hash(ix+1,iy,s)*u;
 const bottom=hash(ix,iy+1,s)*(1-u)+hash(ix+1,iy+1,s)*u;
 return top*(1-v)+bottom*v;
}
function fbm(x,y,s){
 let a=.55,n=0,total=0;
 for(let i=0;i<4;i++){total+=a*noise(x,y,s+i*41);n+=a;x*=2.07;y*=2.07;a*=.52;}
 return total/n;
}
const byte=n=>Math.max(0,Math.min(255,Math.round(n)));
function surfaceImages(){
 const size=512,canvases=Array.from({length:4},()=>{const c=document.createElement('canvas');c.width=c.height=size;return c;});
 const contexts=canvases.map(c=>c.getContext('2d'));
 const images=contexts.map(c=>c.createImageData(size,size));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,k=(y*size+x)*4;
  const cloud=fbm(u*5.1,v*5.1,7),fine=fbm(u*31,v*31,19),swirl=fbm(u*3.4,v*3.4,23);
  const wave=u*6.1+v*1.75+(swirl-.5)*2.9;
  const vein=Math.pow(Math.max(0,Math.sin(wave*Math.PI*2)),16)*(.25+.75*fbm(u*9,v*9,37));
  const weather=Math.pow(1-fbm(u*12,v*12,51),2.7),grain=(fine-.5)*19;
  const stone=224+(cloud-.5)*30+grain-vein*65-weather*16;
  const seam=(Math.min((u*10)%1,1-((u*10)%1))<.012||Math.min((v*10)%1,1-((v*10)%1))<.012)?1:0;
  const samples=[
   [stone+10,stone+4,stone-8],
   [112+cloud*86+grain-vein*59,112+cloud*86+grain-vein*59,112+cloud*86+grain-vein*59],
   [179+cloud*35+fine*26+weather*20,179+cloud*35+fine*26+weather*20,179+cloud*35+fine*26+weather*20],
   [216+(cloud-.5)*32+grain*.56-seam*43-weather*8,211+(cloud-.5)*32+grain*.56-seam*43-weather*8,199+(cloud-.5)*32+grain*.56-seam*43-weather*8]
  ];
  for(let j=0;j<4;j++){const p=images[j].data;p[k]=byte(samples[j][0]);p[k+1]=byte(samples[j][1]);p[k+2]=byte(samples[j][2]);p[k+3]=255;}
 }
 contexts.forEach((ctx,i)=>ctx.putImageData(images[i],0,0));
 return canvases;
}
function map(canvas,color=false,repeat=2){
 const t=new THREE.CanvasTexture(canvas);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);
 t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
 t.anisotropy=8;if(color)t.colorSpace=THREE.SRGBColorSpace;
 return t;
}
export function createRealisticMaterials(){
 const images=surfaceImages(),textures={
  stone:map(images[0],true),height:map(images[1]),roughness:map(images[2]),roof:map(images[3],true,1)
 };
 const stone=(color)=>new THREE.MeshStandardMaterial({
  color,map:textures.stone,bumpMap:textures.height,bumpScale:.085,
  roughness:1,roughnessMap:textures.roughness,metalness:0
 });
 const materials={
  marble:stone(0xfff9ec),light:stone(0xffffff),shadow:stone(0xd5c8af),
  roof:new THREE.MeshStandardMaterial({
   color:0xffffff,map:textures.roof,roughness:.91,roughnessMap:textures.roughness,
   bumpMap:textures.height,bumpScale:.055,metalness:0,side:THREE.DoubleSide
  }),
  pediment:new THREE.MeshStandardMaterial({
   color:0xf5ebd5,map:textures.stone,bumpMap:textures.height,
   bumpScale:.06,roughness:1,roughnessMap:textures.roughness,
   metalness:0,side:THREE.DoubleSide
  })
 };
 return {materials,textureCount:Object.keys(textures).length,dispose(){
  Object.values(materials).forEach(m=>m.dispose());Object.values(textures).forEach(t=>t.dispose());
 }};
}

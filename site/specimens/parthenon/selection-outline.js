import * as THREE from 'three';

/**
 * Crisp, independently rendered outline for one physical architectural mesh.
 * Only creates geometries for the selected part; the 536-part model is unchanged.
 * Edges are always distinguishable even when a selected component is recessed.
 */
export function attachSelectionOutline(mesh){
 const group=new THREE.Group();
 group.name='selected-part-outline';
 const edgeGeometry=new THREE.EdgesGeometry(mesh.geometry,26);
 const edgeMaterial=new THREE.LineBasicMaterial({
  color:0xffd17d,transparent:true,opacity:1,depthTest:false,depthWrite:false,
  toneMapped:false
 });
 const edges=new THREE.LineSegments(edgeGeometry,edgeMaterial);
 edges.name='selection-edges';
 edges.renderOrder=1001;edges.raycast=()=>{};
 const shellMaterial=new THREE.MeshBasicMaterial({
  color:0xffbc58,side:THREE.BackSide,depthTest:false,depthWrite:false,
  transparent:true,opacity:.94,toneMapped:false
 });
 // Inflate the rear faces of the selected object only. This draws a true
 // shape-following silhouette, not a coarse bounding box around the object.
 const thickness=Math.min(.14,Math.max(.055,Math.min(...mesh.userData.extents||[1])*.072));
 shellMaterial.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace(
   '#include <begin_vertex>',
   '#include <begin_vertex>\ntransformed += normalize(normal) * '+thickness.toFixed(4)+';'
  );
 };
 shellMaterial.customProgramCacheKey=()=> 'architectarium-selection-outline-v1-'+thickness.toFixed(4);
 const shell=new THREE.Mesh(mesh.geometry,shellMaterial);
 shell.name='selection-silhouette';
 shell.renderOrder=1000;shell.raycast=()=>{};
 group.add(shell,edges);
 // Selected component retains its own source-linked ID and its original geometry.
 mesh.add(group);
 return {
  group,
  detach(){
   mesh.remove(group);edgeGeometry.dispose();edgeMaterial.dispose();shellMaterial.dispose();
  }
 };
}

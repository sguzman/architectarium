/* Visitor appearance is determined by browser preference or explicit local choice. */
(()=>{
 'use strict';
 const key='architectarium.color-theme';
 const valid=new Set(['system','light','dark']);
 const media=window.matchMedia('(prefers-color-scheme: dark)');
 const root=document.documentElement;
 function read(){try{const value=localStorage.getItem(key);return valid.has(value)?value:'system';}catch{return 'system';}}
 let mode=read();
 function apply(){
  const resolved=mode==='system'?(media.matches?'dark':'light'):mode;
  root.dataset.theme=mode;root.dataset.resolvedTheme=resolved;root.style.colorScheme=resolved;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',resolved==='dark'?'#111a1d':'#f7f8f2');
  for(const select of document.querySelectorAll('[data-theme-selector]'))select.value=mode;
  document.dispatchEvent(new CustomEvent('architectarium:theme-change',{detail:{mode,resolved}}));
 }
 function setMode(value){if(!valid.has(value))return;mode=value;try{localStorage.setItem(key,mode);}catch{}apply();}
 document.addEventListener('DOMContentLoaded',()=>{
  for(const select of document.querySelectorAll('[data-theme-selector]')){
   select.value=mode;select.addEventListener('change',()=>setMode(select.value));
  }
 });
 media.addEventListener('change',()=>{if(mode==='system')apply()});
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null){mode=read();apply()}});
 window.ArchitectariumTheme={getMode:()=>mode,getResolved:()=>root.dataset.resolvedTheme,setMode};
 apply();
})();

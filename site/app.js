const $=id=>document.getElementById(id);
const read=async path=>{const response=await fetch(path);if(!response.ok)throw Error(path+' returned HTTP '+response.status);return response.json();};
const txt=(value)=>document.createTextNode(String(value??''));
function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.append(txt(text));return element;}
function setContent(root,...children){root.replaceChildren(...children);}
function link(url,label){const a=node('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function makeTermButton(term,active,onSelect){const b=node('button','term'+(active?' selected':''));b.type='button';b.dataset.concept=term.id;b.append(node('span','',term.name),node('span','term-arrow','→'));b.addEventListener('click',()=>onSelect(term.id));return b;}
try {
  const [ontology,book,publicGallery]=await Promise.all([read('./data/components.json'),read('./data/sources.json'),read('./data/gallery.json')]);
  const concepts=new Map(ontology.components.map(c=>[c.id,c])),sources=new Map(book.sources.map(s=>[s.id,s]));
  const familyNames=[...new Set(ontology.components.map(c=>c.category))].sort();
  const published=publicGallery.entries;
  $('conceptCount').textContent=String(ontology.components.length);
  $('familyCount').textContent=String(familyNames.length);
  $('publishedCount').textContent=String(published.length);
  let category='all',query='',selectedId=null;
  function renderCategories(){
    const root=$('categories');root.replaceChildren();
    for(const name of ['all',...familyNames]){
      const b=node('button','category'+(category===name?' selected':''),name==='all'?'All components':name);
      b.type='button';b.setAttribute('aria-pressed',String(category===name));
      b.addEventListener('click',()=>{category=name;renderCategories();renderTerms();});
      root.append(b);
    }
  }
  function selectTerm(id){
    const term=concepts.get(id);if(!term)return;
    selectedId=id;
    const inspector=$('inspector');const title=node('h3','term-name',term.name);
    const label=node('div','term-cat',term.category+' / architectural element');
    const definition=node('p','term-definition',term.definition);
    const meta=node('p','term-meta',(term.synonyms?.length?'Also called: '+term.synonyms.join(', '):'Canonical identifier: '+term.id));
    const data=node('div','term-data');
    for(const [heading,value] of [
      ['Typical position',term.typicalLocation],['Purpose',term.function],
      ['Recognizing this element',term.visualRecognition],['Common materials',term.typicalMaterialFamilies.join(' · ')]
    ]){const cell=node('div','data-field');cell.append(node('h4','',heading),node('p','',value));data.append(cell);}
    const relationships=node('section','detail-section');
    relationships.append(node('h4','','Connections & relationships'));
    const buttons=node('div','related');
    const relations=(term.relations?.length?term.relations.map(r=>({id:r.target,label:r.predicate.replaceAll('-',' ')+' → '+(concepts.get(r.target)?.name??r.target)})):
      term.connectedTo.map(id=>({id,label:concepts.get(id)?.name??id})));
    for(const r of relations){const b=node('button','',r.label);b.type='button';b.addEventListener('click',()=>{category='all';query='';$('search').value='';renderCategories();selectTerm(r.id);});buttons.append(b);}
    if(!relations.length)buttons.append(node('p','','No typed relationships recorded.'));
    relationships.append(buttons);
    const examples=node('section','detail-section');examples.append(node('h4','','Real-world architectural references'));
    const refs=node('div','references');
    for(const ex of term.examples??[]){const item=node('div','reference');item.append(node('span','',ex.building));
      const source=sources.get(ex.sourceId);if(source)item.append(link(source.url,source.publisher+' ↗'));refs.append(item);}
    examples.append(refs);
    inspector.replaceChildren(label,title,definition,meta,data,relationships,examples,node('p','research-note','This is a type-level reference. Examples are source pointers, not published or verified 3D specimens.'));
    renderTerms();
  }
  function renderTerms(){
    const matches=ontology.components.filter(term=>{
      if(category!=='all'&&term.category!==category)return false;
      const haystack=[term.name,term.category,term.definition,term.typicalLocation,term.function,
        term.visualRecognition,...(term.synonyms??[])].join(' ').toLowerCase();
      return !query||haystack.includes(query);
    }).sort((a,b)=>a.name.localeCompare(b.name));
    $('termCount').textContent=String(matches.length)+' OF '+ontology.components.length;
    const root=$('terms');setContent(root,...(matches.length?matches.map(c=>makeTermButton(c,c.id===selectedId,selectTerm)):[node('p','no-results','No matching terms.')]));
  }
  $('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderTerms();});
  renderCategories();renderTerms();
  const gallery=$('galleryContent');
  if(published.length){
    const grid=node('div','gallery-grid');for(const entry of published){
      const card=node('a','gallery-item');card.href=entry.path;
      card.append(node('span','eyebrow','PUBLISHED SPECIMEN'),node('h3','',entry.title),node('p','',entry.summary));
      grid.append(card);}
    gallery.replaceChildren(grid);
  } else {
    gallery.replaceChildren();
    const empty=node('div','gallery-empty');
    const emblem=node('div','gallery-icon','∅');emblem.setAttribute('aria-hidden','true');
    empty.append(emblem,node('h3','','No specimens published'),
      node('p','','The collection is empty until a building has completed architectural research, modeling, and visitor review.'));
    gallery.append(empty);
  }
  const direct=new URLSearchParams(location.search).get('term');
  if(direct&&concepts.has(direct))selectTerm(direct);
}catch(error){
  console.error('Unable to load the public architectural index:',error);
  $('conceptCount').textContent='—';$('familyCount').textContent='—';$('publishedCount').textContent='—';
  $('terms').replaceChildren(node('p','no-results','Unable to load architectural terms. Reload the page or view the source repository.'));
  $('inspector').replaceChildren(node('p','no-results','The public reference data could not be loaded.'));
}

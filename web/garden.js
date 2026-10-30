/* Browser adaptation of Florilegium's free-space growth idea. MIT; see ../LICENSE. */
'use strict';
import { encodeGarden, decodeGarden } from './state.js';
const $ = s => document.querySelector(s);
const svg = $('#garden'), page = $('#page'), poem = $('#poem');
const NS = 'http://www.w3.org/2000/svg';
let data = {title:'Hymn to Intellectual Beauty',author:'Percy Bysshe Shelley (1817)',text:'I vowed that I would dedicate my powers\nTo thee and thine—have I not kept the vow?'};
try { const saved=JSON.parse(localStorage.getItem('flowers-poem')); if(saved && ['title','author','text'].every(k=>typeof saved[k]==='string')) data=saved; } catch {}
const defaults={density:100,size:43,reach:155,speed:1,thorns:0,thornSize:1,flowers:'classic',tips:50,palette:'blue',theme:'paper'};
const themeInks={paper:'blue',moon:'white',forest:'white',dusk:'lavender'};
const palettes={white:['#aabfca','#ffffff','#e6edff','#f5f3df','#a9c4d5','#e1c98d'],lavender:['#aab4d6','#eee4ff','#c7b7ed','#e6d7ff','#aaa6cb','#f1d7a3'],blue:['#426e95','#729ac0','#356497','#426d9b','#3e6389','#203e65'],green:['#64856b','#93b59a','#507b61','#4c755b','#52765b','#304c3b'],plum:['#886288','#bb94b8','#895e89','#805780','#765276','#4a334d'],sepia:['#98734f','#c4a77b','#966e47','#8d6540','#826244','#503c2a']};
let settings={...defaults};
try{const saved=JSON.parse(localStorage.getItem('flowers-settings'));if(saved){for(const [key,min,max] of [['density',40,160],['size',22,64],['reach',90,240],['speed',.5,3],['thorns',0,100],['thornSize',.5,4],['tips',0,100]]){if(Number.isFinite(saved[key]))settings[key]=Math.max(min,Math.min(max,saved[key]));}if(['classic','mixed','daisy','lily','rosette'].includes(saved.flowers))settings.flowers=saved.flowers;if(Object.hasOwn(palettes,saved.palette))settings.palette=saved.palette;if(Object.hasOwn(themeInks,saved.theme))settings.theme=saved.theme;}}catch{}
function syncSettings(){for(const key of Object.keys(defaults))$('#'+key).value=settings[key];updateLabels();}
function updateLabels(){for(const key of ['density','size','reach','speed','thorns','thornSize','tips'])$('#'+key+'-value').textContent=key==='thorns'&&Number($('#'+key).value)===0?'None':$('#'+key).value+({density:'%',size:' px',reach:' px',speed:'×',thorns:'%',thornSize:'×',tips:'%'}[key]);}
$('#tune').onclick=()=>{const open=$('#settings').hidden;$('#settings').hidden=!open;$('#tune').setAttribute('aria-expanded',String(open));};
$('#settings-form').oninput=updateLabels;
$('#theme').onchange=()=>{$('#palette').value=themeInks[$('#theme').value];};
function saveSettings(){try{localStorage.setItem('flowers-settings',JSON.stringify(settings));}catch{}grow();}
$('#settings-form').onsubmit=e=>{e.preventDefault();for(const key of ['density','size','reach','speed','thorns','thornSize','tips'])settings[key]=Number($('#'+key).value);settings.flowers=$('#flowers').value;settings.palette=$('#palette').value;settings.theme=$('#theme').value;saveSettings();};
$('#reset-settings').onclick=()=>{settings={...defaults};syncSettings();saveSettings();};
syncSettings();
let seed=17, animations=[], paused=false, timer;
function loadSharedGarden(){
 try {const shared=decodeGarden(location.hash,defaults,palettes,themeInks);if(!shared)return false;
  data=shared.poem;settings=shared.settings;seed=shared.seed;syncSettings();$('#link-status').hidden=true;return true;
 }catch{ $('#link-status').hidden=false;$('#link-status').textContent='This garden link could not be read. Showing your saved garden instead.';return false; }
}
loadSharedGarden();
window.addEventListener('hashchange',()=>{if(loadSharedGarden())render();});
$('#share').onclick=()=>{
 const url=new URL(location.href);url.hash=encodeGarden({poem:data,settings,seed});
 $('#share-url').value=url.href;$('#share-status').textContent='';
 $('#share-note').textContent=['localhost','127.0.0.1','[::1]'].includes(location.hostname)||location.protocol==='file:'
  ?'This address is local to your computer. To share with others, host dist/index.html, then copy the link from that public page.'
  :'Anyone with this link can read the poem. No account is needed.';
 $('#share-dialog').showModal();
};
$('#close-share').onclick=()=>$('#share-dialog').close();
$('#copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('#share-url').value);$('#share-status').textContent='Link copied.';}catch{$('#share-url').focus();$('#share-url').select();$('#share-status').textContent='Select and copy the link above.';}};
function el(name, attrs={}, parent=svg){const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;}
function render(){poem.replaceChildren();const title=document.createElement('h1');title.textContent=data.title;poem.append(title);for(const line of data.text.split('\n')){const p=document.createElement('p');p.className='line';for(const [i,word] of line.split(/\s+/).entries()){if(i)p.append(' ');const s=document.createElement('span');s.className='word';s.textContent=word;p.append(s);}poem.append(p);}const a=document.createElement('p');a.className='byline';a.textContent=data.author;poem.append(a);requestAnimationFrame(grow);}
function grow(){
 animations.forEach(a=>a.cancel());animations=[];paused=false;$('#pause').textContent='Pause';svg.replaceChildren();
 document.documentElement.dataset.theme=settings.theme;
 const colors=palettes[settings.palette];
 const w=page.clientWidth,h=page.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
 let state=seed;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const bounds=page.getBoundingClientRect();
 const obstacles=[...poem.querySelectorAll('.word,h1,.byline')].filter(n=>n.textContent).flatMap(n=>[...n.getClientRects()].map(r=>({x:r.left-bounds.left-12,y:r.top-bounds.top-9,w:r.width+24,h:r.height+18})));
 const clearance=(x,y)=>Math.min(x-12,w-x-12,y-14,h-y-14,...obstacles.map(r=>Math.hypot(Math.max(r.x-x,0,x-r.x-r.w),Math.max(r.y-y,0,y-r.y-r.h))));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animate(node,frames,delay,duration){if(reduced)return;animations.push(node.animate(frames,{duration:duration/settings.speed,delay:delay/settings.speed,fill:'both',easing:'ease-in-out'}));}
 const nodes=[{x:24,y:h-24,t:0},{x:w-24,y:h-24,t:150}],occupied=[];
 function motif(x,y,r,t,angle,leaf=false){const g=el('g',{transform:`translate(${x} ${y}) rotate(${angle})`});const inner=el('g',{},g);animate(inner,[{transform:'scale(0)',opacity:0},{transform:'scale(1)',opacity:1}],t,1000);
 if(leaf){el('path',{d:`M 0 0 Q ${-r} ${-r*.6} 0 ${-r} Q ${r*.8} ${-r*.7} 0 0`,fill:colors[0],'fill-opacity':.5},inner);el('path',{d:`M 0 0 Q ${r*.12} ${-r*.7} 0 ${-r*.9}`,stroke:'#f8f5ec','stroke-width':.7,fill:'none'},inner);return;}
 const petals=random()>.5?5:7;
 for(let i=0;i<petals;i++){const a=i*360/petals;const rr=r*(.8+random()*.2);el('path',{d:`M 0 0 C ${-rr*.8} ${-rr*.45} ${-rr*.6} ${-rr*1.1} 0 ${-rr} C ${rr*.65} ${-rr*1.1} ${rr*.75} ${-rr*.35} 0 0`,transform:`rotate(${a})`,fill:i%2?colors[1]:colors[2],'fill-opacity':.42+random()*.2,stroke:colors[3],'stroke-opacity':.2,'stroke-width':.65},inner);el('path',{d:`M 0 -2 Q 3 ${-rr*.4} 0 ${-rr*.82}`,transform:`rotate(${a})`,stroke:'#f8f5ec','stroke-opacity':.65,fill:'none','stroke-width':.8},inner);}
 const choice=Math.abs(Math.round(x*13+y*37))%4;
 const kind=settings.flowers==='mixed'?['classic','daisy','lily','rosette'][choice]:settings.flowers;
 g.setAttribute('data-flower',kind);
 if(kind!=='classic'){
  inner.replaceChildren();
  const layers=kind==='rosette'?3:1;
  for(let layer=0;layer<layers;layer++){
   const count=kind==='daisy'?13:kind==='lily'?6:9;
   const R=r*(1-layer*.25);
   for(let j=0;j<count;j++){
    const rotation=j*360/count+layer*21;
    const shape=kind==='lily'
     ?`M 0 0 C ${-R*.2} ${-R*.45} ${-R*.16} ${-R*.8} 0 ${-R} C ${R*.18} ${-R*.65} ${R*.35} ${-R*.3} 0 0`
     :kind==='daisy'
     ?`M -1 0 C ${-R*.2} ${-R*.45} ${-R*.17} ${-R} 0 ${-R} C ${R*.17} ${-R} ${R*.2} ${-R*.45} 1 0`
     :`M 0 0 C ${-R*.75} ${-R*.25} ${-R*.55} ${-R*.94} 0 ${-R} C ${R*.6} ${-R*.9} ${R*.65} ${-R*.2} 0 0`;
    el('path',{d:shape,transform:`rotate(${rotation})`,fill:colors[1+(j+layer)%2],'fill-opacity':.5+layer*.12,stroke:colors[3],'stroke-opacity':.35,'stroke-width':.6},inner);
    el('path',{d:`M 0 ${-R*.2} Q ${R*.08} ${-R*.55} 0 ${-R*.85}`,transform:`rotate(${rotation})`,fill:'none',stroke:'#f8f5ec','stroke-opacity':.5,'stroke-width':.6},inner);
    if(kind==='lily'){
     el('path',{d:`M 0 0 Q 3 ${-R*.2} 1 ${-R*.4}`,transform:`rotate(${rotation+25})`,fill:'none',stroke:colors[5],'stroke-width':.8},inner);
     el('circle',{cx:1,cy:-R*.4,r:1.3,transform:`rotate(${rotation+25})`,fill:'#c7a567'},inner);
    }
   }
  }
 }
 el('circle',{r:r*.12,fill:'#b89658'},inner);for(let i=0;i<8;i++){const a=i*Math.PI/4;el('circle',{cx:Math.cos(a)*r*.2,cy:Math.sin(a)*r*.2,r:1,fill:colors[5]},inner);}}
 function tipDetail(x,y,r,t,angle,variant){
  const root=el('g',{'class':'tip-detail','data-tip':variant,transform:`translate(${x} ${y}) rotate(${angle})`});
  const group=el('g',{},root);
  const line=d=>{const path=el('path',{d,fill:'none',stroke:colors[4],'stroke-width':.85,'stroke-linecap':'round'},group);const L=path.getTotalLength();animate(path,[{strokeDasharray:`${L}`,strokeDashoffset:L},{strokeDasharray:`${L}`,strokeDashoffset:0}],t,1100);};
  function bud(x,y,size,delay,open=false){const holder=el('g',{transform:`translate(${x} ${y})`},group),g=el('g',{},holder);animate(g,[{transform:'scale(0)'},{transform:'scale(1)'}],t+delay,650);
   if(open){for(let k=0;k<5;k++)el('ellipse',{cx:0,cy:-size*.45,rx:size*.33,ry:size*.55,transform:`rotate(${k*72})`,fill:colors[k%2+1],'fill-opacity':.8},g);el('circle',{r:size*.18,fill:'#c7a567'},g);}
   else{el('path',{d:`M 0 2 C ${-size} 0 ${-size} ${-size*1.4} 0 ${-size*1.7} C ${size} ${-size*1.4} ${size} 0 0 2`,fill:colors[2],'fill-opacity':.8,stroke:colors[3],'stroke-width':.5},g);el('path',{d:`M 0 2 Q 2 ${-size*.6} 0 ${-size*1.4}`,fill:'none',stroke:colors[4],'stroke-width':.6},g);}
  }
  if(variant==='curl'){
   const points=[];for(let j=0;j<=65;j++){const u=j/65,a=u*Math.PI*3.8,R=r*.42*(1-u*.92)**1.3;points.push([R*Math.cos(a)-r*.42,R*Math.sin(a)]);}
   line(points.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' '));
   for(const i of [12,22,33,44]){const p=points[i];bud(p[0],p[1],r*.055,1100*i/65,i<33);}
  }else{
   line(`M 0 0 Q ${r*.12} ${-r*.25} 0 ${-r*.65}`);
   for(let k=0;k<5;k++){const a=(-150+k*30)*Math.PI/180,X=Math.cos(a)*r*.6,Y=-r*.25+Math.sin(a)*r*.38;line(`M 0 0 Q ${X*.2} ${Y*.65} ${X} ${Y}`);bud(X,Y,r*(variant==='buds'?.09:.065),650+k*110,variant==='spray');}
  }
 }
 // Greedy reachable free discs. Every new branch is attached to an existing stem.
 for(let step=0;step<Math.min(420,Math.round(w*h/3400*settings.density/100));step++){
 let best=null;
 for(let k=0;k<100;k++){const x=18+random()*(w-36),y=20+random()*(h-40);let radius=Math.min(settings.size,clearance(x,y));if(radius<8)continue;
 for(const o of occupied)radius=Math.min(radius,Math.hypot(x-o.x,y-o.y)-o.r);
 if(radius<8)continue;let parent=null,distance=Infinity;
 for(const n of nodes){const d=Math.hypot(x-n.x,y-n.y);if(d<distance){distance=d;parent=n;}}
 if(distance>settings.reach||distance<12)continue;
 const dx=x-parent.x,dy=y-parent.y,bend=(random()-.5)*distance*.5;
 const cx=(parent.x+x)/2-dy/distance*bend,cy=(parent.y+y)/2+dx/distance*bend;
 const points=Array.from({length:21},(_,i)=>{const u=i/20;return {x:(1-u)**2*parent.x+2*(1-u)*u*cx+u*u*x,y:(1-u)**2*parent.y+2*(1-u)*u*cy+u*u*y};});
 if(points.some(p=>clearance(p.x,p.y)<3))continue;
 const score=radius+distance*.12+random()*8;if(!best||score>best.score)best={x,y,radius,parent,cx,cy,points,score,distance};}
 if(!best)continue;
 const b=best,t=b.parent.t+250,duration=b.distance*7+350;
 const path=el('path',{d:`M ${b.parent.x} ${b.parent.y} Q ${b.cx} ${b.cy} ${b.x} ${b.y}`,fill:'none',stroke:colors[4],'stroke-opacity':.67,'stroke-width':step<15?1.6:1,'stroke-linecap':'round'});
 const length=path.getTotalLength();animate(path,[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],t,duration);
 b.points.forEach((p,i)=>{if(i%5===0)nodes.push({...p,t:t+duration*i/20});});
 const radius=b.radius*.85;occupied.push({x:b.x,y:b.y,r:radius+4});const angle=random()*360,leaf=step>10&&random()<.45;
 const tipHash=(Math.imul(step+7,2654435761)^seed)>>>0;
 if(leaf&&tipHash%100<settings.tips){tipDetail(b.x,b.y,radius,t+duration,Math.atan2(b.y-b.cy,b.x-b.cx)*180/Math.PI+90,['curl','buds','spray'][(tipHash>>>8)%3]);}
 else motif(b.x,b.y,radius,t+duration,angle,leaf);
 // Thorns use their own deterministic hash, so changing them never moves the flowers.
 for(const i of [4,8,12,16]){
  const hash=(Math.imul(seed^Math.imul(step+1,374761393)^Math.imul(i,668265263),1274126177)>>>0);
  if((hash%100)>=settings.thorns)continue;
  const u=i/20,p=b.points[i],side=i%8===0?1:-1;
  const dx=2*((1-u)*(b.cx-b.parent.x)+u*(b.x-b.cx));
  const dy=2*((1-u)*(b.cy-b.parent.y)+u*(b.y-b.cy));
  const length=(5+(hash>>>8)%6)*settings.thornSize;
  // The entire thorn fits within this disc, including its curved tip.
  if(clearance(p.x,p.y)<length+4)continue;
  const g=el('g',{'class':'thorn',transform:`translate(${p.x} ${p.y}) rotate(${Math.atan2(dy,dx)*180/Math.PI})`});
  const tip=el('path',{d:`M ${-length*.3} 0 Q 0 ${side*length*.3} ${-length*.2} ${side*length} Q ${length*.4} ${side*length*.65} ${length*.4} 0 Z`,fill:colors[4],'fill-opacity':.85},g);
  animate(tip,[{transform:'scale(0)',opacity:0},{transform:'scale(1)',opacity:1}],t+duration*u,550);
 }
 // Smaller leaves unfurl along the branch, only where their entire bounds fit.
 for(const i of [7,13]){const p=b.points[i],r=7+random()*5;if(clearance(p.x,p.y)>r*1.8){motif(p.x,p.y,r,t+duration*i/20,Math.atan2(b.y-b.parent.y,b.x-b.parent.x)*180/Math.PI+(i===7?35:145),true);}}
 }
 $('#pause').disabled=reduced;
}
$('#grow').onclick=()=>{seed=(seed+1)>>>0;grow();};
$('#pause').onclick=()=>{paused=!paused;animations.forEach(a=>paused?a.pause():a.play());$('#pause').textContent=paused?'Resume':'Pause';};
$('#edit').onclick=()=>{for(const key of ['title','author'])$('#'+key).value=data[key];$('#verses').value=data.text;$('#editor').showModal();};
$('#cancel').onclick=()=>$('#editor').close();
$('#form').onsubmit=e=>{e.preventDefault();data={title:$('#title').value.trim(),author:$('#author').value.trim(),text:$('#verses').value.trim()};try{localStorage.setItem('flowers-poem',JSON.stringify(data));}catch{}$('#editor').close();seed=(seed+1)>>>0;render();};
let lastWidth=page.clientWidth;new ResizeObserver(()=>{if(lastWidth===page.clientWidth)return;lastWidth=page.clientWidth;clearTimeout(timer);timer=setTimeout(grow,180);}).observe(page);
render();

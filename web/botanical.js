// All artwork is computed SVG. Local randomness keeps pigment independent of growth.
const NS='http://www.w3.org/2000/svg';
export function botanicalPaint(svg, colors, palette, seed){
 const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
 const defs=node('defs',{},svg);
 const schemes={
  blue:[['#ecf4fb','#398bd0','#183b9b'],['#c8f2ef','#198d9f','#203d83'],['#e9dfff','#6f67cc','#24377a']],
  white:[['#ffffff','#c9deed','#587aab'],['#fff9df','#d9e5df','#6e9c9b'],['#f8efff','#ccbee5','#787aaf']],
  lavender:[['#fff1ff','#be8fda','#65529d'],['#edf0ff','#8e9ad5','#455b8a'],['#fde5ef','#bd83a8','#785476']],
  green:[['#f4efcc','#81a784','#245c58'],['#d8eddf','#61a49f','#245265'],['#e6e4b7','#a2ab65','#4a6951']],
  plum:[['#fce6e9','#bd6592','#653f7a'],['#ecddff','#9673bc','#57487e'],['#ffecdf','#c79190','#80516e']],
  sepia:[['#fff1cf','#c9995f','#79503b'],['#f7d9bf','#bd7e66','#74474a'],['#e4e6c0','#9d9e6a','#5d694d']],
  jewel:[['#e5f5ff','#268ad6','#252b91'],['#d5fff1','#1bafa7','#155177'],['#ffe9f6','#b261b8','#543689']]
 };
 const ramps=schemes[palette]||schemes.blue;
 for(let i=0;i<3;i++){
  const g=node('radialGradient',{id:`petal-${i}`,cx:'.47',cy:'.92',r:'.94'},defs);
  for(const [offset,color] of [['0%',ramps[i][0]],['32%',ramps[i][0]],['69%',ramps[i][1]],['100%',ramps[i][2]]])node('stop',{offset,'stop-color':color},g);
  const leaf=node('linearGradient',{id:`leaf-${i}`,x1:'0',y1:'1',x2:'1',y2:'0'},defs);
  for(const [offset,color] of [['0%',ramps[i][2]],['48%',ramps[i][1]],['65%',ramps[i][0]],['100%',ramps[i][2]]])node('stop',{offset,'stop-color':color},leaf);
 }
 const gold=node('linearGradient',{id:'gold-ink',x1:'0',y1:'0',x2:'1',y2:'1'},defs);
 for(const [offset,color] of [['0%','#8c693c'],['40%','#e6c986'],['70%','#ae854c'],['100%','#f5dfab']])node('stop',{offset,'stop-color':color},gold);
 let serial=0;
 function paint(parent,r,kind,key){
  let state=(Math.imul(Math.round(key),2654435761)^seed)>>>0;
  const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const family=Math.floor(rand()*3), wash=`url(#petal-${family})`;
  if(kind==='leaf'){
   const width=r*.38;
   const shape=`M 0 0 C ${-width} ${-r*.2} ${-width} ${-r*.65} ${r*.12} ${-r} C ${width*.7} ${-r*.7} ${width*1.3} ${-r*.35} 0 0 Z`;
   node('path',{d:shape,fill:`url(#leaf-${family})`,'fill-opacity':.82,stroke:ramps[family][2],'stroke-width':.45},parent);
   node('path',{d:`M 0 0 Q ${r*.1} ${-r*.5} ${r*.12} ${-r*.94}`,stroke:ramps[family][0],'stroke-width':.65,fill:'none'},parent);
   for(let i=1;i<6;i++){const u=i/7,y=-r*u,ww=Math.sin(u*Math.PI)*width*.85;for(const side of [-1,1])node('path',{d:`M ${r*.08*u} ${y} Q ${side*ww*.5} ${y-r*.08} ${side*ww} ${y-r*.16}`,fill:'none',stroke:ramps[family][0],'stroke-opacity':.55,'stroke-width':.45},parent);}
   return;
  }
  const layers=kind==='rosette'?3:1,count=kind==='lily'?6:kind==='daisy'?13:5+(key%2?2:0);
  for(let layer=0;layer<layers;layer++)for(let j=0;j<count;j++){
   const R=r*(1-layer*.25)*(.88+rand()*.12),W=R*(kind==='lily'?.24:kind==='daisy'?.17:.6),rotation=j*360/count+layer*23+(rand()-.5)*9;
   const g=node('g',{transform:`rotate(${rotation})`},parent);
   const d=`M 0 0 C ${-W} ${-R*.25} ${-W} ${-R*.82} ${R*.035} ${-R} C ${W} ${-R*.85} ${W*.9} ${-R*.23} 0 0 Z`;
   const id=`petal-clip-${serial++}`,clip=node('clipPath',{id},defs);node('path',{d},clip);
   node('path',{d,fill:wash,'fill-opacity':.9,stroke:ramps[family][2],'stroke-opacity':.5,'stroke-width':.55},g);
   const detail=node('g',{'clip-path':`url(#${id})`},g);
   // Fine translucent washes and sparse pigment flecks, clipped to each petal.
   for(let n=0;n<9;n++)node('ellipse',{cx:(rand()-.5)*W*1.8,cy:-R*(.25+rand()*.75),rx:R*(.025+rand()*.1),ry:R*(.02+rand()*.12),fill:ramps[family][n%3],'fill-opacity':.12},detail);
   for(let v=-2;v<=2;v++)node('path',{d:`M 0 -1 Q ${v*W*.32} ${-R*.43} ${v*W*.3} ${-R*.96}`,fill:'none',stroke:ramps[family][0],'stroke-opacity':v===0?.65:.22,'stroke-width':v===0?.65:.4},detail);
   for(let n=0;n<6;n++)node('circle',{cx:(rand()-.5)*W,cy:-R*(.28+rand()*.65),r:.3+rand()*.5,fill:ramps[family][2],'fill-opacity':.25},detail);
  }
  node('circle',{r:r*.15,fill:ramps[family][0]},parent);
  for(let j=0;j<12;j++){const a=j*Math.PI/6,R=r*(.13+rand()*.13),x=Math.cos(a)*R,y=Math.sin(a)*R;node('path',{d:`M 0 0 Q ${x*.7+1} ${y*.5} ${x} ${y}`,fill:'none',stroke:colors[5],'stroke-width':.5},parent);node('circle',{cx:x,cy:y,r:.7+rand()*.6,fill:'url(#gold-ink)'},parent);}
  node('circle',{r:r*.045+1,fill:ramps[family][2]},parent);
 }
 function jewel(parent,r,kind){
  const stroke='url(#gold-ink)';
  if(kind==='star'){
   node('path',{d:`M 0 ${-r} Q 1 -1 ${r*.55} 0 Q 1 1 0 ${r} Q -1 1 ${-r*.55} 0 Q -1 -1 0 ${-r} Z`,fill:stroke},parent);
   node('circle',{r:r*.67,fill:'none',stroke,'stroke-width':.5,'stroke-dasharray':'1 5'},parent);
  }else{
   node('path',{d:`M 0 ${-r} L ${r*.6} 0 L 0 ${r} L ${-r*.6} 0 Z`,fill:'none',stroke,'stroke-width':.8},parent);
   node('path',{d:`M 0 ${-r*.65} L ${r*.35} 0 L 0 ${r*.65} L ${-r*.35} 0 Z`,fill:'url(#petal-0)',stroke,'stroke-width':.5},parent);
   node('circle',{r:1.4,fill:stroke},parent);
  }
 }
 return {paint,jewel};
}

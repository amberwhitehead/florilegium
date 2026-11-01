// Small SVG animals, drawn inside a unit disc and scaled by the caller.
export function drawVisitor(parent,kind,el){
 const n=(tag,a)=>el(tag,a,parent),path=(d,fill,stroke='none',width=.025)=>n('path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round'});
 const eye=(x,y)=>{n('circle',{cx:x,cy:y,r:.035,fill:'#172a35'});n('circle',{cx:x-.009,cy:y-.009,r:.009,fill:'#fff'});};
 if(kind==='bird'){
  path('M -.2 .2 L -.88 .28 L -.55 -.05 Z','url(#leaf-1)');
  n('ellipse',{cx:0,cy:0,rx:.47,ry:.3,fill:'url(#petal-2)',transform:'rotate(-12)'});
  n('circle',{cx:.4,cy:-.23,r:.23,fill:'url(#petal-2)'});
  path('M .59 -.28 L .83 -.18 L .6 -.12 Z','#b69355');
  path('M .22 -.05 Q -.2 -.35 -.43 .12 Q -.12 .32 .22 -.05','url(#leaf-1)','#547789');
  for(let i=0;i<4;i++)path(`M .1 -.03 Q -.1 ${.02+i*.04} ${-.25-i*.04} .12`,'none','#cce3df',.012);
  path('M -.08 .25 L -.1 .43 L -.23 .45 M .13 .25 L .15 .43 L .29 .44','none','#a88a58',.035);eye(.46,-.27);
 }else if(kind==='snail'){
  path('M -.7 .44 Q -.18 .18 .49 .28 Q .53 -.12 .68 -.16 Q .89 -.05 .74 .31 L .9 .44 Q .2 .59 -.7 .44','#97b9a1','#466d6c');
  n('circle',{cx:-.15,cy:.04,r:.4,fill:'url(#gold-ink)',stroke:'#6e654e','stroke-width':.025});
  path('M -.18 .37 C -.7 -.05 -.1 -.58 .17 -.07 C .39 .25 -.16 .42 -.29 .12 C -.4 -.13 -.02 -.21 .02 .02 C .06 .17 -.16 .18 -.14 .06','none','#73583e',.035);
  path('M .64 -.08 L .53 -.35 M .73 -.08 L .84 -.33','none','#97b9a1',.04);eye(.53,-.35);eye(.84,-.33);
 }else if(kind==='bee'){
  for(const side of [-1,1])n('ellipse',{cx:side*.23,cy:-.22,rx:.23,ry:.38,fill:'#e4eff4','fill-opacity':.68,stroke:'#98b8c5','stroke-width':.02,transform:`rotate(${side*25})`});
  n('ellipse',{cx:0,cy:.1,rx:.25,ry:.43,fill:'url(#gold-ink)'});
  for(const y of [-.05,.12,.29])path(`M -.2 ${y} Q 0 ${y+.08} .2 ${y}`,'none','#35494d',.085);
  n('circle',{cx:0,cy:-.32,r:.16,fill:'#35494d'});
  path('M -.07 -.41 L -.18 -.62 M .07 -.41 L .18 -.62','none','#839f9f',.03);
 }else{
  for(const side of [-1,1]){
   const g=el('g',{transform:`scale(${side} 1)`},parent);
   el('path',{d:'M .04 0 C .95 -1.1 1.05 -.15 .25 .15 C .95 .3 .48 .93 .05 .28 Z',fill:'url(#petal-2)',stroke:'#7896a7','stroke-width':.025},g);
   el('path',{d:'M .06 .1 Q .28 -.28 .6 -.45 M .06 .1 Q .42 .24 .4 .5',fill:'none',stroke:'#f1e6d0','stroke-opacity':.7,'stroke-width':.02},g);
   for(const [x,y] of [[.59,-.34],[.39,.42]])el('circle',{cx:x,cy:y,r:.075,fill:'url(#gold-ink)'},g);
  }
  path('M 0 -.37 Q -.08 0 0 .45 Q .08 0 0 -.37','#3b5662');
  path('M 0 -.3 Q -.08 -.6 -.2 -.55 M 0 -.3 Q .08 -.6 .2 -.55','none','#a5b8c6',.025);
 }
}

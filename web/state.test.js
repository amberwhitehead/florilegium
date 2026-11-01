import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeGarden, decodeGarden } from './state.js';
const settings={butterflies:2,birds:2,bees:2,snails:2,density:100,size:43,reach:155,speed:1,thorns:60,thornSize:3,tips:80,flowers:'mixed',palette:'white',theme:'moon'};
const state={poem:{title:'夜 🌙',author:'A & B',text:'Roses # & ?\n\n花 <script>alert(1)</script>'},settings,seed:4294967295};
const decode=hash=>decodeGarden(hash,settings,{white:[]},{moon:'white'});
test('Unicode, line breaks, punctuation, settings and full seed round trip',()=>assert.deepEqual(decode(encodeGarden(state)),state));
test('unrelated fragments do not replace a garden',()=>assert.equal(decode('#about'),null));
test('reject malformed, unsupported, excessive or out-of-range state',()=>{
 for(const hash of ['#garden=%ZZ','#garden='+ 'a'.repeat(150001),encodeGarden({...state,seed:-1}),encodeGarden({...state,settings:{...settings,thornSize:99}}),encodeGarden({...state,poem:{...state.poem,text:'a'.repeat(6001)}}),'#garden='+encodeURIComponent(JSON.stringify({...state,v:9}))]) assert.throws(()=>decode(hash));
});
test('illuminated palette is preserved in share links',()=>{
 const illuminated={...state,settings:{...settings,palette:'jewel'}};
 assert.deepEqual(decodeGarden(encodeGarden(illuminated),settings,{white:[],jewel:[]},{moon:'white'}),illuminated);
});
test('vine weight and visitors round-trip; older links retain new defaults',()=>{
 const extra={...settings,vine:2.5,visitors:12};
 assert.equal(decodeGarden(encodeGarden({...state,settings:extra}),extra,{white:[]},{moon:'white'}).settings.birds,2);
 const old=decodeGarden(encodeGarden(state),extra,{white:[]},{moon:'white'});
 assert.equal(old.settings.vine,2.5);
 assert.equal(old.settings.birds,2);
 assert.throws(()=>decodeGarden(encodeGarden({...state,settings:{...extra,vine:9}}),extra,{white:[]},{moon:'white'}));
});

test('individual visitor counts round-trip, including zero',()=>{
 const independent={...settings,birds:0,snails:8,bees:1,butterflies:5};
 assert.deepEqual(decode(encodeGarden({...state,settings:independent})).settings,independent);
 for(const value of [-1,9,1.5])assert.throws(()=>decode(encodeGarden({...state,settings:{...settings,birds:value}})));
});
test('legacy visitor totals distribute in their original order',()=>{
 const legacy={...settings,visitors:7};for(const k of ['birds','snails','bees','butterflies'])delete legacy[k];
 const restored=decode(encodeGarden({...state,settings:legacy})).settings;
 assert.deepEqual([restored.butterflies,restored.birds,restored.bees,restored.snails],[2,2,2,1]);
 const none=decode(encodeGarden({...state,settings:{...legacy,visitors:0}})).settings;
 assert.equal(none.birds+none.snails+none.bees+none.butterflies,0);
});

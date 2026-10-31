import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeGarden, decodeGarden } from './state.js';
const settings={density:100,size:43,reach:155,speed:1,thorns:60,thornSize:3,tips:80,flowers:'mixed',palette:'white',theme:'moon'};
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

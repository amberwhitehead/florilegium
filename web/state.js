export const visitorKeys=['butterflies','birds','bees','snails'];
export function visitorSettings(input, fallback={}) {
 const result={};
 if(input.visitors!==undefined && (!Number.isInteger(input.visitors)||input.visitors<0||input.visitors>16))throw new Error('Invalid visitor count.');
 visitorKeys.forEach((key,i)=>{
  const legacy=input.visitors===undefined?(fallback[key]??2):Math.floor(input.visitors/4)+(i<input.visitors%4?1:0);
  const value=input[key]??legacy;
  if(!Number.isInteger(value)||value<0||value>8)throw new Error('Invalid visitor count.');
  result[key]=value;
 });
 return result;
}
// Versioned, dependency-free link format. The fragment stays in the browser.
export function encodeGarden(state) {
  return '#garden=' + encodeURIComponent(JSON.stringify({v:1, ...state}));
}
export function decodeGarden(hash, defaults, palettes, themes) {
  if (!hash.startsWith('#garden=')) return null;
  if (hash.length > 150000) throw new Error('This garden link is too large.');
  const value=JSON.parse(decodeURIComponent(hash.slice(8)));
  if(value?.v!==1 || !Number.isInteger(value.seed) || value.seed<0 || value.seed>4294967295) throw new Error('Unsupported garden link.');
  const poem=value.poem;
  if(!poem || !['title','author','text'].every(k=>typeof poem[k]==='string') || poem.title.length>160 || poem.author.length>160 || poem.text.length>6000) throw new Error('Invalid poem in this link.');
  const settings={...defaults}, input=value.settings;
  if(!input || typeof input!=='object') throw new Error('Missing garden settings.');
  for(const [key,min,max] of [['density',40,160],['size',22,64],['reach',90,240],['speed',.5,3],['thorns',0,100],['thornSize',.5,4],['tips',0,100]]) {
    if(!Number.isFinite(input[key]) || input[key]<min || input[key]>max) throw new Error('Invalid garden settings.');
    settings[key]=input[key];
  }
  for(const [key,min,max] of [['vine',.4,3]]){if(input[key]!==undefined){if(!Number.isFinite(input[key])||input[key]<min||input[key]>max)throw new Error('Invalid garden settings.');settings[key]=input[key];}}
  if(!Object.hasOwn(palettes,input.palette) || !Object.hasOwn(themes,input.theme) || !['classic','mixed','daisy','lily','rosette'].includes(input.flowers)) throw new Error('Unknown garden style.');
  for(const key of ['palette','theme','flowers']) settings[key]=input[key];
  Object.assign(settings,visitorSettings(input,defaults));
  delete settings.visitors;
  return {poem:{title:poem.title,author:poem.author,text:poem.text},settings,seed:value.seed};
}

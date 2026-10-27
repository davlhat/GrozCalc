import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync(new URL('../data/sourced-products.json',import.meta.url),'utf8'));
const counts={Rimi:0,Maxima:0,Lidl:0};
const seen=new Set();
for(const p of rows){
 if(!(p.store in counts))throw Error('Unknown store');
 counts[p.store]++;
 const key=p.store+'|'+p.name;
 if(seen.has(key))throw Error('Duplicate '+key);
 seen.add(key);
 for(const n of ['calories','protein','fat','carbs'])if(!Number.isFinite(p[n])||p[n]<0||p[n]>1000)throw Error('Invalid '+n+' '+key);
 if(!p.source_url?.startsWith('https://'))throw Error('Missing source '+key);
}
console.log(counts);
if(counts.Rimi!==20||counts.Maxima!==20)throw Error('Rimi and Maxima require 20 each');
if(counts.Lidl<20)console.warn('Lidl products pending label-backed verification');

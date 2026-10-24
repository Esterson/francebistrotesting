/* Run before publishing: changed CSS/JS receives a new cache key. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const path=resolve(root,'index.html');
const html=await readFile(path,'utf8');
const pattern=/\b(?:src|href)="((?:css|js|assets)\/[^"?#]+\.(?:css|js))(?:\?[^"#]*)?"/g;
const versions=new Map();
for(const match of html.matchAll(pattern)){
  const asset=match[1];
  if(!versions.has(asset))versions.set(asset,createHash('sha256').update((await readFile(resolve(root,asset),'utf8')).replace(/\r\n/g,'\n')).digest('hex').slice(0,12));
}
const updated=html.replace(pattern,(attribute,asset)=>attribute.replace(/=".*"$/,`="${asset}?v=${versions.get(asset)}"`));
if(updated!==html)await writeFile(path,updated);
console.log(`Versioned ${versions.size} CSS/JS files using content hashes.`);

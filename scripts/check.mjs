import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {runInNewContext} from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const context={window:{}};
runInNewContext(await readFile(resolve(root,'js/content.js'),'utf8'),context);
const {copy,gallery}=context.window.ChevaletContent;
const failures=[];
for(const file of ['index.html','css/styles.css','css/refinements.css','css/brand.css','assets/fonts.css','js/app.js','js/content.js']){
 const source=await readFile(resolve(root,file),'utf8');
 const refs=file.endsWith('.html')?[...source.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]):file.endsWith('.css')?[...source.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]):[];
 for(const ref of refs){if(/^(https?:|tel:|mailto:|\?|data:)/.test(ref))continue;const path=resolve(root,dirname(file),ref.split(/[?#]/)[0]);try{if(!(await stat(path)).size)failures.push(`Empty asset: ${ref}`)}catch{failures.push(`Missing asset: ${ref}`)}}
 if(file==='index.html')for(const[,key]of source.matchAll(/data-i18n="([^"]+)"/g))for(const lang of ['ru','en'])if(!copy[lang][key])failures.push(`Missing ${lang} translation: ${key}`);
}
for(const item of gallery)try{await stat(resolve(root,item.src))}catch{failures.push(`Missing gallery photo: ${item.src}`)}
for(const lang of ['ru','en'])for(const tab of ['kitchen','bar'])for(let p=1;p<=3;p++)try{await stat(resolve(root,`assets/menu-${lang}-${tab}-${p}.svg`))}catch{failures.push(`Missing menu: ${lang}/${tab}/${p}`)}
if(Object.keys(copy.ru).sort().join()!==Object.keys(copy.en).sort().join())failures.push('Language dictionaries do not match');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}else console.log('PASS: local assets, all 12 menu pages, HTML translation keys, matching RU/EN dictionaries.');

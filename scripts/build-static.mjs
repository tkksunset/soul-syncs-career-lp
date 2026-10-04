import {cp,mkdir,rm} from 'node:fs/promises';
// Publish only LP assets; server-side code and secrets must not enter the public directory.
await rm('dist',{recursive:true,force:true});await mkdir('dist');
await cp('index.html','dist/index.html');
for(const folder of ['css','js','assets'])await cp(folder,'dist/'+folder,{recursive:true});

await cp('thanks','dist/thanks',{recursive:true});

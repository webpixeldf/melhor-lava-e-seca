import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const dir='public/images/blog';
for (const name of fs.readdirSync(dir).filter(x=>x.endsWith('.webp'))) {
 const input=path.join(dir,name);const meta=await sharp(input).metadata();
 for(const width of [400,800]) {
  if(meta.width < width) continue;
  const output=path.join(dir,'responsive',name.replace(/\.webp$/,`-${width}.webp`));
  fs.mkdirSync(path.dirname(output),{recursive:true});
  if(fs.existsSync(output)&&fs.statSync(output).mtimeMs>=fs.statSync(input).mtimeMs) continue;
  await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:78}).toFile(output);
 }
}
console.log('Imagens responsivas verificadas.');

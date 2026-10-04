import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
const metrics=JSON.parse(await readFile('screenshots/comparison/metrics.json','utf8'));
const screenshot='screenshots/lp-1440.png';
const fullScreenshotHeight=(await sharp(screenshot).metadata()).height;
const sourceRegions={hero:[1,0,536],feelings:[1,536,505],ideal:[1,1041,495],design:[2,0,830],about:[2,830,706],support:[3,0,831],stories:[3,831,705],culture:[4,0,451],faq:[4,451,534],contact:[4,985,460]};
const rows=[];
async function compare(name,part,top,height,actualTop,actualHeight){
  const original=await sharp(`/Users/uenotakaki/Desktop/PART 0${part}.png`).extract({left:0,top,width:1024,height}).png().toBuffer();
  const rendered=await sharp(screenshot).extract({left:0,top:Math.round(actualTop),width:1440,height:Math.round(actualHeight)}).resize({width:1024}).png().toBuffer();
  const renderedMeta=await sharp(rendered).metadata();
  const canvasHeight=Math.max(height,renderedMeta.height)+48;
  const title=Buffer.from(`<svg width="2072" height="48"><rect width="2072" height="48" fill="#f5eee6"/><text x="18" y="31" font-family="sans-serif" font-size="20">REFERENCE / ${name} / 1024px</text><text x="1060" y="31" font-family="sans-serif" font-size="20">IMPLEMENTATION / 1440px → 1024px / DPR 1, zoom 100%</text></svg>`);
  await sharp({create:{width:2072,height:canvasHeight,channels:3,background:'#e4e0dc'}}).composite([{input:title,top:0,left:0},{input:original,top:48,left:0},{input:rendered,top:48,left:1048}]).png().toFile(`screenshots/comparison/${name}.png`);
  rows.push({name,referenceHeight:height,implementationHeightAt1024:renderedMeta.height,difference:renderedMeta.height-height});
}
for(const section of metrics.sections){const [part,top,height]=sourceRegions[section.id];const isHero=section.id==='hero';await compare(section.id,part,top,height,isHero?0:section.y,isHero?section.y+section.height:section.height)}
for(const part of metrics.parts){await compare(`part-${part.part}`,Number(part.part),0,1536,part.part==='01'?0:part.y,part.part==='01'?part.height+part.y:part.part==='04'?fullScreenshotHeight-part.y:part.height)}
await writeFile('screenshots/comparison/dimensions.json',JSON.stringify(rows,null,2));
await writeFile('screenshots/comparison/index.html',`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>カンプ比較 | Soul Sync’s</title><style>body{margin:0;padding:30px;background:#ece7df;font-family:sans-serif;color:#33261e}h1{font-size:24px}p{line-height:1.7}section{margin:30px 0}img{width:100%;height:auto;display:block}nav{display:flex;flex-wrap:wrap;gap:15px}a{color:#c32d25}</style><h1>デザインカンプと実装の比較</h1><p>左：元カンプ。右：幅1440px / DPR 1 / 表示倍率100%で取得した実装を、縦横比を保って幅1024pxに縮小。高さを引き伸ばして合わせていません。グレー部分は高さの差です。</p><nav>${rows.map(r=>`<a href="#${r.name}">${r.name}</a>`).join('')}</nav>${rows.map(r=>`<section id="${r.name}"><h2>${r.name}</h2><img src="${r.name}.png" alt="${r.name}のカンプと実装の同縮尺比較" loading="lazy"></section>`).join('')}</html>`);
console.log(rows);

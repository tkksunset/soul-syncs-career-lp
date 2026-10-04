import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// Source coordinates are pixels in the supplied 1024 × 1536 comps.
// Only photographic regions are extracted. No full section or text panel is used.
const crops = [
  ['hero-office-clean',1,923,60,100,70,'背景の一部。人物・見出しを含まないオフィス断片'],
  ['feelings-person',1,293,793,263,176,'下部のコピーを避けた人物領域。腕・机の完全な元写真が必要'],
  ['ideal-income',1,501,1146,149,80,'写真内側。ラベルとアイコンを除外'],
  ['ideal-freedom',1,689,1090,135,77,'写真内側。ラベルとアイコンを除外'],
  ['ideal-challenge',1,868,1129,120,65,'写真内側。ラベルとアイコンを除外'],
  ['ideal-growth',1,440,1263,113,84,'写真内側。ラベルとアイコンを除外'],
  ['ideal-time',1,580,1270,119,72,'写真内側。ラベルとアイコンを除外'],
  ['ideal-place',1,696,1230,140,72,'写真内側。ラベルとアイコンを除外'],
  ['ideal-confidence',1,869,1247,118,55,'写真内側。ラベルとアイコンを除外'],
  ['ideal-independent',1,790,1357,96,48,'写真内側。ラベルとアイコンを除外'],
  ['step-1',2,49,416,153,106,'写真のみ'],
  ['step-2',2,243,418,151,103,'写真内のノートの文字は撮影対象の一部'],
  ['step-3',2,438,416,151,105,'写真のみ'],
  ['step-4',2,633,417,151,103,'手書き図解は撮影対象。HTMLで同じ説明を併記'],
  ['step-5',2,828,417,147,103,'写真のみ'],
  ['about-team',2,532,843,491,473,'手書きのコピーが写真上に重なっています。無理な除去はせず保持。クリーンな元写真が必要'],
  ['about-video',2,332,1205,196,96,'カンプの再生マークが写真に重なっています。動画とクリーンなサムネイルが必要'],
  ['support-1',3,47,475,297,139,'写真のみ'],
  ['support-2',3,376,475,295,139,'写真のみ'],
  ['support-3',3,702,475,280,139,'写真のみ'],
  ['support-meeting',3,799,196,119,69,'傾いたフレーム内の写真領域。ラベルは除外'],
  ['support-training',3,942,154,58,111,'フレーム内の写真領域。元写真不足のため狭いトリミング'],
  ['story-1',3,256,1174,92,99,'文章・引用の重なりを避けた顔の領域。全身画像は復元不可'],
  ['story-2',3,573,1164,96,109,'文章・引用の重なりを避けた顔の領域。全身画像は復元不可'],
  ['story-3',3,891,1172,92,100,'文章・引用の重なりを避けた顔の領域。全身画像は復元不可'],
  ['culture-main',4,561,94,244,134,'手書きコピーとキャラクターを避けた人物領域。上部・下部の完全な元写真が必要'],
  ['culture-meeting',4,819,39,180,61,'ラベル・枠を除いた写真内側'],
  ['culture-training',4,843,163,156,70,'ラベル・枠を除いた写真内側'],
  ['culture-work',4,839,293,159,84,'ラベル・枠を除いた写真内側'],
  ['culture-camp',4,654,294,160,85,'ラベル・枠を除いた写真内側'],
];
for (const [name,part,left,top,width,height] of crops) {
  await sharp(`/Users/uenotakaki/Desktop/PART 0${part}.png`)
    .extract({left,top,width,height}).webp({quality:95}).toFile(`public/images/camp/${name}.webp`);
}
await writeFile('public/images/camp/manifest.json',JSON.stringify(crops.map(([name,part,left,top,width,height,note])=>({name,source:`PART 0${part}.png`,crop:{left,top,width,height},note})),null,2));
// Contact sheet for visual inspection of the exact crops (not a website asset).
const thumbs=await Promise.all(crops.map(async([name],i)=>({input:await sharp(`public/images/camp/${name}.webp`).resize(190,130,{fit:'contain',background:'#fff7ec'}).png().toBuffer(),left:(i%5)*200,top:Math.floor(i/5)*150})));
await sharp({create:{width:1000,height:Math.ceil(crops.length/5)*150,channels:3,background:'#eee'}}).composite(thumbs).png().toFile('screenshots/comparison/crop-contact-sheet.png');
console.log(`Restored ${crops.length} photo assets with source manifest.`);

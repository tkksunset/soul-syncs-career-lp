import sharp from 'sharp';
import {copyFile} from 'node:fs/promises';
const sheet='/Users/uenotakaki/Desktop/シンクちゃん.jpg';
const poses={guide:{left:749,top:511,width:351,height:466},thinking:{left:1166,top:9,width:309,height:493},smile:{left:55,top:9,width:344,height:493}};
for(const [name,region] of Object.entries(poses)){await sharp(sheet).extract(region).resize({height:640}).webp({quality:90}).toFile(`public/images/${name}.webp`)}
await copyFile('/Users/uenotakaki/Desktop/会社ロゴ.png','public/images/logo.png');
console.log('Official assets prepared');

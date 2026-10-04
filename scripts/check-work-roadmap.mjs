import {chromium} from '@playwright/test';
const b=await chromium.launch();const p=await b.newPage();
const expected={independence:['営業・対人スキルを身につける','収入の土台をつくる','発信・実績づくりに取り組む','独立・自分の仕事をつくる'],creator:['制作の基礎スキルを身につける','作品やポートフォリオをつくる','案件に挑戦し、実績を積む','クリエイターとして活躍する'],income:['目標収入と必要なスキルを明確にする','実務経験を積む','成果と専門性を高める','収入とキャリアの選択肢を広げる'],freedom:['理想の生活・働き方を整理する','必要なスキルや経験を身につける','働き方の選択肢を増やす','自分の価値観に合った働き方を目指す']};
for(const width of [320,390,768,1024,1200,1440]){
await p.setViewportSize({width,height:1000});await p.goto('file://'+process.cwd()+'/index.html');
for(const [key,text] of Object.entries(expected)){await p.locator(`.work-choice:has([value=${key}])`).click();const actual=await p.locator('.work-step-title').allTextContents();if(JSON.stringify(actual)!==JSON.stringify(text))throw Error(key);}
const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('overflow '+width);
await p.locator('[name=work-future][value=independence]').focus();await p.keyboard.press('ArrowRight');if(!await p.locator('[value=creator]').isChecked())throw Error('keyboard');
await p.locator('.work-roadmap-cta').click();if(!(await p.locator('#consultation').inputValue()).includes('クリエイター'))throw Error('prefill');
await p.locator('#consultation').fill('自分で入力した相談');await p.locator('.work-choice:has([value=income])').click();await p.locator('.work-roadmap-cta').click();if(await p.locator('#consultation').inputValue()!=='自分で入力した相談')throw Error('overwrite');
await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.work-choice:has([value=freedom])').click();if(await p.locator('#work-roadmap').evaluate(e=>e.getAnimations().length))throw Error('motion');await p.emulateMedia({reducedMotion:'no-preference'});
if(width===390||width===1440){await p.locator('.work-choice:has([value=independence])').click();await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#work img')].map(i=>{i.loading='eager';return i.decode()}));document.querySelector('.header').style.visibility='hidden';});await p.locator('.work-experience').screenshot({path:`screenshots/work-roadmap-${width}.png`});}
console.log(width,'four goals, keyboard, CTA, overwrite protection, reduced motion: passed');}
await b.close();

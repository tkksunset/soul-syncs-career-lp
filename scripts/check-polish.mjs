import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch();const page=await browser.newPage();const failures=[];const log=[];
page.on('pageerror',e=>failures.push(e.message));
const url='file://'+process.cwd()+'/index.html';
for(const width of [320,390,768,1024,1200,1440]){
 await page.setViewportSize({width,height:1000});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 const sizes=[];
 for(const goal of ['independence','creator','income','freedom']){
  await page.locator(`.work-choice:has([value=${goal}])`).click();
  sizes.push(await page.locator('#work-roadmap').evaluate(e=>e.offsetHeight));
 }
 if(Math.max(...sizes)-Math.min(...sizes)>1)throw Error('Roadmap shifts '+width+' '+sizes);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#question-2').focus();await page.keyboard.press('Enter');
 if(await page.locator('#answer-2').isHidden())throw Error('FAQ keyboard');
 const result=await page.evaluate(()=>{
 const main=document.querySelector('main').getBoundingClientRect();
 return {overflow:document.documentElement.scrollWidth>innerWidth,center:Math.abs(main.left+main.width/2-innerWidth/2),clipped:[...document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main .btn')].filter(e=>e.offsetWidth>2&&e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,30)),heroVisible:[...document.querySelectorAll('.hero h1,.hero .hero-cta')].every(e=>getComputedStyle(e).opacity==='1')};
 });
 if(result.overflow||result.center>1||result.clipped.length||!result.heroVisible)throw Error(JSON.stringify({width,...result}));
 log.push(width+'px: centered layout, text fits, stable roadmap, keyboard FAQ passed');
 if(width===390||width===1440){await page.goto(url);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}));});await page.screenshot({path:`screenshots/polished-${width}.png`,fullPage:true});}
}
await page.goto(url);await page.locator('button[type=submit]').click();
await page.locator('#email').fill('bad-address');await page.locator('#email').blur();if(!await page.locator('#email-error').textContent())throw Error('Email error');
await page.locator('#phone').fill('abc');await page.locator('#phone').blur();if(!await page.locator('#phone-error').textContent())throw Error('Phone error');
await page.locator('#consent').check();await page.locator('#consent').blur();if(await page.locator('#consent').getAttribute('aria-invalid'))throw Error('Consent clear');
log.push('Email, phone and consent validation passed');
const noJs=await browser.newPage({javaScriptEnabled:false});await noJs.goto(url);
if(!await noJs.locator('.hero h1').isVisible()||!await noJs.locator('.problems-card').first().isVisible()||!await noJs.locator('.card').first().isVisible())throw Error('No JS readability');
log.push('JavaScript disabled: hero and information cards remain visible');
if(failures.length)throw Error(failures.join('\n'));
log.push('No browser JavaScript errors; native Safari/Edge and production CWV not measured');
writeFileSync('screenshots/polish-verification.txt',log.join('\n'));console.log(log.join('\n'));await browser.close();

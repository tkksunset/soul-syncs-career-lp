'use strict';
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','メニューを開く');}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
matchMedia('(min-width:1200px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.faq-toggle').forEach(button=>button.addEventListener('click',()=>{
  const expanded=button.getAttribute('aria-expanded')==='true';
  const answer=document.getElementById(button.getAttribute('aria-controls'));
  answer.getAnimations().forEach(animation=>animation.cancel());
  button.setAttribute('aria-expanded',String(!expanded));
  answer.hidden=expanded;
  button.querySelector('.faq-sign').textContent=expanded?'+':'−';
  if(!expanded&&!motionPreference.matches&&answer.animate)answer.animate([{opacity:.65},{opacity:1}],{duration:180,easing:'ease-out'});
}));
const sections=[...document.querySelectorAll('main>.section')];
const sideLinks=[...document.querySelectorAll('.side-nav a')];
let scheduled=false;
function updateSection(){const marker=innerHeight*.35;let active=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=marker)active=section;}sideLinks.forEach(link=>{if(link.hash==='#'+active.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});scheduled=false;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateSection);}},{passive:true});addEventListener('resize',updateSection);updateSection();
const privacy=document.querySelector('#privacy');
document.querySelectorAll('.privacy-link').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();privacy.showModal();}));
const form=document.querySelector('#application-form');
const summary=document.querySelector('#form-errors');
const status=document.querySelector('#form-status');
const submit=form.querySelector('[type=submit]');
const submitLabel=submit.innerHTML;
function validate(field){let error='';const value=field.value.trim();if(field.type==='checkbox'){if(!field.checked)error='個人情報の取り扱いへの同意が必要です。';}else if(!value){const label=document.querySelector('label[for="'+field.id+'"]');const name=label?label.childNodes[0].textContent.trim():'この項目';error=field.tagName==='SELECT'?name+'を選択してください。':name+'を入力してください。';}else if(field.name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='正しいメールアドレスを入力してください。';else if(field.name==='phone'&&!/^0\d{9,10}$/.test(value.replace(/[\s()-]/g,'')))error='0から始まる10〜11桁の電話番号を入力してください。';else if(field.name==='age'&&(!Number.isInteger(Number(value))||Number(value)<15||Number(value)>100))error='年齢は15〜100の整数で入力してください。';document.getElementById(field.id+'-error').textContent=error;if(error)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');return error;}
form.querySelectorAll('[required]').forEach(field=>{field.addEventListener('blur',()=>validate(field));field.addEventListener('input',()=>{if(field.hasAttribute('aria-invalid'))validate(field);});});
form.addEventListener('submit',async e=>{e.preventDefault();if(submit.disabled)return;status.textContent='';const invalid=[...form.querySelectorAll('[required]')].filter(field=>validate(field));summary.hidden=!invalid.length;if(invalid.length){summary.textContent=`${invalid.length}項目をご確認ください。`;invalid[0].focus();return;}submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='送信中…';try{const endpoint=form.dataset.endpoint.trim();if(endpoint){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(!response.ok)throw new Error('送信エラー');status.textContent='お問い合わせを受け付けました。担当よりご連絡いたします。';form.reset();}else{await new Promise(resolve=>setTimeout(resolve,700));status.textContent='入力内容の確認が完了しました（デモ）。情報は送信・保存されていません。';}status.focus();}catch{status.textContent='送信できませんでした。時間をおいて再度お試しください。入力内容は保持されています。';status.focus();}finally{submit.disabled=false;submit.removeAttribute('aria-busy');submit.innerHTML=submitLabel;}});

// Set official URLs here. Empty entries remain disabled; no placeholder destinations.
const SOCIAL_URLS = {
  x: '',
  instagram: '',
  youtube: '',
  note: ''
};
document.querySelectorAll('[data-social]').forEach(button => {
  const url = SOCIAL_URLS[button.dataset.social];
  if (!url) return;
  let parsed;
  try { parsed = new URL(url); } catch { return; }
  if (parsed.protocol !== 'https:') return;
  const link = document.createElement('a');
  link.className = button.className;
  link.href = parsed.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const name = button.getAttribute('aria-label').split('（')[0];
  link.setAttribute('aria-label', name + '公式アカウント（新しいタブで開く）');
  link.title = name + '公式アカウント';
  link.innerHTML = button.innerHTML;
  button.replaceWith(link);
});

// Progressive enhancement: content stays visible even when JavaScript fails.
if ('IntersectionObserver' in window) {
  const cards=document.querySelectorAll('#problems .problems-card, #about .card, #support .card, #community .community-card, #career .timeline>li, #flow .timeline>li');
  const observer=new IntersectionObserver(entries=>{
    let delay=0;
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);
      if(!motionPreference.matches&&entry.target.animate){
        entry.target.animate([{opacity:.82,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:Math.min(delay,160),easing:'ease-out'});
        delay+=80;
      }
    });
  },{threshold:.08});
  cards.forEach(card=>observer.observe(card));
  motionPreference.addEventListener('change',event=>{
    if(event.matches)document.querySelectorAll('main *').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));
  });
}

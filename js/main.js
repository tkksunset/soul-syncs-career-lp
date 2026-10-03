'use strict';
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','メニューを開く');}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
matchMedia('(min-width:1200px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.querySelectorAll('.faq-toggle').forEach(button=>button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));document.getElementById(button.getAttribute('aria-controls')).hidden=expanded;button.querySelector('.faq-sign').textContent=expanded?'+':'−';}));
const sections=[...document.querySelectorAll('main>.section')];
const sideMascot=document.querySelector('.side-mascot');
let scheduled=false;
function updateSection(){const marker=innerHeight*.35;let active=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=marker)active=section;}sideMascot.hidden=active.dataset.mascot!=='true';document.querySelectorAll('.side-nav a').forEach(link=>{if(link.hash==='#'+active.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});scheduled=false;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateSection);}},{passive:true});addEventListener('resize',updateSection);updateSection();
const privacy=document.querySelector('#privacy');
document.querySelectorAll('.privacy-link').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();privacy.showModal();}));
const form=document.querySelector('#application-form');
const summary=document.querySelector('#form-errors');
const status=document.querySelector('#form-status');
const submit=form.querySelector('[type=submit]');
function validate(field){let error='';const value=field.value.trim();if(field.type==='checkbox'){if(!field.checked)error='個人情報の取り扱いへの同意が必要です。';}else if(!value)error='この項目を入力してください。';else if(field.name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='正しいメールアドレスを入力してください。';else if(field.name==='phone'&&!/^0\d{9,10}$/.test(value.replace(/[\s()-]/g,'')))error='0から始まる10〜11桁の電話番号を入力してください。';else if(field.name==='age'&&(!Number.isInteger(Number(value))||Number(value)<15||Number(value)>100))error='年齢は15〜100の整数で入力してください。';document.getElementById(field.id+'-error').textContent=error;if(error)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');return error;}
form.querySelectorAll('[required]').forEach(field=>{field.addEventListener('blur',()=>validate(field));field.addEventListener('input',()=>{if(field.hasAttribute('aria-invalid'))validate(field);});});
form.addEventListener('submit',async e=>{e.preventDefault();if(submit.disabled)return;status.textContent='';const invalid=[...form.querySelectorAll('[required]')].filter(field=>validate(field));summary.hidden=!invalid.length;if(invalid.length){summary.textContent=`${invalid.length}項目をご確認ください。`;invalid[0].focus();return;}submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='送信中…';try{const endpoint=form.dataset.endpoint.trim();if(endpoint){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(!response.ok)throw new Error('送信エラー');status.textContent='お申し込みを受け付けました。担当よりご連絡いたします。';form.reset();}else{await new Promise(resolve=>setTimeout(resolve,700));status.textContent='入力内容の確認が完了しました（デモ）。情報は送信・保存されていません。';}status.focus();}catch{status.textContent='送信できませんでした。時間をおいて再度お試しください。入力内容は保持されています。';status.focus();}finally{submit.disabled=false;submit.removeAttribute('aria-busy');submit.innerHTML='無料で申し込む <span aria-hidden="true">→</span>';}});

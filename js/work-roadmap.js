'use strict';
// Goal data is independent of rendering and existing form submission logic.
const WORK_ROADMAPS = {
  independence: {
    title: '独立・起業したい',
    steps: ['営業・対人スキルを身につける', '収入の土台をつくる', '発信・実績づくりに取り組む', '独立・自分の仕事をつくる']
  },
  creator: {
    title: 'クリエイターとして働きたい',
    steps: ['制作の基礎スキルを身につける', '作品やポートフォリオをつくる', '案件に挑戦し、実績を積む', 'クリエイターとして活躍する']
  },
  income: {
    title: '収入を上げたい',
    steps: ['目標収入と必要なスキルを明確にする', '実務経験を積む', '成果と専門性を高める', '収入とキャリアの選択肢を広げる']
  },
  freedom: {
    title: '自分らしい働き方をしたい',
    steps: ['理想の生活・働き方を整理する', '必要なスキルや経験を身につける', '働き方の選択肢を増やす', '自分の価値観に合った働き方を目指す']
  }
};
(() => {
  const section = document.getElementById('work');
  if (!section) return;
  const roadmap = section.querySelector('#work-roadmap');
  const title = section.querySelector('[data-roadmap-goal]');
  const stepTitles = section.querySelectorAll('.work-step-title');
  const status = section.querySelector('#work-roadmap-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  // Reserve only the height needed by the longest of the four real texts.
  let measuredWidth=0;
  function reserveRoadmapHeight(force=false) {
    const width=roadmap.getBoundingClientRect().width;
    if(!width||(!force&&Math.abs(width-measuredWidth)<1))return;
    measuredWidth=width;
    const clone=roadmap.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
    clone.removeAttribute('id');
    clone.removeAttribute('aria-labelledby');
    clone.setAttribute('aria-hidden','true');
    clone.inert=true;
    Object.assign(clone.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:width+'px',margin:'0'});
    const titles=clone.querySelectorAll('.work-step-title');
    const heading=clone.querySelector('h3');
    titles.forEach(element=>element.style.minHeight='0');
    heading.style.minHeight='0';
    roadmap.parentElement.append(clone);
    const heights=[0,0,0,0];
    let headingHeight=0;
    Object.values(WORK_ROADMAPS).forEach(data=>{
      clone.querySelector('[data-roadmap-goal]').textContent=data.title;
      titles.forEach((element,index)=>element.textContent=data.steps[index]);
      headingHeight=Math.max(headingHeight,heading.getBoundingClientRect().height);
      titles.forEach((element,index)=>heights[index]=Math.max(heights[index],element.getBoundingClientRect().height));
    });
    clone.remove();
    roadmap.querySelector('h3').style.minHeight=Math.ceil(headingHeight)+'px';
    stepTitles.forEach((element,index)=>element.style.minHeight=Math.ceil(heights[index])+'px');
  }
  reserveRoadmapHeight();
  if('ResizeObserver' in window)new ResizeObserver(()=>reserveRoadmapHeight()).observe(roadmap);
  if(document.fonts)document.fonts.ready.then(()=>reserveRoadmapHeight(true));
  reducedMotion.addEventListener('change',event=>{if(event.matches&&animation)animation.cancel();});

  section.querySelectorAll('[name="work-future"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      const data = WORK_ROADMAPS[radio.value];
      if (!data) return;
      title.textContent = data.title;
      stepTitles.forEach((heading, index) => { heading.textContent = data.steps[index]; });
      status.textContent = data.title + 'のロードマップを表示しました。';
      if (animation) animation.cancel();
      if (!reducedMotion.matches && typeof roadmap.animate === 'function') {
        animation = roadmap.animate([{opacity: .3, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 260, easing: 'ease-out'});
      }
    });
  });
  section.querySelector('.work-roadmap-cta').addEventListener('click', () => {
    const consultation = document.getElementById('consultation');
    const selected = section.querySelector('[name="work-future"]:checked');
    // Keep any text the visitor already entered; only prefill an empty field.
    if (consultation && !consultation.value.trim() && selected) {
      consultation.value = '目指したい未来：' + WORK_ROADMAPS[selected.value].title;
      consultation.dispatchEvent(new Event('input', {bubbles: true}));
    }
  });
})();

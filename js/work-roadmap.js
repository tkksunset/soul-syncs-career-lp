'use strict';
// Goal data is independent of rendering and existing form submission logic.
const WORK_ROADMAPS = {
  "independence": {
    "title": "独立・起業したい",
    "steps": [
      {
        "title": "理想と現状のギャップを知る",
        "description": "目指す事業や働き方から、必要な力を整理する。"
      },
      {
        "title": "価値を生み出す力を磨く",
        "description": "営業や実務を通して、課題を解決する経験を積む。"
      },
      {
        "title": "価値を届ける力を磨く",
        "description": "発信や提案を通して、必要な人に自分の価値を届ける。"
      },
      {
        "title": "自分の事業をつくる",
        "description": "経験と実績を土台に、独立・起業を目指す。"
      }
    ]
  },
  "creator": {
    "title": "クリエイターとして働きたい",
    "steps": [
      {
        "title": "スキルと理想を整理する",
        "description": "得意なことや経験を棚卸しし、目標とのギャップを知る。"
      },
      {
        "title": "価値を生み出す力を磨く",
        "description": "必要な制作スキルを磨き、作品や実績をつくる。"
      },
      {
        "title": "価値を届ける力を磨く",
        "description": "発信や提案を通じて、作品の魅力を必要な人に届ける。"
      },
      {
        "title": "創作を仕事につなげる",
        "description": "自分の強みを生かし、クリエイターとして活躍する。"
      }
    ]
  },
  "income": {
    "title": "収入を上げたい",
    "steps": [
      {
        "title": "理想の収入と現状を知る",
        "description": "目標金額と現在地を明確にし、必要な経験を整理する。"
      },
      {
        "title": "市場で求められる力を磨く",
        "description": "営業や実務を通して、成果につながる力を身につける。"
      },
      {
        "title": "成果と価値を伝える力を磨く",
        "description": "実績を積み、自分の強みや価値を相手に伝える。"
      },
      {
        "title": "収入の選択肢を広げる",
        "description": "培った力を生かし、収入アップを目指す。"
      }
    ]
  },
  "freedom": {
    "title": "自分らしい働き方をしたい",
    "steps": [
      {
        "title": "理想の生き方を明確にする",
        "description": "大切にしたい価値観や、理想の暮らしを整理する。"
      },
      {
        "title": "理想と現状のギャップを知る",
        "description": "今の自分に足りない能力や経験を見つける。"
      },
      {
        "title": "必要な経験を積む",
        "description": "目標から逆算し、自分に必要な仕事や挑戦を選ぶ。"
      },
      {
        "title": "自分らしい未来をつくる",
        "description": "自分の価値観に合った働き方の実現を目指す。"
      }
    ]
  }
};

(() => {
  const section = document.getElementById('work');
  if (!section) return;
  const roadmap = section.querySelector('#work-roadmap');
  const title = section.querySelector('[data-roadmap-goal]');
  const stepTitles = section.querySelectorAll('.work-step-title');
  const stepDescriptions = section.querySelectorAll('.work-step-description');
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
    const descriptions=clone.querySelectorAll('.work-step-description');
    titles.forEach(element=>element.style.minHeight='0');
    heading.style.minHeight='0';
    descriptions.forEach(element=>element.style.minHeight='0');
    roadmap.parentElement.append(clone);
    const heights=[0,0,0,0];
    const descriptionHeights=[0,0,0,0];
    let headingHeight=0;
    Object.values(WORK_ROADMAPS).forEach(data=>{
      clone.querySelector('[data-roadmap-goal]').textContent=data.title;
      titles.forEach((element,index)=>element.textContent=data.steps[index].title);
      descriptions.forEach((element,index)=>element.textContent=data.steps[index].description);
      headingHeight=Math.max(headingHeight,heading.getBoundingClientRect().height);
      titles.forEach((element,index)=>heights[index]=Math.max(heights[index],element.getBoundingClientRect().height));
      descriptions.forEach((element,index)=>descriptionHeights[index]=Math.max(descriptionHeights[index],element.getBoundingClientRect().height));
    });
    clone.remove();
    roadmap.querySelector('h3').style.minHeight=Math.ceil(headingHeight)+'px';
    stepTitles.forEach((element,index)=>element.style.minHeight=Math.ceil(heights[index])+'px');
    stepDescriptions.forEach((element,index)=>element.style.minHeight=Math.ceil(descriptionHeights[index])+'px');
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
      stepTitles.forEach((heading, index) => { heading.textContent = data.steps[index].title; });
      stepDescriptions.forEach((paragraph,index)=>{ paragraph.textContent=data.steps[index].description; });
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

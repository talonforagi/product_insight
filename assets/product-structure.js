(() => {
  'use strict';
  const section=document.querySelector('.bc-classification');
  if (!section) return;
  const question=section.querySelector('.classification-question');
  const desktop=matchMedia('(min-width:801px) and (min-height:650px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=false;
  function render() {
    pending=false;
    if (!desktop.matches) {question.removeAttribute('style');return;}
    const header=document.querySelector('.topbar').offsetHeight;
    const progress=Math.max(0,Math.min(1,(scrollY-section.offsetTop+header-40)/180));
    const p=reduced.matches?(progress>=.5?1:0):progress*progress*(3-2*progress);
    question.style.opacity=p;
    question.style.transform=`translateY(${(1-p)*22}px)`;
    question.style.visibility=progress===0?'hidden':'visible';
  }
  function setup(){
    section.classList.toggle('bc-scroll',desktop.matches);
    document.documentElement.classList.toggle('product-scroll-story',desktop.matches);
    render();
  }
  window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);
  desktop.addEventListener('change',setup);
  reduced.addEventListener('change',setup);
  setup();
})();

// Each case keeps its workflow visible while the characteristics appear on scroll.
(() => {
  'use strict';
  const sections=[...document.querySelectorAll('.value-case')];
  if (!sections.length) return;
  const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=false;
  function render(){
    pending=false;
    const header=document.querySelector('.topbar').offsetHeight;
    sections.forEach(section=>{
      const details=section.querySelector('.value-case-details');
      if (!desktop.matches){details.removeAttribute('style');return;}
      const progress=Math.max(0,Math.min(1,(scrollY-section.offsetTop+header-35)/210));
      const p=reduced.matches?(progress>=.5?1:0):progress*progress*(3-2*progress);
      details.style.opacity=p;
      details.style.transform=`translateY(${(1-p)*24}px)`;
      details.style.visibility=progress===0?'hidden':'visible';
    });
  }
  function setup(){sections.forEach(section=>section.classList.toggle('value-case-scroll',desktop.matches));render();}
  window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);
  desktop.addEventListener('change',setup);
  reduced.addEventListener('change',setup);
  setup();
})();

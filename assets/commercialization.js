(() => {
  'use strict';
  const section=document.querySelector('.business-anchor');
  if (!section) return;
  const results=section.querySelector('.business-results');
  const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=false;
  function render(){
    pending=false;
    if(!desktop.matches){results.removeAttribute('style');return;}
    const header=document.querySelector('.topbar').offsetHeight;
    const progress=Math.max(0,Math.min(1,(scrollY-section.offsetTop+header-35)/210));
    const p=reduced.matches?(progress>=.5?1:0):progress*progress*(3-2*progress);
    results.style.opacity=p;
    results.style.transform=`translateY(${(1-p)*24}px)`;
    results.style.visibility=progress===0?'hidden':'visible';
  }
  function setup(){
    section.classList.toggle('business-anchor-scroll',desktop.matches);
    document.documentElement.classList.toggle('business-scroll-story',desktop.matches);
    render();
  }
  window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);
  desktop.addEventListener('change',setup);
  reduced.addEventListener('change',setup);
  setup();
})();

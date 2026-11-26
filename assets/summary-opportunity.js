(() => {
  'use strict';
  const section=document.querySelector('.opportunity-summary');
  if(!section)return;
  const stages=[...section.querySelectorAll('[data-opportunity-stage]')];
  const buttons=[...section.querySelectorAll('[data-opportunity-step]')];
  const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=false;
  const header=()=>document.querySelector('.topbar').offsetHeight;
  const distance=()=>section.offsetHeight-(innerHeight-header()-58);
  const clamp=v=>Math.max(0,Math.min(1,v));
  function render(){
    pending=false;if(!desktop.matches)return;
    const p=clamp((scrollY-section.offsetTop+header())/distance());
    const smooth=(a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
    const selected=p<.35?0:1;
    const alphas=[1-smooth(.20,.35),smooth(.35,.58)];
    stages.forEach((stage,i)=>{
      const a=reduced.matches?(selected===i?1:0):alphas[i];
      stage.style.opacity=a;
      stage.style.transform=reduced.matches?'none':`translateY(${(1-a)*(i===0?-30:35)}px) scale(${.96+.04*a})`;
      stage.style.filter=reduced.matches?'none':`blur(${(1-a)*4}px)`;
      stage.style.pointerEvents=selected===i?'auto':'none';
      stage.setAttribute('aria-hidden',selected===i?'false':'true');stage.inert=selected!==i;
    });
    buttons.forEach((b,i)=>{if(i===selected)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  }
  function setup(){
    section.classList.toggle('opportunity-scroll',desktop.matches);
    document.documentElement.classList.toggle('opportunity-scroll-story',desktop.matches);
    if(!desktop.matches)stages.forEach(stage=>{stage.removeAttribute('style');stage.removeAttribute('aria-hidden');stage.inert=false;});
    render();
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{
    if(desktop.matches)window.scrollTo({top:section.offsetTop-header()+distance()*(i===0?0:1),behavior:reduced.matches?'instant':'smooth'});
    else stages[i].scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
  }));
  window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);desktop.addEventListener('change',setup);reduced.addEventListener('change',setup);setup();
})();

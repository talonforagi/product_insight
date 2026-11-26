(() => {
  'use strict';
  const section=document.querySelector('.closing-qa');
  if(!section)return;
  const phases=[...section.querySelectorAll('[data-closing-phase]')];
  const buttons=[...section.querySelectorAll('[data-closing-step]')];
  const desktop=matchMedia('(min-width:801px) and (min-height:600px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=false;
  const header=()=>document.querySelector('.topbar').offsetHeight;
  const distance=()=>section.offsetHeight-(innerHeight-header()-58);
  const clamp=v=>Math.max(0,Math.min(1,v));
  function render(){
    pending=false;if(!desktop.matches)return;
    const p=clamp((scrollY-section.offsetTop+header())/distance());
    const smooth=(a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
    const selected=p<.3?0:p<.7?1:2;
    const alphas=[1-smooth(.2,.3),smooth(.3,.4)*(1-smooth(.6,.7)),smooth(.7,.82)];
    phases.forEach((phase,i)=>{
      const opacity=reduced.matches?(i===selected?1:0):alphas[i];
      phase.style.opacity=opacity;
      phase.style.transform=reduced.matches?'none':`translateY(${(1-opacity)*35}px) scale(${.96+.04*opacity})`;
      phase.style.filter=reduced.matches?'none':`blur(${(1-opacity)*4}px)`;
      phase.setAttribute('aria-hidden',selected===i?'false':'true');phase.inert=selected!==i;
      phase.style.pointerEvents=selected===i?'auto':'none';
    });
    buttons.forEach((b,i)=>{if(i===selected)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    section.style.setProperty('--closing-progress',p);
  }
  function setup(){
    section.classList.toggle('closing-scroll',desktop.matches);
    document.documentElement.classList.toggle('closing-scroll-story',desktop.matches);
    if(!desktop.matches)phases.forEach(phase=>{phase.removeAttribute('style');phase.removeAttribute('aria-hidden');phase.inert=false;});
    render();
  }
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{
    if(desktop.matches)window.scrollTo({top:section.offsetTop-header()+distance()*i/2,behavior:reduced.matches?'instant':'smooth'});
    else phases[i].scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
  }));
  window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);desktop.addEventListener('change',setup);reduced.addEventListener('change',setup);setup();
})();

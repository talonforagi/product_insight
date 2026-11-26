(() => {
  'use strict';
  const section = document.querySelector('.tiamat-outcome, .drama-case');
  if (!section) return;
  const stages = [...section.querySelectorAll('[data-outcome]')];
  const buttons = [...section.querySelectorAll('[data-outcome-step]')];
  const drama=section.classList.contains('drama-case');
  const flowSteps=[...section.querySelectorAll('.drama-workflow li')];
  const appScreens=[...section.querySelectorAll('.drama-app-screens figure')];
  const ideal=section.querySelector('.drama-ideal');
  const desktop = matchMedia('(min-width:901px) and (min-height:650px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let enabled = false, pending = false;
  const clamp = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
  const header = () => document.querySelector('.topbar').offsetHeight;
  const distance = () => section.offsetHeight - (innerHeight-header()-58);
  function render() {
    pending=false;
    if (!enabled) return;
    const p=clamp((scrollY-section.offsetTop+header())/distance());
    const selected=p<.30?0:p<.70?1:2;
    const smooth=(a,b)=>{const x=clamp((p-a)/(b-a));return x*x*(3-2*x);};
    // Fade through the dark canvas so white screenshots never overlap the text.
    const alphas=drama
      ? [1-smooth(.18,.30),smooth(.30,.41)*(1-smooth(.59,.70)),smooth(.70,.83)]
      : [1-smooth(.24,.30),smooth(.30,.36)*(1-smooth(.64,.70)),smooth(.70,.76)];
    stages.forEach((stage,i) => {
      const opacity=reduced.matches?(selected===i?1:0):alphas[i];
      stage.style.opacity=opacity.toFixed(4);
      if (drama && !reduced.matches) {
        const outgoing=(i===0 && p>.18)||(i===1 && p>.59);
        const y=(outgoing?-65:65)*(1-opacity);
        stage.style.transform=`perspective(1200px) translateY(${y}px) scale(${.92+.08*opacity}) rotateX(${(outgoing?-4:4)*(1-opacity)}deg)`;
        stage.style.filter=`blur(${(1-opacity)*5}px)`;
      } else {
        stage.style.transform=reduced.matches?'none':`translateY(${(1-opacity)*18}px) scale(${.98+.02*opacity})`;
        stage.style.filter='none';
      }
      stage.style.pointerEvents=selected===i?'auto':'none';
      stage.setAttribute('aria-hidden',selected===i?'false':'true');
      stage.inert=selected!==i;
    });
    buttons.forEach((button,i)=> { if (i===selected) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current'); });
    section.style.setProperty('--outcome-progress',(p).toFixed(4));
    if(drama){
      flowSteps.forEach((step,i)=>step.style.setProperty('--item-enter',smooth(.32+i*.018,.39+i*.018)));
      if(ideal) ideal.style.setProperty('--item-enter',smooth(.43,.51));
      appScreens.forEach((screen,i)=>screen.style.setProperty('--item-enter',smooth(.72+i*.035,.82+i*.035)));
      const waves=[smooth(.18,.30),smooth(.30,.41),smooth(.59,.70),smooth(.70,.83)];
      section.style.setProperty('--transition-glow',Math.max(...waves.map(v=>4*v*(1-v))).toFixed(4));
    }
  }
  function setup() {
    enabled=desktop.matches;
    section.classList.toggle('outcome-enabled',enabled);
    section.classList.toggle('drama-enhanced',drama && enabled && !reduced.matches);
    if (!enabled) {
      stages.forEach(stage=>{stage.removeAttribute('style');stage.removeAttribute('aria-hidden');stage.inert=false;});
      return;
    }
    render();
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{
    if (enabled) {
      const p=i===0?0:i===2?1: .5;
      window.scrollTo({top:section.offsetTop-header()+distance()*p,behavior:reduced.matches?'instant':'smooth'});
    } else stages[i].scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
  }));
  window.addEventListener('scroll',()=>{if (!pending) {pending=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',setup);
  desktop.addEventListener('change',setup);
  reduced.addEventListener('change',setup);
  setup();
})();

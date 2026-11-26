(() => {
  'use strict';
  const section = document.querySelector('.ai-timeline');
  if (!section) return;
  const stage = section.querySelector('.timeline-stage');
  const svg = section.querySelector('.maturity-svg');
  const path = section.querySelector('.maturity-path');
  const axes = section.querySelector('.maturity-axis');
  const arrows = section.querySelectorAll('.maturity-axis')[1];
  const visibility = section.querySelector('.visibility-label');
  const time = section.querySelector('.time-label');
  const state = section.querySelector('.morph-state');
  const wide = matchMedia('(min-width:1101px) and (min-height:600px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let startPoints, endPoints, pending = false, enabled = false;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  function setup() {
    enabled = wide.matches;
    document.documentElement.classList.toggle('timeline-story', enabled);
    section.classList.toggle('morph-enabled', enabled);
    if (!enabled) { section.style.removeProperty('--morph'); section.style.removeProperty('--curve-opacity'); return; }
    const width = stage.clientWidth, height = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const rect = stage.getBoundingClientRect();
    const dots = [...section.querySelectorAll('.timeline-track i')].map(el => {
      const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - rect.left, r.top + r.height / 2 - rect.top];
    });
    const x0 = dots[0][0], x1 = dots[dots.length - 1][0], y = dots[0][1], span = x1 - x0;
    // Both states use four cubic Bézier segments; every control point follows scroll.
    startPoints = [x0,y, x0+span*.05,y, x0+span*.13,y, x0+span*.18,y,
      x0+span*.24,y, x0+span*.25,y, x0+span*.34,y,
      x0+span*.43,y, x0+span*.43,y, x0+span*.54,y,
      x0+span*.66,y, x0+span*.81,y, x1,y];
    const top = 30, bottom = height - 40, trough = bottom - 25, plateau = top + (bottom - top)*.36;
    endPoints = [x0,bottom-8, x0+span*.045,top+110, x0+span*.09,top-28, x0+span*.16,top+12,
      x0+span*.23,top+50, x0+span*.25,trough+15, x0+span*.34,trough,
      x0+span*.43,trough-6, x0+span*.43,plateau+18, x0+span*.54,plateau+3,
      x0+span*.66,plateau-12, x0+span*.81,plateau, x1,plateau-2];
    axes.setAttribute('d', `M20 18V${bottom+8}H${width-16}`);
    arrows.setAttribute('d', `M15 27l5-9 5 9M${width-25} ${bottom+3}l9 5-9 5`);
    visibility.setAttribute('x',35); visibility.setAttribute('y',24);
    time.setAttribute('x',width-16); time.setAttribute('y',bottom-5);
    render();
  }
  function render() {
    pending = false;
    if (!enabled || !startPoints) return;
    const header = document.querySelector('.topbar').offsetHeight;
    const distance = section.offsetHeight - (innerHeight - header - 58);
    const progress = clamp((scrollY - section.offsetTop + header) / distance);
    // Hold the timeline briefly so the initial view remains fully readable.
    let p = clamp((progress - .12) / .74);
    if (reduced.matches) p = p >= .5 ? 1 : 0;
    const eased = p*p*(3-2*p);
    const values = startPoints.map((n,i) => (n + (endPoints[i]-n)*eased).toFixed(2));
    path.setAttribute('d', `M${values.slice(0,2).join(' ')} C${values.slice(2).join(' ')}`);
    const startColor = [143,163,190], endColor = [255,82,101];
    path.style.stroke = `rgb(${startColor.map((n,i)=>Math.round(n+(endColor[i]-n)*eased)).join(',')})`;
    section.style.setProperty('--morph',p.toFixed(4));
    section.style.setProperty('--curve-opacity',clamp(p*5).toFixed(4));
    section.style.setProperty('--timeline-opacity',(1-clamp(p*2.2)).toFixed(4));
    section.style.setProperty('--axes-opacity',clamp((p-.3)/.55).toFixed(4));
    section.style.setProperty('--timeline-title-opacity',(1-clamp(p/.25)).toFixed(4));
    section.style.setProperty('--curve-title-opacity',clamp((p-.35)/.3).toFixed(4));
    state.textContent = p > .85 ? '技术成熟度曲线' : p > .15 ? '曲线演变中' : '时间线';
  }
  function requestRender() { if (!pending) { pending=true; requestAnimationFrame(render); } }
  window.addEventListener('scroll',requestRender,{passive:true});
  window.addEventListener('resize',setup);
  wide.addEventListener('change',setup);
  reduced.addEventListener('change',setup);
  setup();
})();

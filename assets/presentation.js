(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.screen-dots a')];
  const prev = document.querySelector('#prev');
  const next = document.querySelector('#next');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, scheduled = false, toastTimer;
  const headerHeight = () => document.querySelector('.topbar').offsetHeight;
  function go(index) {
    const slide = slides[Math.max(0, Math.min(index, slides.length - 1))];
    window.scrollTo({top: slide.offsetTop - headerHeight(), behavior: reduced.matches ? 'instant' : 'smooth'});
    try { history.replaceState(null, '', '#' + slide.id); } catch {}
  }
  function update() {
    scheduled = false;
    const marker = headerHeight() + Math.min(innerHeight * .3, 240);
    let index = 0;
    slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= marker) index = i; });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 3) index = slides.length - 1;
    if (active !== index) {
      active = index;
      document.querySelector('#screen-number').textContent = String(index + 1).padStart(2, '0');
      document.querySelector('#screen-label').textContent = slides[index].dataset.label;
      dots.forEach((dot, i) => { if (i === index) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current'); });
      prev.disabled = index === 0; next.disabled = index === slides.length - 1;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('.reading-progress i').style.width = (max > 0 ? scrollY / max * 100 : 100) + '%';
    const visual = document.querySelector('.hero-visual');
    if (visual && !reduced.matches && scrollY < innerHeight) visual.style.setProperty('--parallax', Math.min(scrollY * .12, 70) + 'px');
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive: true});
  window.addEventListener('resize', update);
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const index = slides.findIndex(s => '#' + s.id === link.getAttribute('href'));
    if (index < 0) return;
    e.preventDefault(); go(index);
  }));
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  function notify(message) { const toast = document.querySelector('.toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else notify('请使用浏览器菜单进入全屏演示');
    } catch { notify('请使用浏览器菜单进入全屏演示'); }
  }
  document.querySelector('#fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('fullscreenchange', () => { document.querySelector('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '全屏演示'); update(); });
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input,textarea,select,[contenteditable],a,button')) return;
    if (e.key.toLowerCase() === 'f') { e.preventDefault(); fullscreen(); return; }
    const tall = slides[active].offsetHeight > innerHeight - headerHeight() - 58 + 30;
    if (['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key) && tall) return;
    if (['ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); go(active + (e.shiftKey ? -1 : 1)); }
    if (['ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); go(active - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });
  function count(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';
    const target = Number(el.dataset.count), prefix = el.dataset.prefix || '';
    if (reduced.matches) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / 1300, 1);
      const value = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = prefix + value;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    if (!reduced.matches) document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      // Reveal metrics after the card's staggered entrance, once per visit.
      entry.target.querySelectorAll('[data-count]').forEach(el => setTimeout(() => count(el), 250));
      observer.unobserve(entry.target);
    }), {threshold: .12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const selected = document.querySelector('.chapter-nav a[aria-current]');
  const nav = document.querySelector('.chapter-nav');
  if (selected && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = selected.offsetLeft - nav.offsetLeft - 10;
  // Native anchor loading can settle after fonts/layout; restore the exact screen offset.
  if (location.hash) requestAnimationFrame(() => { const index = slides.findIndex(s => '#' + s.id === location.hash); if (index >= 0) window.scrollTo({top: slides[index].offsetTop - headerHeight(), behavior:'instant'}); });
  update();
})();

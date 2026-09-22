/* ============================================================
   Vayu Page Transition
   - Scroll past bottom → next page slides in
   - Scroll past top    → previous page slides in
   - Also works with touch (swipe) on mobile
   - Skips on bare game pages (Flappybird) — no scroll there
   ============================================================ */
(function(){
  'use strict';

  /* Full page order — add new pages here and they instantly
     get scroll-to-navigate behaviour. Match the exact URL casing. */
  const PAGE_ORDER = [
    '/',
    '/about',
    '/features',
    '/syntax',
    '/docs',
    '/speed',
    '/compare',
    '/VCB',
    '/github',
    '/games',
    '/roadmap',
    '/developer'
  ];

  const WHEEL_THRESHOLD = 160;
  const TOUCH_THRESHOLD = 70;
  const ANIM_MS = 600;

  let triggered = false;
  let wheelAccum = 0;
  let touchStartY = 0;
  let touchAccum = 0;
  let edgeTimeout = null;
  let hintEl = null;

  function normalizePath(p){
    return (p || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  }

  function currentIndex(){
    const cur = normalizePath(location.pathname);
    for(let i = 0; i < PAGE_ORDER.length; i++){
      if(PAGE_ORDER[i] === cur) return i;
    }
    // Fallback: compare last path segment, case-insensitive
    const base = (cur.split('/').pop() || '').toLowerCase();
    for(let i = 0; i < PAGE_ORDER.length; i++){
      const seg = (PAGE_ORDER[i].split('/').pop() || '').toLowerCase();
      if(seg === base) return i;
    }
    return -1;
  }

  function pageLabel(idx){
    if(idx < 0 || idx >= PAGE_ORDER.length) return '';
    const p = PAGE_ORDER[idx];
    if(p === '/') return 'Home';
    return p.slice(1);
  }

  function isBareGamePage(){
    const p = (location.pathname || '').toLowerCase();
    return p.indexOf('flappybird') !== -1;
  }

  /* ---------- Edge hint pill ---------- */
  function getHint(){
    if(hintEl) return hintEl;
    hintEl = document.createElement('div');
    hintEl.className = 'vayu-edge-hint';
    hintEl.innerHTML =
      '<span class="vayu-edge-hint-icon">↓</span>' +
      '<span class="vayu-edge-hint-text"></span>';
    document.body.appendChild(hintEl);
    return hintEl;
  }
  function showHint(direction, label){
    const h = getHint();
    h.classList.toggle('up', direction === 'prev');
    h.querySelector('.vayu-edge-hint-icon').textContent =
      direction === 'next' ? '↓' : '↑';
    h.querySelector('.vayu-edge-hint-text').textContent = label;
    h.classList.add('visible');
  }
  function hideHint(){
    if(hintEl) hintEl.classList.remove('visible');
  }

  /* ---------- Overlays ---------- */
  function makeOverlay(label, direction){
    const o = document.createElement('div');
    o.className = 'vayu-transition-overlay';
    o.innerHTML =
      '<div class="vayu-transition-inner">' +
        '<div class="vayu-transition-arrow">' +
          (direction === 'next' ? '↓' : '↑') +
        '</div>' +
        '<div class="vayu-transition-label">' + label + '</div>' +
      '</div>';
    return o;
  }

  function playOutgoing(direction, targetLabel){
    const o = makeOverlay(targetLabel, direction);
    o.style.animation = 'vayuSlideIn' +
      (direction === 'next' ? 'Up' : 'Down') + ' ' +
      (ANIM_MS / 1000) + 's cubic-bezier(0.6, 0, 0.2, 1) forwards';
    document.body.appendChild(o);
    return o;
  }

  function playIncoming(direction){
    const o = makeOverlay('', direction);
    o.style.transform = 'translateY(0)';
    o.style.animation = 'vayuSlideOut' +
      (direction === 'next' ? 'Up' : 'Down') + ' ' +
      (ANIM_MS / 1000) + 's cubic-bezier(0.6, 0, 0.2, 1) forwards';
    document.body.appendChild(o);
    setTimeout(() => { if(o.parentNode) o.remove(); }, ANIM_MS + 100);
  }

  /* ---------- Trigger ---------- */
  function triggerTransition(direction){
    if(triggered) return;
    const idx = currentIndex();
    if(idx < 0) return;
    const targetIdx = direction === 'next' ? idx + 1 : idx - 1;
    if(targetIdx < 0 || targetIdx >= PAGE_ORDER.length) return;

    triggered = true;
    hideHint();
    sessionStorage.setItem('vayu-slide', direction);

    playOutgoing(direction, pageLabel(targetIdx));

    setTimeout(() => { location.href = PAGE_ORDER[targetIdx]; }, ANIM_MS);
  }

  /* ---------- Init ---------- */
  function init(){
    // Never run on the bare game canvas page
    if(isBareGamePage()) return;

    // Play incoming animation from a previous navigation
    const incoming = sessionStorage.getItem('vayu-slide');
    if(incoming){
      sessionStorage.removeItem('vayu-slide');
      playIncoming(incoming);
    }

    // Wheel (desktop / trackpad)
    window.addEventListener('wheel', (e) => {
      if(triggered) return;
      if(document.querySelector('.modal.open')) return;
      // Don't interfere with the file managers or scrollable embedded panes
      if(e.target.closest && (
        e.target.closest('.exp-shell') ||
        e.target.closest('.lfm-list') ||
        e.target.closest('.lfm-preview-body') ||
        e.target.closest('.vayu-fullview-body') ||
        e.target.closest('.exp-preview-body') ||
        e.target.closest('.exp-grid')
      )) return;

      const idx = currentIndex();
      if(idx < 0) return;

      const atBottom = window.scrollY + window.innerHeight >=
                       document.documentElement.scrollHeight - 4;
      const atTop = window.scrollY <= 2;

      if(atBottom && e.deltaY > 0 && idx < PAGE_ORDER.length - 1){
        wheelAccum += e.deltaY;
        showHint('next', 'Keep scrolling · ' + pageLabel(idx + 1));
        clearTimeout(edgeTimeout);
        edgeTimeout = setTimeout(() => { wheelAccum = 0; hideHint(); }, 900);
        if(wheelAccum > WHEEL_THRESHOLD) triggerTransition('next');
      } else if(atTop && e.deltaY < 0 && idx > 0){
        wheelAccum += Math.abs(e.deltaY);
        showHint('prev', 'Keep scrolling · ' + pageLabel(idx - 1));
        clearTimeout(edgeTimeout);
        edgeTimeout = setTimeout(() => { wheelAccum = 0; hideHint(); }, 900);
        if(wheelAccum > WHEEL_THRESHOLD) triggerTransition('prev');
      } else {
        wheelAccum = 0;
        hideHint();
      }
    }, { passive: true });

    // Touch (mobile)
    window.addEventListener('touchstart', (e) => {
      if(triggered) return;
      touchStartY = e.touches[0].clientY;
      touchAccum = 0;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if(triggered) return;
      if(document.querySelector('.modal.open')) return;
      if(e.target.closest && (
        e.target.closest('.exp-shell') ||
        e.target.closest('.lfm-list') ||
        e.target.closest('.lfm-preview-body') ||
        e.target.closest('.vayu-fullview-body') ||
        e.target.closest('.exp-preview-body') ||
        e.target.closest('.exp-grid')
      )) return;

      const idx = currentIndex();
      if(idx < 0) return;

      const delta = touchStartY - e.touches[0].clientY;
      const atBottom = window.scrollY + window.innerHeight >=
                       document.documentElement.scrollHeight - 4;
      const atTop = window.scrollY <= 2;

      if(atBottom && delta > 0 && idx < PAGE_ORDER.length - 1){
        touchAccum = Math.max(touchAccum, delta);
        showHint('next', 'Keep scrolling · ' + pageLabel(idx + 1));
        if(touchAccum > TOUCH_THRESHOLD) triggerTransition('next');
      } else if(atTop && delta < 0 && idx > 0){
        touchAccum = Math.max(touchAccum, Math.abs(delta));
        showHint('prev', 'Keep scrolling · ' + pageLabel(idx - 1));
        if(touchAccum > TOUCH_THRESHOLD) triggerTransition('prev');
      } else {
        hideHint();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      setTimeout(hideHint, 300);
    }, { passive: true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
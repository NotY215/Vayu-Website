/* ============================================================
   Vayu Layout — top navigation, left hamburger drawer, footer, modals.
   - Top nav: About, Features, GitHub, Developer.
   - Left hamburger drawer: remaining site sections + actions.
   - On Flappybird.html: no chrome at all.
   - Roadmap statuses: completed | working | soon | vacation
   - Page transitions run on every section.
   ============================================================ */
(function(){
  'use strict';

  const NAV_LINKS = [
    { href: '/',              nav: 'home',          label: 'Home' },
    { href: '/about',         nav: 'about',         label: 'About' },
    { href: '/features',      nav: 'features',      label: 'Features' },
    { href: '/github',        nav: 'github',        label: 'GitHub' },
    { href: '/developer',     nav: 'developer',     label: 'Developer' },
    { href: '/syntax',        nav: 'syntax',        label: 'Syntax' },
    { href: '/docs',          nav: 'docs',          label: 'Documentation' },
    { href: '/speed',         nav: 'speed',         label: 'Speed' },
    { href: '/compare',       nav: 'compare',       label: 'Compare' },
    { href: '/VCB',           nav: 'vcb',           label: 'VCB' },
    { href: '/games',         nav: 'games',         label: 'Games' },
    { href: '/roadmap',       nav: 'roadmap',       label: 'Roadmap' },
    { href: '/faq',           nav: 'FAQ',           label: 'FAQ' }
  ];

  const NAV_HTML = `
    <nav>
      <div class="container nav-inner">
        <button class="nav-hamburger" type="button" aria-label="Open menu" aria-expanded="false" data-hamburger>
          <span></span><span></span><span></span>
        </button>
        <a class="brand" href="/" data-nav="home">
          <img src="/Vayu_logo.png" alt="Vayu logo" width="39" height="39">
          VAYU
        </a>
        <div class="navlinks">
          <a href="/about" data-nav="about">About</a>
          <a href="/features" data-nav="features">Features</a>
          <a href="/github" data-nav="github">GitHub</a>
          <a href="/developer" data-nav="developer">Developer</a>
          <a href="/roadmap" data-nav="roadmap">Roadmap</a>
          <a href="/Faq" data-nav="faq">FAQ</a>
        </div>
        <div class="nav-actions">
          <a class="btn primary nav-download soon" role="button" aria-disabled="true" tabindex="0"
             data-tip="Vayu is still in development — downloads aren’t available yet.">↓ Download</a>
          <a class="btn primary nav-patreon" href="https://www.patreon.com/cw/Ficzo" target="_blank" rel="noopener">Patreon</a>
        </div>
      </div>
    </nav>
  `;

  const DRAWER_HTML = `
    <div class="nav-drawer-backdrop" data-drawer-backdrop></div>
    <aside class="nav-drawer" role="dialog" aria-modal="true" aria-label="Menu" data-drawer>
      <div class="nav-drawer-head">
        <span class="nav-drawer-title">Menu</span>
        <button class="nav-drawer-close" type="button" aria-label="Close menu" data-drawer-close>✕</button>
      </div>
      <div class="nav-drawer-list">
        ${NAV_LINKS.filter(l => !['about','features','github','developer','roadmap','faq'].includes(l.nav)).map(l =>
          '<a class="nav-drawer-link" href="' + l.href + '" data-nav="' + l.nav + '">' +
            '<span>' + l.label + '</span>' +
            '<span class="nav-drawer-link-arrow">›</span>' +
          '</a>'
        ).join('')}
      </div>
      <div class="nav-drawer-actions">
        <a class="btn ghost" href="https://github.com/NotY215/Vayu" target="_blank" rel="noopener">⌘ Source</a>
        <button class="btn ghost hard-refresh-btn" type="button" data-hard-refresh>
          <span class="hard-refresh-icon">⟳</span>
          <span class="hard-refresh-text">Hard refresh</span>
        </button>
      </div>
    </aside>
  `;

  const FOOTER_HTML = `
    <footer>
      <div class="container footer-inner">
        <div>© 2026 Vayu · Independently developed by NotY215 · Apache 2.0</div>
        <div>
          <a href="https://github.com/NotY215/Vayu" target="_blank" rel="noopener">GitHub</a>
          ·
          <a href="https://github.com/NotY215/Vayu/releases" target="_blank" rel="noopener">Releases</a>
        </div>
      </div>
    </footer>
  `;

  const MODAL_EXAMPLES_HTML = `
    <div class="modal" id="examplesModal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Vayu examples">
      <div class="modal-backdrop" data-close></div>
      <div class="modal-panel lfm-panel">
        <div class="lfm-root" data-lfm-root>
          <header class="lfm-header">
            <div class="lfm-traffic">
              <span class="lfm-dot red"></span>
              <span class="lfm-dot yellow"></span>
              <span class="lfm-dot green"></span>
            </div>
            <div class="lfm-title">Examples — Vayu Files</div>
            <button class="lfm-close" type="button" data-close aria-label="Close">✕</button>
          </header>
          <div class="lfm-pathbar">
            <button class="lfm-nav-btn" data-nav="back" title="Back" type="button">←</button>
            <button class="lfm-nav-btn" data-nav="forward" title="Forward" type="button">→</button>
            <button class="lfm-nav-btn" data-nav="up" title="Up" type="button">↑</button>
            <button class="lfm-nav-btn" data-nav="refresh" title="Refresh" type="button">⟳</button>
            <div class="lfm-breadcrumb" data-breadcrumb></div>
            <div class="lfm-search" data-search-wrap>
              <span class="lfm-search-icon">⌕</span>
              <input type="text" data-search placeholder="Search files…" autocomplete="off" spellcheck="false" />
              <button class="lfm-search-clear" type="button" data-search-clear aria-label="Clear search">✕</button>
            </div>
          </div>
          <div class="fm-legend">
            <span><span class="fm-legend-dot"></span>Has recorded output — click to Run</span>
            <span class="fm-legend-sep">·</span>
            <span data-search-status>Ready</span>
          </div>
          <div class="lfm-body">
            <aside class="lfm-sidebar" data-sidebar></aside>
            <main class="lfm-list-wrap">
              <div class="lfm-list-head">
                <div class="lfm-cell-icon"></div>
                <div class="lfm-cell-name">Name</div>
                <div class="lfm-cell-size">Size</div>
                <div class="lfm-cell-type">Type</div>
              </div>
              <div class="lfm-list" data-list></div>
            </main>
            <aside class="lfm-preview" data-preview>
              <div class="lfm-empty">
                <div class="lfm-empty-icon">📄</div>
                <div>Select a file</div>
              </div>
            </aside>
          </div>
          <footer class="lfm-status">
            <span data-status-text>Ready</span>
          </footer>
        </div>
      </div>
    </div>
  `;

  const MODAL_GITHUB_HTML = `
    <div class="modal" id="githubModal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Vayu repository">
      <div class="modal-backdrop" data-close></div>
      <div class="modal-panel">
        <div class="modal-head">
          <div class="modal-title">⌘ Repository <span class="tag">NotY215/Vayu · full repository</span></div>
          <button class="modal-close" type="button" data-close aria-label="Close repository">✕</button>
        </div>
        <div class="modal-body">
          <aside class="fm-side">
            <div class="fm-side-head">
              <button class="fm-back" type="button">← Back</button>
              <span class="fm-crumb"></span>
            </div>
            <div class="fm-list"></div>
          </aside>
          <section class="fm-view">
            <div class="fm-empty">Select a file from the list to preview it here.</div>
          </section>
        </div>
      </div>
    </div>
  `;

  /* ============================================================
     ROADMAP DATA + PHASE BINDINGS
     ============================================================ */
  let ROADMAP_DATA = null;

  async function loadRoadmapData(){
    if(ROADMAP_DATA) return ROADMAP_DATA;
    try {
      const res = await fetch('/roadmap.json?_=' + Date.now(), { cache: 'no-store' });
      if(res.ok) ROADMAP_DATA = await res.json();
    } catch(err){
      console.warn('[Vayu roadmap] fetch failed', err);
    }
    return ROADMAP_DATA;
  }

  function getPhaseById(id){
    if(!ROADMAP_DATA || !Array.isArray(ROADMAP_DATA.phases)) return null;
    return ROADMAP_DATA.phases.find(p => Number(p.id) === Number(id)) || null;
  }
  function getWorkingPhase(){
    if(!ROADMAP_DATA || !Array.isArray(ROADMAP_DATA.phases)) return null;
    return ROADMAP_DATA.phases.find(p => p.status === 'working') || null;
  }
  function getCurrentPhaseNumber(){
    if(!ROADMAP_DATA) return 0;
    const w = getWorkingPhase();
    if(w) return Number(w.id);
    if(ROADMAP_DATA.currentPhase) return Number(ROADMAP_DATA.currentPhase);
    return 0;
  }
  function getCurrentPhase(){
    const num = getCurrentPhaseNumber();
    return getPhaseById(num) || getWorkingPhase();
  }
  function phaseStatusShort(p){
    if(!p) return '';
    const s = p.status || 'soon';
    if(s === 'completed') return 'COMPLETED';
    if(s === 'working')   return 'IN DEVELOPMENT';
    if(s === 'vacation')  return 'ON VACATION';
    if(s === 'skipped')   return 'SKIPPED FOR NOW';
    return 'PLANNED';
  }
  function resolvePhaseRef(ref){
    if(ref === 'current') return getCurrentPhase();
    if(ref === 'working') return getWorkingPhase();
    if(ref === 'next'){
      const w = getWorkingPhase();
      const n = w ? Number(w.id) + 1 : getCurrentPhaseNumber() + 1;
      return getPhaseById(n);
    }
    return getPhaseById(ref);
  }

  function applyPhaseBindings(){
    if(!ROADMAP_DATA) return;
    const current = getCurrentPhase();
    const currentNum = getCurrentPhaseNumber();
    const currentName = current ? current.name : '';
    const statusShort = phaseStatusShort(current);

    const phases = ROADMAP_DATA.phases || [];
    const completedCount = phases.filter(p => p.status === 'completed').length;
    const totalCount = phases.length;

    const setAll = (sel, val) => {
      document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
    };

    setAll('[data-phase-number]', String(currentNum));
    setAll('[data-phase-name]', currentName);
    setAll('[data-phase-status]', statusShort);
    setAll('[data-phase-badge]', 'PHASE ' + currentNum + ' · ' + statusShort);
    setAll('[data-phase-short]', 'PHASE ' + currentNum + ' · ' + (currentName || '').toUpperCase());
    setAll('[data-phase-completed]', String(completedCount));
    setAll('[data-phase-total]', String(totalCount));

    document.querySelectorAll('[data-phase-id]').forEach(el => {
      const ref = el.dataset.phaseId;
      const prop = el.dataset.phaseProp || 'name';
      const p = resolvePhaseRef(ref);
      if(!p) return;
      if(prop === 'number')      el.textContent = String(p.id);
      else if(prop === 'status') el.textContent = phaseStatusShort(p);
      else if(prop === 'short')  el.textContent = (p.name || '').toUpperCase();
      else                       el.textContent = p.name;
    });

    window.VayuRoadmap = ROADMAP_DATA;
    window.VayuPhase = {
      data: ROADMAP_DATA,
      current, currentNumber: currentNum, currentName,
      completedCount, totalCount,
      get: getPhaseById, working: getWorkingPhase,
      label: phaseStatusShort, apply: applyPhaseBindings
    };
  }

  /* ---------- helpers ---------- */
  function phaseClass(p){
    const s = p.status || 'soon';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'active';
    if(s === 'vacation')  return 'vacation';
    if(s === 'skipped')   return 'skipped';
    return '';
  }
  function markerClass(p){
    const s = p.status || 'soon';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'active';
    if(s === 'vacation')  return 'vacation';
    return '';
  }
  function markerInner(p){
    const s = p.status || 'soon';
    if(s === 'completed') return '✓';
    if(s === 'working')   return '<span class="dev-dot"></span>';
    if(s === 'vacation')  return '☕';
    if(s === 'skipped')   return '⏭';
    return '—';
  }
  function statusClass(p){
    const s = p.status || 'soon';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'dev';
    if(s === 'vacation')  return 'vacation';
    if(s === 'skipped')  return 'skipped';
    return 'planned';
  }
  function escapeHtml(s){
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function padPhaseId(id){
    const s = String(id);
    return s.length < 2 ? '0' + s : s;
  }
  function subDotClass(status){
    if(status === 'completed') return '';
    if(status === 'working')   return 'working';
    if(status === 'deferred')  return 'deferred';
    return 'planned';
  }

  function buildRoadmapTimeline(){
    const timeline = document.querySelector('.timeline, [data-timeline]');
    if(!timeline || !ROADMAP_DATA || !Array.isArray(ROADMAP_DATA.phases)) return;

    const phases = ROADMAP_DATA.phases;

    function renderSubphases(subs){
      if(!Array.isArray(subs) || !subs.length) return '';
      let html = '<div class="phase-subphases" data-subphases hidden><div class="phase-subphases-inner">';
      subs.forEach(sp => {
        const spStatus = sp.status || 'completed';
        html += '<div class="phase-subphase" data-sub-status="' + escapeHtml(spStatus) + '" id="roadmap-' + escapeHtml(sp.id) + '">' +
                  '<span class="phase-subphase-id">' + escapeHtml(sp.id) + '</span>' +
                  '<span class="phase-subphase-dot ' + subDotClass(spStatus) + '"></span>' +
                  '<span class="phase-subphase-name">' + escapeHtml(sp.name) + '</span>' +
                '</div>';
      });
      html += '</div></div>';
      return html;
    }

    function renderRootPhase(rp){
      const hasSubs = Array.isArray(rp.subphases) && rp.subphases.length > 0;
      const open = rp.status === 'working';
      let html = '<div class="phase-root ' + phaseClass(rp) + (open ? ' subphases-open' : '') + '" data-root-phase="' + escapeHtml(rp.id) + '" id="roadmap-' + escapeHtml(rp.id) + '">';
      html += '<div class="phase-root-top">';
      html += '<span class="phase-root-number">' + escapeHtml(rp.id) + '</span>';
      html += '<span class="phase-status ' + statusClass(rp) + '">' + phaseStatusShort(rp) + '</span>';
      if(hasSubs){
        html += '<button class="phase-toggle root-toggle" type="button" data-phase-toggle aria-expanded="' + String(open) + '">' +
                  '<span class="phase-toggle-chevron">▾</span>' +
                  '<span class="phase-toggle-text">' + rp.subphases.length + ' subphase' + (rp.subphases.length === 1 ? '' : 's') + '</span>' +
                '</button>';
      }
      html += '</div>';
      html += '<h4>' + escapeHtml(rp.name) + '</h4>';
      if(rp.description) html += '<p>' + escapeHtml(rp.description) + '</p>';
      if(hasSubs) html += renderSubphases(rp.subphases);
      html += '</div>';
      return html;
    }

    let html = '';
    phases.forEach(p => {
      const hasRoots = Array.isArray(p.rootPhases) && p.rootPhases.length > 0;
      const hasSubs = Array.isArray(p.subphases) && p.subphases.length > 0;
      const subsCount = hasSubs ? p.subphases.length : 0;

      html += '<div class="phase ' + phaseClass(p) + ' reveal" data-phase="' + p.id + '" id="roadmap-phase-' + p.id + '">';
      html += '<div class="phase-marker ' + markerClass(p) + '">' + markerInner(p) + '</div>';
      html += '<div class="phase-main">';
      html += '<div class="phase-top">';
      html += '<span class="phase-number">' + padPhaseId(p.id) + '</span>';
      html += '<span class="phase-status ' + statusClass(p) + '">' + phaseStatusShort(p) + '</span>';
      if(hasSubs){
        html += '<button class="phase-toggle" type="button" data-phase-toggle aria-expanded="false">' +
                  '<span class="phase-toggle-chevron">▾</span>' +
                  '<span class="phase-toggle-text">' + subsCount + ' subphase' + (subsCount === 1 ? '' : 's') + '</span>' +
                '</button>';
      }
      html += '</div>';
      html += '<h3>' + escapeHtml(p.name) + '</h3>';
      if(p.description) html += '<p>' + escapeHtml(p.description) + '</p>';

      if(hasRoots){
        html += '<div class="phase-root-phases">';
        p.rootPhases.forEach(rp => { html += renderRootPhase(rp); });
        html += '</div>';
      } else if(hasSubs) {
        html += renderSubphases(p.subphases);
      }

      html += '</div></div>';
    });

    timeline.innerHTML = html;
    bindAccordions(timeline);
    runRevealObserver(timeline);

    const working = getWorkingPhase();
    if(working){
      const target = timeline.querySelector('#roadmap-phase-' + CSS.escape(String(working.id)));
      if(target) target.classList.add('working-target');
    }
  }

  function buildRoadmapSideNav(){
    const nav = document.querySelector('[data-roadmap-side-nav]');
    if(!nav || !ROADMAP_DATA || !Array.isArray(ROADMAP_DATA.phases)) return;

    const working = getWorkingPhase();
    let html = '<div class="roadmap-side-title">Jump to phase</div><div class="roadmap-side-list">';
    ROADMAP_DATA.phases.forEach(p => {
      const active = working && Number(p.id) === Number(working.id);
      html += '<a class="roadmap-side-link' + (active ? ' active' : '') + '" href="#roadmap-phase-' + p.id + '" data-roadmap-target="roadmap-phase-' + p.id + '">' +
                '<span class="roadmap-side-num">' + padPhaseId(p.id) + '</span>' +
                '<span class="roadmap-side-name">' + escapeHtml(p.name) + '</span>' +
              '</a>';

      if(Array.isArray(p.rootPhases)){
        html += '<div class="roadmap-side-children">';
        p.rootPhases.forEach(rp => {
          html += '<a class="roadmap-side-link root" href="#roadmap-' + escapeHtml(rp.id) + '" data-roadmap-target="roadmap-' + escapeHtml(rp.id) + '">' +
                    '<span class="roadmap-side-num">' + escapeHtml(rp.id) + '</span>' +
                    '<span class="roadmap-side-name">' + escapeHtml(rp.name.replace(/^Part\\s+\\d+:\\s*/i,'')) + '</span>' +
                  '</a>';
          if(Array.isArray(rp.subphases)){
            rp.subphases.forEach(sp => {
              html += '<a class="roadmap-side-link sub" href="#roadmap-' + escapeHtml(sp.id) + '" data-roadmap-target="roadmap-' + escapeHtml(sp.id) + '">' +
                        '<span class="roadmap-side-num">' + escapeHtml(sp.id) + '</span>' +
                        '<span class="roadmap-side-name">' + escapeHtml(sp.name) + '</span>' +
                      '</a>';
            });
          }
        });
        html += '</div>';
      }
    });
    html += '</div>';
    nav.innerHTML = html;

    nav.querySelectorAll('[data-roadmap-target]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.getElementById(link.dataset.roadmapTarget);
        if(!target) return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        history.replaceState(null, '', '#' + link.dataset.roadmapTarget);
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', link);
      });
    });
  }

  function scrollRoadmapToWorking(){
    const page = currentPage();
    if(page !== 'roadmap') return;
    const working = getWorkingPhase();
    if(!working) return;
    const target = document.getElementById('roadmap-phase-' + working.id);
    if(!target) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 94);
    window.scrollTo({top, behavior: reduce ? 'auto' : 'smooth'});
  }

  function bindAccordions(timeline){
    timeline.querySelectorAll('[data-phase-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const root = btn.closest('.phase-root');
        const phaseEl = btn.closest('.phase');
        const owner = root || phaseEl;
        if(!owner) return;
        const body = owner.querySelector(':scope > .phase-subphases, .phase-main > .phase-subphases');
        if(!body) return;
        const isOpen = owner.classList.contains('subphases-open');
        if(isOpen){
          owner.classList.remove('subphases-open');
          body.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
        } else {
          owner.classList.add('subphases-open');
          body.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', btn);
      });
    });
  }

  function runRevealObserver(scope){
    if(!('IntersectionObserver' in window)){
      scope.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    scope.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  function syncRoadmapTimeline(){
    if(!ROADMAP_DATA) return;
    const timeline = document.querySelector('.timeline, [data-timeline]');
    if(!timeline) return;
    buildRoadmapTimeline();
    buildRoadmapSideNav();
    if(window.VayuAnim && typeof window.VayuAnim.refreshScrollAnim === 'function'){
      window.VayuAnim.refreshScrollAnim();
    }
    setTimeout(scrollRoadmapToWorking, 80);
  }

  /* ============================================================
     PAGE + SLOT HELPERS
     ============================================================ */
  function currentPage(){
    let p = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '');
    if(p === '' || p === '/index' || p === '/home') return 'home';
    const parts = p.split('/').filter(Boolean);
    return (parts[parts.length - 1] || 'home').toLowerCase();
  }

  function isBareGamePage(page){
    return page === 'flappybird';
  }

  function ensureSlot(id, position){
    let slot = document.getElementById(id);
    if(slot) return slot;
    slot = document.createElement('div');
    slot.id = id;
    if(position === 'before-main'){
      const main = document.querySelector('main');
      if(main && main.parentNode) main.parentNode.insertBefore(slot, main);
      else document.body.insertBefore(slot, document.body.firstChild);
    } else {
      document.body.appendChild(slot);
    }
    return slot;
  }

  function injectChrome(){
    if(isBareGamePage(currentPage())) return;

    ensureSlot('slot-nav', 'before-main').innerHTML = NAV_HTML;
    ensureSlot('slot-footer', 'end').innerHTML = FOOTER_HTML;
    ensureSlot('slot-modal-examples', 'end').innerHTML = MODAL_EXAMPLES_HTML;
    ensureSlot('slot-modal-github', 'end').innerHTML = MODAL_GITHUB_HTML;

    if(!document.querySelector('[data-drawer]')){
      const wrap = document.createElement('div');
      wrap.innerHTML = DRAWER_HTML;
      const main = document.body.querySelector('main');
      const backdrop = wrap.firstElementChild;
      const drawer   = wrap.firstElementChild.nextElementSibling;
      if(main){
        document.body.insertBefore(backdrop, main);
        document.body.insertBefore(drawer, main);
      } else {
        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);
      }
    }
  }

  function setActiveNav(){
    if(isBareGamePage(currentPage())) return;
    let page = currentPage();
    if(page === 'flappybird') page = 'games';
    document.querySelectorAll('.nav-drawer-link[data-nav], .navlinks a[data-nav]').forEach(a => {
      if(a.dataset.nav === page){
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function initDrawer(){
    const burger = document.querySelector('[data-hamburger]');
    const drawer = document.querySelector('[data-drawer]');
    const backdrop = document.querySelector('[data-drawer-backdrop]');
    const closeBtn = document.querySelector('[data-drawer-close]');
    if(!burger || !drawer || !backdrop) return;
    let open = false;
    function setOpen(next){
      open = next;
      drawer.classList.toggle('open', open);
      backdrop.classList.toggle('open', open);
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-drawer-open', open);
    }
    burger.addEventListener('click', (e) => { e.preventDefault(); setOpen(!open); });
    backdrop.addEventListener('click', () => setOpen(false));
    if(closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
    drawer.querySelectorAll('.nav-drawer-link').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && open) setOpen(false); });
  }

  function initHardRefresh(){
    document.querySelectorAll('[data-hard-refresh]').forEach(btn => {
      if(btn.dataset.hrBound) return;
      btn.dataset.hrBound = '1';
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(btn.classList.contains('refreshing')) return;
        btn.classList.add('refreshing');

        const drawer = document.querySelector('[data-drawer]');
        if(drawer && drawer.classList.contains('open')){
          drawer.classList.remove('open');
          const bd = document.querySelector('[data-drawer-backdrop]');
          if(bd) bd.classList.remove('open');
          const bg = document.querySelector('[data-hamburger]');
          if(bg){ bg.classList.remove('active'); bg.setAttribute('aria-expanded', 'false'); }
          document.body.classList.remove('nav-drawer-open');
        }

        if(window.VayuHaptics) window.VayuHaptics.fire('medium', btn);

        const preserved = {};
        ['vayu-game-flappy-score','vayu-game-data-flappy'].forEach(k => {
          try {
            const v = localStorage.getItem(k);
            if(v !== null) preserved[k] = v;
          } catch(_) {}
        });

        try { if(window.caches){ const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } } catch(_) {}
        try { if(navigator.serviceWorker){ const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); } } catch(_) {}
        try { sessionStorage.clear(); } catch(_) {}
        try { localStorage.clear(); } catch(_) {}
        try {
          if(window.indexedDB && indexedDB.databases){
            const dbs = await indexedDB.databases();
            await Promise.all(dbs.map(db => {
              if(!db.name) return Promise.resolve();
              return new Promise(res => {
                const req = indexedDB.deleteDatabase(db.name);
                req.onsuccess = req.onerror = req.onblocked = () => res();
              });
            }));
          }
        } catch(_) {}

        Object.keys(preserved).forEach(k => {
          try { localStorage.setItem(k, preserved[k]); } catch(_) {}
        });

        const url = location.pathname + '?_hr=' + Date.now();
        setTimeout(() => { location.replace(url); }, 400);
      });
    });
  }

  function initExamplesModal(){
    const openBtn = document.getElementById('openExamples');
    const modal = document.getElementById('examplesModal');
    if(!modal) return;
    let inited = false;
    function openModal(){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if(!inited){
        inited = true;
        if(window.VayuExamples && typeof window.VayuExamples.init === 'function'){
          window.VayuExamples.init();
        }
      }
      setTimeout(() => {
        const closeBtn = modal.querySelector('.lfm-close, .modal-close');
        if(closeBtn) closeBtn.focus();
      }, 60);
    }
    function closeModal(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    if(openBtn) openBtn.addEventListener('click', openModal);
    modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
    window.VayuOpenExamples = openModal;
  }

  function loadScript(src){
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-vayu-src="' + src + '"]');
      if(existing){
        if(existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed: ' + src)));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.dataset.vayuSrc = src;
      s.onload = () => { s.dataset.loaded = '1'; resolve(); };
      s.onerror = () => reject(new Error('Failed: ' + src));
      document.body.appendChild(s);
    });
  }

  async function boot(){
    const page = currentPage();
    const bareGame = isBareGamePage(page);

    injectChrome();
    setActiveNav();
    initDrawer();
    initHardRefresh();

    const loadingEl = document.getElementById('vayu-loading');

    try {
      await loadRoadmapData();
      applyPhaseBindings();

      await loadScript('/js/haptics.js');

      if(!bareGame){
        await loadScript('/animation.js');
        if(window.VayuAnim && typeof window.VayuAnim.boot === 'function'){
          window.VayuAnim.boot();
        }
      }

      if(!bareGame){
        await loadScript('/js/markdown.js');
        await loadScript('/js/outputs.js');
        await loadScript('/js/Live_output.js?v=20260926-livefix3');
        await loadScript('/js/run-animation.js');
        await loadScript('/js/examples.js');
        await loadScript('/js/filemanager.js');
        await loadScript('/js/page-transition.js');
        initExamplesModal();
      }

      if(page === 'home')   await loadScript('/js/github-stats.js');
      if(page === 'github'){
        await loadScript('/js/explorer.js');
        if(window.VayuExplorer) window.VayuExplorer.init('vayu-explorer');
      }

      if(page === 'roadmap') syncRoadmapTimeline();

      if(page === 'games' || page === 'flappybird'){
        await loadScript('/js/game-token.js');
      }
      if(page === 'games')      await loadScript('/js/games.js');
      if(page === 'flappybird') await loadScript('/js/flappybird.js');

      applyPhaseBindings();

      const refresh = () => {
        if(window.VayuAnim && typeof window.VayuAnim.refreshScrollAnim === 'function'){
          window.VayuAnim.refreshScrollAnim();
        }
      };
      refresh();
      setTimeout(refresh, 150);
      setTimeout(refresh, 500);
    } catch(err){
      console.error('[Vayu layout]', err);
    }

    if(loadingEl){
      loadingEl.classList.add('hide');
      setTimeout(() => { if(loadingEl.parentNode) loadingEl.remove(); }, 500);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
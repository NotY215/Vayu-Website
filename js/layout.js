/* ============================================================
   Vayu Layout - top navigation, left hamburger drawer, footer, modals.
   - Top nav: About, Features, GitHub, Developer.
   - Left hamburger drawer: remaining site sections + actions.
   - On Flappybird.html: no chrome at all.
   - Roadmap statuses: completed | working | soon | vacation
   - Page transitions run on every section.
   ============================================================ */
(function(){
  'use strict';

  const ICONS = {
    about:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/info.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    syntax:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/code-xml.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    docs:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/book-open.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    speed:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/gauge.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    vib:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>',
    github:'<img class="nav-brand-icon nav-github-icon" src="https://cdn.simpleicons.org/github/FFFFFF" alt="" width="16" height="16">',
    faq:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/circle-help.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    roadmap:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/map.svg?color=%23c5d9eb" alt="" width="16" height="16">',
    release:'<img class="nav-symbol-icon" src="https://api.iconify.design/lucide/package.svg?color=%23c5d9eb" alt="" width="16" height="16">'
  };
  const NAV_LINKS = [
    { href: '/about/', nav: 'about', label: 'About', icon: ICONS.about },
    { href: '/syntax/', nav: 'syntax', label: 'Syntax', icon: ICONS.syntax },
    { href: '/docs/', nav: 'docs', label: 'Wiki', icon: ICONS.docs },
    { href: '/speed/', nav: 'speed', label: 'Speed', icon: ICONS.speed },
    { href: '/VIB/', nav: 'vib', label: 'VIB', icon: ICONS.vib },
    { href: '/github/', nav: 'github', label: 'GitHub', icon: ICONS.github },
    { href: '/faq/', nav: 'faq', label: 'FAQ', icon: ICONS.faq },
    { href: '/roadmap/', nav: 'roadmap', label: 'Roadmap', icon: ICONS.roadmap },
    { href: '/release', nav: 'release', label: 'Release', icon: ICONS.release }
  ];

  const NAV_HTML = `
    <nav class="vayu-topbar">
      <div class="container nav-inner">
        <button class="nav-hamburger" type="button" data-hamburger aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
        <a class="brand" href="/" data-nav="home" aria-label="Vayu home" title="Vayu Home"><img src="/Vayu_logo.png" alt="Vayu logo" width="39" height="39"><span>VAYU</span></a>
        <div class="navlinks" aria-label="Main navigation">
          ${NAV_LINKS.filter(l => l.nav !== 'home').map(l => '<a href="' + l.href + '" data-nav="' + l.nav + '" aria-label="' + l.label + '" data-tooltip="' + l.label + '" title="' + l.label + '">' + l.icon + '</a>').join('')}
        </div>
        <div class="nav-actions">
          <a class="btn primary nav-download" href="https://github.com/NotY215/Vayu/releases/download/V0.1-Alpha/Vayu-Alpha-Release-V01.zip" data-vayu-download>↓ Download</a>
          <a class="btn primary nav-patreon" href="https://www.patreon.com/cw/Ficzo" target="_blank" rel="noopener">Patreon</a>
        </div>
      </div>
    </nav>
    <style>
      .vayu-topbar{position:sticky;top:0;z-index:1000}
      .nav-inner{gap:clamp(10px,1.1vw,18px)}
      .brand{display:inline-flex;align-items:center;gap:8px;flex-shrink:0}
      .navlinks{display:flex!important;align-items:center;justify-content:center;gap:clamp(7px,1vw,15px);min-width:0;flex:1}
      .navlinks a{position:relative;display:grid;place-items:center;width:32px;height:34px;border-radius:9px;color:#b9cbe0;text-decoration:none;font-size:1.05rem;transition:background .18s ease,color .18s ease,transform .18s ease}
      .navlinks a.active{color:#fff;background:rgba(85,217,255,.16);box-shadow:inset 0 -2px 0 #55d9ff}\n      .navlinks a:hover,.navlinks a:focus-visible{color:#fff;background:rgba(85,217,255,.12);transform:translateY(-1px);outline:none}
      .navlinks a::after{content:attr(data-tooltip);position:absolute;top:calc(100% + 9px);left:50%;transform:translate(-50%,-4px);padding:6px 9px;border:1px solid rgba(160,220,255,.22);border-radius:8px;background:rgba(7,16,31,.97);box-shadow:0 8px 25px rgba(0,0,0,.35);color:#eaf7ff;font:500 12px/1.2 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease}
      .navlinks a:hover::after,.navlinks a:focus-visible::after{opacity:1;transform:translate(-50%,0)}
      .navlinks a[hidden]{display:grid!important}
      .nav-download,.nav-patreon{white-space:nowrap;padding:10px 12px}
      .nav-hamburger{display:none!important;flex:0 0 34px;width:34px;height:34px;border:1px solid rgba(140,205,245,.25);border-radius:9px;background:rgba(255,255,255,.045);align-items:center;justify-content:center;flex-direction:column;gap:4px;color:#dcefff;cursor:pointer}
      .nav-hamburger span{display:block;width:15px;height:1.5px;border-radius:3px;background:currentColor}
      .nav-symbol-icon,.nav-brand-icon{display:block;object-fit:contain;width:16px;height:16px}
      .drawer-link-content{display:flex;align-items:center;gap:12px}\n      .nav-drawer-link .nav-icon img{width:18px;height:18px;object-fit:contain;vertical-align:middle}
      @media(min-width:901px){.navlinks{display:flex!important}.nav-hamburger{display:none!important}.nav-inner{justify-content:space-between}}
      @media(max-width:900px){.nav-hamburger{display:flex!important}.navlinks{display:none!important}.nav-inner{gap:10px}.nav-actions{display:flex;gap:6px;margin-left:auto}.nav-actions .nav-patreon{display:none}.nav-download{padding:8px 10px;font-size:.78rem}}
      @media(max-width:520px){.brand span{display:none}.brand img{width:32px;height:32px}.nav-download{padding:8px 9px;font-size:.72rem}}
      
    </style>
  `;

  const DRAWER_HTML = `
    <div class="nav-drawer-backdrop" data-drawer-backdrop></div>
    <aside class="nav-drawer" role="dialog" aria-modal="true" aria-label="Site navigation" data-drawer>
      <div class="nav-drawer-head">
        <span class="nav-drawer-title">Explore Vayu</span>
        <button class="nav-drawer-close" type="button" aria-label="Close menu" data-drawer-close>✕</button>
      </div>
      <div class="nav-drawer-list">
        ${NAV_LINKS.map(l => '<a class="nav-drawer-link" href="' + l.href + '" data-nav="' + l.nav + '">' +
          '<span class="drawer-link-content"><span class="nav-icon" aria-hidden="true">' + l.icon + '</span><span>' + l.label + '</span></span>' +
          '<span class="nav-drawer-link-arrow">›</span></a>').join('')}
      </div>
      <div class="nav-drawer-actions">
        <a class="btn primary" href="https://github.com/NotY215/Vayu/releases/download/V0.1-Alpha/Vayu-Alpha-Release-V01.zip" data-vayu-download>↓ Download latest Alpha</a>
        <a class="btn ghost" href="https://github.com/NotY215/Vayu" target="_blank" rel="noopener">⌘ Source</a>
        <button class="btn ghost hard-refresh-btn" type="button" data-hard-refresh><span class="hard-refresh-icon">⟳</span><span class="hard-refresh-text">Hard refresh</span></button>
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
            <div class="lfm-title">Examples - Vayu Files</div>
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
            <span><span class="fm-legend-dot"></span>Has recorded output - click to Run</span>
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
      const res = await fetch('https://raw.githubusercontent.com/NotY215/Vayu-Website/main/roadmap.json?_=' + Date.now(), { cache: 'no-store' });
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
    const s = p.status || 'planned';
    if(s === 'completed') return 'COMPLETED';
    if(s === 'working')   return 'WORKING';
    if(s === 'vacation')  return 'VACATION';
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

  function initDownloadModal(){
    if(document.getElementById('vayu-download-modal')) return;
    const root=document.createElement('div');
    root.id='vayu-download-modal';
    root.className='vayu-download-overlay';
    root.hidden=true;
    root.innerHTML='<div class="vayu-download-backdrop" data-download-close></div><section class="vayu-download-dialog" role="dialog" aria-modal="true" aria-labelledby="vayu-download-title"><button type="button" class="vayu-download-x" aria-label="Close" data-download-close>×</button><div class="vayu-download-mark">↓</div><p class="vayu-download-eyebrow">VAYU ALPHA RELEASE</p><h2 id="vayu-download-title">Download Vayu?</h2><p class="vayu-download-copy">You are about to download the Vayu Alpha release ZIP from GitHub.</p><div class="vayu-download-file">Vayu-Alpha-Release-V01.zip</div><div class="vayu-download-actions"><button type="button" class="btn ghost" data-download-close>Cancel</button><a class="btn primary" data-download-confirm href="https://github.com/NotY215/Vayu/releases/download/V0.1-Alpha/Vayu-Alpha-Release-V01.zip">Download ZIP</a></div></section>';
    document.body.appendChild(root);
    const style=document.createElement('style');
    style.textContent='.vayu-download-overlay[hidden]{display:none!important}.vayu-download-overlay{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;padding:22px}.vayu-download-backdrop{position:absolute;inset:0;background:rgba(2,7,16,.76);backdrop-filter:blur(10px)}.vayu-download-dialog{position:relative;width:min(440px,100%);padding:30px;border:1px solid rgba(145,220,255,.25);border-radius:22px;background:linear-gradient(145deg,rgba(20,38,67,.98),rgba(6,14,28,.98));box-shadow:0 35px 100px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.1);color:#f3f8ff;text-align:center}.vayu-download-x{position:absolute;right:13px;top:10px;border:0;background:transparent;color:#a9bfd5;font-size:26px;cursor:pointer}.vayu-download-mark{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 16px;border:1px solid rgba(85,217,255,.35);border-radius:16px;background:rgba(85,217,255,.1);font-size:28px;color:#7de2ff}.vayu-download-eyebrow{font-size:.7rem;letter-spacing:.16em;color:#80dfff;font-weight:800}.vayu-download-dialog h2{margin:8px 0;font-size:1.65rem}.vayu-download-copy{color:#a9bfd5;line-height:1.6;font-size:.9rem}.vayu-download-file{margin:18px 0;padding:12px;border-radius:10px;border:1px solid rgba(180,220,255,.13);background:rgba(255,255,255,.04);font: .8rem monospace;overflow-wrap:anywhere}.vayu-download-actions{display:flex;justify-content:center;gap:10px;margin-top:20px}.vayu-download-actions .btn{text-decoration:none;cursor:pointer}';
    document.head.appendChild(style);

    root.addEventListener('click',e=>{if(e.target.closest('[data-download-close]')) root.hidden=true;});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') root.hidden=true;});
    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-vayu-download]');
      if(!btn) return;
      e.preventDefault();
      root.hidden=false;
      const confirmLink=root.querySelector('[data-download-confirm]');
      confirmLink.focus();
    },true);
  }

  /* ---------- helpers ---------- */
  function phaseClass(p){
    const s = p.status || 'planned';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'active';
    if(s === 'vacation')  return 'vacation';
    return 'planned';
  }
  function markerClass(p){
    const s = p.status || 'planned';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'active';
    if(s === 'vacation')  return 'vacation';
    return 'planned';
  }
  function markerInner(p){
    const s = p.status || 'planned';
    if(s === 'completed') return '✓';
    if(s === 'working')   return '<span class="dev-dot"></span>';
    if(s === 'vacation')  return 'Ⅱ';
    return '';
  }
  function statusClass(p){
    const s = p.status || 'planned';
    if(s === 'completed') return 'done';
    if(s === 'working')   return 'dev';
    if(s === 'vacation')  return 'vacation';
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
    if(status === 'vacation')  return 'vacation';
    return 'planned';
  }

  function buildRoadmapTimeline(){
    const timeline = document.querySelector('.timeline, [data-timeline]');
    if(!timeline || !ROADMAP_DATA || !Array.isArray(ROADMAP_DATA.phases)) return;

    const phases = ROADMAP_DATA.phases;

    function renderSubphases(subs, open=false){
      if(!Array.isArray(subs) || !subs.length) return '';
      let html = '<div class="phase-subphases" data-subphases' + (open ? '' : ' hidden') + '><div class="phase-subphases-inner">';
      subs.forEach(sp => {
        const spStatus = sp.status || 'completed';
        html += '<div class="phase-subphase" data-sub-status="' + escapeHtml(spStatus) + '" id="roadmap-' + escapeHtml(sp.id) + '">' +
                  '<span class="phase-subphase-id">' + escapeHtml(sp.id) + '</span>' +
                  '<span class="phase-subphase-dot ' + subDotClass(spStatus) + '"></span>' +
                  '<span class="phase-subphase-copy"><span class="phase-subphase-name">' + escapeHtml(sp.name) + '</span>' +
                    '<span class="phase-subphase-status status-' + escapeHtml(spStatus) + '">' + escapeHtml(String(spStatus).toUpperCase()) + '</span>' +
                    (sp.description ? '<span class="phase-subphase-description">' + escapeHtml(sp.description) + '</span>' : '') +
                  '</span>' +
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
      if(hasSubs) html += renderSubphases(rp.subphases, open);
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
    document.querySelectorAll('.navlinks a[data-nav]').forEach(a => {
      const active = a.dataset.nav === page;
      a.hidden = false;
      a.classList.toggle('active', active);
      if(active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.nav-drawer-link[data-nav]').forEach(a => {
      const active = a.dataset.nav === page;
      a.classList.toggle('active', active);
      if(active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
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
    initDownloadModal();

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
        await loadScript('/js/mermaid.js');
        await loadScript('/js/outputs.js');
        await loadScript('/js/Live_output.js?v=20260926-livefix3');
        await loadScript('/js/run-animation.js');
        await loadScript('/js/examples.js');
        await loadScript('/js/filemanager.js');
        await loadScript('/js/page-transition.js');
        await loadScript('/js/glass-ui.js');
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
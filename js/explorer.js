/* ============================================================
   Vayu Explorer — Windows-style file manager for /github
   - .md files render with images + relative links fixed
   ============================================================ */
(function(){
  'use strict';

  const REPO = 'NotY215/Vayu';
  const API  = 'https://api.github.com/repos/' + REPO + '/contents/';
  const RAW  = 'https://raw.githubusercontent.com/' + REPO + '/master/';

  const IMAGE_EXT = ['png','jpg','jpeg','gif','svg','webp','ico','bmp','avif'];
  const BINARY_EXT = ['exe','dll','so','dylib','zip','tar','gz','7z','rar','pdf','woff','woff2','ttf','otf','eot','mp3','mp4','mov','avi','webm','wav','ogg','db','bin','class','jar','wasm'];

  const dirCache  = new Map();
  const fileCache = new Map();

  let currentPath = '';
  let history = [''];
  let historyIndex = 0;
  let els = {};
  let fullViewEl = null;
  let lastItems = [];
  let searchQuery = '';

  function init(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;

    root.innerHTML = `
      <div class="exp-shell">
        <div class="exp-toolbar">
          <div class="exp-nav">
            <button class="exp-nav-btn" data-nav="back" title="Back" type="button">←</button>
            <button class="exp-nav-btn" data-nav="forward" title="Forward" type="button">→</button>
            <button class="exp-nav-btn" data-nav="up" title="Up" type="button">↑</button>
            <button class="exp-nav-btn" data-nav="refresh" title="Refresh" type="button">⟳</button>
          </div>
          <div class="exp-address" data-address></div>
          <div class="exp-search" data-search-wrap>
            <span class="exp-search-icon">⌕</span>
            <input type="text" data-search placeholder="Search files…" autocomplete="off" spellcheck="false" />
            <button class="exp-search-clear" type="button" data-search-clear aria-label="Clear search">✕</button>
          </div>
        </div>
        <div class="fm-legend">
          <span><span class="fm-legend-dot"></span>Has recorded output — click to Run</span>
          <span class="fm-legend-sep">·</span>
          <span data-search-status>Ready</span>
        </div>
        <div class="exp-body">
          <aside class="exp-sidebar" data-sidebar></aside>
          <main class="exp-main">
            <div class="exp-grid" data-grid></div>
          </main>
          <aside class="exp-preview" data-preview>
            <div class="exp-preview-empty">
              <div class="exp-preview-empty-icon">📄</div>
              <div>Select a file</div>
              <div class="exp-preview-empty-sub">to preview its contents</div>
            </div>
          </aside>
        </div>
        <div class="exp-status"><span data-status-text>Loading…</span></div>
      </div>
    `;

    els = {
      root,
      sidebar:       root.querySelector('[data-sidebar]'),
      grid:          root.querySelector('[data-grid]'),
      address:       root.querySelector('[data-address]'),
      status:        root.querySelector('[data-status-text]'),
      preview:       root.querySelector('[data-preview]'),
      searchEl:      root.querySelector('[data-search]'),
      searchClearEl: root.querySelector('[data-search-clear]'),
      searchWrapEl:  root.querySelector('[data-search-wrap]'),
      searchStatus:  root.querySelector('[data-search-status]')
    };

    root.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.nav;
        if(a === 'back')         goBack();
        else if(a === 'forward') goForward();
        else if(a === 'up')      goUp();
        else if(a === 'refresh'){ dirCache.delete(currentPath); loadDir(currentPath, false); }
      });
    });

    initSearch();
    renderSidebar();
    loadDir('', true);
  }

  /* ============================================================
     SEARCH
     ============================================================ */
  function initSearch(){
    if(!els.searchEl) return;

    els.searchEl.addEventListener('input', () => {
      searchQuery = els.searchEl.value.trim().toLowerCase();
      els.searchWrapEl.classList.toggle('has-value', searchQuery.length > 0);
      renderGrid(lastItems);
    });

    els.searchEl.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){ e.preventDefault(); clearSearch(); els.searchEl.blur(); }
    });

    if(els.searchClearEl){
      els.searchClearEl.addEventListener('click', () => { clearSearch(); els.searchEl.focus(); });
    }

    els.root.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if(tag === 'input' || tag === 'textarea') return;
      if(e.key === '/'){
        e.preventDefault();
        els.searchEl.focus();
        els.searchEl.select();
      }
    });
  }

  function clearSearch(){
    els.searchEl.value = '';
    searchQuery = '';
    els.searchWrapEl.classList.remove('has-value');
    renderGrid(lastItems);
  }

  function renderSidebar(){
    const shortcuts = [
      { path: '',                  label: 'Vayu',      icon: '📦' },
      { path: 'examples',          label: 'Examples',  icon: '📁' },
      { path: 'examples/programs', label: 'Programs',  icon: '📂' },
      { path: 'docs',              label: 'Docs',      icon: '📚' },
      { path: 'src',               label: 'Source',    icon: '⚙️' }
    ];
    els.sidebar.innerHTML =
      '<div class="exp-sidebar-title">Quick access</div>' +
      '<div class="exp-sidebar-list">' +
        shortcuts.map(s =>
          '<button class="exp-sidebar-item" data-path="' + s.path + '" type="button">' +
            '<span class="exp-sidebar-icon">' + s.icon + '</span>' +
            '<span class="exp-sidebar-label">' + s.label + '</span>' +
          '</button>'
        ).join('') +
      '</div>';

    els.sidebar.querySelectorAll('[data-path]').forEach(item => {
      item.addEventListener('click', () => loadDir(item.dataset.path, true));
    });
  }

  async function ghList(path){
    if(dirCache.has(path)) return dirCache.get(path);
    const url = API + (path ? encodeURI(path) : '');
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
    if(!res.ok) throw new Error('GitHub API ' + res.status);
    const data = await res.json();
    const items = (Array.isArray(data) ? data : [])
      .filter(it => it.type === 'file' || it.type === 'dir')
      .sort((a, b) => {
        if(a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    dirCache.set(path, items);
    return items;
  }

  async function loadDir(path, addHistory){
    currentPath = path;
    renderAddress();
    els.grid.innerHTML = '<div class="exp-loading">Loading…</div>';
    els.status.textContent = 'Loading…';

    try {
      const items = await ghList(path);
      lastItems = items;
      renderGrid(items);
      const folders = items.filter(i => i.type === 'dir').length;
      const files   = items.filter(i => i.type === 'file').length;
      const withOutput = items.filter(i => i.type === 'file' && hasOutput(i.name)).length;
      els.status.textContent = items.length + ' items · ' + folders + ' folders · ' +
        files + ' files' + (withOutput ? ' · ' + withOutput + ' with output' : '');

      if(addHistory){
        history = history.slice(0, historyIndex + 1);
        history.push(path);
        historyIndex = history.length - 1;
      }
      updateNavButtons();
    } catch(err){
      els.grid.innerHTML =
        '<div class="exp-loading exp-error">Couldn’t load folder. ' +
        '<a href="https://github.com/' + REPO + '/tree/master/' + path +
        '" target="_blank" rel="noopener">View on GitHub ↗</a></div>';
      els.status.textContent = 'Error';
    }
  }

  function renderAddress(){
    const parts = currentPath ? currentPath.split('/') : [];
    let html = '<span class="exp-address-icon">📁</span>' +
               '<span class="exp-crumb" data-path="">Vayu</span>';
    let acc = '';
    parts.forEach(p => {
      acc = acc ? acc + '/' + p : p;
      html += '<span class="exp-address-sep">›</span>' +
              '<span class="exp-crumb" data-path="' + acc + '">' + p + '</span>';
    });
    els.address.innerHTML = html;
    els.address.querySelectorAll('[data-path]').forEach(el => {
      el.addEventListener('click', () => loadDir(el.dataset.path, true));
    });
  }

  function hasOutput(name){
    return !!(window.VayuOutputs &&
              Object.prototype.hasOwnProperty.call(window.VayuOutputs, name));
  }

  function renderGrid(items){
    const q = searchQuery;
    const filtered = q ? items.filter(it => it.name.toLowerCase().includes(q)) : items;

    if(els.searchStatus){
      if(q){
        els.searchStatus.textContent = filtered.length + ' match' +
          (filtered.length === 1 ? '' : 'es') + ' for “' + els.searchEl.value.trim() + '”';
      } else {
        els.searchStatus.textContent = 'Ready';
      }
    }

    if(!filtered.length){
      if(q){
        els.grid.innerHTML =
          '<div class="exp-loading">No files match <strong>' +
          escapeHtml(els.searchEl.value.trim()) + '</strong></div>';
      } else {
        els.grid.innerHTML = '<div class="exp-loading">This folder is empty</div>';
      }
      return;
    }

    let html = '';
    for(const it of filtered){
      const glowing = it.type === 'file' && hasOutput(it.name);
      html +=
        '<button class="exp-tile' + (glowing ? ' has-output' : '') + '" type="button" data-type="' + it.type +
        '" data-path="' + it.path.replace(/"/g, '&quot;') +
        '" data-name="' + it.name.replace(/"/g, '&quot;') + '">' +
          '<div class="exp-tile-icon">' + fileIcon(it.name, it.type === 'dir') + '</div>' +
          '<div class="exp-tile-name">' + escapeHtml(it.name) + '</div>' +
          (it.type === 'file' ? '<div class="exp-tile-hint">dbl-click</div>' : '') +
        '</button>';
    }
    els.grid.innerHTML = html;

    els.grid.querySelectorAll('.exp-tile').forEach(tile => {
      const type = tile.dataset.type;
      const path = tile.dataset.path;
      const name = tile.dataset.name;

      tile.addEventListener('click', () => {
        els.grid.querySelectorAll('.exp-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', tile);
        if(type === 'dir') loadDir(path, true);
        else selectFile(path, name);
      });

      tile.addEventListener('dblclick', () => {
        if(type === 'file') openFullView(path, name);
      });
    });
  }

  function extOf(name){ return (name.split('.').pop() || '').toLowerCase(); }
  function isImage(name){ return IMAGE_EXT.indexOf(extOf(name)) !== -1; }
  function isBinary(name){ return BINARY_EXT.indexOf(extOf(name)) !== -1; }
  function isMarkdown(name){ return /\.(md|markdown)$/i.test(name); }
  function isVayu(name){ return /\.(vyu|vy)$/i.test(name); }

  function fileIcon(name, isDir){
    if(isDir) return '📁';
    const ext = extOf(name);
    const map = {
      vyu: '📄', vy: '📄',
      md: '📝', markdown: '📝', txt: '📋',
      json: '🔧', toml: '⚙️', yml: '⚙️', yaml: '⚙️',
      py: '🐍',
      ps1: '📜', sh: '📜', bat: '📜',
      c: '📐', cpp: '📐', h: '📐', hpp: '📐',
      png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️', ico: '🖼️', webp: '🖼️', bmp: '🖼️', avif: '🖼️',
      pdf: '📕', zip: '🗜️', tar: '🗜️', gz: '🗜️', '7z': '🗜️', rar: '🗜️',
      exe: '⚙️', dll: '⚙️', so: '⚙️', dylib: '⚙️',
      woff: '🔤', woff2: '🔤', ttf: '🔤', otf: '🔤',
      mp3: '🎵', wav: '🎵', ogg: '🎵',
      mp4: '🎬', mov: '🎬', avi: '🎬', webm: '🎬'
    };
    return map[ext] || '📄';
  }

  function triggerRun(name, sourceCode){
    if(window.VayuRun && typeof window.VayuRun.run === 'function'){
      if(window.VayuHaptics) window.VayuHaptics.fire('game');
      window.VayuRun.run(name, sourceCode);
    } else {
      console.warn('[Vayu Explorer] VayuRun module not loaded');
    }
  }

  /* ============================================================
     PREVIEW
     ============================================================ */
  async function selectFile(path, name){
    if(isImage(name)){ renderImagePreview(path, name, RAW + path); return; }
    if(isBinary(name)){ renderBinaryPreview(name); return; }

    els.preview.innerHTML =
      '<div class="exp-preview-empty">' +
        '<div class="exp-preview-empty-icon">⏳</div>' +
        '<div>Loading…</div>' +
      '</div>';

    try {
      const text = await fetchFileText(path);
      if(isProbablyBinary(text)){ renderBinaryPreview(name); return; }
      await renderTextPreview(path, name, text);
    } catch(err){
      els.preview.innerHTML =
        '<div class="exp-preview-empty exp-error">Couldn’t load file</div>';
    }
  }

  function renderImagePreview(path, name, url){
    els.preview.innerHTML =
      '<div class="exp-preview-head">' +
        '<div class="exp-preview-name" title="' + path + '">' + name + '</div>' +
        '<div class="exp-preview-actions">' +
          '<button class="exp-action-btn" data-action="download" type="button" title="Download">↓</button>' +
          '<button class="exp-action-btn" data-action="full" type="button" title="Full view">⛶</button>' +
        '</div>' +
      '</div>' +
      '<div class="exp-preview-image-wrap">' +
        '<img class="exp-preview-image" src="' + url + '" alt="' + name + '" ' +
        'onerror="this.parentNode.innerHTML=\'<div style=&quot;color:#ff8a94;font-size:.85rem&quot;>Couldn’t load image</div>\'">' +
      '</div>' +
      '<div class="exp-preview-foot">Image · double-click tile for full view</div>';

    els.preview.querySelector('[data-action="download"]').addEventListener('click', (e) => {
      triggerDownload(url, name, e.currentTarget);
    });
    els.preview.querySelector('[data-action="full"]').addEventListener('click', () => {
      openFullView(path, name);
    });
  }

  function renderBinaryPreview(name){
    els.preview.innerHTML =
      '<div class="exp-preview-head">' +
        '<div class="exp-preview-name">' + name + '</div>' +
      '</div>' +
      '<div class="exp-preview-binary">' +
        '<div class="exp-preview-binary-icon">' + fileIcon(name, false) + '</div>' +
        '<div>Binary file</div>' +
        '<div style="font-size:.75rem;opacity:.7">Preview not available</div>' +
      '</div>' +
      '<div class="exp-preview-foot">' + extOf(name).toUpperCase() + ' · binary</div>';
  }

  async function renderTextPreview(path, name, text){
    const lines = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ').split('\n');
    const isMd  = isMarkdown(name);
    const isVyu = isVayu(name);
    const outputReady = isVyu && hasOutput(name);

    let bodyHtml;
    if(isMd && window.VayuMarkdown){
      // Pass path so relative images/links resolve correctly
      const rendered = await window.VayuMarkdown.render(text, path);
      bodyHtml = '<div class="exp-preview-body md-body"><div class="md-rendered">' + rendered + '</div></div>';
    } else {
      let codeHtml = '';
      for(let i = 0; i < lines.length; i++){
        codeHtml += '<span class="cl">' + highlightLine(lines[i]) + '</span>';
      }
      bodyHtml = '<div class="exp-preview-body"><pre><code>' + codeHtml + '</code></pre></div>';
    }

    els.preview.innerHTML =
      '<div class="exp-preview-head">' +
        '<div class="exp-preview-name" title="' + path + '">' + name + '</div>' +
        '<div class="exp-preview-actions">' +
          (isVyu ? '<button class="lfm-run-btn" data-action="run" type="button">▶ Run</button>' : '') +
          (isMd  ? '<button class="exp-action-btn" data-action="source" type="button" title="Toggle source">◐</button>' : '') +
          '<button class="exp-action-btn" data-action="copy" type="button" title="Copy">📋</button>' +
          '<button class="exp-action-btn" data-action="download" type="button" title="Download">↓</button>' +
          '<button class="exp-action-btn" data-action="full" type="button" title="Full view">⛶</button>' +
        '</div>' +
      '</div>' +
      bodyHtml +
      '<div class="exp-preview-foot">' + lines.length + ' lines · ' +
        (text.length / 1024).toFixed(1) + ' KB' +
        (isMd ? ' · Markdown' : '') +
        (isVyu && !outputReady ? ' · no recorded output' : '') +
        (isVyu && outputReady ? ' · output ready' : '') +
        ' · dbl-click for full view</div>';

    els.preview.querySelector('[data-action="copy"]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(text); btn.textContent = '✓'; }
      catch(_) { btn.textContent = '✕'; }
      if(window.VayuHaptics) window.VayuHaptics.fire('tap', btn);
      setTimeout(() => { btn.textContent = '📋'; }, 1200);
    });
    els.preview.querySelector('[data-action="download"]').addEventListener('click', (e) => {
      downloadText(text, name, e.currentTarget);
    });
    els.preview.querySelector('[data-action="full"]').addEventListener('click', () => {
      openFullView(path, name);
    });

    const runBtn = els.preview.querySelector('[data-action="run"]');
    if(runBtn) runBtn.addEventListener('click', () => triggerRun(name, text));

    const srcBtn = els.preview.querySelector('[data-action="source"]');
    if(srcBtn){
      let rendered = true;
      const bodyEl = els.preview.querySelector('.exp-preview-body');
      srcBtn.addEventListener('click', async () => {
        rendered = !rendered;
        if(rendered){
          const html = await window.VayuMarkdown.render(text, path);
          bodyEl.className = 'exp-preview-body md-body';
          bodyEl.innerHTML = '<div class="md-rendered">' + html + '</div>';
          srcBtn.title = 'Show source';
        } else {
          let codeHtml = '';
          for(let i = 0; i < lines.length; i++){
            codeHtml += '<span class="cl">' + highlightLine(lines[i]) + '</span>';
          }
          bodyEl.className = 'exp-preview-body';
          bodyEl.innerHTML = '<pre><code>' + codeHtml + '</code></pre>';
          srcBtn.title = 'Show rendered';
        }
      });
    }
  }

  /* ============================================================
     FULL VIEW
     ============================================================ */
  async function openFullView(path, name){
    closeFullView();
    const isMd  = isMarkdown(name);
    const isImg = isImage(name);
    const isBin = isBinary(name);
    const isVyu = isVayu(name);

    fullViewEl = document.createElement('div');
    fullViewEl.className = 'vayu-fullview';
    fullViewEl.innerHTML =
      '<div class="vayu-fullview-head">' +
        '<div>' +
          '<span class="vayu-fullview-title">' + path + '</span>' +
          '<span class="vayu-fullview-sub" data-sub>loading…</span>' +
        '</div>' +
        '<div class="vayu-fullview-actions">' +
          (isVyu ? '<button class="vayu-fullview-btn" data-action="run" type="button" style="border-color:rgba(99,230,160,0.45);background:rgba(99,230,160,0.1);color:#b7f7d0">▶ Run</button>' : '') +
          (isMd  ? '<button class="vayu-fullview-btn" data-action="source" type="button">◐ Source</button>' : '') +
          '<button class="vayu-fullview-btn" data-action="copy" type="button">📋 Copy</button>' +
          '<button class="vayu-fullview-btn" data-action="download" type="button">↓ Download</button>' +
          '<button class="vayu-fullview-btn close" data-action="close" type="button">✕ Close</button>' +
        '</div>' +
      '</div>' +
      '<div class="vayu-fullview-body" data-body>' +
        '<div class="vayu-fullview-binary"><div>Loading…</div></div>' +
      '</div>';
    document.body.appendChild(fullViewEl);
    document.body.style.overflow = 'hidden';

    const bodyEl  = fullViewEl.querySelector('[data-body]');
    const subEl   = fullViewEl.querySelector('[data-sub]');
    const copyBtn = fullViewEl.querySelector('[data-action="copy"]');
    const dlBtn   = fullViewEl.querySelector('[data-action="download"]');
    const srcBtn  = fullViewEl.querySelector('[data-action="source"]');
    const runBtn  = fullViewEl.querySelector('[data-action="run"]');

    fullViewEl.querySelector('[data-action="close"]').addEventListener('click', closeFullView);
    fullViewEl.addEventListener('click', (e) => {
      if(e.target === fullViewEl || e.target === bodyEl) closeFullView();
    });
    const onKey = (e) => { if(e.key === 'Escape'){ closeFullView(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);

    if(isImg || isBin) copyBtn.style.display = 'none';

    if(isImg){
      const url = RAW + path;
      subEl.textContent = 'image · ' + extOf(name).toUpperCase();
      bodyEl.innerHTML =
        '<div class="vayu-fullview-image-wrap">' +
          '<img class="vayu-fullview-image" src="' + url + '" alt="' + name + '" ' +
          'onerror="this.parentNode.innerHTML=\'<div class=&quot;vayu-fullview-binary&quot;>Couldn’t load image</div>\'">' +
        '</div>';
      dlBtn.addEventListener('click', (e) => triggerDownload(url, name, e.currentTarget));
      return;
    }

    if(isBin){
      subEl.textContent = 'binary · ' + extOf(name).toUpperCase();
      bodyEl.innerHTML =
        '<div class="vayu-fullview-binary">' +
          '<div class="vayu-fullview-binary-icon">' + fileIcon(name, false) + '</div>' +
          '<div>Binary file — preview not available</div>' +
          '<div style="font-size:.78rem;opacity:.7">Download it to inspect</div>' +
        '</div>';
      dlBtn.addEventListener('click', (e) => triggerDownload(RAW + path, name, e.currentTarget));
      return;
    }

    try {
      const text = await fetchFileText(path);

      if(isProbablyBinary(text)){
        subEl.textContent = 'binary';
        copyBtn.style.display = 'none';
        if(srcBtn) srcBtn.style.display = 'none';
        if(runBtn) runBtn.style.display = 'none';
        bodyEl.innerHTML =
          '<div class="vayu-fullview-binary">' +
            '<div class="vayu-fullview-binary-icon">' + fileIcon(name, false) + '</div>' +
            '<div>Binary file — preview not available</div>' +
          '</div>';
        dlBtn.addEventListener('click', (e) => downloadText(text, name, e.currentTarget));
        return;
      }

      const lines = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ').split('\n');

      async function showRendered(){
        // Pass path so relative images/links resolve correctly
        const html = await window.VayuMarkdown.render(text, path);
        subEl.textContent = lines.length + ' lines · ' + (text.length / 1024).toFixed(1) + ' KB · Markdown';
        bodyEl.innerHTML = '<div class="md-fullview"><div class="md-rendered">' + html + '</div></div>';
      }
      function showSource(){
        let h = '';
        for(let i = 0; i < lines.length; i++) h += '<span class="cl">' + highlightLine(lines[i]) + '</span>';
        subEl.textContent = lines.length + ' lines · ' + (text.length / 1024).toFixed(1) + ' KB';
        bodyEl.innerHTML = '<pre><code>' + h + '</code></pre>';
      }

      if(isMd){
        await showRendered();
        if(srcBtn){
          let rendered = true;
          srcBtn.addEventListener('click', () => {
            rendered = !rendered;
            if(rendered){ showRendered(); srcBtn.textContent = '◐ Source'; }
            else { showSource(); srcBtn.textContent = '◐ Rendered'; }
          });
        }
      } else {
        showSource();
      }

      copyBtn.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        try { await navigator.clipboard.writeText(text); btn.textContent = '✓ Copied'; }
        catch(_) { btn.textContent = '✕ Failed'; }
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', btn);
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 1400);
      });
      dlBtn.addEventListener('click', (e) => downloadText(text, name, e.currentTarget));

      if(runBtn){
        runBtn.addEventListener('click', () => {
          closeFullView();
          triggerRun(name, text);
        });
      }
    } catch(err){
      subEl.textContent = 'error';
      copyBtn.style.display = 'none';
      if(srcBtn) srcBtn.style.display = 'none';
      if(runBtn) runBtn.style.display = 'none';
      bodyEl.innerHTML =
        '<div class="vayu-fullview-binary"><div>Couldn’t load file</div></div>';
    }
  }

  function closeFullView(){
    if(fullViewEl && fullViewEl.parentNode) fullViewEl.parentNode.removeChild(fullViewEl);
    fullViewEl = null;
    document.body.style.overflow = '';
  }

  async function fetchFileText(path){
    if(fileCache.has(path)) return fileCache.get(path);
    const res = await fetch(RAW + path);
    if(!res.ok) throw new Error('Fetch ' + res.status);
    const text = await res.text();
    fileCache.set(path, text);
    return text;
  }

  function isProbablyBinary(text){
    const sample = text.slice(0, 4096);
    for(let i = 0; i < sample.length; i++){
      if(sample.charCodeAt(i) === 0) return true;
    }
    let nonPrintable = 0;
    for(let i = 0; i < sample.length; i++){
      const c = sample.charCodeAt(i);
      if(c < 9 || (c > 13 && c < 32)) nonPrintable++;
    }
    return nonPrintable / sample.length > 0.1;
  }

  function downloadText(text, name, btn){
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, name, btn);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch(_) {
      if(btn){ btn.textContent = '✕'; setTimeout(() => { btn.textContent = '↓'; }, 1200); }
    }
  }

  function triggerDownload(url, name, btn){
    try {
      const a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      if(btn){
        const old = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = old; }, 1200);
      }
    } catch(_) {}
  }

  function escapeHtml(s){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  const HL_RE =
    /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|class|struct|return|if|elif|else|while|for|in|import|from|as|try|except|finally|raise|lambda|break|continue|and|or|not|true|false|True|False|None|self|super|print|input|read_line|read_int|read_all|int|str|float|bool|ord|chr)\b|\b(\d+(?:\.\d+)?)\b/g;

  function highlightLine(line){
    return escapeHtml(line).replace(HL_RE, (m, com, str, kw, num) => {
      if(com) return '<span class="com">' + com + '</span>';
      if(str) return '<span class="str">' + str + '</span>';
      if(kw)  return '<span class="kw">'  + kw  + '</span>';
      if(num) return '<span class="num">' + num + '</span>';
      return m;
    });
  }

  function goBack(){
    if(historyIndex > 0){ historyIndex--; loadDir(history[historyIndex], false); updateNavButtons(); }
  }
  function goForward(){
    if(historyIndex < history.length - 1){ historyIndex++; loadDir(history[historyIndex], false); updateNavButtons(); }
  }
  function goUp(){
    if(!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDir(parts.join('/'), true);
  }
  function updateNavButtons(){
    const back    = els.root.querySelector('[data-nav="back"]');
    const forward = els.root.querySelector('[data-nav="forward"]');
    const up      = els.root.querySelector('[data-nav="up"]');
    if(back)    back.disabled    = historyIndex <= 0;
    if(forward) forward.disabled = historyIndex >= history.length - 1;
    if(up)      up.disabled      = !currentPath;
  }

  window.VayuExplorer = { init, openFullView, closeFullView };
})();
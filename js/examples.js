/* ============================================================
   Vayu Examples — Linux file manager
   - .md files render as HTML (with source toggle)
   - .vyu files with a recorded output get a green glow
   - Live search box filters the current folder
   ============================================================ */
(function(){
  'use strict';

  const REPO = 'NotY215/Vayu';
  const API  = 'https://api.github.com/repos/' + REPO + '/contents/';
  const RAW  = 'https://raw.githubusercontent.com/' + REPO + '/master/';

  const dirCache  = new Map();
  const fileCache = new Map();

  let root, sidebarEl, listEl, crumbEl, previewEl, statusEl;
  let searchEl, searchClearEl, searchWrapEl, searchStatusEl;
  let currentPath = 'examples';
  let history = ['examples'];
  let historyIndex = 0;
  let lastItems = [];
  let searchQuery = '';

  function init(){
    const modal = document.getElementById('examplesModal');
    if(!modal) return;
    root = modal.querySelector('[data-lfm-root]');
    if(!root) return;

    sidebarEl      = root.querySelector('[data-sidebar]');
    listEl         = root.querySelector('[data-list]');
    crumbEl        = root.querySelector('[data-breadcrumb]');
    previewEl      = root.querySelector('[data-preview]');
    statusEl       = root.querySelector('[data-status-text]');
    searchEl       = root.querySelector('[data-search]');
    searchClearEl  = root.querySelector('[data-search-clear]');
    searchWrapEl   = root.querySelector('[data-search-wrap]');
    searchStatusEl = root.querySelector('[data-search-status]');

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
    loadDir('examples', true);
  }

  /* ============================================================
     SEARCH
     ============================================================ */
  function initSearch(){
    if(!searchEl) return;

    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim().toLowerCase();
      searchWrapEl.classList.toggle('has-value', searchQuery.length > 0);
      renderList(lastItems);
    });

    searchEl.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        e.preventDefault();
        clearSearch();
        searchEl.blur();
      }
    });

    if(searchClearEl){
      searchClearEl.addEventListener('click', () => {
        clearSearch();
        searchEl.focus();
      });
    }

    // '/' focuses the search box (unless typing in another input)
    root.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if(tag === 'input' || tag === 'textarea') return;
      if(e.key === '/'){
        e.preventDefault();
        searchEl.focus();
        searchEl.select();
      }
    });
  }

  function clearSearch(){
    searchEl.value = '';
    searchQuery = '';
    searchWrapEl.classList.remove('has-value');
    renderList(lastItems);
  }

  /* ============================================================
     SIDEBAR
     ============================================================ */
  function renderSidebar(){
    const places = [
      { path: 'examples',           label: 'Examples',    icon: '🏠' },
      { path: 'examples/modules',   label: 'Modules',     icon: '📦' },
      { path: 'examples/programs',  label: 'Programs',    icon: '🗂️' }
    ];
    sidebarEl.innerHTML =
      '<div class="lfm-side-title">Places</div>' +
      places.map(p =>
        '<button class="lfm-side-item" data-path="' + p.path + '" type="button">' +
          '<span class="lfm-side-icon">' + p.icon + '</span>' +
          '<span class="lfm-side-label">' + p.label + '</span>' +
        '</button>'
      ).join('') +
      '<div class="lfm-side-title lfm-side-sep">Devices</div>' +
      '<button class="lfm-side-item" data-path="root" type="button">' +
        '<span class="lfm-side-icon">💾</span>' +
        '<span class="lfm-side-label">Vayu repo</span>' +
      '</button>';

    sidebarEl.querySelectorAll('[data-path]').forEach(item => {
      item.addEventListener('click', () => {
        const p = item.dataset.path;
        loadDir(p === 'root' ? '' : p, true);
      });
    });
  }

  /* ============================================================
     FETCH
     ============================================================ */
  async function ghList(path){
    if(dirCache.has(path)) return dirCache.get(path);
    const url = API + (path ? encodeURI(path) : '');
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
    if(!res.ok) throw new Error('GitHub API ' + res.status);
    const data = await res.json();
    const items = (Array.isArray(data) ? data : [])
      .filter(it => {
        if(it.type !== 'file' && it.type !== 'dir') return false;
        if(it.type === 'dir' && it.name.toLowerCase() === 'bench') return false;
        if(it.name.toLowerCase().endsWith('.ps1')) return false;
        return true;
      })
      .sort((a, b) => {
        if(a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    dirCache.set(path, items);
    return items;
  }

  /* ============================================================
     LOAD DIR
     ============================================================ */
  async function loadDir(path, addHistory){
    currentPath = path;
    renderBreadcrumb();
    listEl.innerHTML = '<div class="lfm-loading">Loading…</div>';
    statusEl.textContent = 'Loading…';

    try {
      const items = await ghList(path);
      lastItems = items;
      renderList(items);
      const folders = items.filter(i => i.type === 'dir').length;
      const files   = items.filter(i => i.type === 'file').length;
      const withOutput = items.filter(i => i.type === 'file' && hasOutput(i.name)).length;
      statusEl.textContent = items.length + ' items · ' + folders + ' folders · ' +
        files + ' files' + (withOutput ? ' · ' + withOutput + ' with output' : '');

      if(addHistory){
        history = history.slice(0, historyIndex + 1);
        history.push(path);
        historyIndex = history.length - 1;
      }
      updateNavButtons();
    } catch(err){
      listEl.innerHTML =
        '<div class="lfm-loading lfm-error">Couldn’t load folder. ' +
        '<a href="https://github.com/' + REPO + '/tree/master/' + path +
        '" target="_blank" rel="noopener">View on GitHub ↗</a></div>';
      statusEl.textContent = 'Error';
    }
  }

  function renderBreadcrumb(){
    const parts = currentPath ? currentPath.split('/') : [];
    let html = '<span class="lfm-crumb" data-path="">Vayu</span>';
    let acc = '';
    parts.forEach(p => {
      acc = acc ? acc + '/' + p : p;
      html += '<span class="lfm-crumb-sep">/</span>' +
              '<span class="lfm-crumb" data-path="' + acc + '">' + p + '</span>';
    });
    crumbEl.innerHTML = html;
    crumbEl.querySelectorAll('[data-path]').forEach(el => {
      el.addEventListener('click', () => loadDir(el.dataset.path, true));
    });
  }

  function isLive(name){
    return !!(window.VayuLiveOutputs && typeof window.VayuLiveOutputs.has === 'function' && window.VayuLiveOutputs.has(name));
  }

  function hasOutput(name){
    return isLive(name) || !!(window.VayuOutputs &&
              Object.prototype.hasOwnProperty.call(window.VayuOutputs, name));
  }

  /* ============================================================
     RENDER LIST
     ============================================================ */
  function renderList(items){
    const q = searchQuery;
    const filtered = q
      ? items.filter(it => it.name.toLowerCase().includes(q))
      : items;

    if(searchStatusEl){
      if(q){
        searchStatusEl.textContent = filtered.length + ' match' +
          (filtered.length === 1 ? '' : 'es') + ' for “' + searchEl.value.trim() + '”';
      } else {
        searchStatusEl.textContent = 'Ready';
      }
    }

    if(!filtered.length){
      if(q){
        listEl.innerHTML =
          '<div class="lfm-no-match">No files match <strong>' +
          escapeHtml(searchEl.value.trim()) + '</strong></div>';
      } else {
        listEl.innerHTML = '<div class="lfm-loading">This folder is empty</div>';
      }
      return;
    }

    let html = '';
    for(const it of filtered){
      const size = it.size ? formatSize(it.size) : (it.type === 'dir' ? '—' : '—');
      const type = it.type === 'dir' ? 'Folder' : typeLabel(it.name);
      const glowing = it.type === 'file' && hasOutput(it.name);
      html +=
        '<div class="lfm-row' + (glowing ? ' has-output' : '') + '" data-type="' + it.type +
        '" data-path="' + it.path.replace(/"/g, '&quot;') +
        '" data-name="' + it.name.replace(/"/g, '&quot;') +
        '" data-size="' + (it.size || 0) + '">' +
          '<div class="lfm-cell lfm-cell-icon">' + fileIcon(it.name, it.type === 'dir') + '</div>' +
          '<div class="lfm-cell lfm-cell-name">' + escapeHtml(it.name) + '</div>' +
          '<div class="lfm-cell lfm-cell-size">' + size + '</div>' +
          '<div class="lfm-cell lfm-cell-type">' + type + '</div>' +
        '</div>';
    }
    listEl.innerHTML = html;

    listEl.querySelectorAll('.lfm-row').forEach(row => {
      const type = row.dataset.type;
      const path = row.dataset.path;
      const name = row.dataset.name;

      row.addEventListener('click', (e) => {
        e.stopPropagation();
        listEl.querySelectorAll('.lfm-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', row);
        if(type === 'dir') loadDir(path, true);
        else selectFile(path, name);
      });
    });
  }

  function fileIcon(name, isDir){
    if(isDir) return '📁';
    const ext = (name.split('.').pop() || '').toLowerCase();
    const map = {
      vyu: '📄', vy: '📄',
      md: '📝', markdown: '📝', txt: '📋',
      json: '🔧', toml: '⚙️', yml: '⚙️', yaml: '⚙️'
    };
    return map[ext] || '📄';
  }
  function typeLabel(name){
    const ext = (name.split('.').pop() || '').toLowerCase();
    const map = {
      vyu: 'Vayu Source', vy: 'Vayu Source',
      md: 'Markdown', markdown: 'Markdown', txt: 'Text',
      json: 'JSON', toml: 'TOML', yml: 'YAML', yaml: 'YAML'
    };
    return map[ext] || (ext.toUpperCase() + ' file');
  }
  function formatSize(bytes){
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024*1024)).toFixed(1) + ' MB';
  }

  /* ============================================================
     PREVIEW
     ============================================================ */
  async function selectFile(path, name){
    previewEl.innerHTML =
      '<div class="lfm-empty">' +
        '<div class="lfm-empty-icon">⏳</div>' +
        '<div>Loading…</div>' +
      '</div>';

    try {
      let text = fileCache.get(path);
      if(text === undefined){
        const res = await fetch(RAW + path);
        if(!res.ok) throw new Error('Fetch ' + res.status);
        text = await res.text();
        fileCache.set(path, text);
      }
      await renderPreview(path, name, text);
    } catch(err){
      previewEl.innerHTML =
        '<div class="lfm-empty lfm-error">Couldn’t load file</div>';
    }
  }

  async function renderPreview(path, name, text){
    const lines = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ').split('\n');
    const isVyu = /\.vyu$/i.test(name);
    const isMd  = /\.(md|markdown)$/i.test(name);
    const outputReady = isVyu && hasOutput(name);

     let bodyHtml;
    if(isMd && window.VayuMarkdown){
      // Pass path so relative images/links resolve correctly
      const rendered = await window.VayuMarkdown.render(text, path);
      bodyHtml = '<div class="lfm-preview-body md-body"><div class="md-rendered">' + rendered + '</div></div>';
    } else {
      let codeHtml = '';
      for(let i = 0; i < lines.length; i++){
        codeHtml += '<span class="cl">' + highlightLine(lines[i]) + '</span>';
      }
      bodyHtml = '<div class="lfm-preview-body"><pre><code>' + codeHtml + '</code></pre></div>';
    }

    previewEl.innerHTML =
      '<div class="lfm-preview-head">' +
        '<div class="lfm-preview-name" title="' + path + '">' + name + '</div>' +
        '<div class="lfm-preview-actions">' +
          (isVyu
            ? '<button class="lfm-run-btn" data-action="run" type="button">▶ Run</button>'
            : '') +
          (isMd
            ? '<button class="lfm-action-btn" data-action="source" type="button" title="Toggle source">◐</button>'
            : '') +
          '<button class="lfm-action-btn" data-action="copy" type="button" title="Copy">📋</button>' +
          '<button class="lfm-action-btn" data-action="download" type="button" title="Download">↓</button>' +
        '</div>' +
      '</div>' +
      bodyHtml +
      '<div class="lfm-preview-foot">' + lines.length + ' lines · ' +
        (text.length / 1024).toFixed(1) + ' KB' +
        (isMd ? ' · Markdown' : '') +
        (isVyu && !outputReady ? ' · no recorded output' : '') +
        (isVyu && outputReady ? ' · output ready' : '') +
      '</div>';

    previewEl.querySelector('[data-action="copy"]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(text); btn.textContent = '✓'; }
      catch(_) { btn.textContent = '✕'; }
      if(window.VayuHaptics) window.VayuHaptics.fire('tap', btn);
      setTimeout(() => { btn.textContent = '📋'; }, 1200);
    });
    previewEl.querySelector('[data-action="download"]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      try {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        btn.textContent = '✓';
      } catch(_) { btn.textContent = '✕'; }
      if(window.VayuHaptics) window.VayuHaptics.fire('tap', btn);
      setTimeout(() => { btn.textContent = '↓'; }, 1200);
    });

    const runBtn = previewEl.querySelector('[data-action="run"]');
    if(runBtn){
      runBtn.addEventListener('click', () => {
        if(window.VayuHaptics) window.VayuHaptics.fire('game');
        if(window.VayuRun) window.VayuRun.run(name, text);
      });
    }

    const srcBtn = previewEl.querySelector('[data-action="source"]');
    if(srcBtn){
      let rendered = true;
      const bodyEl = previewEl.querySelector('.lfm-preview-body');
	  srcBtn.addEventListener('click', async () => {
        rendered = !rendered;
        if(rendered){
          const html = await window.VayuMarkdown.render(text, path);  // ← pass path
          bodyEl.className = 'lfm-preview-body md-body';
          bodyEl.innerHTML = '<div class="md-rendered">' + html + '</div>';
          srcBtn.title = 'Show source';
        } else {
          let codeHtml = '';
          for(let i = 0; i < lines.length; i++){
            codeHtml += '<span class="cl">' + highlightLine(lines[i]) + '</span>';
          }
          bodyEl.className = 'lfm-preview-body';
          bodyEl.innerHTML = '<pre><code>' + codeHtml + '</code></pre>';
          srcBtn.title = 'Show rendered';
        }
      });
    }
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
    if(historyIndex > 0){ historyIndex--; loadDir(history[historyIndex], false); }
  }
  function goForward(){
    if(historyIndex < history.length - 1){ historyIndex++; loadDir(history[historyIndex], false); }
  }
  function goUp(){
    if(!currentPath || currentPath === 'examples') return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDir(parts.join('/'), true);
  }
  function updateNavButtons(){
    root.querySelectorAll('[data-nav]').forEach(btn => {
      const a = btn.dataset.nav;
      if(a === 'back')    btn.disabled = historyIndex <= 0;
      if(a === 'forward') btn.disabled = historyIndex >= history.length - 1;
      if(a === 'up')      btn.disabled = !currentPath || currentPath === 'examples';
    });
  }

  window.VayuExamples = { init };
})();
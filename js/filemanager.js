/* ============================================================
   Vayu File Manager
   - Reads a GitHub repo via the public contents API
   - Renders a folder tree, code preview with line numbers
   - Copy + DOWNLOAD buttons on every open file
   - Boots both the examples modal and the full-repo modal
   ============================================================ */
(function(){
  'use strict';

  function initFileManager(cfg){
    const REPO  = 'NotY215/Vayu';
    const API   = 'https://api.github.com/repos/' + REPO + '/contents/';
    const RAW   = 'https://raw.githubusercontent.com/' + REPO + '/master/';
    const dirCache  = new Map();
    const fileCache = new Map();
    const itemIndex = new Map();

    const modal = document.getElementById(cfg.modalId);
    if(!modal) return null;

    const openBtn = document.getElementById(cfg.openBtnId);
    const listEl  = modal.querySelector('.fm-list');
    const crumbEl = modal.querySelector('.fm-crumb');
    const viewEl  = modal.querySelector('.fm-view');
    const backBtn = modal.querySelector('.fm-back');

    const root = cfg.root;
    const filter = cfg.filter || (() => true);
    let currentDir = root;
    let booted = false;

    const escapeHtml = (s) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

    async function ghList(path){
      if(dirCache.has(path)) return dirCache.get(path);
      const url = API + (path ? encodeURI(path) : '');
      const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
      if(!res.ok) throw new Error('GitHub API ' + res.status);
      const data = await res.json();
      const items = (Array.isArray(data) ? data : [])
        .filter(it => {
          if(it.type !== 'file' && it.type !== 'dir') return false;
          return filter(it);
        })
        .sort((a, b) => {
          if(a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      dirCache.set(path, items);
      for(const it of items) itemIndex.set(it.path, it);
      return items;
    }

    function renderCrumb(path){
      const parts = path ? path.split('/') : [];
      let html = '<button class="crumb-btn" type="button" data-path="">/</button>';
      parts.forEach((p, i) => {
        const pth = parts.slice(0, i + 1).join('/');
        html += '<span class="sep"> / </span>';
        html += '<button class="crumb-btn" type="button" data-path="' +
                pth.replace(/"/g, '&quot;') + '">' + p + '</button>';
      });
      crumbEl.innerHTML = html;
      crumbEl.querySelectorAll('.crumb-btn').forEach(b => {
        b.addEventListener('click', () => loadDir(b.dataset.path));
      });
    }

    function renderList(items){
      if(!items.length){
        listEl.innerHTML = '<div class="fm-empty">No files here.</div>';
        return;
      }
      let html = '';
      for(const it of items){
        html +=
          '<button class="fm-item" type="button" data-type="' + it.type +
          '" data-path="' + it.path.replace(/"/g, '&quot;') +
          '" data-name="' + it.name.replace(/"/g, '&quot;') + '">' +
            '<span class="fm-ico">' + (it.type === 'dir' ? '📁' : '📄') + '</span>' +
            '<span class="fm-name">' + it.name + '</span>' +
          '</button>';
      }
      listEl.innerHTML = html;

      listEl.querySelectorAll('.fm-item').forEach(btn => {
        btn.addEventListener('click', () => {
          if(btn.dataset.type === 'dir'){
            loadDir(btn.dataset.path);
          } else {
            listEl.querySelectorAll('.fm-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            openFile(btn.dataset.path, btn.dataset.name);
          }
        });
      });
    }

    async function loadDir(path){
      currentDir = path;
      renderCrumb(path);
      backBtn.disabled = (path === root);
      listEl.innerHTML = '<div class="fm-empty">Loading…</div>';
      try {
        const items = await ghList(path);
        if(currentDir !== path) return;
        renderList(items);
      } catch(err){
        listEl.innerHTML =
          '<div class="fm-empty">Couldn’t load files from GitHub.<br>' +
          '<a href="https://github.com/' + REPO + '/tree/master/' + path +
          '" target="_blank" rel="noopener">Open on GitHub ↗</a></div>';
      }
    }

    async function openFile(path, name){
      viewEl.innerHTML = '<div class="fm-empty">Loading ' + name + '…</div>';
      try {
        let text = fileCache.get(path);
        if(text === undefined){
          const item = itemIndex.get(path);
          const url = (item && item.download_url) ? item.download_url : (RAW + path);
          const res = await fetch(url);
          if(!res.ok) throw new Error('Fetch ' + res.status);
          text = await res.text();
          fileCache.set(path, text);
        }
        renderCode(path, name, text);
      } catch(err){
        viewEl.innerHTML =
          '<div class="fm-empty">Couldn’t load <b>' + name + '</b>.<br>' +
          '<a href="https://github.com/' + REPO + '/blob/master/' + path +
          '" target="_blank" rel="noopener">Open on GitHub ↗</a></div>';
      }
    }

    function renderCode(path, name, text){
      const lines = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ').split('\n');
      const buf = new Array(lines.length);
      for(let i = 0; i < lines.length; i++){
        buf[i] = '<span class="cl">' + highlightLine(lines[i]) + '</span>';
      }

      viewEl.innerHTML =
        '<div class="fm-codebar">' +
          '<span class="fm-filename">' + path + '</span>' +
          '<div class="fm-codebar-actions">' +
            '<span class="fm-lines">' + lines.length + ' lines</span>' +
            '<button class="btn ghost fm-copy" type="button">Copy</button>' +
            '<button class="btn ghost fm-download" type="button" title="Download this file">' +
              '<span>↓</span><span>Download</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<pre><code>' + buf.join('') + '</code></pre>';

      // Copy button
      const copyBtn = viewEl.querySelector('.fm-copy');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = 'Copied ✓';
        } catch(_) {
          copyBtn.textContent = 'Copy failed';
        }
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1400);
      });

      // Download button — saves the exact file from the repo
      const dlBtn = viewEl.querySelector('.fm-download');
      dlBtn.addEventListener('click', () => {
        try {
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url;
          a.download = name || path.split('/').pop() || 'file.txt';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          dlBtn.innerHTML = '<span>✓</span><span>Saved</span>';
        } catch(_) {
          dlBtn.innerHTML = '<span>✕</span><span>Failed</span>';
        }
        setTimeout(() => {
          dlBtn.innerHTML = '<span>↓</span><span>Download</span>';
        }, 1400);
      });
    }

    function openModal(){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if(!booted){
        booted = true;
        loadDir(root);
      }
      setTimeout(() => modal.querySelector('.modal-close').focus(), 60);
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

    backBtn.addEventListener('click', () => {
      if(currentDir === root) return;
      const parts = currentDir.split('/');
      parts.pop();
      loadDir(parts.join('/'));
    });

    return { open: openModal, close: closeModal };
  }

  // ---------- Boot both instances ----------
  // Examples — hides bench/ and .ps1 files
  initFileManager({
    modalId:   'examplesModal',
    openBtnId: 'openExamples',
    root:      'examples',
    filter: (it) => {
      if(it.type === 'dir' && it.name.toLowerCase() === 'bench') return false;
      if(it.name.toLowerCase().endsWith('.ps1')) return false;
      return true;
    }
  });

  // Full repo — no filter
  initFileManager({
    modalId:   'githubModal',
    openBtnId: 'openGithub',
    root:      '',
    filter:    () => true
  });

  // Expose for advanced use
  window.VayuFM = { initFileManager };
})();
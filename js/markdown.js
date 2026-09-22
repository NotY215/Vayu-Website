/* ============================================================
   Vayu Markdown — lazy-loads marked.js, renders .md as HTML
   - Rewrites relative <img> src and <a href> inside markdown
     so embedded images / links point to the raw GitHub repo
     based on the source file's location.
   ============================================================ */
(function(){
  'use strict';

  const REPO        = 'NotY215/Vayu';
  const RAW_BASE    = 'https://raw.githubusercontent.com/' + REPO + '/master/';
  const BLOB_BASE   = 'https://github.com/' + REPO + '/blob/master/';

  /* Resolve a relative path against a source file path.
     resolve('docs/README.md', '../assets/logo.png') => 'assets/logo.png'
     resolve('docs/README.md', 'img/one.png')        => 'docs/img/one.png' */
  function resolveRelative(sourcePath, relative){
    if(!sourcePath) return relative.replace(/^\.?\//, '');
    const baseParts = sourcePath.split('/');
    baseParts.pop(); // drop filename

    const relParts = relative.split('/');
    const out = baseParts.slice();

    for(const part of relParts){
      if(part === '' || part === '.') continue;
      if(part === '..'){ out.pop(); continue; }
      out.push(part);
    }
    return out.join('/');
  }

  function isAbsolute(url){
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);
  }

  /* Fix img/src and a/href inside a DOM subtree */
  function fixAssets(container, sourcePath){
    if(!container || !sourcePath) return;

    // Images
    container.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if(!src || isAbsolute(src)) return;
      if(src.startsWith('/')){
        img.setAttribute('src', RAW_BASE + src.slice(1));
      } else {
        img.setAttribute('src', RAW_BASE + resolveRelative(sourcePath, src));
      }
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });

    // Video / audio / source — same treatment
    container.querySelectorAll('video[src], audio[src], source[src]').forEach(el => {
      const src = el.getAttribute('src');
      if(!src || isAbsolute(src)) return;
      if(src.startsWith('/')){
        el.setAttribute('src', RAW_BASE + src.slice(1));
      } else {
        el.setAttribute('src', RAW_BASE + resolveRelative(sourcePath, src));
      }
    });

    // Links → point to GitHub blob for relative paths, raw for assets
    container.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if(!href || isAbsolute(href)) return;
      const resolved = href.startsWith('/')
        ? href.slice(1)
        : resolveRelative(sourcePath, href);
      a.setAttribute('href', BLOB_BASE + resolved);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  /* Parse html → fix assets → re-serialize */
  function fixAssetsInHtml(html, sourcePath){
    if(!sourcePath) return html;
    try {
      const doc = new DOMParser().parseFromString(
        '<div id="__md_root">' + html + '</div>', 'text/html'
      );
      const root = doc.getElementById('__md_root');
      fixAssets(root, sourcePath);
      return root.innerHTML;
    } catch(_) {
      return html;
    }
  }

  window.VayuMarkdown = {
    _loading: null,

    load(){
      if(window.marked && window.marked.parse) return Promise.resolve(window.marked);
      if(this._loading) return this._loading;
      this._loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
        s.onload = () => {
          if(window.marked && window.marked.parse){
            try {
              window.marked.setOptions({ gfm: true, breaks: true, headerIds: false, mangle: false });
            } catch(_) {}
          }
          resolve(window.marked);
        };
        s.onerror = () => reject(new Error('Failed to load marked.js'));
        document.head.appendChild(s);
      });
      return this._loading;
    },

    escapeHtml(s){
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },

    /* render(text, sourcePath?) -> HTML string with fixed asset URLs */
    async render(text, sourcePath){
      try {
        await this.load();
        const html = window.marked.parse(text);
        return sourcePath ? fixAssetsInHtml(html, sourcePath) : html;
      } catch(_) {
        return '<pre>' + this.escapeHtml(text) + '</pre>';
      }
    },

    /* Expose helpers */
    fixAssets,
    fixAssetsInHtml,
    resolveRelative,

    /* Render into an existing container, fixing assets in place */
    async renderInto(container, text, sourcePath){
      const html = await this.render(text);
      container.innerHTML = html;
      if(sourcePath) fixAssets(container, sourcePath);
    }
  };
})();
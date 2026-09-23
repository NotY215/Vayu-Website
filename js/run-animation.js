/* ============================================================
   Vayu Run Animation — standalone
   Exposed as window.VayuRun.run(name, sourceCode)
   Used by both the examples file manager and the github explorer
   ============================================================ */
(function(){
  'use strict';

  function escapeHtml(s){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function run(name, sourceCode){
    if(window.VayuLiveOutputs && window.VayuLiveOutputs.has && window.VayuLiveOutputs.has(name)){
      window.VayuLiveOutputs.run(name, sourceCode);
      return;
    }
    // Close any existing overlay before opening a new one
    const existing = document.querySelector('.hack-overlay');
    if(existing) existing.remove();

    const output = (window.VayuOutputs && window.VayuOutputs[name]) ||
      '// No output recorded for ' + name;

    const overlay = document.createElement('div');
    overlay.className = 'hack-overlay';
    overlay.innerHTML =
      '<div class="hack-panel">' +
        '<header class="hack-head">' +
          '<div class="hack-dots">' +
            '<span class="hack-dot red"></span>' +
            '<span class="hack-dot yellow"></span>' +
            '<span class="hack-dot green"></span>' +
          '</div>' +
          '<div class="hack-title" data-title>● vayuc run ' + name + '</div>' +
          '<button class="hack-close" type="button" data-close aria-label="Close">✕</button>' +
        '</header>' +
        '<div class="hack-body" data-body>' +
          '<canvas class="hack-canvas" data-canvas></canvas>' +
          '<div class="hack-content">' +
            '<div class="hack-log" data-log></div>' +
            '<div class="hack-progress-wrap">' +
              '<div class="hack-progress"><i data-progress></i></div>' +
              '<div class="hack-progress-meta">' +
                '<span data-stage>Compiling…</span>' +
                '<span><span data-percent>0</span>%</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escClose);
    };
    const escClose = (e) => { if(e.key === 'Escape') close(); };
    document.addEventListener('keydown', escClose);
    overlay.querySelector('[data-close]').addEventListener('click', close);

    const canvas = overlay.querySelector('[data-canvas]');
    const stopMatrix = startMatrix(canvas);

    const logEl      = overlay.querySelector('[data-log]');
    const stageEl    = overlay.querySelector('[data-stage]');
    const percentEl  = overlay.querySelector('[data-percent]');
    const progressEl = overlay.querySelector('[data-progress]');

    const stages = ['Lexing…','Parsing…','Building AST…','Type checking…','Lowering to IL…','Optimizing…','Emitting native…','Linking…','Executing…'];
    const pseudoAsm = ['mov rax, [rbp-0x08]','lea rbx, [rip+0x1F4]','add rcx, 0x01','cmp rax, rbx','jne 0x4012F0','push rbp','sub rsp, 0x10','call vayu_print','xor edx, edx','movzx eax, al','shl rax, 2','test rcx, rcx','imul rax, rax, 8','ret','movd xmm0, eax','pxor xmm1, xmm1'];

    let elapsed = 0;
    const DURATION = 5000;
    const TICK = 60;

    function addLogLine(text, cls){
      const line = document.createElement('div');
      line.className = 'hack-log-line' + (cls ? ' ' + cls : '');
      line.textContent = text;
      logEl.appendChild(line);
      while(logEl.children.length > 14) logEl.removeChild(logEl.firstChild);
      requestAnimationFrame(() => { logEl.scrollTop = logEl.scrollHeight; });
    }

    addLogLine('$ vayuc --native ' + name, 'cmd');
    addLogLine('Vayu Native Compiler v0.7.0 (self-hosting)');

    const timer1 = setInterval(() => {
      elapsed += TICK;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      percentEl.textContent = pct;
      progressEl.style.width = pct + '%';

      const stageIdx = Math.min(stages.length - 1, Math.floor((pct / 100) * stages.length));
      stageEl.textContent = stages[stageIdx];

      if(Math.random() < 0.85){
        const line = pseudoAsm[(Math.random() * pseudoAsm.length) | 0];
        const addr = '0x' + (0x401000 + Math.floor(Math.random() * 0x8000)).toString(16).toUpperCase();
        addLogLine(addr + '  ' + line, 'asm');
      }

      if(pct >= 100){
        clearInterval(timer1);
        setTimeout(showOutput, 240);
      }
    }, TICK);

    function showOutput(){
      stopMatrix();
      const body = overlay.querySelector('[data-body]');
      body.classList.add('hack-done');
      overlay.querySelector('[data-title]').textContent = '● Output · ' + name;

      const outLines = output.split('\n');
      let outHtml = '';
      outLines.forEach(l => { outHtml += '<div class="hack-out-line">' + escapeHtml(l || ' ') + '</div>'; });

      body.innerHTML =
        '<div class="hack-output-wrap">' +
          '<div class="hack-output-head">' +
            '<span class="hack-output-badge">✓ Finished</span>' +
            '<span class="hack-output-meta">exit 0 · ' + Math.round(Math.random() * 300 + 120) + ' ms · ' +
              (sourceCode.length / 1024).toFixed(1) + ' KB source</span>' +
          '</div>' +
          '<div class="hack-output">' + outHtml + '</div>' +
          '<div class="hack-output-actions">' +
            '<button class="hack-action" type="button" data-act="copy">📋 Copy output</button>' +
            '<button class="hack-action" type="button" data-act="again">⟳ Run again</button>' +
            '<button class="hack-action primary" type="button" data-act="close">Close</button>' +
          '</div>' +
          '<div class="hack-output-warn">⚠ pre-generated · not live</div>' +
        '</div>';

      body.querySelector('[data-act="copy"]').addEventListener('click', async (e) => {
        try { await navigator.clipboard.writeText(output); e.currentTarget.textContent = '✓ Copied'; }
        catch(_) { e.currentTarget.textContent = '✕ Failed'; }
        if(window.VayuHaptics) window.VayuHaptics.fire('tap', e.currentTarget);
        setTimeout(() => { e.currentTarget.textContent = '📋 Copy output'; }, 1400);
      });
      body.querySelector('[data-act="again"]').addEventListener('click', () => {
        if(window.VayuHaptics) window.VayuHaptics.fire('game');
        overlay.remove();
        document.body.style.overflow = '';
        run(name, sourceCode);
      });
      body.querySelector('[data-act="close"]').addEventListener('click', close);

      if(window.VayuHaptics) window.VayuHaptics.fire('success');
    }
  }

  function startMatrix(canvas){
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, cols, drops;

    function resize(){
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fontSize = 14;
      cols = Math.floor(w / fontSize);
      drops = new Array(cols).fill(1).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = '01ABCDEF0123456789';
    let raf = null, last = 0;
    function frame(t){
      raf = requestAnimationFrame(frame);
      if(t - last < 45) return;
      last = t;
      ctx.fillStyle = 'rgba(2,6,13,0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '14px "JetBrains Mono", monospace';
      for(let i = 0; i < cols; i++){
        const c = chars[(Math.random() * chars.length) | 0];
        const x = i * 14;
        const y = drops[i] * 14;
        const bright = Math.random() < 0.06;
        ctx.fillStyle = bright ? 'rgba(140,255,200,0.95)' : 'rgba(66,216,255,0.55)';
        ctx.fillText(c, x, y);
        drops[i] += 0.7 + Math.random() * 0.5;
        if(y > h && Math.random() > 0.975) drops[i] = 0;
      }
    }
    raf = requestAnimationFrame(frame);
    return function stop(){
      if(raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }

  window.VayuRun = { run };
})();
/* ============================================================
   Vayu Animation Engine — animation.js
   - Universal scroll animator with MutationObserver so late-added
     content (games hub, roadmap phases, dynamically rendered cards)
     is picked up automatically.
   ============================================================ */
(function(){
  'use strict';

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  let booted = false;

  const ready = (fn) => {
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  };

  function injectStyles(){
    if(document.getElementById('vayu-anim-styles')) return;
    const s = document.createElement('style');
    s.id = 'vayu-anim-styles';
    s.textContent = `
      .vayu-cursor{position:fixed;top:0;left:0;width:10px;height:10px;border-radius:50%;
        background:#55d9ff;pointer-events:none;z-index:9999;box-shadow:0 0 18px #55d9ff;
        transition:width .18s,height .18s,background .18s;mix-blend-mode:screen;will-change:transform}
      .vayu-cursor.tap{width:26px;height:26px;background:#8d6cff}
      .vayu-cursor-trail{position:fixed;top:0;left:0;width:36px;height:36px;
        border:1px solid rgba(85,217,255,.5);border-radius:50%;
        pointer-events:none;z-index:9998;will-change:transform}
      .vayu-ripple{position:absolute;border-radius:50%;transform:translate(-50%,-50%) scale(0);
        background:rgba(255,255,255,.5);pointer-events:none;
        animation:vayuRipple .7s ease-out forwards}
      @keyframes vayuRipple{to{transform:translate(-50%,-50%) scale(1);opacity:0}}
      .vayu-orb{position:absolute;width:380px;height:380px;border-radius:50%;
        filter:blur(85px);pointer-events:none;z-index:-1;opacity:.7;will-change:transform;
        animation:vayuOrbFloat 14s ease-in-out infinite}
      @keyframes vayuOrbFloat{0%,100%{transform:translate(0,0) scale(1)}
        50%{transform:translate(30px,-40px) scale(1.08)}}
      body.vayu-cursor-active,body.vayu-cursor-active a,body.vayu-cursor-active button,
      body.vayu-cursor-active [role="button"]{cursor:none!important}
      [data-tilt]{will-change:transform;transform-style:preserve-3d}
      [data-magnetic]{will-change:transform;transition:transform .25s cubic-bezier(.2,.8,.2,1)}
      [data-parallax-wrap]{position:relative;overflow:hidden}
      [data-parallax]{will-change:transform}
      @media (prefers-reduced-motion: reduce){
        .vayu-cursor,.vayu-cursor-trail,.vayu-orb{display:none!important}
        body.vayu-cursor-active,body.vayu-cursor-active *{cursor:auto!important}
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------- 1. Particle constellation ---------- */
  function initParticles(){
    const canvas = document.getElementById('particles');
    if(!canvas || REDUCE) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, pts = [];
    let rafId = null, last = 0, visible = true;
    const LINK = 135, LINK2 = LINK * LINK;

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(){
      const count = Math.min(60, Math.floor(w / 26));
      pts = new Array(count);
      for(let i = 0; i < count; i++){
        pts[i] = {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.24, vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.5 + 0.4
        };
      }
    }
    function frame(t){
      rafId = requestAnimationFrame(frame);
      if(!visible) return;
      if(t - last < 33) return;
      last = t;
      ctx.clearRect(0, 0, w, h);
      for(let i = 0; i < pts.length; i++){
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = w; else if(p.x > w) p.x = 0;
        if(p.y < 0) p.y = h; else if(p.y > h) p.y = 0;
      }
      ctx.lineWidth = 0.6;
      for(let i = 0; i < pts.length; i++){
        const a = pts[i];
        for(let j = i + 1; j < pts.length; j++){
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if(d2 < LINK2){
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.14;
            ctx.strokeStyle = 'rgba(91,211,255,' + alpha + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for(let i = 0; i < pts.length; i++){
        const p = pts[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(91,211,255,0.55)';
        ctx.fill();
      }
    }
    resize(); spawn();
    rafId = requestAnimationFrame(frame);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); spawn(); }, 220);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  }

  /* ---------- 2. Orbs ---------- */
  function initOrbs(){
    if(REDUCE) return;
    const host = document.querySelector('[data-orbs]');
    if(!host || host.querySelector('.vayu-orb')) return;
    const colors = [
      'rgba(53,145,255,0.16)',
      'rgba(94,63,255,0.14)',
      'rgba(99,230,160,0.10)',
      'rgba(85,217,255,0.12)'
    ];
    for(let i = 0; i < 4; i++){
      const orb = document.createElement('div');
      orb.className = 'vayu-orb';
      orb.style.background = colors[i % colors.length];
      orb.style.left = (5 + Math.random() * 85) + '%';
      orb.style.top  = (10 + Math.random() * 80) + '%';
      orb.style.animationDelay = (-i * 3) + 's';
      orb.style.animationDuration = (14 + i * 2) + 's';
      orb.style.width = orb.style.height = (300 + i * 40) + 'px';
      host.appendChild(orb);
    }
  }

  /* ---------- 3. Cursor ---------- */
  function initCursor(){
    if(COARSE || REDUCE) return;
    if(document.querySelector('.vayu-cursor')) return;
    const dot = document.createElement('div');
    dot.className = 'vayu-cursor';
    const trail = document.createElement('div');
    trail.className = 'vayu-cursor-trail';
    document.body.appendChild(dot);
    document.body.appendChild(trail);
    document.body.classList.add('vayu-cursor-active');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let tx = mx, ty = my;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + (mx - 5) + 'px,' + (my - 5) + 'px,0)';
    }, { passive: true });
    window.addEventListener('pointerdown', () => dot.classList.add('tap'));
    window.addEventListener('pointerup', () => dot.classList.remove('tap'));

    function follow(){
      requestAnimationFrame(follow);
      tx += (mx - tx) * 0.17;
      ty += (my - ty) * 0.17;
      trail.style.transform = 'translate3d(' + (tx - 18) + 'px,' + (ty - 18) + 'px,0)';
    }
    follow();
  }

  /* ---------- 4. Scroll progress ---------- */
  function initScrollProgress(){
    let bar = document.getElementById('scrollProgress');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'scrollProgress';
      bar.style.cssText =
        'position:fixed;top:0;left:0;right:0;height:3px;z-index:50;' +
        'background:linear-gradient(90deg,#42d8ff,#8d6cff);' +
        'transform-origin:0 50%;transform:scaleX(0);' +
        'box-shadow:0 0 12px rgba(85,217,255,.7);pointer-events:none;' +
        'transition:transform .08s linear;';
      document.body.appendChild(bar);
    }
    let ticking = false;
    function update(){
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', () => {
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 5. Reveal (.reveal system) ---------- */
  function initReveal(){
    const sel = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-list';
    const els = document.querySelectorAll(sel);
    if(!els.length) return;
    if(!('IntersectionObserver' in window)){
      els.forEach(el => el.classList.add('show'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for(const e of entries){
        if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 6. UNIVERSAL SCROLL ANIMATION ---------- */
  const SCROLL_SKIP_SELECTOR = 'nav, footer, .modal, .hero, .page-hero, .no-scroll-anim';

  let scrollIO = null;
  let scanTimer = null;
  let moBound = false;

  function tagStaggerContainers(){
    const STAGGER = [
      '.grid',
      '.bench-grid',
      '.gh-stats',
      '.timeline',
      '.flex-row',
      '.games-grid'
    ];
    STAGGER.forEach(sel => {
      document.querySelectorAll(sel).forEach(container => {
        if(container.closest(SCROLL_SKIP_SELECTOR)) return;
        if(container.hasAttribute('data-scroll-stagger')) return;
        if(container.closest('[data-scroll-stagger]')) return;
        if(container.children.length === 0) return;
        container.setAttribute('data-scroll-stagger', '');
      });
    });
  }

  function tagScrollAnims(){
    const RULES = [
      { sel: '.section-head',           anim: 'fade-up'   },
      { sel: '.page-phase',             anim: 'fade-up'   },
      { sel: 'section > .container > p.muted', anim: 'fade-up' },
      { sel: '.card:not(.reveal)',      anim: 'scale-in'  },
      { sel: '.code:not(.reveal)',      anim: 'fade-up'   },
      { sel: '.compare:not(.reveal)',   anim: 'fade-up'   },
      { sel: '.two > *:not(.reveal):not([data-scroll-anim])', anim: 'fade-up' },
      { sel: '.phase:not(.reveal)',     anim: 'fade-left' },
      { sel: '.callout:not(.reveal)',   anim: 'scale-in'  },
      { sel: '.roadmap-legend',         anim: 'fade-up'   },
      { sel: 'section table',           anim: 'fade-up'   },
      { sel: '.pill-list',              anim: 'fade-up'   },
      { sel: '.games-hub-note',         anim: 'fade-up'   },
      { sel: '.games-preview-code',     anim: 'fade-up'   },
      { sel: '.flex-row-between',       anim: 'fade-up'   },
      { sel: '.card.dev',               anim: 'fade-up'   },
      { sel: '.section-head h2',        anim: 'fade-up'   }
    ];

    const shouldSkip = (el) => {
      if(!el) return true;
      if(el.hasAttribute('data-scroll-anim')) return true;
      if(el.classList.contains('reveal')) return true;
      if(el.closest(SCROLL_SKIP_SELECTOR)) return true;
      if(el.closest('[data-scroll-stagger]')) return true;
      if(el.closest('[data-scroll-anim]')) return true;
      const r = el.getBoundingClientRect();
      if(r.width < 40 && r.height < 20) return true;
      return false;
    };

    RULES.forEach(rule => {
      document.querySelectorAll(rule.sel).forEach(el => {
        if(shouldSkip(el)) return;
        el.setAttribute('data-scroll-anim', rule.anim);
      });
    });
  }

  function observeAll(){
    if(!scrollIO) return;
    document
      .querySelectorAll('[data-scroll-anim]:not(.in-view), [data-scroll-stagger]:not(.in-view)')
      .forEach(el => {
        if(el.dataset.vayuObs === '1') return;
        el.dataset.vayuObs = '1';
        scrollIO.observe(el);
      });
  }

  function scanAndTag(){
    tagStaggerContainers();
    tagScrollAnims();
    observeAll();
  }

  function initUniversalScrollAnim(){
    if(REDUCE) return;

    // Skip on bare game pages — the canvas owns the whole viewport
    const path = (location.pathname || '').toLowerCase();
    if(path.indexOf('flappybird') !== -1) return;

    // Reuse a single IntersectionObserver across rescans
    if(!scrollIO){
      if(!('IntersectionObserver' in window)){
        document.querySelectorAll('[data-scroll-anim], [data-scroll-stagger]')
          .forEach(el => el.classList.add('in-view'));
        return;
      }
      scrollIO = new IntersectionObserver((entries) => {
        for(const e of entries){
          if(e.isIntersecting){
            e.target.classList.add('in-view');
            scrollIO.unobserve(e.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    }

    scanAndTag();

    // Watch for content added later (games hub, roadmap phases, dyn. content)
    if(!moBound && document.body){
      moBound = true;
      const mo = new MutationObserver(() => {
        if(scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(() => {
          scanTimer = null;
          scanAndTag();
        }, 80);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ---------- 7. Hero glow ---------- */
  function initHeroGlow(){
    const glow = document.querySelector('.hero-glow, [data-glow]');
    if(!glow || REDUCE) return;
    let raf = null, px = window.innerWidth / 2, py = window.innerHeight / 2;
    window.addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY;
      if(raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const x = (px / window.innerWidth - 0.5) * 40;
        const y = (py / window.innerHeight - 0.5) * 30;
        glow.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
      });
    }, { passive: true });
  }

  /* ---------- 8. Ripple ---------- */
  function initRipple(){
    document.querySelectorAll('.ripple-btn, [data-ripple]').forEach(btn => {
      if(btn.dataset.rippleInit) return;
      btn.dataset.rippleInit = '1';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.addEventListener('pointerdown', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const r = Math.max(rect.width, rect.height) * 1.1;
        const span = document.createElement('span');
        span.className = 'vayu-ripple';
        span.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + r + 'px;height:' + r + 'px;';
        btn.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
      });
    });
  }

  /* ---------- 9. Magnetic ---------- */
  function initMagnetic(){
    if(COARSE || REDUCE) return;
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      if(btn.dataset.magneticInit) return;
      btn.dataset.magneticInit = '1';
      const strength = parseFloat(btn.dataset.magnetic) || 0.3;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('pointerleave', () => btn.style.transform = 'translate(0,0)');
    });
  }

  /* ---------- 10. Tilt ---------- */
  function initTilt(){
    if(COARSE || REDUCE) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
      if(card.dataset.tiltInit) return;
      card.dataset.tiltInit = '1';
      let raf = null, px = 0, py = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width;
        py = (e.clientY - r.top) / r.height;
        if(raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const rx = (py - 0.5) * -14;
          const ry = (px - 0.5) * 14;
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
          const shine = card.querySelector('.shine');
          if(shine){
            shine.style.background = 'radial-gradient(circle at ' + (px*100) + '% ' + (py*100) + '%, rgba(255,255,255,.28), transparent 60%)';
            shine.style.opacity = '1';
          }
        });
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        const shine = card.querySelector('.shine');
        if(shine) shine.style.opacity = '0';
      });
    });
  }

  /* ---------- 11. Parallax ---------- */
  function initParallax(){
    const wraps = document.querySelectorAll('[data-parallax-wrap]');
    if(!wraps.length) return;
    let ticking = false;
    function update(){
      ticking = false;
      wraps.forEach(wrap => {
        const r = wrap.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        wrap.querySelectorAll('[data-parallax]').forEach(l => {
          const speed = parseFloat(l.dataset.parallax) || 0;
          l.style.transform = 'translate3d(0,' + (center * speed) + 'px,0)';
        });
      });
    }
    window.addEventListener('scroll', () => {
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 12. Scramble ---------- */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  function scramble(el){
    const original = el.dataset.original || el.textContent;
    if(!el.dataset.original) el.dataset.original = original;
    let frame = 0;
    const len = original.length;
    function step(){
      frame++;
      let out = '';
      for(let i = 0; i < len; i++){
        const reveal = frame - i * 2;
        if(reveal > 18) out += original[i];
        else out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }
      el.textContent = out;
      if(frame < len * 2 + 22) requestAnimationFrame(step);
      else el.textContent = original;
    }
    step();
  }
  function initScramble(){
    const els = document.querySelectorAll('[data-scramble]');
    if(!els.length) return;
    if(!('IntersectionObserver' in window)){ els.forEach(scramble); return; }
    const io = new IntersectionObserver((entries) => {
      for(const e of entries){
        if(e.isIntersecting){ scramble(e.target); io.unobserve(e.target); }
      }
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 13. Counters ---------- */
  function initCounters(){
    const els = document.querySelectorAll('[data-count]');
    if(!els.length) return;
    const io = new IntersectionObserver((entries) => {
      for(const e of entries){
        if(!e.isIntersecting) continue;
        const el = e.target;
        io.unobserve(el);
        const target = parseFloat(el.dataset.count) || 0;
        const decimals = (String(target).split('.')[1] || '').length;
        const duration = 1400;
        const start = performance.now();
        function step(now){
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if(t < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(decimals);
        }
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 14. Burst ---------- */
  function initBurst(){
    const zones = document.querySelectorAll('[data-burst]');
    if(!zones.length) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9000';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize(){
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    const parts = [];
    const COLORS = ['#42d8ff','#8d6cff','#63e6a0','#ffffff','#ff4657'];
    zones.forEach(zone => {
      if(zone.dataset.burstInit) return;
      zone.dataset.burstInit = '1';
      zone.addEventListener('pointerdown', (e) => {
        const r = zone.getBoundingClientRect();
        if(e.clientX < r.left || e.clientX > r.right) return;
        if(e.clientY < r.top || e.clientY > r.bottom) return;
        const n = 26;
        for(let i = 0; i < n; i++){
          const a = (Math.PI * 2 * i) / n + Math.random() * 0.3;
          const speed = 2 + Math.random() * 5;
          parts.push({
            x: e.clientX, y: e.clientY,
            vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 1,
            life: 1, decay: 0.012 + Math.random() * 0.012,
            size: 2 + Math.random() * 3.5,
            color: COLORS[(Math.random() * COLORS.length) | 0]
          });
        }
      });
    });
    let visible = true;
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
    function loop(){
      requestAnimationFrame(loop);
      if(!visible) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for(let i = parts.length - 1; i >= 0; i--){
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.14; p.vx *= 0.985; p.vy *= 0.985;
        p.life -= p.decay;
        if(p.life <= 0){ parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    loop();
  }

  /* ---------- 15. Soon buttons ---------- */
  function initSoon(){
    document.querySelectorAll('.soon').forEach(el => {
      if(el.dataset.soonInit) return;
      el.dataset.soonInit = '1';
      const flash = () => {
        el.classList.add('tip-show');
        clearTimeout(el._tipTimer);
        el._tipTimer = setTimeout(() => el.classList.remove('tip-show'), 1900);
      };
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); flash(); });
      el.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flash(); }
      });
    });
  }

  /* ---------- BOOT ---------- */
  function boot(){
    if(booted) return;
    booted = true;
    injectStyles();

    if(REDUCE){
      document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-list'
      ).forEach(el => el.classList.add('show'));
      document.querySelectorAll('[data-scroll-anim], [data-scroll-stagger]')
        .forEach(el => el.classList.add('in-view'));
      initSoon();
      return;
    }
    initParticles();
    initOrbs();
    initCursor();
    initScrollProgress();
    initReveal();
    initUniversalScrollAnim();   // ← universal scroll on every content page
    initHeroGlow();
    initRipple();
    initMagnetic();
    initTilt();
    initParallax();
    initScramble();
    initCounters();
    initBurst();
    initSoon();
  }

  ready(() => {
    if(!document.body.hasAttribute('data-vayu-defer')) boot();
  });

  window.VayuAnim = {
    boot,
    scramble,
    refreshScrollAnim: () => {
      if(!booted) return;
      scanAndTag();
    },
    version: '1.5.0'
  };
})();
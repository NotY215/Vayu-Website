/* Vayu spatial glass interactions: lightweight pointer light and reveal. */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bootGlass() {
    document.documentElement.classList.add('glass-ui-ready');
    const targets = document.querySelectorAll('.speed-chip, .gh-live-stat, .card, .feature-card, .info-card, .compare-card, .doc-card, .syntax-card, .faq-item, .roadmap-card, .phase, .stat-card, .panel, .glass-card, .code-card, .game-card, .developer-card');
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      targets.forEach(function (el) {
        el.addEventListener('pointermove', function (event) {
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--pointer-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
          el.style.setProperty('--pointer-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
        }, { passive: true });
        el.addEventListener('pointerleave', function () {
          el.style.removeProperty('--pointer-x');
          el.style.removeProperty('--pointer-y');
        }, { passive: true });
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootGlass, { once: true });
  else bootGlass();
})();
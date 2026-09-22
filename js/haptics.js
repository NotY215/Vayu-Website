/* ============================================================
   Vayu Haptics — vibration + visual shake fallback
   Android: uses navigator.vibrate
   iOS: visual shake fallback (no vibration API in Safari)
   ============================================================ */
(function(){
  'use strict';

  if(document.getElementById('vayu-haptic-styles')) return;
  const style = document.createElement('style');
  style.id = 'vayu-haptic-styles';
  style.textContent = `
    @keyframes vayuShake {
      0%, 100% { transform: translate3d(0,0,0); }
      20% { transform: translate3d(-2px,1px,0); }
      40% { transform: translate3d(2px,-1px,0); }
      60% { transform: translate3d(-1px,-2px,0); }
      80% { transform: translate3d(1px,2px,0); }
    }
    .vayu-shake { animation: vayuShake 0.2s cubic-bezier(.36,.07,.19,.97); }
    @keyframes vayuPulse {
      0% { box-shadow: 0 0 0 0 rgba(85,217,255,0.55); }
      100% { box-shadow: 0 0 0 14px rgba(85,217,255,0); }
    }
    .vayu-pulse { animation: vayuPulse 0.5s ease-out; }
  `;
  document.head.appendChild(style);

  const patterns = {
    tap:     [10],
    light:   [8],
    medium:  [18],
    heavy:   [35],
    success: [12, 40, 12],
    error:   [40, 30, 40],
    pulse:   [25, 60, 25, 60, 25],
    game:    [12, 40, 12, 40, 12]
  };

  let enabled = true;
  let last = 0;

  function haptic(kind, targetEl){
    if(!enabled) return;
    const now = performance.now();
    if(now - last < 30) return;   // throttle
    last = now;
    const pattern = patterns[kind] || patterns.light;

    // Android / Chrome (desktop too, if supported)
    if('vibrate' in navigator){
      try { navigator.vibrate(pattern); } catch(_) {}
    }

    // Visual fallback (all devices, especially iOS)
    const el = targetEl || document.activeElement;
    if(el && el !== document.body && el.classList){
      el.classList.remove('vayu-shake');
      void el.offsetWidth;
      el.classList.add('vayu-shake');
      setTimeout(() => el.classList.remove('vayu-shake'), 240);
    }
  }

  // Auto-attach to interactive elements
  function attach(){
    document.querySelectorAll('.btn, .ripple-btn, [data-haptic], .exp-tile, .lfm-row, .game-tile')
      .forEach(el => {
        if(el.dataset.hapticBound) return;
        el.dataset.hapticBound = '1';
        el.addEventListener('pointerdown', () => haptic(el.dataset.haptic || 'tap', el));
      });
  }

  document.addEventListener('DOMContentLoaded', attach);
  new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });

  window.VayuHaptics = {
    fire: haptic,
    attach,
    enable(){ enabled = true; },
    disable(){ enabled = false; },
    patterns
  };
})();
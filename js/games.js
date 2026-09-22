/* ============================================================
   Vayu Games — hub
   Grants a token when a game is selected and redirects to its
   standalone page. Game engines live in their own JS files.
   ============================================================ */
(function(){
  'use strict';

  function fmtScore(v){
    const s = String(v || '0');
    if(s.length <= 15) return s;
    return s.slice(0, 6) + '…' + s.slice(-4);
  }

  const GAMES = {
    flappy: {
      id: 'flappy',
      title: 'Flappy Bird',
      tagline: 'Endless flap · one tap, one pipe, one life',
      icon: '🐦',
      difficulty: 'Medium',
      controls: {
        pc: 'Space or ↑ or click to flap · Backspace to pause',
        mobile: 'Tap anywhere to flap · tap ⏸ to pause'
      },
      desc: 'Sprint through neon pipes. One hit ends the run. Score = pipes cleared. Speed ramps up every 10 seconds.',
      page: '/Flappybird.html'
    }
  };

  async function init(){
    const root = document.getElementById('vayu-games');
    if(!root) return;

    root.innerHTML = `
      <div class="games-grid" data-games-grid></div>
      <div class="game-detail" data-game-detail hidden></div>
      <div class="games-hub-note">
        <span class="games-hub-note-icon">🔒</span>
        <span>Games open in their own page. A short-lived access token is issued when you click Play.</span>
      </div>
    `;

    const gridEl   = root.querySelector('[data-games-grid]');
    const detailEl = root.querySelector('[data-game-detail]');

    const scores = {};
    for(const id of Object.keys(GAMES)){
      try { scores[id] = await window.VayuGameVault.load(id); }
      catch(_) { scores[id] = { highScore: '0' }; }
    }

    gridEl.innerHTML = Object.values(GAMES).map(g => `
      <button class="game-tile" data-game="${g.id}" type="button">
        <div class="game-tile-icon">${g.icon}</div>
        <div class="game-tile-body">
          <div class="game-tile-title">${g.title}</div>
          <div class="game-tile-tagline">${g.tagline}</div>
          <div class="game-tile-meta">
            <span class="game-tag">${g.difficulty}</span>
            <span class="game-score">HIGH · ${fmtScore(scores[g.id].highScore)}</span>
          </div>
        </div>
        <div class="game-tile-arrow">›</div>
      </button>
    `).join('');

    gridEl.querySelectorAll('.game-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        if(window.VayuHaptics) window.VayuHaptics.fire('medium', tile);
        showDetail(tile.dataset.game);
      });
    });

    function showDetail(id){
      const g = GAMES[id];
      if(!g) return;
      const hs = scores[id].highScore || '0';

      gridEl.hidden = true;
      detailEl.hidden = false;
      detailEl.innerHTML = `
        <div class="game-detail-head">
          <button class="game-back" type="button" data-back>← All games</button>
        </div>
        <div class="game-detail-body">
          <div class="game-detail-icon">${g.icon}</div>
          <h3 class="game-detail-title">${g.title}</h3>
          <p class="game-detail-tagline">${g.tagline}</p>
          <p class="game-detail-desc">${g.desc}</p>

          <div class="game-guide">
            <div class="game-guide-card">
              <div class="game-guide-icon">🖥️</div>
              <div class="game-guide-label">PC</div>
              <div class="game-guide-text">${g.controls.pc}</div>
            </div>
            <div class="game-guide-card">
              <div class="game-guide-icon">📱</div>
              <div class="game-guide-label">Mobile</div>
              <div class="game-guide-text">${g.controls.mobile}</div>
            </div>
          </div>

          <div class="game-detail-hs">
            <span class="game-detail-hs-label">High score</span>
            <span class="game-detail-hs-value">${hs}</span>
            <span class="game-detail-hs-bits">64-bit BigInt</span>
          </div>

          <div class="game-detail-actions">
            <button class="btn primary" type="button" data-play="${id}">▶ Play</button>
            <button class="btn ghost" type="button" data-reset="${id}">Reset score</button>
          </div>
        </div>
      `;

      detailEl.querySelector('[data-back]').addEventListener('click', backToGrid);
      detailEl.querySelector('[data-reset]').addEventListener('click', async () => {
        if(window.VayuHaptics) window.VayuHaptics.fire('error');
        await window.VayuGameVault.clear(id);
        scores[id] = { highScore: '0' };
        showDetail(id);
      });
      detailEl.querySelector('[data-play]').addEventListener('click', () => {
        if(window.VayuHaptics) window.VayuHaptics.fire('game');
        const grant = window.VayuGameToken.grant(id);
        if(grant) location.href = grant.page;
      });
    }

    function backToGrid(){
      detailEl.hidden = true;
      gridEl.hidden = false;
      refreshGrid();
    }

    async function refreshGrid(){
      for(const id of Object.keys(GAMES)){
        try { scores[id] = await window.VayuGameVault.load(id); }
        catch(_) {}
      }
      gridEl.querySelectorAll('.game-tile').forEach(tile => {
        const id = tile.dataset.game;
        const el = tile.querySelector('.game-score');
        if(el) el.textContent = 'HIGH · ' + fmtScore(scores[id].highScore);
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
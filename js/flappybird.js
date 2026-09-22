/* ============================================================
   Vayu Flappy Bird — standalone game page
   - PC: Backspace pauses. Mobile: small pause FAB
   - Game over → 10s auto-restart countdown + Restart / Exit
   - Cursor hidden during play, shown only when paused / game over
   - Persists scores via VayuGameVault
   ============================================================ */
(function(){
  'use strict';

  const GAME_ID = 'flappy';
  const RESTART_SECONDS = 10;

  function init(){
    if(window.VayuGameToken && !window.VayuGameToken.guard(GAME_ID)) return;

    const wrap = document.getElementById('vayu-game-page');
    if(!wrap) return;

    wrap.innerHTML = `
      <div class="game-page-wrap">
        <div class="game-hud">
          <div class="game-hud-left">
            <span class="game-hud-label">SCORE</span>
            <span class="game-hud-value" data-hud-score>0</span>
          </div>
          <div class="game-hud-center" data-hud-msg></div>
          <div class="game-hud-right">
            <span class="game-hud-label">BEST</span>
            <span class="game-hud-value" data-hud-best>0</span>
          </div>
        </div>
        <canvas class="game-canvas" data-canvas></canvas>

        <button class="game-pause-fab" type="button" data-pause-fab aria-label="Pause">⏸</button>

        <div class="game-countdown" data-countdown hidden>
          <div class="game-countdown-value" data-countdown-value>3</div>
        </div>

        <div class="game-pause" data-pause hidden>
          <div class="game-pause-panel">
            <div class="game-pause-title">PAUSED</div>
            <div class="game-pause-sub">Flappy Bird</div>
            <div class="game-pause-score">
              <span class="game-pause-score-label">Score</span>
              <span class="game-pause-score-value" data-pause-score>0</span>
            </div>
            <div class="game-pause-actions">
              <button class="game-pause-btn primary" data-pause-resume type="button">▶ Resume</button>
              <button class="game-pause-btn" data-pause-restart type="button">⟳ Restart</button>
              <button class="game-pause-btn danger" data-pause-exit type="button">← Exit to games</button>
            </div>
            <div class="game-pause-hint"><kbd>⌫</kbd> toggle pause</div>
          </div>
        </div>

        <div class="game-page-over" data-game-over hidden>
          <div class="game-pause-panel">
            <div class="game-pause-title" style="color:#ff8a94;text-shadow:0 0 24px rgba(255,70,87,0.55)">GAME OVER</div>
            <div class="game-pause-sub">Flappy Bird</div>
            <div class="game-pause-score">
              <span class="game-pause-score-label">Score</span>
              <span class="game-pause-score-value" data-go-score>0</span>
            </div>
            <div class="game-pause-score" style="border-color:rgba(99,230,160,0.28);background:rgba(99,230,160,0.06);margin-bottom:20px">
              <span class="game-pause-score-label">Best</span>
              <span class="game-pause-score-value" data-go-best>0</span>
            </div>
            <div class="game-over-countdown">Auto-restart in <strong data-go-countdown>10</strong>s</div>
            <div class="game-pause-actions">
              <button class="game-pause-btn primary" data-go-restart type="button">▶ Restart now</button>
              <button class="game-pause-btn danger" data-go-exit type="button">← Exit to games</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas        = wrap.querySelector('[data-canvas]');
    const hudScore      = wrap.querySelector('[data-hud-score]');
    const hudBest       = wrap.querySelector('[data-hud-best]');
    const hudMsg        = wrap.querySelector('[data-hud-msg]');
    const pauseEl       = wrap.querySelector('[data-pause]');
    const pauseScoreEl  = wrap.querySelector('[data-pause-score]');
    const countdownEl   = wrap.querySelector('[data-countdown]');
    const countdownVal  = wrap.querySelector('[data-countdown-value]');
    const pauseFab      = wrap.querySelector('[data-pause-fab]');
    const resumeBtn     = wrap.querySelector('[data-pause-resume]');
    const restartBtn    = wrap.querySelector('[data-pause-restart]');
    const pauseExit     = wrap.querySelector('[data-pause-exit]');
    const gameOverEl    = wrap.querySelector('[data-game-over]');
    const goScoreEl     = wrap.querySelector('[data-go-score]');
    const goBestEl      = wrap.querySelector('[data-go-best]');
    const goCountdownEl = wrap.querySelector('[data-go-countdown]');
    const goRestartBtn  = wrap.querySelector('[data-go-restart]');
    const goExitBtn     = wrap.querySelector('[data-go-exit]');

    let game = null;
    let paused = false;
    let gameState = null;
    let countdownTimers = [];
    let restartInterval = null;
    let startTime = 0;
    let inGameOver = false;

    async function loadHigh(){
      try {
        const data = await window.VayuGameVault.load(GAME_ID);
        hudBest.textContent = window.VayuGameVault.formatHigh(GAME_ID, data.highScore);
      } catch(_) {}
    }
    async function saveScore(score){
      try {
        const data = await window.VayuGameVault.recordPlay(GAME_ID, score, Date.now() - startTime);
        hudBest.textContent = window.VayuGameVault.formatHigh(GAME_ID, data.highScore);
        return data;
      } catch(_) { return null; }
    }

    function popValue(){
      countdownVal.classList.remove('pop');
      void countdownVal.offsetWidth;
      countdownVal.classList.add('pop');
    }
    function cancelCountdown(){
      countdownTimers.forEach(t => clearTimeout(t));
      countdownTimers = [];
      countdownEl.hidden = true;
    }
    function runCountdown(done){
      cancelCountdown();
      countdownEl.hidden = false;
      countdownVal.textContent = '3';
      popValue();
      if(window.VayuHaptics) window.VayuHaptics.fire('light');
      let n = 3;
      const iv = setInterval(() => {
        n--;
        if(n === 0){
          countdownVal.textContent = 'GO!';
          popValue();
          if(window.VayuHaptics) window.VayuHaptics.fire('success');
          clearInterval(iv);
          countdownTimers.push(setTimeout(() => {
            countdownEl.hidden = true;
            done();
          }, 420));
        } else {
          countdownVal.textContent = String(n);
          popValue();
          if(window.VayuHaptics) window.VayuHaptics.fire('light');
        }
      }, 1000);
      countdownTimers.push(iv);
    }

    function stopRestartTimer(){
      if(restartInterval){ clearInterval(restartInterval); restartInterval = null; }
    }

    function setPaused(next){
      if(inGameOver) return;
      paused = next;
      pauseEl.hidden = !paused;
      if(paused){
        if(gameState) pauseScoreEl.textContent = gameState.score.toString();
        if(game) game.setPaused(true);
        canvas.classList.add('paused');
        pauseFab.hidden = true;
      } else {
        if(game) game.setPaused(false);
        canvas.classList.remove('paused');
        pauseFab.hidden = false;
      }
    }
    function togglePause(){
      if(countdownEl.hidden === false) return;
      if(inGameOver) return;
      setPaused(!paused);
    }

    function launch(){
      cancelCountdown();
      stopRestartTimer();
      inGameOver = false;
      gameOverEl.hidden = true;

      if(game && game.stop){ try { game.stop(); } catch(_) {} game = null; }
      hudScore.textContent = '0';
      hudMsg.textContent = '';
      canvas.classList.remove('locked');
      canvas.classList.remove('paused');
      pauseEl.hidden = true;
      pauseFab.hidden = false;
      paused = false;
      startTime = Date.now();

      runCountdown(() => {
        game = startFlappy({
          canvas,
          onScore(score){ hudScore.textContent = score.toString(); },
          onGameOver(finalScore){
            showGameOver(finalScore);
          }
        });
        gameState = game.state;
      });
    }

    function showGameOver(finalScore){
      inGameOver = true;
      paused = false;
      cancelCountdown();
      if(game && game.stop){ try { game.stop(); } catch(_) {} game = null; }

      canvas.classList.remove('paused');
      canvas.classList.add('locked');
      pauseFab.hidden = true;
      pauseEl.hidden = true;

      hudMsg.textContent = '';
      goScoreEl.textContent = finalScore.toString();

      saveScore(finalScore).then(data => {
        if(data && data.highScore != null){
          goBestEl.textContent = window.VayuGameVault.formatHigh(GAME_ID, data.highScore);
        } else {
          goBestEl.textContent = window.VayuGameVault.formatHigh(GAME_ID, finalScore);
        }
      });

      if(window.VayuHaptics) window.VayuHaptics.fire('error');

      let remaining = RESTART_SECONDS;
      goCountdownEl.textContent = String(remaining);
      gameOverEl.hidden = false;
      stopRestartTimer();

      restartInterval = setInterval(() => {
        remaining--;
        goCountdownEl.textContent = String(Math.max(0, remaining));
        if(remaining <= 0){
          stopRestartTimer();
          launch();
        }
      }, 1000);
    }

    function exitToHub(){
      cancelCountdown();
      stopRestartTimer();
      if(game && game.stop){ try { game.stop(); } catch(_) {} }
      if(window.VayuGameToken) window.VayuGameToken.consume();
      location.href = '/games';
    }

    pauseFab.addEventListener('click', (e) => { e.preventDefault(); togglePause(); });
    resumeBtn.addEventListener('click', (e) => { e.preventDefault(); setPaused(false); });
    restartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if(window.VayuHaptics) window.VayuHaptics.fire('game');
      launch();
    });
    pauseExit.addEventListener('click', (e) => { e.preventDefault(); exitToHub(); });

    goRestartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if(window.VayuHaptics) window.VayuHaptics.fire('game');
      launch();
    });
    goExitBtn.addEventListener('click', (e) => { e.preventDefault(); exitToHub(); });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace'){
        e.preventDefault();
        togglePause();
      }
      if(e.key === 'Escape'){
        e.preventDefault();
        exitToHub();
      }
    });

    loadHigh().then(launch);

    /* ============================================================
       FLAPPY ENGINE
       ============================================================ */
    function startFlappy(opts){
      const ctx = canvas.getContext('2d');

      let W = 0, H = 0, dpr = 1;
      const S = {
        running: true,
        paused: false,
        bird: { x: 90, y: 0, vy: 0, r: 13, rot: 0 },
        pipes: [],
        spawnTimer: 0,
        spawnInterval: 90,
        pipeWidth: 62,
        gapHeight: 158,
        speed: 2.7,
        score: BigInt(0),
        elapsed: 0,
        groundY: 0,
        stars: []
      };

      function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        S.groundY = H - 64;
        S.bird.y = Math.min(S.bird.y || (H / 2), S.groundY - 60);
        if(!S.stars.length){
          S.stars = Array.from({length: 40}, () => ({
            x: Math.random() * W,
            y: Math.random() * (S.groundY - 40),
            r: Math.random() * 1.3 + 0.3,
            tw: Math.random() * Math.PI * 2
          }));
        }
      }

      function flap(){
        if(!S.running || S.paused) return;
        S.bird.vy = -6.4;
        if(window.VayuHaptics) window.VayuHaptics.fire('light');
      }

      function spawnPipe(){
        const margin = 60;
        const maxY = S.groundY - S.gapHeight - margin;
        const gapY = margin + Math.random() * Math.max(20, maxY - margin);
        S.pipes.push({ x: W + 20, gapY, passed: false });
      }

      function loop(){
        if(!S.running) return;
        requestAnimationFrame(loop);
        if(S.paused){ draw(); return; }

        S.elapsed++;
        const seconds = S.elapsed / 60;
        S.speed = 2.7 + Math.min(2.2, seconds * 0.14);
        S.spawnInterval = Math.max(58, 90 - seconds * 1.6);

        S.bird.vy += 0.36;
        S.bird.y += S.bird.vy;
        S.bird.rot = Math.max(-0.5, Math.min(1, S.bird.vy * 0.06));

        if(S.bird.y - S.bird.r < 0){ S.bird.y = S.bird.r; S.bird.vy = 0; }
        if(S.bird.y + S.bird.r >= S.groundY){
          S.bird.y = S.groundY - S.bird.r;
          return gameOver();
        }

        S.spawnTimer++;
        if(S.spawnTimer >= S.spawnInterval){
          spawnPipe();
          S.spawnTimer = 0;
        }

        for(let i = S.pipes.length - 1; i >= 0; i--){
          const p = S.pipes[i];
          p.x -= S.speed;
          if(S.bird.x + S.bird.r > p.x && S.bird.x - S.bird.r < p.x + S.pipeWidth){
            if(S.bird.y - S.bird.r < p.gapY || S.bird.y + S.bird.r > p.gapY + S.gapHeight){
              return gameOver();
            }
          }
          if(!p.passed && p.x + S.pipeWidth < S.bird.x - S.bird.r){
            p.passed = true;
            S.score += BigInt(1);
            opts.onScore(S.score);
            if(window.VayuHaptics) window.VayuHaptics.fire('tap');
          }
          if(p.x + S.pipeWidth < -20) S.pipes.splice(i, 1);
        }

        draw();
      }

      function gameOver(){
        S.running = false;
        opts.onGameOver(S.score);
      }

      function draw(){
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#08131f');
        grad.addColorStop(0.7, '#0a1626');
        grad.addColorStop(1, '#04080f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        S.stars.forEach(s => {
          s.tw += 0.03;
          const alpha = 0.35 + Math.sin(s.tw) * 0.25;
          ctx.fillStyle = 'rgba(180,220,255,' + alpha + ')';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });

        S.pipes.forEach(p => {
          ctx.shadowColor = '#63e6a0';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#63e6a0';
          ctx.fillRect(p.x, 0, S.pipeWidth, p.gapY);
          ctx.fillRect(p.x, p.gapY + S.gapHeight, S.pipeWidth, S.groundY - (p.gapY + S.gapHeight));
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.14)';
          ctx.fillRect(p.x + 6, 0, 3, p.gapY);
          ctx.fillRect(p.x + 6, p.gapY + S.gapHeight, 3, S.groundY - (p.gapY + S.gapHeight));
        });

        ctx.fillStyle = '#0a1626';
        ctx.fillRect(0, S.groundY, W, H - S.groundY);
        ctx.strokeStyle = '#42d8ff';
        ctx.shadowColor = '#42d8ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, S.groundY);
        ctx.lineTo(W, S.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.translate(S.bird.x, S.bird.y);
        ctx.rotate(S.bird.rot);
        ctx.shadowColor = '#ffd24a';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#ffd24a';
        ctx.beginPath();
        ctx.arc(0, 0, S.bird.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff3a8';
        ctx.beginPath();
        ctx.arc(-3, -3, S.bird.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(5, -4, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff8a3d';
        ctx.beginPath();
        ctx.moveTo(S.bird.r - 2, 0);
        ctx.lineTo(S.bird.r + 8, 2);
        ctx.lineTo(S.bird.r - 2, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(85,217,255,0.4)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#42d8ff';
        ctx.shadowBlur = 18;
        ctx.strokeRect(1, 1, W - 2, H - 2);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('speed ×' + S.speed.toFixed(1), 14, 24);
      }

      const onKey = (e) => {
        if(S.paused) return;
        if(e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w'){
          e.preventDefault();
          flap();
        }
      };
      const onTouch = (e) => {
        if(S.paused) return;
        if(e.target === canvas){ e.preventDefault(); flap(); }
      };
      const onPointerDown = (e) => {
        if(S.paused) return;
        if(e.target === canvas){ e.preventDefault(); flap(); }
      };
      window.addEventListener('keydown', onKey);
      canvas.addEventListener('touchstart', onTouch, { passive: false });
      canvas.addEventListener('pointerdown', onPointerDown);

      resize();
      window.addEventListener('resize', resize);
      loop();

      return {
        state: S,
        setPaused(next){ S.paused = next; },
        stop(){
          S.running = false;
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('resize', resize);
          canvas.removeEventListener('touchstart', onTouch);
          canvas.removeEventListener('pointerdown', onPointerDown);
        }
      };
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
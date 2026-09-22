/* ============================================================
   Vayu Games — Token gate + persistent vault
   - games.html grants a short-lived token for a specific game
   - Flappybird.html validates it before booting
   - Scores / stats saved to localStorage + cookie + Cache API
   ============================================================ */
(function(){
  'use strict';

  const TOKEN_KEY  = 'vayu-game-token';
  const COOKIE_KEY = 'vayu-game-token';
  const TTL_MS     = 10 * 60 * 1000;  // 10 minutes

  const VALID_GAMES = ['flappy'];

  function pageFor(gameId){
    if(gameId === 'flappy') return '/Flappybird.html';
    return '/games';
  }

  /* ============================================================
     TOKEN — grant (hub) / validate (game page)
     ============================================================ */
  function grantToken(gameId){
    if(VALID_GAMES.indexOf(gameId) === -1) return null;
    const token = 'vg_' + gameId + '_' + Date.now() + '_' +
                  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const payload = {
      game: gameId,
      token,
      issued: Date.now(),
      expires: Date.now() + TTL_MS
    };
    try {
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
    } catch(_) {}
    try {
      document.cookie = COOKIE_KEY + '=' + token +
        ';path=/;max-age=' + Math.floor(TTL_MS / 1000) + ';SameSite=Lax';
    } catch(_) {}
    return { token, page: pageFor(gameId) };
  }

  function validateToken(expectedGame){
    let payload = null;
    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      if(raw) payload = JSON.parse(raw);
    } catch(_) {}
    if(!payload || payload.game !== expectedGame) return false;
    if(Date.now() > payload.expires) return false;
    try {
      const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY + '=([^;]+)'));
      if(!m || m[1] !== payload.token) return false;
    } catch(_) { return false; }
    return true;
  }

  function consumeToken(){
    try { sessionStorage.removeItem(TOKEN_KEY); } catch(_) {}
    try { document.cookie = COOKIE_KEY + '=;path=/;max-age=0'; } catch(_) {}
  }

  function guardPage(expectedGame){
    if(!validateToken(expectedGame)){
      try { location.replace('/games'); } catch(_) { location.href = '/games'; }
      return false;
    }
    return true;
  }

  /* ============================================================
     VAULT — persistent storage (localStorage + cookie + cache)
     ============================================================ */
  const VAULT_PREFIX = 'vayu-game-data-';

  function cookieWrite(gameId, data){
    try {
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = 'vayu-' + gameId + '-high=' + encodeURIComponent(data.highScore) +
        ';path=/;max-age=' + maxAge + ';SameSite=Lax';
      document.cookie = 'vayu-' + gameId + '-plays=' + data.plays +
        ';path=/;max-age=' + maxAge + ';SameSite=Lax';
      document.cookie = 'vayu-' + gameId + '-best=' + data.bestScore +
        ';path=/;max-age=' + maxAge + ';SameSite=Lax';
    } catch(_) {}
  }

  function cookieRead(gameId){
    try {
      const get = (k) => {
        const m = document.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]+)'));
        return m ? decodeURIComponent(m[1]) : null;
      };
      return {
        highScore: get('vayu-' + gameId + '-high'),
        plays:     parseInt(get('vayu-' + gameId + '-plays') || '0', 10),
        bestScore: get('vayu-' + gameId + '-best')
      };
    } catch(_) { return null; }
  }

  function cacheWrite(gameId, data){
    if(!window.caches) return;
    try {
      caches.open('vayu-game-vault').then(cache => {
        const body = JSON.stringify(data);
        cache.put('/__game/' + gameId, new Response(body, {
          headers: { 'Content-Type': 'application/json' }
        })).catch(() => {});
      }).catch(() => {});
    } catch(_) {}
  }

  async function cacheRead(gameId){
    if(!window.caches) return null;
    try {
      const res = await caches.match('/__game/' + gameId);
      if(!res) return null;
      return await res.json();
    } catch(_) { return null; }
  }

  function localStorageWrite(gameId, data){
    try {
      localStorage.setItem(VAULT_PREFIX + gameId, JSON.stringify(data));
    } catch(_) {}
  }
  function localStorageRead(gameId){
    try {
      const raw = localStorage.getItem(VAULT_PREFIX + gameId);
      if(!raw) return null;
      return JSON.parse(raw);
    } catch(_) { return null; }
  }

  const VAULT = {
    async load(gameId){
      const ls = localStorageRead(gameId);
      const ck = cookieRead(gameId);
      const cch = await cacheRead(gameId);

      let merged = {
        highScore: '0',
        plays: 0,
        bestScore: '0',
        totalTime: 0,
        updated: 0
      };
      if(cch){ merged = Object.assign(merged, cch); }
      if(ls && (ls.updated || 0) >= (merged.updated || 0)) merged = Object.assign(merged, ls);
      if(ck && ck.highScore){
        try {
          const ckBig = BigInt(ck.highScore || '0');
          const mergedBig = BigInt(merged.highScore || '0');
          if(ckBig > mergedBig) merged.highScore = ck.highScore;
        } catch(_) {}
      }
      return merged;
    },

    async save(gameId, patch){
      const cur = await VAULT.load(gameId);
      const next = Object.assign({}, cur, patch);
      next.updated = Date.now();

      try {
        const curBig = BigInt(cur.highScore || '0');
        const patchBig = BigInt(patch.highScore || '0');
        next.highScore = (patchBig > curBig ? patchBig : curBig).toString();
      } catch(_) { next.highScore = String(next.highScore || '0'); }

      localStorageWrite(gameId, next);
      cookieWrite(gameId, next);
      cacheWrite(gameId, next);
      return next;
    },

    async recordPlay(gameId, score, elapsedMs){
      const cur = await VAULT.load(gameId);
      let high = cur.highScore || '0';
      let best = cur.bestScore || '0';
      try {
        const s = BigInt(String(score || '0'));
        if(s > BigInt(high)) high = s.toString();
        if(s > BigInt(best)) best = s.toString();
      } catch(_) {}

      return VAULT.save(gameId, {
        highScore: high,
        bestScore: best,
        plays: (cur.plays || 0) + 1,
        totalTime: (cur.totalTime || 0) + (elapsedMs || 0)
      });
    },

    async clear(gameId){
      try { localStorage.removeItem(VAULT_PREFIX + gameId); } catch(_) {}
      try {
        document.cookie = 'vayu-' + gameId + '-high=;path=/;max-age=0';
        document.cookie = 'vayu-' + gameId + '-plays=;path=/;max-age=0';
        document.cookie = 'vayu-' + gameId + '-best=;path=/;max-age=0';
      } catch(_) {}
      try {
        if(window.caches){
          const c = await caches.open('vayu-game-vault');
          await c.delete('/__game/' + gameId);
        }
      } catch(_) {}
    },

    formatHigh(gameId, value){
      const s = String(value || '0');
      if(s.length <= 15) return s;
      return s.slice(0, 6) + '…' + s.slice(-4);
    }
  };

  window.VayuGameToken = {
    grant: grantToken,
    validate: validateToken,
    consume: consumeToken,
    guard: guardPage,
    pageFor: pageFor
  };
  window.VayuGameVault = VAULT;
})();
/* ============================================================
   Vayu GitHub Stats - combined Vayu + VCB commits
   Uses the GitHub REST API. Caches for 5 minutes.
   ============================================================ */
(function(){
  'use strict';

  const REPOS = ['NotY215/Vayu', 'NotY215/VCB'];
  const CACHE_KEY = 'vayu-gh-stats-v3';
  const CACHE_TTL = 5 * 60 * 1000;
  const HEADERS = { 'Accept': 'application/vnd.github+json' };

  function parseLastPage(linkHeader){
    if(!linkHeader) return null;
    const parts = linkHeader.split(',');
    for(const part of parts){
      const m = part.match(/<[^>]*[?&]page=(\d+)[^>]*>\s*;\s*rel="last"/i);
      if(m) return parseInt(m[1], 10);
    }
    return null;
  }

  async function countCommits(repo){
    const API = 'https://api.github.com/repos/' + repo + '/commits';
    const first = await fetch(API + '?per_page=100&page=1', { headers: HEADERS });
    if(!first.ok) throw new Error(repo + ' commits ' + first.status);
    const data = await first.json();
    if(!Array.isArray(data)) throw new Error(repo + ' unexpected commits payload');
    if(data.length === 0) return 0;

    const lastPage = parseLastPage(first.headers.get('Link'));
    if(lastPage && lastPage > 1){
      const last = await fetch(API + '?per_page=100&page=' + lastPage, { headers: HEADERS });
      if(!last.ok) throw new Error(repo + ' commits page ' + lastPage + ' ' + last.status);
      const lastData = await last.json();
      const lastCount = Array.isArray(lastData) ? lastData.length : 0;
      return (lastPage - 1) * 100 + lastCount;
    }

    // Fallback when Link is missing: walk pages (capped).
    let total = data.length;
    if(data.length < 100) return total;
    let page = 2;
    while(page <= 50){
      const res = await fetch(API + '?per_page=100&page=' + page, { headers: HEADERS });
      if(!res.ok) throw new Error(repo + ' commits page ' + page + ' ' + res.status);
      const chunk = await res.json();
      if(!Array.isArray(chunk) || chunk.length === 0) break;
      total += chunk.length;
      if(chunk.length < 100) break;
      page++;
    }
    return total;
  }

  async function countToday(repo){
    const API = 'https://api.github.com/repos/' + repo + '/commits';
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const res = await fetch(
      API + '?since=' + encodeURIComponent(start.toISOString()) +
      '&until=' + encodeURIComponent(end.toISOString()) +
      '&per_page=100',
      { headers: HEADERS }
    );
    if(!res.ok) throw new Error(repo + ' today ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  }

  async function fetchRepoStats(repo){
    const [total, today] = await Promise.all([
      countCommits(repo),
      countToday(repo)
    ]);
    return { total, today };
  }

  async function fetchCombinedStats(){
    const stats = await Promise.all(REPOS.map(fetchRepoStats));
    return stats.reduce((sum, item) => ({
      total: sum.total + item.total,
      today: sum.today + item.today
    }), { total: 0, today: 0 });
  }

  function fmt(n){ return n.toLocaleString('en-US'); }

  function setStat(name, value){
    const el = document.querySelector('[data-gh-' + name + ']');
    if(!el) return;
    if(typeof value !== 'number'){ el.textContent = value; return; }
    const from = parseInt(String(el.textContent).replace(/[^\d]/g, ''), 10) || 0;
    const t0 = performance.now();
    const duration = 900;
    function step(now){
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(from + (value - from) * eased));
      if(t < 1) requestAnimationFrame(step);
      else el.textContent = fmt(value);
    }
    requestAnimationFrame(step);
  }

  function setStatus(text, cls){
    const el = document.querySelector('[data-gh-status]');
    if(!el) return;
    el.textContent = text;
    el.className = 'gh-live-stat-value' + (cls ? ' ' + cls : '');
  }

  async function refresh(){
    const root = document.querySelector('[data-gh-stats]');
    if(!root) return;

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && Date.now() - cached.ts < CACHE_TTL){
        setStat('total', cached.total);
        setStat('today', cached.today);
        setStatus('Live', 'live');
        return;
      }
    } catch(_) {}

    setStatus('…');
    try {
      const { total, today } = await fetchCombinedStats();
      setStat('total', total);
      setStat('today', today);
      setStatus('Live', 'live');
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          total, today, ts: Date.now()
        }));
      } catch(_) {}
    } catch(err){
      console.warn('[Vayu GitHub stats]', err);
      const msg = String(err && err.message || err);
      if(/\b403\b/.test(msg) || /rate limit/i.test(msg)){
        setStatus('Rate limited', 'error');
      } else if(/\b404\b/.test(msg)){
        setStatus('Unavailable', 'error');
      } else {
        setStatus('Offline', 'error');
      }
    }
  }

  function init(){
    if(!document.querySelector('[data-gh-stats]')) return;
    refresh();
    setInterval(refresh, CACHE_TTL);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.VayuGithubStats = { refresh };
})();

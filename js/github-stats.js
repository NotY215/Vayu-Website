/* ============================================================
   Vayu GitHub Stats — combined Vayu + VCB commits
   Uses the GitHub REST API. Caches for 5 minutes.
   ============================================================ */
(function(){
  'use strict';

  const REPOS = ['NotY215/Vayu', 'NotY215/VCB'];
  const CACHE_KEY = 'vayu-gh-stats-v2';
  const CACHE_TTL = 5 * 60 * 1000;

  async function fetchRepoStats(repo){
    const API = 'https://api.github.com/repos/' + repo;

    const totalRes = await fetch(API + '/commits?per_page=1', {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if(!totalRes.ok) throw new Error(repo + ' API ' + totalRes.status);

    let total = 0;
    const link = totalRes.headers.get('Link');
    if(link){
      const m = link.match(/[?&]page=(\\d+)>;\\s*rel="last"/);
      if(m) total = parseInt(m[1], 10);
    }
    if(!total){
      const data = await totalRes.json();
      total = Array.isArray(data) ? data.length : 0;
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const todayRes = await fetch(API + '/commits?since=' + start.toISOString() +
      '&until=' + end.toISOString() + '&per_page=100', {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
    if(!todayRes.ok) throw new Error(repo + ' API ' + todayRes.status);
    const todayData = await todayRes.json();

    return {
      total,
      today: Array.isArray(todayData) ? todayData.length : 0
    };
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
      setStatus('N/A', 'error');
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
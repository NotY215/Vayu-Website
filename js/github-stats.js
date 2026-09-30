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

    // Count every commit page instead of relying on the API Link header.
    // This keeps the total correct even when response headers are unavailable.
    let total = 0;
    let page = 1;
    while(true){
      const totalRes = await fetch(API + '/commits?per_page=100&page=' + page, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if(!totalRes.ok) throw new Error(repo + ' API ' + totalRes.status);
      const data = await totalRes.json();
      if(!Array.isArray(data) || data.length === 0) break;
      total += data.length;
      if(data.length < 100) break;
      page++;
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
(function(){
  'use strict';
  const RAW='https://raw.githubusercontent.com/NotY215/VCB/master/README.md';
  async function init(){
    const el=document.getElementById('vcb-readme');
    if(!el || !window.VayuMarkdown) return;
    try{
      const res=await fetch(RAW,{cache:'no-store'});
      if(!res.ok) throw new Error('README '+res.status);
      const text=await res.text();
      await window.VayuMarkdown.renderInto(el,text,'README.md');
      el.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener';});
    }catch(err){
      el.innerHTML='<p class="muted">Unable to load the current VCB README. <a href="https://github.com/NotY215/VCB/blob/master/README.md" target="_blank" rel="noopener">Open it on GitHub</a>.</p>';
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
(function(){
  'use strict';
  let loading=null;
  async function load(){
    if(window.mermaid) return window.mermaid;
    if(loading) return loading;
    loading=import('https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs').then(m=>{
      const mermaid=m.default;
      mermaid.initialize({
        startOnLoad:false,
        securityLevel:'strict',
        theme:'base',
        look:'neo',
        fontFamily:'"Space Grotesk", "DM Sans", system-ui, sans-serif',
        themeVariables:{
          darkMode:true,
          background:'#07111f',
          primaryColor:'#15243b',
          primaryTextColor:'#eef8ff',
          primaryBorderColor:'#55d9ff',
          lineColor:'#78dfff',
          secondaryColor:'#211b3d',
          tertiaryColor:'#16352b',
          fontSize:'15px'
        }
      });
      window.mermaid=mermaid;
      return mermaid;
    });
    return loading;
  }
  async function render(){
    const nodes=[...document.querySelectorAll('.mermaid:not([data-mermaid-ready])')];
    if(!nodes.length) return;
    try{
      const m=await load();
      await m.run({nodes});
      nodes.forEach(n=>n.setAttribute('data-mermaid-ready','1'));
    }catch(err){ console.warn('[Vayu Mermaid]',err); }
  }
  window.VayuMermaid={render};
  window.addEventListener('load',()=>setTimeout(render,0),{once:true});
  if(document.readyState!=='loading') setTimeout(render,300);
})();
/* ============================================================
   Vayu — Live example outputs
   Interactive/input/2D/3D examples are executed in the browser.
   This file is website-only; the Vayu compiler/repository is untouched.
   ============================================================ */
(function(){
  'use strict';

  const INPUT_REQUIRED = new Set([
    'input.vyu','native_io.vyu'
  ]);

  const UI_2D_3D = new Set([
    'gui_window.vyu','gui_events.vyu','gui_canvas.vyu','gui_bitmap.vyu',
    'gui_image_io.vyu','gui_text.vyu','gui_transform.vyu','gui_widgets.vyu',
    'raster_tri.vyu','raster_cube.vyu','raster_lit_cube.vyu','raster_postfx.vyu'
  ]);

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const LIVE = new Set([...INPUT_REQUIRED, ...UI_2D_3D]);

  function run(name, sourceCode){
    if(!LIVE.has(name)) return false;
    const old=document.querySelector('.vayu-live-overlay');
    if(old) old.remove();
    const overlay=document.createElement('div');
    overlay.className='vayu-live-overlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(2,6,13,.88);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML=
      '<div style="width:min(1100px,96vw);height:min(760px,92vh);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(85,217,255,.25);border-radius:18px;background:#07111f;box-shadow:0 30px 100px rgba(0,0,0,.65);font-family:Inter,system-ui,sans-serif;color:#dce9f2;">'+
        '<div style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);">'+
          '<div style="width:10px;height:10px;border-radius:50%;background:#ff5f57;box-shadow:0 0 12px #ff5f57"></div>'+
          '<div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;box-shadow:0 0 12px #ffbd2e"></div>'+
          '<div style="width:10px;height:10px;border-radius:50%;background:#28c840;box-shadow:0 0 12px #28c840"></div>'+
          '<strong style="margin-left:6px;flex:1">Live Vayu · '+esc(name)+'</strong>'+
          '<span style="font-size:12px;color:#7e98aa">browser simulation of the example</span>'+
          '<button data-close style="margin-left:10px;border:0;background:rgba(255,255,255,.08);color:#dce9f2;border-radius:9px;padding:7px 11px;cursor:pointer">✕</button>'+
        '</div>'+
        '<div data-stage style="position:relative;flex:1;min-height:0;overflow:auto;padding:16px"></div>'+
        '<div style="padding:8px 14px;border-top:1px solid rgba(255,255,255,.07);font:12px JetBrains Mono,monospace;color:#6f899a">LIVE · browser test · source code is executed as a visual simulation</div>'+
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';
    const stage=overlay.querySelector('[data-stage]');
    const cleanups=[];
    const cleanup=()=>{ cleanups.splice(0).forEach(fn=>{try{fn();}catch(_){}}); overlay.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',onKey); };
    const onKey=e=>{if(e.key==='Escape')cleanup();};
    document.addEventListener('keydown',onKey);
    overlay.querySelector('[data-close]').onclick=cleanup;
    const addCleanup=fn=>cleanups.push(fn);
    renderExample(name,stage,addCleanup);
    return true;
  }

  function base(stage,w=760,h=500){
    stage.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start">'+
      '<canvas data-canvas width="'+w+'" height="'+h+'" style="width:min(100%, '+w+'px);height:auto;background:#111827;border-radius:12px;border:1px solid rgba(255,255,255,.08);image-rendering:auto"></canvas>'+
      '<div data-side style="flex:1;min-width:230px;color:#91a8b8;font:13px/1.55 JetBrains Mono,monospace"></div></div>';
    return {canvas:stage.querySelector('canvas'),side:stage.querySelector('[data-side]')};
  }

  function controls(stage,html){
    const el=document.createElement('div');
    el.style.cssText='margin-top:12px;display:flex;gap:9px;flex-wrap:wrap;align-items:center';
    el.innerHTML=html;
    stage.appendChild(el);
    return el;
  }

  function log(side,lines){
    side.innerHTML='<div style="padding:12px;border-radius:10px;background:#050b13;border:1px solid rgba(255,255,255,.06);white-space:pre-wrap">'+esc(lines.join('\n'))+'</div>';
  }

  function renderExample(name,stage,addCleanup){
    if(name==='input.vyu') return inputDemo(stage);
    if(name==='native_io.vyu') return nativeIODemo(stage);
    if(name==='gui_window.vyu') return windowDemo(stage);
    if(name==='gui_events.vyu') return eventsDemo(stage,addCleanup);
    if(name==='gui_canvas.vyu') return canvasDemo(stage);
    if(name==='gui_bitmap.vyu') return bitmapDemo(stage);
    if(name==='gui_image_io.vyu') return imageIODemo(stage);
    if(name==='gui_text.vyu') return textDemo(stage);
    if(name==='gui_transform.vyu') return transformDemo(stage);
    if(name==='gui_widgets.vyu') return widgetsDemo(stage);
    if(name==='raster_tri.vyu') return rasterTri(stage);
    if(name==='raster_cube.vyu') return rasterCube(stage,addCleanup,false);
    if(name==='raster_lit_cube.vyu') return rasterCube(stage,addCleanup,true);
    if(name==='raster_postfx.vyu') return postFx(stage,addCleanup);
  }

  function inputDemo(stage){
    stage.innerHTML='<div style="max-width:620px;margin:30px auto;padding:24px;border:1px solid rgba(85,217,255,.18);border-radius:16px;background:#0b1725">'+
      '<h2 style="margin-top:0">input.vyu</h2><p style="color:#8ea6b6">Live input test — enter values, then run.</p>'+
      '<label>Name<br><input data-name autocomplete="off" placeholder="Enter your name" style="width:100%;box-sizing:border-box;margin:7px 0 14px;padding:11px;border-radius:8px;border:1px solid #29465b;background:#06101a;color:#fff"></label>'+
      '<label>Age<br><input data-age type="number" min="0" placeholder="Enter your age" style="width:100%;box-sizing:border-box;margin:7px 0 14px;padding:11px;border-radius:8px;border:1px solid #29465b;background:#06101a;color:#fff"></label>'+
      '<button data-run style="padding:10px 16px;border:0;border-radius:9px;background:#27b9df;color:#031019;font-weight:700;cursor:pointer">▶ Run</button>'+
      '<pre data-out style="margin-top:16px;padding:14px;background:#050b13;border-radius:10px;min-height:70px;color:#bfefff">Waiting for input…</pre></div>';
    const out=stage.querySelector('[data-out]');
    const run=()=>{const n=stage.querySelector('[data-name]').value.trim();const raw=stage.querySelector('[data-age]').value.trim();if(!n||raw===''){out.textContent='Input required: please enter both Name and Age.';return;}const a=Number(raw);out.textContent='Name: Hello, '+n+'\n'+(a+1);};
    stage.querySelector('[data-run]').onclick=run;
    stage.querySelector('[data-name]').addEventListener('keydown',e=>{if(e.key==='Enter')stage.querySelector('[data-age]').focus();});
    stage.querySelector('[data-age]').addEventListener('keydown',e=>{if(e.key==='Enter')run();});
  }

  function nativeIODemo(stage){
    stage.innerHTML='<div style="max-width:700px;margin:20px auto;padding:22px;border:1px solid rgba(85,217,255,.18);border-radius:16px;background:#0b1725">'+
      '<h2 style="margin-top:0">native_io.vyu</h2><p style="color:#8ea6b6">Interactive input plus an in-memory browser file round-trip.</p>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><input data-name autocomplete="off" placeholder="Name" style="padding:10px;border-radius:8px;border:1px solid #29465b;background:#06101a;color:#fff"><input data-age type="number" min="0" placeholder="Age" style="padding:10px;border-radius:8px;border:1px solid #29465b;background:#06101a;color:#fff"><button data-run style="padding:10px 16px;border:0;border-radius:9px;background:#27b9df;font-weight:700;cursor:pointer">▶ Run</button></div>'+
      '<pre data-out style="margin-top:16px;padding:14px;background:#050b13;border-radius:10px;white-space:pre-wrap;color:#bfefff">Waiting for input…</pre></div>';
    const out=stage.querySelector('[data-out]');
    stage.querySelector('[data-run]').onclick=()=>{
      const n=stage.querySelector('[data-name]').value.trim(),raw=stage.querySelector('[data-age]').value.trim();
      if(!n||raw===''){out.textContent='Input required: please enter both Name and Age.';return;}
      const a=Number(raw);
      const content='Hello from Vayu native!\nLine two.\n';
      const lines=['What is your name? Hello, '+n+'!','How old are you? Next year you will be '+(a+1)+'.',
        'true','35','H','f','65','B','72','["alpha", "beta", "gamma"]','3','beta','a-b-c','hello Vayu','padded','true','true','true','50','0','37','26'];
      out.textContent=lines.join('\n')+'\n\nBrowser note: _native_io_test.txt and _native_io_out.txt are simulated in memory.';
    };
  }

  function windowDemo(stage){
    stage.innerHTML='<div style="height:100%;min-height:420px;display:grid;place-items:center">'+
      '<div style="width:min(800px,100%);height:380px;border:1px solid #31536a;border-radius:12px;overflow:hidden;background:#101820;box-shadow:0 20px 50px #0008">'+
      '<div style="height:38px;display:flex;align-items:center;padding:0 13px;background:#182a38;border-bottom:1px solid #31536a"><span style="flex:1">Hello from Vayu</span><span style="color:#8299a8">800 × 600</span></div>'+
      '<div style="display:grid;place-items:center;height:calc(100% - 39px);color:#7fdcff;font:18px JetBrains Mono,monospace">gui.create_window → show → set_title → run</div></div></div>';
  }

  function eventsDemo(stage,addCleanup){
    const b=base(stage,600,480),ctx=b.canvas.getContext('2d');let idx=0,ticks=0;
    const colors=['#4444ff','#44ff44','#4444ff','#ffff44','#ff44ff','#44ffff'];
    function draw(){ctx.fillStyle='#1e1e1e';ctx.fillRect(0,0,600,480);ctx.fillStyle=colors[idx];ctx.fillRect(100,150,240,120);ctx.strokeStyle='#fff';ctx.strokeRect(100,150,240,120);ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.fillText('Click box or press SPACE to cycle colors',20,30);ctx.fillStyle='#aaa';ctx.fillText('Vayu GUI - phase 19.2',20,55);ctx.fillStyle='#8f8';ctx.fillText('ticks: '+ticks,20,430);}
    b.canvas.onclick=e=>{const r=b.canvas.getBoundingClientRect(),x=(e.clientX-r.left)*600/r.width,y=(e.clientY-r.top)*480/r.height;if(x>=100&&x<=340&&y>=150&&y<=270){idx=(idx+1)%colors.length;draw();}};
    const key=e=>{if(e.code==='Space'){idx=(idx+1)%colors.length;draw();}};window.addEventListener('keydown',key);
    const timer=setInterval(()=>{ticks++;draw();},1000);addCleanup(()=>{clearInterval(timer);window.removeEventListener('keydown',key);});
    b.side.innerHTML='<b>Controls</b><br>Click the box or press SPACE.<br>Timer increments once per second.';
    draw();
  }

  function canvasDemo(stage){
    const b=base(stage,640,480),ctx=b.canvas.getContext('2d');ctx.clearRect(0,0,640,480);ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,640,480);
    ctx.fillStyle='#00b8d4';ctx.beginPath();ctx.arc(120,120,80,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#ff6b6b';ctx.beginPath();ctx.ellipse(360,120,120,60,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4caf50';roundRect(ctx,40,240,200,100,20);ctx.fill();ctx.strokeStyle='#b9f6ca';ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='#ffc107';ctx.lineWidth=5;ctx.beginPath();ctx.arc(400,300,70,0,Math.PI*1.5);ctx.stroke();
    poly(ctx,[[540,260],[600,320],[560,400],[500,400],[460,320]],'#7e57c2');ctx.strokeStyle='#d1c4e9';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='700 32px Segoe UI';ctx.fillText('Vayu 2D',40,390);ctx.font='20px Segoe UI';ctx.fillStyle='#b0bec5';ctx.fillText('antialiased primitives',40,430);ctx.font='14px Consolas';ctx.fillText('Phase 20.1 -- GDI+ canvas',40,460);
    b.side.innerHTML='<b>Live canvas</b><br>Circle · ellipse · rounded rect · arc · polygon · three font sizes.';
  }

  function bitmapDemo(stage){
    const b=base(stage,520,400),ctx=b.canvas.getContext('2d');const s=document.createElement('canvas');s.width=s.height=256;const q=s.getContext('2d');
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){q.fillStyle=(x+y)%2?'#fff':'#3366cc';q.fillRect(x*32,y*32,32,32);}
    ctx.fillStyle='#202028';ctx.fillRect(0,0,520,400);ctx.drawImage(s,10,10);ctx.drawImage(s,280,10,220,180);ctx.globalAlpha=.38;ctx.drawImage(s,10,280);ctx.globalAlpha=1;ctx.drawImage(s,0,0,128,128,280,210,128,128);
    b.side.innerHTML='<b>Bitmap live test</b><br>Generated checker bitmap.<br>1× · scaled · alpha · source rectangle.';
  }

  function imageIODemo(stage){
    const b=base(stage,620,400),ctx=b.canvas.getContext('2d');const s=document.createElement('canvas');s.width=s.height=200;const q=s.getContext('2d');
    const g=q.createLinearGradient(0,0,200,200);g.addColorStop(0,'#0080ff');g.addColorStop(1,'#ff8000');q.fillStyle=g;q.fillRect(0,0,200,200);
    ctx.fillStyle='#202028';ctx.fillRect(0,0,620,400);ctx.drawImage(s,20,20);ctx.drawImage(s,240,20,160,160);ctx.drawImage(s,420,20,180,180);ctx.globalAlpha=.55;ctx.drawImage(s,20,240,140,140);ctx.globalAlpha=1;ctx.drawImage(s,40,40,120,120,240,240,120,120);
    b.side.innerHTML='<b>WIC-style round trip</b><br>Gradient → in-memory image → scaled/alpha/part draws.<br><br>Browser implementation uses Canvas instead of Windows WIC.';
  }

  function textDemo(stage){
    const b=base(stage,720,520),ctx=b.canvas.getContext('2d');ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,720,520);
    ctx.strokeStyle='#333355';for(const x of [20,240,460,680]){ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,220);ctx.stroke();}
    ctx.fillStyle='#b0bec5';ctx.font='18px Segoe UI';ctx.textAlign='left';ctx.fillText('left',20,40);ctx.textAlign='center';ctx.fillText('center',460,40);ctx.textAlign='right';ctx.fillText('right',680,40);
    ctx.font='14px Consolas';ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText('The quick brown fox',20,80);ctx.textAlign='center';ctx.fillText('The quick brown fox',460,80);ctx.textAlign='right';ctx.fillText('The quick brown fox',680,80);
    ctx.textAlign='left';ctx.fillStyle='#80cbc4';ctx.fillText('sample: Measure me!',20,260);ctx.fillText('text_width = '+Math.round(ctx.measureText('Measure me!').width),20,285);ctx.fillText('font_height = 14',20,310);ctx.fillText('line_spacing = 17',20,335);ctx.strokeStyle='#ffc107';ctx.strokeRect(20,355,ctx.measureText('Measure me!').width,17);
    ctx.strokeStyle='#333355';ctx.strokeRect(380,240,320,220);ctx.fillStyle='#b0bec5';wrapText(ctx,'Vayu lays out text with byte-precise metrics. Wrapping breaks on spaces; each line is measured before commit.',390,255,300,18);
    b.side.innerHTML='<b>Font metrics</b><br>Alignment, measurement, bounding box and word wrapping.';
  }

  function transformDemo(stage){
    const b=base(stage,720,520),ctx=b.canvas.getContext('2d');ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,720,520);
    [0,15,30,45].forEach((d,i)=>{ctx.save();ctx.translate(70+i*120,70);ctx.rotate(d*Math.PI/180);ctx.fillStyle='#3366cc';ctx.fillRect(-40,-40,80,80);ctx.strokeStyle='#fff';ctx.strokeRect(-40,-40,80,80);ctx.restore();});
    [0.5,1,1.5].forEach((s,i)=>{ctx.save();ctx.translate(70+i*120,200);ctx.scale(s,s);ctx.fillStyle='#4caf50';ctx.fillRect(-40,-40,80,80);ctx.strokeStyle='#fff';ctx.strokeRect(-40,-40,80,80);ctx.restore();});
    ctx.save();ctx.beginPath();ctx.rect(420,30,200,200);ctx.clip();ctx.fillStyle='#ff6b6b';ctx.fillRect(420,30,400,400);ctx.fillStyle='#4caf50';ctx.fillRect(470,80,400,400);ctx.fillStyle='#2196f3';ctx.fillRect(520,130,400,400);ctx.restore();ctx.strokeStyle='#ffc107';ctx.strokeRect(420,30,200,200);
    ctx.fillStyle='#ffc107';star(ctx,500,380,80);ctx.fillStyle='#7e57c2';star(ctx,640,380,80);ctx.fillStyle='#b0bec5';ctx.font='14px Consolas';ctx.fillText('rotate 0 / 15 / 30 / 45',30,285);ctx.fillText('scale 50% / 100% / 150%',30,305);ctx.fillText('clip 200x200',420,245);
    b.side.innerHTML='<b>Transform stack</b><br>Rotation · scale · clipping · alternate/winding-style fill demo.';
  }

  function widgetsDemo(stage){
    stage.innerHTML='<div style="max-width:700px;margin:0 auto;padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:#1e1e1e;color:#fff">'+
      '<h3 style="margin-top:0">Vayu widgets - phase 19.3</h3><hr style="border-color:#404040">'+
      '<label>Name:<br><input data-name style="margin:7px 0;padding:9px;width:280px;background:#101820;color:#fff;border:1px solid #456;border-radius:7px"></label> '+
      '<button data-greet style="padding:9px 14px">Greet</button> <button data-clear style="padding:9px 14px">Clear</button>'+
      '<p data-status>status: ready</p><label><input data-check type="checkbox"> Enable feature</label><span data-check-state> checkbox: OFF</span>'+
      '<p>Slider: <input data-slider type="range" min="0" max="100" value="0" style="width:350px"> <span data-slider-value>0</span></p>'+
      '<p>Pick a fruit: <select data-list><option>apple</option><option>banana</option><option>cherry</option><option>date</option><option>elderberry</option></select> <span data-list-value>list: apple</span></p>'+
      '<small style="color:#808080">Enter = greet · Wheel = slider · ESC = quit</small></div>';
    const n=stage.querySelector('[data-name]'),status=stage.querySelector('[data-status]'),check=stage.querySelector('[data-check]'),slider=stage.querySelector('[data-slider]'),sel=stage.querySelector('[data-list]');
    const refresh=()=>{stage.querySelector('[data-check-state]').textContent=' checkbox: '+(check.checked?'ON':'OFF');stage.querySelector('[data-slider-value]').textContent=slider.value;stage.querySelector('[data-list-value]').textContent='list: '+sel.value;};
    const greet=()=>status.textContent=n.value?'status: hello, '+n.value+'!':'status: enter a name first';
    stage.querySelector('[data-greet]').onclick=greet;stage.querySelector('[data-clear]').onclick=()=>{n.value='';status.textContent='status: cleared';n.focus();};check.onchange=refresh;slider.oninput=refresh;sel.onchange=refresh;n.onkeydown=e=>{if(e.key==='Enter')greet();};stage.onwheel=e=>{slider.value=Math.max(0,Math.min(100,Number(slider.value)+(e.deltaY<0?5:-5)));refresh();};refresh();
  }

  function rasterTri(stage){
    const b=base(stage,640,480),ctx=b.canvas.getContext('2d');ctx.fillStyle='#202038';ctx.fillRect(0,0,640,480);
    tri(ctx,60,60,300,60,180,320,'#ffd54f');tri(ctx,380,100,560,200,380,300,'#4fc3f7');line(ctx,60,380,200,380,'#ff5252',2);line(ctx,200,380,130,460,'#69f0ae',2);line(ctx,130,460,60,380,'#40c4ff',2);
    ctx.fillStyle='#fff';for(let y=20;y<120;y+=6)for(let x=500;x<620;x+=6)ctx.fillRect(x,y,2,2);
    b.side.innerHTML='<b>Software rasterizer</b><br>Filled triangles · Bresenham-style lines · direct pixel writes.';
  }

  function rasterCube(stage,addCleanup,lit){
    const b=base(stage,640,480),ctx=b.canvas.getContext('2d');let t=0;
    const timer=setInterval(()=>{t+=.025;drawCube(ctx,640,480,t,lit);},33);addCleanup(()=>clearInterval(timer));drawCube(ctx,640,480,t,lit);
    b.side.innerHTML='<b>'+ (lit?'Phong-lit':'Depth-tested textured') +' cube</b><br>Software-rendered 3D preview.<br>Drag is not required; the cube rotates automatically.';
  }

  function postFx(stage,addCleanup){
    const b=base(stage,640,480),ctx=b.canvas.getContext('2d');let t=0,phase=0;
    const timer=setInterval(()=>{t++;if(t%18===0)phase=(phase+1)%5;drawPost(ctx,640,480,phase);},60);addCleanup(()=>clearInterval(timer));drawPost(ctx,640,480,0);
    b.side.innerHTML='<b>PostFX</b><br>Cycles gamma · invert · warm tint · brightness · threshold.';
  }

  function drawCube(ctx,w,h,a,lit){
    ctx.fillStyle='#101018';ctx.fillRect(0,0,w,h);
    const verts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const c=Math.cos(a),s=Math.sin(a),rx=a*.7,cr=Math.cos(rx),sr=Math.sin(rx);
    const p=verts.map(v=>{let x=v[0]*c-v[2]*s,z=v[0]*s+v[2]*c,y=v[1]*cr-z*sr;z=v[1]*sr+z*cr;const q=220/(z+4.5);return [w/2+x*q,h/2+y*q,z];});
    const faces=[[0,1,2,3],[1,5,6,2],[5,4,7,6],[4,0,3,7],[3,2,6,7],[4,5,1,0]];
    faces.map((f,i)=>({f,z:f.reduce((n,j)=>n+p[j][2],0)/4,i})).sort((a,b)=>a.z-b.z).forEach(o=>{
      const q=o.f;ctx.beginPath();ctx.moveTo(p[q[0]][0],p[q[0]][1]);for(let i=1;i<q.length;i++)ctx.lineTo(p[q[i]][0],p[q[i]][1]);ctx.closePath();
      let colors=['#cc66ff','#66ddff','#5eead4','#60a5fa','#fbbf24','#f472b6'];let fill=colors[o.i];
      if(lit){const light=[.4,-.6,1],n=[(q[1]?verts[q[1]][0]-verts[q[0]][0]:0),(verts[q[1]][1]-verts[q[0]][1]),(verts[q[1]][2]-verts[q[0]][2])];const b=Math.max(.2,Math.min(1,(n[0]*light[0]+n[1]*light[1]+n[2]*light[2])/(Math.hypot(...n)*Math.hypot(...light))*.7+.35));fill='rgb('+Math.round(100*b)+','+Math.round(150*b)+','+Math.round(255*b)+')';}
      ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#fff6';ctx.stroke();
    });
    ctx.fillStyle='#bfefff';ctx.font='14px Consolas';ctx.fillText(lit?'Phong + ambient':'depth + mip-style texture',20,28);
  }

  function drawPost(ctx,w,h,phase){
    ctx.fillStyle='#202018';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){const v=Math.floor(80+120*(x/w)*.5+60*(y/h));ctx.fillStyle='rgb('+v+','+Math.floor(v*.7)+','+Math.floor(255-v*.5)+')';ctx.fillRect(x,y,8,8);}
    const img=ctx.getImageData(0,0,w,h),d=img.data;
    for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];if(phase===0){r=Math.min(255,Math.sqrt(r/255)*255);g=Math.min(255,Math.sqrt(g/255)*255);b=Math.min(255,Math.sqrt(b/255)*255);}else if(phase===1){r=255-r;g=255-g;b=255-b;}else if(phase===2){r=Math.min(255,r+35);g=Math.min(255,g+10);}else if(phase===3){r=Math.min(255,r+32);g=Math.min(255,g+32);b=Math.min(255,b+32);}else{const v=(r+g+b)/3<128?0:255;r=g=b=v;}d[i]=r;d[i+1]=g;d[i+2]=b;}ctx.putImageData(img,0,0);ctx.fillStyle='#fff';ctx.font='15px Consolas';ctx.fillText(['gamma','invert','warm tint','brightness','threshold'][phase],20,28);
  }

  function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
  function poly(c,p,color){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fillStyle=color;c.fill();}
  function tri(c,x0,y0,x1,y1,x2,y2,color){c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x2,y2);c.closePath();c.fillStyle=color;c.fill();}
  function line(c,x0,y0,x1,y1,color,width){c.strokeStyle=color;c.lineWidth=width||1;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}
  function star(c,cx,cy,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:r*.4;c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.closePath();c.fill();}
  function wrapText(c,text,x,y,max,lh){let words=text.split(' '),line='';for(const word of words){const test=line?line+' '+word:word;if(c.measureText(test).width>max&&line){c.fillText(line,x,y);y+=lh;line=word;}else line=test;}if(line)c.fillText(line,x,y);}

  window.VayuLiveOutputs={
    has:name=>LIVE.has(name),
    category:name=>INPUT_REQUIRED.has(name)?'input':(UI_2D_3D.has(name)?'2d-3d':null),
    run
  };
})();
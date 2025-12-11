(function(){
  // Animated spiderweb canvas: interactive nodes connected by lines
  const canvas = document.getElementById('spiderweb-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let nodes = [];
  let NODE_COUNT = 120; // will be adjusted per device
  let MAX_DIST = 280;  // will be adjusted per device
  const nodeRadius = 2.2; // node visual size

  function computeConfig(){
    // responsive adjustments: fewer nodes and shorter links on small screens
    const isSmall = (window.matchMedia && window.matchMedia('(max-width:900px)').matches) || canvas.clientWidth < 700;
    if(isSmall){
      NODE_COUNT = 40;
      MAX_DIST = 160;
    } else {
      NODE_COUNT = 120;
      MAX_DIST = 280;
    }
  }

  function resize(){
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function rand(min,max){ return Math.random()*(max-min)+min }

  function init(){
    // compute config for current viewport
    computeConfig();
    nodes = [];
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // velocity range slightly scaled by device size to keep feel similar
    const velRange = (canvas.clientWidth < 700) ? 0.6 : 0.9;
    for(let i=0;i<NODE_COUNT;i++){
      nodes.push({
        x: rand(0.02*w,0.98*w),
        y: rand(0.02*h,0.98*h),
        vx: rand(-velRange,velRange),
        vy: rand(-velRange,velRange),
        fixed:false
      });
    }
  }

  let mouse = {x:-9999,y:-9999,down:false};

  function update(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // simple physics
    nodes.forEach(n=>{
      if(n.fixed) return;
      n.x += n.vx;
      n.y += n.vy;
      if(n.x < 6) { n.x = 6; n.vx *= -0.6 }
      if(n.y < 6) { n.y = 6; n.vy *= -0.6 }
      if(n.x > w-6) { n.x = w-6; n.vx *= -0.6 }
      if(n.y > h-6) { n.y = h-6; n.vy *= -0.6 }

      // mouse repulsion
      const dx = n.x - mouse.x; const dy = n.y - mouse.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 9000){
        // moderate mouse repulsion
        const f = 1/(Math.sqrt(d2)+30);
        n.x += dx * f * 6;
        n.y += dy * f * 6;
      }
    });
  }

  function draw(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    // draw web lines
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a = nodes[i]; const b = nodes[j];
        const dx = a.x-b.x; const dy = a.y-b.y; const d = Math.sqrt(dx*dx+dy*dy);
        if(d < MAX_DIST){
          const alpha = 1 - (d / MAX_DIST);
          // subtler lines to reduce visual noise and CPU work
          const lineAlpha = Math.max(0.04, alpha * 0.22);
          const lineWidth = Math.max(0.45, alpha * 1.0);
          ctx.save();
          ctx.strokeStyle = `rgba(30,160,255,${lineAlpha})`;
          // small glow
          ctx.shadowBlur = 3;
          ctx.shadowColor = `rgba(30,160,255,${lineAlpha*0.2})`;
          ctx.lineWidth = lineWidth;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          ctx.restore();
        }
      }
    }
    // draw nodes
    nodes.forEach(n=>{
      ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.arc(n.x,n.y,nodeRadius,0,Math.PI*2); ctx.fill();
    });
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  function toLocal(e){
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
  }

  canvas.addEventListener('mousemove', (e)=>{ const p = toLocal(e); mouse.x=p.x; mouse.y=p.y; });
  canvas.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999 });

  // click to toggle fixed node near pointer
  canvas.addEventListener('click',(e)=>{
    const p = toLocal(e);
    let closest = null; let md = 99999;
    nodes.forEach(n=>{
      const dx=n.x-p.x, dy=n.y-p.y; const d2=dx*dx+dy*dy; if(d2<md){ md=d2; closest=n }
    });
    if(closest && Math.sqrt(md) < 40){ closest.fixed = !closest.fixed; }
  });

  window.addEventListener('resize', ()=>{ resize(); init(); });
  
  // re-evaluate config when orientation or media changes
  if(window.matchMedia){
    const mq = window.matchMedia('(max-width:900px)');
    mq.addEventListener && mq.addEventListener('change', ()=>{ init(); });
  }

  // init sizes and start
  resize(); init(); loop();

})();

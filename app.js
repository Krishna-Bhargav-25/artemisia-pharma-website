(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-triggered reveal
  if ('IntersectionObserver' in window && !reduce){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); observer.unobserve(e.target); } });
    },{ threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));
  }

  // Button micro-interactions (press ripple)
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if (!btn) return;
    btn.classList.add('press');
    window.setTimeout(()=>btn.classList.remove('press'), 300);
  });

  // Page fade-out on internal navigation
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    // ignore external, hash, new tab, downloads, and JS void
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(a.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    document.body.classList.add('page-fade-out');
    setTimeout(()=>{ window.location.href = a.href; }, 350);
  });
  // Background ASMR canvas animation (refined capsules + swirling pellets)
  (function(){
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('bg-asmr-canvas');
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0, h = 0;

    function resize(){
      const { innerWidth, innerHeight } = window;
      w = Math.floor(innerWidth * dpr);
      h = Math.floor(innerHeight * dpr);
      canvas.width = w; canvas.height = h;
    }
    resize();
    window.addEventListener('resize', ()=>{ dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); resize(); });

    // Helpers
    const rng = (min, max)=> min + Math.random()*(max-min);
    const clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
    const now = ()=> performance.now();
    function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#fff'; }
    const COL_CAP_A = getVar('--Animation-Capsule-Primary');
    const COL_CAP_B = getVar('--Animation-Capsule-Secondary');
    const COL_ACC = getVar('--Animation-Pellet-Accent');
    const COL_SUB = getVar('--Animation-Pellet-Subtle');

    // Entities
    const capsules = [];
    const particles = [];
    const sparkles = [];

    const CAPSULE_COUNT = 12; // low density
    const PARTICLE_COUNT = 80; // still light

    // Capsules: very slow vertical drift, almost no horizontal
    for (let i=0;i<CAPSULE_COUNT;i++){
      const depth = rng(0.2, 1);
      capsules.push({
        x: rng(0, w), y: rng(0, h),
        vx: rng(-0.004, 0.004), vy: rng(-0.022, -0.006),
        // 50% smaller than previous config
        len: rng(70, 130)*dpr, rad: rng(6, 10)*dpr,
        rot: rng(0, Math.PI), vrot: rng(-0.00012, 0.00012),
        col: Math.random() < 0.5 ? COL_CAP_A : COL_CAP_B,
        alpha: rng(0.22, 0.5), depth
      });
    }

    // Pellets: small glowing orbs with more dynamic movement
    for (let i=0;i<PARTICLE_COUNT;i++){
      const depth = rng(0.1, 1);
      particles.push({
        x: rng(0, w), y: rng(0, h),
        vx: rng(-0.03, 0.03), vy: rng(-0.06, -0.01),
        r: rng(1.8*dpr, 3.8*dpr),
        col: Math.random() < 0.45 ? COL_ACC : COL_SUB,
        alpha: rng(0.12, 0.35), depth
      });
    }

    // Interaction state
    let scrollYPrev = window.scrollY, scrollInfluence = 0;
    window.addEventListener('scroll', ()=>{
      const dy = window.scrollY - scrollYPrev; scrollYPrev = window.scrollY;
      scrollInfluence = clamp(dy * 0.02, -1, 1);
    }, { passive: true });

    let mouse = { x: w/2, y: h/2, active: false };
    window.addEventListener('mousemove', (e)=>{
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
      mouse.active = true;
      // spawn a faint sparkle
      sparkles.push({ x: mouse.x, y: mouse.y, r: rng(2*dpr, 4*dpr), a: 0.22, t: now(), life: 650 });
      if (sparkles.length > 24) sparkles.shift();
    }, { passive: true });

    function edgeFade(y){
      const m = 0.18 * h; // fade near top/bottom edges
      const f = y < m ? y/m : (y > h - m ? (h - y)/m : 1);
      return clamp(f, 0, 1);
    }

    function step(){
      ctx.clearRect(0,0,w,h);

      // subtle overall opacity modulation with scroll
      const gA = 0.88 + clamp(scrollInfluence*0.03, -0.05, 0.1);
      ctx.globalAlpha = gA;

      // Capsules: ultra-slow vertical drift + tiny sine horizontal drift
      const t = now();
      for (const c of capsules){
        // Depth-based scroll response: FG slows slightly, BG speeds slightly
        const s = Math.abs(scrollInfluence);
        const fg = c.depth > 0.6; const bg = c.depth < 0.4;
        const vyScale = fg ? (1 - 0.18*s) : (bg ? (1 + 0.18*s) : 1);

        // motion
        const driftX = Math.sin((t*0.00012) + c.y*0.0003) * 0.4*dpr; // minimal horizontal
        c.x += (c.vx + driftX*0.02);
        c.y += (c.vy * vyScale);
        c.rot += c.vrot;

        // gentle mouse influence
        if (mouse.active){
          const dx = mouse.x - c.x, dy = mouse.y - c.y; const d2 = dx*dx + dy*dy; const r = 260*dpr;
          if (d2 < r*r){
            const d = Math.sqrt(d2)||1; const ux = dx/d, uy = dy/d;
            c.x += ux * 0.02; c.y += uy * 0.02; // extremely subtle
          }
        }

        // wrap vertically
        if (c.y < -c.len) c.y = h + c.len;
        if (c.y > h + c.len) c.y = -c.len;
        if (c.x < -c.len) c.x = w + c.len;
        if (c.x > w + c.len) c.x = -c.len;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = c.alpha * edgeFade(c.y) * gA;
        drawCapsule(ctx, 0, 0, c.len, c.rad, c.col);
        ctx.restore();
      }

      // Pellets: swirl around nearest capsule with slight attraction
      for (const p of particles){
        // Find nearest capsule (capsule count is small)
        let nearest = null, bestD2 = Infinity;
        for (const c of capsules){
          const dx = p.x - c.x, dy = p.y - c.y; const d2 = dx*dx + dy*dy;
          if (d2 < bestD2){ bestD2 = d2; nearest = c; }
        }
        const s = Math.abs(scrollInfluence);
        const fg = p.depth > 0.6; const bg = p.depth < 0.4;
        const vyScale = fg ? (1 - 0.15*s) : (bg ? (1 + 0.15*s) : 1);

        if (nearest){
          const dx = nearest.x - p.x, dy = nearest.y - p.y; const d = Math.sqrt(dx*dx + dy*dy)||1;
          const ux = dx/d, uy = dy/d;
          // tangential swirl vector
          const tx = -uy, ty = ux;
          // mix swirl + slight attraction
          p.vx += tx * 0.006 + ux * 0.002;
          p.vy += ty * 0.006 + uy * 0.002;
        }

        // subtle mouse attraction
        if (mouse.active){
          const dx = mouse.x - p.x, dy = mouse.y - p.y; const d2 = dx*dx + dy*dy; const r = 180*dpr;
          if (d2 < r*r){
            const d = Math.sqrt(d2)||1; const ux = dx/d, uy = dy/d;
            p.vx += ux * 0.003; p.vy += uy * 0.003;
          }
        }

        // integrate and wrap
        p.x += (p.vx);
        p.y += (p.vy * vyScale);
        p.vx *= 0.985; p.vy *= 0.985; // damping for smoothness
        if (p.x < -10*dpr) p.x = w + 10*dpr;
        if (p.x > w + 10*dpr) p.x = -10*dpr;
        if (p.y < -10*dpr) p.y = h + 10*dpr;
        if (p.y > h + 10*dpr) p.y = -10*dpr;

        ctx.save();
        ctx.globalAlpha = p.alpha * gA;
        ctx.shadowColor = p.col; ctx.shadowBlur = 8*dpr;
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Sparkles near pointer (brief bloom)
      const tNow = now();
      for (let i = sparkles.length - 1; i >= 0; i--){
        const sObj = sparkles[i];
        const age = tNow - sObj.t; if (age > sObj.life){ sparkles.splice(i,1); continue; }
        const k = 1 - (age / sObj.life);
        ctx.save();
        ctx.globalAlpha = sObj.a * k * 0.8;
        ctx.shadowColor = COL_ACC; ctx.shadowBlur = 12*dpr;
        ctx.fillStyle = COL_ACC;
        ctx.beginPath(); ctx.arc(sObj.x, sObj.y, sObj.r * (1.2 - 0.2*k), 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      }

      requestAnimationFrame(step);
    }

    // Stylized elongated capsule (rounded ends)
    function drawCapsule(ctx, x, y, len, rad, color){
      // Body with fully rounded ends
      ctx.fillStyle = color;
      ctx.beginPath();
      const w2 = Math.max(rad, len/2), r = Math.min(rad, len/2);
      ctx.moveTo(x - w2 + r, y - r);
      ctx.lineTo(x + w2 - r, y - r);
      ctx.quadraticCurveTo(x + w2, y - r, x + w2, y);
      ctx.lineTo(x + w2, y + r);
      ctx.quadraticCurveTo(x + w2, y + r, x + w2 - r, y + r);
      ctx.lineTo(x - w2 + r, y + r);
      ctx.quadraticCurveTo(x - w2, y + r, x - w2, y);
      ctx.lineTo(x - w2, y);
      ctx.quadraticCurveTo(x - w2, y - r, x - w2 + r, y - r);
      ctx.closePath();
      ctx.fill();

      // Tiny partition seam in the middle (subtle)
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = Math.max(1, 1.1 * dpr);
      ctx.beginPath();
      ctx.moveTo(x, y - r*0.9);
      ctx.lineTo(x, y + r*0.9);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(step);
  })();
})();

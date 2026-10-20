(function () {
  const c = document.getElementById('art');
  const x = c.getContext('2d');
  const colors = ['#7fd8ff', '#2bb3a3', '#f28c28', '#e4457a', '#a99bff', '#f5d547'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const MAX_SOURCES = 25;
  let W, H, sources = [], drops = [], ripples = [], bits = [];

  function size() {
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  addEventListener('resize', size);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function spawnDrop(px, py, now) {
    const d = { x: px, y: py, cy: -60, r: rnd(5, 11), color: pick(colors), t0: now, dur: rnd(380, 560) };
    if (reduce) { splash(d, now); return; }
    drops.push(d);
  }

  function addSource(px, py) {
    const now = performance.now();
    sources.push({ x: px, y: py, next: now + rnd(1500, 2600) });
    if (sources.length > MAX_SOURCES) sources.shift();
    spawnDrop(px, py, now);
  }

  function splash(d, now) {
    ripples.push({ x: d.x, y: d.y, t0: now, color: d.color, rings: Math.floor(rnd(2, 5)), maxR: rnd(50, 130) });
    const n = Math.floor(rnd(6, 10));
    for (let i = 0; i < n; i++) {
      const a = rnd(Math.PI * 1.1, Math.PI * 1.9);
      const sp = rnd(1.5, 4.5);
      bits.push({ x: d.x, y: d.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(1.5, 3.5), color: d.color, t0: now });
    }
  }

  function drawTeardrop(px, py, r, color) {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(px, py - r * 2.8);
    x.bezierCurveTo(px + r * 0.2, py - r * 1.4, px + r, py - r * 0.8, px + r, py);
    x.arc(px, py, r, 0, Math.PI);
    x.bezierCurveTo(px - r, py - r * 0.8, px - r * 0.2, py - r * 1.4, px, py - r * 2.8);
    x.fill();
  }

  function frame(now) {
    x.clearRect(0, 0, W, H);

    sources.forEach(s => {
      if (now >= s.next) {
        spawnDrop(s.x, s.y, now);
        s.next = now + rnd(1400, 2600);
      }
    });

    drops = drops.filter(d => {
      const t = Math.min((now - d.t0) / d.dur, 1);
      d.cy = -60 + (d.y + 60) * t * t;
      if (t >= 1) { splash(d, now); return false; }
      drawTeardrop(d.x, d.cy, d.r, d.color);
      return true;
    });

    ripples = ripples.filter(rp => {
      let alive = false;
      for (let i = 0; i < rp.rings; i++) {
        const age = (now - rp.t0 - i * 150) / 1900;
        if (age < 0) { alive = true; continue; }
        if (age >= 1) continue;
        alive = true;
        const e = 1 - Math.pow(1 - age, 3);
        const rx = rp.maxR * e * (1 - i * 0.12);
        x.strokeStyle = rp.color;
        x.globalAlpha = (1 - age) * 0.9;
        x.lineWidth = 2.5;
        x.beginPath();
        x.ellipse(rp.x, rp.y, rx, rx * 0.38, 0, 0, Math.PI * 2);
        x.stroke();
      }
      x.globalAlpha = 1;
      return alive;
    });

    bits = bits.filter(b => {
      const age = (now - b.t0) / 650;
      if (age >= 1) return false;
      b.x += b.vx; b.y += b.vy; b.vy += 0.18;
      x.globalAlpha = 1 - age;
      x.fillStyle = b.color;
      x.beginPath();
      x.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 1;
      return true;
    });

    requestAnimationFrame(frame);
  }

  c.addEventListener('pointerdown', e => {
    const rc = c.getBoundingClientRect();
    addSource(e.clientX - rc.left, e.clientY - rc.top);
  });
  document.getElementById('clear').addEventListener('click', () => {
    sources = []; drops = []; ripples = []; bits = [];
  });

  setTimeout(() => addSource(W * 0.7, H * 0.45), 400);
  requestAnimationFrame(frame);
})();

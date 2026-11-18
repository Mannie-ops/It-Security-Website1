document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});


// Subtle interactive particle background
(() => {
  const canvas = document.getElementById("ambient-bg");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let width = 0, height = 0, dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(85, Math.max(38, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.6 + .5, a: Math.random() * .45 + .18
    }));
  };
  const move = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", move, { passive: true });
  resize();

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 0) { p.vx -= dx / dist * .0025; p.vy -= dy / dist * .0025; }
      p.x += p.vx; p.y += p.vy;
      p.vx *= .995; p.vy *= .995;
      if (p.x < -10) p.x = width + 10; if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10; if (p.y > height + 10) p.y = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(152,255,204,${p.a})`; ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 105) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(152,255,204,${(1 - d / 105) * .09})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
})();

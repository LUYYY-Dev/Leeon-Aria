/* Hugo 会把参数名统一转成小写，所以这里大小写都要能取到 */
function effectEnabled(name) {
  var cfg = window.__LA_EFFECTS__ || {};
  var value = cfg[name];
  if (value === undefined) value = cfg[name.toLowerCase()];
  return value !== false;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------------------------------------------------- 粒子星链网络 */
function initStarfield() {
  var canvas = document.getElementById('starfield');
  if (!canvas || prefersReducedMotion()) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0;
  var height = 0;
  var particles = [];
  var raf = null;
  var running = true;
  var pointer = { x: -9999, y: -9999 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    var density = width < 720 ? 26 : width < 1100 ? 46 : 72;
    particles = [];
    for (var i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.6
      });
    }
  }

  function accentColors() {
    var styles = getComputedStyle(document.documentElement);
    return {
      a: (styles.getPropertyValue('--accent') || '#7c5cff').trim(),
      b: (styles.getPropertyValue('--accent-2') || '#22d3ee').trim()
    };
  }

  var colors = accentColors();
  document.addEventListener('la:themechange', function () { colors = accentColors(); });

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;

      /* 轻微吸附鼠标 */
      var dxm = pointer.x - p.x;
      var dym = pointer.y - p.y;
      var dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < 150 && dm > 0.001) {
        p.x += (dxm / dm) * 0.22;
        p.y += (dym / dm) * 0.22;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? colors.b : colors.a;
      ctx.globalAlpha = 0.55;
      ctx.fill();
    }

    /* 连线 */
    for (var j = 0; j < particles.length; j++) {
      for (var k = j + 1; k < particles.length; k++) {
        var a = particles[j];
        var b = particles[k];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = dx * dx + dy * dy;
        if (dist < 17000) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = colors.a;
          ctx.globalAlpha = (1 - dist / 17000) * 0.16;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    raf = window.requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function () {
    window.clearTimeout(canvas._t);
    canvas._t = window.setTimeout(resize, 180);
  });

  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', function () { pointer.x = -9999; pointer.y = -9999; });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      frame();
    }
  });

  resize();
  frame();
}

/* ---------------------------------------------------- 鼠标跟随光晕 */
function initCursorGlow() {
  var glow = document.getElementById('cursorGlow');
  if (!glow || prefersReducedMotion()) return;
  if (window.matchMedia('(hover: none)').matches) return;

  var tx = window.innerWidth / 2;
  var ty = window.innerHeight / 2;
  var cx = tx;
  var cy = ty;

  window.addEventListener('pointermove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    document.body.classList.add('has-cursor');
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    document.body.classList.remove('has-cursor');
  });

  (function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    window.requestAnimationFrame(loop);
  })();
}

export function initBackground() {
  if (effectEnabled('particles')) initStarfield();
  if (effectEnabled('cursorGlow')) initCursorGlow();
}

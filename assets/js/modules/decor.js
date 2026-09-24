function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------------------------------------------------ 卡片 3D 倾斜 + 光斑跟随 */
function initTilt() {
  if (reduced() || window.matchMedia('(hover: none)').matches) return;

  var nodes = document.querySelectorAll('[data-tilt]');
  Array.prototype.forEach.call(nodes, function (el) {
    var raf = null;
    var lastEvent = null;

    function apply() {
      raf = null;
      if (!lastEvent) return;
      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (lastEvent.clientX - rect.left) / rect.width;
      var py = (lastEvent.clientY - rect.top) / rect.height;
      px = Math.min(Math.max(px, 0), 1);
      py = Math.min(Math.max(py, 0), 1);
      el.style.setProperty('--ry', ((px - 0.5) * 6.5).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - py) * 6.5).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    }

    el.addEventListener('pointermove', function (e) {
      lastEvent = e;
      if (!raf) raf = window.requestAnimationFrame(apply);
    }, { passive: true });

    el.addEventListener('pointerleave', function () {
      lastEvent = null;
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    });
  });
}

/* ------------------------------------------------ 首页数字滚动 */
function initCounters() {
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.stat__num[data-count]'));
  if (!nodes.length) return;

  function format(n) {
    var s = String(n);
    var out = '';
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      count++;
      if (count % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }

  function animate(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced() || target === 0) {
      el.textContent = format(target) + suffix;
      return;
    }
    var duration = 1300;
    var start = null;
    var settled = false;

    function settle() {
      if (settled) return;
      settled = true;
      el.textContent = format(target) + suffix;
    }

    function step(ts) {
      if (settled) return;
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = format(Math.round(target * eased)) + (progress === 1 ? suffix : '');
      if (progress < 1) window.requestAnimationFrame(step);
      else settled = true;
    }

    // 兜底：即使动画帧被浏览器节流，也保证最终显示准确数字
    window.setTimeout(settle, duration + 800);
    window.requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(animate);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  nodes.forEach(function (el) { observer.observe(el); });
}

/* ------------------------------------------------ 目录锚点平滑滚动 */
function initAnchors() {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href === '#') return;
    var target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', href);
  });
}

export function initDecor() {
  initTilt();
  initCounters();
  initAnchors();
}

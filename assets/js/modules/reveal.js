var SELECTOR = '.reveal';

export function initReveal() {
  var nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!nodes.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  nodes.forEach(function (el) { observer.observe(el); });

  /* 兜底：3 秒后仍未显示的（例如在首屏外但被布局忽略）强制显示 */
  window.setTimeout(function () {
    nodes.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('is-visible');
    });
  }, 2500);
}

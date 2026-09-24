function initProgress() {
  var content = document.getElementById('articleContent');
  if (!content) return;
  var bar = document.getElementById('readProgress');
  var tocBar = document.querySelector('.toc__progress i');
  var ticking = false;

  function update() {
    ticking = false;
    var rect = content.getBoundingClientRect();
    var headOffset = 120;
    var total = rect.height - (window.innerHeight - headOffset);
    var passed = headOffset - rect.top;
    var ratio = total > 0 ? passed / total : (passed > 0 ? 1 : 0);
    ratio = Math.min(Math.max(ratio, 0), 1);
    if (bar) bar.style.transform = 'scaleX(' + ratio + ')';
    if (tocBar) tocBar.style.width = (ratio * 100).toFixed(1) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

function initToc() {
  var toc = document.getElementById('toc');
  var content = document.getElementById('articleContent');
  if (!toc || !content) return;

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var pairs = [];
  links.forEach(function (a) {
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var heading = document.getElementById(id);
    if (heading) pairs.push({ link: a, heading: heading });
  });
  if (!pairs.length) return;

  var ticking = false;
  function update() {
    ticking = false;
    var offset = 140;
    var active = pairs[0];
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].heading.getBoundingClientRect().top - offset <= 0) active = pairs[i];
      else break;
    }
    pairs.forEach(function (p) { p.link.classList.toggle('is-active', p === active); });
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  update();
}

function initCodeCopy() {
  var blocks = document.querySelectorAll('.prose .highlight');
  Array.prototype.forEach.call(blocks, function (block) {
    if (block.querySelector('.copy-btn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';

    btn.addEventListener('click', function () {
      var code = block.querySelector('code');
      var text = code ? code.innerText : '';

      function done() {
        btn.textContent = '已复制';
        btn.classList.add('is-done');
        window.setTimeout(function () {
          btn.textContent = '复制';
          btn.classList.remove('is-done');
        }, 1800);
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
        document.body.removeChild(ta);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });

    block.appendChild(btn);
  });
}

function initTables() {
  var tables = document.querySelectorAll('.prose > table');
  Array.prototype.forEach.call(tables, function (table) {
    if (table.parentElement && table.parentElement.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

export function initArticle() {
  initProgress();
  initToc();
  initCodeCopy();
  initTables();
}

var indexPromise = null;

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

/* 转义正则特殊字符，避免用户输入 "(" 之类的字符导致报错 */
function escapeRegExp(str) {
  var SPECIAL = '.*+?^$()[]{}|\\';
  var out = '';
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    out += SPECIAL.indexOf(ch) > -1 ? '\\' + ch : ch;
  }
  return out;
}

function mark(text, tokens) {
  var out = escapeHtml(text);
  tokens.forEach(function (t) {
    if (!t) return;
    try {
      out = out.replace(new RegExp('(' + escapeRegExp(t) + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) { /* 非法正则忽略 */ }
  });
  return out;
}

function tokenize(query) {
  return query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
}

function scorePost(post, tokens) {
  var title = String(post.title || '').toLowerCase();
  var summary = String(post.summary || '').toLowerCase();
  var content = String(post.content || '').toLowerCase();
  var tags = (post.tags || []).concat(post.categories || []).join(' ').toLowerCase();
  var score = 0;

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var hit = false;

    if (title.indexOf(t) > -1) { score += 46; hit = true; }
    if (tags.indexOf(t) > -1) { score += 24; hit = true; }
    if (summary.indexOf(t) > -1) { score += 14; hit = true; }

    var at = content.indexOf(t);
    if (at > -1) {
      score += 7;
      var count = 0;
      var from = 0;
      while (count < 10) {
        var found = content.indexOf(t, from);
        if (found === -1) break;
        count++;
        from = found + t.length;
      }
      score += count * 2;
      hit = true;
    }
    if (!hit) return 0;
  }
  return score;
}

function makeExcerpt(post, tokens) {
  var content = String(post.content || '').replace(/\s+/g, ' ').trim();
  if (!content) return String(post.summary || '');
  var lower = content.toLowerCase();
  var at = -1;
  for (var i = 0; i < tokens.length; i++) {
    at = lower.indexOf(tokens[i]);
    if (at > -1) break;
  }
  if (at < 0) return content.slice(0, 130) + (content.length > 130 ? '…' : '');
  var start = Math.max(0, at - 42);
  var end = Math.min(content.length, at + 110);
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
}

export function initSearch() {
  var modal = document.getElementById('searchModal');
  if (!modal) return;

  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var countEl = document.getElementById('searchCount');
  var indexUrl = modal.getAttribute('data-index') || 'index.json';
  var selected = -1;
  var items = [];

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(indexUrl, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .catch(function (err) {
          indexPromise = null;
          throw err;
        });
    }
    return indexPromise;
  }

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    window.setTimeout(function () { if (input) input.focus(); }, 40);
    if (input && !input.value) renderIdle();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    selected = -1;
  }

  function isOpen() { return !modal.hidden; }

  function renderIdle() {
    if (countEl) countEl.textContent = '';
    if (results) results.innerHTML = '<p class="search__empty">输入关键词开始搜索，支持标题、标签和正文。</p>';
  }

  function renderError(msg) {
    if (results) results.innerHTML = '<p class="search__error">' + escapeHtml(msg) + '</p>';
  }

  function render(list, tokens) {
    items = list;
    selected = -1;

    if (!list.length) {
      results.innerHTML = '<p class="search__empty">没有找到匹配的内容，换个关键词试试。</p>';
      if (countEl) countEl.textContent = '0 条结果';
      return;
    }

    var html = list.map(function (post, i) {
      var tagHtml = (post.tags && post.tags.length)
        ? '<span>#' + escapeHtml(post.tags.slice(0, 3).join(' #')) + '</span>'
        : '';
      return '<a class="result" href="' + post.permalink + '" data-i="' + i + '">' +
        '<div class="result__title">' + mark(post.title, tokens) + '</div>' +
        '<div class="result__excerpt">' + escapeHtml(makeExcerpt(post, tokens)) + '</div>' +
        '<div class="result__meta"><span>' + escapeHtml(post.date || '') + '</span>' + tagHtml + '</div></a>';
    }).join('');

    results.innerHTML = html;
    if (countEl) countEl.textContent = list.length + ' 条结果';
  }

  function run() {
    var query = (input.value || '').trim();
    if (!query) { renderIdle(); return; }

    var tokens = tokenize(query);
    if (!tokens.length) { renderIdle(); return; }

    loadIndex().then(function (data) {
      var posts = Array.isArray(data) ? data : [];
      var scored = [];
      for (var i = 0; i < posts.length; i++) {
        var s = scorePost(posts[i], tokens);
        if (s > 0) scored.push({ post: posts[i], score: s });
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      render(scored.slice(0, 24).map(function (x) { return x.post; }), tokens);
    }).catch(function () {
      renderError('搜索索引加载失败。如果用本地文件直接打开页面，请改为通过 hugo server 访问。');
    });
  }

  function moveSelection(step) {
    var nodes = results.querySelectorAll('.result');
    if (!nodes.length) return;
    selected = (selected + step + nodes.length) % nodes.length;
    Array.prototype.forEach.call(nodes, function (n, i) { n.classList.toggle('is-active', i === selected); });
    if (nodes[selected]) nodes[selected].scrollIntoView({ block: 'nearest' });
  }

  var debounce = null;
  if (input) {
    input.addEventListener('input', function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(run, 130);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var nodes = results.querySelectorAll('.result');
        if (selected >= 0 && nodes[selected]) window.location.href = nodes[selected].getAttribute('href');
        else if (nodes.length) window.location.href = nodes[0].getAttribute('href');
      }
    });
  }

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-close]')) close();
    if (e.target.closest('.result')) close();
  });

  Array.prototype.forEach.call(document.querySelectorAll('#searchOpen, [data-search-open]'), function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });

  document.addEventListener('keydown', function (e) {
    var el = document.activeElement;
    var tag = (el && el.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable);

    if (e.key === 'Escape' && isOpen()) { close(); return; }

    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (isOpen()) close(); else open();
    }
  });

  /* 空闲时预加载索引，打开搜索即可立即出结果 */
  function preload() { loadIndex().catch(function () {}); }
  if ('requestIdleCallback' in window) window.requestIdleCallback(preload);
  else window.setTimeout(preload, 2000);
}

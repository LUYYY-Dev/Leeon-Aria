var STORAGE_KEY = 'la-theme';

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme, persist) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* 隐私模式忽略 */ }
  }
  syncGiscus(theme);
  document.dispatchEvent(new CustomEvent('la:themechange', { detail: { theme: theme } }));
}

/* 让 Giscus 评论区跟着一起换主题 */
function syncGiscus(theme) {
  var iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  } catch (e) { /* 忽略跨域异常 */ }
}

export function initTheme() {
  var btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* 用户没有手动选过时，跟随系统变化 */
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  var onChange = function (e) {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { /* ignore */ }
    if (!saved) {
      applyTheme(e.matches ? 'light' : 'dark', false);
    }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);

  /* 监听 Giscus 加载完成后同步一次主题 */
  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://giscus.app') return;
    if (typeof event.data === 'object' && event.data.giscus) syncGiscus(currentTheme());
  });
}

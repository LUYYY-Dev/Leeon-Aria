import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initBackground } from './modules/background.js';
import { initTyping } from './modules/typing.js';
import { initSearch } from './modules/search.js';
import { initArticle } from './modules/article.js';
import { initDecor } from './modules/decor.js';

function boot() {
  initTheme();
  initNav();
  initReveal();
  initBackground();
  initTyping();
  initSearch();
  initArticle();
  initDecor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

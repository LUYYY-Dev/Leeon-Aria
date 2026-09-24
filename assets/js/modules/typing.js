export function initTyping() {
  var el = document.getElementById('typingText');
  if (!el) return;

  var raw = el.getAttribute('data-words');
  if (!raw) return;

  var words;
  try { words = JSON.parse(raw); } catch (e) { return; }
  if (!Array.isArray(words) || !words.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words[0];
    return;
  }

  var wordIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function tick() {
    var word = words[wordIndex];
    var delay;

    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        delay = 1900;
      } else {
        delay = 92 + Math.random() * 70;
      }
    } else {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 420;
      } else {
        delay = 38;
      }
    }
    window.setTimeout(tick, delay);
  }

  window.setTimeout(tick, 600);
}

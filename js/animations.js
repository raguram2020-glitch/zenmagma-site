/* ═══════════════════════════════════════════════════
   ZENMAGMA — animations.js
   Micro-interactions — pure vanilla JS, 60fps safe
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   1. BUTTON RIPPLE
   Reusable — works on any element with class .btn-ripple
───────────────────────────────────────────────────*/
const ButtonFX = (() => {
  function createRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'zm-ripple';
    ripple.style.cssText =
      `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function init() {
    // Delegate — catches dynamically added buttons too
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-play, .btn-pill, .cat-pill');
      if (btn) createRipple({ currentTarget: btn, clientX: e.clientX, clientY: e.clientY });
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────
   2. PAGE TRANSITION — fade + slide up on load
───────────────────────────────────────────────────*/
const PageTransition = (() => {
  function init() {
    document.body.classList.add('page-enter');
    // Let CSS handle the animation; remove class after so it doesn't replay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('page-enter-active');
      });
    });

    // Intercept internal navigation for exit transition
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
      if (a.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────
   3. LOADING ANIMATION — dots (CSS-driven)
   The loader HTML lives in index.html;
   this just enhances the text
───────────────────────────────────────────────────*/
function initLoader() {
  const txt = document.querySelector('.zm-loader-text');
  if (!txt) return;
  // Animated dots appended to text
  let dots = 0;
  const base = txt.textContent.replace(/\.+$/, '').trim();
  const iv = setInterval(() => {
    dots = (dots + 1) % 4;
    txt.textContent = base + '.'.repeat(dots);
  }, 400);
  // Stop once page loads
  window.addEventListener('load', () => clearInterval(iv), { once: true });
}


/* ─────────────────────────────────────────────────
   4. CONTINUE PLAYING  — localStorage helpers
   Also used by app.js via addRecent / getRecent
───────────────────────────────────────────────────*/
const RecentGames = (() => {
  const KEY     = 'zm_recent';
  const MAX     = 5;

  function saveGame(gameId) {
    let list = getRecentGames();
    list = [gameId, ...list.filter(id => id !== gameId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function getRecentGames() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function clearGames() {
    localStorage.removeItem(KEY);
  }

  return { saveGame, getRecentGames, clearGames };
})();

// Make globally accessible so app.js can use them
window.saveGame      = RecentGames.saveGame;
window.getRecentGames = RecentGames.getRecentGames;


/* ─────────────────────────────────────────────────
   5. SCROLL-TRIGGERED CARD REVEAL
   Cards fade + slide up when they enter viewport
───────────────────────────────────────────────────*/
const ScrollReveal = (() => {
  let io;

  function init() {
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    observe();

    // Re-observe after grid re-renders
    new MutationObserver(() => observe())
      .observe(document.getElementById('all-games-grid') || document.body,
        { childList: true, subtree: false });
  }

  function observe() {
    document.querySelectorAll('.game-card:not(.revealed)').forEach(c => {
      c.classList.add('will-reveal');
      io.observe(c);
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────
   BOOT — initialise everything on DOMContentLoaded
───────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  PageTransition.init();
  ButtonFX.init();
  ScrollReveal.init();
  initLoader();
});

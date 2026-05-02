/* ═══════════════════════════════════════════════════
   ZENMAGMA — animations.js
   All micro-interactions, animations & retention logic
   Pure vanilla JS · No libraries · 60fps safe
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   1. GAME CARD 3D TILT
   Uses transform only — zero layout cost
───────────────────────────────────────────────────*/
const CardTilt = (() => {
  const STRENGTH   = 10;   // max tilt degrees
  const SCALE      = 1.04;
  const isMobile   = () => window.matchMedia('(max-width:768px)').matches;
  let   active     = null;

  function onMove(e) {
    const card = e.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * STRENGTH * 2;
    const y = ((e.clientY - top)  / height - 0.5) * STRENGTH * -2;
    card.style.transform =
      `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) scale(${SCALE})`;
    // Dynamic glow follows cursor
    const px = ((e.clientX - left) / width)  * 100;
    const py = ((e.clientY - top)  / height) * 100;
    card.style.setProperty('--glow-x', px + '%');
    card.style.setProperty('--glow-y', py + '%');
  }

  function onLeave(card) {
    card.style.transform = '';
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
  }

  function attach(card) {
    if (isMobile()) {
      // Mobile: simple scale only on touch
      card.addEventListener('touchstart', () => {
        card.style.transform = `scale(${SCALE})`;
        card.style.transition = 'transform .2s ease';
      }, { passive: true });
      card.addEventListener('touchend', () => {
        card.style.transform = '';
      }, { passive: true });
      return;
    }
    card.style.transition =
      'transform .12s ease-out, box-shadow .2s ease, border-color .2s ease';
    card.addEventListener('mousemove',  onMove);
    card.addEventListener('mouseleave', () => onLeave(card));
  }

  // Observe DOM for dynamically added cards
  function init() {
    const observer = new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList?.contains('game-card')) attach(n);
        n.querySelectorAll?.('.game-card').forEach(attach);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Attach to existing cards
    document.querySelectorAll('.game-card').forEach(attach);
  }

  return { init, attach };
})();


/* ─────────────────────────────────────────────────
   2. BUTTON RIPPLE + GLOW
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
      const btn = e.target.closest(
        '.btn-play, .btn-pill, .dc-action, .sc-btn, .cat-pill'
      );
      if (btn) createRipple({ currentTarget: btn, clientX: e.clientX, clientY: e.clientY });
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────
   3. XP POPUP  —  showXpPopup(points, x, y)
   Floats up from click point and fades out
───────────────────────────────────────────────────*/
function showXpPopup(points, x, y) {
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.innerHTML = `⚡ +${points} XP`;

  // Position near click or center-top of viewport
  const px = x ?? window.innerWidth  / 2;
  const py = y ?? 120;
  popup.style.left = px + 'px';
  popup.style.top  = py + 'px';

  document.body.appendChild(popup);
  // Remove after animation completes
  popup.addEventListener('animationend', () => popup.remove());
}

// Convenience: show popup at element centre
function showXpAt(points, el) {
  if (!el) { showXpPopup(points); return; }
  const r = el.getBoundingClientRect();
  showXpPopup(points, r.left + r.width / 2, r.top + window.scrollY - 20);
}


/* ─────────────────────────────────────────────────
   4. DAILY CHALLENGE COUNTDOWN  HH:MM:SS
───────────────────────────────────────────────────*/
const DailyTimer = (() => {
  function getRemaining() {
    const now      = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h  = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
    const m  = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
    const s  = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function tick() {
    const time = getRemaining();
    document.querySelectorAll('.dc-timer, #dc-timer').forEach(el => {
      el.textContent = `⏰ Resets in  ${time}`;
    });
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init, getRemaining };
})();


/* ─────────────────────────────────────────────────
   5. HERO EMOJI FLOAT (CSS-driven, JS sets class)
───────────────────────────────────────────────────*/
function initHeroFloat() {
  const el = document.getElementById('hero-emoji');
  if (el) el.classList.add('hero-emoji-float');
}


/* ─────────────────────────────────────────────────
   6. PAGE TRANSITION — fade + slide up on load
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
   7. LOADING ANIMATION — dots (CSS-driven)
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
   8. CONTINUE PLAYING  — localStorage helpers
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
   9. SCROLL-TRIGGERED CARD REVEAL
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
   10. LIVE PLAYER COUNTER — subtle fake social proof
───────────────────────────────────────────────────*/
function initLiveCounter() {
  const seeds = [1247, 983, 1531, 742, 2108, 890, 1376];
  let   i     = 0;

  function update() {
    const base = seeds[i % seeds.length];
    const jitter = Math.floor(Math.random() * 80) - 40;
    const count  = base + jitter;
    const el     = document.getElementById('hero-player-count');
    if (el) {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = count.toLocaleString();
        el.style.opacity = '1';
      }, 300);
    }
    i++;
  }

  update();
  setInterval(update, 8000);
}


/* ─────────────────────────────────────────────────
   BOOT — initialise everything on DOMContentLoaded
───────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  PageTransition.init();
  ButtonFX.init();
  CardTilt.init();
  DailyTimer.init();
  ScrollReveal.init();
  initHeroFloat();
  initLiveCounter();
  initLoader();
});

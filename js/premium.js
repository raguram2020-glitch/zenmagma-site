/* ═══════════════════════════════════════
   ZenMagma — Premium UI Layer
   Micro-interactions, particles, effects
═══════════════════════════════════════ */

/* ── CARD CLICK PARTICLE BURST ── */
function cardParticleBurst(e, color) {
  const count = 12;
  const x = e.clientX, y = e.clientY;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = (i / count) * Math.PI * 2;
    const vel = 40 + Math.random() * 60;
    const size = 4 + Math.random() * 6;
    Object.assign(p.style, {
      position: 'fixed',
      left: x + 'px', top: y + 'px',
      width: size + 'px', height: size + 'px',
      borderRadius: '50%',
      background: color || '#a855f7',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%,-50%)',
      transition: `all ${.4 + Math.random() * .3}s cubic-bezier(.23,1,.32,1)`,
      opacity: '1',
    });
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${Math.cos(angle)*vel}px), calc(-50% + ${Math.sin(angle)*vel}px)) scale(0)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 800);
  }
}

/* ── INTERCEPT CARD CLICKS FOR PARTICLE BURST ── */
document.addEventListener('click', e => {
  const card = e.target.closest('.game-card');
  if (!card) return;
  const color = getComputedStyle(card).getPropertyValue('--card-color').trim() || '#a855f7';
  cardParticleBurst(e, color);
});

/* ── COUNTER ANIMATE ── */
function animateCounter(el, target, dur = 1200) {
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (target - start) * ease).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── INTERSECTION OBSERVER: animate stat numbers on scroll ── */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const val = parseInt(el.dataset.target || el.textContent.replace(/[^0-9]/g, '')) || 0;
    animateCounter(el, val);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.gam-val, .stat-value').forEach(el => {
  el.dataset.target = el.textContent.replace(/[^0-9]/g, '');
  statObserver.observe(el);
});

/* ── SCROLL REVEAL for sections ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.sec-header, .mystery-box, #daily-challenge').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.23,1,.32,1)';
  revealObserver.observe(el);
});

/* ── PARALLAX HERO ── */
const hero = document.querySelector('.hero');
const heroBg = document.getElementById('hero-bg');
if (hero && heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < hero.offsetHeight * 1.5) {
      heroBg.style.transform = `translateY(${scrolled * 0.25}px) scale(1.08)`;
    }
  }, { passive: true });
}

/* ── CATEGORY PILL RIPPLE ── */
document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', e => {
    const r = pill.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(r.width, r.height) * 2;
    Object.assign(ripple.style, {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,.25)',
      width: size + 'px', height: size + 'px',
      left: (e.clientX - r.left - size/2) + 'px',
      top:  (e.clientY - r.top  - size/2) + 'px',
      pointerEvents: 'none',
      transform: 'scale(0)',
      transition: 'transform .5s ease, opacity .5s ease',
      opacity: '1',
    });
    pill.style.position = pill.style.position || 'relative';
    pill.style.overflow = 'hidden';
    pill.appendChild(ripple);
    requestAnimationFrame(() => { ripple.style.transform = 'scale(1)'; ripple.style.opacity = '0'; });
    setTimeout(() => ripple.remove(), 600);
  });
});

/* ── LIVE PLAYER COUNT FLICKER ── */
function flickerPlayerCounts() {
  document.querySelectorAll('.card-players').forEach(el => {
    const base = parseInt(el.dataset.base || '0');
    if (!base) {
      const match = el.textContent.match(/\d+/);
      if (match) el.dataset.base = match[0];
      return;
    }
    const delta = Math.floor(Math.random() * 6) - 2;
    const newVal = Math.max(50, base + delta);
    const numEl = el.childNodes[el.childNodes.length - 1];
    if (numEl && numEl.nodeType === 3) {
      numEl.textContent = ` ${newVal.toLocaleString()} online`;
    }
    el.dataset.base = newVal;
  });
}
setInterval(flickerPlayerCounts, 4000);

/* ── HEADER SCROLL SHADOW ── */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 20;
    header.style.boxShadow = scrolled
      ? '0 4px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(124,58,237,.15)'
      : '0 2px 40px rgba(0,0,0,.4)';
  }, { passive: true });
}

/* ── SMOOTH PAGE TRANSITIONS ── */
document.querySelectorAll('a[href]:not([onclick])').forEach(link => {
  const href = link.href;
  if (!href.includes(location.hostname) && !href.startsWith('/')) return;
  if (href.includes('#') || href.includes('mailto:')) return;
  link.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.body.style.transition = 'opacity .2s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 200);
  });
});

console.log('🌋 ZenMagma Premium UI loaded');

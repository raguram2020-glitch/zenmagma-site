/* ═══════════════════════════════════════
   ZENMAGMA — App Logic v2.0
   Premium Gaming Platform
═══════════════════════════════════════ */

let currentCat = 'all';
let heroIdx = 0;
const featured = getFeatured();

/* ══════════════════════════════════════
   GAMIFICATION SYSTEM
══════════════════════════════════════ */
const GS = {
  BADGES: [
    { min:0,    label:'🥉 Newcomer' },
    { min:100,  label:'🥈 Explorer' },
    { min:300,  label:'🥇 Gamer' },
    { min:600,  label:'💎 Pro Gamer' },
    { min:1000, label:'👑 Legend' },
    { min:2000, label:'🌋 ZenMagma Master' },
  ],
  load() {
    return JSON.parse(localStorage.getItem('zm_gs') || '{}');
  },
  save(data) {
    localStorage.setItem('zm_gs', JSON.stringify(data));
  },
  get() {
    const d = this.load();
    return {
      pts:     d.pts     || 0,
      played:  d.played  || 0,
      streak:  d.streak  || 0,
      lastDay: d.lastDay || '',
    };
  },
  addPoints(n) {
    const d = this.get();
    d.pts += n;
    d.played += 1;
    // Streak logic
    const today = new Date().toDateString();
    if (d.lastDay !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      d.streak = d.lastDay === yesterday ? d.streak + 1 : 1;
      d.lastDay = today;
    }
    this.save(d);
    this.render(d);
    this.showPointsPopup(n);
    return d;
  },
  getBadge(pts) {
    let badge = this.BADGES[0];
    for (const b of this.BADGES) { if (pts >= b.min) badge = b; }
    return badge;
  },
  getLevel(pts) {
    return Math.floor(pts / 100) + 1;
  },
  getXPPercent(pts) {
    return ((pts % 100) / 100) * 100;
  },
  render(data) {
    if (!data) data = this.get();
    const badge = this.getBadge(data.pts);
    const level = this.getLevel(data.pts);
    const xpPct = this.getXPPercent(data.pts);

    setText('gam-pts',    data.pts.toLocaleString());
    setText('gam-streak', data.streak);
    setText('gam-played', data.played);
    setText('gam-level',  level);
    setText('gam-badge',  badge.label);
    setWidth('gam-xp-fill', xpPct + '%');

    setText('hdr-pts',    data.pts.toLocaleString());
    setWidth('hdr-xp-fill', xpPct + '%');
    setText('hdr-streak', data.streak);
    setText('sb-pts',     data.pts + ' XP');
  },
  showPointsPopup(n) {
    showToast(`⚡ +${n} XP earned!`, 1800);
  },
  init() {
    this.render();
  }
};

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setWidth(id, val) {
  const el = document.getElementById(id);
  if (el) el.style.width = val;
}

/* ══════════════════════════════════════
   DAILY CHALLENGE
══════════════════════════════════════ */
const DC = {
  getGame() {
    const seed = new Date().toDateString();
    let hash = 0;
    for (const ch of seed) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
    return GAMES[Math.abs(hash) % GAMES.length];
  },
  init() {
    const g = this.getGame();
    setText('dc-title',           g.title);
    setText('sb-challenge-title', g.title);
  }
};

function launchDailyChallenge() {
  const g = DC.getGame();
  GS.addPoints(50);
  showToast('🎯 Daily Challenge! +50 XP bonus!', 2500);
  if (window.openGameModal) { setTimeout(() => openGameModal(g.slug), 400); return; }
  setTimeout(() => { window.location.href = `game.html?id=${g.slug}`; }, 400);
}

/* ══════════════════════════════════════
   MYSTERY GAME
══════════════════════════════════════ */
function launchMystery() {
  const g = GAMES[Math.floor(Math.random() * GAMES.length)];
  showToast(`🎲 Surprise! You got: ${g.title}`, 2000);
  if (window.openGameModal) { setTimeout(() => openGameModal(g.slug), 600); return; }
  setTimeout(() => { window.location.href = `game.html?id=${g.slug}`; }, 600);
}

/* ══════════════════════════════════════
   LEADERBOARD (simulated)
══════════════════════════════════════ */
const FAKE_LEADERS = [
  { name:'StarBlaster99', pts:4820, emoji:'🚀' },
  { name:'PuzzleKing',    pts:3740, emoji:'🧩' },
  { name:'NeonRunner',    pts:2990, emoji:'⚡' },
  { name:'MagmaQueen',    pts:2210, emoji:'🌋' },
  { name:'You',           pts:0,    emoji:'😎', isYou:true },
];

function buildLeaderboard() {
  const el = document.getElementById('mini-leaderboard');
  if (!el) return;
  const myPts = GS.get().pts;
  const rows = FAKE_LEADERS.map((p, i) => {
    const pts = p.isYou ? myPts : p.pts;
    const rankClass = i < 3 ? 'top' : '';
    const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    return `<div class="lb-row">
      <div class="lb-rank ${rankClass}">${rankIcon}</div>
      <div class="lb-avatar">${p.emoji}</div>
      <div class="lb-name">${p.name}${p.isYou ? ' <span style="font-size:10px;color:var(--c-accent)">(You)</span>' : ''}</div>
      <div class="lb-pts">${pts.toLocaleString()} XP</div>
    </div>`;
  }).join('');
  el.innerHTML = rows;
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  GS.init();
  DC.init();
  buildSidebar();
  buildCatPills();
  buildHero();
  buildTrending();
  buildRecent();
  buildAllGames();
  buildLeaderboard();
  startHeroRotation();
  initSearch();
  animateCardsIn();
});

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
function buildSidebar() {
  const list = document.getElementById('cat-list');
  if (!list) return;
  list.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-item${cat.id === 'all' ? ' active' : ''}"
            style="--pill-color:${cat.color}"
            onclick="filterCat('${cat.id}', this)"
            data-id="${cat.id}">
      <span class="cat-dot" style="background:${cat.color}"></span>
      ${cat.label}
    </button>
  `).join('');
}

/* ══════════════════════════════════════
   CATEGORY PILLS
══════════════════════════════════════ */
function buildCatPills() {
  const row = document.getElementById('cat-pills');
  if (!row) return;
  row.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-pill${cat.id === 'all' ? ' active' : ''}"
            style="--pill-color:${cat.color}"
            onclick="filterCat('${cat.id}', this)"
            data-pill="${cat.id}">
      ${cat.label}
    </button>
  `).join('');
}

/* ══════════════════════════════════════
   FILTER BY CATEGORY
══════════════════════════════════════ */
function filterCat(id, el) {
  currentCat = id;
  document.querySelectorAll('.cat-item').forEach(b => b.classList.toggle('active', b.dataset.id === id));
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.toggle('active', b.dataset.pill === id));
  const games = getByCategory(id);
  const cat   = CATEGORIES.find(c => c.id === id);
  document.getElementById('grid-title').innerHTML =
    `<span>${cat?.label.split(' ')[0] || '🎮'}</span> ${cat?.label.replace(/^\S+\s*/, '') || 'All Games'}`;
  document.getElementById('game-count').textContent = `${games.length} games`;
  renderGrid('all-games-grid', games);
  animateCardsIn();
}

/* ══════════════════════════════════════
   HERO CAROUSEL
══════════════════════════════════════ */
function buildHero() {
  setHero(featured[0], 0);
  const dots = document.getElementById('hero-dots');
  if (!dots) return;
  dots.innerHTML = featured.map((_, i) => `
    <div class="hero-dot${i === 0 ? ' on' : ''}" onclick="setHero(null,${i})"></div>
  `).join('');
}

function setHero(game, idx) {
  heroIdx = idx;
  const g = game || featured[idx];
  if (!g) return;
  const heroBg = document.getElementById('hero-bg');
  if (g.thumb) {
    heroBg.style.background = `url(${g.thumb}) center/cover`;
  } else {
    heroBg.style.background = `linear-gradient(135deg, ${g.color}cc 0%, ${g.color}44 100%)`;
  }
  const heroEmoji = document.getElementById('hero-emoji');
  if (heroEmoji) heroEmoji.textContent = g.thumb ? '' : g.emoji;
  document.getElementById('hero-title').textContent = g.title;
  document.getElementById('hero-desc').textContent  = g.desc;
  document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('on', i === idx));
  document.getElementById('hero-play').dataset.slug = g.slug;
}

let heroTimer;
function startHeroRotation() {
  heroTimer = setInterval(() => {
    heroIdx = (heroIdx + 1) % featured.length;
    setHero(null, heroIdx);
  }, 4500);
}

function heroPlay() {
  const slug = document.getElementById('hero-play').dataset.slug;
  if (!slug) return;
  if (window.openGameModal) { openGameModal(slug); return; }
  window.location.href = `game.html?id=${slug}`;
}
function heroMore() {
  const g = featured[heroIdx];
  if (!g) return;
  if (window.openGameModal) { openGameModal(g.slug); return; }
  window.location.href = `game.html?id=${g.slug}`;
}

/* ══════════════════════════════════════
   TRENDING
══════════════════════════════════════ */
function buildTrending() {
  renderScrollRow('trending-row', getTrending());
}

/* ══════════════════════════════════════
   RECENTLY PLAYED
══════════════════════════════════════ */
function buildRecent() {
  const recent = getRecent();
  const sec = document.getElementById('recent-section');
  if (!sec) return;
  if (recent.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  renderScrollRow('recent-row', recent);
}

function clearRecent() {
  localStorage.removeItem('zm_recent');
  const sec = document.getElementById('recent-section');
  if (sec) sec.style.display = 'none';
}

/* ══════════════════════════════════════
   ALL GAMES GRID
══════════════════════════════════════ */
function buildAllGames() {
  renderGrid('all-games-grid', GAMES);
  document.getElementById('game-count').textContent = `${GAMES.length} games`;
}

/* ══════════════════════════════════════
   RENDER HELPERS
══════════════════════════════════════ */
function renderScrollRow(containerId, games) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = games.map(g => gameCardHTML(g, 'scroll')).join('');
}

function renderGrid(containerId, games) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = games.map((g, i) => gameCardHTML(g, 'grid', i)).join('');
}

function thumbHTML(g) {
  if (g.thumb) {
    return `<img src="${g.thumb}" alt="${g.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
  }
  // Rich gradient fallback with emoji, title, and subtle pattern
  return `<div style="
    width:100%;height:100%;
    background:radial-gradient(ellipse at 30% 40%, ${g.color}ee 0%, ${g.color}88 40%, ${g.color}44 100%);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
    position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,.02) 20px,rgba(255,255,255,.02) 40px)"></div>
    <span style="font-size:52px;line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6));z-index:1">${g.emoji}</span>
    <span style="font-size:11px;font-weight:800;color:#fff;letter-spacing:1.5px;text-transform:uppercase;opacity:.9;text-align:center;padding:0 12px;text-shadow:0 1px 4px rgba(0,0,0,.8);z-index:1">${g.title}</span>
  </div>`;
}

/* Simulated player counts per game */
function fakePlayerCount(id) {
  let h = 0;
  for (const c of (id || 'x')) h = ((h << 5) - h) + c.charCodeAt(0);
  return (Math.abs(h) % 900 + 100).toLocaleString();
}

function gameCardHTML(g, mode = 'grid', index = 0) {
  const badges = [
    g.isNew      ? '<span class="badge new">✨ New</span>'    : '',
    g.trending   ? '<span class="badge hot">🔥 Hot</span>'    : '',
    g.isExternal ? '<span class="badge gd">🌐 Live</span>'    : '',
  ].filter(Boolean).join('');

  // Category display label
  const cat = CATEGORIES.find(c => c.id === g.category);
  const catLabel = cat ? cat.label.replace(/^\S+\s*/, '') : g.category || '';

  const delay = Math.min(index * 40, 400);
  const featuredClass = g.featured ? ' featured-card' : '';
  const hotClass = g.trending ? ' hot-card' : '';

  return `
    <a class="game-card${g.thumb ? ' poki-card' : ''}${featuredClass}${hotClass}" href="game.html?id=${g.slug}"
       onclick="handleCardClick(event,'${g.id}')"
       style="--card-color:${g.color};animation-delay:${delay}ms"
       title="${g.title} — ${g.desc ? g.desc.slice(0,80) : ''}">
      <div class="card-thumb${g.videoPreview ? ' has-preview' : ''}" style="background:${g.color}33">
        ${thumbHTML(g)}
        ${g.videoPreview
          ? /\.gif$/i.test(g.videoPreview)
            ? `<img  class="card-preview card-preview-gif" data-src="${g.videoPreview}" alt="" aria-hidden="true">`
            : `<video class="card-preview" muted loop playsinline preload="none" data-src="${g.videoPreview}" tabindex="-1" aria-hidden="true"></video>`
          : ''}
        <div class="card-overlay">
          <div class="card-play-label">▶ Play Now</div>
        </div>
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
        ${g.isExternal ? `<div class="card-ext-badge">GD</div>` : ''}
        <div class="card-players">
          <span class="dot"></span>
          ${fakePlayerCount(g.id)} online
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${g.title}</div>
        <div class="card-meta">
          <span class="card-cat-badge">${catLabel}</span>
          <span class="card-rating">⭐ ${g.rating}</span>
        </div>
        <div class="card-plays-row">
          <span class="live-dot"></span>
          ${formatPlays(g.plays)} plays
        </div>
      </div>
    </a>
  `;
}

function handleCardClick(e, id) {
  e.preventDefault();
  addRecent(id);
  if (window.GS) {
    const data = GS.addPoints(10);
    buildLeaderboard?.();
    const badge = GS.getBadge(data.pts);
    const prev  = GS.getBadge(data.pts - 10);
    if (badge.label !== prev.label) {
      setTimeout(() => showToast(`🏅 Badge unlocked: ${badge.label}!`, 3000), 600);
    }
  }
  // Mobile: navigate directly to game page — modal iframe is unreliable on touch devices
  const isMobile = window.matchMedia('(hover:none) and (pointer:coarse)').matches;
  if (isMobile || !window.openGameModal) {
    const g = getGameById(id);
    if (g) window.location.href = 'game.html?id=' + (g.slug || g.id);
    return;
  }
  openGameModal(id);
}

/* ══════════════════════════════════════
   CARD ENTRANCE ANIMATION
══════════════════════════════════════ */
function animateCardsIn() {
  setTimeout(() => {
    document.querySelectorAll('#all-games-grid .game-card').forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(24px) scale(.96)';
      c.style.transition = 'none';
      setTimeout(() => {
        c.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(.23,1,.32,1)';
        c.style.opacity = '1';
        c.style.transform = '';
      }, i * 35);
    });
  }, 20);
  setTimeout(initCardTilt, 500);
}

function initCardTilt() {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  const bar = input.parentElement;
  const clearBtn = document.createElement('button');
  clearBtn.id = 'search-clear';
  clearBtn.innerHTML = '✕';
  clearBtn.style.cssText = 'position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--c-muted);font-size:14px;cursor:pointer;display:none;padding:4px;line-height:1;';
  clearBtn.onclick = () => { input.value = ''; clearSearch(); input.focus(); };
  bar.style.position = 'relative';
  bar.appendChild(clearBtn);

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    clearBtn.style.display = input.value ? 'block' : 'none';
    timer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (!q) { clearSearch(); return; }
      doSearch(q);
    }, 200);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; clearSearch(); input.blur(); }
  });
}

function doSearch(q) {
  const results = GAMES.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.tags.some(t => t.toLowerCase().includes(q)) ||
    g.category.toLowerCase().includes(q) ||
    g.desc.toLowerCase().includes(q)
  );

  const hideEls = ['hero', 'cat-pills', 'trending-section', 'recent-section',
                   'gamification-bar', 'daily-challenge', 'mini-leaderboard'];
  hideEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.querySelectorAll('.sec-header').forEach(el => {
    if (el.nextElementSibling?.classList.contains('scroll-row')) {
      el.style.display = 'none';
      el.nextElementSibling.style.display = 'none';
    }
  });
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.mystery-box').forEach(el => el.style.display = 'none');

  document.getElementById('grid-title').innerHTML =
    `<span>🔍</span> Results for "<em style="color:var(--c-neon)">${q}</em>"`;
  document.getElementById('game-count').textContent =
    results.length ? `${results.length} game${results.length > 1 ? 's' : ''} found` : '';

  if (results.length === 0) {
    document.getElementById('all-games-grid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--c-muted)">
        <div style="font-size:52px;margin-bottom:16px">🔍</div>
        <div style="font-size:18px;font-weight:800;color:var(--c-text);margin-bottom:8px">No games found for "${q}"</div>
        <div style="font-size:14px">Try "puzzle", "runner", "mario" or a game name</div>
      </div>`;
  } else {
    renderGrid('all-games-grid', results);
    animateCardsIn();
  }

  const grid = document.getElementById('all-games-grid');
  if (grid) {
    const top = (grid.closest('section') || grid.parentElement || grid)
      .getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

function clearSearch() {
  ['hero', 'cat-pills', 'gamification-bar', 'daily-challenge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  document.querySelectorAll('.sec-header').forEach(el => {
    el.style.display = '';
    if (el.nextElementSibling?.classList.contains('scroll-row'))
      el.nextElementSibling.style.display = '';
  });
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = '');
  document.querySelectorAll('.mystery-box').forEach(el => el.style.display = '');

  const lb = document.getElementById('mini-leaderboard');
  if (lb) lb.style.display = '';

  buildRecent();
  document.getElementById('grid-title').innerHTML = `<span>🎮</span> All Games`;
  document.getElementById('game-count').textContent = `${GAMES.length} games`;
  renderGrid('all-games-grid', GAMES);
  animateCardsIn();

  const clr = document.getElementById('search-clear');
  if (clr) clr.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════
   SIDEBAR TOGGLE (mobile)
══════════════════════════════════════ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  const isOpen = sb.style.display === 'block';
  sb.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    Object.assign(sb.style, {
      position:'fixed', top:'64px', left:'0', bottom:'0',
      zIndex:'300', width:'230px', overflowY:'auto'
    });
  }
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let _toastTimer;
function showToast(msg, dur = 2000) {
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(_toastTimer);
  t.innerHTML = `${msg}<div id="toast-bar"></div>`;
  t.classList.add('show');
  _toastTimer = setTimeout(() => t.classList.remove('show'), dur);
}

/* ═══════════════════════════════════════
   ZENMAGMA — App Logic v3.0
   Grid-first game portal
═══════════════════════════════════════ */

let currentCat = 'all';

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildCatPills();
  buildTrending();
  buildRecent();
  buildAllGames();
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
  var _catLabel = cat ? cat.label : '';
  document.getElementById('grid-title').innerHTML =
    '<span>' + (_catLabel.split(' ')[0] || '🎮') + '</span> ' + (_catLabel.replace(/^\S+\s*/, '') || 'All Games');
  document.getElementById('game-count').textContent = `${games.length} games`;
  renderGrid('all-games-grid', games);
  animateCardsIn();
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
    <span style="font-size:52px;line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3));z-index:1">${g.emoji}</span>
    <span style="font-size:11px;font-weight:800;color:#fff;letter-spacing:1.5px;text-transform:uppercase;opacity:.9;text-align:center;padding:0 12px;text-shadow:0 1px 4px rgba(0,0,0,.5);z-index:1">${g.title}</span>
  </div>`;
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

  return `
    <a class="game-card${g.thumb ? ' poki-card' : ''}" href="game.html?id=${g.slug}"
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
      </div>
      <div class="card-info">
        <div class="card-title">${g.title}</div>
        <div class="card-meta">
          <span class="card-cat-badge">${catLabel}</span>
          <span class="card-rating">⭐ ${g.rating}</span>
        </div>
        <div class="card-plays-row">
          ${formatPlays(g.plays)} plays
        </div>
      </div>
    </a>
  `;
}

function handleCardClick(e, id) {
  e.preventDefault();
  addRecent(id);
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

  const hideEls = ['cat-pills', 'recent-section', 'quizblaze-spotlight'];
  hideEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.querySelectorAll('.sec-header').forEach(function(el) {
    var ns = el.nextElementSibling;
    if (ns && ns.classList.contains('scroll-row')) {
      el.style.display = 'none';
      ns.style.display = 'none';
    }
  });
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = 'none');

  document.getElementById('grid-title').innerHTML =
    `<span>🔍</span> Results for "<em style="color:var(--c-accent)">${q}</em>"`;
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
  ['cat-pills', 'quizblaze-spotlight'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  document.querySelectorAll('.sec-header').forEach(function(el) {
    el.style.display = '';
    var ns = el.nextElementSibling;
    if (ns && ns.classList.contains('scroll-row')) ns.style.display = '';
  });
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = '');

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
   SIDEBAR TOGGLE (mobile fallback — overridden by SidebarCtrl)
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

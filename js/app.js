/* ═══════════════════════════════════════
   ZENMAGMA — Main App Logic | zenmagma.com
═══════════════════════════════════════ */

let currentCat = 'all';
let heroIdx = 0;
const featured = getFeatured();

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildCatPills();
  buildHero();
  buildTrending();
  buildRecent();
  buildAllGames();
  startHeroRotation();
  initSearch();
});

/* ── SIDEBAR CATEGORIES ── */
function buildSidebar() {
  const list = document.getElementById('cat-list');
  list.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-item${cat.id === 'all' ? ' active' : ''}"
            onclick="filterCat('${cat.id}', this)"
            data-id="${cat.id}">
      <span class="cat-dot" style="background:${cat.color}"></span>
      ${cat.label}
    </button>
  `).join('');
}

/* ── CATEGORY PILLS ── */
function buildCatPills() {
  const row = document.getElementById('cat-pills');
  row.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-pill${cat.id === 'all' ? ' active' : ''}"
            onclick="filterCat('${cat.id}', this)"
            data-pill="${cat.id}">
      ${cat.label}
    </button>
  `).join('');
}

/* ── FILTER ── */
function filterCat(id, el) {
  currentCat = id;
  // Update sidebar
  document.querySelectorAll('.cat-item').forEach(b => {
    b.classList.toggle('active', b.dataset.id === id);
  });
  // Update pills
  document.querySelectorAll('.cat-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.pill === id);
  });
  // Update grid
  const games = getByCategory(id);
  const cat = CATEGORIES.find(c => c.id === id);
  document.getElementById('grid-title').innerHTML = `<span>${cat?.label.split(' ')[0] || '🎮'}</span> ${cat?.label.replace(/^\S+\s*/,'') || 'All Games'}`;
  document.getElementById('game-count').textContent = `${games.length} games`;
  renderGrid('all-games-grid', games);
}

/* ── HERO CAROUSEL ── */
function buildHero() {
  setHero(featured[0], 0);
  // Dots
  const dots = document.getElementById('hero-dots');
  dots.innerHTML = featured.map((_, i) => `
    <div class="hero-dot${i===0?' on':''}" onclick="setHero(null,${i})"></div>
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
    heroBg.style.display = 'flex';
    heroBg.style.alignItems = 'center';
    heroBg.style.justifyContent = 'center';
  }
  const heroEmoji = document.getElementById('hero-emoji');
  if (heroEmoji) heroEmoji.textContent = g.thumb ? '' : g.emoji;
  document.getElementById('hero-title').textContent = g.title;
  document.getElementById('hero-desc').textContent = g.desc;
  document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('on', i===idx));
  document.getElementById('hero-play').dataset.slug = g.slug;
}

let heroTimer;
function startHeroRotation() {
  heroTimer = setInterval(() => {
    heroIdx = (heroIdx + 1) % featured.length;
    setHero(null, heroIdx);
  }, 4000);
}

function heroPlay() {
  const slug = document.getElementById('hero-play').dataset.slug;
  if (slug) window.location.href = `game.html?id=${slug}`;
}
function heroMore() {
  const g = featured[heroIdx];
  if (g) window.location.href = `game.html?id=${g.slug}`;
}

/* ── TRENDING ── */
function buildTrending() {
  renderScrollRow('trending-row', getTrending());
}

/* ── RECENT ── */
function buildRecent() {
  const recent = getRecent();
  const sec = document.getElementById('recent-section');
  if (recent.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  renderScrollRow('recent-row', recent);
}

function clearRecent() {
  localStorage.removeItem('zm_recent');
  document.getElementById('recent-section').style.display = 'none';
}

/* ── ALL GAMES ── */
function buildAllGames() {
  renderGrid('all-games-grid', GAMES);
  document.getElementById('game-count').textContent = `${GAMES.length} games`;
}

/* ── RENDER HELPERS ── */
function renderScrollRow(containerId, games) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = games.map(g => gameCardHTML(g, 'scroll')).join('');
}

function renderGrid(containerId, games) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = games.map(g => gameCardHTML(g, 'grid')).join('');
}

function thumbHTML(g) {
  if (g.thumb) return `<img src="${g.thumb}" alt="${g.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
  // Emoji-based generated thumbnail
  return `<div style="
    width:100%;height:100%;
    background:linear-gradient(135deg,${g.color}dd,${g.color}66);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
    <span style="font-size:52px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))">${g.emoji}</span>
    <span style="font-size:10px;font-weight:800;color:#fff;letter-spacing:1px;text-transform:uppercase;opacity:.85;text-align:center;padding:0 8px">${g.title}</span>
  </div>`;
}

function gameCardHTML(g, mode = 'grid') {
  const badges = [
    g.isNew    ? '<span class="badge new">New</span>'   : '',
    g.trending ? '<span class="badge hot">🔥 Hot</span>': '',
  ].filter(Boolean).join('');

  return `
    <a class="game-card" href="game.html?id=${g.slug}" onclick="handleCardClick(event,'${g.id}')">
      <div class="card-thumb" style="background:${g.color}33">
        ${thumbHTML(g)}
        <div class="card-overlay">
          <div class="card-play-btn">▶</div>
        </div>
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      </div>
      <div class="card-info">
        <div class="card-title">${g.title}</div>
        <div class="card-meta">
          <span class="card-rating">⭐ ${g.rating}</span>
        </div>
      </div>
    </a>
  `;
}

function handleCardClick(e, id) {
  addRecent(id);
  showToast('🎮 Loading game...');
}

/* ── SEARCH ── */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  // Add clear button inside search bar
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

  // Search on Enter key too
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

  // Hide hero + trending during search
  const hideEls = ['hero', 'cat-pills', 'trending-section', 'recent-section'];
  hideEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Also hide the trending row wrapper (uses sec-header sibling)
  document.querySelectorAll('.sec-header').forEach(el => {
    if (el.nextElementSibling?.classList.contains('scroll-row')) {
      el.style.display = 'none';
      el.nextElementSibling.style.display = 'none';
    }
  });
  // Hide ad banners in main content during search
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = 'none');

  // Update grid title
  document.getElementById('grid-title').innerHTML =
    `<span>🔍</span> Results for "<em style="color:var(--c-accent)">${q}</em>"`;
  document.getElementById('game-count').textContent =
    results.length ? `${results.length} game${results.length > 1 ? 's' : ''} found` : '';

  if (results.length === 0) {
    document.getElementById('all-games-grid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--c-muted);">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <div style="font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:8px;">No games found for "${q}"</div>
        <div style="font-size:14px;">Try searching for a category like "puzzle", "runner" or a game name</div>
      </div>`;
  } else {
    renderGrid('all-games-grid', results);
  }

  // Scroll smoothly to results
  const grid = document.getElementById('all-games-grid');
  if (grid) {
    const gridSection = grid.closest('section') || grid.parentElement;
    const top = (gridSection || grid).getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

function clearSearch() {
  // Restore hidden sections
  const showEls = ['hero', 'cat-pills'];
  showEls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  document.querySelectorAll('.sec-header').forEach(el => {
    el.style.display = '';
    if (el.nextElementSibling?.classList.contains('scroll-row'))
      el.nextElementSibling.style.display = '';
  });
  document.querySelectorAll('.ad-banner.leaderboard').forEach(el => el.style.display = '');

  // Restore recent section only if it has items
  buildRecent();

  // Reset grid to current category
  document.getElementById('grid-title').innerHTML = `<span>🎮</span> All Games`;
  document.getElementById('game-count').textContent = `${GAMES.length} games`;
  renderGrid('all-games-grid', GAMES);
  document.getElementById('search-clear').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── SIDEBAR TOGGLE (mobile) ── */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.style.display = sb.style.display === 'block' ? 'none' : 'block';
  sb.style.position = 'fixed';
  sb.style.top = '60px'; sb.style.left = '0'; sb.style.bottom = '0';
  sb.style.zIndex = '99'; sb.style.width = '240px';
  sb.style.overflowY = 'auto';
}

/* ── TOAST ── */
function showToast(msg, dur = 2000) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ═══════════════════════════════════════
   GAMEZONE — Main App Logic
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
      <span class="cat-count">${getByCategory(cat.id).length}</span>
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
  localStorage.removeItem('gz_recent');
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
          <span class="card-plays">🎮 ${formatPlays(g.plays)}</span>
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
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (!q) { buildAllGames(); return; }
      const results = GAMES.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.tags.some(t => t.includes(q)) ||
        g.category.includes(q)
      );
      document.getElementById('grid-title').innerHTML = `<span>🔍</span> Results for "${q}"`;
      document.getElementById('game-count').textContent = `${results.length} found`;
      renderGrid('all-games-grid', results);
    }, 250);
  });
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

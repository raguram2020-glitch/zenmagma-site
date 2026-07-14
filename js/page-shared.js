/* ═══════════════════════════════════════════════════
   ZENMAGMA — page-shared.js
   Shared header, footer, and utility helpers
   Used by: about, contact, privacy-policy, sitemap,
            and all /categories/ pages
═══════════════════════════════════════════════════ */

/* Auto-detect base path — handles both root & /categories/ */
const ZM_BASE = window.ZM_BASE !== undefined ? window.ZM_BASE : (() => {
  return window.location.pathname.includes('/categories/') ? '../' : '';
})();

/* ─────────────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────────────────*/
const ZM_NAV = [
  { href: 'index.html',              label: 'Home',          icon: '🏠' },
  { href: 'index.html',              label: 'All Games',     icon: '🎮' },
  { href: 'categories/action.html',  label: 'Action',        icon: '⚡' },
  { href: 'categories/puzzle.html',  label: 'Puzzle',        icon: '🧩' },
  { href: 'categories/kids.html',    label: 'Kids',          icon: '🌈' },
  { href: 'categories/runner.html',  label: 'Runner',        icon: '🏃' },
  { href: 'categories/arcade.html',  label: 'Arcade',        icon: '🕹️' },
  { href: 'videos.html',             label: 'Videos',        icon: '🎬' },
  { href: 'about.html',              label: 'About',         icon: '✨' },
  { href: 'contact.html',            label: 'Contact',       icon: '💬' },
];

/* ─────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────*/
function zmHeader(activePage) {
  const links = ZM_NAV.map(n => {
    const active = activePage && n.label.toLowerCase() === activePage.toLowerCase();
    return `<a href="${ZM_BASE}${n.href}" class="page-nav-link${active ? ' active' : ''}" title="${n.label}">
      <span class="nav-icon">${n.icon}</span>
      <span class="nav-text">${n.label}</span>
    </a>`;
  }).join('');

  return `
<header id="header" class="sub-header">
  <a href="${ZM_BASE}index.html" class="logo" style="flex-shrink:0">
    <span class="logo-icon">🌋</span><span>ZenMagma</span>
  </a>
  <nav class="page-nav" id="page-nav">
    ${links}
  </nav>
  <div class="header-actions">
    <button class="page-nav-toggle" onclick="togglePageNav()" aria-label="Menu">☰</button>
    <a href="${ZM_BASE}index.html" class="btn-pill primary" style="flex-shrink:0">🎮 Play Games</a>
  </div>
</header>`;
}

/* ─────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────*/
function zmFooter() {
  return `
<footer>
  <div class="footer-grid">
    <div class="footer-col">
      <div class="logo" style="margin-bottom:12px;font-size:18px">🌋 ZenMagma</div>
      <p style="font-size:12px;color:var(--c-muted);line-height:1.7;max-width:200px">
        Free online games for kids and adults. No downloads, no sign-ups — just fun!
      </p>
    </div>
    <div class="footer-col">
      <h4>Categories</h4>
      <a href="${ZM_BASE}categories/action.html">⚡ Action Games</a>
      <a href="${ZM_BASE}categories/puzzle.html">🧩 Puzzle Games</a>
      <a href="${ZM_BASE}categories/runner.html">🏃 Runner Games</a>
      <a href="${ZM_BASE}categories/kids.html">🌈 Kids Games</a>
      <a href="${ZM_BASE}categories/arcade.html">🕹️ Arcade Games</a>
    </div>
    <div class="footer-col">
      <h4>Platform</h4>
      <a href="${ZM_BASE}index.html">🏠 Home</a>
      <a href="${ZM_BASE}index.html">🎮 All Games</a>
      <a href="${ZM_BASE}videos.html">🎬 Videos</a>
      <a href="${ZM_BASE}about.html">✨ About Us</a>
      <a href="${ZM_BASE}contact.html">💬 Contact</a>
      <a href="${ZM_BASE}privacy-policy.html">🔒 Privacy Policy</a>
      <a href="${ZM_BASE}sitemap.html">🗺️ Sitemap</a>
    </div>
    <div class="footer-col">
      <h4>Follow Us</h4>
      <a href="https://www.youtube.com/@zenmagma_wisdomnest" target="_blank" rel="noopener">▶️ YouTube</a>
      <a href="https://www.instagram.com/zenmagma_official/" target="_blank" rel="noopener">📸 Instagram</a>
      <a href="${ZM_BASE}contact.html?subject=submit">📤 Submit a Game</a>
      <a href="${ZM_BASE}contact.html?subject=advertise">📢 Advertise</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} <a href="https://zenmagma.com" style="color:var(--c-accent)">ZenMagma.com</a>. All rights reserved.</span>
    <span style="display:flex;align-items:center;gap:12px">
      <a href="${ZM_BASE}privacy-policy.html" style="color:var(--c-muted);font-size:12px">Privacy Policy</a>
      <span style="color:var(--c-border-h)">·</span>
      <span style="color:var(--c-muted);font-size:12px">Made with ❤️ for players</span>
    </span>
  </div>
</footer>`;
}

/* ─────────────────────────────────────────────────
   SHARED CSS injected once per sub-page
───────────────────────────────────────────────────*/
function zmInjectStyles() {
  if (document.getElementById('zm-shared-css')) return;
  const s = document.createElement('style');
  s.id = 'zm-shared-css';
  s.textContent = `
    /* ── Sub-page nav ── */
    .page-nav {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
      overflow-x: auto;
      padding: 0 8px;
      scrollbar-width: none;
    }
    .page-nav::-webkit-scrollbar { display: none; }
    .page-nav-link {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      font-weight: 700;
      color: var(--c-muted, #6b7280);
      padding: 6px 10px;
      border-radius: 8px;
      transition: color .2s, background .2s;
      text-decoration: none;
      white-space: nowrap;
    }
    .page-nav-link:hover {
      color: var(--c-text, #1a1a2e);
      background: var(--c-card-h, #f0f1f5);
    }
    .page-nav-link.active {
      color: var(--c-accent, #6c5ce7);
      background: rgba(108,92,231,.1);
    }
    .nav-icon { font-size: 15px; }
    .nav-text { }

    .page-nav-toggle {
      display: none;
      background: var(--c-card-h, #f0f1f5);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 8px;
      color: var(--c-text, #1a1a2e);
      font-size: 18px;
      cursor: pointer;
      padding: 6px 10px;
    }

    @media (max-width: 900px) {
      .page-nav { display: none; }
      .page-nav.open { display: flex; flex-direction: column; align-items: flex-start;
        position: absolute; top: var(--header-h, 64px); left: 0; right: 0;
        background: var(--c-surface, #ffffff); border-bottom: 1px solid var(--c-border, #e6e7ec);
        padding: 12px 16px; z-index: 400; }
      .page-nav-toggle { display: block; }
    }

    /* ── Sub-page hero banner ── */
    .sub-hero {
      padding: 52px 32px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
      background: var(--hero-color, var(--c-card-h));
    }
    .sub-hero-icon { font-size: 60px; margin-bottom: 16px; display: block; }
    .sub-hero-title {
      font-family: var(--font-title, 'Nunito', sans-serif);
      font-size: clamp(28px, 5vw, 44px);
      font-weight: 900;
      color: var(--c-text, #1a1a2e);
      margin-bottom: 12px;
      line-height: 1.1;
    }
    .sub-hero-sub {
      font-size: 16px;
      color: var(--c-muted, #6b7280);
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .sub-hero-stats {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 28px;
      flex-wrap: wrap;
    }
    .sub-stat {
      text-align: center;
    }
    .sub-stat-val {
      font-family: var(--font-game, 'Nunito', sans-serif);
      font-size: 26px;
      font-weight: 900;
      color: var(--c-text, #1a1a2e);
    }
    .sub-stat-label {
      font-size: 11px;
      color: var(--c-muted, #6b7280);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 3px;
    }

    /* ── Content container ── */
    .sub-content {
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 24px 60px;
    }
    .sub-section {
      margin-bottom: 48px;
    }
    .sub-section-title {
      font-family: var(--font-title, 'Nunito', sans-serif);
      font-size: 20px;
      font-weight: 800;
      color: var(--c-text, #1a1a2e);
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--c-border, #e6e7ec);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sub-section p {
      font-size: 15px;
      color: var(--c-muted, #6b7280);
      line-height: 1.8;
      margin-bottom: 14px;
    }
    .sub-section ul, .sub-section ol {
      padding-left: 20px;
      margin-bottom: 14px;
    }
    .sub-section li {
      font-size: 14px;
      color: var(--c-muted, #6b7280);
      line-height: 1.7;
      margin-bottom: 6px;
    }

    /* ── Cards grid for about/team ── */
    .cards-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .info-card {
      background: var(--c-card, #ffffff);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      box-shadow: var(--shadow-card);
      transition: border-color .2s, transform .2s;
    }
    .info-card:hover {
      border-color: var(--c-border-h, #d3d5de);
      transform: translateY(-3px);
    }
    .info-card-icon { font-size: 36px; margin-bottom: 10px; }
    .info-card-title {
      font-weight: 800;
      color: var(--c-text, #1a1a2e);
      font-size: 15px;
      margin-bottom: 6px;
    }
    .info-card-text {
      font-size: 13px;
      color: var(--c-muted, #6b7280);
      line-height: 1.6;
    }

    /* ── Contact form ── */
    .contact-form {
      background: var(--c-card, #ffffff);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: var(--shadow-card);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 540px) { .form-row { grid-template-columns: 1fr; } }
    .form-field {
      margin-bottom: 18px;
    }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: var(--c-muted, #6b7280);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      background: var(--c-card-h, #f0f1f5);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 10px;
      color: var(--c-text, #1a1a2e);
      font-size: 14px;
      font-family: 'Nunito', sans-serif;
      padding: 12px 14px;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      resize: none;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: var(--c-accent, #6c5ce7);
      background: var(--c-surface, #ffffff);
      box-shadow: 0 0 0 3px rgba(108,92,231,.12);
    }
    .form-textarea { min-height: 140px; }
    .form-submit {
      width: 100%;
      padding: 14px;
      background: var(--c-accent, #6c5ce7);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      font-family: var(--font-title, 'Nunito', sans-serif);
      cursor: pointer;
      transition: transform .15s, box-shadow .2s;
      box-shadow: var(--shadow-card);
      letter-spacing: .5px;
    }
    .form-submit:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
    .form-submit:active { transform: translateY(0); }
    .form-success {
      display: none;
      background: rgba(16,185,129,.1);
      border: 1px solid rgba(16,185,129,.3);
      border-radius: 12px;
      padding: 16px 20px;
      color: var(--c-green, #10b981);
      font-weight: 700;
      font-size: 14px;
      margin-top: 16px;
      text-align: center;
    }

    /* ── Sitemap ── */
    .sitemap-section { margin-bottom: 36px; }
    .sitemap-section-title {
      font-family: var(--font-title, 'Nunito', sans-serif);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--c-muted, #6b7280);
      margin-bottom: 16px;
      padding-left: 4px;
    }
    .sitemap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .sitemap-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--c-card, #ffffff);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 12px;
      text-decoration: none;
      color: var(--c-text, #1a1a2e);
      font-size: 13px;
      font-weight: 700;
      box-shadow: var(--shadow-card);
      transition: border-color .2s, transform .15s;
    }
    .sitemap-card:hover {
      border-color: var(--c-accent, #6c5ce7);
      transform: translateY(-2px);
    }
    .sitemap-card-icon { font-size: 22px; flex-shrink: 0; }

    /* ── Category page grid ── */
    .cat-page-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px 60px; }
    .cat-filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .cat-sort-label { font-size: 13px; color: var(--c-muted, #6b7280); font-weight: 700; }
    .cat-sort-btn {
      padding: 6px 14px;
      border-radius: 20px;
      background: var(--c-card-h, #f0f1f5);
      border: 1px solid var(--c-border, #e6e7ec);
      color: var(--c-muted, #6b7280);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s, color .15s, border-color .15s;
    }
    .cat-sort-btn:hover, .cat-sort-btn.active {
      background: rgba(108,92,231,.1);
      border-color: var(--c-accent, #6c5ce7);
      color: var(--c-accent, #6c5ce7);
    }

    /* Related categories row */
    .related-cats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }
    .related-cat-chip {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      background: var(--c-card, #ffffff);
      border: 1px solid var(--c-border, #e6e7ec);
      border-radius: 20px;
      text-decoration: none;
      color: var(--c-text, #1a1a2e);
      font-size: 13px;
      font-weight: 700;
      box-shadow: var(--shadow-card);
      transition: border-color .2s, transform .15s;
    }
    .related-cat-chip:hover {
      border-color: var(--c-accent, #6c5ce7);
      transform: translateY(-1px);
    }

    /* Privacy policy specific */
    .policy-toc {
      background: rgba(108,92,231,.06);
      border: 1px solid rgba(108,92,231,.2);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 36px;
    }
    .policy-toc h3 {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--c-muted, #6b7280);
      margin-bottom: 12px;
    }
    .policy-toc ol {
      padding-left: 20px;
    }
    .policy-toc li {
      margin-bottom: 6px;
    }
    .policy-toc a {
      color: var(--c-accent, #6c5ce7);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: color .2s;
    }
    .policy-toc a:hover { color: var(--c-accent2, #8b7cf6); }
    .policy-updated {
      font-size: 12px;
      color: var(--c-muted, #6b7280);
      font-style: italic;
    }

    /* ── Breadcrumb ── */
    .sub-breadcrumb {
      padding: 10px 24px;
      background: var(--c-surface, #ffffff);
      border-bottom: 1px solid var(--c-border, #e6e7ec);
      font-size: 12px;
      color: var(--c-muted, #6b7280);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sub-breadcrumb a { color: var(--c-muted, #6b7280); text-decoration: none; transition: color .2s; }
    .sub-breadcrumb a:hover { color: var(--c-accent, #6c5ce7); }
    .sub-breadcrumb .bc-sep { opacity: .5; }
    .sub-breadcrumb .bc-cur { color: var(--c-text, #1a1a2e); font-weight: 700; }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────
   MOBILE NAV TOGGLE
───────────────────────────────────────────────────*/
function togglePageNav() {
  var _pn = document.getElementById('page-nav');
  if (_pn) _pn.classList.toggle('open');
}
// Close on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('#page-nav') && !e.target.closest('.page-nav-toggle')) {
    var _pn2 = document.getElementById('page-nav');
    if (_pn2) _pn2.classList.remove('open');
  }
});

/* ─────────────────────────────────────────────────
   AUTO-INIT — inject if placeholder elements exist
───────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  zmInjectStyles();
  const hEl = document.getElementById('zm-header');
  const fEl = document.getElementById('zm-footer');
  if (hEl) hEl.outerHTML = zmHeader(hEl.dataset.active);
  if (fEl) fEl.outerHTML = zmFooter();
});

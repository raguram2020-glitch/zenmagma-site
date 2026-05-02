/* ═══════════════════════════════════════════════════
   ZENMAGMA — post-game.js
   Post-game modal: XP award, recommendations, chaining
   Depends on: engagement.js, games-data.js
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   showPostGameModal(gameData)
   gameData = { id, slug, title, emoji, color, category, xpEarned? }
───────────────────────────────────────────────────*/
function showPostGameModal(gameData) {
  // Remove any existing modal
  document.getElementById('pgm-overlay')?.remove();

  // Award XP
  const xpEarned = gameData.xpEarned ?? 25;
  const result   = Engagement.addXP(xpEarned);
  Engagement.updateStreak();

  const userData = Engagement.renderXPBar ? (() => {
    // Re-fetch after addXP
    try { return JSON.parse(localStorage.getItem('zm_user') || '{}'); } catch { return {}; }
  })() : {};

  const level   = Engagement.getLevel(userData.totalXP);
  const pct     = Engagement.getXPPercent(userData.totalXP);
  const toLvl   = Engagement.getXPToNextLevel(userData.totalXP);
  const badge   = Engagement.getBadge(userData.totalXP);
  const streak  = userData.streak ?? 0;

  // Next game suggestion
  const nextGame = Engagement.getNextGame(gameData.slug, gameData.category);

  // Recommended: up to 3 from same category, fresh
  const recentSlugs = Engagement.getRecentGames().slice(0, 3);
  const recommended = (typeof GAMES !== 'undefined')
    ? GAMES.filter(g => g.slug !== gameData.slug && !recentSlugs.includes(g.slug) && g.category === gameData.category).slice(0, 3)
    : [];

  // Badge unlock banner
  const badgeBanner = result.unlocked
    ? `<div class="pgm-badge-unlock">🎉 Badge Unlocked: ${result.unlocked.icon} ${result.unlocked.label}!</div>`
    : '';

  // Recommended cards HTML
  const recHTML = recommended.length
    ? `<div class="pgm-rec-title">🎮 You Might Like</div>
       <div class="pgm-rec-row">
         ${recommended.map(g => `
           <a class="pgm-rec-card" href="game.html?id=${g.slug}" onclick="closePostGameModal()">
             <div class="pgm-rec-thumb" style="background:${g.color}33">${g.thumb ? `<img src="${g.thumb}" alt="${g.title}">` : g.emoji}</div>
             <div class="pgm-rec-name">${g.title}</div>
           </a>`).join('')}
       </div>`
    : '';

  const nextBtn = nextGame
    ? `<a class="pgm-btn pgm-btn-primary btn-ripple" href="game.html?id=${nextGame.slug}" onclick="closePostGameModal()">
         ▶ Play ${nextGame.title}
       </a>`
    : '';

  const modal = document.createElement('div');
  modal.id = 'pgm-overlay';
  modal.innerHTML = `
    <div class="pgm-card" id="pgm-card">

      <!-- Header -->
      <div class="pgm-header">
        <div class="pgm-emoji">${gameData.emoji || '🎮'}</div>
        <div class="pgm-header-text">
          <div class="pgm-round-label">Round Complete!</div>
          <div class="pgm-game-name">${gameData.title}</div>
        </div>
        <button class="pgm-close" onclick="closePostGameModal()" aria-label="Close">✕</button>
      </div>

      ${badgeBanner}

      <!-- XP Award -->
      <div class="pgm-xp-award">
        <div class="pgm-xp-glow">⚡ +${xpEarned} XP</div>
        <div class="pgm-xp-sub">Level ${level} · ${badge.icon} ${badge.label}</div>
      </div>

      <!-- Progress Bar -->
      <div class="pgm-progress-wrap">
        <div class="pgm-progress-bar">
          <div class="pgm-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="pgm-progress-label">${toLvl} XP to Level ${level + 1}</div>
      </div>

      <!-- Streak -->
      <div class="pgm-streak">🔥 ${streak}-day streak — keep it up!</div>

      <!-- Recommended -->
      ${recHTML}

      <!-- Actions -->
      <div class="pgm-actions">
        ${nextBtn}
        <button class="pgm-btn pgm-btn-outline btn-ripple" onclick="replayGame()">🔄 Replay</button>
        <a class="pgm-btn pgm-btn-ghost btn-ripple" href="index.html" onclick="closePostGameModal()">🏠 Home</a>
      </div>

      <!-- Auto-suggest countdown -->
      ${nextGame ? `<div class="pgm-auto-label" id="pgm-auto">Next game in <strong id="pgm-countdown">5</strong>s…</div>` : ''}

    </div>
  `;

  document.body.appendChild(modal);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add('pgm-visible');
      document.getElementById('pgm-card')?.classList.add('pgm-card-in');
    });
  });

  // Auto-suggest countdown to next game
  if (nextGame) {
    let secs = 5;
    const cd = document.getElementById('pgm-countdown');
    const iv = setInterval(() => {
      secs--;
      if (cd) cd.textContent = secs;
      if (secs <= 0) {
        clearInterval(iv);
        window.location.href = `game.html?id=${nextGame.slug}`;
      }
    }, 1000);
    // Store interval so close can cancel it
    modal._autoNav = iv;
  }

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) closePostGameModal();
  });
}

/* ── Close modal ── */
function closePostGameModal() {
  const overlay = document.getElementById('pgm-overlay');
  if (!overlay) return;
  if (overlay._autoNav) clearInterval(overlay._autoNav);
  overlay.classList.remove('pgm-visible');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

/* ── Replay current game ── */
function replayGame() {
  closePostGameModal();
  const iframe = document.getElementById('game-iframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 100);
  }
}

/* ── Helper: trigger from game page ── */
function onGameComplete(overrideXP) {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id') || params.get('slug');
  if (typeof getGameById === 'undefined' || !id) return;
  const game = getGameById(id);
  if (!game) return;
  showPostGameModal({ ...game, xpEarned: overrideXP ?? 25 });
}

window.showPostGameModal  = showPostGameModal;
window.closePostGameModal = closePostGameModal;
window.replayGame         = replayGame;
window.onGameComplete     = onGameComplete;

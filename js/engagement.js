/* ═══════════════════════════════════════════════════
   ZENMAGMA — engagement.js
   Complete gamification & retention engine
   Pure vanilla JS · No libraries · localStorage-backed
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   DATA STRUCTURE
   localStorage key: zm_user
   {
     totalXP      : number,
     level        : number,
     streak       : number,
     lastPlayDate : "Mon Jan 01 2024",  // Date.toDateString()
     lastRewardDay: number,             // day-of-year when reward last claimed
     recentGames  : ["slug1", ...],     // up to 10
     badges       : ["🥉 Newcomer", ...]
   }
───────────────────────────────────────────────────*/
const Engagement = (() => {

  const KEY = 'zm_user';
  const MAX_RECENT = 10;

  /* ── LEVELS ── every 100 XP per level, scales slightly */
  const XP_PER_LEVEL = 100;

  /* ── BADGE THRESHOLDS ── */
  const BADGES = [
    { min: 0,    icon: '🥉', label: 'Newcomer'       },
    { min: 100,  icon: '🥈', label: 'Explorer'       },
    { min: 300,  icon: '🥇', label: 'Gamer'          },
    { min: 600,  icon: '💎', label: 'Pro Gamer'      },
    { min: 1000, icon: '👑', label: 'Legend'         },
    { min: 2000, icon: '🌋', label: 'ZenMagma Master'},
  ];

  /* ── DAILY STREAK REWARDS ── cumulative day index */
  const STREAK_REWARDS = [20, 30, 50, 70, 100, 150, 200];

  /* ── FAKE LEADERBOARD SEEDS ── */
  const FAKE_LEADERS = [
    { name: 'PixelKing',   xp: 4280 },
    { name: 'NeonRacer',   xp: 3750 },
    { name: 'BlazeMaster', xp: 3100 },
    { name: 'StarDrift',   xp: 2620 },
    { name: 'VoidSlayer',  xp: 1980 },
  ];

  /* ── STORAGE HELPERS ── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const d = raw ? JSON.parse(raw) : {};
      return {
        totalXP      : d.totalXP       ?? 0,
        level        : d.level         ?? 1,
        streak       : d.streak        ?? 0,
        lastPlayDate : d.lastPlayDate  ?? '',
        lastRewardDay: d.lastRewardDay ?? -1,
        recentGames  : d.recentGames   ?? [],
        badges       : d.badges        ?? [],
      };
    } catch { return { totalXP:0, level:1, streak:0, lastPlayDate:'', lastRewardDay:-1, recentGames:[], badges:[] }; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  /* ── XP ── */
  function getXP() { return load().totalXP; }

  function addXP(amount) {
    const data = load();
    const prevBadge = getBadge(data.totalXP).label;

    data.totalXP += amount;
    data.level    = getLevel(data.totalXP);

    // Badge unlock?
    const newBadge = getBadge(data.totalXP);
    const unlocked = newBadge.label !== prevBadge;
    if (unlocked && !data.badges.includes(newBadge.label)) {
      data.badges.push(newBadge.label);
    }

    save(data);
    _renderXPBar(data);

    return { data, unlocked: unlocked ? newBadge : null };
  }

  /* ── LEVEL ── */
  function getLevel(xp) {
    return Math.floor((xp ?? getXP()) / XP_PER_LEVEL) + 1;
  }

  function getXPPercent(xp) {
    return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  }

  function getXPToNextLevel(xp) {
    return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
  }

  /* ── BADGE ── */
  function getBadge(xp) {
    let badge = BADGES[0];
    for (const b of BADGES) {
      if (xp >= b.min) badge = b;
    }
    return badge;
  }

  /* ── STREAK ── */
  function getStreak() { return load().streak; }

  function updateStreak() {
    const data = load();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastPlayDate === today) {
      // Already played today — no change
    } else if (data.lastPlayDate === yesterday) {
      data.streak += 1;
    } else {
      data.streak = 1; // Reset
    }

    data.lastPlayDate = today;
    save(data);
    return data.streak;
  }

  /* ── DAILY REWARD ── */
  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function canClaimDailyReward() {
    const data = load();
    return data.lastRewardDay !== getDayOfYear();
  }

  function claimDailyReward() {
    if (!canClaimDailyReward()) return null;

    const data = load();
    const streak = updateStreak(); // Refresh streak first
    const reloaded = load();      // Get updated data

    const dayIndex = Math.min(reloaded.streak - 1, STREAK_REWARDS.length - 1);
    const xpReward = STREAK_REWARDS[Math.max(0, dayIndex)];

    reloaded.lastRewardDay = getDayOfYear();
    save(reloaded);

    const result = addXP(xpReward);

    return {
      xp: xpReward,
      streak: reloaded.streak,
      badge: result.unlocked,
    };
  }

  /* ── LEADERBOARD ── */
  function getLeaderboard(userXP) {
    const xp = userXP ?? getXP();
    const userEntry = { name: 'You', xp, isUser: true };

    const combined = [...FAKE_LEADERS, userEntry]
      .sort((a, b) => b.xp - a.xp)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return combined;
  }

  /* ── RECENT GAMES ── */
  function addRecentGame(slug) {
    const data = load();
    data.recentGames = [slug, ...data.recentGames.filter(s => s !== slug)].slice(0, MAX_RECENT);
    save(data);
  }

  function getRecentGames() {
    return load().recentGames;
  }

  /* ── NEXT GAME SUGGESTION ── */
  function getNextGame(currentSlug, category) {
    // Requires GAMES global from games-data.js
    if (typeof GAMES === 'undefined') return null;

    const recent = getRecentGames();
    const pool = GAMES.filter(g =>
      g.slug !== currentSlug &&
      !recent.slice(0, 3).includes(g.slug) // avoid last 3 played
    );

    // Prefer same category
    const samecat = pool.filter(g => g.category === category);
    const candidates = samecat.length >= 2 ? samecat : pool;

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * Math.min(candidates.length, 6))];
  }

  /* ── DOM RENDER: XP BAR ── */
  function _renderXPBar(data) {
    const d = data || load();
    const pct = getXPPercent(d.totalXP);
    const toLvl = getXPToNextLevel(d.totalXP);
    const badge = getBadge(d.totalXP);

    // Gamification bar elements (index.html)
    const fill = document.getElementById('gam-xp-fill') || document.querySelector('.gam-xp-fill');
    if (fill) fill.style.width = pct + '%';

    const pts = document.getElementById('gam-pts');
    if (pts) pts.textContent = d.totalXP.toLocaleString() + ' XP';

    const lvl = document.getElementById('gam-level');
    if (lvl) lvl.textContent = 'Level ' + d.level;

    const bdg = document.getElementById('gam-badge');
    if (bdg) bdg.textContent = badge.icon + ' ' + badge.label;

    const str = document.getElementById('gam-streak');
    if (str) str.textContent = '🔥 ' + d.streak + ' day streak';

    // Header mini-indicators
    const hdrXP = document.getElementById('header-xp');
    if (hdrXP) hdrXP.textContent = '⚡ ' + d.totalXP + ' XP';

    const hdrStr = document.getElementById('header-streak');
    if (hdrStr) hdrStr.textContent = '🔥 ' + d.streak;

    // XP progress label
    const prog = document.getElementById('xp-to-level');
    if (prog) prog.textContent = toLvl + ' XP to Level ' + (d.level + 1);

    // game.html XP mini-bar
    const gpFill = document.getElementById('gp-xp-fill');
    if (gpFill) gpFill.style.width = pct + '%';
    const gpLabel = document.getElementById('gp-xp-label');
    if (gpLabel) gpLabel.textContent = `⚡ ${d.totalXP} XP · Lvl ${d.level}`;
  }

  /* ── PUBLIC INIT ── */
  function init() {
    _renderXPBar();

    // Render daily reward button state
    const btn = document.getElementById('claim-reward-btn');
    if (btn) {
      if (canClaimDailyReward()) {
        btn.disabled = false;
        btn.textContent = '🎁 Claim Daily Reward';
      } else {
        btn.disabled = true;
        btn.textContent = '✅ Reward Claimed';
      }
    }
  }

  /* ── PUBLIC API ── */
  return {
    init,
    addXP,
    getXP,
    getLevel,
    getXPPercent,
    getXPToNextLevel,
    getBadge,
    getStreak,
    updateStreak,
    canClaimDailyReward,
    claimDailyReward,
    getLeaderboard,
    addRecentGame,
    getRecentGames,
    getNextGame,
    renderXPBar: _renderXPBar,
  };

})();

/* ── Make globally accessible ── */
window.Engagement = Engagement;
window.addXP          = (n) => Engagement.addXP(n);
window.getXP          = ()  => Engagement.getXP();
window.getLevel       = ()  => Engagement.getLevel();
window.getStreak      = ()  => Engagement.getStreak();
window.updateStreak   = ()  => Engagement.updateStreak();
window.claimDailyReward = () => Engagement.claimDailyReward();

/* ── Auto-init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => Engagement.init());

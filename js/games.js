/* ═══════════════════════════════════════════════════
   ZENMAGMA — games.js
   Real GameDistribution game embeds
   Source: gamedistribution.com
   Each game is embedded via official GD iframe URL.
   Thumbnails served from GD image CDN.
═══════════════════════════════════════════════════ */

/* GD referrer param required by GameDistribution SDK */
const GD_HOST    = 'https://html5.gamedistribution.com/';
const GD_IMG     = 'https://img.gamedistribution.com/';
const GD_REF     = '?gd_sdk_referrer_url=' + encodeURIComponent('https://zenmagma.com/');

function gdSrc(id)   { return GD_HOST + id + '/' + GD_REF; }
function gdThumb(id) { return GD_IMG  + id + '/images/icon-300x300.png'; }

/* ─────────────────────────────────────────────────
   GD GAMES CATALOG
   15 games · 5 categories · real embed IDs
───────────────────────────────────────────────────*/
const GD_GAMES = [

  /* ══ PUZZLE (5 games) ══════════════════════════ */
  {
    id: 'gd-bubble-shooter-hd',
    slug: 'gd-bubble-shooter-hd',
    title: 'Bubble Shooter HD',
    category: 'puzzle',
    tags: ['puzzle', 'bubbles', 'classic', 'match'],
    featured: true, trending: true, isNew: false,
    plays: 1240000, rating: 4.8, likes: 62000,
    src:   gdSrc('79a7db22af5f420eb9d56e28fffca87b'),
    thumb: gdThumb('79a7db22af5f420eb9d56e28fffca87b'),
    emoji: '🫧', color: '#0ea5e9',
    desc: 'Aim and shoot colored bubbles to match 3 or more! The ultimate classic puzzle game with HD graphics and hundreds of levels.',
    controls: 'Mouse to aim · Click to shoot',
    isExternal: true, gdId: '79a7db22af5f420eb9d56e28fffca87b',
  },
  {
    id: 'gd-bubble-shooter-extreme',
    slug: 'gd-bubble-shooter-extreme',
    title: 'Bubble Shooter Extreme',
    category: 'puzzle',
    tags: ['puzzle', 'bubbles', 'action', 'extreme'],
    featured: false, trending: true, isNew: false,
    plays: 580000, rating: 4.6, likes: 28400,
    src:   gdSrc('c3f0f0c6731a4d908d978fb7906a0b17'),
    thumb: gdThumb('c3f0f0c6731a4d908d978fb7906a0b17'),
    emoji: '💥', color: '#7c3aed',
    desc: 'Extreme bubble shooting with power-ups, bombs and booster combos. Can you beat all the challenging levels?',
    controls: 'Mouse to aim · Click to shoot · Collect power-ups',
    isExternal: true, gdId: 'c3f0f0c6731a4d908d978fb7906a0b17',
  },
  {
    id: 'gd-arkadium-bubble-shooter',
    slug: 'gd-arkadium-bubble-shooter',
    title: 'Arkadium Bubble Shooter',
    category: 'puzzle',
    tags: ['puzzle', 'bubbles', 'classic', 'arkadium'],
    featured: false, trending: false, isNew: false,
    plays: 920000, rating: 4.7, likes: 47000,
    src:   gdSrc('282e9611e25a46a9a491a63bc1da3ea7'),
    thumb: gdThumb('282e9611e25a46a9a491a63bc1da3ea7'),
    emoji: '🎯', color: '#ec4899',
    desc: 'The original Arkadium bubble shooter! Pop your way through hundreds of addictive levels in this timeless classic.',
    controls: 'Mouse to aim and shoot bubbles',
    isExternal: true, gdId: '282e9611e25a46a9a491a63bc1da3ea7',
  },
  {
    id: 'gd-amazing-sudoku',
    slug: 'gd-amazing-sudoku',
    title: 'Amazing Sudoku',
    category: 'puzzle',
    tags: ['puzzle', 'sudoku', 'numbers', 'brain'],
    featured: false, trending: false, isNew: false,
    plays: 430000, rating: 4.5, likes: 21000,
    src:   gdSrc('213a46b8918246c89547cb1e6e633378'),
    thumb: gdThumb('213a46b8918246c89547cb1e6e633378'),
    emoji: '🔢', color: '#8b5cf6',
    desc: 'The ultimate Sudoku challenge! Fill 9×9 grids so every row, column, and box contains digits 1–9. Multiple difficulty levels.',
    controls: 'Click a cell, then click a number to place it',
    isExternal: true, gdId: '213a46b8918246c89547cb1e6e633378',
  },
  {
    id: 'gd-arkadium-mahjong',
    slug: 'gd-arkadium-mahjong',
    title: 'Arkadium Mahjong',
    category: 'puzzle',
    tags: ['puzzle', 'mahjong', 'classic', 'match'],
    featured: false, trending: true, isNew: false,
    plays: 760000, rating: 4.6, likes: 38000,
    src:   gdSrc('aef0fd368bca407a9a9dd97fc0fc411e'),
    thumb: gdThumb('aef0fd368bca407a9a9dd97fc0fc411e'),
    emoji: '🀄', color: '#dc2626',
    desc: 'Classic Mahjong Solitaire! Match and remove pairs of identical tiles. A timeless strategy puzzle from Arkadium.',
    controls: 'Click matching unblocked tile pairs to remove them',
    isExternal: true, gdId: 'aef0fd368bca407a9a9dd97fc0fc411e',
  },

  /* ══ ARCADE (3 games) ══════════════════════════ */
  {
    id: 'gd-atari-breakout',
    slug: 'gd-atari-breakout',
    title: 'Atari Breakout',
    category: 'arcade',
    tags: ['arcade', 'classic', 'breakout', 'atari'],
    featured: true, trending: true, isNew: false,
    plays: 2100000, rating: 4.8, likes: 105000,
    src:   gdSrc('8f006852782547a7b8dbf392f7883e9e'),
    thumb: gdThumb('8f006852782547a7b8dbf392f7883e9e'),
    emoji: '🧱', color: '#f97316',
    desc: 'The legendary Atari Breakout! Bounce the ball to destroy all bricks. One of the most iconic arcade games ever made.',
    controls: '← → Arrow keys or Mouse to move paddle',
    isExternal: true, gdId: '8f006852782547a7b8dbf392f7883e9e',
  },
  {
    id: 'gd-bubble-game-3',
    slug: 'gd-bubble-game-3',
    title: 'Bubble Game 3',
    category: 'arcade',
    tags: ['arcade', 'bubbles', 'shoot', 'pop'],
    featured: false, trending: false, isNew: false,
    plays: 490000, rating: 4.4, likes: 24000,
    src:   gdSrc('27673bc45d2e4b27b7cd24e422f7c257'),
    thumb: gdThumb('27673bc45d2e4b27b7cd24e422f7c257'),
    emoji: '🔵', color: '#3b82f6',
    desc: 'Fast-paced bubble shooting arcade action! Shoot and pop as many bubbles as you can before time runs out.',
    controls: 'Mouse / Touch to aim and shoot',
    isExternal: true, gdId: '27673bc45d2e4b27b7cd24e422f7c257',
  },
  {
    id: 'gd-breakout-pixel',
    slug: 'gd-breakout-pixel',
    title: 'Breakout Pixel',
    category: 'arcade',
    tags: ['arcade', 'breakout', 'pixel', 'retro'],
    featured: false, trending: false, isNew: false,
    plays: 220000, rating: 4.3, likes: 11000,
    src:   gdSrc('2e036249566f48c19b2ab3582e860893'),
    thumb: gdThumb('2e036249566f48c19b2ab3582e860893'),
    emoji: '👾', color: '#6366f1',
    desc: 'Retro pixel-style Breakout! Smash bricks with your bouncing ball across multiple challenging levels.',
    controls: '← → Arrow keys or Mouse to control the paddle',
    isExternal: true, gdId: '2e036249566f48c19b2ab3582e860893',
  },

  /* ══ KIDS (3 games) ═══════════════════════════ */
  {
    id: 'gd-pixel-adventure',
    slug: 'gd-pixel-adventure',
    title: 'Pixel Adventure',
    category: 'kids',
    tags: ['kids', 'platformer', 'pixel', 'adventure'],
    featured: true, trending: true, isNew: false,
    plays: 680000, rating: 4.7, likes: 34000,
    src:   gdSrc('d3b0d9618636429c84b5ac36b8eb0595'),
    thumb: gdThumb('d3b0d9618636429c84b5ac36b8eb0595'),
    emoji: '🕹️', color: '#10b981',
    desc: 'A charming pixel platformer with 40+ unique dungeons to explore! Collect stars, defeat enemies and find secret areas.',
    controls: 'Arrow keys to move · Space / Up to jump',
    isExternal: true, gdId: 'd3b0d9618636429c84b5ac36b8eb0595',
  },
  {
    id: 'gd-dan-the-man',
    slug: 'gd-dan-the-man',
    title: 'Dan the Man',
    category: 'kids',
    tags: ['kids', 'action', 'platformer', 'fight'],
    featured: false, trending: true, isNew: false,
    plays: 1500000, rating: 4.8, likes: 75000,
    src:   gdSrc('3d11dfed72a04e00ae9a43ab3fd49bd6'),
    thumb: gdThumb('3d11dfed72a04e00ae9a43ab3fd49bd6'),
    emoji: '🥊', color: '#f59e0b',
    desc: 'Crazy action platformer! Play as Dan in this epic arcade fight fest with upgradeable weapons, skills and boss battles.',
    controls: 'Arrow keys to move · A to punch · S to kick · Up to jump',
    isExternal: true, gdId: '3d11dfed72a04e00ae9a43ab3fd49bd6',
  },
  {
    id: 'gd-white-room',
    slug: 'gd-white-room',
    title: 'The White Room',
    category: 'kids',
    tags: ['kids', 'adventure', 'puzzle', 'escape'],
    featured: false, trending: false, isNew: false,
    plays: 310000, rating: 4.4, likes: 15500,
    src:   gdSrc('d713a7349b1e462a8cd342ec8ce6f4e9'),
    thumb: gdThumb('d713a7349b1e462a8cd342ec8ce6f4e9'),
    emoji: '🚪', color: '#7dd3fc',
    desc: 'Solve puzzles and escape the mysterious white room! A charming point-and-click adventure with cartoon art.',
    controls: 'Click objects to interact and solve puzzles',
    isExternal: true, gdId: 'd713a7349b1e462a8cd342ec8ce6f4e9',
  },

  /* ══ ACTION (3 games) ══════════════════════════ */
  {
    id: 'gd-time-shooter',
    slug: 'gd-time-shooter',
    title: 'Time Shooter',
    category: 'action',
    tags: ['action', 'shooter', '3d', 'fps', 'slow-mo'],
    featured: true, trending: true, isNew: false,
    plays: 3200000, rating: 4.9, likes: 160000,
    src:   gdSrc('1092591e1589474cbb6c42cd388440c6'),
    thumb: gdThumb('1092591e1589474cbb6c42cd388440c6'),
    emoji: '⏱️', color: '#ef4444',
    desc: 'Time moves only when YOU move! This mind-bending slow-motion shooter lets you dodge bullets and take down enemies at your own pace.',
    controls: 'WASD to move · Mouse to aim · Click to shoot',
    isExternal: true, gdId: '1092591e1589474cbb6c42cd388440c6',
  },
  {
    id: 'gd-traffic-tour',
    slug: 'gd-traffic-tour',
    title: 'Traffic Tour',
    category: 'action',
    tags: ['action', 'racing', 'cars', 'traffic'],
    featured: false, trending: true, isNew: false,
    plays: 870000, rating: 4.6, likes: 43500,
    src:   gdSrc('ce3d2279ff684021a68b534e397f1122'),
    thumb: gdThumb('ce3d2279ff684021a68b534e397f1122'),
    emoji: '🚗', color: '#f97316',
    desc: 'Weave through endless highway traffic at breakneck speed! Collect coins, unlock cars and survive as long as possible.',
    controls: 'Arrow keys or A/D to steer',
    isExternal: true, gdId: 'ce3d2279ff684021a68b534e397f1122',
  },
  {
    id: 'gd-chain-car-stunt',
    slug: 'gd-chain-car-stunt',
    title: 'Chain Car Stunt',
    category: 'action',
    tags: ['action', 'stunt', 'cars', 'racing'],
    featured: false, trending: false, isNew: true,
    plays: 410000, rating: 4.5, likes: 20500,
    src:   gdSrc('4c25c2a86a944594af39e7329bd09ded'),
    thumb: gdThumb('4c25c2a86a944594af39e7329bd09ded'),
    emoji: '🔗', color: '#dc2626',
    desc: 'Insane chain car stunts! Drive linked cars over ramps, loops and obstacles in this wild physics stunt game.',
    controls: 'Arrow keys or WASD to accelerate and steer',
    isExternal: true, gdId: '4c25c2a86a944594af39e7329bd09ded',
  },

  /* ══ RUNNER (2 games) ══════════════════════════ */
  {
    id: 'gd-eg-bus-subway',
    slug: 'gd-eg-bus-subway',
    title: 'Bus Subway Runner',
    category: 'runner',
    tags: ['runner', 'endless', 'subway', 'dodge'],
    featured: false, trending: true, isNew: false,
    plays: 740000, rating: 4.6, likes: 37000,
    src:   gdSrc('8baa45aabd504c1ab7a6c4ee9b1a336f'),
    thumb: gdThumb('8baa45aabd504c1ab7a6c4ee9b1a336f'),
    emoji: '🚌', color: '#a855f7',
    desc: 'Sprint through busy subway tunnels and dodge oncoming buses! Collect coins, boost power-ups and run as far as you can.',
    controls: 'Arrow keys to dodge · Swipe on mobile',
    isExternal: true, gdId: '8baa45aabd504c1ab7a6c4ee9b1a336f',
  },
  {
    id: 'gd-bird-quest',
    slug: 'gd-bird-quest',
    title: 'Bird Quest',
    category: 'runner',
    tags: ['runner', 'flappy', 'birds', 'collect'],
    featured: false, trending: false, isNew: false,
    plays: 520000, rating: 4.4, likes: 26000,
    src:   gdSrc('08163ea04d194377b4f7aa044145b5c5'),
    thumb: gdThumb('08163ea04d194377b4f7aa044145b5c5'),
    emoji: '🐦', color: '#10b981',
    desc: 'Flap your way through obstacles while collecting coins, stars and diamonds! How far can your bird fly?',
    controls: 'Click / Tap / Space to flap',
    isExternal: true, gdId: '08163ea04d194377b4f7aa044145b5c5',
  },

];

/* ─────────────────────────────────────────────────
   MERGE into the global GAMES array from games-data.js
   (games-data.js must be loaded first)
───────────────────────────────────────────────────*/
if (typeof GAMES !== 'undefined') {
  GAMES.unshift(...GD_GAMES); // GD games appear first (higher play counts)
}

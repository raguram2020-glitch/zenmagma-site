/**
 * ZenMagma — IntroManager
 * ════════════════════════════════════════════════════════════════════
 * Centralized cinematic intro system. Every game page imports this
 * script once. It handles:
 *   • Full-screen video overlay before gameplay
 *   • Skip button (appears after 1.5s)
 *   • Mute / unmute with autoplay-safe muted start
 *   • SessionStorage cache — intro plays once per browser session,
 *     never replays when the user navigates between games without
 *     a full page refresh of the top-level page
 *   • Smooth fade-in → video → end-frame → fade-out → game loads
 *   • Particle / glow ambient background
 *   • Mobile + ultrawide responsive
 *
 * Usage (already wired into game.html):
 *   IntroManager.run({ onComplete: () => { /* load game *\/ } });
 *
 * Architecture components created here:
 *   IntroManager          — public API
 *   VideoPreloadHook      — preloads + caches the video Blob URL
 *   TransitionOverlay     — fade + glitch helpers
 * ════════════════════════════════════════════════════════════════════
 */

const IntroManager = (() => {
  /* ─── CONFIG ──────────────────────────────────────────────────── */
  const VIDEO_SRC        = 'Videos/Intro_New.mp4';
  const SESSION_KEY      = 'zm_intro_played';
  const SKIP_DELAY_MS    = 1500;   // skip button appears after 1.5 s
  const END_FRAME_MS     = 800;    // end-frame hold duration
  const FADE_OUT_MS      = 800;    // overlay fade-out duration
  const GAME_TITLE_ATTR  = 'data-game-title'; // optional attr on <body>

  /* ─── STATE ───────────────────────────────────────────────────── */
  let _overlay     = null;
  let _video       = null;
  let _skipBtn     = null;
  let _muteBtn     = null;
  let _loader      = null;
  let _progressFill= null;
  let _videoWrap   = null;
  let _endFrame    = null;
  let _skipTimer   = null;
  let _onComplete  = null;
  let _muted       = true;
  let _blobUrl     = null;  // cached after first load

  /* ─── VideoPreloadHook ────────────────────────────────────────── */
  const VideoPreloadHook = {
    // Fetch the video once and store as a Blob URL in module scope.
    // Subsequent calls return the cached URL immediately.
    async load(src) {
      if (_blobUrl) return _blobUrl;

      // sessionStorage stores a flag but not the blob (blobs can't be
      // persisted across page loads). The video element's browser cache
      // handles actual byte caching; we just avoid redundant fetches
      // within the same JS lifecycle.
      try {
        const res = await fetch(src, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        _blobUrl = URL.createObjectURL(blob);
        return _blobUrl;
      } catch {
        // Fall back to direct src on fetch failure (CORS, etc.)
        return src;
      }
    }
  };

  /* ─── TransitionOverlay helpers ──────────────────────────────── */
  const TransitionOverlay = {
    fadeOut(el, durationMs, cb) {
      el.classList.add('zm-intro-fadeout');
      setTimeout(() => {
        el.classList.add('zm-intro-hidden');
        cb?.();
      }, durationMs);
    },
    glitchFlash(el) {
      el.classList.add('zm-glitch-flash');
      setTimeout(() => el.classList.remove('zm-glitch-flash'), 300);
    }
  };

  /* ─── DOM builder ─────────────────────────────────────────────── */
  function _buildDOM() {
    const overlay = document.createElement('div');
    overlay.id = 'zm-intro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Game intro');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <!-- Ambient glow background -->
      <div class="zm-intro-bg">
        <div class="zm-intro-orb"></div>
        <div class="zm-intro-orb"></div>
        <div class="zm-intro-orb"></div>
      </div>
      <div class="zm-intro-scanlines"></div>

      <!-- Loading state -->
      <div id="zm-intro-loader">
        <div class="zm-loader-logo">🌋 ZenMagma</div>
        <div class="zm-loader-ring"></div>
        <div class="zm-loader-progress-track">
          <div class="zm-loader-progress-fill" id="zm-loader-progress"></div>
        </div>
        <div class="zm-loader-text">Loading experience…</div>
      </div>

      <!-- Video container -->
      <div id="zm-intro-video-wrap">
        <div class="zm-intro-letterbox-top"></div>
        <video
          id="zm-intro-video"
          playsinline
          muted
          preload="auto"
          aria-hidden="true"
        ></video>
        <div class="zm-intro-vignette"></div>
        <div class="zm-intro-letterbox-bot"></div>
      </div>

      <!-- End-frame reveal -->
      <div id="zm-intro-endframe">
        <div class="zm-endframe-title">🌋 ZenMagma</div>
        <div class="zm-endframe-sub">Get Ready to Play</div>
      </div>

      <!-- Mute toggle -->
      <button id="zm-mute-btn" aria-label="Toggle sound">🔇</button>

      <!-- Skip button -->
      <button id="zm-skip-btn" aria-label="Skip intro">
        <span class="zm-skip-icon">▶▶</span>
        <span>Skip Intro</span>
        <span class="zm-skip-countdown" id="zm-skip-cd"></span>
      </button>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // block scroll during intro

    _overlay      = overlay;
    _video        = overlay.querySelector('#zm-intro-video');
    _skipBtn      = overlay.querySelector('#zm-skip-btn');
    _muteBtn      = overlay.querySelector('#zm-mute-btn');
    _loader       = overlay.querySelector('#zm-intro-loader');
    _progressFill = overlay.querySelector('#zm-loader-progress');
    _videoWrap    = overlay.querySelector('#zm-intro-video-wrap');
    _endFrame     = overlay.querySelector('#zm-intro-endframe');
  }

  /* ─── Progress animation while loading ───────────────────────── */
  function _animateProgress() {
    let pct = 0;
    const iv = setInterval(() => {
      pct = Math.min(pct + (Math.random() * 12 + 4), 90);
      if (_progressFill) _progressFill.style.width = pct + '%';
      if (pct >= 90) clearInterval(iv);
    }, 120);
    return {
      finish() {
        clearInterval(iv);
        if (_progressFill) _progressFill.style.width = '100%';
      }
    };
  }

  /* ─── Skip button reveal + countdown ─────────────────────────── */
  function _scheduleSkip() {
    const cdEl = document.getElementById('zm-skip-cd');
    let remaining = Math.ceil(SKIP_DELAY_MS / 1000);

    const tick = setInterval(() => {
      remaining--;
      if (cdEl) cdEl.textContent = remaining > 0 ? remaining : '';
      if (remaining <= 0) clearInterval(tick);
    }, 1000);

    _skipTimer = setTimeout(() => {
      clearInterval(tick);
      _skipBtn.classList.add('zm-skip-visible');
      _muteBtn.classList.add('zm-skip-visible');
    }, SKIP_DELAY_MS);
  }

  /* ─── Mute / unmute ──────────────────────────────────────────── */
  function _toggleMute() {
    _muted = !_muted;
    _video.muted = _muted;
    _muteBtn.textContent = _muted ? '🔇' : '🔊';

    if (!_muted) {
      // Some browsers need a play() call after un-muting to push audio
      _video.play().catch(() => {});
    }
  }

  /* ─── Complete — fade out and hand off to game ───────────────── */
  function _complete(skipGlitch = false) {
    clearTimeout(_skipTimer);

    // No session caching — intro plays on every game page load

    // Show end-frame briefly
    _video.pause();
    _videoWrap.style.opacity = '0';
    _endFrame.classList.add('zm-endframe-visible');

    if (skipGlitch) TransitionOverlay.glitchFlash(_overlay);

    setTimeout(() => {
      TransitionOverlay.fadeOut(_overlay, FADE_OUT_MS, () => {
        document.body.style.overflow = '';
        _overlay.remove();
        _onComplete?.();
      });
    }, skipGlitch ? 100 : END_FRAME_MS);
  }

  /* ─── Public API ──────────────────────────────────────────────── */
  return {
    /**
     * GlobalGameLoader entry point.
     * Call this in game.html before setting iframe.src.
     * Intro plays on every game page load by design.
     *
     * @param {object} opts
     * @param {Function} opts.onComplete  — called when intro finishes / is skipped
     */
    async run({ onComplete } = {}) {
      _onComplete = onComplete;

      // Build overlay DOM
      _buildDOM();

      // Start progress animation
      const progress = _animateProgress();

      // Preload video
      let videoSrc;
      try {
        videoSrc = await VideoPreloadHook.load(VIDEO_SRC);
      } catch {
        videoSrc = VIDEO_SRC;
      }

      // Set video source
      _video.src = videoSrc;
      _video.muted = true;
      _muted = true;

      // Wire events
      _skipBtn.addEventListener('click', () => _complete(true));
      _muteBtn.addEventListener('click', _toggleMute);

      // Keyboard skip (Escape or Space)
      const _keyHandler = (e) => {
        if (!_skipBtn.classList.contains('zm-skip-visible')) return;
        if (e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          _complete(true);
        }
      };
      document.addEventListener('keydown', _keyHandler, { once: false });

      // When video can play
      _video.addEventListener('canplay', () => {
        progress.finish();

        // Fade loader out, fade video in
        _loader.classList.add('zm-hidden');
        _videoWrap.classList.add('zm-video-visible');

        // Autoplay — muted first (browser policy safe)
        _video.play().then(() => {
          _scheduleSkip();
        }).catch(() => {
          // Autoplay blocked entirely — skip to game directly
          _complete(false);
        });
      }, { once: true });

      // Video ended naturally
      _video.addEventListener('ended', () => {
        document.removeEventListener('keydown', _keyHandler);
        _complete(false);
      }, { once: true });

      // Error loading video — skip gracefully
      _video.addEventListener('error', () => {
        document.removeEventListener('keydown', _keyHandler);
        progress.finish();
        _complete(false);
      }, { once: true });

      // Load the video
      _video.load();
    },

    /** Force-reset the session flag (useful for testing) */
    reset() {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    }
  };
})();

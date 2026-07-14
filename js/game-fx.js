/* ═══════════════════════════════════════════════════
   ZENMAGMA — game-fx.js
   Shared juice/FX toolkit + win-lose overlay auto-fix,
   included by every game in games/*.html
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── OVERLAY AUTO-INJECTION ──────────────────────────
     Most games call showGameOver()/showWin() which look
     for #goov/#winov + #gomsg/#winmsg. In ~82 games that
     markup was never added to the HTML, so those calls
     silently no-op. We inject whichever is missing,
     independently, reusing the game's own .btn class so
     the buttons inherit that game's color theme.       */
  function injectOverlay(id, msgId, heading, accent) {
    if (document.getElementById(id)) return;
    const wrap = document.createElement('div');
    wrap.id = id;
    wrap.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;' +
      'align-items:center;justify-content:center;background:rgba(0,0,0,.85);';
    wrap.innerHTML =
      '<div style="background:#16213e;border-radius:20px;padding:36px;text-align:center;' +
      'max-width:380px;width:90%;border:2px solid ' + accent + ';">' +
      '<h2 style="font-size:1.9em;margin-bottom:8px;color:#fff;">' + heading + '</h2>' +
      '<p id="' + msgId + '" style="color:#aaa;margin-bottom:20px;line-height:1.5;"></p>' +
      '<button class="btn" onclick="GameFX.restart()">Try Again</button> ' +
      '<button class="btn" onclick="location.href=(window.ZM_BASE!==undefined?window.ZM_BASE:\'../\')+\'index.html\'" ' +
      'style="background:linear-gradient(135deg,#555,#333)">Home</button>' +
      '</div>';
    document.body.appendChild(wrap);
  }

  function initOverlays() {
    injectOverlay('goov', 'gomsg', 'Game Over', '#e74c3c');
    injectOverlay('winov', 'winmsg', 'You Win! 🎉', '#2ecc71');
  }

  /* Smart restart dispatcher for the injected buttons —
     games use different function names for "play again". */
  function restart() {
    ['goov', 'winov'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (typeof window.doRestart === 'function') return window.doRestart();
    if (typeof window.newGame === 'function') return window.newGame();
    if (typeof window.go === 'function') return window.go();
    location.reload();
  }

  /* ── fxImage — graceful image/flat-shape fallback ────
     Every art-integration step uses this instead of a
     bespoke try/catch per game: draws the image if it's
     loaded, otherwise calls the game's existing flat-
     shape draw function so a broken/slow asset never
     leaves the game visually broken.                   */
  function fxImage(ctx, img, fallbackDrawFn, x, y, w, h) {
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, w, h);
    } else if (typeof fallbackDrawFn === 'function') {
      fallbackDrawFn();
    }
  }

  /* ── Overlay FX canvas (particles / screen shake) ────
     One transparent, pointer-events:none canvas is
     created per game-canvas the first time it's used,
     positioned to exactly cover that canvas and kept in
     sync on resize/scroll. Games never touch this canvas
     directly — only via GameFX.burst()/shake()/popup().  */
  const fxCanvases = new WeakMap();
  const particles = [];
  let rafRunning = false;

  function getFxCanvas(targetEl) {
    let fx = fxCanvases.get(targetEl);
    if (fx) return fx;
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;pointer-events:none;z-index:60;';
    document.body.appendChild(cv);
    fx = { cv, ctx: cv.getContext('2d'), target: targetEl };
    fxCanvases.set(targetEl, fx);
    syncFxCanvas(fx);
    window.addEventListener('resize', () => syncFxCanvas(fx));
    return fx;
  }

  function syncFxCanvas(fx) {
    const r = fx.target.getBoundingClientRect();
    fx.cv.style.left = r.left + 'px';
    fx.cv.style.top = r.top + 'px';
    fx.cv.style.width = r.width + 'px';
    fx.cv.style.height = r.height + 'px';
    fx.cv.width = Math.max(1, Math.round(r.width * (window.devicePixelRatio || 1)));
    fx.cv.height = Math.max(1, Math.round(r.height * (window.devicePixelRatio || 1)));
    fx.rect = r;
  }

  function ensureLoop() {
    if (rafRunning) return;
    rafRunning = true;
    (function loop() {
      let anyAlive = false;
      fxCanvases && fxAll().forEach(fx => {
        syncFxCanvas(fx);
        fx.ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        fx.ctx.clearRect(0, 0, fx.rect.width, fx.rect.height);
      });
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 1 / 60;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        anyAlive = true;
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity || 0.15;
        const fx = fxCanvases.get(p.target);
        if (!fx) continue;
        const a = Math.max(0, p.life / p.maxLife);
        fx.ctx.globalAlpha = a;
        fx.ctx.fillStyle = p.color;
        fx.ctx.beginPath();
        fx.ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        fx.ctx.fill();
        fx.ctx.globalAlpha = 1;
      }
      if (anyAlive || particles.length) requestAnimationFrame(loop);
      else rafRunning = false;
    })();
  }

  const _trackedTargets = new Set();
  function fxAll() {
    return Array.from(_trackedTargets).map(t => fxCanvases.get(t)).filter(Boolean);
  }

  /* GameFX.burst(canvasEl, x, y, opts) — x/y in the
     target canvas's own CSS pixel space (e.g. game coords
     if the canvas isn't scaled, or event.offsetX/Y). */
  function burst(targetEl, x, y, opts) {
    opts = opts || {};
    const count = opts.count || 14;
    const colors = opts.colors || ['#ffd93d', '#ff6b6b', '#4ecdc4', '#a855f7'];
    const fx = getFxCanvas(targetEl);
    _trackedTargets.add(targetEl);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (opts.spread || 3) * (0.5 + Math.random());
      const life = opts.life || (0.5 + Math.random() * 0.4);
      particles.push({
        target: targetEl, x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1,
        gravity: opts.gravity !== undefined ? opts.gravity : 0.15,
        size: opts.size || (2 + Math.random() * 3),
        color: colors[Math.floor(Math.random() * colors.length)],
        life, maxLife: life
      });
    }
    ensureLoop();
  }

  /* GameFX.shake(canvasEl, opts) — jitters the element's
     CSS transform briefly, then resets it. */
  function shake(targetEl, opts) {
    opts = opts || {};
    const intensity = opts.intensity || 8;
    const duration = opts.duration || 260;
    const start = performance.now();
    const baseTransform = targetEl.dataset.fxBaseTransform !== undefined
      ? targetEl.dataset.fxBaseTransform
      : (targetEl.style.transform || '');
    targetEl.dataset.fxBaseTransform = baseTransform;
    (function tick(now) {
      const t = now - start;
      if (t >= duration) { targetEl.style.transform = baseTransform; return; }
      const p = 1 - t / duration;
      const dx = (Math.random() * 2 - 1) * intensity * p;
      const dy = (Math.random() * 2 - 1) * intensity * p;
      targetEl.style.transform = baseTransform + ' translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      requestAnimationFrame(tick);
    })(start);
  }

  /* GameFX.popup(canvasEl, x, y, text, opts) — floating
     score/label text that rises and fades, DOM-based so
     it works regardless of the game's render loop. */
  function popup(targetEl, x, y, text, opts) {
    opts = opts || {};
    const r = targetEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:61;' +
      'left:' + (r.left + x) + 'px;top:' + (r.top + y) + 'px;' +
      'transform:translate(-50%,-50%);font-weight:800;font-family:inherit;' +
      'font-size:' + (opts.size || 18) + 'px;color:' + (opts.color || '#ffd93d') + ';' +
      'text-shadow:0 2px 6px rgba(0,0,0,.5);transition:transform .8s ease-out,opacity .8s ease-out;opacity:1;';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translate(-50%,-160%)';
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 850);
  }

  /* ── Easing / tween helpers ── */
  const ease = {
    linear: t => t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    outBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
  };
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── Sprite-sheet animation helper ──
     spriteAnim(frameCount, fps) returns {frame(elapsedMs)}
     giving the current frame index — pair with a sprite
     sheet image and slice sw = img.width / frameCount. */
  function spriteAnim(frameCount, fps) {
    fps = fps || 10;
    return { frame(elapsedMs) { return Math.floor(elapsedMs / (1000 / fps)) % frameCount; } };
  }

  window.GameFX = { fxImage, burst, shake, popup, ease, lerp, spriteAnim, restart };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlays);
  } else {
    initOverlays();
  }
})();

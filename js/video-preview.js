/**
 * video-preview.js — Poki-style hover preview for ZenMagma
 *
 * Supports both GIF previews (<img class="card-preview-gif">)
 * and video previews (<video class="card-preview">).
 *
 * Behaviour:
 *  • Hover 150ms → lazy-load src → play/animate → fade in
 *  • Leave  → fade out → pause+rewind (video) / clear src (gif)
 *  • Only one preview active at a time
 *  • Completely disabled on touch-only devices
 *  • Event delegation covers dynamically rendered cards
 */

const VideoPreview = (() => {
  'use strict';

  const HOVER_DELAY_MS = 150;

  let activeEl    = null; // current <video> or <img.gif>
  let activeThumb = null;
  let hoverTimer  = null;

  // ── Mobile guard ────────────────────────────────────────────────────────────
  const isTouchOnly = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // ── Lazy-load: assign src only on first hover ────────────────────────────────
  function ensureSrc(el) {
    if (!el.src || el.src === window.location.href) {
      // img.src defaults to "" which resolves to page URL — check dataset
      if (el.dataset.src) el.src = el.dataset.src;
    }
  }

  // ── Stop current active preview ──────────────────────────────────────────────
  function stopActive() {
    if (!activeEl) return;

    activeEl.style.opacity = '0';
    activeThumb.classList.remove('preview-active');

    const el = activeEl;
    if (el.tagName === 'VIDEO') {
      el.pause();
      el.currentTime = 0;
    } else {
      // GIF: remove src so it stops consuming bandwidth when hidden
      // Use a tiny timeout matching the CSS fade-out duration
      setTimeout(() => { if (el.style.opacity === '0') el.src = ''; }, 380);
    }

    activeEl    = null;
    activeThumb = null;
  }

  // ── Start preview on a card thumb ────────────────────────────────────────────
  function startPreview(thumb) {
    // Pick whichever preview element exists on this card
    const el = thumb.querySelector('.card-preview, .card-preview-gif');
    if (!el) return;

    if (activeEl && activeEl !== el) stopActive();

    ensureSrc(el);
    activeEl    = el;
    activeThumb = thumb;
    thumb.classList.add('preview-active');

    if (el.tagName === 'VIDEO') {
      const p = el.play();
      if (p !== undefined) {
        p.then(() => { el.style.opacity = '1'; })
         .catch(() => {
           thumb.classList.remove('preview-active');
           activeEl = activeThumb = null;
         });
      } else {
        el.style.opacity = '1';
      }
    } else {
      // GIF: src already set → browser animates automatically
      el.style.opacity = '1';
    }
  }

  // ── Event delegation ─────────────────────────────────────────────────────────
  function onEnter(e) {
    if (isTouchOnly()) return;
    const thumb = e.target.closest('.card-thumb.has-preview');
    if (!thumb) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => startPreview(thumb), HOVER_DELAY_MS);
  }

  function onLeave(e) {
    if (isTouchOnly()) return;
    const thumb = e.target.closest('.card-thumb.has-preview');
    if (!thumb) return;
    clearTimeout(hoverTimer);
    if (activeThumb === thumb) stopActive();
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    if (isTouchOnly()) return;
    document.body.addEventListener('mouseenter', onEnter, true);
    document.body.addEventListener('mouseleave', onLeave, true);
  }

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => VideoPreview.init());
} else {
  VideoPreview.init();
}

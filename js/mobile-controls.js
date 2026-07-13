(() => {
  'use strict';

  const coarsePointer = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!coarsePointer || window.ZM_MOBILE_CONTROLS) return;
  window.ZM_MOBILE_CONTROLS = true;

  const keyMap = {
    left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
    right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
    up: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
    down: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
    action: { key: ' ', code: 'Space', keyCode: 32 }
  };

  const css = document.createElement('style');
  css.textContent = `
    .zm-touch-controls{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding:10px max(10px,env(safe-area-inset-left)) calc(10px + env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-right));pointer-events:none;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
    .zm-touch-cluster{display:grid;grid-template-columns:repeat(3,46px);grid-template-rows:repeat(2,46px);gap:7px;pointer-events:auto}
    .zm-touch-actions{display:flex;gap:9px;align-items:flex-end;pointer-events:auto}
    .zm-touch-btn{width:46px;height:46px;border:1px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(9,12,28,.72);color:#fff;font-size:18px;font-weight:800;box-shadow:0 10px 28px rgba(0,0,0,.28);backdrop-filter:blur(10px);-webkit-tap-highlight-color:transparent;touch-action:none;user-select:none}
    .zm-touch-btn:active,.zm-touch-btn.is-down{background:linear-gradient(135deg,#7c3aed,#ec4899);transform:translateY(1px)}
    .zm-touch-up{grid-column:2;grid-row:1}.zm-touch-left{grid-column:1;grid-row:2}.zm-touch-down{grid-column:2;grid-row:2}.zm-touch-right{grid-column:3;grid-row:2}
    .zm-touch-action{width:64px;height:64px;border-radius:50%;font-size:14px;letter-spacing:.04em}.zm-touch-toggle{width:42px;height:42px;border-radius:50%;font-size:16px}
    .zm-touch-controls.is-collapsed .zm-touch-cluster,.zm-touch-controls.is-collapsed .zm-touch-action{display:none}
    @media (min-width: 900px){.zm-touch-controls{display:none}}
  `;
  document.head.appendChild(css);

  const root = document.createElement('div');
  root.className = 'zm-touch-controls';
  root.innerHTML = `
    <div class="zm-touch-cluster" aria-label="Movement controls">
      <button class="zm-touch-btn zm-touch-up" data-key="up" aria-label="Up">U</button>
      <button class="zm-touch-btn zm-touch-left" data-key="left" aria-label="Left">L</button>
      <button class="zm-touch-btn zm-touch-down" data-key="down" aria-label="Down">D</button>
      <button class="zm-touch-btn zm-touch-right" data-key="right" aria-label="Right">R</button>
    </div>
    <div class="zm-touch-actions">
      <button class="zm-touch-btn zm-touch-action" data-key="action" aria-label="Action">GO</button>
      <button class="zm-touch-btn zm-touch-toggle" type="button" aria-label="Hide controls">-</button>
    </div>
  `;
  document.body.appendChild(root);

  function fire(type, name) {
    const info = keyMap[name];
    if (!info) return;
    const evt = new KeyboardEvent(type, { key: info.key, code: info.code, bubbles: true, cancelable: true });
    try {
      Object.defineProperty(evt, 'keyCode', { get: () => info.keyCode });
      Object.defineProperty(evt, 'which', { get: () => info.keyCode });
    } catch (_) {}
    document.dispatchEvent(evt);
    window.dispatchEvent(evt);
  }

  function bind(btn) {
    const name = btn.dataset.key;
    let down = false;
    const press = (e) => { e.preventDefault(); if (down) return; down = true; btn.classList.add('is-down'); fire('keydown', name); };
    const release = (e) => { e.preventDefault(); if (!down) return; down = false; btn.classList.remove('is-down'); fire('keyup', name); };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
  }

  root.querySelectorAll('[data-key]').forEach(bind);
  root.querySelector('.zm-touch-toggle').addEventListener('click', () => {
    root.classList.toggle('is-collapsed');
    root.querySelector('.zm-touch-toggle').textContent = root.classList.contains('is-collapsed') ? '+' : '-';
  });
})();

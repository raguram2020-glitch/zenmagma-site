/* ═══════════════════════════════════════════════════
   ZENMAGMA — game-three-shell.js
   Reusable Three.js bootstrap for the runner-shell
   games (Phase 1). ES module — import from a game via:
     import { RunnerShell, supportsWebGL2 } from '../js/game-three-shell.js';
═══════════════════════════════════════════════════ */
import * as THREE from './vendor/three.module.min.js';

export function supportsWebGL2() {
  try {
    const cv = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && cv.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

/* RunnerShell — one instance per game. Handles renderer,
   camera, lighting, a scrolling ground plane, and a
   sprite-billboard pool for obstacles/collectibles.
   Canvas sizing is driven by ResizeObserver on the
   canvas's own clientWidth/clientHeight, NOT
   window.innerWidth/innerHeight — game.html's iframe CSS
   forces canvas{object-fit:contain} via !important, so a
   window-sized backing buffer would diverge from the
   displayed size and blur/distort the WebGL output. */
export class RunnerShell {
  constructor(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxPixelRatio || 2));
    this.renderer.shadowMap.enabled = !!opts.shadows;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(opts.sky || 0x88ccff);

    this.camera = new THREE.PerspectiveCamera(opts.fov || 62, 1, 0.1, 1000);
    this.camera.position.set(0, opts.camHeight || 4, opts.camDistance || 8);
    this.camera.lookAt(0, opts.lookHeight || 1.5, -10);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x445566, 1.1);
    this.scene.add(this.hemiLight);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.position.set(5, 12, 5);
    this.scene.add(this.sunLight);

    this.ground = null;
    this.groundTexture = null;
    this._spritePool = [];

    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(canvas);
    this._onResize();
  }

  _onResize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* Ground plane with a forward-scrolling tiled texture.
     Pass a SEAMLESS/tileable image — a non-tiling image
     will show a visible seam every repeat under
     RepeatWrapping. repeatY controls how many times the
     texture tiles along the runway length. */
  setGroundTexture(url, opts) {
    opts = opts || {};
    new THREE.TextureLoader().load(url, tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(opts.repeatX || 1, opts.repeatY || 40);
      const length = opts.length || 400;
      const geo = new THREE.PlaneGeometry(opts.width || 12, length, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ map: tex });
      if (this.ground) { this.scene.remove(this.ground); this.ground.geometry.dispose(); this.ground.material.dispose(); }
      this.ground = new THREE.Mesh(geo, mat);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.position.z = -length / 2 + 10;
      this.ground.receiveShadow = !!opts.shadows;
      this.scene.add(this.ground);
      this.groundTexture = tex;
    });
  }

  /* Call once per frame with the per-frame forward-scroll
     delta (e.g. game speed / 60) to animate the ground. */
  scrollGround(dz) {
    if (this.groundTexture) this.groundTexture.offset.y += dz;
  }

  setSkyColor(hex) {
    this.scene.background = new THREE.Color(hex);
  }

  /* A camera-facing billboard sprite — the standard way
     to place a 2D AI-generated character/obstacle image
     into the 3D scene without a 3D mesh. Returns the
     THREE.Sprite so the caller can move/scale/remove it. */
  addBillboard(url, opts) {
    opts = opts || {};
    const mat = new THREE.SpriteMaterial({ transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(opts.width || 1, opts.height || 1, 1);
    if (opts.x !== undefined) sprite.position.x = opts.x;
    if (opts.y !== undefined) sprite.position.y = opts.y;
    if (opts.z !== undefined) sprite.position.z = opts.z;
    new THREE.TextureLoader().load(url, tex => { mat.map = tex; mat.needsUpdate = true; });
    this.scene.add(sprite);
    return sprite;
  }

  /* Simple recyclable pool of billboard sprites for
     obstacles/collectibles spawned/despawned every frame —
     avoids per-frame geometry/material allocation churn. */
  getPooledBillboard(url, opts) {
    let s = this._spritePool.find(p => !p.visible && p.userData.url === url);
    if (!s) {
      s = this.addBillboard(url, opts);
      s.userData.url = url;
      this._spritePool.push(s);
    }
    s.visible = true;
    if (opts) {
      if (opts.x !== undefined) s.position.x = opts.x;
      if (opts.y !== undefined) s.position.y = opts.y;
      if (opts.z !== undefined) s.position.z = opts.z;
      if (opts.width !== undefined || opts.height !== undefined) {
        s.scale.set(opts.width || s.scale.x, opts.height || s.scale.y, 1);
      }
    }
    return s;
  }

  releaseBillboard(sprite) {
    sprite.visible = false;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this._ro.disconnect();
    this._spritePool.forEach(s => { s.material.dispose(); });
    if (this.ground) { this.ground.geometry.dispose(); this.ground.material.dispose(); }
    this.renderer.dispose();
  }
}

// The Black Friday tile wall behind the landing hero: a grid of glossy dark
// tiles, backlit by a pink glow with light rays, that ripple out from the
// centre once on load and lift and tilt under the pointer.
//
// Loaded on demand (dynamic import) by LandingHero, and only on devices with a
// fine pointer and no reduced-motion preference, so three.js never reaches the
// main bundle or a phone. It renders only while something moves.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export const TILE_WALL_PALETTE = { accent: "#ff2a77", hot: "#ffdbe8", deep: "#9c0b47", tile: "#2c0a19", page: "#141414" };

// World units: one tile pitch is about 1.05. The pixel size of a unit follows
// the width, so the grid reads the same on a laptop and a wide screen.
const TILE = { size: 0.99, corner: 0.14, pitch: 1.05, depth: 0.08, bevel: 0.018 };
const CAMERA_Z = 12;
const HOVER = { lift: 1, sigma: 0.9 };
const WAVE = { speed: 10, width: 0.55, height: 0.45, fade: 10 };
// Rays fanning out of the light: angle (deg), length, spread, opacity.
const RAYS = [[33, 11, 0.55, 0.6], [27, 8, 0.12, 0.4], [207, 11, 0.6, 0.55], [199, 8, 0.14, 0.35], [122, 4, 0.35, 0.1], [302, 3.5, 0.3, 0.08]];

function pixelsPerUnit(width) {
  const span = width > 639 ? 408 : 274 + Math.min(71.04, Math.max(36, (width - 56) * 0.156)) * 1.6;
  return Math.min(width, span) / 6.43;
}

function canvasTexture(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) paint(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// The glow behind the grid: white at the light, through the pinks, to the page.
function backlightTexture(p) {
  const shadow = `#${new THREE.Color(p.deep).lerp(new THREE.Color(p.page), 0.7).getHexString()}`;
  return canvasTexture(1024, 1024, (ctx, w) => {
    ctx.fillStyle = p.page;
    ctx.fillRect(0, 0, w, w);
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    [[0, "#ffffff"], [0.015, p.hot], [0.04, p.accent], [0.09, p.deep], [0.18, shadow], [0.32, p.page]].forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}

function haloTexture() {
  return canvasTexture(256, 256, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    [[0, "#fff"], [0.15, "rgba(255,255,255,.6)"], [0.45, "rgba(255,255,255,.12)"], [1, "rgba(255,255,255,0)"]].forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}

// A ray: bright at the light, fading along its length and across its width.
function rayTexture() {
  return canvasTexture(512, 64, (ctx, w, h) => {
    const along = ctx.createLinearGradient(0, 0, w, 0);
    [[0, "#fff"], [0.25, "rgba(255,255,255,.55)"], [0.6, "rgba(255,255,255,.15)"], [1, "rgba(255,255,255,0)"]].forEach(([o, c]) => along.addColorStop(o, c));
    ctx.fillStyle = along;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "destination-in";
    const across = ctx.createLinearGradient(0, 0, 0, h);
    [[0, "rgba(0,0,0,0)"], [0.5, "#000"], [1, "rgba(0,0,0,0)"]].forEach(([o, c]) => across.addColorStop(o, c));
    ctx.fillStyle = across;
    ctx.fillRect(0, 0, w, h);
  });
}

function roundedSquare(size, r) {
  const h = size / 2;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  return s;
}

// Tile material: dark glossy plastic, plus a rim of pink light on the edges
// that face the glow behind the grid (fresnel × how much the edge faces it,
// fading with distance). Added to the emissive term of the physical material.
function tileMaterial(p, rimLight) {
  const mat = new THREE.MeshPhysicalMaterial({ color: p.tile, metalness: 0.1, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRimPos = { value: rimLight.position };
    shader.uniforms.uRimColor = { value: rimLight.color };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        mat4 tileModel = modelMatrix;
        #ifdef USE_INSTANCING
          tileModel = modelMatrix * instanceMatrix;
        #endif
        vWorldPos = (tileModel * vec4(transformed, 1.0)).xyz;
        vWorldNormal = normalize(mat3(tileModel) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;\nuniform vec3 uRimPos;\nuniform vec3 uRimColor;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          vec3 n = normalize(vWorldNormal);
          vec3 toEye = normalize(cameraPosition - vWorldPos);
          vec3 toLight = uRimPos - vWorldPos;
          float dist = length(toLight);
          float edge = pow(1.0 - clamp(abs(dot(n, toEye)), 0.0, 1.0), 1.5);
          float facing = clamp((dot(n, toLight / dist) + 0.35) / 1.35, 0.0, 1.0);
          totalEmissiveRadiance += uRimColor * (12.0 * edge * facing * facing) / (1.0 + dist * dist * 1.1);
        }`,
      );
  };
  return mat;
}

export function createTileWall(canvas, palette = TILE_WALL_PALETTE) {
  const p = palette;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(p.page);
  scene.add(new THREE.AmbientLight(p.tile, 0.08));
  const glow = new THREE.PointLight(p.accent, 38, 0, 2);
  glow.position.set(0, 0, -0.6);
  scene.add(glow);

  const additive = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };
  const owned = []; // textures and geometries to free on dispose

  const backTex = backlightTexture(p);
  const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false }));
  backPlane.position.z = -0.9;
  scene.add(backPlane);
  owned.push(backTex);

  const flare = new THREE.Group();
  flare.position.z = 0.2;
  const haloTex = haloTexture();
  flare.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshBasicMaterial({ ...additive, map: haloTex, opacity: 0.85, color: p.accent })));
  const rayTex = rayTexture();
  const rayColor = new THREE.Color(p.accent).multiplyScalar(1.6);
  for (const [angle, length, spread, opacity] of RAYS) {
    const geo = new THREE.PlaneGeometry(length, 1, 24, 1);
    geo.translate(length / 2 + 0.55, 0, 0);
    // Taper: thin at the light, wider towards the tip.
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const along = (pos.getX(i) - 0.55) / length;
      pos.setY(i, pos.getY(i) * (0.12 + spread * 2.4 * along));
    }
    const ray = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ ...additive, map: rayTex, opacity: opacity * 0.4, color: rayColor }));
    ray.rotation.z = THREE.MathUtils.degToRad(angle);
    flare.add(ray);
  }
  scene.add(flare);
  owned.push(haloTex, rayTex);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NoToneMapping;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.35, 0.8));
  composer.addPass(new OutputPass());

  const tileGeo = new THREE.ExtrudeGeometry(roundedSquare(TILE.size, TILE.corner), { depth: TILE.depth, bevelEnabled: true, bevelThickness: TILE.bevel, bevelSize: TILE.bevel, bevelSegments: 4, curveSegments: 14 });
  tileGeo.center();
  const rim = { position: new THREE.Vector3(0, 0, -0.35), color: new THREE.Color(p.accent).lerp(new THREE.Color(p.hot), 0.3) };
  const tileMat = tileMaterial(p, rim);

  // The grid: one instance per tile, with its rest position and what it is
  // currently doing (lift towards the camera, tilt on two axes).
  let grid = null;
  const dummy = new THREE.Object3D();
  const buildGrid = (cols, rows) => {
    const count = (cols[1] - cols[0] + 1) * (rows[1] - rows[0] + 1);
    const g = { key: `${cols}|${rows}`, mesh: new THREE.InstancedMesh(tileGeo, tileMat, count), x: new Float32Array(count), y: new Float32Array(count), lift: new Float32Array(count), tiltX: new Float32Array(count), tiltY: new Float32Array(count), reach: 0 };
    let i = 0;
    for (let c = cols[0]; c <= cols[1]; c++) {
      for (let r = rows[0]; r <= rows[1]; r++) {
        g.x[i] = c * TILE.pitch;
        g.y[i] = r * TILE.pitch;
        g.reach = Math.max(g.reach, Math.hypot(g.x[i], g.y[i]));
        i++;
      }
    }
    return g;
  };
  const writeMatrices = () => {
    for (let i = 0; i < grid.x.length; i++) {
      dummy.position.set(grid.x[i], grid.y[i], grid.lift[i]);
      dummy.rotation.set(grid.tiltX[i], grid.tiltY[i], 0);
      dummy.updateMatrix();
      grid.mesh.setMatrixAt(i, dummy.matrix);
    }
    grid.mesh.instanceMatrix.needsUpdate = true;
  };

  let ready = false;
  const draw = () => { if (ready) composer.render(); };

  // Pointer, in normalised device coordinates, and where it meets the grid.
  let pointer = null;
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const target = new THREE.Vector3();
  let hover = 0;
  // The load ripple: a ring leaving the light, tiles rising as it passes.
  let waveStart = null;
  let waveDuration = 0;

  let raf = 0;
  let last = 0;
  const step = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!grid) { raf = 0; return; }
    if (pointer) { raycaster.setFromCamera(pointer, camera); raycaster.ray.intersectPlane(plane, target); }
    hover += ((pointer ? 1 : 0) - hover) * (1 - Math.exp(-dt * 6));
    let ring = null;
    if (waveStart !== null) {
      const t = (now - waveStart) / 1000;
      if (t > waveDuration) waveStart = null;
      else ring = t * WAVE.speed * HOVER.sigma;
    }
    const ease = 1 - Math.exp(-dt * 9);
    const s2 = HOVER.sigma * HOVER.sigma;
    let moving = hover > 0.001 || ring !== null;
    for (let i = 0; i < grid.x.length; i++) {
      const dx = grid.x[i] - target.x;
      const dy = grid.y[i] - target.y;
      const fromPointer = HOVER.lift * Math.exp(-(dx * dx + dy * dy) / (2 * s2)) * hover;
      const r = Math.hypot(grid.x[i], grid.y[i]) || 1e-6;
      let fromWave = 0;
      if (ring !== null) {
        const w = WAVE.width * HOVER.sigma;
        fromWave = WAVE.height * HOVER.lift * Math.exp(-((r - ring) ** 2) / (2 * w * w)) * Math.exp(-r / (WAVE.fade * HOVER.sigma));
      }
      const goal = fromPointer + fromWave;
      grid.lift[i] += (goal - grid.lift[i]) * ease;
      // Tilt down the slope of whatever lifts it: away from the pointer, or
      // away from the ring's front.
      const out = ring === null ? 0 : (r - ring) / r;
      const total = goal || 1;
      const sx = (dx * fromPointer + grid.x[i] * out * fromWave) / total;
      const sy = (dy * fromPointer + grid.y[i] * out * fromWave) / total;
      const k = (grid.lift[i] / s2) * 0.45;
      grid.tiltY[i] += (sx * k - grid.tiltY[i]) * ease;
      grid.tiltX[i] += (-sy * k - grid.tiltX[i]) * ease;
      if (grid.lift[i] > 5e-4) moving = true;
    }
    writeMatrices();
    draw();
    raf = moving ? requestAnimationFrame(step) : 0;
  };
  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  };

  return {
    // Size of the canvas, and where (in its pixels) the light sits: the grid
    // is centred on the light, which is the hero title.
    setFrame({ width, height, lightX, lightY }) {
      const unit = pixelsPerUnit(width);
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / unit / 2 / CAMERA_Z));
      camera.setViewOffset(width, height, width / 2 - lightX, height / 2 - lightY, width, height);
      camera.updateProjectionMatrix();
      const toCell = (px) => px / unit / TILE.pitch;
      const cols = [Math.floor(-toCell(lightX)) - 1, Math.ceil(toCell(width - lightX)) + 1];
      const rows = [Math.floor(-toCell(height - lightY)) - 1, Math.ceil(toCell(lightY)) + 1];
      if (grid?.key !== `${cols}|${rows}`) {
        if (grid) { scene.remove(grid.mesh); grid.mesh.dispose(); }
        grid = buildGrid(cols, rows);
        writeMatrices();
        scene.add(grid.mesh);
      }
      draw();
    },
    async warmUp() {
      if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
      ready = true;
      draw();
    },
    setPointer(ndc) {
      pointer = ndc ? new THREE.Vector2(ndc.x, ndc.y) : null;
      wake();
    },
    playRipple() {
      if (!grid) return;
      waveStart = performance.now();
      waveDuration = (grid.reach + 3 * WAVE.width * HOVER.sigma) / (WAVE.speed * HOVER.sigma);
      wake();
    },
    dispose() {
      cancelAnimationFrame(raf);
      grid?.mesh.dispose();
      tileGeo.dispose();
      tileMat.dispose();
      scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
      owned.forEach((tex) => tex.dispose());
      composer.dispose();
      renderer.dispose();
    },
  };
}

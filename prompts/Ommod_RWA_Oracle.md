# OMMOD — RWA Oracle Module

## LAYER 1 — OPENING DECLARATION

Build a **single-page marketing site** for **OMMOD** — a **verifiable oracle module for real-world assets** (on-chain prices, NAV, and proof-of-reserves for tokenized RWAs, backed by signed attestations and cryptographic proofs, not trust).

Use the following **pinned** tech stack (do not substitute):

- **Vanilla HTML + CSS + JavaScript** — **no framework, no build step.** Runs on any static server (`python3 -m http.server`). Not React, not Vue, not Tailwind, not Vite.
- **Three.js** (r128, self-hosted) — drives the WebGL wireframe-wormhole hero (Layer 6).
- **GSAP + ScrollTrigger** (self-hosted) — scroll-reveal choreography and the hero entrance timeline.
- **Lenis** (self-hosted, MIT) — smooth-scroll, synced into the GSAP ticker.
- All four vendor libs live in `vendor/` and load as plain `<script>` tags — **no CDN at runtime.**
- Plain CSS in two files (`tokens.css` + `styles.css`). One global JS namespace: **`window.SITE`**.

The aesthetic is OMMOD's own **dark instrument panel** — a clean, restrained, product-grade dark UI. A near-black **onyx** (`#08090a`) canvas, cool-gray monochrome text, and **one rationed line color**: every border, divider, grid seam, and motif stroke is the *same* 1px graphite (`#282c33`). The signature layout move is a **bleed-hairline grid** — content cells sit on a `--bg` background with a 1px gap between them, and the gap reveals the graphite line beneath, so the whole page reads as one continuous ruled grid. Sections are full-viewport, separated by hairlines; the header is a floating bordered bar that snaps flush against the grid (overlapping by 1px so the seam reads as a single line). Type is **Inter** at light weight (300) with negative tracking for display, regular (400) for body, and **JetBrains Mono** for labels, terminal, and metadata.

Two accents, both heavily rationed: **acid lime** (`#e4f222`) appears only in the favicon check, the `::selection` highlight, and (in dark) the scrollbar of nothing-much — and **indigo** (`#5e6ad2`) is decorative only (the wormhole throat ring, the terminal `<step>` tags, the active globe node, focus rings). **The primary CTA is NOT lime — it is a white (snow) fill with black text.**

**Do not:** introduce a second hairline color (there is exactly one, `--line`), add gradients to section backgrounds, use a colored CTA, add card elevation beyond the one inset hairline + soft shadow, use any font weight above 590, add emoji, or credit any third-party design system / template by name. The whole thing is monochrome with two micro-accents.

---

## LAYER 2 — FONTS

Load two families from Google Fonts in `index.html` `<head>` (preconnect first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

Role mapping (CSS custom properties in Layer 3):

| Role | Family | CSS var |
|---|---|---|
| Display headlines (light, w300) + body (w400) | **Inter** (300/400/500/600) | `--font-display` / `--font-body` |
| Labels, eyebrows-as-mono, terminal, metadata, form labels | **JetBrains Mono** (400/500) | `--font-mono` |

Inter and the body share the same stack. The four weights map to named tokens: `--w-light: 300` (display headlines, big stack words, stat numbers, mobile nav links), `--w-regular: 400` (body, nav links), `--w-mid: 510` (eyebrows, buttons, card titles, deflist keys), `--w-strong: 590` (wordmark only). Display type uses negative letter-spacing (`-0.02em` on `.display`). Body runs `line-height: 1.5–1.6`. Mono runs slightly tight (`letter-spacing: -0.01em`) except labels which are uppercase + wide (`0.12–0.14em`).

`body` enables `font-feature-settings: "cv01" 1, "ss03" 1` on Inter and `-webkit-font-smoothing: antialiased`.

---

## LAYER 3 — DESIGN TOKENS (`css/tokens.css`)

Paste **verbatim** — this is the whole design system. Dark is the default `:root`; light is `:root.light` (the theme toggle adds/removes the `light` class). Every border/divider/seam/stroke resolves to `--line`.

```css
:root {
  /* ---- Surfaces ---- */
  --bg:        #08090a;   /* onyx — canvas / the void everything floats on */
  --surface-1: #0f1011;   /* charcoal — nav, card base, elevation 1 */
  --surface-2: #161718;   /* obsidian — deep cards, raised blocks */
  --surface-input: #383b3f; /* steel — inputs */
  --bg-deep:   #0f1011;   /* alias for raised cell hover */

  /* ---- The ONE unified hairline (borders, dividers, grid seams, motif strokes) ---- */
  --line:   #282c33;      /* graphite, single value used EVERYWHERE for 1px lines */
  --border: #282c33;      /* alias — same value (no second border colour) */

  /* ---- Text scale (cool grays) ---- */
  --text:  #f7f8f8;       /* snow — primary text/icons */
  --mist:  #d0d6e0;       /* tertiary text, soft icon strokes */
  --muted: #8a8f98;       /* fog — secondary text, captions, metadata */
  --faint: #62666d;       /* slate — muted/placeholder, low-emphasis */

  /* ---- Accents ---- */
  --accent:    #e4f222;   /* acid lime — selection / favicon only, rationed */
  --on-accent: #08090a;   /* near-black text on lime (AAA) */
  --indigo:    #5e6ad2;   /* decorative icon/brand accent + focus ring */
  --emerald:   #27a644;
  --crimson:   #eb5757;
  --cyan:      #02b8cc;

  --scrollbar-bg: #0f1011;

  /* ---- Type families ---- */
  --font-display: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;

  /* ---- Type weights (300 / 400 / 510 / 590) ---- */
  --w-light: 300; --w-regular: 400; --w-mid: 510; --w-strong: 590;

  /* ---- Fluid type scale (restrained) ---- */
  --fs-display: clamp(2.75rem, 1.9rem + 4.2vw, 4.5rem);   /* ~44–72 */
  --fs-h1:      clamp(2rem, 1.5rem + 2.4vw, 3rem);         /* ~32–48 */
  --fs-h2:      clamp(1.6rem, 1.3rem + 1.5vw, 2.25rem);    /* ~26–36 */
  --fs-h3:      clamp(1.15rem, 1.02rem + .55vw, 1.5rem);   /* ~18–24 */
  --fs-lg:      1.0625rem;   /* 17 — body-lg */
  --fs-body:    0.9375rem;   /* 15 */
  --fs-sm:      0.875rem;    /* 14 — caption */
  --fs-xs:      0.75rem;     /* 12 — micro */
  --fs-label:   0.75rem;

  /* ---- Spacing (4px base) ---- */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 40px; --s-7: 64px; --s-8: 96px;

  /* ---- Structure ---- */
  --header-height: 64px;
  --frame-inset: 16px;
  --hairline: 1px;
  --maxw: 1280px;

  /* ---- Radii ---- */
  --radius-badge: 2px;
  --radius-btn: 6px;
  --radius-input: 6px;
  --radius-card: 12px;
  --radius-pill: 9999px;

  /* ---- Breakpoints ---- */
  --bp-sm: 480px; --bp-md: 768px; --bp-lg: 1024px; --bp-xl: 1280px;

  /* ---- Z-index ---- */
  --z-bg: -1; --z-base: 1; --z-overlay: 10000; --z-header: 10001; --z-loader: 100000;

  /* ---- Motion ---- */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.76, 0, 0.24, 1);
  --dur-fast: .22s; --dur: .42s; --dur-slow: .8s;

  /* ---- Shadows (elevation) ---- */
  --shadow-sm: rgba(0,0,0,0.4) 0px 2px 4px 0px;
  --shadow-inset-border: inset 0 0 0 1px var(--line);
  --shadow-card: rgba(0,0,0,0.4) 0px 2px 4px 0px, inset 0 0 0 1px var(--line);
  --shadow-depth: 0px 5px 2px 0px rgba(0,0,0,0.01), 0px 3px 2px 0px rgba(0,0,0,0.04), 0px 1px 1px 0px rgba(0,0,0,0.07), 0px 0px 1px 0px rgba(0,0,0,0.08);
  --shadow-xl: rgba(8,9,10,0.6) 0px 4px 32px 0px;

  color-scheme: dark;
}

/* Light mode is a clean inversion (dark is the default). */
:root.light {
  --bg:        #ffffff;
  --surface-1: #f7f8f8;
  --surface-2: #eef0f2;
  --surface-input: #eef0f2;
  --bg-deep:   #f1f2f4;
  --line:   #e3e5e9;
  --border: #e3e5e9;
  --text:  #08090a;
  --mist:  #3a3d42;
  --muted: #62666d;
  --faint: #8a8f98;
  --on-accent: #08090a;
  --scrollbar-bg: #eef0f2;
  color-scheme: light;
}
```

---

## LAYER 4 — CUSTOM CSS UTILITIES (`css/styles.css` signature blocks)

These blocks are the design DNA — paste **verbatim**. The whole layout is built from one primitive: the **bleed-hairline grid** (`gap: 1px; background: var(--line)` on the container, `background: var(--bg)` on each `.cell`, so the 1px gap shows the line). Loaded **after** `tokens.css`.

```css
/* ---------------------------------- RESET --------------------------------- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body {
  font-family: var(--font-body); font-size: var(--fs-body); line-height: 1.5;
  font-weight: var(--w-regular);
  color: var(--text); background: var(--bg);
  font-feature-settings: "cv01" 1, "ss03" 1;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
  overflow-x: hidden;
  transition: background-color var(--dur) var(--ease-inout), color var(--dur) var(--ease-inout);
}
img, svg, video, canvas { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
ul { list-style: none; }
::selection { background: var(--accent); color: var(--on-accent); }

/* ------------------------------- MAIN FRAME ------------------------------- */
.stack {
  margin: calc(var(--header-height) + var(--frame-inset) - 1px) var(--frame-inset) var(--frame-inset);
  border: var(--hairline) solid var(--line); border-radius: var(--radius-card); position: relative; overflow: hidden;
}
.section { position: relative; min-height: calc(100svh - var(--header-height) - var(--frame-inset) * 3); border-bottom: var(--hairline) solid var(--line); overflow: hidden; display: flex; flex-direction: column; }
.section.auto-h { min-height: 0; }
.section:last-child { border-bottom: none; }

/* ------------------------- BLEED HAIRLINE GRID ---------------------------- */
.grid-bleed { display: grid; gap: var(--hairline); background: var(--line); }
.grid-bleed.soft { background: var(--line); }
.grid-bleed > .cell { background: var(--bg); min-width: 0; }

/* --------------------------------- TYPE ----------------------------------- */
.eyebrow { font-family: var(--font-display); font-size: var(--fs-xs); font-weight: var(--w-mid); letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
.display { font-family: var(--font-display); font-weight: var(--w-light); font-size: var(--fs-display); line-height: 1.02; letter-spacing: -0.02em; color: var(--text); }
.h1 { font-family: var(--font-display); font-weight: var(--w-regular); font-size: var(--fs-h1); line-height: 1.08; letter-spacing: -0.015em; color: var(--text); }
.h2 { font-family: var(--font-display); font-weight: var(--w-regular); font-size: var(--fs-h2); line-height: 1.12; letter-spacing: -0.012em; color: var(--text); }
.lead { font-size: var(--fs-lg); color: var(--mist); line-height: 1.5; font-weight: var(--w-regular); }
.body { font-size: var(--fs-body); color: var(--muted); line-height: 1.6; }
.body strong, .lead strong { color: var(--text); font-weight: var(--w-mid); }

/* --------------------------------- BUTTONS -------------------------------- */
/* full-cell action bar — DEFAULT is the quiet/secondary treatment */
.btn-bar {
  display: flex; align-items: center; justify-content: center; gap: var(--s-3); width: 100%; height: 100%;
  padding: var(--s-4) var(--s-5); font-family: var(--font-display); font-weight: var(--w-mid); font-size: var(--fs-sm);
  background: transparent; color: var(--text);
  transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), gap var(--dur-fast) var(--ease-out);
}
.btn-bar .arr { transition: transform var(--dur-fast) var(--ease-out); }
.btn-bar:hover { background: var(--surface-2); gap: var(--s-4); }
.btn-bar:hover .arr { transform: translateX(4px); }
/* primary action — white (snow) fill, black text */
.btn-bar.primary { background: var(--text); color: var(--bg); }
.btn-bar.primary:hover { background: var(--text); filter: brightness(0.92); }
.btn-bar.ghost { background: transparent; color: var(--text); }

/* ------------------------------- MOTIF STROKES ---------------------------- */
/* unified: every decorative line is 1px in --line; depth via opacity only */
.motif-stroke { fill: none; stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke; }
.motif-stroke.dash { stroke-dasharray: 3 5; }
.node-dot { fill: var(--bg); stroke: currentColor; stroke-width: 1; }
.node-dot.on { fill: var(--indigo); stroke: var(--indigo); }
.globe-link { stroke: currentColor; fill: none; }
.globe-logo { filter: grayscale(1) brightness(1.18) contrast(1.03); }
:root.light .globe-logo { filter: grayscale(1) brightness(0.82) contrast(1.05); }

/* ------------------------------- SCROLLBAR -------------------------------- */
html { scrollbar-color: var(--line) var(--scrollbar-bg); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--scrollbar-bg); }
::-webkit-scrollbar-thumb { background: var(--line); border: 2px solid var(--scrollbar-bg); border-radius: var(--radius-pill); }

/* utility */
.fill { width: 100%; height: 100%; }
[hidden] { display: none !important; }

/* ============================ REDUCED MOTION ============================== */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .loader { display: none !important; }
}
```

The full `styles.css` continues with the per-component blocks (header, hero, split, stats, features, terminal, ecosystem, contact, footer) — all spelled out section-by-section in Layer 7. They are all variations on the same bleed-hairline grid + `--line` strokes.

---

## LAYER 5 — ASSETS

The favicon and the header/footer mark are **inline SVG** (hand-authored, below). The section images and the logo set are hosted on the project CDN, referenced by their CDN URL (they load cross-origin in `<img>`/`<image>` — no CORS setup needed).

- **`assets/favicon.svg`** — a 28×28 onyx square, a snow circle ring, and a **lime** check mark. Create verbatim:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none">
  <rect width="28" height="28" fill="#08090a"/>
  <circle cx="14" cy="14" r="10.5" stroke="#f7f8f8" stroke-width="1.6"/>
  <path d="M9 14.5l3.5 3.5 7-8" stroke="#e4f222" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- **`https://cdn.5sdesign.art/projects/ommod/image/image-02.png`** — the hero **fallback** still (shown only if WebGL is unavailable; otherwise the 3D canvas renders). `hidden` until WebGL fails.
- **`https://cdn.5sdesign.art/projects/ommod/image/image-01.png`** — the Problem section image (object-fit `contain`, static).
- **`https://cdn.5sdesign.art/projects/ommod/image/section-01.png`** — the Architecture section image (object-fit **`cover`**, fills the frame).
- **`https://cdn.5sdesign.art/projects/ommod/logos/logo-NN.svg`** — a CDN set of **46 grayscale logo SVGs** used by the rotating globe motif and the Ecosystem grid. Files are named sequentially in render order: `logo-01.svg`, `logo-02.svg`, … `logo-46.svg`. The globe samples 26 of these onto a sphere; the Ecosystem grid shows 6 fixed ones (`logo-01, logo-09, logo-17, logo-20, logo-23, logo-33`). All are rendered `grayscale(1)` at ~0.8 opacity, brightening on hover.

The header/footer logo is an **inline SVG** (not a file): a circle ring (`r=11`) + check mark (`M8.5 14.5l3.5 3.5 7-8`), same mark as the favicon, in `currentColor`.

---

## LAYER 6 — SIGNATURE INTERACTION: Three.js wireframe-wormhole hero (`js/hero3d.js`)

The hero's centerpiece: a **wireframe hyperboloid "portal"** built from line geometry in Three.js. It auto-spins slowly, has fog-based depth, an **indigo throat ring**, you can **drag to orbit** (with release inertia), and **hover energizes it** (faster spin + brighter lines). Theme-aware (re-reads CSS vars on theme change), reduced-motion-safe (auto-spin → 0 but drag still works), and paused when offscreen. If WebGL is unavailable, the canvas is removed and the hero fallback still (`https://cdn.5sdesign.art/projects/ommod/image/image-02.png`) is shown instead.

Paste **verbatim**:

```js
/* OMMOD — Hero 3D wormhole (Three.js, self-hosted).
   A curved wireframe hyperboloid "portal".
   • auto-spins + fog depth + indigo throat ring
   • DRAG to orbit (with inertia)   • HOVER to energise (faster spin, brighter)
   Theme-aware · reduced-motion-safe (no auto-spin, drag still works) · offscreen-paused. */
(function () {
  var host = document.querySelector("#hero .hero__motif");
  if (!host) return;
  var canvas = host.querySelector("canvas");
  var fallback = host.querySelector(".hero__fallback");

  function webglOK() {
    try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  }
  if (!window.THREE || !canvas || !webglOK()) {
    if (canvas) canvas.remove();
    if (fallback) fallback.hidden = false;
    return;
  }

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function cssVar(name, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fb; }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6);

  /* ---- curved hyperboloid (tighter throat, sharper flare) ---- */
  var H = 3.7, a = 0.4, c = 1.05, Nt = 48, Nz = 32;
  function radius(z) { return a * Math.sqrt(1 + (z / c) * (z / c)); }
  var pos = [];
  for (var j = 0; j <= Nz; j++) {                              // rings
    var z = -H + (2 * H * j) / Nz, rr = radius(z);
    for (var i = 0; i < Nt; i++) {
      var t0 = (i / Nt) * Math.PI * 2, t1 = ((i + 1) / Nt) * Math.PI * 2;
      pos.push(z, rr * Math.cos(t0), rr * Math.sin(t0), z, rr * Math.cos(t1), rr * Math.sin(t1));
    }
  }
  for (var k = 0; k < Nt; k++) {                               // meridians
    var th = (k / Nt) * Math.PI * 2;
    for (var m = 0; m < Nz; m++) {
      var za = -H + (2 * H * m) / Nz, zb = -H + (2 * H * (m + 1)) / Nz;
      pos.push(za, radius(za) * Math.cos(th), radius(za) * Math.sin(th), zb, radius(zb) * Math.cos(th), radius(zb) * Math.sin(th));
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  var mat = new THREE.LineBasicMaterial({ color: new THREE.Color(cssVar("--muted", "#8a8f98")), transparent: true, opacity: 0.55 });
  var lines = new THREE.LineSegments(geo, mat);

  var ringPos = [];
  for (var r2 = 0; r2 < 100; r2++) {
    var p0 = (r2 / 100) * Math.PI * 2, p1 = ((r2 + 1) / 100) * Math.PI * 2;
    ringPos.push(0, a * Math.cos(p0), a * Math.sin(p0), 0, a * Math.cos(p1), a * Math.sin(p1));
  }
  var ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(ringPos, 3));
  var ringMat = new THREE.LineBasicMaterial({ color: new THREE.Color(cssVar("--indigo", "#5e6ad2")), transparent: true, opacity: 0.85 });
  var ring = new THREE.LineSegments(ringGeo, ringMat);

  var group = new THREE.Group();
  group.add(lines); group.add(ring);
  group.rotation.z = 0.16;
  scene.add(group);

  function setFog() { scene.fog = new THREE.Fog(new THREE.Color(cssVar("--bg", "#08090a")), 5, 14); }
  setFog();

  function resize() { var w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener("resize", resize);

  new MutationObserver(function () {
    mat.color.set(cssVar("--muted", "#8a8f98")); ringMat.color.set(cssVar("--indigo", "#5e6ad2")); setFog(); render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  /* ---------------------------- INTERACTION --------------------------- */
  var _i = window.HERO_INIT || {};
  // initial framing: look into the large left funnel, tube receding right
  var orbitY = (_i.y != null ? _i.y : 0.98), orbitX = (_i.x != null ? _i.x : 0.05), velY = 0, velX = 0;
  group.rotation.z = (_i.z != null ? _i.z : 0.15);
  var px = 0, py = 0, tpx = 0, tpy = 0;                   // hover parallax (target/eased)
  var dragging = false, lastX = 0, lastY = 0, hover = false;
  var spin = 0;
  var baseSpin = reduce ? 0 : 0.0016, spinVel = baseSpin, targetOpacity = 0.55;

  function clampPitch(v) { return Math.max(-0.9, Math.min(0.9, v)); }

  canvas.addEventListener("pointerenter", function () { hover = true; });
  canvas.addEventListener("pointerleave", function () { hover = false; tpx = 0; tpy = 0; });
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true; lastX = e.clientX; lastY = e.clientY; velY = velX = 0;
    canvas.classList.add("grabbing");
    try { canvas.setPointerCapture(e.pointerId); } catch (s) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (dragging) {
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      velY = dx * 0.005; velX = dy * 0.005;
      orbitY += velY; orbitX = clampPitch(orbitX + velX);
      lastX = e.clientX; lastY = e.clientY;
    } else {
      var r = canvas.getBoundingClientRect();
      tpx = (e.clientX - r.left) / r.width - 0.5;
      tpy = (e.clientY - r.top) / r.height - 0.5;
    }
  });
  function endDrag(e) { if (!dragging) return; dragging = false; canvas.classList.remove("grabbing"); try { canvas.releasePointerCapture(e.pointerId); } catch (s) {} }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  var visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(host);

  function render() { renderer.render(scene, camera); }

  function frame() {
    if (visible) {
      // hover energises: faster spin + brighter lines
      spinVel += ((hover ? baseSpin * 2.2 : baseSpin) - spinVel) * 0.06;
      targetOpacity += ((hover ? 0.8 : 0.55) - targetOpacity) * 0.08;
      mat.opacity = targetOpacity;
      ringMat.opacity = hover ? 0.95 : 0.85;

      spin += spinVel;
      lines.rotation.x = spin;
      ring.rotation.x = -spin * 0.6;

      if (!dragging) {                                  // inertia after release
        orbitY += velY; orbitX = clampPitch(orbitX + velX);
        velY *= 0.93; velX *= 0.93;
      }
      px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;  // eased hover parallax

      group.rotation.y = orbitY + px * 0.45;
      group.rotation.x = orbitX + py * 0.3;
      render();
    }
    requestAnimationFrame(frame);
  }
  frame();   // loop runs for drag/hover even under reduced-motion (auto-spin is 0 there)

  window.SITE = window.SITE || {};
  window.SITE.hero3d = { renderer: renderer, scene: scene };
})();
```

Canvas CSS (in `styles.css`): `#hero-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; pointer-events:auto; cursor:grab; touch-action:pan-y; }` and `.grabbing { cursor:grabbing; }`.

> The wormhole geometry is OMMOD's own — a hyperboloid of revolution `r(z) = a·√(1 + (z/c)²)` rendered as `LineSegments` (`H=3.7, a=0.4, c=1.05, Nt=48 rings, Nz=32 meridians`). Do not swap it for a torus, a particle field, or an imported `.glb`. The throat ring is a separate 100-segment indigo `LineSegments`.

---

## LAYER 6b — SECONDARY MOTIF: rotating crypto-logo globe (`js/motifs.js`)

The **How It Works** section uses a procedural SVG globe: 26 grayscale logo SVGs placed on a Fibonacci sphere, with thin lines connecting each node to its 3 nearest neighbours (so it reads as a rotating network globe). `motifs.js` builds inline SVG into any `[data-motif]` host and exposes `window.SITE.motifs`; `main.js` rotates it on a rAF loop. The logos load from the project CDN under a single `LOGO_BASE`; the globe picks one per node. Paste the `globe` builder **verbatim** (helpers `el` / `svg`, the `LOGO_BASE` + `LOGOS` list, and `XLINK` precede it):

```js
var NS = "http://www.w3.org/2000/svg";
function el(t, a) { var n = document.createElementNS(NS, t); if (a) for (var k in a) n.setAttribute(k, a[k]); return n; }
function svg(vb, fill, par) {
  var s = el("svg", { viewBox: vb, fill: "none", "aria-hidden": "true" });
  if (fill) { s.style.width = "100%"; s.style.height = "100%"; }
  s.setAttribute("preserveAspectRatio", par || "xMidYMid meet");
  return s;
}
var LOGO_BASE = "https://cdn.5sdesign.art/projects/ommod/logos/";
// 46 logo filenames, sequential in render order: logo-01.svg … logo-46.svg
var LOGOS = [];
for (var n = 1; n <= 46; n++) LOGOS.push("logo-" + (n < 10 ? "0" + n : n) + ".svg");
var XLINK = "http://www.w3.org/1999/xlink";
function globe(host) {
  var s = svg("0 0 440 440", true, "xMidYMid meet"); s.style.color = "var(--muted)";
  var R = 158, cx = 220, cy = 220, BS = 19, dots = [], N = 26, gold = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i; dots.push([Math.cos(th) * r, y, Math.sin(th) * r, i]); }

  // links: connect each node to its 3 nearest neighbours (network → globe look)
  var links = [], seen = {};
  function d3(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
  for (var a = 0; a < N; a++) {
    var near = [];
    for (var b = 0; b < N; b++) if (b !== a) near.push([d3(dots[a], dots[b]), b]);
    near.sort(function (p, q) { return p[0] - q[0]; });
    near.slice(0, 3).forEach(function (p) {
      var lo = Math.min(a, p[1]), hi = Math.max(a, p[1]), k = lo + "-" + hi;
      if (!seen[k]) { seen[k] = 1; links.push([lo, hi]); }
    });
  }
  var lg = el("g", {});
  var linkEls = links.map(function (L) {
    var pa = dots[L[0]], pb = dots[L[1]], md = (((pa[2] + 1) / 2) + ((pb[2] + 1) / 2)) / 2;
    var ln = el("line", { x1: cx + pa[0] * R, y1: cy - pa[1] * R, x2: cx + pb[0] * R, y2: cy - pb[1] * R, class: "globe-link", "stroke-width": 0.6, opacity: (0.05 + md * 0.3).toFixed(3) });
    lg.appendChild(ln); return { el: ln, a: L[0], b: L[1] };
  });
  s.appendChild(lg);

  var g = el("g", {}), nodes = dots.map(function (d) {
    var depth = (d[2] + 1) / 2, size = BS * (0.55 + depth * 0.75);
    var href = LOGO_BASE + LOGOS[Math.floor(d[3] * LOGOS.length / N)];
    var im = el("image", { x: cx + d[0] * R - size / 2, y: cy - d[1] * R - size / 2, width: size, height: size, opacity: (0.3 + depth * 0.7).toFixed(3), class: "globe-logo", preserveAspectRatio: "xMidYMid meet" });
    im.setAttribute("href", href); im.setAttributeNS(XLINK, "xlink:href", href);
    g.appendChild(im); return im;
  });
  s.appendChild(g); host.appendChild(s);
  return { svg: s, dots: dots, nodes: nodes, links: linkEls, R: R, cx: cx, cy: cy, BS: BS };
}
```

`main.js` rotates the globe (rAF, paused offscreen via IntersectionObserver) — `ang += 0.0028` per frame, projecting each dot through `cos/sin` of the angle, sizing nodes by depth (`BS * (0.55 + depth * 0.75)`) and fading links by mid-depth. Use the rotation loop verbatim from Layer 8.

> The globe is one of several builders in `motifs.js` (a `[data-motif="globe"]` host triggers it). Set both `href` and `xlink:href` on each `<image>` for compatibility; each points at a CDN URL (`https://cdn.5sdesign.art/projects/ommod/logos/logo-NN.svg`).

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`index.html` order: no-flash theme script in `<head>` → loader → header → mobile nav overlay → `<main class="stack" id="top">` with 10 `<section>`s → vendor scripts → site scripts. The whole `<main>` is one bordered card (`.stack`); each section is a full-viewport (`min-height: 100svh - frame`) flex column separated by a hairline. `.auto-h` sections shrink to content.

### No-flash theme script (inline in `<head>`, before stylesheets)

```html
<script>
  (function () {
    try {
      var KEY = 'ommod-theme';
      var mode = localStorage.getItem(KEY) || 'dark';
      var sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
      var dark = mode === 'dark' || (mode === 'system' && sysDark);
      var r = document.documentElement;
      r.classList.toggle('light', !dark);
      r.style.colorScheme = dark ? 'dark' : 'light';
    } catch (e) {}
  })();
</script>
```

### LOADER

A fixed full-screen `var(--bg)` overlay with a 48px SVG ring: a static track circle (`stroke: var(--border)`, `stroke-width: 2`, `r: 22`) under a spinning arc (`stroke: var(--line)`, `stroke-dasharray: 34 110`, `stroke-linecap: round`, 1.1s linear spin). Fades out (`opacity 0`, `.5s`) ~250ms after `window.load`, hard-removed at 600ms; 3s safety timeout. CSS: `.loader { position:fixed; inset:0; z-index:var(--z-loader); display:grid; place-items:center; background:var(--bg); transition:opacity .5s var(--ease-out); }` `.loader.is-done { opacity:0; pointer-events:none; }`.

### HEADER (`.site-header`) — floating bordered bar

- `position: fixed; top/left/right: var(--frame-inset)` so it floats inside the 16px frame; `height: 64px`; `background: var(--surface-1)`; `border: 1px solid var(--line)`; `border-radius: var(--radius-btn)`; `box-shadow: var(--shadow-depth)`. The `.stack` below uses a negative `-1px` top margin so its top border overlaps the header's bottom border into a single seam.
- Grid columns (≥1024px): `logo | wordmark | (gap) | nav | theme-toggle`. Below 1024px: `logo | wordmark | burger`. Every header child after the first has a `border-left: 1px solid var(--line)` (the cells are seamed by the same hairline).
- **Logo** (`.hdr-logo`, `href="#top"`): inline SVG — 26px circle ring + check mark, `currentColor` (snow). `aria-label="OMMOD home"`.
- **Wordmark** (`.hdr-wordmark`, `href="#top"`): text **`OMMOD`**, `font-display`, weight 590, `1.0625rem`, `letter-spacing: -0.01em`.
- **Nav** (`.hdr-nav`, hidden <1024px): four `.navlink`s — **`Why OMMOD`** (`#why`), **`Architecture`** (`#solution`), **`Use Cases`** (`#usecases`), **`Contact`** (`#contact`). Color `--muted` → `--text` + `surface-2` bg on hover.
- **Theme toggle** (`.hdr-theme`, `data-theme-toggle`, `aria-label="Toggle color theme"`): inline SVG half-filled circle (sun/moon), 20px, `--muted` → `--text` on hover.
- **Burger** (`.hdr-burger`, `data-nav-open`, shown <1024px): two-line hamburger SVG.

### MOBILE NAV OVERLAY (`#navOverlay`)

Full-screen `var(--bg)` overlay, opened via `clip-path: inset(0 0 100% 0)` → `inset(0 0 0% 0)` over `.55s var(--ease-inout)`. Top bar: wordmark **`OMMOD`** + close X. Links (big, `font-display` w300, `clamp(2rem,1.4rem+5vw,3.25rem)`), each with a mono index and indent-on-hover:
`01 Why OMMOD` (`#why`) · `02 Architecture` (`#solution`) · `03 Use Cases` (`#usecases`) · `04 Contact` (`#contact`).
Footer row (mono, `--muted`): `hello@ommod.xyz` · `·` · `@ommod`.

### SECTION 1 — HERO (`#hero`)

Two stacked blocks: a 3D **stage** on top, a split **band** below.

- **`.hero__stage`** (`flex: 1`, `min-height: clamp(280px,40vh,440px)`, `place-items: center`): a faint 64px square **grid background** (two `repeating-linear-gradient`s in `color-mix(--line 60%, transparent)`) masked by a radial fade. Inside, `.hero__motif` holds `<canvas id="hero-canvas">` (the Three.js wormhole, Layer 6) and a hidden `<img class="hero__fallback" src="https://cdn.5sdesign.art/projects/ommod/image/image-02.png" decoding="async" hidden>`.
- **`.hero__band`** (bleed-hairline grid, `1fr 1fr` ≥768px; headline spans both rows on the left, copy + CTA on the right):
  - **Headline cell** (`.cell.headline`): eyebrow **`RWA Oracle Module`** (`.eyebrow.reveal`), then `<h1 class="display">` with two `.hero__line` spans:
    - `Real-world value,`
    - `verifiable on-chain.`
  - **Copy cell** (`.cell.copy`): `<p class="lead reveal">` — verbatim:
    `OMMOD is the oracle module for tokenized real-world assets — delivering prices, NAV, and proof-of-reserves on-chain, backed by signed attestations and cryptographic proofs, not trust.` (the phrase **prices, NAV, and proof-of-reserves** is wrapped in `<strong>`.)
  - **CTA cell** (`.cell.hero__cta-cell.split2`, two 1fr cells split by a hairline): two `.btn-bar.primary` (white fill):
    - **`Start Building →`** (`href="#solution"`)
    - **`Read the Docs →`** (`href="#how"`)

### SECTION 2 — THE PROBLEM (`#problem`)

- A `.split.reverse` (`1fr 1fr` ≥768px; media on the left via `order: 2` on first cell at desktop):
  - **Media cell** (`.pane--media`): `https://cdn.5sdesign.art/projects/ommod/image/image-01.png`, `object-fit: contain`, static (no parallax).
  - **Text cell** (`.pane`): eyebrow **`The Problem`**, `<h2 class="h1">` **`Real-world data`** `<br>` **`lives off-chain.`**, body — verbatim:
    `Tokenized treasuries, credit, and commodities depend on prices, NAV, and reserves that sit in off-chain systems. Pushing that data on-chain through trusted relayers makes it the weak link — opaque, stale, and impossible to verify.` (`Pushing that data on-chain through trusted relayers makes it the weak link` in `<strong>`.)
- Below, a `.grid-bleed` band (single column, `border-top: 1px solid var(--line)`): a body line —
  `Billions in tokenized RWAs already settle on data no one can verify on-chain. The feed you trust is the door risk walks through.` (first sentence `<strong>`) — beside a **`Read the Docs →`** `.btn-bar.primary` cell (`href="#how"`).

### SECTION 3 — STATS (`#stats`, `.auto-h`)

A `.stats` bleed-grid, three cells ≥768px. Each: a big light number (`.num`, w300, `clamp(2.2rem,1.6rem+2.6vw,3.5rem)`) + a `.lbl` (`--muted`, 14px):
- **`$10B+`** — `Real-world assets tokenized on-chain`
- **`0`** — `Trusted middlemen in the data path`
- **`100%`** — `Attestation-backed data points`

### SECTION 4 — ARCHITECTURE (`#solution`)

A `.split` (`1fr 1fr` ≥768px; text left, media right):
- **Text cell** (`.pane`): a mono chevron row `>>>>` (`.chevrow`), eyebrow **`The Solution`**, `<h2 class="h1">` **`Attest first.`** `<br>` **`Feed after.`**, body — verbatim:
  `OMMOD is a verification layer for real-world data. Prices, NAV, and reserves are signed at the source and proven on-chain — so protocols consume RWA data with cryptographic certainty, not committee trust.` (`cryptographic certainty, not committee trust.` in `<strong>`.)
  Then a `.deflist` of three numbered rows (mono `.n` index + `.k` title + `.v` body):
  - **`01 Consumers`** — `Protocols, vaults, and apps query OMMOD for verified prices, NAV, and reserve attestations — with no oracle infrastructure of their own.`
  - **`02 OMMOD core`** — `The module verifies signed attestations and proofs from data providers, then publishes cryptographically certain results to any chain.`
  - **`03 Data sources`** — `Custodians, auditors, and market venues sign attestations at the source; OMMOD proves them before anything reaches the chain.`
- **Media cell** (`.pane--media`): `https://cdn.5sdesign.art/projects/ommod/image/section-01.png`, `object-fit: cover` (fills, no gaps), static.

### SECTION 5 — WHY OMMOD (`#why`, `.auto-h`)

A `.features__split` (`1fr 1fr` ≥768px):
- **Left** (`.stackwords`): eyebrow **`Why OMMOD`**, a big uppercase stack (`.big`, w300, `clamp(2.2rem,1.5rem+3.4vw,4rem)`): **`Proof`** `<br>` **`over`** `<br>` **`trust`**, then body (`max-width: 34ch`):
  `OMMOD removes the weakest link in real-world data — the trusted middleman. Every price and reserve is proven from a signed source, not vouched for by a committee.`
- **Right** (`.fgrid.three`, fills column height): three `.fcard`s, each with a 34px `.motif-stroke` icon (1px line art), a `.ft` title, a `.fd` body, and a mono `.fnum`:
  - icon: circle + check → **`Proof over trust`** — `Every data point carries a signed attestation and on-chain proof from its source — verifiable, never just vouched for.` — `01 / Verification`
  - icon: shield + check → **`Source-grade data`** — `Prices, NAV, and reserves come straight from custodians, auditors, and market venues — with no relayer in between.` — `02 / Accuracy`
  - icon: two squares + dashed link → **`Zero infrastructure`** — `Plug the module in. No oracle network, no node operators, and no custom feeds to maintain.` — `03 / Simplicity`

### SECTION 6 — USE CASES (`#usecases`, `.auto-h`)

- Intro cell (`background: var(--bg)`, `border-bottom: 1px solid var(--line)`): eyebrow **`Use Cases`**, `<h2 class="h1">` **`Build on verified real-world data.`**, body (`max-width: 60ch`):
  `Price tokenized assets, prove reserves, and feed audited data into DeFi — all backed by attestations instead of intermediaries.`
- `.fgrid.three` (fills): three `.fcard`s, each with a mono `.tag`, a `.ft` title, a `.fd` body, and a bottom-aligned 40px `.motif-stroke` icon:
  - tag **`Pricing`** → **`Asset Pricing`** — `On-chain prices and NAV for tokenized treasuries, credit, real estate, and commodities — proven from market sources.` (icon: rising line + indigo `.node-dot.on`)
  - tag **`Reserves`** → **`Proof of Reserves`** — `Verify backing for stablecoins and tokenized funds with signed, on-chain reserve attestations — refreshed at the source.` (icon: shield + check)
  - tag **`DeFi`** → **`Collateral & Risk`** — `Feed verified RWA data into lending markets, vaults, risk engines, and structured products with confidence.` (icon: clock/dial)

### SECTION 7 — HOW IT WORKS (`#how`)

- Intro cell: eyebrow **`How It Works`**, `<h2 class="h1">` **`Proof, not trust — from source to chain.`**
- A `.termwrap` (`1fr 1fr` ≥768px):
  - **Left** (`.dotglobe`, `surface-1`): the rotating crypto-logo globe (`<div class="fill" data-motif="globe">`, Layer 6b) with an absolutely-positioned `.chip` (`left:6% bottom:16%`): `One verified data layer` / `Every asset, proven from the source.`
  - **Right** (`.terminal`, mono, `surface-1`): a fake terminal. Title bar `ommod verify` with three status dots (first emerald `.on`). Twelve numbered `.tline`s (mono `.ln` line number + content), indigo `<step>` tags `.st`, `.tk` keywords — verbatim:
    ```
    01  <01> attest
    02  a provider signs an asset's price, NAV, or
    03  reserves at the source — no relayer in path.
    04
    05  <02> prove
    06  OMMOD verifies the signature and proof,
    07  binding the data to its origin.
    08
    09  <03> publish
    10  the verified value is delivered on-chain
    11  for any protocol to consume.
    12  ────────────────────────  verified ▸
    ```
    (Render `<01>`/`<02>`/`<03>` as `&lt;01&gt;` etc. in `.st` indigo; `attest`/`prove`/`publish` in `.tk` snow.)

### SECTION 8 — ECOSYSTEM (`#ecosystem`, `.auto-h`)

An `.eco` grid (`1fr 1fr` ≥768px):
- **Intro** (`.eco__intro`): eyebrow **`Ecosystem`**, `<h2 class="h2">` **`Building the standard`** `<br>` **`for real-world data on-chain.`**, body:
  `We work with custodians, auditors, RWA issuers, and DeFi protocols to bring cryptographic verification to every real-world data point — removing trusted intermediaries from how value is priced and proven on-chain.`
- **Right** (`.eco__logos`, 2 cols mobile / 3 cols ≥768px, fills): six `.lg` cells, each a grayscale logo `<img>` (`grayscale(1) brightness(1.12) contrast(1.02)`, ~0.8 opacity, brighten on hover; light theme uses `brightness(0.85) contrast(1.05)`):
  `https://cdn.5sdesign.art/projects/ommod/logos/logo-01.svg`, `.../logo-09.svg`, `.../logo-17.svg`, `.../logo-20.svg`, `.../logo-23.svg`, `.../logo-33.svg`.

> These six are placeholder partner marks; swap in real custodian/issuer logos when available.

### SECTION 9 — CONTACT (`#contact`, `.auto-h`)

A `.contact` grid (`1fr 1fr` ≥768px):
- **Info** (`.contact__info`): eyebrow **`Contact`**, `<h2 class="h2">` **`Contact us`**, body:
  `Questions, integrations, or partnership ideas — we'd love to hear from you.`
  Then a mono `.meta` block: `Email · hello@ommod.xyz` and `X · @ommod` (the addresses are `<a>`s; hover → indigo).
- **Form** (`.form`, a bordered hairline grid, `1fr 1fr`, fields seamed by `--line`; `action="#"`, `onsubmit="return false"` — not wired to a backend): mono uppercase labels with bare inputs (no field borders; focus shows `inset 0 0 0 1px var(--indigo)` on the label):
  - `First Name` / `Last Name` (half-width each)
  - `Email` / `Subject` / `Message` (full-width; Message is a `<textarea>` min-height 130px)
  - submit cell: **`Send Message →`** `.btn-bar.primary`

### SECTION 10 — FOOTER (`.footer`, `.auto-h`)

A `.footer__grid` (`1fr 1fr` ≥768px):
- **Brand** (`.footer__brand`): lockup (30px logo SVG + wordmark **`OMMOD`**, `clamp(1.4rem,1rem+2vw,2.25rem)`), body:
  `The oracle module for real-world assets — verifying prices, NAV, and reserves on-chain so value is priced and proven without trusted intermediaries.`
  and a bottom eyebrow **`Real-world value, verifiable on-chain.`**
- **Right**: `.footer__links` grid (2 cols ≥768px), each `<a>` with a `↗` arrow: `Why OMMOD` (`#why`), `Architecture` (`#solution`), `Use Cases` (`#usecases`), `Docs` (`#how`), `Contact` (`#contact`), `Start Building` (`#solution`). Below, `.footer__social`: X icon (`https://x.com/ommod`) + Email icon (`mailto:hello@ommod.xyz`).
- **Legal row** (`.footer__legal`, mono, `--faint`, `border-top: 1px solid var(--line)`): `© 2026 OMMOD` (year via JS) and `RWA Oracle Module`.

---

## LAYER 8 — ANIMATION STANDARDS

GSAP + ScrollTrigger run inside `gsap.matchMedia()` with three branches; Lenis is wired into the GSAP ticker. Standard ease for reveals is **`"expo.out"`**.

**Lenis + GSAP sync (`js/scroll.js`):**

```js
var lenis = new Lenis({
  duration: 1.05,
  easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
  smoothWheel: true, touchMultiplier: 1.2, wheelMultiplier: 1.0,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

Anchor links scroll via `lenis.scrollTo(target, { offset: -96, duration: 1.2 })`. Disabled entirely under `prefers-reduced-motion`.

**Hero entrance timeline (desktop/tablet, `js/main.js`):**

```js
var EASE = "expo.out";
var tl = gsap.timeline({ defaults: { ease: EASE } });
tl.from(".hero .eyebrow", { y: 18, opacity: 0, duration: .6 })
  .from(".hero__line", { yPercent: 115, opacity: 0, stagger: .1, duration: 1 }, "-=.3")
  .from(".hero .copy", { y: 24, opacity: 0, duration: .7 }, "-=.7")
  .from(".hero__cta-cell", { y: 18, opacity: 0, duration: .5 }, "-=.5");
```

**Scroll reveals:** every `.reveal` in a non-hero section fades up (`y:40, opacity:0 → 0`, `duration:.9, stagger:.08, ease:expo.out`) on `ScrollTrigger { trigger: sec, start: "top 72%" }`. Mobile uses a tighter version (`y:26, duration:.6, stagger:.06, start "top 86%"`). Reduced-motion clears all transforms to the static state.

**Parallax guards (important):** the hero `.hero__motif` gets a `yPercent: -12` scrub **only if it has no `img`, no `.wh-stretch`, and no `canvas`** — i.e. with the 3D canvas present, the hero does NOT parallax. Likewise `.pane--media .fill` gets a subtle `yPercent 8 → -8` scrub **only when it contains neither an `img` nor a `canvas`** — so the Problem/Architecture images stay perfectly static.

**Globe rotation (rAF, `js/main.js`):** paused offscreen via IntersectionObserver.

```js
var gl = m.globe, ang = 0;
(function roll() {
  if (visible) {
    ang += 0.0028; var ca = Math.cos(ang), sa = Math.sin(ang);
    var P = [];
    for (var i = 0; i < gl.dots.length; i++) {
      var d = gl.dots[i], x = d[0] * ca + d[2] * sa, z = -d[0] * sa + d[2] * ca, depth = (z + 1) / 2;
      var sx = gl.cx + x * gl.R, sy = gl.cy - d[1] * gl.R;
      P.push({ sx: sx, sy: sy, depth: depth });
      var n = gl.nodes[i], size = gl.BS * (0.55 + depth * 0.75);
      n.setAttribute("x", sx - size / 2); n.setAttribute("y", sy - size / 2);
      n.setAttribute("width", size); n.setAttribute("height", size);
      n.setAttribute("opacity", 0.28 + depth * 0.72);
    }
    for (var L = 0; L < gl.links.length; L++) {
      var lk = gl.links[L], pa = P[lk.a], pb = P[lk.b], md = (pa.depth + pb.depth) / 2;
      lk.el.setAttribute("x1", pa.sx); lk.el.setAttribute("y1", pa.sy);
      lk.el.setAttribute("x2", pb.sx); lk.el.setAttribute("y2", pb.sy);
      lk.el.setAttribute("opacity", (0.05 + md * 0.3).toFixed(3));
    }
  }
  requestAnimationFrame(roll);
})();
```

**Theme controller (`js/theme.js`):** toggles `.light` on `<html>`, persists to `localStorage['ommod-theme']`, updates `<meta name="theme-color">` (`#08090a` dark / `#ffffff` light), and reacts to system changes when mode is `system`. The hero3d `MutationObserver` re-reads CSS vars so the wormhole recolors instantly on toggle.

- **No** typewriter, counters, or page-load splash beyond the loader spinner. The only continuous motion is the wormhole spin and the globe rotation; everything else is scroll-triggered once.

---

## LAYER 9 — RESPONSIVE STANDARDS

- **Mobile-first.** Base layout is single-column bleed grids; `@media (min-width: 768px)` upgrades the big splits to `1fr 1fr` and `@media (min-width: 1024px)` reveals the desktop header (logo | wordmark | nav | theme) and hides the burger.
- All section headlines use `clamp()` — never fixed display sizes (see the `--fs-*` scale in Layer 3).
- Sections are `min-height: calc(100svh - header - frame*3)` so each fills the viewport; `.auto-h` sections (Stats, Why, Use Cases, Ecosystem, Contact, Footer) shrink to content.
- ≥768px: hero band, splits, features, stats (3-col), ecosystem, contact, footer all go side-by-side with aligned center seams. <768px: everything stacks; form collapses to one column; vertical labels (if any) go horizontal; hero motif widens to `94vw`.
- The 16px `--frame-inset` keeps the whole `.stack` card off the edges at every width; the floating header sits inside the same inset.
- Touch: the wormhole canvas uses `touch-action: pan-y` so vertical scroll still works while horizontal drag orbits it.

---

## LAYER 10 — ICON SET

All icons are **inline SVG line art**, not an icon font or library. Two visual languages:

- **UI chrome icons** (header/footer): logo (circle + check), theme half-circle, hamburger, close X, X/Twitter glyph, email envelope — `currentColor`, 20–30px.
- **Motif icons** (feature/use-case cards): drawn with `.motif-stroke` (`stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke`), optionally `.dash`. Accent dots use `.node-dot` (hollow) / `.node-dot.on` (indigo fill). Card icons inherit `--muted` and brighten to `--text` on card hover.

Do not import lucide/heroicons/font-awesome. Every glyph is hand-drawn SVG so it stays monochrome and on the `--line` system.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Swap the stack for React/Vue/Tailwind/a bundler — this is **vanilla HTML/CSS/JS, no build step**, with self-hosted GSAP / ScrollTrigger / Lenis / Three.js in `vendor/`.
- Introduce a second hairline color. There is exactly **one** `--line` (`#282c33` dark / `#e3e5e9` light) for every border, divider, grid seam, and motif stroke.
- Make the primary CTA colored — `.btn-bar.primary` is a **white (snow) fill with black text**. Lime (`#e4f222`) appears only in the favicon check and `::selection`; indigo (`#5e6ad2`) is decorative only.
- Round colors ("near-black" is not `#08090a`; the canvas is exactly `#08090a`, lines exactly `#282c33`).
- Substitute fonts — body/display is **Inter** (300/400/510/590), mono is **JetBrains Mono**.
- Replace the Three.js wormhole with a different shape, a particle field, or an imported model. It is a wireframe hyperboloid `r(z)=a·√(1+(z/c)²)` as `LineSegments`, with a separate indigo throat ring, drag-to-orbit + inertia + hover-energize, `cssVar`-driven colors, and a `https://cdn.5sdesign.art/projects/ommod/image/image-02.png` no-WebGL fallback.
- Drop the parallax guards — the 3D hero and the `<img>` media panels must stay **static** (parallax only applies to pure-SVG/canvas-less media).
- Reword or shorten copy. The hero is `Real-world value, verifiable on-chain.`; the headings are `Attest first. / Feed after.`, `Real-world data / lives off-chain.`, etc. — verbatim.
- Change the stat values (`$10B+`, `0`, `100%`) or the deflist/terminal text.
- Rename or rehost the logo set — all 46 marks load from the project CDN as `https://cdn.5sdesign.art/projects/ommod/logos/logo-NN.svg` (`logo-01` … `logo-46`); set both `href` + `xlink:href` on globe `<image>`s.
- Skip the no-flash inline theme script — it prevents a light/dark flash on load.

If a constraint conflicts with a runtime/browser limit, clamp to the nearest valid value and leave a comment — do not silently change.

---

## FILE TREE (exact output expected)

```
OMMOD/
├── index.html              # no-flash theme script, SEO meta + Org JSON-LD, 10 sections
├── css/
│   ├── tokens.css          # Layer 3 verbatim (dark :root + light :root.light)
│   └── styles.css          # Layer 4 + all component blocks (Layer 7), responsive, reduced-motion
├── js/
│   ├── theme.js            # dark/light toggle, key 'ommod-theme', updates theme-color
│   ├── motifs.js           # SVG motif builders → window.SITE.motifs (globe is the live one)
│   ├── scroll.js           # Lenis + ScrollTrigger sync, loader fade, anchor scroll
│   ├── main.js             # GSAP reveals + hero timeline + globe rAF + mobile nav + parallax guards
│   └── hero3d.js           # Layer 6 verbatim — Three.js wireframe-wormhole hero
├── vendor/                 # gsap.min.js, ScrollTrigger.min.js, lenis.min.js, three.min.js (self-host)
└── assets/
    └── favicon.svg         # onyx square, snow ring, lime check (Layer 5)
```

The three section PNGs and the 46 logo SVGs are hosted on the project CDN — the images at `https://cdn.5sdesign.art/projects/ommod/image/image-01.png` / `image-02.png` / `section-01.png`, the logos at `https://cdn.5sdesign.art/projects/ommod/logos/logo-01.svg` … `logo-46.svg` (sequential, render order). No local image folders ship in the build.

Script load order (end of `<body>`):

```html
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="vendor/lenis.min.js"></script>
<script src="vendor/three.min.js"></script>
<script src="js/theme.js"></script>
<script src="js/motifs.js"></script>
<script src="js/scroll.js"></script>
<script src="js/main.js"></script>
<script src="js/hero3d.js"></script>
```

---

## DELIVERY CHECKLIST

- [ ] Plain static project — no `package.json`, no bundler. Serve with any static server.
- [ ] `vendor/` holds self-hosted `gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`, `three.min.js` (no runtime CDN).
- [ ] `index.html` loads Inter + JetBrains Mono, sets `<title>OMMOD — RWA Oracle Module`, `theme-color #08090a`, canonical/OG/JSON-LD for `ommod.xyz`.
- [ ] No-flash inline theme script runs in `<head>` before stylesheets.
- [ ] `tokens.css` pasted verbatim (dark `:root` + light `:root.light`); one `--line` value everywhere.
- [ ] Bleed-hairline grid primitive used throughout: container `gap:1px; background:var(--line)`, cells `background:var(--bg)`.
- [ ] Header is a floating bordered bar; `.stack` overlaps it by `-1px` into one seam.
- [ ] Hero: faint masked grid bg + Three.js wormhole canvas (drag-orbit, hover-energize, indigo throat ring) + `https://cdn.5sdesign.art/projects/ommod/image/image-02.png` fallback; two white CTAs.
- [ ] 10 sections in order: Hero → Problem → Stats → Architecture → Why → Use Cases → How It Works → Ecosystem → Contact → Footer.
- [ ] All copy verbatim; stats `$10B+ / 0 / 100%`; terminal `attest → prove → publish`.
- [ ] All logos load from the project CDN (`https://cdn.5sdesign.art/projects/ommod/logos/logo-01.svg … logo-46.svg`); How It Works globe = 26 grayscale logos on a Fibonacci sphere, 3-nearest-neighbour links, rotating (rAF, offscreen-paused); Ecosystem = 6 fixed grayscale logos (`logo-01/09/17/20/23/33`).
- [ ] Parallax guards in place: 3D hero + `<img>` panels stay static.
- [ ] Theme toggle persists to `ommod-theme`; wormhole recolors on toggle via MutationObserver.
- [ ] `prefers-reduced-motion`: animations off, loader hidden, static states shown; Lenis disabled.
- [ ] Primary CTA is white-fill/black-text; lime only on favicon + selection; indigo decorative only.

## Picway Photo-Memory Hero Prompt

Light editorial hero on a pure-white canvas with one apricot dawn glow. Serif display headline + a full-bleed, draggable WebGL ring of memory cards (ogl) that loops infinitely. Hero + Navbar + MobileMenu + Logo + the gallery.

---

## LAYER 1 — OPENING DECLARATION

Build a **single-screen hero page** for **Picway** — a photo-memory service, *"a daylight home for your photos."* The page is one hero: a sticky navbar, a centered serif headline + subtitle, and below them a **full-bleed WebGL circular gallery** of memory cards that the visitor drags or scrolls to rotate.

Use the following **pinned** tech stack (do not substitute):

- **React 18 + Vite 5** — **TypeScript** (`.tsx`), with one `.jsx` file allowed (the gallery).
- **Tailwind CSS 3** with a custom `tailwind.config.js` theme (tokens in Layer 3). Not Tailwind v4, not a CSS-only `@theme` block.
- **`framer-motion` v11** — hero entrance + the mobile-menu slide-in (`import { motion, AnimatePresence } from 'framer-motion'`).
- **`ogl` v1** — the WebGL renderer behind the circular gallery (Layer 6). This is the only 3D/canvas dependency. Do not add three.js, react-three-fiber, or a shader library.
- **`lucide-react`** — exactly two icons: `Menu` and `X`.

`tsconfig.json` must set `"allowJs": true` and `"checkJs": false` so the single `.jsx` gallery component imports cleanly inside a strict-TypeScript project. Mount `<App />` **inside** `React.StrictMode` in `src/main.tsx` — the gallery's `useEffect` returns a real cleanup (`app.destroy()`), so the dev double-mount is safe.

The aesthetic is **editorial daylight** — a calm, light-editorial feel on a **Pure White** (`#ffffff`) canvas, near-black **Ink** (`#17191c`) type, and a **single** warm rest: an **Apricot Wash** (`#fbe1d1`) radial *dawn glow* behind the headline, used **only** in the hero. The display headline is a literary serif at regular weight on a tight `1.08` line-height and `-0.025em` tracking; the body voice is a neutral sans (`Inter`) with a global `-0.009em` letter-spacing.

**Do not:** add a dark hero, a second accent color, gradients on the page background, card borders or elevation in the hero, a hero CTA (the navbar pill is the only filled button on the screen), drop shadows beyond the single signature card shadow, emoji, or AI-default accents like `bg-blue-500`. There is exactly **one** filled Ink button per screen.

---

## LAYER 2 — FONTS

Load two families from Google Fonts in `index.html` `<head>` (preconnect first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
  rel="stylesheet"
/>
```

Role mapping (registered as Tailwind families in Layer 3):

| Role | Family | Tailwind class |
|---|---|---|
| Body / UI / wordmark / nav | **Inter** (400–800) | `font-sohne` |
| Display serif (hero headline **only**) | **Source Serif 4** (optical 8–60, w400/600) | `font-signifier` |

The hero headline uses **Source Serif 4** at `fontWeight: 400`. Everything else — subtitle, nav links, wordmark, buttons, the gallery card labels — uses **Inter**. The gallery's canvas labels are drawn at `bold 30px Inter` (Layer 6). Keep Inter restrained: the heaviest UI weight on screen is `font-semibold` (600) on the wordmark; nav links and buttons are `font-medium` (500). Do not push body text heavier.

> The Tailwind family is named `font-sohne` and the serif `font-signifier` for legacy parity with the design tokens — they resolve to Inter and Source Serif 4 respectively. Keep the class names; only the resolved families matter.

---

## LAYER 3 — DESIGN TOKENS (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17191c',
        'pure-white': '#ffffff',
        fog: '#f7f7f8',
        ash: '#4c4c4c',
        graphite: '#777b86',
        dove: '#a3a6af',
        slate: '#8b8c8d',
        rust: '#5d2a1a',
        'apricot-wash': '#fbe1d1',
        'sky-wash': '#d3e3fc',
      },
      fontFamily: {
        signifier: ['"Source Serif 4"', 'Georgia', 'serif'],
        sohne: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        steep:
          'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
}
```

Color roles:

| Token | Hex | Role |
|---|---|---|
| `ink` | `#17191c` | text, logo, the single filled CTA |
| `pure-white` | `#ffffff` | canvas, navbar, mobile sheet |
| `fog` | `#f7f7f8` | secondary surface / hover fill |
| `ash` | `#4c4c4c` | subtitle / secondary body text |
| `graphite` | `#777b86` | tertiary text |
| `dove` | `#a3a6af` | hairline borders / dividers |
| `slate` | `#8b8c8d` | reserved muted text |
| `rust` | `#5d2a1a` | warm accent (reserved) |
| `apricot-wash` | `#fbe1d1` | the hero dawn glow (hero only) |
| `sky-wash` | `#d3e3fc` | cool wash (reserved) |

The signature `shadow-steep` is a three-layer card shadow (1px hairline ring + a deep 20px drop + a tight 8px drop). It is reserved for elevated surfaces; the hero itself stays flat — keep it in the token set, do not paint it onto hero text.

---

## LAYER 4 — ROOT CSS + TOKENS (`src/index.css`)

Paste **verbatim** — the `:root` variables, the global body voice, and the float keyframe are the design DNA. (`@tailwind base/components/utilities` at the top.)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Colors */
  --color-ink: #17191c;
  --color-pure-white: #ffffff;
  --color-fog: #f7f7f8;
  --color-ash: #4c4c4c;
  --color-graphite: #777b86;
  --color-dove: #a3a6af;
  --color-slate: #8b8c8d;
  --color-obsidian: #000000;
  --color-rust: #5d2a1a;
  --color-apricot-wash: #fbe1d1;
  --color-sky-wash: #d3e3fc;

  /* Typography — families (Signifier -> Source Serif 4, Sohne -> Inter) */
  --font-signifier: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --font-sohne: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* Typography — scale */
  --text-caption: 14px;
  --text-body: 16px;
  --text-body-lg: 18px;
  --text-subheading: 22px;
  --text-heading-sm: 26px;
  --text-heading: 44px;
  --text-heading-lg: 64px;
  --text-display: 90px;

  /* Radii */
  --radius-cards: 24px;
  --radius-images: 12px;
  --radius-inputs: 16px;
  --radius-pill: 9999px;

  /* Signature three-layer card shadow */
  --shadow-steep: rgba(4, 23, 43, 0.05) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;

  /* Surfaces */
  --surface-canvas: #ffffff;
  --surface-fog: #f7f7f8;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sohne);
  color: var(--color-ink);
  background: var(--color-pure-white);
  letter-spacing: -0.009em;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Gentle float for the orbiting hero product cards */
@keyframes steepFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.steep-float {
  animation: steepFloat 7s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .steep-float {
    animation: none;
  }
  html {
    scroll-behavior: auto;
  }
}
```

---

## LAYER 5 — GALLERY ASSETS (8 builder-supplied memory photos)

The circular gallery shows **8 memory cards**. Each card is `{ image, text }`: a landscape photo plus a short label drawn onto the WebGL plane. The photos are **builder-supplied** — drop eight ~`800×600` (4:3) landscape JPEGs into `public/gallery/` and reference them by local path. Do **not** wire in external image URLs or stock CDNs; the array below names each slot by role and label so the builder fills it with their own photography:

```ts
/** Memory cards shown in the circular gallery. */
const GALLERY_ITEMS = [
  { image: '/gallery/golden-hour.jpg',   text: 'Golden Hour' },
  { image: '/gallery/city-lights.jpg',   text: 'City Lights' },
  { image: '/gallery/mountain-trail.jpg', text: 'Mountain Trail' },
  { image: '/gallery/beach-day.jpg',     text: 'Beach Day' },
  { image: '/gallery/birthday.jpg',      text: 'Birthday' },
  { image: '/gallery/road-trip.jpg',     text: 'Road Trip' },
  { image: '/gallery/first-snow.jpg',    text: 'First Snow' },
  { image: '/gallery/old-friends.jpg',   text: 'Old Friends' },
]
```

Labels are **verbatim**: `Golden Hour`, `City Lights`, `Mountain Trail`, `Beach Day`, `Birthday`, `Road Trip`, `First Snow`, `Old Friends`. The gallery duplicates the supplied list internally so the ring loops seamlessly — supply 8, the component shows 16.

**Favicon** (`public/favicon.svg`) — an Ink rounded-rect "photo frame" with a white sun and a white mountain line, the same mark as the wordmark logo:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="3" y="5" width="26" height="22" rx="6" fill="#17191c" />
  <circle cx="11" cy="13" r="2.6" fill="#ffffff" />
  <path d="M5.5 23.5 L13 15.5 L17.5 20 L22 14.5 L27 20.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

---

## LAYER 6 — SIGNATURE INTERACTION: WebGL circular gallery

The hero's interactive centerpiece. The 8 memory cards live on a curved, draggable ring rendered with **ogl**. Dragging or wheel-scrolling rotates the ring; it snaps to the nearest card on release and loops infinitely. Each plane carries a subtle wave displacement that intensifies with scroll speed, rounded corners via an SDF in the fragment shader, and a text label drawn below it on its own plane.

**Props the hero passes (the deployed configuration):**

```tsx
<CircularGallery
  items={GALLERY_ITEMS}
  bend={3}
  textColor="#17191c"
  borderRadius={0.05}
  scrollEase={0.02}
  font="bold 30px Inter"
/>
```

- `bend={3}` — the arc curvature of the ring (positive bends the cards downward into a smile).
- `textColor="#17191c"` — Ink labels, matching the page type.
- `borderRadius={0.05}` — rounded card corners in the SDF (normalized).
- `scrollEase={0.02}` — a slow, heavy lerp toward the scroll target (calm drift, not snappy).
- `font="bold 30px Inter"` — the canvas label font; size/weight are parsed and the family swapped in once loaded.

**Defaults (when a prop is omitted):** `bend = 3`, `textColor = '#ffffff'`, `borderRadius = 0.05`, `font = 'bold 30px Figtree'`, `scrollSpeed = 2`, `scrollEase = 0.05`. The component lazy-loads its label font on demand if the default font string is used.

**`CircularGallery.css`** (verbatim):

```css
.circular-gallery {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}

.circular-gallery:active {
  cursor: grabbing;
}
```

**`CircularGallery.jsx`** (verbatim — ogl renderer, the `Media`/`Title`/`App` classes, font loading, and the React wrapper):

```jsx
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './CircularGallery.css';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

const DEFAULT_FONT = 'bold 30px Figtree';
// Figtree is not guaranteed to be available on the host page, so the component
// loads it on demand whenever the default font is used.
const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap';

function deriveFontFamilyFromUrl(url) {
  const fileName = (url.split('/').pop() || 'custom-font').split('?')[0];
  const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
  return base.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'CircularGalleryFont';
}

async function loadFontFromStylesheet(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font stylesheet (${response.status})`);
  const cssText = await response.text();
  const faceBlocks = cssText.match(/@font-face\s*{[^}]*}/g) || [];
  let family = null;
  const fontFaces = [];
  for (const block of faceBlocks) {
    const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/);
    const urlMatch = block.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    if (!familyMatch || !urlMatch) continue;
    family = familyMatch[1].trim();
    const descriptors = {};
    const weightMatch = block.match(/font-weight:\s*([^;]+);/);
    const styleMatch = block.match(/font-style:\s*([^;]+);/);
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    if (weightMatch) descriptors.weight = weightMatch[1].trim();
    if (styleMatch) descriptors.style = styleMatch[1].trim();
    if (rangeMatch) descriptors.unicodeRange = rangeMatch[1].trim();
    fontFaces.push(new FontFace(family, `url(${urlMatch[1]})`, descriptors));
  }
  if (!family) throw new Error('No @font-face rule found in the stylesheet');
  await Promise.allSettled(
    fontFaces.map(async face => {
      await face.load();
      document.fonts.add(face);
    })
  );
  return family;
}

async function loadFontFromFile(url) {
  const family = deriveFontFamilyFromUrl(url);
  const fontFace = new FontFace(family, `url(${url})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  return family;
}

async function loadCustomFont(fontUrl) {
  const isStylesheet = fontUrl.includes('fonts.googleapis.com') || /\.css(\?.*)?$/i.test(fontUrl);
  return isStylesheet ? loadFontFromStylesheet(fontUrl) : loadFontFromFile(fontUrl);
}

// Loads `fontUrl` (a stylesheet such as a Google Fonts URL, or a direct font
// file) and returns a canvas-ready font string that keeps the size/weight from
// `font` but swaps in the freshly loaded family. Falls back to `font` on error.
async function resolveFont(font, fontUrl) {
  // Use the bundled Figtree stylesheet when the caller relies on the default
  // font, otherwise honor the explicit `fontUrl`.
  const effectiveUrl = fontUrl || (font === DEFAULT_FONT ? DEFAULT_FONT_URL : null);
  if (!effectiveUrl) {
    // A custom family was supplied without a URL – make sure it is ready (in
    // case the host page declares it) before we draw it to the canvas,
    // otherwise the first paint silently falls back to a system font.
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(font);
        await document.fonts.ready;
      } catch {
        // Ignore – fall back to whatever the browser provides.
      }
    }
    return font;
  }
  try {
    const family = await loadCustomFont(effectiveUrl);
    const sizeMatch = font.match(/^\s*(.*?\d+px)/);
    const prefix = sizeMatch ? sizeMatch[1].trim() : 'bold 30px';
    const resolved = `${prefix} "${family}"`;
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(resolved);
      } catch {
        // Ignore – we still attempt to render with the requested font.
      }
    }
    return resolved;
  } catch (error) {
    console.error('CircularGallery: unable to load font from', fontUrl, error);
    return font;
  }
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);

          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05
    } = {}
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const defaultItems = [
      { image: `/gallery/golden-hour.jpg`, text: 'Golden Hour' },
      { image: `/gallery/city-lights.jpg`, text: 'City Lights' },
      { image: `/gallery/mountain-trail.jpg`, text: 'Mountain Trail' },
      { image: `/gallery/beach-day.jpg`, text: 'Beach Day' },
      { image: `/gallery/birthday.jpg`, text: 'Birthday' },
      { image: `/gallery/road-trip.jpg`, text: 'Road Trip' },
      { image: `/gallery/first-snow.jpg`, text: 'First Snow' },
      { image: `/gallery/old-friends.jpg`, text: 'Old Friends' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousewheel', this.boundOnWheel);
    window.addEventListener('wheel', this.boundOnWheel);
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousewheel', this.boundOnWheel);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  fontUrl = undefined,
  scrollSpeed = 2,
  scrollEase = 0.05
}) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    let app;
    let isMounted = true;
    resolveFont(font, fontUrl).then(resolvedFont => {
      if (!isMounted || !containerRef.current) return;
      app = new App(containerRef.current, {
        items,
        bend,
        textColor,
        borderRadius,
        font: resolvedFont,
        scrollSpeed,
        scrollEase
      });
    });
    return () => {
      isMounted = false;
      if (app) app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase]);
  return <div className="circular-gallery" ref={containerRef} />;
}
```

> The component is self-contained: an ogl `Renderer` over a transparent canvas, a `Plane` geometry (`100×50` segments) per card, a wave-displacement vertex shader scaled by scroll speed, a rounded-box-SDF fragment shader, and a `Title` plane drawn from a 2D canvas texture. The `destroy()` cleanup removes every listener and the canvas — this is why mounting inside `React.StrictMode` is safe. The default item paths and label font are placeholders; the hero always passes real `items` and `font="bold 30px Inter"`.

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`src/App.tsx` renders a single component:

```tsx
import Hero from './components/Hero'

export default function App() {
  return <Hero />
}
```

`Hero.tsx` owns the full page: the menu open-state, the navbar, the mobile menu, the headline block, and the gallery.

### Shared nav labels (`src/components/nav.ts`)

```ts
/** Shared top-level navigation labels for Picway. */
export const NAV_LINKS = ['Gallery', 'Plans', 'Apps', 'Stories', 'Help'] as const
```

### The Logo mark (`src/components/Logo.tsx`)

A line-art "photo frame with a sun and mountains" in Ink. Paste verbatim:

```tsx
interface LogoProps {
  size?: number
}

/** Picway picture mark — a rounded photo frame with a sun and mountains. */
export default function Logo({ size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#17191c"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Picway"
      role="img"
    >
      <rect x="2.5" y="4" width="19" height="16" rx="4.5" />
      <circle cx="8" cy="9.5" r="1.9" />
      <path d="M3 18.5 L9 12.5 L13 16.5 L16.5 13 L21 17.5" />
    </svg>
  )
}
```

### SECTION 1 — Navbar (`src/components/Navbar.tsx`)

A **sticky**, blurred white bar with a hairline bottom border. Takes `menuOpen` + `onToggle` props from the hero.

- Wrapper: `<header className="sticky top-0 z-30 w-full border-b border-dove/40 bg-pure-white/85 backdrop-blur-md">`.
- Inner nav: `mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 sm:px-8`.
- **Left — logo + wordmark** (`<a href="#" className="flex items-center gap-2.5">`):
  - `<Logo size={26} />`
  - `<span className="font-sohne text-[18px] font-semibold tracking-[-0.02em] text-ink">Picway</span>`
- **Center — nav links** (desktop only, `hidden items-center gap-8 md:flex`): map `NAV_LINKS`, each `<a href="#" className="font-sohne text-[15px] font-medium text-ink transition-opacity hover:opacity-60">`.
- **Right — single filled CTA** (desktop only, `hidden md:flex`):
  - `<button type="button" className="rounded-full bg-ink px-5 py-2 font-sohne text-[15px] font-medium text-pure-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95">Start for free</button>`
- **Mobile toggle** (`md:hidden`): a `<button>` that calls `onToggle`, `aria-label` flips between `'Close menu'` / `'Open menu'`, `aria-expanded={menuOpen}`, rendering `{menuOpen ? <X size={24} /> : <Menu size={24} />}`.

### SECTION 2 — Mobile menu (`src/components/MobileMenu.tsx`)

A right-side slide-in sheet, wrapped in `AnimatePresence`. Takes `open` + `onClose`.

- **Backdrop** — `motion.div` `className="fixed inset-0 z-40"`, inline `backgroundColor: 'rgba(23,25,28,0.35)'` + `backdropFilter: 'blur(4px)'` (and `-webkit-`). `initial/animate/exit` opacity `0 → 1 → 0`, `transition={{ duration: 0.3 }}`, `onClick={onClose}`.
- **Sheet** — `motion.aside` `className="fixed right-0 top-0 z-50 flex flex-col bg-pure-white"`, inline `width: 'min(88vw, 360px)'`, `height: '100dvh'`, `boxShadow: '-12px 0 48px rgba(23,25,28,0.12)'`. Enters `initial={{ x: '100%' }}` → `animate={{ x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}`; exits `{ x: '100%', transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } }`.
  - **Header**: `flex items-center justify-between px-6 py-5` — the same `<Logo size={26} />` + `Picway` wordmark link (calls `onClose`), and a circular close button: `motion.button` `whileTap={{ scale: 0.9 }}`, `className="flex h-10 w-10 items-center justify-center rounded-full text-ink"`, inline `backgroundColor: 'rgba(23,25,28,0.06)'`, holding `<X size={20} />`.
  - **Divider**: `<div className="mx-6 h-px bg-dove/50" />`.
  - **Links**: `<nav className="flex flex-col gap-1 px-4 py-6">` — each link is a `motion.a` that staggers in `initial={{ opacity: 0, x: 24 }}` → `animate={{ opacity: 1, x: 0 }}`, `transition={{ delay: 0.18 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}`, `className="rounded-xl px-4 py-3 font-sohne text-[17px] font-medium text-ink transition-colors hover:bg-fog"`, `onClick={onClose}`.
  - **CTA**: `<div className="mt-auto px-6 pb-8">` holding a full-width `<button className="w-full rounded-full bg-ink py-3.5 font-sohne text-[15px] font-medium text-pure-white active:scale-95">Start for free</button>`.

### SECTION 3 — Hero (`src/components/Hero.tsx`)

The page body — declares `GALLERY_ITEMS` (Layer 5), the `fadeUp` variant (Layer 8), the `menuOpen` state, then renders Navbar + MobileMenu + the headline section + the gallery.

**Outer wrapper:** `<div className="min-h-screen overflow-x-hidden bg-pure-white">`. Renders `<Navbar menuOpen onToggle />` then `<MobileMenu open={menuOpen} onClose />`.

**Headline section** — `<section className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-8">` with inline `paddingTop: 'clamp(40px, 7vw, 80px)'`, `paddingBottom: 'clamp(12px, 2.5vw, 32px)'`. Children:

1. **Apricot dawn glow** — `<div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">` with inline:
   ```js
   width: 'min(960px, 100%)',
   height: 540,
   background:
     'radial-gradient(50% 50% at 50% 42%, rgba(251,225,209,0.62) 0%, rgba(251,225,209,0) 70%)',
   zIndex: 0,
   ```
2. **Headline + subtitle stack** — `<div className="relative z-20 mx-auto flex max-w-[720px] flex-col items-center text-center">`:
   - **Headline** `motion.h1`, `custom={0}`, `variants={fadeUp}`, `initial="hidden"`, `animate="visible"`, `className="font-signifier text-ink"`, inline `fontWeight: 400`, `fontSize: 'clamp(2.5rem, 7vw, 4.75rem)'`, `lineHeight: 1.08`, `letterSpacing: '-0.025em'` → **`Every memory, beautifully kept.`**
   - **Subtitle** `motion.p`, `custom={1}`, `className="mt-6 max-w-[560px] font-sohne text-ash"`, inline `fontSize: 'clamp(1rem, 2.2vw, 1.125rem)'`, `lineHeight: 1.5`, `letterSpacing: '-0.011em'` → **`Picway is a daylight home for your photos — unlimited storage, instant sharing, and pro-grade albums that make every moment easy to relive.`**

   There is **no hero CTA** — the navbar pill is the only filled button on the page.

**Gallery block** — a full-bleed `motion.div`, `custom={2}`, `variants={fadeUp}`, `initial="hidden"`, `animate="visible"`, `className="relative z-10 w-full"`, inline:
   ```js
   height: 'clamp(360px, 55vh, 560px)',
   marginTop: 'clamp(-40px, -2.5vw, -8px)',
   marginBottom: 'clamp(40px, 6vw, 80px)',
   ```
   It wraps `<CircularGallery items={GALLERY_ITEMS} bend={3} textColor="#17191c" borderRadius={0.05} scrollEase={0.02} font="bold 30px Inter" />`. The negative `marginTop` pulls the ring up under the subtitle so it overlaps the headline block; the `w-full` (no `max-w`) lets it bleed past the `1200px` content rail to both screen edges.

---

## LAYER 8 — ANIMATION STANDARDS

One shared entrance variant in `Hero.tsx`, staggered by `custom` index:

```ts
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}
```

- Headline `custom={0}` (delay 0), subtitle `custom={1}` (delay 0.15s), gallery `custom={2}` (delay 0.3s) — all `initial="hidden" animate="visible"` on load.
- **Navbar** is static (no entrance).
- **Mobile menu**: backdrop fades over `0.3s`; sheet slides `x: 100% → 0` over `0.45s` ease `[0.22, 1, 0.36, 1]`, exits over `0.35s` ease `[0.55, 0, 1, 0.45]`; links stagger in `delay: 0.18 + i * 0.07`, `0.4s` each.
- **CTA pill hover**: `-translate-y-0.5` over `0.2s`, `active:scale-95`. **Nav links**: `hover:opacity-60`. **Mobile links**: `hover:bg-fog`.
- **Gallery**: continuous internal `requestAnimationFrame` loop (scroll lerp + per-plane wave). The wave intensity rises with scroll speed; on drag/scroll release it snaps to the nearest card. The only continuous motion on the page.
- **No** scroll-triggered reveals, parallax, typewriter, or counters. The `steepFloat` keyframe exists in `index.css` but is unused by the hero (kept for parity).

---

## LAYER 9 — RESPONSIVE STANDARDS

- **Content rail** caps at `max-w-[1200px]` with `px-5 sm:px-8`. The headline stack caps at `max-w-[720px]`, the subtitle at `max-w-[560px]`.
- **Headline** scales fluidly with `clamp(2.5rem, 7vw, 4.75rem)`; the subtitle with `clamp(1rem, 2.2vw, 1.125rem)`. Never fixed display sizes.
- **Navbar**: desktop shows center links + the Ink pill (`md:flex`); below `md` they hide and the hamburger appears. The sticky bar stays `h-[68px]` at every width.
- **Mobile menu** appears only below `md`; the sheet is `min(88vw, 360px)` wide and full `100dvh` tall.
- **Gallery** is `w-full` (edge-to-edge) at all sizes, height `clamp(360px, 55vh, 560px)`. It reads `mousewheel`/`wheel` and `touch*` events, so drag works the same on touch and pointer. Its DPR is capped at 2 for retina performance.
- The page sets `overflow-x-hidden` on the hero wrapper so the negative-margin, full-bleed gallery never introduces horizontal scroll.

---

## LAYER 10 — ICON SET

Exactly **two** lucide icons are used, both in the navigation chrome:

- `Menu` — the mobile hamburger (closed state), `size={24}`, inheriting `text-ink`.
- `X` — the mobile close toggle in the navbar (`size={24}`) and the circular close button in the sheet (`size={20}`), `text-ink`.

Do not import any other icon. The logo and favicon are inline SVG, not lucide.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute fonts — display is **Source Serif 4** at weight 400 (mapped to `font-signifier`); everything else is **Inter** (mapped to `font-sohne`). The gallery labels are `bold 30px Inter`.
- Round colors — Ink is `#17191c`, the dawn glow is `rgba(251,225,209,*)` (Apricot Wash `#fbe1d1`), not "near-black" / "peach".
- Add a second accent, a dark hero, a hero CTA, or a second filled button. There is exactly **one** filled Ink pill per screen (`Start for free`).
- Spread the apricot glow outside the hero, or paint `shadow-steep` onto hero text.
- Reword copy — the headline is `Every memory, beautifully kept.` and the subtitle is verbatim (em-dash included). Nav labels are `Gallery · Plans · Apps · Stories · Help`. Card labels are the eight in Layer 5.
- Change the gallery props: `bend={3}`, `textColor="#17191c"`, `borderRadius={0.05}`, `scrollEase={0.02}`, `font="bold 30px Inter"`. Do not alter the shaders, the `100×50` plane segments, the DPR cap, or the list-duplication that makes the ring loop.
- Drop `allowJs`/`checkJs:false` from `tsconfig.json` — the `.jsx` gallery import depends on them.
- Wire external image URLs into the gallery — photos are builder-supplied at `/gallery/*.jpg`.

If a constraint conflicts with a framework limit (e.g. a font weight is unavailable), clamp to the nearest valid value and leave a comment — do not silently change.

---

## FILE TREE (exact output expected)

```
Picway/
├── index.html              # Google Fonts (Inter + Source Serif 4), favicon, title
├── tailwind.config.js      # tokens from Layer 3
├── postcss.config.js       # tailwindcss + autoprefixer
├── vite.config.ts          # @vitejs/plugin-react
├── tsconfig.json           # strict TS + allowJs / checkJs:false for the .jsx gallery
├── public/
│   ├── favicon.svg         # Ink photo-frame mark (sun + mountains)
│   └── gallery/            # 8 builder-supplied memory photos (~800×600 jpg)
└── src/
    ├── main.tsx            # render <App/> inside React.StrictMode
    ├── index.css           # Layer 4 verbatim (:root tokens + body voice + keyframe)
    ├── vite-env.d.ts       # /// <reference types="vite/client" />
    ├── App.tsx             # renders <Hero/>
    └── components/
        ├── Hero.tsx            # navbar + mobile menu + headline + full-bleed gallery
        ├── Navbar.tsx          # sticky white bar, logo + links + Ink pill
        ├── MobileMenu.tsx      # slide-in sheet (AnimatePresence)
        ├── Logo.tsx            # photo-frame SVG mark (verbatim)
        ├── nav.ts              # NAV_LINKS
        ├── CircularGallery.jsx # Layer 6 verbatim (ogl)
        └── CircularGallery.css # Layer 6 verbatim
```

`src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`index.html` title: `Picway — Every memory, beautifully kept`.

---

## DELIVERY CHECKLIST

- [ ] `npm create vite@latest . --template react-ts` (React 18 + Vite 5 + TypeScript).
- [ ] `npm i framer-motion@^11 lucide-react ogl` and `npm i -D tailwindcss@3 postcss autoprefixer`.
- [ ] `tsconfig.json` sets `allowJs: true`, `checkJs: false` (+ `strict`, `noUnusedLocals/Parameters`).
- [ ] `tailwind.config.js` carries the full token block (10 colors, `font-signifier`/`font-sohne`, `shadow-steep`, `rounded-card`).
- [ ] `index.css` pasted verbatim from Layer 4 (`:root` tokens, body `-0.009em`, `steepFloat`, reduced-motion guard).
- [ ] `index.html` loads Inter + Source Serif 4, title `Picway — Every memory, beautifully kept`.
- [ ] `favicon.svg` is the Ink photo-frame mark (Layer 5).
- [ ] 8 memory photos placed in `public/gallery/`; `GALLERY_ITEMS` references them with the 8 verbatim labels.
- [ ] `CircularGallery.jsx` + `.css` pasted verbatim; hero passes `bend=3`, `textColor="#17191c"`, `borderRadius=0.05`, `scrollEase=0.02`, `font="bold 30px Inter"`.
- [ ] `main.tsx` mounts `<App/>` inside `React.StrictMode`.
- [ ] Navbar sticky + blurred, logo + wordmark, 5 center links, one `Start for free` Ink pill; hamburger below `md`.
- [ ] MobileMenu slide-in sheet with backdrop, staggered links, full-width Ink pill.
- [ ] Hero: apricot dawn glow (hero only) → Source Serif 4 headline → Inter subtitle → full-bleed ogl gallery, all `fadeUp`-staggered (custom 0/1/2).
- [ ] Exactly one filled Ink button per screen; no hero CTA; no second accent color.
- [ ] One viewport hero; gallery loops infinitely and drags on pointer + touch.

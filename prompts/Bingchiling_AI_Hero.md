# Bingchiling — AI Image Generation Hero

## LAYER 1 — OPENING DECLARATION

Build a **single-viewport hero section** for **Bingchiling** — an AI image-generation platform that turns a line of text into gallery-ready visuals.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** — plain **JSX, no TypeScript**.
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin — no `tailwind.config.js`, no PostCSS setup. The whole framework loads with a single `@import "tailwindcss";` at the top of `src/index.css`.
- **Pure CSS keyframes** for every entrance — no animation library, no `IntersectionObserver`, no JS-triggered reveals. Content can never be stuck hidden.
- **Inline SVG only** for icons and logos — the exact paths are given in Layer 6. Do not import an icon library.

The dev script is `"dev": "vite --port 5920"`.

The aesthetic is **dark cinematic full-bleed**: a looping background video fills the viewport edge to edge, a glassmorphic navigation pill floats at the top, and white typography sits over layered dark gradients. The page background is warm near-black **Ink** (`#14100a`) — warm, not neutral. The single accent is **Gold** (`#e8b04a`), and it appears in exactly one place: the "New" chip inside the announcement badge. Everything else is white at stepped opacities (`text-white`, `/85`, `/75`, `/70`, `/60`).

**Do not:** add purple, indigo, blue, or neon green anywhere; frame the hero in a rounded card or add page padding around it (it is full-bleed); spread the gold accent to buttons, links, or headings; use drop shadows; or replace the CSS keyframe entrances with a motion library.

---

## LAYER 2 — FONTS

One family: **Inter**, loaded as a variable font with optical sizing in `index.html` `<head>` (preconnect first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
```

The rest of the `<head>`: `<meta charset="UTF-8" />`, the standard viewport meta, `<title>Bingchiling — AI Image Generation</title>`, and this meta description:

```html
<meta name="description" content="Bingchiling turns your words into stunning images. The most advanced AI image generation platform for creators, teams, and dreamers." />
```

Base typography in `src/index.css`:

```css
html, body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

Weights in play: `font-medium` (500) for nav links and buttons, `font-semibold` (600) for the wordmark, headline, badge chip, and trust-strip logo names. Nothing heavier than 600 renders on the page.

---

## LAYER 3 — COLOR TOKENS

Two custom properties on `:root` carry the identity:

```css
:root {
  --ink:  #14100a;   /* global page + hero background — warm near-black */
  --gold: #e8b04a;   /* the ONLY accent — "New" badge chip fill */
}
```

Fixed values used inline (never tokenized, never rounded):

| Where | Value |
|---|---|
| Badge chip text | `#3a2a0e` (deep umber on gold) |
| Logo mark gradient | `#f3d08a` → `#c98a2e` (SVG `linearGradient`, diagonal `x1=0 y1=0 x2=1 y2=1`) |
| Legibility overlay 1 | `bg-gradient-to-b from-black/55 via-black/15 to-black/60` |
| Legibility overlay 2 | flat `bg-black/10` |

White does the rest of the work through Tailwind opacity steps: `text-white` (headline, wordmark, active nav link), `/85` (badge label, ghost CTA), `/75` (trust line), `/70` (subheadline), `/60` (inactive nav links, badge chevron). Glass surfaces: `bg-black/25` (nav pill), `bg-black/30` (badge), `bg-white/10` (buttons), borders `border-white/10` / `/15` / `/25`.

---

## LAYER 4 — CUSTOM CSS UTILITIES (`src/index.css`)

Paste **verbatim** — this file is the design DNA. Easing tokens, two entrance keyframes, five delay steps, a reduced-motion guard, and the hover polish classes:

```css
@import "tailwindcss";

:root {
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;

  --ink: #14100a;
  --gold: #e8b04a;
}

html, body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Entrance — pure CSS keyframes so content can never be stuck hidden */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.rise {
  animation: rise-in 0.9s var(--ease-out-quart) both;
}
.fade {
  animation: fade-in 1.2s var(--ease-out-cubic) both;
}
.d-1 { animation-delay: 0.08s; }
.d-2 { animation-delay: 0.18s; }
.d-3 { animation-delay: 0.3s; }
.d-4 { animation-delay: 0.42s; }
.d-5 { animation-delay: 0.56s; }

@media (prefers-reduced-motion: reduce) {
  .rise, .fade {
    animation: none;
    opacity: 1;
    transform: none;
  }
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* Interactive polish */
.nav-link {
  transition: color var(--duration-base) var(--ease-out-quad);
}
.btn-glass {
  transition:
    background-color var(--duration-base) var(--ease-out-quad),
    border-color var(--duration-base) var(--ease-out-quad),
    transform var(--duration-base) var(--ease-out-cubic);
}
.btn-glass:hover { transform: translateY(-1px); }
.btn-glass:active { transform: translateY(0); }
.btn-ghost {
  transition: opacity var(--duration-base) var(--ease-out-quad), gap var(--duration-base) var(--ease-out-quad);
}
.logo-item {
  transition: opacity var(--duration-base) var(--ease-out-quad);
}
.logo-item:hover { opacity: 1; }
```

---

## LAYER 5 — BACKGROUND ASSET

One looping video fills the hero, served from the CDN — do not swap it for a stock or placeholder URL:

```jsx
<video
  className="fade absolute inset-0 h-full w-full object-cover"
  src="https://cdn.5sdesign.art/projects/bingchiling/hero.mp4"
  autoPlay
  muted
  loop
  playsInline
/>
```

Directly after the video, stack the two legibility overlays — a vertical gradient that darkens the top and bottom bands (where the nav and trust strip live) while keeping the middle clear, then a flat wash:

```jsx
<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/60" />
<div className="absolute inset-0 bg-black/10" />
```

z-stacking: video (base, `fade` entrance) → overlays → content wrapper at `relative z-10`.

---

## LAYER 6 — INLINE SVG LIBRARY

Every mark on the page is an inline SVG path — nothing imported. Reproduce each path character-for-character.

**Logo mark** (nav pill, left) — a three-tier stacked form, `viewBox="0 0 24 24"`, `className="h-6 w-6"`, filled with the gold gradient:

```jsx
<svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
  <path d="M12 3l3 5H9l3-5zM7.5 10h9L19 14H5l2.5-4zM4 16h16l-2 5H6l-2-5z" fill="url(#bg-gold)" />
  <defs>
    <linearGradient id="bg-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f3d08a" />
      <stop offset="1" stopColor="#c98a2e" />
    </linearGradient>
  </defs>
</svg>
```

**Chevron** (badge + ghost CTA) — `viewBox="0 0 16 16"`, `fill="none"`, `strokeWidth="1.5"`, path `M6 3l5 5-5 5`. In the badge it takes `className="h-3.5 w-3.5 stroke-white/60"`; in the ghost CTA it takes `className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover:translate-x-0.5"`.

**Trust-strip logos** — five fictional studios, each a single path in a `viewBox="0 0 20 20"` SVG at `className="h-5 w-5 fill-white"`:

```jsx
const BRANDS = [
  { name: 'Pixelform', icon: 'M4 4h6v6H4zM10 10h6v6h-6z' },
  { name: 'Lumina', icon: 'M10 2l2.4 5.6L18 10l-5.6 2.4L10 18l-2.4-5.6L2 10l5.6-2.4z' },
  { name: 'Artvane', icon: 'M10 2a8 8 0 108 8h-8z' },
  { name: 'Framecast', icon: 'M3 3h14v3H3zm0 5h9v3H3zm0 5h14v3H3z' },
  { name: 'Studioly', icon: 'M10 3a7 7 0 110 14 7 7 0 010-14zm0 4a3 3 0 100 6 3 3 0 000-6z' },
]
```

Each renders through a small `BrandLogo` component: `<div className="logo-item flex items-center gap-2 opacity-70">` wrapping the SVG and `<span className="text-white text-base font-semibold tracking-tight">{name}</span>`. The `.logo-item` hover lifts opacity to 1.

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`src/App.jsx` — one component, one section. `src/main.jsx` mounts it normally:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Container**
- Outer: `<div className="min-h-screen">`
- Section: `<section className="relative min-h-screen overflow-hidden bg-[#14100a]">` — full-bleed, no outer frame, no rounded corners, no page padding.
- Background: video + two overlays from Layer 5.
- Content wrapper: `<div className="relative z-10 flex min-h-screen flex-col px-6 pt-6 pb-10 sm:px-10">` — a vertical flex column: nav pill (top) → hero copy (`flex-1`, centered) → trust strip (bottom).

### Element 1 — Navigation pill

- `<header className="rise d-1 mx-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/25 py-2 pl-4 pr-2 backdrop-blur-md">` — note the asymmetric padding (`pl-4 pr-2`) so the CTA sits flush inside the pill, and `rounded-xl` on the pill itself.
- **Logo** (left): `<a href="#" className="flex items-center gap-2">` — the gradient mark from Layer 6, then `<span className="text-white font-semibold tracking-tight">Bingchiling</span>`.
- **Links** (center, hidden below `md`): `<nav className="hidden items-center gap-6 md:flex">` with five links — `Home` · `How it works` · `Gallery` · `Features` · `FAQs`. The first (active) link: `nav-link text-sm text-white font-medium`; the rest: `nav-link text-sm text-white/60 hover:text-white`.
- **CTA** (right): `<a href="#" className="btn-glass rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">Try for free</a>` — `rounded-full`, in contrast to the pill's `rounded-xl`.

### Element 2 — Hero copy block

Wrapper: `<div className="flex flex-1 flex-col items-center justify-center pt-16 pb-8 text-center">`.

- **Announcement badge** — `<a href="#" className="rise d-2 btn-glass mb-8 flex items-center gap-3 rounded-full border border-white/15 bg-black/30 py-1.5 pl-1.5 pr-4 backdrop-blur-md hover:bg-black/40">` containing, in order:
  1. Chip: `<span className="rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-semibold text-[#3a2a0e]">New</span>` — the only gold on the page.
  2. Label: `<span className="text-sm text-white/85">Introducing Our Most Advanced Image Model Yet</span>`
  3. The badge chevron from Layer 6.
- **Headline**: `<h1 className="rise d-3 max-w-4xl text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">Turn Your Wildest Ideas Into Images That Feel Real</h1>`
- **Subheadline**: `<p className="rise d-4 mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">From a single line of text to gallery-ready art, Bingchiling gives you the speed, control, and quality to create visuals that used to take a studio.</p>`
- **CTA row**: `<div className="rise d-5 mt-10 flex flex-wrap items-center justify-center gap-4">`
  - Primary: `<a href="#" className="btn-glass rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20">Start Creating Free</a>`
  - Secondary (ghost): `<a href="#" className="btn-ghost group flex items-center gap-2 px-2 py-3 text-sm font-medium text-white/85 hover:opacity-100">See It in Action</a>` followed by the ghost-CTA chevron from Layer 6, which nudges `translate-x-0.5` on group hover.

### Element 3 — Trust strip

- `<footer className="rise d-5 flex flex-col items-center gap-6">`
- Line: `<p className="text-sm text-white/75">Trusted by creative teams shipping over 2 million images a week</p>`
- Logo row: `<div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-14 gap-y-6">` mapping the five `BRANDS` through `BrandLogo`.

### Copy (all text, verbatim, in order)

```
Bingchiling
Home
How it works
Gallery
Features
FAQs
Try for free
New
Introducing Our Most Advanced Image Model Yet
Turn Your Wildest Ideas Into Images That Feel Real
From a single line of text to gallery-ready art, Bingchiling gives you the speed, control, and quality to create visuals that used to take a studio.
Start Creating Free
See It in Action
Trusted by creative teams shipping over 2 million images a week
Pixelform
Lumina
Artvane
Framecast
Studioly
```

---

## LAYER 8 — ANIMATION STANDARDS

Every entrance is a CSS class from Layer 4 — never `opacity-0` plus a JS trigger. The choreography reads top to bottom:

| Element | Class | Delay |
|---|---|---|
| Background video | `fade` (1.2s, `--ease-out-cubic`) | 0s |
| Nav pill | `rise d-1` | 0.08s |
| Announcement badge | `rise d-2` | 0.18s |
| Headline | `rise d-3` | 0.3s |
| Subheadline | `rise d-4` | 0.42s |
| CTA row | `rise d-5` | 0.56s |
| Trust strip | `rise d-5` | 0.56s |

`rise` = 0.9s translateY(24px → 0) + fade on `--ease-out-quart`, fill mode `both`. The CTA row and trust strip intentionally share `d-5` so the bottom of the page lands as one beat.

Hover motion only after load: `.btn-glass` lifts `-1px` and settles on active; the ghost CTA's chevron slides `+2px`; `.logo-item` brightens to full opacity; nav links transition color. No scroll-triggered animation, no parallax, no counters — the only continuous motion is the video loop.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile (`<640px`): headline `text-4xl`, horizontal padding `px-6`, nav links hidden (logo + "Try for free" stay), CTA row wraps via `flex-wrap`, trust logos wrap on `gap-x-14 gap-y-6`.
- `sm:`: padding steps to `sm:px-10`, headline `sm:text-6xl`, subheadline `sm:text-lg`.
- `md:`: nav links appear (`md:flex`).
- `lg:`: headline caps at `lg:text-[4.25rem]`.
- The video covers the viewport at every size (`object-cover`); the flex column keeps nav / copy / trust strip pinned top / center / bottom.

---

## LAYER 10 — ICON SET

No icon library. The page uses exactly seven inline SVGs, all specified in Layer 6:

- 1 × logo mark (gold gradient, nav pill)
- 2 × chevron `M6 3l5 5-5 5` (badge, ghost CTA)
- 5 × brand marks (trust strip)

Reject any request to import lucide, phosphor, or heroicons here.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute fonts ("similar to Inter" is not Inter — load the variable axis string from Layer 2 as-is).
- Round color values ("close to `#14100a`" is not `#14100a`; the badge text is exactly `#3a2a0e`).
- Spread gold beyond the "New" chip, or introduce purple / indigo / blue / neon green.
- Shorten or paraphrase copy — every string in Layer 7 is verbatim, including "Turn Your Wildest Ideas Into Images That Feel Real".
- Replace the CSS keyframe entrances with an animation library, scroll reveals, or JS-gated opacity.
- Skip or renumber the delays — 0.08 / 0.18 / 0.3 / 0.42 / 0.56s on `--ease-out-quart`, video fade first at 0s.
- Rename or redraw the five trust-strip logos — the names and paths are the asset.
- Swap the CDN video URL for a stock or placeholder file.
- Add an outer frame, rounded page corners, or padding around the section — the hero is full-bleed.

If a constraint conflicts with a framework limit, clamp to the nearest valid value and leave a comment — do not silently change.

---

## FILE TREE (exact output expected)

```
Bingchiling/
├── index.html          # Inter variable font, title, meta description
├── package.json        # react 19 · react-dom 19 · vite 6 · tailwindcss 4 · @tailwindcss/vite — dev on port 5920
├── vite.config.js      # plugins: [react(), tailwindcss()]
└── src/
    ├── main.jsx        # StrictMode mount
    ├── index.css       # Layer 4 verbatim
    └── App.jsx         # BRANDS data + BrandLogo + the single hero section
```

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## DELIVERY CHECKLIST

- [ ] Vite 6 + React 19 scaffold, JSX only; `npm i -D tailwindcss@4 @tailwindcss/vite @vitejs/plugin-react`.
- [ ] `src/index.css` pasted verbatim from Layer 4, starting with `@import "tailwindcss";`.
- [ ] `index.html` loads the Inter optical-sizing axis string, title `Bingchiling — AI Image Generation`.
- [ ] Video src is `https://cdn.5sdesign.art/projects/bingchiling/hero.mp4` with `autoPlay muted loop playsInline` and the `fade` class; both overlays stacked above it.
- [ ] Nav pill: `max-w-3xl`, `rounded-xl`, `bg-black/25`, `backdrop-blur-md`, asymmetric `pl-4 pr-2`; gradient logo mark + `Bingchiling` wordmark; five links (first active white); `Try for free` glass CTA.
- [ ] Badge: gold `New` chip (`#3a2a0e` text) + `Introducing Our Most Advanced Image Model Yet` + chevron.
- [ ] Headline / subheadline / CTA row with exact classes and copy; ghost CTA chevron nudges on hover.
- [ ] Trust strip: exact line + five fictional logos with their exact SVG paths.
- [ ] Entrance order fires 0.08 → 0.18 → 0.3 → 0.42 → 0.56s; reduced-motion guard intact.
- [ ] Gold appears ONLY on the badge chip; no blue/purple/indigo/green anywhere; hero is full-bleed.

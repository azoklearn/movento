# CloudB — Sneaker Brand Hero Landing

## LAYER 1 — OPENING DECLARATION

Build a **single-page hero landing** for **CloudB** — a premium sneaker brand. The page is one full-viewport screen: a white frame with a top navigation bar and a full-width cinematic video hero underneath.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, `.jsx`)
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (CSS-first config with `@theme`, no `tailwind.config.js`)
- **GSAP 3 + `@gsap/react`** (`useGSAP` hook) for entrance choreography
- **Lenis** for smooth scrolling
- Icons: inline SVG only, `stroke-width: 1.4–1.6`, thin precise lines — no icon libraries

The aesthetic is **bold sportswear-editorial**: a clean white shell, one giant translucent display word ("CLOUD") floating over a looping product film, a single black pill CTA, generous whitespace, spring-feel motion. Global background is `#ffffff`. Ink (text/CTA) color is `#0a0a0a`. **Do not use purple, indigo, or neon colors anywhere.**

Dev server port: **5930**.

---

## LAYER 2 — FONTS

Load via Fontshare (the fonts' official free CDN) in `index.html`:

```html
<link rel="preconnect" href="https://api.fontshare.com" />
<link
  href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=general-sans@400,500,600&display=swap"
  rel="stylesheet"
/>
```

Tailwind v4 `@theme` extension (in `src/index.css`):

```css
@theme {
  --font-display: "Clash Display", "General Sans", sans-serif;
  --font-sans: "General Sans", sans-serif;
}
```

`html, body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }`

- **Clash Display 700** — display word + logo wordmark
- **General Sans 400/500/600** — everything else

---

## LAYER 3 — COLOR SYSTEM

```css
@theme {
  --color-ink: #0a0a0a;       /* text, CTA background */
  --color-slot: #22b45c;      /* fallback canvas green (shows before video loads) */
  --color-slot-deep: #17914a;
}
```

- Page background: `#ffffff` (set on `html, body` and the app root)
- Text selection: `::selection { background: #0a0a0a; color: #fff; }`
- White-on-video text: pure white at the opacities specified per element below

---

## LAYER 4 — CUSTOM CSS UTILITIES (paste verbatim into `src/index.css`)

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-fluid: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-fast: 300ms;
  --dur-slow: 700ms;
}

/* Fallback surface behind the hero video while it loads */
.slot {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 55%),
    linear-gradient(160deg, var(--color-slot) 0%, var(--color-slot-deep) 100%);
}

/* Giant hero wordmark — translucent glass letters over the film */
.hero-word {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 0.82;
  color: rgba(255, 255, 255, 0.72);
  mix-blend-mode: overlay;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## LAYER 5 — BACKGROUND ASSET

**Looping background video**, served from the CDN — reference the URL directly, do not swap it for stock footage (landscape ~1820×1136, h264, ~6 s loop):

```jsx
<video
  className="absolute inset-0 h-full w-full object-cover"
  src="https://cdn.5sdesign.art/projects/cloudb/hero.mp4"
  autoPlay
  loop
  muted
  playsInline
  aria-hidden="true"
/>
```

No overlay on top of the video. The `.slot` green gradient on the canvas acts only as the loading fallback behind it.

---

## LAYER 6 — PAGE SHELL (`src/App.jsx`)

- Root: `<div className="min-h-[100dvh] bg-white">`
- Inner column: `<div className="flex min-h-[100dvh] w-full flex-col">` containing `<Navbar />` then `<Hero />`
- **No max-width, no outer padding, no border, no ring, no shadow** — the hero must span the full viewport width.
- Initialize Lenis in a `useEffect`: `new Lenis({ lerp: 0.12, smoothWheel: true })`, drive it with `requestAnimationFrame`, cancel the rAF and `lenis.destroy()` on unmount.

---

## LAYER 7 — SECTIONS

### SECTION 1 — NAVBAR

**Block 1 · Container**
- `<header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">` — sits on the white shell, not sticky, no border.

**Block 2 · Elements**

1. **Logo (left)** — link to `/`, aria-label "CloudB home". Wordmark component:
   - `<span className="font-display text-[22px] font-bold tracking-tight text-ink">Cloud<span className="align-super text-[13px] font-semibold">B</span></span>`
   - Renders as "Cloud" with a superscript "B".
2. **Center links** (hidden below `md:`): `nav` with `className="hidden items-center gap-9 md:flex"`, aria-label "Primary". Five links, exact labels in this order:
   ```
   New Releases · Men · Women · Kids · Customize
   ```
   - Each: `group relative text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/80 transition-colors duration-300 ease-[var(--ease-fluid)] hover:text-ink`
   - Underline: absolutely positioned `span`, `-bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100`
3. **Right icons**: container `flex shrink-0 items-center gap-5`.
   - **Account button** — inline SVG person icon (circle head `r=3.6` at `cx=12 cy=8` + shoulder arc `M4.8 20c1.4-3.2 4-4.8 7.2-4.8s5.8 1.6 7.2 4.8`), 21×21, `stroke-width 1.4`, classes `text-ink/80 transition-all duration-300 ease-[var(--ease-fluid)] hover:text-ink active:scale-95`, aria-label "Account".
   - **Cart button** — inline SVG shopping-bag icon (rounded bag path `M5 8h14l-1.1 11.2a1.8 1.8 0 0 1-1.8 1.6H7.9a1.8 1.8 0 0 1-1.8-1.6L5 8Z` + handle arc `M8.6 8V6.4a3.4 3.4 0 0 1 6.8 0V8`), 21×21, `stroke-width 1.4`, same classes, aria-label "Cart, 2 items". Badge: `absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-semibold text-white` with text **"2"**.

### SECTION 2 — HERO

**Block 1 · Container**
- `<section className="flex w-full flex-1 flex-col">` — zero padding, fills remaining viewport height.

**Block 2 · Canvas**
- `<div data-hero-canvas className="slot relative flex-1 overflow-hidden rounded-t-[50px]" style={{ minHeight: 'min(78dvh, 900px)' }}>`
- **Only the two top corners are rounded, at exactly 50px.** Bottom corners are square. The canvas touches the left, right, and bottom edges of the viewport.
- The background video (Layer 5) is the first child.

**Block 3 · Elements** (all absolutely positioned inside the canvas)

1. **Micro tag (top right)**
   - `<p data-hero-tag className="absolute right-6 top-16 z-30 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90 sm:right-10 sm:top-14 lg:top-16">`
   - Text: **"Essential Men's Shoe"** (with a typographic apostrophe: `Men’s`)
2. **Giant wordmark**
   - `<h1 aria-label="Cloud" className="hero-word pointer-events-none absolute left-1/2 top-[16%] z-10 flex -translate-x-1/2 select-none whitespace-nowrap text-[clamp(5.5rem,21vw,19rem)]">`
   - Text: **"CLOUD"**, split into 5 individual `<span data-hero-letter className="inline-block">` letters (for the staggered entrance).
3. **CTA (bottom center)** — wrapped in a positioning div so GSAP transforms never break the centering:
   - Wrapper: `<div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 sm:bottom-8">`
   - Link: `<a data-hero-cta href="#" className="group flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_-14px_rgba(10,10,10,0.6)] transition-all duration-500 ease-[var(--ease-fluid)] hover:shadow-[0_24px_52px_-14px_rgba(10,10,10,0.75)] active:scale-[0.97]">`
   - Text: **"Explore Now"**
   - Trailing icon nested in its own circle: `<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-[1px] group-hover:translate-x-1 group-hover:scale-105">` containing a 13×13 arrow-up-right SVG (`d="M7 17 17 7M9 7h8v8"`, stroke 1.6, round caps).

**There is no play button, no product-name tag, and no floating product card in the hero. Do not add them.**

**Block 4 · Animation (GSAP, inside `useGSAP` with a `ref` scope)**

Wrap everything in `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', ...)` and revert it on cleanup. One timeline, `defaults: { ease: 'expo.out' }`:

```js
tl.from('[data-hero-canvas]', { scale: 0.965, opacity: 0, duration: 1.1 })
  .from('[data-hero-letter]', { yPercent: 60, opacity: 0, filter: 'blur(10px)', stagger: 0.06, duration: 1.2 }, '-=0.55')
  .from('[data-hero-tag]',    { y: 24, opacity: 0, stagger: 0.12, duration: 0.9 }, '-=0.9')
  .from('[data-hero-cta]',    { y: 24, opacity: 0, duration: 0.9 }, '-=0.7')
```

Register the plugin once: `gsap.registerPlugin(useGSAP)`.

**Block 5 · Copy (all text on the page, verbatim, in order)**

```
CloudB
New Releases
Men
Women
Kids
Customize
2
Essential Men’s Shoe
CLOUD
Explore Now
```

---

## LAYER 8 — ANIMATION STANDARDS

- Hover/press transitions on interactive elements: `duration-300`–`duration-500` with `var(--ease-fluid)` or `var(--ease-out-expo)` — never `linear` or default `ease-in-out`.
- Animate only `transform`, `opacity`, and `filter`. Never animate layout properties.
- All entrance motion is gated behind `prefers-reduced-motion: no-preference`.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile-first. Nav links hide below `md:`; logo and icons remain.
- Hero headline scales with `clamp(5.5rem, 21vw, 19rem)` — always fluid.
- Use `100dvh` (never `100vh`) for full-height sizing.
- The hero canvas stays full-bleed at every breakpoint; only positional offsets shift (`right-6 → sm:right-10`, `bottom-6 → sm:bottom-8`, header padding `px-6 → sm:px-10 → lg:px-14`).

---

## LAYER 10 — ICON SET

Inline SVG only, thin precise strokes — no icon libraries. The complete inventory:

```
- Person   → account button (21×21, stroke 1.4)
- Bag      → cart button (21×21, stroke 1.4) + ink badge "2"
- Arrow ↗  → inside the CTA circle (13×13, stroke 1.6, d="M7 17 17 7M9 7h8v8")
```

Reject any other icon.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Clash Display" is not Clash Display).
- Round color values ("close to #0a0a0a" is not #0a0a0a).
- Change copy ("Explore now" is not "Explore Now").
- Skip or retime animation values (stagger 0.06, ease `expo.out`, offsets as written).
- Add sections, play buttons, badges, overlays, or decorative elements not specified here.
- Swap the CDN hero video (Layer 5) for stock footage or a placeholder image.
- Round any corner except the hero's two top corners at exactly 50px.

If a constraint conflicts with a framework limitation, clamp to the nearest valid value and note the substitution as a code comment — do not silently change.

---

## PAGE META

- `<title>CloudB — Walk on Clouds</title>`
- `<meta name="description" content="CloudB. Walk on clouds. The essential men's shoe." />`
- Language: `<html lang="en">`. All copy in English.

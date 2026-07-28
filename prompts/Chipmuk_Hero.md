## Chipmuk Hero Prompt

> Reproduce the **Chipmuk** hero page byte-for-byte. Anything inside `{{ DOUBLE_BRACES }}` is a customization slot.

---

## LAYER 1 — OPENING DECLARATION

Build a **fullscreen hero section** for **Chipmuk** — a **creative studio brand**.

Use the following **pinned** tech stack (do not substitute):

- **React 18 + TypeScript + Vite**
- **Tailwind CSS 3** (default config + extensions below)
- **lucide-react** for icons (restricted to `Menu`, `X` — see Layer 10)
- **PostCSS + Autoprefixer**

No other UI libraries. No CSS frameworks beyond Tailwind. No animation library — interactions are vanilla JS + refs.

The aesthetic is **dark cinematic with a paused background video that scrubs forward / backward as the user moves their mouse horizontally, capped by a chunky cream display heading and a floating pill-style top nav**. `#010828` is the global background. Default text color is `#EFF4FF`. **Do not introduce purple, indigo, or any neon colors other than the project green `#6FFF00`.**

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="http://fonts.googleapis.com" />
<link rel="preconnect" href="http://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Poppins:wght@400;600;700;800;900&display=swap"
  rel="stylesheet"
/>
```

**Project font pairing (do not swap):**
- **Poppins** (400/600/700/800/900) — display, used for the hero heading
- **Caveat** (400/700) — handwritten accent, available for cursive overlays

Tailwind config extension:

```js
fontFamily: {
  display: ['Poppins', 'system-ui', 'sans-serif'],
  script:  ['Caveat', 'cursive'],
}
```

`body { background-color: #010828; color: #EFF4FF; margin: 0; overflow-x: hidden; }`

**Substitution rule:** if a weight is unavailable on the loaded subset, clamp down to the nearest available weight rather than synthesizing. Hero heading must render at weight **900** (`font-black`).

---

## LAYER 3 — COLOR SYSTEM

Extend the default Tailwind theme. Shipping a single dark theme — hex values, not HSL:

```js
// tailwind.config.js → theme.extend.colors
{
  background: '#010828',   // deep navy — page bg, video fallback
  cream:      '#EFF4FF',   // off-white — heading + body text
  neon:       '#6FFF00',   // bright green — script accent / status dot
}
```

Plus Tailwind's built-in palette is allowed for navbar UI (`gray-900`, `gray-300`, `gray-800`, `gray-100`, `gray-500`, `green-400`, `white`, `black`).

---

## LAYER 4 — CUSTOM CSS UTILITIES (the "design DNA")

**Invariant block.** Paste verbatim into `src/index.css` after the Tailwind directives. The `.liquid-glass` utility is part of the design system even though it is not consumed by the hero itself — keep it available for downstream sections.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #010828;
  color: #EFF4FF;
  margin: 0;
  overflow-x: hidden;
}

.liquid-glass {
  position: relative;
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45),
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.45)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
          mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
```

---

## LAYER 5 — BACKGROUND ASSET (mouse-scrub video)

The hero background is a single MP4 that does **not** autoplay. The video is paused at `currentTime = 0` on load. Horizontal mouse motion scrubs forward / backward through its timeline.

**Source video (use this URL verbatim):**

```
https://cdn.5sdesign.art/projects/Chipmuk/character.mp4
```

**Video element markup:**

```jsx
<video
  ref={videoRef}
  src={VIDEO_SRC}
  muted
  playsInline
  preload="auto"
  className="absolute inset-0 h-full w-full object-cover"
/>
```

No `autoplay`, no `loop`, no `controls`. No `<source>` children — pass `src` directly on the element.

**Scrub interaction — exact algorithm.** Implement these constants and semantics; do not paraphrase:

```ts
const SENSITIVITY = 0.8
```

State held in a **single `useRef`** (no React state, no re-renders):

```ts
const stateRef = useRef({
  targetTime: 0,    // accumulated scrub target in seconds
  isSeeking:  false,
  prevX:      -1,   // sentinel: skip the first mousemove to avoid jump
})
```

On `loadedmetadata` (or immediately if `readyState >= 1`): call `video.pause()` then set `video.currentTime = 0`. Wrap in try/catch — some browsers throw if metadata is mid-load.

On every `mousemove` on `window` (not the video element):
1. Bail if `video.duration` is `NaN` / falsy.
2. If `prevX < 0`, set `prevX = e.clientX` and return — first move only seeds the reference.
3. Compute `deltaX = e.clientX - prevX`, update `prevX = e.clientX`.
4. Compute `normalizedDelta = deltaX / window.innerWidth`.
5. Compute `offset = normalizedDelta * SENSITIVITY * duration`.
6. Update `targetTime = clamp(targetTime + offset, 0, duration)`.
7. Call `tryChainSeek()`.

`tryChainSeek()`:
- If `isSeeking === true`, return — the browser can only process one seek at a time.
- If `|targetTime − video.currentTime| > 0.01`, set `isSeeking = true` and assign `video.currentTime = targetTime`.

On `seeked`: set `isSeeking = false`, then call `tryChainSeek()` again. This chain-seek pattern guarantees no dropped target when the user drags fast.

Wire up listeners inside a `useEffect` and remove them in the cleanup. Listen to `seeked` on the video; listen to `mousemove` on `window`.

**Encoding note for downstream tuning (not the prompt's job, but informative):** the video should be re-encoded as **all-intra H.264** (`-g 1 -keyint_min 1 -sc_threshold 0 -tune fastdecode`) at 1024 px width for instant seek response. The CloudFront source is the canonical asset — derive any local copy from it.

**Gradient overlay** sits above the video to keep the heading readable when bright frames pass under it:

```jsx
<div
  aria-hidden
  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
/>
```

z-stacking: video at `inset-0` (no z) → overlay above it (no z) → content layer at `z-10` → nav at `z-50`.

---

## LAYER 6 — SHARED COMPONENTS (define once, use everywhere)

This page implements only the components below. **Do not import animation libraries.**

### `Navbar`
- Stateful, single boolean `open` for the mobile dropdown.
- Renders a fragment of two elements: the fixed `<nav>` and the conditional mobile `<div>` dropdown.
- Nav items are `['Work', 'About', 'Journal', 'Contact']`. The **first** item is rendered as the active pill (`bg-white text-gray-900`); the rest are unstyled until hover.
- Icons: `Menu` and `X` from `lucide-react` at `size={22}`, color `text-gray-900`.

### `Hero`
- Holds the video ref + scrub effect (Layer 5).
- Renders `<section>` → `<video>` → overlay `<div>` → content `<div>` → heading `<div>` → `<h1>`.
- No internal animation library, no entry transitions — the interaction is the animation.

### `App`
- Trivial composition: `<><Navbar /><Hero /></>`.

---

## LAYER 7 — SECTIONS

### SECTION 1 — NAVBAR

**Block 1 · Container**
- Wrapper: `<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">`
- Mobile dropdown (sibling when `open === true`): `<div className="fixed top-0 left-0 right-0 z-40 bg-white pt-16 pb-6 px-5 shadow-lg flex flex-col gap-1 md:hidden">`

**Block 2 · Background**
- Navbar itself is transparent — it floats above the hero video.
- Mobile dropdown background: solid white with `shadow-lg`.

**Block 3 · Layout primitive**
- Desktop: three-zone flex — logo (left), absolutely centered pill (center), CTA (right).
- Mobile: logo (left) + hamburger toggle (right). Dropdown stacks vertically.

**Block 4 · Elements**

> **Logo**
> - Position: left, `relative z-50` so it stays above the open mobile dropdown.
> - Element: `<a href="#" aria-label="Chipmuk">` wrapping `<img>`.
> - Image: `src="/logo.png"`, `alt="Chipmuk"`, `width={40}`, `height={40}`, classes `h-10 w-10 object-contain`.
> - The logo file is a black chipmunk silhouette on a transparent background, placed at `public/logo.png`.

> **Center pill nav (desktop only)**
> - Position: `hidden md:flex absolute left-1/2 -translate-x-1/2`
> - Container: `bg-gray-900 rounded-full px-2 py-1.5`
> - Renders `NAV_ITEMS.map(...)`:
>   - First item (active): `bg-white text-gray-900 text-sm font-medium px-4 py-1.5 rounded-full`
>   - All other items: `text-gray-300 text-sm font-medium px-4 py-1.5 rounded-full hover:text-white transition-colors`

> **CTA Button (desktop, "Start a project")**
> - Position: right side of nav.
> - Classes: `hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-700 transition-colors`
> - Children, in order: `<span className="w-2 h-2 rounded-full bg-green-400" />` then the text `Start a project`.

> **Hamburger toggle (mobile only)**
> - Classes: `md:hidden relative z-50`
> - Aria label flips between `'Open menu'` / `'Close menu'` based on state.
> - Icon: `<Menu size={22} className="text-gray-900" />` when closed, `<X size={22} className="text-gray-900" />` when open.

> **Mobile dropdown items**
> - Each link: `text-gray-800 text-base font-medium py-3 border-b border-gray-100 text-left hover:text-gray-500 transition-colors`
> - All four `NAV_ITEMS` repeated here (active styling is desktop-only).
> - After the links, the same "Start a project" button, centered with `mt-4 mx-auto`, otherwise identical to the desktop CTA.

**Block 5 · Animation**
- No entry animation.
- Hovers use Tailwind's `transition-colors` only.

**Block 6 · Responsive notes**
- `<768px`: logo + hamburger only; pill nav and desktop CTA are `hidden`.
- `≥768px`: pill nav + desktop CTA visible; hamburger hidden.

**Block 7 · Copy (verbatim)**

```
NAV_ITEMS: Work · About · Journal · Contact
CTA:       Start a project
```

---

### SECTION 2 — HERO

**Block 1 · Container**
- Wrapper: `<section className="relative h-screen w-full overflow-hidden bg-background">`
- No max-width; the section fills the viewport.

**Block 2 · Background**
- Asset: mouse-scrub video (Layer 5).
- Overlay: `absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent` with `pointer-events-none` and `aria-hidden`.
- z-stacking: video (no z) → overlay (no z, painted after video) → content `z-10`.

**Block 3 · Layout primitive**
- Outer content layer: `relative z-10 flex flex-col h-full`
- Inner anchor row: `flex-1 flex items-end pb-16 sm:pb-20 lg:pb-24 px-6 lg:px-12` — pins the heading block to the bottom.
- Heading wrapper: `relative lg:ml-12 max-w-[900px]`

**Block 4 · Elements**

> **Heading (`<h1>`)**
> - Font: `font-display font-black` (Poppins 900)
> - Size: `text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px]`
> - Style: `uppercase text-cream leading-[1.05] tracking-tight whitespace-nowrap`
> - Inline style: `style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}`
> - `whitespace-nowrap` is mandatory — it guarantees exactly three rendered lines regardless of viewport width, with horizontal overflow clipped by the section's `overflow-hidden`.
> - Text (with explicit `<br />` line breaks):
>   ```
>   Tiny brains
>   build ( wild )
>   ideas out loud
>   ```
>   The parentheses around `wild` have **literal single spaces inside the brackets**, authored in JSX as:
>   ```jsx
>   build {'( '}wild{' )'}
>   ```

**Block 5 · Animation**
- No entry animation.
- The only "animation" is the user-driven video scrub.

**Block 6 · Responsive notes**
- `<640px` (base): heading `28px`, bottom padding `64px`, horizontal padding `24px`.
- `≥640px` (`sm:`): heading `40px`, bottom padding `80px`.
- `≥768px` (`md:`): heading `52px`.
- `≥1024px` (`lg:`): heading `64px`, bottom padding `96px`, horizontal padding `48px`, heading wrapper indented `ml-12`.
- Heading uses fixed pixel sizes (not `clamp()`) because `whitespace-nowrap` forces overflow; let the section clip on micro-viewports rather than reflow.

**Block 7 · Copy (verbatim)**

```
Tiny brains
build ( wild )
ideas out loud
```

---

## LAYER 8 — ANIMATION / INTERACTION STANDARDS

```js
// Mouse-scrub physics
const SENSITIVITY = 0.8           // higher = faster scrub per unit mouse delta
const SEEK_THRESHOLD = 0.01       // seconds — minimum |target − current| to issue a new seek

// Hover transitions (Tailwind utility, applied per element)
// transition-colors  — links and CTA color shifts
// (no transform, no opacity easing — the hero is interaction-led, not motion-led)
```

**No global animation library.** No Framer Motion. No GSAP. The page reads as intentionally quiet so the video scrub is the only moving element under the user's control.

---

## LAYER 9 — RESPONSIVE STANDARDS

- **Mobile-first.** Base classes target the smallest viewport; `sm: md: lg:` scale up.
- **Hero typography:** fixed pixel scale, not `clamp()`. The four breakpoints (28 / 40 / 52 / 64 px) are tuned to keep three lines fitting at desktop while leaving meaningful padding at mobile.
- **Navbar padding:** `px-5 sm:px-8` horizontal, `py-4 sm:py-5` vertical.
- **Hero padding:** `px-6 lg:px-12` horizontal, `pb-16 sm:pb-20 lg:pb-24` bottom.
- **Mobile menu:** required because the desktop pill nav has four links and is `hidden md:flex`. Slide in / out as a conditional sibling of `<nav>` — no exit animation needed.
- **Section overflow:** the hero `<section>` is `overflow-hidden` — `whitespace-nowrap` heading will clip rather than reflow on viewports below ~380 px.

---

## LAYER 10 — ICON SET

**Use only the icons listed below.** The agent must reject any icon name not in this allowlist.

```
- Menu  (lucide-react)  — opens the mobile dropdown; never shown when dropdown is open
- X     (lucide-react)  — closes the mobile dropdown; never shown when dropdown is closed
```

Both icons render at `size={22}` with class `text-gray-900`. No other lucide icons appear on the page. CTA buttons use a 2×2 px green dot (`w-2 h-2 rounded-full bg-green-400`) instead of an icon for status affordance.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute fonts. "Similar to Poppins" is not Poppins. "Caveat-like script" is not Caveat.
- Round color values. `#010828`, `#EFF4FF`, `#6FFF00` — no rounding, no "close enough".
- Shorten or rephrase copy. The heading is "Tiny brains / build ( wild ) / ideas out loud" — with the spaces inside the parentheses.
- Skip the `whitespace-nowrap` on the heading — it is the contract that guarantees three lines.
- Swap the CloudFront video URL for a placeholder. Wire the URL in Layer 5 directly; if a local copy is needed, derive it from that source.
- Add autoplay / loop / controls to the `<video>` element.
- Add an animation library. The scrub interaction is the animation.
- Add a separate `<source>` child — pass `src` on the `<video>` element directly.
- Introduce React state for the scrub algorithm — use a single `useRef` object as specified.

If a constraint conflicts with framework limitations (e.g. a weight is missing from the Google Fonts subset), **clamp to the nearest valid value and leave a one-line comment noting the substitution** — do not silently change.

---

# PROJECT FILE LAYOUT (reference)

```
chipmuk/
├── index.html                  # Title "Chipmuk", Google Fonts link, preconnects
├── package.json                # react 18 · react-dom 18 · lucide-react · tailwindcss 3 · vite 5 · typescript 5
├── postcss.config.js
├── tailwind.config.js          # extends colors {background, cream, neon} + fontFamily {display, script}
├── tsconfig.json · tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── logo.png                # chipmunk silhouette (black on transparent)
│   └── character.mp4           # local re-encode of the CloudFront source (all-intra, 1024px)
└── src/
    ├── index.css               # @tailwind directives + body resets + .liquid-glass
    ├── main.tsx                # React.StrictMode + createRoot
    ├── App.tsx                 # <><Navbar /><Hero /></>
    ├── vite-env.d.ts
    └── components/
        ├── Navbar.tsx          # Layer 7 · Section 1
        └── Hero.tsx            # Layer 7 · Section 2
```

---

# CUSTOMIZATION CHEAT SHEET

When adapting this prompt for a new variant of the same hero, edit only these slots:

| Slot | Where | What to swap |
|---|---|---|
| `BRAND_NAME` | Layer 1 + page title + logo alt | "Chipmuk" → your brand |
| `VIDEO_URL` | Layer 5 + Hero `VIDEO_SRC` | CloudFront URL of a different head-turn video |
| `SENSITIVITY` | Layer 5 + Layer 8 | Default 0.8 — increase for snappier scrub, decrease for cinematic feel |
| Heading copy | Layer 7 · Section 2 · Block 7 | Three lines, second line may use the `( word )` parenthetical pattern |
| Nav items | Layer 7 · Section 1 · Block 7 | 3–6 items; first is rendered active |
| CTA label | Layer 7 · Section 1 · Block 4 | Keep the green dot + short verb |
| Heading font | Layer 2 + Tailwind `display` | Pair must include a 900 weight or clamp note required |
| Accent color | Layer 3 `neon` | Used only on the green dot today; reserved for cursive overlays in variants |
| Logo file | `public/logo.png` | 40×40 contain, transparent background |

**Everything else (Layers 4, 6, 8, 9, 11) is INVARIANT.** Keep it as-is — that is what makes the output reproducibly Chipmuk.

---

# WORKED EXAMPLE — 30-SECOND CUSTOMIZATION

Make a sister hero for a brand called **"Orbis.Nft"** (cosmic / NFT vibe):

- `BRAND_NAME` → `Orbis.Nft`
- Heading copy → `Beyond earth / and ( its ) familiar / boundaries`
- Heading font → `Anton` (display, single weight) + `Condiment` (cursive overlay)
- Add a cursive accent `<span>` absolutely positioned over the top-right of the heading wrapper, `font-script text-neon -rotate-1 opacity-90` with inline `mixBlendMode: 'exclusion'` and the text "Nft collection"
- Nav items → `Device · Real Stories · Science · Plans · Reach Us`
- CTA → "Reserve Yours"
- Logo → geometric inline SVG (28×28) filled `#111111` instead of the chipmunk PNG
- Keep the video, scrub algorithm, gradient overlay, and color tokens unchanged

Everything else stays. Paste into the agent → ship in five minutes.

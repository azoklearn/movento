## Azaka Creative Director Hero Prompt

> Paste this entire prompt into your AI builder (Claude Code, Cursor, v0, Lovable, Bolt, Windsurf).
> Reproduce exactly — see the final clause.

---

## LAYER 1 — OPENING DECLARATION

Build a **single-screen hero landing page** for **Azaka** — a **creative director personal brand**.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, JSX)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (`@import 'tailwindcss'` in index.css)
- **GSAP 3.12+** for all animation (no other animation library)

The aesthetic is **dark cinematic minimal: a full-viewport video of a model against a black studio backdrop, two massive white display words anchored to opposite edges, hairline UI, and a custom two-layer cursor**. `#050505` is the global background. Default text color is `#ffffff`. **Do not use any accent color anywhere — the page is strictly black, white, and white-alpha tints.**

The page never scrolls: `html, body { overflow: hidden }`, one `100vh` section.

Everything lives in one component: `src/App.jsx`. Page `<title>`: `Azaka — Creative Director`. Files: `index.html`, `src/main.jsx` (StrictMode + createRoot), `src/index.css`, `src/App.jsx`. Dev server port **6150**.

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```
Inter Tight : 400 / 500 / 600 / 700  → display headline (class .font-display)
Inter       : 400 / 500 / 600        → body & UI (html default)
```

`.font-display { font-family: 'Inter Tight', 'Inter', sans-serif; }` — the only place Inter Tight appears. Everything else inherits Inter from the body rule (Layer 3).

---

## LAYER 3 — COLOR SYSTEM

Only motion tokens live on `:root`; color is applied with Tailwind utilities and literal values:

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-quick: 300ms;
  --dur-slow: 700ms;
}

html, body {
  height: 100%;
  background: #050505;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
```

| Role | Value |
|---|---|
| Page bg | `#050505` |
| Primary text | `#ffffff` |
| Intro paragraph | `text-white/75` |
| Footer labels | `text-white/80` |
| Menu link | `text-white/90` |
| Cursor ring border | `rgba(255,255,255,0.85)` |

---

## LAYER 4 — CUSTOM CSS UTILITIES (invariant — paste verbatim)

### 4a. Display headline

```css
.headline {
  font-size: clamp(56px, 10.5vw, 190px);
  line-height: 0.86;
  letter-spacing: -0.035em;
  font-weight: 500;
}
```

### 4b. Link underline swipe (hover re-draws the underline left→right)

```css
.link-underline { position: relative; }
.link-underline::after {
  content: '';
  position: absolute; left: 0; bottom: -3px;
  width: 100%; height: 1px; background: currentColor;
  transform-origin: right; transform: scaleX(1);
  transition: transform var(--dur-quick) var(--ease-out-expo);
}
.link-underline:hover::after {
  transform-origin: left;
  animation: underline-swipe 0.5s var(--ease-out-expo);
}
@keyframes underline-swipe {
  0%   { transform: scaleX(1); transform-origin: right; }
  50%  { transform: scaleX(0); transform-origin: right; }
  51%  { transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
}
```

### 4c. Custom cursor base

```css
@media (pointer: fine) {
  html, body, a, button { cursor: none; }
}
.cursor-dot, .cursor-ring {
  position: fixed; top: 0; left: 0;
  pointer-events: none; z-index: 90; will-change: transform;
}
.cursor-dot {
  width: 6px; height: 6px; border-radius: 9999px;
  background: #fff; mix-blend-mode: difference;
}
.cursor-ring {
  width: 44px; height: 44px; border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  mix-blend-mode: difference;
  display: flex; align-items: center;
  justify-content: space-between; padding: 0 7px;
}
.cursor-ring .chev {
  font-size: 9px; line-height: 1; color: #fff;
  font-family: 'Inter', sans-serif;
  transition: opacity var(--dur-quick) var(--ease-out-expo);
}
```

### 4d. Reduced motion guard

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## LAYER 5 — BACKGROUND ASSET (the signature interaction)

The background is a **mouse-scrubbed video of a person turning their head**: move the cursor left and the person looks left; move right and they look right; center = facing camera. This is achieved by seeking a fully-buffered, all-keyframe video — not by playing it.

**Assets** — download both and serve locally from `public/`, do not hotlink:

- `https://cdn.5sdesign.art/projects/azaka/azaka-scrub.mp4` → save to `public/azaka-scrub.mp4` (all-intra, 24fps, 6.04s — the anchors below match this file)
- `https://cdn.5sdesign.art/projects/azaka/poster.jpg` → save to `public/poster.jpg`

**If you swap in your own footage** (run once, outside the app): re-encode so every frame is a keyframe, then export a forward-facing poster frame — and retune the four anchors:

```bash
ffmpeg -i source.mp4 -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 \
  -x264-params scenecut=0 -pix_fmt yuv420p -an -movflags +faststart \
  public/azaka-scrub.mp4
ffmpeg -ss 0.15 -i source.mp4 -frames:v 1 -q:v 2 public/poster.jpg
```

**Timeline anchors** (adjust to your own clip; these are for the 6.04s / 24fps master):

```js
const FWD_L    = 0.15  // facing forward — left-turn segment start
const LEFT_MAX = 1.5   // full left profile
const FWD_R    = 4.7   // facing forward — right-turn segment start
const RIGHT_MAX= 5.95  // full right profile
```

**Runtime spec (implement exactly):**

1. `fetch('/azaka-scrub.mp4')` → `blob` → `URL.createObjectURL` → `<video>` src. Seeks are instant because the file is in memory and all-intra.
2. `<video muted playsInline preload="auto">`, `absolute inset-0 h-full w-full object-cover`. Never call `play()`.
3. On `loadeddata`: set `currentTime = FWD_L`, flag `ready`, cross-fade poster→video over 700ms.
4. Pose model: `pose ∈ [-1, 1]` (−1 full left, 0 forward, +1 full right).
   - `mousemove`: `targetPose = clamp(-1, 1, (clientX / innerWidth - 0.5) / 0.35)`
   - rAF loop: `pose += (targetPose - pose) * 0.09` (snap when |Δ| < 0.001)
   - `poseToTime(p) = p < 0 ? FWD_L + (-p)(LEFT_MAX - FWD_L) : FWD_R + p(RIGHT_MAX - FWD_R)`
   - Seek only when `!video.seeking && |currentTime - t| > 1/48`.
   The two forward anchors are near-identical frames, so crossing pose 0 never visibly jumps.
5. Above the video, a seat vignette: `pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45)_100%)]`.
6. Poster `<img src="/poster.jpg">` sits underneath and fades out when ready.

---

## LAYER 6 — SHARED COMPONENTS

### `Cursor` — two-layer magnetic cursor (dot + trailing ring with turn hints)

```js
// Skip entirely when matchMedia('(pointer: coarse)').matches.
// gsap.set both layers: xPercent -50, yPercent -50, x -100, y -100, opacity 0.
// quickTo followers:
//   dot : x/y duration 0.08, ease power2.out   (glued to pointer)
//   ring: x/y duration 0.45, ease power3.out   (lags behind)
// First mousemove: snap both to pointer, fade opacity → 1 over 0.3s.
// document mouseleave → fade 0 (0.25s); mouseenter → fade back.
// Ring content: two chevron glyphs "◀" and "▶" (class .chev) at its left/right inner edges.
// Hover any <a>/<button>:
//   ring → scale 1.7, borderColor rgba(255,255,255,0.35), 0.35s power3.out
//   chevrons → opacity 0 (0.2s).  Leave → reverse both.
```

### Intro timeline + headline parallax (run once on mount)

```js
// gsap.timeline defaults { ease: 'power4.out' }
//   [data-headline]: from { yPercent: 60, opacity: 0 }, duration 1.4, stagger 0.12, at 0.2
//   [data-fade]:     from { y: 24, opacity: 0 },        duration 1.0, stagger 0.08, at 0.7
// Parallax on the headline wrapper [data-parallax] via gsap.quickTo (duration 0.8, power3.out):
//   x = (clientX/innerWidth  - 0.5) * -14
//   y = (clientY/innerHeight - 0.5) * -8
```

---

## LAYER 7 — SECTIONS

### SECTION 1 — Hero (the only section)

**Block 1 · Container**
- `<main className="relative h-screen w-screen overflow-hidden bg-[#050505]">`

**Block 2 · Background**
- Layer 5 scrub video. Stacking: poster/video z-0 → vignette overlay → headline z-10 → UI z-20 → cursor z-90.

**Block 3 · Layout primitive**
- Absolute positioning for every element (no flow layout except header/footer rows).

**Block 4 · Elements**

> **Header row**
> - `absolute top-0 left-0 z-20 flex w-full items-center justify-between px-8 py-7 md:px-12`
> - Logo link: `font-display text-[15px] font-semibold tracking-[0.08em]`, text **"AZAKA"** + superscript **"®"** (`align-super text-[9px] font-normal`), `data-fade`
> - Menu link: `link-underline text-[14px] font-medium text-white/90`, text **"Menu"**, `data-fade`

> **Headline — two words on opposite edges** (wrapper: `data-parallax`, `pointer-events-none absolute inset-0 z-10`)
> - Word 1: `<h1 className="font-display absolute top-[26%] left-[3vw] text-white">` → `<span data-headline className="headline block">Creative</span>`
> - Word 2: `<h1 className="font-display absolute top-[52%] right-[3vw] text-white">` → `<span data-headline className="headline block">Direction</span>`
> - "Creative" hugs the LEFT edge and sits directly above the intro copy; "Direction" hugs the RIGHT edge at mid-height, crossing the model's shoulder line.

> **Intro copy block**
> - `absolute top-[44%] left-8 z-20 max-w-[230px] md:left-12`
> - Paragraph: `text-[13.5px] leading-[1.55] text-white/75`, `data-fade`
> - Link below: `link-underline mt-6 inline-block text-[13.5px] font-medium text-white`, text **"Know more"**, `data-fade`

> **Footer services row**
> - `absolute bottom-0 left-0 z-20 flex w-full items-center justify-between px-8 py-7 text-[13px] text-white/80 md:px-12`
> - Four spans, each `data-fade`; the middle two get `hidden sm:block`.

**Block 5 · Animation** — exactly the Layer 6 intro timeline. No scroll triggers (page doesn't scroll).

**Block 6 · Responsive notes**
- Mobile: headline clamps to 56px floor; middle footer labels hidden; custom cursor disabled (coarse pointer); video stays `object-cover` centered.
- Desktop: side paddings step `px-8 → md:px-12`.

**Block 7 · Copy (verbatim)**

```
AZAKA ®
Menu
Creative
Direction
I guide creative direction, define visual language, and ensure every detail aligns with the brand's vision.
Know more
Art Direction
Brand Design
Web design
Motion Design
```

---

## LAYER 8 — ANIMATION STANDARDS

```js
// Eases
intro:      'power4.out'
cursor dot: 'power2.out'
cursor ring / parallax / hover: 'power3.out'
CSS micro-interactions: cubic-bezier(0.16, 1, 0.3, 1)

// Key numbers (do not round)
headline entry: duration 1.4, stagger 0.12, start 0.2s
ui fade entry:  duration 1.0, stagger 0.08, start 0.7s
pose lerp:      0.09 per frame
seek threshold: 1/48 s
parallax range: x ±7px equiv (×-14 factor), y ±4px equiv (×-8 factor)
poster crossfade: 700ms
```

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile-first Tailwind classes; single 100vh screen, no scroll at any breakpoint.
- Headline uses `clamp()` — never a fixed px size.
- Container padding rhythm: `px-8 md:px-12`, vertical `py-7`.

---

## LAYER 10 — ICONS

This asset uses **no icon library**. The only glyphs are the two text chevrons (`◀` `▶`) inside the cursor ring and the superscript `®` in the logo. Reject any request to add lucide/other icons.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute fonts ("similar to Inter Tight" is not Inter Tight).
- Round color or alpha values (`white/75` is not `white/70`).
- Reposition the headline words (top-[26%]/left-[3vw] and top-[52%]/right-[3vw] are exact).
- Replace the scrub-seek video mechanic with autoplay/loop — the video must follow the mouse.
- Skip the all-intra re-encode step; a normal H.264 file will stutter on seek.
- Change animation numbers ("smooth entrance" is not duration 1.4, stagger 0.12, power4.out).
- Add sections, icons, or accent colors.

If a constraint conflicts with a framework limitation, clamp to the nearest valid value and note the substitution in a code comment — do not silently change.

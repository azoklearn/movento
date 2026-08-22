# 1Brain — Software Engineering Studio

## LAYER 1 — OPENING DECLARATION

Build a **single-page landing site** for **1Brain** — a **software engineering studio that builds production-grade products at the intersection of design and deep technical craft**.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin — configured entirely in CSS with `@theme`, **no `tailwind.config.js`**.
- **`motion`** (Framer Motion v12+, imported from `motion/react`).
- **`lenis`** for smooth scrolling, **desktop only**.
- **No icon library.** The only icon is a custom inline brain SVG (Layer 10). Do not import `lucide-react`, Phosphor, Tabler, or any icon package.

The aesthetic is **dark and cinematic**: a fixed fullscreen background video scrubbed frame-by-frame by scroll (never autoplayed), clean Outfit typography, character-by-character text-scramble headings, and frosted liquid-glass cards floating over the video. `#000000` is the global background; default text color is `#ffffff`.

**The palette is strictly black, white, and translucent white.** Do not use purple, indigo, violet, neon green, or any saturated accent color anywhere.

**There must be NO dark overlay on the video** — no semi-transparent black layer, no `bg-black/50`, no `::after` tint, no gradient sheet over the video. The video shows at full natural brightness. The only darkening permitted is the single bottom-edge blur element (Layer 6) and the solid content the sections naturally carry.

**Package versions (pin exactly):**

```json
{
  "dependencies": {
    "lenis": "^1.3.23",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.14",
    "typescript": "^5.6.3",
    "vite": "^6.0.5"
  }
}
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`index.html` — `<html lang="en">`, charset UTF-8, the favicon link `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`, viewport meta, a meta description, title `1Brain — Software Engineering Studio`, a `<div id="root">`, and `<script type="module" src="/src/main.tsx">`. Meta description:

```html
<meta
  name="description"
  content="1Brain — a software engineering studio building production-grade products at the intersection of design and deep technical craft."
/>
```

**Critical build note:** `src/main.tsx` renders `<App />` with `createRoot` and is **NOT** wrapped in `<StrictMode>`. The dev double-invocation would spin up two Lenis instances and two `requestAnimationFrame` scrub loops, which fight the single-source-of-truth scroll → video-frame seeking logic. Mount once, plainly:

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// NOTE: StrictMode is intentionally omitted. Its dev double-invocation would
// spin up two Lenis instances and two requestAnimationFrame scrub loops, which
// fights the single-source-of-truth scroll → video-frame seeking logic.
createRoot(document.getElementById("root")!).render(<App />);
```

---

## LAYER 2 — FONTS

Use **Outfit** (Google Fonts) for **every** family — sans, serif, and mono all map to Outfit. Load it and Tailwind v4 at the top of `src/index.css`, then override every font theme var inside `@theme`:

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap");
@import "tailwindcss";

/* Force "Outfit" everywhere by overriding every Tailwind font theme var. */
@theme {
  --font-sans: "Outfit", sans-serif;
  --font-serif: "Outfit", sans-serif;
  --font-inter: "Outfit", sans-serif;
  --font-mono: "Outfit", sans-serif;
}

html,
body {
  font-family: var(--font-sans);
  background-color: #000000;
  color: #ffffff;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

* {
  box-sizing: border-box;
}

::selection {
  background: rgba(255, 255, 255, 0.85);
  color: #000000;
}
```

Weights loaded: `300 400 500 600 700 800`. Headings use `font-light` (300); body uses default/`font-medium`/`font-semibold`. Do not load or synthesize a weight outside the set above.

---

## LAYER 3 — COLOR SYSTEM

Single dark theme. No CSS color variables are needed beyond the font theme — express every color directly with Tailwind opacity utilities.

```
Background       #000000              bg-black
Foreground       #ffffff              text-white
Body text        white @ 55–75%       text-white/55  text-white/60  text-white/70  text-white/75
Muted labels     white @ 40%          text-white/40
Hairlines        white @ 10–20%       border-white/10  border-white/15  border-white/20
Glass fill       white @ 8%           bg-white/[0.08]
Glass highlight   white @ 15–25%       borders, sheens, inset shadow
Button (CTA)     #ffffff bg / #000 text;  hover background #e2e2e6
```

**Forbidden:** any hue. Everything is neutral — black, white, or translucent white.

---

## LAYER 4 — CUSTOM CSS UTILITIES (design DNA — paste verbatim)

### 4a. Lenis smooth-scroll compatibility (in `src/index.css`, after the `::selection` rule)

```css
/* ---- Lenis smooth-scroll compatibility ---- */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
```

### 4b. Liquid-glass surface

Implemented as a React component (`GlassPanel`, Layer 6) built from one composed Tailwind className string — **not** a global CSS class:

```
relative overflow-hidden rounded-[28px]
border border-white/15 bg-white/[0.08]
backdrop-blur-2xl backdrop-saturate-150
shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22)]
```

Plus two non-interactive decorative children inside it:

- Top specular sheen: `pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/15 to-transparent`
- Corner glow: `pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_70%)]`

### 4c. Ambient dot grid (hero decoration)

```
pointer-events-none absolute inset-0
bg-[radial-gradient(#ffffff_1px,transparent_1px)]
opacity-[0.05] [background-size:24px_24px]
```

---

## LAYER 5 — BACKGROUND ASSET

**Looping background video, scroll-scrubbed (NOT autoplayed).** Reference the hosted clip:

```
https://cdn.5sdesign.art/projects/1brain/background.mp4
```

The video element carries `loop muted playsInline preload="auto"` and is **never** played — its `currentTime` is driven solely by scroll. It lives in a fixed fullscreen wrapper at the lowest layer; the full seeking + entrance logic is in Layer 6 (`LiquidVideoCanvas`). Do not swap this URL for a local `/background.mp4`, a placeholder, or any other external source.

**Z-index stacking (must follow exactly):**

```
video wrapper   fixed inset-0 z-[1]      ← lowest
content (main)  relative z-10            ← hero + glass sections
bottom blur     fixed bottom-0 z-30
header          fixed top-0 z-50         ← topmost
```

The root wrapper is `relative overflow-x-hidden`. No element above the video may set a background color that covers the video across the hero / glass zone.

---

## LAYER 6 — SHARED COMPONENTS (define once, use everywhere)

### `src/lib/scramble.ts`

```ts
// Glyph pool used by both the scroll-driven ScrambleIn and the hover ScrambleText.
export const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

export function randomGlyph(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}
```

### `Logo` — custom brain mark (the ONLY icon in the project)

Stroke-based brain, inherits `currentColor`. Exact SVG (`src/components/Logo.tsx`):

```tsx
// Brain mark — two hemispheres, drawn as strokes so it inherits text color.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
```

A matching `public/favicon.svg` shows the same mark — a black rounded square with the white four-fold brain lobes — referenced from `index.html`.

### `LiquidVideoCanvas` — fixed fullscreen, scroll-scrubbed video

Module constants: `VIDEO_URL = "https://cdn.5sdesign.art/projects/1brain/background.mp4"`, `LERP = 0.12`, `MAX_ERRORS = 3`, `SAFETY_TIMEOUT = 3500`. Prop: `onEntranceComplete?(): void`. The component owns a `videoRef` and a `started` state.

**Wrapper** (`motion.div`):

- className `fixed inset-0 z-[1] overflow-hidden bg-black` — `bg-black` is visible ONLY before the first frame paints; there is NO overlay over the video.
- `initial={{ scale: 1.12, opacity: 0 }}`; `animate={ started ? { scale: 1, opacity: 1 } : { scale: 1.12, opacity: 0 } }`; `transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}`.
- `onAnimationComplete` → call `onEntranceComplete?.()` when `started` is true.

**Video element:** `absolute inset-0 h-full w-full object-cover`, `src={VIDEO_URL}`, attributes `loop muted playsInline preload="auto"`, inline `style={{ willChange: "transform, filter" }}`. **Never call `.play()`.**

**Entrance trigger (effect):** `started` flips true once the video reaches `readyState >= 3` (check immediately, and listen to `loadeddata`, `canplay`, `canplaythrough`) OR after the `SAFETY_TIMEOUT` of 3500ms — whichever fires first. Guard so it fires only once. Remove listeners and clear the timer on cleanup.

**Scroll-scrub loop (a second effect, `requestAnimationFrame`):**

- `getProgress()` = `Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.5)))`. If the distance is `<= 0`, return `0`. The full clip scrubs across the first ~1.5 screens of scroll, then holds the last frame while the solid content sections slide up over the video.
- **Visual effects applied directly to `video.style` (NOT React state), every tick:**
  - **Blur:** `progress < 0.5 ? progress * 10 : 5 + (progress - 0.5) * 100` → gentle `0 → 5px` in the first half, aggressive `5 → 55px` in the second. `video.style.filter = blur(${blur.toFixed(2)}px)`.
  - **Scale:** `1.03 + progress * 0.08` (1.03 → 1.11). `video.style.transform = scale(${scale.toFixed(4)})`.
- **Frame seeking with LERP + the `!video.seeking` guard (critical):**

  ```
  duration = video.duration            // bail if falsy / NaN / aborted
  target   = progress * duration
  smoothed += (target - smoothed) * LERP        // LERP = 0.12
  clamped  = Math.min(duration - 0.05, Math.max(0, smoothed))
  applySeek(clamped)
  ```

  `applySeek(time)`: only set `video.currentTime = time` when `!isSeeking && !video.seeking`, then set `isSeeking = true`. Otherwise queue the value in `nextSeekTime`. On the `seeked` event set `isSeeking = false` and, if a `nextSeekTime` is queued, apply it. On `seeking`, set `isSeeking = true`. Wrap the assignment in try/catch: count consecutive errors and, after `MAX_ERRORS` (3) in a row, set `aborted = true` and stop seeking; a successful seek resets the counter to 0. This `!video.seeking` guard is what prevents black frames and stutter from overlapping seeks. Cancel the rAF and remove the `seeked` / `seeking` listeners on cleanup.

### `ProgressiveBlur` — bottom-edge blur (the ONLY frame darkener)

`motion.div`, className `pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-[150px]`. Accepts an optional `opacity` MotionValue. Inline style:

```
opacity: <MotionValue>
backdropFilter: "blur(4px)"   (+ WebkitBackdropFilter: "blur(4px)")
maskImage: "linear-gradient(to bottom, transparent 0%, #000 65%, #000 100%)"   (+ WebkitMaskImage)
background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.9) 100%)"
```

It never covers the full viewport — only the bottom 150px — and fades out (via `opacity`) once past the hero so the content sections stay clean.

### `GlassPanel` — liquid-glass surface wrapper

Props: `className?`, `children`. Renders a `div` whose className is the Layer 4b glass string plus the incoming `className`, then the two decorative children (top sheen, corner glow), then `<div className="relative">{children}</div>` so content sits above the sheen.

### `ScrambleText` — hover decode (used on buttons)

Props: `text`, `isHovered`, `className`. While hovered, run a `window.setInterval` at **25ms** (~40 FPS). A frame counter starts at 0; character `i` locks to its final glyph once `frame >= i * 4`, otherwise it shows `randomGlyph()` (spaces stay spaces). Total run = `text.length * 4 + 4` frames, then show the final text and clear the interval. On unhover, immediately reset the display to `text`. Renders `<span className={className}>{display}</span>`.

### `ScrambleIn` — scroll-aware heading scramble

Props: `text`, `scrollProgress` (a MotionValue), `delay?` (default 0), `trigger` (boolean), `className?`. `NBSP = " "` (a literal non-breaking space), `TOP_THRESHOLD = 0.015`. Initial display = `NBSP.repeat(text.length)` (prevents layout shift). A `phaseRef` walks through `idle → in → shown → out → hidden`; opacity is local state starting at 1.

- **Scramble in (900ms, rAF):** progress `p = (now - start) / 900`. For character `i`: spaces stay spaces; `charStart = (i / len) * 0.65`, `local = (p - charStart) / 0.35`. If `local <= 0` → NBSP; `>= 1` → final char; else → `randomGlyph()`. On finish set the final text and phase `shown`. Set opacity back to 1 at the start.
- **Scramble out (700ms, rAF):** progress `p = (now - start) / 700`. Set opacity to `1 - p`. Each char shows `randomGlyph()` while `p < 0.85`, else NBSP. On finish set all-NBSP and phase `hidden`.
- **Entrance trigger:** when `trigger` becomes true and `phaseRef === "idle"`, after `delay` seconds, if `scrollProgress.get() < TOP_THRESHOLD` set phase `in` and run scramble-in.
- **Scroll reaction:** `useMotionValueEvent(scrollProgress, "change", v)` — if `v > TOP_THRESHOLD` and phase is `shown` or `in` → phase `out`, scramble out; if `v < TOP_THRESHOLD` and phase is `out` or `hidden` → phase `in`, scramble in. Always cancel the previous rAF before starting a new one; clear the rAF and timeout on unmount. Renders `<span className={className} style={{ opacity }}>{display}</span>`.

---

## LAYER 7 — SECTIONS

Page order: **Header (fixed) → Hero → Highlight (glass) → Contact (glass)**. The video shows through all three content sections — no solid background covers it.

### App composition (`src/App.tsx`)

- Root: `<div className="relative overflow-x-hidden">`.
- `entranceDone` state, set by `LiquidVideoCanvas onEntranceComplete`; drives the `visible` prop on `Header` and `Hero`.
- `isMobile()` helper: a UA regex test (`/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i`) OR `window.innerWidth < 768`.
- **Hero-scoped scroll:** `const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })` — 0 at the top, 1 once the hero has scrolled fully out. Pass `heroProgress` to `Hero` (as `scrollProgress`).
- **Blur fade:** `const blurOpacity = useTransform(heroProgress, [0, 0.7, 1], [1, 1, 0])`, passed to `ProgressiveBlur`.
- **Lenis (desktop only):** in an effect, bail early if `isMobile()`. Otherwise `new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 1.5 })`, driven by a `requestAnimationFrame(lenis.raf)` loop; store the instance in `lenisRef`; on cleanup `cancelAnimationFrame`, `lenis.destroy()`, clear the ref.
- `scrollToContact()`: find `#contact`; if Lenis exists `lenisRef.current.scrollTo(el, { duration: 1.4 })`, else `el.scrollIntoView({ behavior: "smooth", block: "start" })`.
- **Render order:** `LiquidVideoCanvas` → `Header` → `<main className="relative z-10">` containing `Hero`, `Highlight`, `Contact` → `ProgressiveBlur`.

---

### SECTION 1 — HEADER (fixed, z-50)

- `motion.header`, `fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between px-4 sm:px-8`. Transparent background. Holds local `contactHovered` state.
- Fades in only after the video entrance completes: `initial={{ opacity: 0 }}`, `animate={{ opacity: visible ? 1 : 0 }}`, `transition={{ duration: 0.8, ease: "easeOut" }}`.
- **Logo pill (left):** `motion.div`, `flex h-9 cursor-pointer items-center gap-2 rounded-[14px] bg-white/15 px-3 backdrop-blur-md sm:h-12 sm:gap-2.5 sm:px-5`. Contains the brain `Logo` (`h-4 w-4 text-white sm:h-5 sm:w-5`) + text **1Brain** (`text-[13px] font-semibold text-white sm:text-[16px]`). `whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}`, `whileTap={{ scale: 0.98 }}`, `transition={{ type: "spring", stiffness: 400, damping: 28 }}`.
- **Contact button (right):** `motion.button type="button"`, `flex h-9 items-center rounded-full bg-white px-5 text-black sm:h-12 sm:px-7`. Content = `ScrambleText` text **Contact** (`text-[13px] font-semibold tracking-tight sm:text-[15px]`), `isHovered={contactHovered}` decoding on hover. `onHoverStart` / `onHoverEnd` toggle `contactHovered`. `whileHover={{ scale: 1.03, backgroundColor: "#e2e2e6" }}`, `whileTap={{ scale: 0.97 }}`, spring `stiffness 400 damping 28`. `onClick` → `onContact()`. No icon.

---

### SECTION 2 — HERO (h-screen, z-10, no background color)

- `motion.section ref={sectionRef}`, `relative z-10 h-screen overflow-hidden px-4 pb-36 pt-20 sm:px-8`. `style={{ opacity: heroOpacity, scale: heroScale }}` where:
  - `heroOpacity = useTransform(scrollProgress, [0, 0.55], [1, 0])`
  - `heroScale   = useTransform(scrollProgress, [0, 0.55], [1, 0.96])`
- Ambient dot grid overlay (Layer 4c), `pointer-events-none`, never blocks the video.
- Inner content wrapper: `motion.div`, `relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-between`, fading in after entrance: `initial={{ opacity: 0 }}`, `animate={{ opacity: visible ? 1 : 0 }}`, `transition={{ duration: 1.0, ease: "easeOut" }}`.
- **Heading style (both headings):** `font-light text-[50px] sm:text-[70px] md:text-[85px] lg:text-[100px] leading-[0.95] tracking-[-0.03em] text-white`.
- **Top row** (`grid grid-cols-1 md:grid-cols-2`): left = `<h1>` with two stacked `block` spans, each a `ScrambleIn` — **Software** (`delay={0}`) then **Engineered** (`delay={0.15}`); both pass `scrollProgress` and `trigger={visible}`. Right column = empty spacer `hidden md:block`.
- **Bottom row** (`grid grid-cols-1 items-end gap-10 md:grid-cols-2`):
  - **Left — description.** Outer `motion.div style={{ opacity: descOpacity, y: descY }}` where `descOpacity = useTransform(scrollProgress, [0, 0.28], [1, 0])` and `descY = useTransform(scrollProgress, [0, 0.28], [0, -30])`. Inner `motion.p`, `max-w-sm text-[14px] leading-relaxed text-white/60 sm:text-[15px]`, entrance `initial={{ opacity: 0, y: 25 }}`, `animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 25 }}`, `transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}`. Text (verbatim):
    > 1Brain is a software engineering studio built at the intersection of design and deep technical craft. We turn ambitious ideas into production-grade products — engineered fast, scaled cleanly, and shipped with one shared mind.
  - **Right — second heading.** `<div className="flex flex-col items-end text-right">` holding `<h2>` (same heading style) with two `ScrambleIn` lines — **One** (`delay={0.3}`) then **Brain** (`delay={0.45}`).

---

### SECTION 3 — HIGHLIGHT (liquid glass over video, z-10)

- `<section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-8 sm:pt-32">`. Transparent — the video shows through.
- Eyebrow: `<span className="text-[12px] uppercase tracking-[0.25em] text-white/60">` → **Why 1Brain**.
- Heading: `<h2 className="mt-6 max-w-3xl text-[32px] font-light leading-[1.05] tracking-[-0.02em] text-white sm:text-[44px] md:text-[56px]">` → **Built to ship, built to last.**
- Grid `mt-14 grid grid-cols-1 gap-6 md:grid-cols-3` of three `GlassPanel className="p-7 sm:p-8"` cards. Each card carries, top to bottom:
  - A number badge: `flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10` with `0{i+1}` (`01` / `02` / `03`) at `text-[14px] font-semibold text-white`.
  - Title: `mt-6 text-[19px] font-medium text-white`.
  - Body: `mt-3 text-[14px] leading-relaxed text-white/75`.

  Card copy (verbatim):
  1. **Senior-only teams** — "No juniors learning on your budget. Every line is written by people who have shipped real products before."
  2. **Weekly, demoable progress** — "You see working software every week — not status decks. Momentum you can actually feel."
  3. **Production from day one** — "Tests, CI, observability, and security are baked in — so launch day is a non-event."

---

### SECTION 4 — CONTACT (liquid glass over video, z-10, `id="contact"`)

- `<section id="contact" className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-8 sm:pb-36">`. Holds local `hovered` state.
- One `GlassPanel className="px-7 py-12 sm:px-16 sm:py-20"` containing:
  - Eyebrow `text-[12px] uppercase tracking-[0.25em] text-white/60` → **Get in touch**.
  - Heading `mt-6 max-w-3xl text-[32px] font-light leading-[1.05] tracking-[-0.02em] text-white sm:text-[44px] md:text-[56px]` → **Let's build something that lasts.** (use `&apos;` for the apostrophe).
  - Paragraph `mt-5 max-w-xl text-[15px] leading-relaxed text-white/70` → "Tell us what you're building. We'll get back to you within one business day."
  - Action row `mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8`:
    - **Primary button:** `motion.a href="mailto:hello@1brain.dev"`, `flex h-12 items-center rounded-full bg-white px-7 text-black`. Content = `ScrambleText` text **Start a project** (`text-[15px] font-semibold tracking-tight`), `isHovered={hovered}` decoding on hover. `onHoverStart` / `onHoverEnd` toggle `hovered`. `whileHover={{ scale: 1.03, backgroundColor: "#e2e2e6" }}`, `whileTap={{ scale: 0.97 }}`, spring `stiffness 400 damping 28`.
    - **Email link:** `<a href="mailto:hello@1brain.dev" className="text-[16px] text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline">` → **hello@1brain.dev**.
  - Details grid `mt-12 grid grid-cols-1 gap-8 border-t border-white/15 pt-8 sm:grid-cols-3`. Each cell: label `text-[12px] uppercase tracking-[0.18em] text-white/40`, value `mt-2 text-[15px] text-white`.
    - **Email** → hello@1brain.dev
    - **Studio** → Remote · Worldwide
    - **Social** → a label cell, then `mt-2 flex gap-5 text-[15px] text-white` of three links — **GitHub** / **X** / **LinkedIn** — each `transition-colors hover:text-white/60`, `href="#"`.

---

## LAYER 8 — ANIMATION STANDARDS

```js
// Easings
const easeOutQuint = [0.22, 1, 0.36, 1];       // video entrance
const easeOutCubic = [0.215, 0.61, 0.355, 1];  // hero description
const headerEase   = "easeOut";                 // header + hero content fade
// Springs (buttons / pills)
const spring = { type: "spring", stiffness: 400, damping: 28 };
// Lenis
const lenisEasing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)); // duration 1.2
// Scramble timings
const scrambleIn = 900;          // ms, left→right per char
const scrambleOut = 700;         // ms, opacity fade to 0
const hoverDecodeInterval = 25;  // ms (~40 FPS), char locks at frame i*4
// LERP smoothing factor for video frame seeking
const LERP = 0.12;
```

**Timeline:** video entrance 1.4s once `readyState >= 3` (3500ms safety fallback) → header fades 0.8s + hero content fades 1.0s after entrance → hero headings scramble in (staggered delays 0 / 0.15 / 0.3 / 0.45) → description rises (0.9s, delay 0.2s). On scroll, the hero fades and scales out across `heroProgress [0, 0.55]`, the description across `[0, 0.28]`, and the headings scramble out once progress crosses `0.015`.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile-first; scale up with `sm: md: lg:`.
- Lenis smooth scroll is **desktop only** — disabled when the UA is mobile or `innerWidth < 768`; mobile uses native scroll.
- Container padding: `px-4 sm:px-8`. Max width: `max-w-7xl mx-auto`.
- Hero headings: `text-[50px] sm:text-[70px] md:text-[85px] lg:text-[100px]`. Section headings: `text-[32px] sm:text-[44px] md:text-[56px]`.
- The header shrinks on mobile (`h-9` pills/buttons, `text-[13px]`) and grows at `sm:` (`h-12`, `text-[15px]`–`16px`).
- Glass grids collapse to `grid-cols-1` on mobile, `md:grid-cols-3` on desktop.
- Root is `overflow-x-hidden`; body is `overflow-y-auto`.

---

## LAYER 10 — ICON SET

**There is exactly one icon: the custom brain SVG in Layer 6 (`Logo`).** Do not import `lucide-react`, Phosphor, Tabler, or any icon library. The Contact button has no icon — text only. If any other glyph seems necessary, reuse the brain `Logo` or omit it. The favicon (`public/favicon.svg`) is the same brain mark.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute the font ("similar to Outfit" is not Outfit).
- Round color / opacity values ("close to white/[0.08]" is not white/[0.08]).
- Shorten or paraphrase any copy — every string above is verbatim.
- Skip animation delays, durations, or easings.
- Add a dark overlay, tint, or semi-transparent black layer over the video.
- Set a background color on any element that covers the video across the hero / glass zone.
- Seek the video without the `!video.seeking` guard (it causes black frames and stutter).
- Import any icon library — the only icon is the inline brain SVG.
- Autoplay the video — its `currentTime` is driven solely by scroll.
- Swap the background-video URL for a local `/background.mp4` or a placeholder. It is `https://cdn.5sdesign.art/projects/1brain/background.mp4`.
- Wrap the app in `<StrictMode>` — the single Lenis + scrub loop depends on a single mount.

If a constraint conflicts with a framework limitation, **clamp to the nearest valid value and note the substitution in a comment** — never silently change.

**Final z-index check:** `video z-[1] < content z-10 < bottom-blur z-30 < header z-50`.

---

## FILE TREE (exact output expected)

```
1Brain/
├── index.html                          # favicon link, meta description, title "1Brain — Software Engineering Studio"
├── package.json                        # versions pinned in Layer 1
├── tsconfig.json
├── vite.config.ts                      # react() + tailwindcss()
├── public/
│   └── favicon.svg                     # black rounded square + white brain lobes
└── src/
    ├── main.tsx                        # createRoot, NO StrictMode
    ├── index.css                       # Outfit @import + @theme + Lenis CSS (Layers 2 + 4a)
    ├── App.tsx                          # Lenis, hero scroll, render order
    ├── lib/
    │   └── scramble.ts                 # SCRAMBLE_CHARS + randomGlyph
    └── components/
        ├── LiquidVideoCanvas.tsx       # fixed scroll-scrubbed video (CDN url)
        ├── ProgressiveBlur.tsx         # bottom-edge blur, z-30
        ├── Header.tsx                  # logo pill + Contact button
        ├── Hero.tsx                    # "Software / Engineered" + "One / Brain"
        ├── GlassPanel.tsx              # liquid-glass wrapper
        ├── Logo.tsx                    # brain SVG
        ├── ScrambleText.tsx            # hover decode
        ├── ScrambleIn.tsx              # scroll-aware scramble
        └── sections/
            ├── Highlight.tsx           # "Why 1Brain" — 3 glass cards
            └── Contact.tsx             # "Get in touch" — glass contact block
```

---

## DELIVERY CHECKLIST

- [ ] React 19 + TypeScript + Vite scaffold; Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`).
- [ ] `npm i lenis motion react react-dom` and the dev deps pinned in Layer 1.
- [ ] `src/index.css` imports Outfit + Tailwind, overrides every font var to Outfit in `@theme`, and includes the Lenis compatibility CSS.
- [ ] `main.tsx` mounts `<App />` **without** `StrictMode`.
- [ ] `LiquidVideoCanvas` plays nothing — `currentTime` driven by scroll; `getProgress = scrollY / (innerHeight * 1.5)`; LERP 0.12; blur/scale curves; `!video.seeking` guard; `MAX_ERRORS` 3; `SAFETY_TIMEOUT` 3500.
- [ ] Background video = `https://cdn.5sdesign.art/projects/1brain/background.mp4`, `loop muted playsInline preload="auto"`, never autoplayed. No local `/background.mp4`.
- [ ] z-index: video `z-[1]` < content `z-10` < bottom-blur `z-30` < header `z-50`.
- [ ] Headings scramble in / out via `ScrambleIn`; buttons decode on hover via `ScrambleText` (25ms, char locks at frame `i*4`).
- [ ] Hero: "Software / Engineered" (left) + "One / Brain" (right) + the verbatim description; Highlight: 3 glass cards; Contact: `hello@1brain.dev` + GitHub / X / LinkedIn (`href="#"`).
- [ ] Palette is black / white / translucent white only — no hue; no dark overlay over the video.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

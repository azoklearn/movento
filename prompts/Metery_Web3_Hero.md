## Metery Web3 Hero Prompt

## LAYER 1 — OPENING DECLARATION

Build a **single-page fullscreen hero landing** for **Metery** — a Web3 infrastructure platform for communities and teams.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, `.jsx` — no TypeScript)
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (CSS-first config with `@theme` — no `tailwind.config.js`)
- Pure CSS keyframe animations (no animation library needed for this asset)
- **No icon library.** This page uses zero UI icons — the only vector art is the inline brand SVGs defined verbatim in Layer 7.

Files: `index.html`, `src/main.jsx`, `src/index.css`, `src/App.jsx` (Nav + Hero), `src/components/Nav.jsx`, `src/components/Hero.jsx`, `src/components/LogoMark.jsx`. Dev server port **5970**.

The aesthetic is **cinematic nature-tech: a golden-hour wildflower meadow video fills the entire viewport, darkened toward the bottom by a scrim; a white pill navigation floats at the top; a giant centered white headline sits in the lower third with a white CTA and a row of white partner wordmarks at the very bottom**. The page is exactly one viewport tall — no scrolling sections. `#0d130f` is the global background (visible only while the video loads). Default text color is `#ffffff`. **Do not use purple, indigo, or neon colors anywhere.**

Page `<title>`: `Metery. Web3 infrastructure that scales.`
Meta description: `Empower your community with decentralized tools that scale, seamless Web3 infrastructure for forward-thinking teams.`

---

## LAYER 2 — FONTS

**Inter Variable, self-hosted** via the official Fontsource package (`npm i @fontsource-variable/inter`) — no Google Fonts request at runtime:

```css
/* top of src/index.css */
@import "tailwindcss";
@import "@fontsource-variable/inter";
```

Declared in the same file's `@theme`:

```css
--font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system, sans-serif;
```

`body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }`

One variable file covers every weight used on the page (400–800). Do not swap in a static-weights Google Fonts link — the variable font is the pinned setup.

---

## LAYER 3 — COLOR SYSTEM

Tailwind 4 `@theme` token (gives the `text-ink` utility used by nav and CTA):

```css
@theme {
  --color-ink: #17271e;   /* dark text on white surfaces (nav, CTA) */
}
```

The rest is declared directly:

```css
body {
  background-color: #0d130f;  /* page fallback, visible only while the video loads */
  color: white;               /* all hero text */
}
```

The "Sign up" pill uses the arbitrary value `bg-[#111512]`. Radii: nav pill and Sign up are `rounded-full`; the Get Started CTA is `rounded-xl` (0.75rem).

Scrim over the video (top to bottom): `rgba(0,0,0,0.10) → rgba(0,0,0,0.15) → rgba(0,0,0,0.75)` — as the Tailwind classes `from-black/10 via-black/15 to-black/75`.

---

## LAYER 4 — CUSTOM CSS UTILITIES (the "design DNA")

Paste verbatim — do not paraphrase, do not "improve".

```css
:root {
  --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-quick: 200ms;
  --dur-slow: 800ms;
}

/* Entrance choreography. Runs once on page load, pure CSS, ends fully visible. */
.hero-rise   { animation: hero-rise var(--dur-slow) var(--ease-soft) both; }
.hero-rise-2 { animation: hero-rise var(--dur-slow) var(--ease-soft) 0.12s both; }
.hero-rise-3 { animation: hero-rise var(--dur-slow) var(--ease-soft) 0.24s both; }
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
}

/* Tactile press on every button */
.btn-press:active { transform: scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .hero-rise, .hero-rise-2, .hero-rise-3 { animation: none; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## LAYER 5 — BACKGROUND ASSET

**Looping background video (fills the hero):**

Download both files from the CDN into `public/`:

- `https://cdn.5sdesign.art/projects/metery/metery.mp4` → `public/video/metery.mp4`
- `https://cdn.5sdesign.art/projects/metery/still-1.jpg` → `public/images/still-1.jpg` (first frame, used as the poster)

```html
<video autoPlay loop muted playsInline
  className="absolute inset-0 h-full w-full object-cover"
  src="/video/metery.mp4"
  poster="/images/still-1.jpg" />
```

The footage is a slow loop of a wildflower meadow at golden hour (sun low behind trees, pink and white blooms in tall grass). To use your own footage, swap both files and keep the paths — this is the only asset slot in the prompt.

**Overlay (directly after the video, same stacking context):**

```html
<div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/75" />
```

---

## LAYER 6 — SHARED COMPONENTS

None beyond the Layer 4 utilities. All entrance motion on this page is CSS-only (`.hero-rise*`); all hover states are Tailwind `transition-*` utilities reading the `--dur-quick` token.

---

## LAYER 7 — SECTIONS

### SECTION 1 — FLOATING PILL NAV

**Block 1 · Container**
- Wrapper: `<header className="absolute inset-x-0 top-5 z-50 flex justify-center px-4 md:top-6">`
- Inner: `<nav className="flex w-full max-w-[1090px] items-center rounded-full bg-white py-2.5 pl-6 pr-2.5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.18)]">`

**Block 2 · Background** — solid white pill, shadow as above, no blur.

**Block 3 · Layout primitive** — single flex row: logo left, links center-left (`ml-10`), auth cluster pushed right with `ml-auto`.

**Block 4 · Elements**

1. **Logo (wordmark + mark)**
   - Classes: `flex items-center gap-2 text-[19px] font-bold tracking-tight`
   - Text: **"Metery"**
   - Mark: inline SVG, `className="h-[22px] w-[22px]"`, `fill="currentColor"` — paste these exact paths:

   ```html
   <svg viewBox="0 0 240 240" fill="currentColor" aria-hidden="true">
     <path d="M 16.4,141.1 A 104 104 0 0 0 223.6,141.1 Z" />
     <path d="M 114,122 L 10.1,118.4 A 104 104 0 0 1 99.5,19 Z" />
     <path d="M 127,121 L 130.6,17.1 A 104 104 0 0 1 217.1,69 Z" />
   </svg>
   ```

2. **Nav links** — `Features`, `Pricing`, `Docs`, `Community`
   - Wrapper: `ml-10 hidden items-center gap-10 text-[15px] font-medium md:flex`
   - Each link: `opacity-90 transition-opacity duration-[var(--dur-quick)] hover:opacity-60`

3. **Log in** (text link)
   - Classes: `hidden text-[15px] font-medium opacity-90 transition-opacity duration-[var(--dur-quick)] hover:opacity-60 sm:block`

4. **Sign up** (dark pill)
   - Classes: `btn-press rounded-full bg-[#111512] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity duration-[var(--dur-quick)] hover:opacity-85`
   - Auth cluster wrapper: `ml-auto flex items-center gap-5`

**Block 5 · Animation** — none on the nav (it is present from first paint).

**Block 6 · Responsive** — links hidden below `md`; "Log in" hidden below `sm`; pill spans full width minus `px-4` on mobile.

**Block 7 · Copy**

```
Metery
Features
Pricing
Docs
Community
Log in
Sign up
```

### SECTION 2 — FULLSCREEN VIDEO HERO

**Block 1 · Container**
- `<section className="relative min-h-[100dvh] overflow-hidden">`
- Content wrapper: `<div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col items-center px-5 text-center">`

**Block 2 · Background** — video + scrim from Layer 5. Stacking: video first, scrim `div` second, content wrapper third (all inside the section; content wrapper is `relative`).

**Block 3 · Layout primitive** — vertical flex column, centered. Spacing is controlled by two flex spacers:
- `<div className="flex-[1.4]" />` above the headline
- `<div className="flex-1" />` between the CTA and the partner logo row

**Block 4 · Elements** (in DOM order)

1. **Headline**
   - Classes: `hero-rise-2 text-6xl font-medium leading-[1.02] tracking-tight md:text-8xl`
   - Text: **"Scale with Metery"** (one line)

2. **Subheading**
   - Classes: `hero-rise-2 mt-7 max-w-xl text-lg leading-normal text-white/90 md:text-2xl`
   - Text: **"Empower your community with decentralized tools that scale, seamless Web3 infrastructure for forward-thinking teams."**

3. **CTA Button (Primary)**
   - Classes: `hero-rise-3 btn-press mt-10 rounded-xl bg-white px-8 py-4 text-[17px] font-semibold text-ink transition-transform duration-[var(--dur-quick)] hover:-translate-y-[1px]`
   - Text: **"Get Started"**

4. **Partner logo row** (bottom of viewport)
   - Wrapper: `hero-rise-3 mb-9 flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-white`
   - Four white wordmarks, built exactly as follows:

   **rowan** — boxed initial + lowercase wordmark:
   ```html
   <span className="flex items-center gap-2.5">
     <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border-[2.5px] border-white text-[15px] font-extrabold leading-none">R</span>
     <span className="text-[22px] font-bold tracking-tight">rowan</span>
   </span>
   ```

   **Solvane** — wordmark only:
   ```html
   <span className="text-[22px] font-semibold tracking-tight">Solvane</span>
   ```

   **veldt** — three-bar glyph + wordmark:
   ```html
   <span className="flex items-center gap-2.5">
     <svg viewBox="0 0 28 28" className="h-7 w-7" fill="currentColor" aria-hidden="true">
       <rect x="3" y="5" width="16" height="3.4" rx="1.7" />
       <rect x="3" y="12.3" width="22" height="3.4" rx="1.7" />
       <rect x="3" y="19.6" width="12" height="3.4" rx="1.7" />
     </svg>
     <span className="text-[22px] font-semibold tracking-tight">veldt</span>
   </span>
   ```

   **Windmere** — globe glyph + wordmark:
   ```html
   <span className="flex items-center gap-2.5">
     <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
       <circle cx="14" cy="14" r="11" />
       <path d="M 9,4.2 C 6,10 6,18 9,23.8 M 19,4.2 C 22,10 22,18 19,23.8" />
     </svg>
     <span className="text-[22px] font-semibold tracking-tight">Windmere</span>
   </span>
   ```

**Block 5 · Animation**
- Headline + subheading: `.hero-rise-2` (0.12s delay)
- CTA + logo row: `.hero-rise-3` (0.24s delay)
- All entrances are load-time only — nothing on this page is hidden behind a scroll trigger.

**Block 6 · Responsive**
- Headline: `text-6xl` mobile → `md:text-8xl` desktop.
- Subheading: `text-lg` → `md:text-2xl`.
- Logo row wraps (`flex-wrap`) with `gap-y-6` on narrow screens.
- Always `min-h-[100dvh]`, never `h-screen`.

**Block 7 · Copy**

```
Scale with Metery
Empower your community with decentralized tools that scale, seamless Web3 infrastructure for forward-thinking teams.
Get Started
rowan
Solvane
veldt
Windmere
```

---

## LAYER 8 — ANIMATION STANDARDS (project-wide)

```
Easing (everywhere):    cubic-bezier(0.16, 1, 0.3, 1)   /* --ease-soft */
Entrance duration:      800ms                            /* --dur-slow */
Hover/press duration:   200ms                            /* --dur-quick */
Entrance timeline:      headline+sub at 0.12s, CTA+logos at 0.24s
Press feedback:         .btn-press → scale(0.98) on :active
Reduced motion:         all animation and transitions collapse to instant
```

---

## LAYER 9 — RESPONSIVE STANDARDS

- **Mobile-first.** Base classes target mobile; scale up with `sm: md:`.
- The page is a single fixed viewport — no scroll sections, no mobile menu needed (nav links simply hide below `md`).
- Container padding: `px-4` (nav), `px-5` (hero content).
- Video always `object-cover`, poster set to the extracted first frame so mobile never flashes the dark fallback.

---

## LAYER 10 — ICON SET

**This asset uses no icon set.** The only vector art is the three inline brand SVGs specified verbatim in Layer 7 (Metery mark, veldt glyph, Windmere glyph). Reject any request to import lucide-react, Phosphor, or any other icon library for this page.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Inter" is not Inter).
- Round color values ("close to #17271e" is not #17271e).
- Shorten copy ("similar headline" is not the headline).
- Skip animation delays ("smooth entrance" is not 0.12s / 0.24s with cubic-bezier(0.16, 1, 0.3, 1)).
- Redraw or "clean up" the SVG paths — paste them character-for-character.
- Replace the video with a stock clip or a gradient; the meadow footage is the design.
- Drop the `prefers-reduced-motion` guard.

If a constraint conflicts with framework limitations, clamp to the nearest valid value and note the substitution as a comment — do not silently change.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

## Farcy AI Agents Hero Prompt

## LAYER 1 — OPENING DECLARATION

Build a **single-page landing hero** for **Farcy** — an **AI-agent platform that automates repetitive admin tasks**.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, `.jsx` — no TypeScript)
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (CSS-first config with `@theme` — no `tailwind.config.js`)
- **GSAP 3** for the mount entrance (`gsap.context` scoped to the root, cleaned up with `ctx.revert()`)
- No icon library — all icons are inline SVGs provided verbatim in this prompt.

The aesthetic is **cinematic dark: a fullscreen looping background video, glass-dark floating cards, a pill navigation, and a large bottom-left headline**. `#0b0d0b` is the global background. Default text color is `#ffffff`. **Do not use purple, indigo, blue accents, or gradient text anywhere.** The only accent color is leaf green `#34d24b`, used exclusively on the logo mark (and the testimonial avatar tile derived from it).

Everything lives in one file: `src/App.jsx`. Page `<title>`: `Farcy — Build AI agents that work while you sleep`. Meta description: `Farcy lets you build AI agents that automate repetitive admin tasks while you sleep.` Dev server port **5960**.

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Doto:wght@600;700&display=swap" rel="stylesheet" />
```

Declared in `src/index.css` `@theme` (gives the `font-doto` utility):

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-doto: 'Doto', monospace;
```

`html, body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }`

- **Inter** (400/500/600) — everything: nav, headline, buttons, cards.
- **Doto** (600/700) — the dot-matrix stat number and its blurred sub-line only. Never use Doto for anything else.

---

## LAYER 3 — COLOR SYSTEM

Tailwind 4 `@theme` tokens (give the `bg-ink` and `from-leaf/70` utilities):

```css
@theme {
  --color-ink: #0b0d0b;    /* page canvas, shows before the video loads */
  --color-leaf: #34d24b;   /* leaf green — logo mark + avatar gradient only */
}
```

```css
html, body { height: 100%; background: var(--color-ink); }
::selection { background: rgba(52, 210, 75, 0.35); color: #fff; }
```

The rest of the palette is expressed directly in utility classes — memorize these exact values:

- Glass surfaces (cards + nav pill): `bg-black/55` and `bg-black/45` with `backdrop-blur-xl` / `backdrop-blur-md`
- CTA pills: `bg-black/85` (nav) and `bg-neutral-950` (form submit)
- Muted text: `text-white/85` (nav links), `text-white/90` (card body), `text-white/70` (blurred stat line), `text-white/65` (job title)
- Radius: cards `rounded-2xl` (1rem); everything else pill `rounded-full`

---

## LAYER 4 — GLOBAL CSS TOKENS

On `:root` in `src/index.css`:

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-m: 500ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## LAYER 5 — BACKGROUND ASSET

**Looping background video, fullscreen.** Download from the CDN into `public/`:

- `https://cdn.5sdesign.art/projects/farcy/farcy.mp4` → `public/video/farcy.mp4`

```html
<video autoPlay loop muted playsInline
  className="absolute inset-0 h-full w-full object-cover"
  src="/video/farcy.mp4" aria-hidden="true" />
```

Legibility overlays above the video (both `pointer-events-none`):

1. `absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent` — anchors the bottom content.
2. `absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent` — anchors the nav.

Stacking: video (base) → overlays → nav `z-20` → content `z-10`.

---

## LAYER 6 — ENTRANCE ENGINE (GSAP)

One `useEffect` in `App`, scoped with `gsap.context` to a root ref and reverted on unmount. If `prefers-reduced-motion: reduce`, return early — everything renders static:

```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduce) return
const ctx = gsap.context(() => {
  const ease = 'expo.out'
  gsap.from('[data-nav]',            { y: -18, opacity: 0, duration: 0.9,  ease })
  gsap.from('[data-headline] span',  { y: 34,  opacity: 0, duration: 1.1,  ease, stagger: 0.09, delay: 0.15 })
  gsap.from('[data-capture]',        { y: 22,  opacity: 0, duration: 1,    ease, delay: 0.4 })
  gsap.from('[data-card]',           { y: 26,  opacity: 0, duration: 1.05, ease, stagger: 0.12, delay: 0.5 })
}, scope)
return () => ctx.revert()
```

The targets are data attributes placed in Layer 7: `data-nav` on the header, `data-headline` on the `<h1>`, `data-capture` on the form, `data-card` on each card. Entrance is on mount, not on scroll — this is a one-screen hero.

---

## LAYER 7 — SECTIONS

One fullscreen section only: `<div className="relative min-h-screen overflow-hidden bg-ink text-white">` (the GSAP scope ref lives here). No scrolling content below the fold.

### SECTION 1 — HERO

**Block 1 · Container**
- Content wrapper: `<main className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-8 pt-28 sm:px-9 sm:pb-10">`
- Inner row: `flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between`

**Block 2 · Navbar** (`data-nav`, absolute `inset-x-0 top-0 z-20`, `flex items-center justify-between px-6 py-5 sm:px-9`)

- **Logo (left)**: green hand-outline SVG mark (26×26, stroke `#34d24b`, strokeWidth 2.1, round caps/joins — an open palm with four fingers) + wordmark text **"Farcy"** — `text-[22px] font-semibold tracking-tight text-white`, gap-2.5, wrapped in `<a href="/">`. Paste the mark exactly:

  ```html
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path
      d="M6.5 12.5V6.8a1.9 1.9 0 1 1 3.8 0v4.4m0-5.6V4.4a1.9 1.9 0 1 1 3.8 0v6.8m0-5.3a1.9 1.9 0 1 1 3.8 0v7.6m0-3.4a1.9 1.9 0 1 1 3.8 0v4.9c0 5.4-3.6 8.9-8.4 8.9-3.9 0-6.1-1.7-8.2-5.2-.8-1.3-2.3-3.9-3-5.2-.6-1-.3-2.2.7-2.8a2 2 0 0 1 2.7.6l1.9 2.9"
      stroke="#34d24b" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  ```

- **Nav pill (hidden below `md`)**: `flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-2 backdrop-blur-md`. Links, in order: **Features** (`#features`), **Customers** (`#customers`), **Use Cases** (`#use-cases`, with a 10×10 chevron-down SVG after the label, gap-1.5: `M2 3.5 5 6.5 8 3.5`, stroke currentColor 1.4, round caps), **Pricing** (`#pricing`). Each link: `rounded-full px-3.5 py-1.5 text-[14px] font-medium text-white/85`, hover `bg-white/10 text-white`, `transition-colors duration-200`.
- **CTA (far right)**: standalone pill, text **"Try for free"** (`#try`) — `rounded-full bg-black/85 px-5 py-2.5 text-[14px] font-medium text-white backdrop-blur-md transition-colors duration-200`, hover `bg-black`. Nav pill and CTA sit in one `flex items-center gap-3` cluster.

**Block 3 · Headline (bottom-left)**
- `<h1 data-headline>` in a `max-w-2xl` column, two hard lines (each a `block sm:whitespace-nowrap` span):
  - Line 1: **"Build AI agents that"**
  - Line 2: **"work while you sleep"**
- Classes: `text-[clamp(2.4rem,5vw,3.9rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white`

**Block 4 · Email capture (under headline, mt-8)**
- `<form data-capture id="try">`: `flex w-full max-w-md items-center rounded-full bg-white p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]`, `onSubmit` prevents default.
- Input: type email, required, placeholder **"Enter your email"**, `aria-label="Email address"` — `min-w-0 flex-1 bg-transparent px-4 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500`
- Submit button inside the pill, right: **"Try for free"** — `shrink-0 rounded-full bg-neutral-950 px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-200`, hover `bg-neutral-800`.

**Block 5 · Floating cards (bottom-right)**
Wrapper: `grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2 lg:shrink-0`. Both cards carry `data-card` + `rounded-2xl bg-black/55 p-5 backdrop-blur-xl`.

- **Card A — Stat** (`flex flex-col justify-between`):
  - Number: **"50,000+"** — `font-doto text-[42px] font-bold leading-none tracking-tight text-white`
  - Redacted line below (`mt-1.5`, decorative, `aria-hidden`, `select-none`): the text **"agents deployed"** rendered `font-doto text-[15px] font-semibold text-white/70 blur-[5px]` — it must look intentionally blurred out.
  - Bottom caption (`mt-8`): **"Users use Farcy to automate repetitive admin tasks."** — `text-[14px] leading-snug text-white/90`
- **Card B — Testimonial** (`flex flex-col`):
  - Brand row (gap-2): 18×18 white geometric "A" mark + **"Axiom"** — `text-[15px] font-semibold text-white`. Paste the mark exactly:

    ```html
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 15V3h12v12h-4.5V7.5H7.5V15H3Z" fill="#fff" fillOpacity="0.92" />
    </svg>
    ```

  - Quote (`<blockquote>`, mt-3): **"With Farcy we went from juggling endless repetitive tasks to having an AI team that does it all."** — `text-[14px] leading-snug text-white/90`, wrapped in typographic quotes " ".
  - Author row (`mt-auto pt-5`, gap-3): 36×36 `rounded-md` avatar — a gradient tile `bg-gradient-to-br from-leaf/70 via-emerald-900 to-black` (no photo). Name **"Eric Smith"** — `text-[13px] font-semibold text-white`; role **"VP of Engineering"** — `text-[12px] text-white/65`.

**Block 6 · Animation** — exactly the Layer 6 engine; no additional tweens, no scroll triggers.

**Block 7 · Copy (all text, verbatim, in order)**

```
Farcy
Features
Customers
Use Cases
Pricing
Try for free
Build AI agents that
work while you sleep
Enter your email
Try for free
50,000+
agents deployed        ← rendered blurred/redacted
Users use Farcy to automate repetitive admin tasks.
Axiom
"With Farcy we went from juggling endless repetitive tasks to having an AI team that does it all."
Eric Smith
VP of Engineering
```

---

## LAYER 8 — ANIMATION STANDARDS (project-wide)

```
Easing (everywhere):   expo.out  /* = cubic-bezier(0.16, 1, 0.3, 1) */
Entrance timeline:     nav 0.9s at 0 → headline lines 1.1s at 0.15 (stagger 0.09)
                       → capture 1.0s at 0.4 → cards 1.05s at 0.5 (stagger 0.12)
Hover transitions:     transition-colors duration-200 on every interactive pill
Reduced motion:        GSAP block skipped entirely + CSS guard collapses everything
```

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile-first. Base classes target mobile; scale with `sm: md: lg:`.
- Headline: always `clamp(2.4rem, 5vw, 3.9rem)`; the `whitespace-nowrap` on the two lines applies from `sm:` up only.
- `<md`: nav pill is hidden — keep only logo + "Try for free". (A mobile menu is optional; the hero must never overflow horizontally.)
- `<lg`: the cards grid drops below the headline/form column (`flex-col`), cards stay 2-up from `sm:`, stack 1-up below.
- Content column padding: `px-6 sm:px-9`; bottom padding `pb-8 sm:pb-10`.
- The video always covers the viewport (`object-cover`), never letterboxes.

---

## LAYER 10 — ICON SET

**No icon library.** The page's only vector art is the three inline SVGs specified verbatim in Layer 7: the Farcy palm mark, the nav chevron, and the Axiom glyph. Reject any request to install lucide-react, Phosphor, or similar.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Inter" is not Inter; the stat number must be Doto, not a monospace fallback).
- Round color values (`#0b0d0b`, `#34d24b`, `black/55` are exact).
- Shorten or paraphrase any copy string from Block 7.
- Skip animation delays or change the `expo.out` ease.
- Redraw or "clean up" the SVG paths — paste them character-for-character.
- Replace the CDN video with a stock URL or an image.
- Add extra sections, scroll content, or scroll-triggered reveals — this is a single fullscreen hero, all content visible on load.
- Drop the `prefers-reduced-motion` guard (both the GSAP early-return and the CSS kill-switch).

If a constraint conflicts with a framework limitation, clamp to the nearest valid value and note the substitution as a code comment — do not silently change.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

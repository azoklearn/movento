# Labs — ISP Hero

## LAYER 1 — OPENING DECLARATION

Build a **hero section (single full-viewport screen)** for **Labs** — an ultra-fast internet service provider.

Use the following **pinned** tech stack (do not substitute):

- **React 18 + TypeScript + Vite 5**
- **Tailwind CSS 3** (default config + extensions below)
- **lucide-react** for icons (only the icon listed in this prompt)

The aesthetic is **dark cinematic: a full-screen looping background video of neon green light streaks sweeping across pure black, with a large white grotesk headline centered on top and a single floating glass-dark navigation pill**. `#000000` is the global background. Default text color is `#ffffff`. **Do not use purple, indigo, blue, or gold anywhere.**

Everything lives in one component: `src/App.tsx`. Page `<title>`: `Labs`. Files: `index.html`, `src/main.tsx` (StrictMode + createRoot), `src/index.css`, `src/App.tsx`. Dev server port **6040**.

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:ital,wght@0,500;0,600;1,500;1,600&display=swap');
```

Tailwind config extension:

```js
fontFamily: {
  sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  display: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
}
```

Global styles:

```css
body {
  background-color: #000000;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Note for builders:** Inter Tight italic weight 600 is required for the italicized headline word. If unavailable, clamp to italic 500 and note the substitution as a comment — do not silently change.

---

## LAYER 3 — COLOR SYSTEM

Single dark theme, hex values used directly (no CSS variables needed):

| Role | Value |
|---|---|
| Background | `#000000` |
| Foreground (headline, logo, nav links) | `#ffffff` |
| Muted body copy | `rgba(255,255,255,0.85)` — `text-white/85` |
| Nav link resting | `rgba(255,255,255,0.90)` — `text-white/90` |
| Nav pill surface | `rgba(0,0,0,0.50)` + `backdrop-blur-md` |
| CTA button | `#ffffff` fill, `#000000` text |

The only color in the composition comes from the background video itself (neon green light streaks). No green is used in any UI element — all UI is strictly black/white.

---

## LAYER 4 — CUSTOM CSS UTILITIES

None. Styling is Tailwind utilities plus the global body rules in Layer 2 — no custom classes or keyframes.

---

## LAYER 5 — BACKGROUND ASSET

Looping background video. Download it and serve locally — do not hotlink:

- `https://cdn.5sdesign.art/projects/labs/labs-video.mp4` → save to `public/labs-video.mp4`

```jsx
<video autoPlay loop muted playsInline
  onLoadedData={() => setLoaded(true)}
  className="absolute inset-0 w-full h-full object-cover z-0"
  style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1500ms ease' }}
  src="/labs-video.mp4" />
```

- Content: abstract neon green light streaks (lime `#8FE821`-range highlights) curving across a pure black void, slow drift, seamless loop.
- Fade-in on load: render at `opacity: 0`, and on the video's `loadeddata` event transition to `opacity: 1` over `1500ms ease` (inline style + React state, exactly as above).
- No overlay layer. Content stacks directly above: video `z-0` → nav and hero content `z-10`.

---

## LAYER 6 — SHARED COMPONENTS

Three small components in the single file: `BackgroundVideo` (Layer 5), `Navbar`, `Hero` — composed in:

```jsx
<main className="relative h-screen overflow-hidden bg-black font-sans">
```

Exactly one viewport tall. Nothing scrolls.

---

## LAYER 7 — SECTIONS

### SECTION 1 — NAVBAR

**Block 1 · Container**
- `<header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 sm:px-10 pt-6">`

**Block 2 · Background**
- None (sits directly on the video).

**Block 3 · Layout primitive**
- Flex row, `items-center justify-between`.

**Block 4 · Elements**

> **Logo (left)**
> - Classes: `flex items-center gap-2 select-none` (an `<a href="#">`)
> - Icon: `<ChevronsRight size={22} strokeWidth={2.5} className="text-white" />`
> - Text: **"Labs"** — `text-white text-[17px] font-medium`

> **Nav pill (right)**
> - Classes: `hidden md:flex items-center bg-black/50 backdrop-blur-md rounded-2xl px-2 py-1.5`
> - Contains 5 links, each an `<a href="#">` with classes `px-4 py-2 text-[14px] font-medium text-white/90 hover:text-white transition-colors`
> - Link labels in order: **About · Services · Blog · Contact · Login**

**Block 5 · Animation**
- None. Nav renders statically (the video fade-in carries the entrance).

**Block 6 · Responsive notes**
- Mobile (`<768px`): nav pill hidden (`hidden md:flex`); only the logo shows.

### SECTION 2 — HERO

**Block 1 · Container**
- `<section className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-[14vh]">`
- The `pt-[14vh]` pushes the composition slightly below vertical center, leaving the top half of the viewport to the brightest video streaks.

**Block 2 · Background**
- Inherited root video. No overlay.

**Block 3 · Layout primitive**
- Flex column, centered, text-center.

**Block 4 · Elements**

> **Headline**
> - Classes: `font-display font-semibold text-white text-[42px] sm:text-[64px] lg:text-[84px] leading-[1.06] tracking-tight`
> - Two lines, hard break with `<br />`
> - Text: **"Connecting you to"** / **"a faster future."** — the single word **"faster"** wrapped in `<em className="italic">`, everything else upright. Entire headline is pure white; no gradient, no color spans.

> **Subheadline**
> - Classes: `text-white/85 text-[15px] sm:text-[17px] leading-relaxed mt-7 max-w-[500px]`
> - Text: **"Experience ultra-fast, reliable internet service with Labs, your gateway to seamless connectivity."**

> **CTA Button**
> - An `<a href="#">`
> - Classes: `mt-9 bg-white text-black text-[15px] font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-colors`
> - Text: **"Get started now"**
> - No icon.

**Block 5 · Animation**
- None beyond the root video fade-in. All text renders statically — no scroll reveals, no staggered entrances, content is always visible.

**Block 6 · Copy** (verbatim, in order of appearance)

```
Labs
About
Services
Blog
Contact
Login
Connecting you to
a faster future.
Experience ultra-fast, reliable internet service with Labs, your gateway to seamless connectivity.
Get started now
```

---

## LAYER 8 — ANIMATION STANDARDS

One animation on the whole page: the background video fades `opacity 0 → 1` over `1500ms ease` when `loadeddata` fires. Hover states are CSS color transitions (`transition-colors`). Nothing else moves.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Headline scales `42px → 64px (sm) → 84px (lg)`.
- Sub-copy scales `15px → 17px (sm)`.
- Everything stays centered at all breakpoints; `px-6` guards the edges on mobile.
- Nav pill appears at `md:` and up.

---

## LAYER 10 — ICON SET

Only **one** icon is permitted in this build:

```
- ChevronsRight   → brand logo mark only (22px, strokeWidth 2.5, white)
```

Reject any other icon. Do not use ArrowRight, ArrowUpRight, Menu, or any decorative glyphs.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Inter Tight" is not Inter Tight).
- Round color values or opacities (`bg-black/50` is not `bg-black/40`).
- Shorten or paraphrase copy ("similar headline" is not the headline).
- Add animations, scroll effects, gradients, or extra sections that are not specified.
- Add color to the headline or UI — all chroma comes from the video only.
- Replace the video with a static image — download the CDN file above to `public/labs-video.mp4` and serve it locally.

If a constraint conflicts with framework limitations, **clamp to the nearest valid value and note the substitution as a comment** — do not silently change.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

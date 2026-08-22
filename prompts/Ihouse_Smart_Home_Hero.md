## ihouse Smart Home Isometric Hero Prompt

> Paste everything below into Claude Code, Cursor, v0, Lovable, Bolt, or Windsurf. Reproduces the ihouse hero 1:1.

## LAYER 1 — OPENING DECLARATION

Build a **hero section** for **ihouse** — a **smart-home control platform**.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, `.jsx`)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (CSS-first config with `@theme`, no `tailwind.config.js`)
- **GSAP 3** for entrance animation
- No icon library — every icon is an inline SVG specified verbatim in Layer 7

The aesthetic is **a bright sky-blue smart-home dashboard: a full-screen looping background video of an isometric 3D apartment floor plan, frosted-glass circular controls, and clean white UI text floating over the scene**. The global background is a blue gradient `linear-gradient(160deg, #4a86dd 0%, #7ba8e6 45%, #c3d7f0 100%)` (visible before the video loads). Default text color is `#ffffff`. **Do not use purple, indigo, neon green, or any dark/black backgrounds anywhere.**

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

Single family: **Manrope** (400 / 500 / 600 / 700 / 800). Register it in `src/index.css`:

```css
@theme {
  --font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
}
```

```css
html, body {
  height: 100%;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

**Note for builders:** Manrope tops out at 800. If a step asks for a heavier weight, clamp down to 800 — do not synthesize.

---

## LAYER 3 — COLOR SYSTEM

Single theme, defined in `src/index.css`:

```css
@theme {
  --color-sky-deep: #3f7dd6;
  --color-sky-soft: #b9d2ef;
}

html, body {
  background: linear-gradient(160deg, #4a86dd 0%, #7ba8e6 45%, #c3d7f0 100%);
}

::selection {
  background: rgba(255, 255, 255, 0.35);
}
```

Working palette (used only through Tailwind utility classes — no extra variables needed):

- Foreground: `#ffffff` (white), dimmed states `white/65`, `white/40`
- Glass buttons: `bg-white/30` → hover `bg-white/45`, always with `backdrop-blur-md`
- Text shadows (navy glow for legibility over video): `rgba(30,64,130,0.25)` and `rgba(30,64,130,0.35)`

---

## LAYER 4 — CUSTOM CSS UTILITIES

This asset needs no custom utility classes — the glass treatment is done inline with Tailwind (`bg-white/30 backdrop-blur-md rounded-full`). Do not add `.liquid-glass`, noise overlays, or gradient-text utilities here; keep the CSS surface exactly as specified in Layers 2–3.

---

## LAYER 5 — BACKGROUND ASSET

**Looping background video** (fills the entire hero). Download the asset and serve it locally — do not hotlink:

```
https://cdn.5sdesign.art/projects/ihouse/ihouse.mp4  →  public/video/ihouse.mp4
```

```jsx
<video
  className="absolute inset-0 h-full w-full object-cover"
  src="/video/ihouse.mp4"
  autoPlay
  muted
  loop
  playsInline
/>
```

The video is a 1920×1080, ~5s seamless loop: an isometric 3D cutaway of a sunlit apartment floor plan (living room, bedroom, kitchen) rendered on a soft blue sky gradient. No overlay on top of the video — the UI reads directly against it.

---

## LAYER 6 — SHARED COMPONENTS

### `GlassButton` — frosted circular control (define once in `App.jsx`)

```jsx
function GlassButton({ label, children }) {
  return (
    <button
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/45"
    >
      {children}
    </button>
  )
}
```

No other shared components. The whole hero lives in a single `src/App.jsx`.

---

## LAYER 7 — SECTIONS

### SECTION 1 — Hero (the only section)

**Block 1 · Container**
- Wrapper: `<div ref={root} className="relative h-dvh w-full overflow-hidden">`
- The root ref is used for GSAP context scoping (Layer 8)

**Block 2 · Background**
- Asset: Layer 5 video, `absolute inset-0`, no overlay
- z-stacking: video (base) → header/aside `z-10`

**Block 3 · Layout primitive**
- Three absolutely-positioned UI clusters over the video: top bar (header), right-edge floor selector (aside)

**Block 4 · Elements**

> **Header (top bar)**
> - Position: `absolute inset-x-0 top-0 z-10`
> - Classes: `flex items-start justify-between px-7 pt-7 sm:px-10 sm:pt-8`

> **Nav (left side of header)** — attribute `data-fade`
> - Classes: `flex items-center gap-10`
> - **Wordmark link**: text **"IHOUSE"**, classes `text-[26px] font-extrabold tracking-[0.08em] text-white sm:text-[30px]`, inline style `textShadow: '0 2px 18px rgba(30,64,130,0.25)'`, `href="#"`
> - **Link list**: `hidden items-center gap-8 md:flex` (hidden on mobile). Four links, each `text-[15px] font-semibold tracking-wide transition-colors duration-200`. First link (active): `text-white`. Others: `text-white/65 hover:text-white`.
> - Link labels in order: **Home**, **Rooms**, **Devices**, **Scenes**

> **Control cluster (right side of header)** — three `GlassButton`s, each wrapped in a `<span data-fade>`, container `flex items-center gap-2.5`
> 1. **Record** — filled dot:
>    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="4.5" fill="currentColor" /></svg>`
> 2. **Add device** — plus:
>    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3.2v11.6M3.2 9h11.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>`
> 3. **More options** — vertical kebab:
>    `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="9" cy="3.6" r="1.5" /><circle cx="9" cy="9" r="1.5" /><circle cx="9" cy="14.4" r="1.5" /></svg>`

> **Floor selector (right edge, vertically centered)**
> - Position: `absolute right-7 top-1/2 z-10 -translate-y-1/2 sm:right-10`
> - List: `flex flex-col items-end gap-7`; each `<li>` carries `data-fade-right`
> - Floors top to bottom: **2F**, **1F**, **B1** — stored in React state, default active **"1F"**, clicking a floor sets it active
> - Active floor button: `text-[19px] text-white` + inline `textShadow: '0 2px 12px rgba(30,64,130,0.35)'`
> - Inactive floor button: `text-[15px] text-white/40 hover:text-white/70`
> - Shared button classes: `font-bold tracking-wide transition-all duration-300`

There is **no** headline, no CTA, no footer, and no bottom-corner button. The video scene is the content.

**Block 5 · Animation** — see Layer 8.

**Block 6 · Responsive notes**
- Mobile (`<768px`): nav links hidden (`hidden md:flex`); wordmark drops to 26px; paddings drop to `px-7 pt-7` / `right-7`
- Desktop (`sm:` and up): paddings `px-10 pt-8` / `right-10`; wordmark 30px
- Height uses `h-dvh` (not `h-screen`) so mobile browser chrome never clips the layout

**Block 7 · Copy** (all text, in order of appearance)

```
IHOUSE
Home
Rooms
Devices
Scenes
2F
1F
B1
```

---

## LAYER 8 — ANIMATION STANDARDS

GSAP entrance on mount only — no scroll triggers, nothing is left hidden. Run inside `useLayoutEffect` with `gsap.context` scoped to the root ref, and revert on unmount:

```js
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('[data-fade]', {
      y: -14,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.08,
      clearProps: 'all',
    })
    gsap.from('[data-fade-right]', {
      x: 18,
      autoAlpha: 0,
      duration: 0.9,
      delay: 0.35,
      ease: 'power3.out',
      stagger: 0.06,
      clearProps: 'all',
    })
  }, root)
  return () => ctx.revert()
}, [])
```

- `data-fade` = top-bar elements (nav + three glass buttons): drop in from above
- `data-fade-right` = floor-selector items: slide in from the right, starting 0.35s later
- `clearProps: 'all'` is mandatory — content must never stay stuck hidden if JS pauses

---

## LAYER 9 — RESPONSIVE STANDARDS

- **Mobile-first.** Base classes target mobile; scale up with `sm:` and `md:`.
- The hero is a fixed full-viewport composition (`h-dvh overflow-hidden`) — it never scrolls.
- Glass buttons stay `size-11` (44px) at every breakpoint — thumb-sized tap targets.
- Vite dev server: port **6190**, `strictPort: true`, `host: true`.

---

## LAYER 10 — ICON SET

This asset uses **zero icon libraries**. The three SVGs in Layer 7 (dot, plus, kebab) are the complete icon set — paste them verbatim, `18×18` viewBox, `currentColor`, stroke width `1.8`, round linecaps. Do not import lucide-react or substitute any other glyphs.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Manrope" is not Manrope).
- Round color values (`rgba(30,64,130,0.25)` is not "a soft blue shadow").
- Rename or reorder the nav links, floor labels, or the wordmark "IHOUSE".
- Skip animation values (`0.9s`, `power3.out`, stagger `0.08`, delay `0.35` are exact).
- Replace the inline SVGs with an icon library.
- Add sections, headlines, CTAs, overlays, or a bottom-corner button — the hero ships with exactly the elements listed in Layer 7.
- Swap the background video URL for a stock placeholder.

If a constraint conflicts with framework limitations, clamp to the nearest valid value and note the substitution as a comment — do not silently change.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

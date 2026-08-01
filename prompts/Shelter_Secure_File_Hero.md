# Shelter — Secure File Hero

## LAYER 1 — OPENING DECLARATION

Build a **hero section** for **Shelter** — a secure file-holding platform that protects user data everywhere.

Use the following **pinned** tech stack (do not substitute):

- **React 19 + Vite 6** (JavaScript, `.jsx` — no TypeScript)
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (CSS-first — no `tailwind.config.js`)
- **GSAP 3** with **`@gsap/react`** (`useGSAP` scoped to the root container) for the entrance timeline
- **Lenis** for smooth scrolling (initialized once, even though this page fits one viewport)
- No icon library — the only icon is a custom inline SVG logo mark (defined in Layer 7)

The aesthetic is **dark cinematic: a full-screen looping background video under three oversized lowercase display words staggered across the viewport, with a minimal top nav and small stat counters pinned to the corners**. `#000000` is the global background. Default text color is `#ffffff`. **Do not use any accent color anywhere — the entire page is black, white, and white-at-reduced-opacity only.**

Everything lives in one file: `src/App.jsx`. Page `<title>`: `Shelter — holding each file with supreme care`. Dev server port **6010**.

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Set in `src/index.css` (Tailwind 4 — no config file):

```css
html,
body {
  background: #000;
  color: #fff;
  font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Note for builders:** Inter Tight is loaded at 400/500/600 only. If a heavier weight is requested anywhere, clamp down to 600 — do not synthesize.

---

## LAYER 3 — COLOR SYSTEM

There are no color variables and no palette beyond black and white. Color is applied inline with Tailwind utilities:

| Role | Value | Where |
|---|---|---|
| Page background + video fallback | `#000000` | `html, body` + `bg-black` on the container |
| All text | `#ffffff` | `text-white` inherited |
| Hero paragraph | `text-white/80` | 80% white |
| Stat captions | `text-white/50` | 50% white |
| CTA pill | `bg-white` + `text-black` | inverted |
| CTA pill hover | `rgba(255, 255, 255, 0.86)` | via `.cta-pill:hover` |

```css
::selection {
  background: #fff;
  color: #000;
}
```

---

## LAYER 4 — CUSTOM CSS UTILITIES (paste verbatim — do not paraphrase)

```css
/* Semantic transition tokens */
:root {
  --nav-link-dur: 260ms;
  --nav-link-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --cta-dur: 300ms;
  --cta-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Oversized display words */
.display-word {
  font-size: clamp(84px, 15vw, 280px);
  font-weight: 500;
  line-height: 0.82;
  letter-spacing: -0.035em;
  white-space: nowrap;
  user-select: none;
}

/* Nav links — sliding underline */
.nav-link {
  position: relative;
  opacity: 0.9;
  transition: opacity var(--nav-link-dur) var(--nav-link-ease);
}
.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform var(--nav-link-dur) var(--nav-link-ease);
}
.nav-link:hover { opacity: 1; }
.nav-link:hover::after { transform: scaleX(1); transform-origin: left center; }

/* CTA pill */
.cta-pill {
  transition:
    background-color var(--cta-dur) var(--cta-ease),
    color var(--cta-dur) var(--cta-ease),
    transform var(--cta-dur) var(--cta-ease);
}
.cta-pill:hover { background-color: rgba(255, 255, 255, 0.86); transform: scale(1.03); }
.cta-pill:active { transform: scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .nav-link, .nav-link::after, .cta-pill { transition: none; }
}
```

---

## LAYER 5 — BACKGROUND ASSET

Looping background video, full-bleed behind everything:

```jsx
<video
  className="absolute inset-0 h-full w-full object-cover"
  src="/hero.mp4"
  autoPlay
  muted
  loop
  playsInline
  aria-hidden="true"
/>
```

- Download `https://cdn.5sdesign.art/backgrounds/background-034.mp4` → save to `public/hero.mp4`. Do not hotlink.
- The video sits at the bottom of the stack; all content renders above it (`z-10` for hero content, `z-20` for nav).
- No overlay, no gradient, no dimming layer on top of the video.
- While the video loads, the black background shows through — do not add a poster image.

---

## LAYER 6 — SHARED COMPONENTS

### `DisplayWord` — masked slide-up wrapper

```jsx
function DisplayWord({ children, className = '' }) {
  return (
    <div className={`absolute overflow-hidden ${className}`}>
      <h1 className="display-word word-inner lowercase">{children}</h1>
    </div>
  )
}
```

The outer div clips; GSAP animates the inner `.word-inner` from `yPercent: 112` to rest.

### `Stat` — corner counter

```jsx
function Stat({ value, label, align = 'left', className = '' }) {
  return (
    <div className={`fade-in ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      <p className="text-[clamp(22px,2.6vw,44px)] font-medium leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-[11px] lowercase leading-snug text-white/50">{label}</p>
    </div>
  )
}
```

### Lenis init (once, in `useEffect`)

```jsx
useEffect(() => {
  const lenis = new Lenis({ smoothWheel: true })
  let rafId
  const raf = (time) => {
    lenis.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  return () => {
    cancelAnimationFrame(rafId)
    lenis.destroy()
  }
}, [])
```

### Reduced motion

The whole entrance timeline is registered inside `gsap.matchMedia()` under `(prefers-reduced-motion: no-preference)` — users who prefer reduced motion see every element in its final state with no entry animation. The CSS kill-switch in Layer 4 covers the hover transitions.

---

## LAYER 7 — SECTIONS

### SECTION 1 — HERO (the only section)

**Block 1 · Container**
- Wrapper: `<div ref={container} className="relative h-svh min-h-[640px] w-full overflow-hidden bg-black text-white">`
- No max-width — content positions against the full viewport.
- Horizontal edge inset used everywhere: `3vw`.

**Block 2 · Background**
- Asset: the looping video from Layer 5.
- Overlay: none.
- Stacking: video (base) → hero content `z-10` → nav `z-20`.

**Block 3 · Layout primitive**
- Absolute-positioned. Every element below is `position: absolute` inside the container, placed with `vw`/`vh` values. Hero content lives in `<main className="absolute inset-0 z-10">`.

**Block 4 · Elements**

> **Navbar**
> - Position: `absolute top-0 left-0 z-20`, full width
> - Classes: `flex w-full items-center justify-between px-[3vw] py-7`
> - Left — **Logo**: `<a href="/" className="flex items-center gap-2 text-[15px] font-medium lowercase tracking-tight">` containing the inline SVG mark then the text `shelter`
>   ```jsx
>   <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
>     <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
>     <circle cx="9" cy="9" r="3" fill="white" />
>   </svg>
>   ```
> - Right group: `flex items-center gap-10` containing:
>   - **Nav links**: `<nav className="hidden items-center gap-9 md:flex">`, each link `nav-link text-[14px] lowercase`, hrefs `#products #offerings #mission #contact`
>   - **CTA Button**: `<a href="#start" className="cta-pill rounded-full bg-white px-6 py-2.5 text-[14px] font-medium lowercase text-black">`
> - Text: links **"products" / "offerings" / "mission" / "contact"**, button **"start today"**

> **Display word 1 — "shelter"**
> - Position: `left-[3vw] top-[13vh]`
> - Structure: `DisplayWord` from Layer 6

> **Display word 2 — "user"**
> - Position: `right-[3vw] top-[37vh]`
> - Same structure, text `user`

> **Display word 3 — "info"**
> - Position: `left-[24vw] top-[61vh]`
> - Same structure, text `info`

> **Paragraph**
> - Position: `absolute left-[3vw] top-[46vh]`
> - Classes: `fade-in absolute left-[3vw] top-[46vh] max-w-[240px] text-[13px] lowercase leading-relaxed text-white/80`
> - Text: **"we are holding each file with supreme care, granting user with safety in all place"**

> **Stat 1 (top right)**
> - `<Stat value="+90k" label="active users worldwide" align="right" className="absolute right-[3vw] top-[15vh]" />`

> **Stat 2 (bottom left)**
> - `<Stat value="+2.7b" label="files held with care" className="absolute bottom-[5vh] left-[3vw]" />`

> **Stat 3 (bottom right)**
> - `<Stat value="+450k" label="transfers secured daily" align="right" className="absolute right-[3vw] bottom-[5vh]" />`

**Block 5 · Animation**
- One GSAP timeline (Layer 8): display words mask-reveal with stagger, then paragraph + stats fade up with stagger, header fades in alongside.

**Block 6 · Responsive notes**
- Mobile (`<768px`): nav links hidden (`hidden md:flex`); logo + CTA remain. Display words scale via the `clamp()` in `.display-word` — no per-breakpoint overrides.
- Container never scrolls: `h-svh min-h-[640px] overflow-hidden`.
- All positions are viewport-relative (`vw`/`vh`), so the composition holds at every size.

**Block 7 · Copy** (verbatim, in order of appearance)

```
shelter
products
offerings
mission
contact
start today
shelter
+90k
active users worldwide
we are holding each file with supreme care, granting user with safety in all place
user
info
+2.7b
files held with care
+450k
transfers secured daily
```

---

## LAYER 8 — ANIMATION STANDARDS

One entrance timeline, registered with `useGSAP({ scope: container })` inside `gsap.matchMedia()`:

```jsx
useGSAP(
  () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.from('.word-inner', { yPercent: 112, duration: 1.5, stagger: 0.14 }, 0.15)
        .from('.fade-in', { opacity: 0, y: 22, duration: 1.1, stagger: 0.09 }, 0.6)
        .from('header', { opacity: 0, duration: 1 }, 0.3)
    })
  },
  { scope: container },
)
```

- Display words start at **0.15s**, stagger **0.14s** → "shelter" 0.15 / "user" 0.29 / "info" 0.43.
- Fade-ins start at **0.6s**, stagger **0.09s**, DOM order: paragraph 0.60 / +90k 0.69 / +2.7b 0.78 / +450k 0.87.
- Header fades in at **0.3s**, duration 1.0.
- Everything animates once on load — there is no scroll-triggered animation on this page.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Mobile-first; the only breakpoint used is `md:` (nav links).
- Hero typography always via `clamp(84px, 15vw, 280px)` — never fixed sizes.
- Edge inset `3vw` horizontal, nav `py-7`, corner stats inset `5vh` from the bottom.

---

## LAYER 10 — ICON SET

**No icon library.** The only graphic mark is the inline SVG logo (outer ring + center dot) defined in the Navbar element. Reject any request to install lucide-react, Phosphor, or similar.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to Inter Tight" is not Inter Tight).
- Round color or opacity values (`text-white/50` is not `text-gray-400`).
- Shorten or "fix" copy — the paragraph text is intentionally styled lowercase and must remain word-for-word.
- Skip animation timings ("smooth entrance" is not a 1.5s mask reveal staggered 0.14s on `power4.out`).
- Add icons, gradients, overlays, or accent colors that are not specified.
- Replace the background film with a stock video — download the CDN file above to `public/hero.mp4`; the black background is the loading fallback.
- Drop the `prefers-reduced-motion` guard (both the `matchMedia` gate and the CSS kill-switch).

If a constraint conflicts with a framework limitation, clamp to the nearest valid value and note the substitution as a code comment — do not silently change.

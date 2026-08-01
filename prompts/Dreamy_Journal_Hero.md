# Dreamy — Dream-Journal Hero

## LAYER 1 — OPENING DECLARATION

Build a **single full-viewport hero section** (one screen, no scroll) for **Dreamy** — an app that records your dreams each morning and uncovers the hidden meaning inside your own subconscious.

Use the following **pinned** tech stack (do not substitute):

- **React 18 + TypeScript + Vite 5** — `.tsx`, strict TypeScript.
- **Tailwind CSS 3** with a custom `tailwind.config.js` (font extension in Layer 3). Not Tailwind v4, not a CSS-only `@theme` block.
- **`lucide-react`** for icons — restricted to the four in Layer 10.
- **No animation or UI libraries.** Every transition is a plain CSS keyframe — no Framer Motion, no motion runtime, no GSAP.

The aesthetic is **bright, dreamy, and ethereal**: a soft looping dream video as the backdrop, a faint white scrim above it for legibility, glassy translucent surfaces, dark neutral type, and a gentle blur-in entrance. The page renders **once** through `StrictMode` — there is no global animation loop, so the standard Vite + React `StrictMode` mount in `src/main.tsx` is correct here.

**Do not:** add a feature grid, pricing, dashboard mockup, testimonial, footer, second accent color, gradient on the headline, card elevation, drop shadows, or decorative image overlays. This is the hero **only** — the content ends at the description paragraph.

---

## LAYER 2 — FONTS

One sans, **Arimo** — a clean Helvetica/Arial metric-compatible grotesque — loaded from Google Fonts (weights 400 / 500 / 700) via a `<link>` in `index.html` `<head>` (preconnect first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

The full font stack (registered in both `tailwind.config.js` and the `html` rule in `index.css`):

```
'Arimo', 'Helvetica Neue', Helvetica, Arial, sans-serif
```

On `html`, also enable `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`. There is no second family — one sans face carries the whole page.

The rest of the `<head>`: `<meta charset="UTF-8" />`, `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`, the cloud favicon (Layer 6), `<title>Dreamy — Discover the meaning of your dreams</title>`, and the meta description:

```html
<meta
  name="description"
  content="Dreamy — capture your dreams each morning and uncover the hidden meaning within your own subconscious."
/>
```

---

## LAYER 3 — DESIGN TOKENS (`tailwind.config.js`)

No custom color palette — the page rides on Tailwind's default neutral grays over the video. The only extension is the font family:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arimo', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**Color roles** (all from the Tailwind default scale, used directly):

| Role | Token |
|---|---|
| Headline · primary buttons · logo · icons | `gray-900` |
| Nav links | `gray-700` |
| Body copy | `gray-600` |
| Input placeholder | `gray-500` |
| Hairlines / rings | `gray-200` |
| Glass surfaces | `white` at low opacity (`white/60`, `white/80`) with `backdrop-blur` |

The dark type sits on a bright video, so a soft white scrim (Layer 5) guarantees contrast.

---

## LAYER 4 — CUSTOM CSS UTILITIES (`src/index.css`)

Paste **verbatim** — these keyframes are the entire motion system. `@tailwind base/components/utilities` first, then the `html` font rule, then the two keyframes + their classes + the reduced-motion guard:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  font-family: 'Arimo', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes fade-down {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-fade-down {
  animation: fade-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-up,
  .animate-fade-down {
    animation: none;
  }
}
```

`fade-up` rises 24px with a 6px blur clearing to 0 over `0.9s`; `fade-down` drops in from -16px over `0.7s`. Both use the same `cubic-bezier(0.22, 1, 0.36, 1)` ease and `both` fill so they hold their start frame before playing and their end frame after.

---

## LAYER 5 — BACKGROUND ASSET

The section's backdrop is a single looping video, hosted on the R2 CDN.

```jsx
<video
  className="absolute inset-0 -z-10 h-full w-full object-cover"
  src="https://cdn.5sdesign.art/projects/dreamy/background.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
/>
```

Directly above the video, a **soft white scrim** keeps the dark text legible across the changing footage:

```jsx
<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
```

Both sit at `-z-10` so the content layer (`z-20`) floats clearly above them. Any soft, dream-like clip suits the slot — nothing is hard-coupled to the exact frames.

**Section wrapper:** `relative flex min-h-[100svh] flex-col overflow-hidden`

---

## LAYER 6 — SHARED COMPONENT: cloud Logo (`src/components/Logo.tsx`)

A custom cloud SVG used in the navbar and reused as the favicon. It fills with `currentColor` so it inherits the surrounding text color, and accepts a `className` for sizing. `viewBox="0 0 24 24"`, a single filled path:

```tsx
interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
    </svg>
  )
}
```

**Favicon** (`index.html`): the same cloud path as an inline SVG data URI with `fill='%23111'` (i.e. `#111`):

```html
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23111' d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/%3E%3C/svg%3E" />
```

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`src/App.tsx` renders the hero and nothing else:

```tsx
import Hero from './components/Hero'

export default function App() {
  return <Hero />
}
```

### SECTION 1 — Navbar (`src/components/Navbar.tsx`)

A non-sticky top bar that fades down on load, holding its own dropdown state.

- It tracks `open` via `useState(false)` and a `NAV_LINKS = ['Explore', 'Journal', 'Inspiration']` array (used to render the mobile drawer).
- Wrapper `<nav>`: `animate-fade-down relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-10`.
- **Left — brand** `<a href="#" className="flex items-center gap-2 text-gray-900">`:
  - `<Logo className="h-5 w-5 sm:h-6 sm:w-6" />`
  - `<span className="text-base font-medium tracking-tight sm:text-lg">Dreamy</span>`
- **Center — desktop links** `<div className="hidden items-center gap-8 md:flex">` (hidden below `md`):
  - `<button>` **`Explore`** with a trailing `ChevronDown` (`h-3.5 w-3.5`): `flex items-center gap-1 text-[13px] text-gray-700 transition-colors hover:text-gray-900`.
  - `<a href="#">` **`Journal`**: `text-[13px] text-gray-700 transition-colors hover:text-gray-900`.
  - `<a href="#">` **`Inspiration`**: same classes.
- **Right — CTA + hamburger** `<div className="flex items-center gap-2">`:
  - CTA `<a href="#">` **`Get Started`**: `rounded-full bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 sm:px-5`.
  - Hamburger `<button onClick={() => setOpen((v) => !v)} aria-label="Open menu">`: `flex h-9 w-9 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-900/10 md:hidden`; renders `<X className="h-5 w-5" />` when `open`, else `<Menu className="h-5 w-5" />`.
- **Mobile dropdown** — rendered only when `open`: `<div className="animate-fade-up absolute left-4 right-4 top-full rounded-2xl bg-white/80 px-5 py-3 ring-1 ring-gray-200 backdrop-blur-xl md:hidden">`. It maps `NAV_LINKS` to `<a href="#" key={link}>` rows: `block border-b border-gray-200 py-3 text-[15px] text-gray-700 transition-colors last:border-b-0 hover:text-gray-900`.

### SECTION 2 — Hero (`src/components/Hero.tsx`)

The full masthead: video + scrim layer, the navbar, then top-pinned content. Import the icons `ArrowUp` and `Sparkles` from `lucide-react`, plus `Navbar`.

**Wrapper:** `<section className="relative flex min-h-[100svh] flex-col overflow-hidden">`.

**Children, in DOM order:**

1. **Background video** — the `<video>` from Layer 5 (`absolute inset-0 -z-10 h-full w-full object-cover`).
2. **Scrim** — the white top-down gradient from Layer 5 (`pointer-events-none absolute inset-0 -z-10 …`).
3. **`<Navbar />`**.
4. **Top spacer** — `<div className="min-h-6 shrink-0 sm:min-h-10 lg:min-h-12" />`. A small gap under the nav so content sits near the top.
5. **Content block** — `<div className="relative z-20 flex flex-col items-center px-5 text-center">`:
   - **Headline** `<h1 className="font-normal leading-[1.05] tracking-tight text-gray-900 text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">` — two block spans:
     - `<span className="animate-fade-up block">Decode your dreams.</span>`
     - `<span className="animate-fade-up block [animation-delay:100ms]">Understand yourself.</span>`
   - **Search bar** `<form onSubmit={(e) => e.preventDefault()} className="animate-fade-up mt-5 w-full max-w-xl [animation-delay:220ms] sm:mt-6">`:
     - Pill `<div className="flex items-center gap-3 rounded-full bg-white/60 py-1.5 pl-5 pr-1.5 ring-1 ring-gray-200 backdrop-blur-md">`:
       - `<input type="text" placeholder="What did you dream last night?" className="flex-1 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-500 sm:text-base" />`
       - `<button type="submit" aria-label="Decode dream" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-transform hover:scale-105 active:scale-95 sm:h-10 sm:w-10">` containing `<ArrowUp className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />`.
   - **Description** `<p className="animate-fade-up mt-4 max-w-md text-sm leading-relaxed text-gray-600 [animation-delay:340ms] sm:mt-5 sm:text-base lg:text-lg">` — exact content, with a `<br />` before the dash and a `Sparkles` icon inline:
     ```jsx
     Capture every dream and uncover what it truly means<br />
     — illuminated by your <Sparkles className="-mt-1 inline h-4 w-4" /> subconscious
     ```
6. **Bottom spacer** — `<div className="flex-1 shrink-0" />`. This fills the remaining height and pushes the content block toward the top — the hero is **not** vertically centered.

---

## LAYER 8 — ANIMATION STANDARDS

All motion is the two CSS keyframes from Layer 4, sequenced by inline Tailwind `[animation-delay:…]` arbitrary values:

```text
Easing  → cubic-bezier(0.22, 1, 0.36, 1)  (both keyframes)
Durations → fade-up 0.9s · fade-down 0.7s

Stagger:
  Navbar          → animate-fade-down  (no delay)
  Headline line 1 → animate-fade-up    (no delay)
  Headline line 2 → animate-fade-up [animation-delay:100ms]
  Search bar      → animate-fade-up [animation-delay:220ms]
  Description     → animate-fade-up [animation-delay:340ms]
  Mobile drawer   → animate-fade-up    (on open)
```

- No scroll-triggered animation, parallax, typewriter, or counters. The only continuous motion is the looping background video.
- Hover states are pure CSS transitions: nav links shift to `gray-900`, the CTA to `bg-gray-800`, the search button scales `1.05` on hover / `0.95` on active.
- `prefers-reduced-motion: reduce` disables both keyframes (Layer 4).

---

## LAYER 9 — RESPONSIVE STANDARDS

- The page is exactly **one viewport tall** — `min-h-[100svh]` flex column; content is pinned near the top by the `flex-1` bottom spacer, never centered. No scrolling content.
- Headline steps through fixed breakpoints (never one fluid clamp): `40px` base → `44px` at `min-[400px]` → `text-6xl` (60px) at `sm` → `text-7xl` (72px) at `lg` → `80px` at `xl`.
- Desktop nav links are hidden below `md` and replaced by the hamburger + mobile drawer; they appear from `md` up.
- Search bar is full width, capped at `max-w-xl`. Description caps at `max-w-md`.
- Nav padding scales `px-5 py-4` → `sm:px-8 sm:py-5` → `lg:px-10`. Top spacer scales `min-h-6` → `sm:min-h-10` → `lg:min-h-12`.
- Mobile-first: base classes target mobile, scaling up with `sm: md: lg: xl:`.

---

## LAYER 10 — ICON SET

Exactly **four** lucide icons (the cloud Logo is a custom SVG, not lucide):

- `ArrowUp` — inside the search submit button (`h-4 w-4 sm:h-[18px] sm:w-[18px]`).
- `Sparkles` — inline in the description before "subconscious" (`-mt-1 inline h-4 w-4`).
- `ChevronDown` — trailing the navbar **Explore** button (`h-3.5 w-3.5`).
- `Menu` / `X` — the mobile hamburger toggle (`h-5 w-5`).

Do not import any icon outside this list.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute the font — it is **Arimo** from Google Fonts (weights 400 / 500 / 700, the exact `<link>` in Layer 2), with the `'Helvetica Neue', Helvetica, Arial, sans-serif` fallback chain — not a look-alike.
- Swap the background — it is a looping `<video>` at `https://cdn.5sdesign.art/projects/dreamy/background.mp4`, with the white top-down scrim above it. Keep `autoPlay loop muted playsInline preload="auto"` and `object-cover`.
- Change the cloud Logo / favicon path, or render it in any color but `currentColor` (favicon `#111`).
- Reword copy — verbatim: "Decode your dreams." / "Understand yourself." / placeholder "What did you dream last night?" / "Capture every dream and uncover what it truly means — illuminated by your ✨ subconscious" (with the `<br />` before the dash and the inline `Sparkles`).
- Alter the nav items: **Explore** (with chevron) · **Journal** · **Inspiration** · **Get Started** CTA.
- Touch the three stagger delays (`100ms` / `220ms` / `340ms`), the `0.9s` / `0.7s` durations, or the `cubic-bezier(0.22, 1, 0.36, 1)` ease.
- Vertically center the content — it is pinned near the top by the `flex-1` bottom spacer.
- Add a second section, accent color, gradient headline, card elevation, or drop shadow. Hero only.
- Drop the `prefers-reduced-motion: reduce` guard.

If a constraint conflicts with a framework limit, clamp to the nearest valid value and leave a comment — do not silently change.

---

## FILE TREE (exact output expected)

```
Dreamy/
├── index.html              # Arimo Google Fonts <link>, cloud favicon, theme title
├── tailwind.config.js      # fontFamily.sans extension (Layer 3)
├── postcss.config.js       # tailwindcss + autoprefixer
├── vite.config.ts          # @vitejs/plugin-react
├── tsconfig.json
└── src/
    ├── main.tsx            # createRoot + StrictMode
    ├── index.css           # Layer 4 verbatim
    ├── vite-env.d.ts
    ├── App.tsx             # renders <Hero />
    └── components/
        ├── Hero.tsx        # bg video + scrim + Navbar + top-pinned content
        ├── Navbar.tsx      # brand · links · Get Started · mobile drawer
        └── Logo.tsx        # cloud SVG (currentColor)
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## DELIVERY CHECKLIST

- [ ] `npm create vite@latest . --template react-ts` (React 18 + Vite 5 + TypeScript).
- [ ] `npm i lucide-react` and `npm i -D tailwindcss@3 postcss autoprefixer`.
- [ ] `tailwind.config.js` extends `fontFamily.sans` with the Arimo stack; `content` globs `./index.html` + `./src/**/*.{ts,tsx}`.
- [ ] `index.css` pasted verbatim from Layer 4 (Tailwind directives → `html` font rule → keyframes → reduced-motion guard).
- [ ] `index.html` loads **Arimo** (400/500/700) from Google Fonts, plus the cloud favicon and title `Dreamy — Discover the meaning of your dreams`.
- [ ] `Logo.tsx` is the cloud path filled with `currentColor`; same path reused as the favicon.
- [ ] Hero wraps a looping `<video src="https://cdn.5sdesign.art/projects/dreamy/background.mp4">` + white scrim, both at `-z-10`.
- [ ] Headline lines "Decode your dreams." / "Understand yourself." with `[animation-delay:100ms]` on line 2.
- [ ] Glass search pill: placeholder "What did you dream last night?", `ArrowUp` submit button.
- [ ] Description ends the hero — "…— illuminated by your ✨ subconscious" with inline `Sparkles`; no CTA below it.
- [ ] Navbar: cloud logo + "Dreamy", Explore (chevron) · Journal · Inspiration, "Get Started" CTA, mobile drawer toggled by Menu/X.
- [ ] Content pinned near the top via the `flex-1` bottom spacer; one screen, no scroll.
- [ ] Only the four lucide icons used; `prefers-reduced-motion` respected.

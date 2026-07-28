## Zpeed Motorsport Hero Prompt

## LAYER 1 — OPENING DECLARATION

Build a **single-screen hero page** (one viewport, no scroll) for **Zpeed** — a high-performance motorsport racing team with the line *"Race beyond limits."*

Use the following **pinned** tech stack (do not substitute):

- **React 18.3 + Vite 6** — **TypeScript, strict mode** (`.tsx`, not plain JSX).
- **Tailwind CSS 4** wired through the **`@tailwindcss/vite`** plugin and a single `@import "tailwindcss";` at the top of `src/index.css`. **Not Tailwind v3** — there is **no `tailwind.config.js`** and **no `postcss.config.js`**. All design decisions live as Tailwind utility classes inline plus a few raw CSS rules (Layer 4).
- **No animation library.** No framer-motion, no GSAP, no tailwindcss-animate. The only motion is (a) the looping cover videos cross-fading via a CSS `transition-opacity` and (b) the playing video's own footage. State is plain React (`useState` + `useRef` + `useEffect`).
- **No icon library.** The only glyph is one hand-authored inline `<svg>` double-chevron logo. No lucide-react.

**Critical build note:** mount inside `React.StrictMode` in `src/main.tsx` (this is the default and is correct here — the video controller is idempotent and cleans up after itself). Keep `createRoot(document.getElementById('root')!)` with the non-null assertion.

The aesthetic is **motorsport editorial** — a cinematic racing broadcast feel. A near-black **Carbon** (`#181818`) canvas (never pure black), edge-to-edge white **Inter** display type scattered diagonally across the frame, and a **single** saturated accent, **Race red** (`#da291c`), spent scarcely — it appears on exactly one element, the `Get Tickets` button. Everything else is white or white-at-reduced-opacity over moving footage. Three looping videos sit full-bleed behind the type; a near-black gradient fades the bottom edge so the footer copy stays legible.

**Do not:** add a second accent color, a light theme, gradients on the type, card borders or elevation on the stat cells, drop shadows other than the navbar's glass shadow, emoji, or AI-default accents like `bg-blue-500`. Do not add scroll content — the page is one screen. Do not add a video controls bar, a play button, or a mute toggle; the videos are muted, auto-advancing background loops.

---

## LAYER 2 — FONTS

Load one family from Google Fonts in `index.html` `<head>` (preconnect first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Role mapping:

| Role | Family | Weight | Where |
|---|---|---|---|
| Display headline (scattered words) | **Inter** | `500` (`font-medium`) | `Race` / `beyond` / `limits` |
| Stat numbers | **Inter** | `700` (`font-bold`) | `+370` / `+1.2k` / `+58` |
| Nav links, brand, CTA | **Inter** | `600`–`700` | uppercase, tracked |
| Body / description / stat labels | **Inter** | `400`–`600` | paragraph + uppercase labels |

Inter is the **only** typeface — one family, four weights (400/500/600/700). The headline is set at weight `500` with negative tracking and tight leading (Layer 4 `.hero-title`). Uppercase nav/CTA/label text carries positive letter-spacing for an instrument-panel feel. Do not introduce a serif, a mono, or a second sans.

The global font stack falls back to system sans:

```css
font-family: 'Inter', -apple-system, system-ui, sans-serif;
```

---

## LAYER 3 — DESIGN TOKENS

Tailwind v4 is config-less here — there is **no `tailwind.config.js`**. Tokens are applied as **arbitrary-value utilities** (`bg-[#181818]`, `bg-[#da291c]`, `tracking-[0.65px]`, `text-[14vw]`, …) directly in the markup, plus the global CSS in Layer 4. Treat the table below as the canonical palette and scale; reproduce these exact values inline.

| Token | Value | Role |
|---|---|---|
| Carbon (canvas) | `#181818` | body background, section background, bottom gradient target — **near-black, never `#000`** |
| White | `#ffffff` | display type, logo fill, brand, nav links, CTA text, stat numbers |
| Race red | `#da291c` | **only** the `Get Tickets` CTA fill |
| Race red (pressed) | `#b01e0a` | CTA `active:` state |
| White / soft | `rgba(255,255,255,0.90)` (`text-white/90`) | description paragraph |
| White / muted | `rgba(255,255,255,0.70)` (`text-white/70`) | uppercase stat labels |
| White / hairline | `rgba(255,255,255,0.40)` (`bg-white/40`) | diagonal divider rules |
| Glass fill | `rgba(255,255,255,0.10)` (`bg-white/10`) | navbar background |
| Glass border | `rgba(255,255,255,0.20)` (`border-white/20`) | navbar border |

**Letter-spacing values** (used as arbitrary tracking):
- `tracking-[0.65px]` — brand + nav links
- `tracking-[1.4px]` — CTA `Get Tickets`
- `tracking-[1.1px]` — uppercase stat labels
- `tracking-[-0.02em]` — stat numbers and `.hero-title`

**Navbar glass shadow** (applied as one arbitrary `shadow-[...]`):

```
inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.35)
```

**Spacing** follows an 8px scale (4 / 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128). The navbar insets **50px** from the left and right edges of the viewport.

---

## LAYER 4 — GLOBAL CSS (`src/index.css`)

Paste **verbatim**. The `@import "tailwindcss";` line is how Tailwind v4 is pulled in (the `@tailwindcss/vite` plugin compiles it) — there are **no** `@tailwind base/components/utilities` directives. Two raw rules below it carry the rest of the DNA.

```css
@import "tailwindcss";

html,
body,
#root {
  height: 100%;
}

body {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background: #181818;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.hero-title {
  letter-spacing: -0.02em;
  line-height: 1.05;
}
```

`html`, `body`, and `#root` are all `height: 100%` so the hero's `h-screen` fills the frame with no parent collapse. The body is Carbon (`#181818`) with white text. `.hero-title` is the one shared class on the three scattered headline words — tight tracking, `1.05` line-height.

---

## LAYER 5 — VIDEO ASSETS (3 cover loops, loaded from the project CDN)

The hero stacks **three full-bleed background videos**. They are the project's own footage, hosted on the project CDN — **do not swap to stock, do not substitute other footage**, and **do not** ship a local `public/videos/` folder. The three files (lowercase filenames):

```
https://cdn.5sdesign.art/projects/zpeed/zpeed1.mp4
https://cdn.5sdesign.art/projects/zpeed/zpeed2.mp4
https://cdn.5sdesign.art/projects/zpeed/zpeed3.mp4
```

Reference them by their CDN URL in the component (they load cross-origin from the project CDN — no CORS setup needed for `<video>`):

```ts
const videos = [
  'https://cdn.5sdesign.art/projects/zpeed/zpeed1.mp4',
  'https://cdn.5sdesign.art/projects/zpeed/zpeed2.mp4',
  'https://cdn.5sdesign.art/projects/zpeed/zpeed3.mp4',
]
```

- **Role:** full-screen motorsport footage behind the type — `object-cover`, `inset-0`, filling `100%` width and height of the hero.
- **Playback:** each clip plays its **full natural duration**, then advances to the next (`1 → 2 → 3 → 1`). Do **not** cut clips short with a timer.
- **Attributes:** `muted`, `playsInline`, `preload="auto"` on all three so the next clip is buffered and never shows a black flash. Only the first video gets `autoPlay`.
- **Dimensions:** any landscape footage works; the videos are cropped by `object-cover` to the viewport. No fixed pixel dimensions are imposed.

No favicon is shipped in the build; do not invent one.

---

## LAYER 6 — SIGNATURE INTERACTION: cross-fading video loop (`src/components/Hero.tsx`)

The hero's one piece of engineered motion. Three `<video>` elements are stacked absolutely; exactly one is visible at a time. When the active clip fires `onEnded`, the index advances and the next clip cross-fades in over **0.2s** — a fast, near-cut hand-off, not a slow dissolve.

**Behavior (reproduce exactly):**
- `active` (React state) holds the index of the visible video; starts at `0`.
- `refs` is a `useRef<(HTMLVideoElement | null)[]>([])` array holding the three `<video>` DOM nodes.
- A `useEffect` keyed on `[active]` rewinds the now-active video (`currentTime = 0`) and calls `.play().catch(() => {})` (the empty catch swallows the autoplay-policy rejection).
- Each video's `onEnded` advances the index: `setActive((a) => (a + 1) % videos.length)`.
- Visibility is opacity-only: the active video is `opacity-100`, the rest `opacity-0`, all sharing `transition-opacity duration-200`. The clip underneath is already buffered (`preload="auto"`), so the swap is instant.

This is the entire animation system. There is no rAF loop, no GSAP timeline, no scroll trigger, no parallax. Do not add a fade library or lengthen the 200ms transition.

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`src/App.tsx` renders the single `Hero` component, which itself renders `Navbar`:

```tsx
import Hero from './components/Hero'

export default function App() {
  return <Hero />
}
```

There is **one section**. The hero owns the video loop, the navbar, the scattered headline, the description, and three stat cells.

### SECTION 1 — Navbar (`src/components/Navbar.tsx`)

A **floating glass** bar, absolutely positioned, inset **50px** from the left and right viewport edges, **24px** from the top. Not sticky; it does not move.

- Link data: `const links = ['Team', 'Drivers', 'Races', 'Garage']`.
- Wrapper `<nav>`: `absolute top-6 left-[50px] right-[50px] z-20 flex h-16 items-center justify-between rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.35)] px-4 md:px-6` — a `64px`-tall, fully rounded liquid-glass pill with an inset top highlight and an outer drop shadow.
- **Left — brand lockup** (`flex items-center gap-3`):
  - **Logo**: a hand-authored inline `<svg viewBox="0 0 256 256" className="h-5 w-5" aria-hidden="true">` — a **double-chevron** ("»", two right-pointing arrows reading as speed), filled white. Path verbatim:
    ```
    M 40 32 L 144 128 L 40 224 L 40 164 L 80 128 L 40 92 Z M 136 32 L 240 128 L 136 224 L 136 164 L 176 128 L 136 92 Z
    ```
  - **Wordmark**: `<span className="text-white text-[13px] font-semibold uppercase tracking-[0.65px]">zpeed</span>`.
- **Center — links** (`hidden md:flex items-center gap-10`): map `links` to `<a href="#" className="text-white text-[13px] font-semibold uppercase tracking-[0.65px]">{link}</a>`. Hidden below `md`.
- **Right — CTA**: `<button className="h-12 rounded-full bg-[#da291c] px-8 text-[14px] font-bold uppercase tracking-[1.4px] text-white active:bg-[#b01e0a]">Get Tickets</button>` — a `48px`-tall, fully rounded race-red pill, the **only** red element on the page. Press state darkens to `#b01e0a`.

### SECTION 2 — Hero body (`src/components/Hero.tsx`)

**Wrapper:** `<section className="relative h-screen w-full overflow-hidden bg-[#181818]">` — full viewport, clips overflow, Carbon fallback behind the videos.

**Layered children (DOM order):**

1. **Video layer** — map the 3 sources to `<video>` elements:
   ```tsx
   {videos.map((src, i) => (
     <video
       key={src}
       ref={(el) => { refs.current[i] = el }}
       className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
         i === active ? 'opacity-100' : 'opacity-0'
       }`}
       autoPlay={i === 0}
       muted
       playsInline
       preload="auto"
       src={src}
       onEnded={() => setActive((a) => (a + 1) % videos.length)}
     />
   ))}
   ```

2. **`<Navbar />`** — rendered next, sits at `z-20` over the videos.

3. **Content stack** — `<div className="relative h-full w-full">` holding the absolutely-positioned editorial elements:

   - **Scattered headline** — three separate `<h1>` words, each `hero-title absolute text-white font-medium text-[14vw] md:text-[13vw]`, placed diagonally:
     - `Race` — `left-4 md:left-10 top-[18%]`
     - `beyond` — `right-4 md:right-10 top-[38%]`
     - `limits` — `left-[18%] md:left-[28%] top-[58%]`
   - **Description** — `<p className="absolute left-6 md:left-10 top-[46%] max-w-[240px] text-[14px] leading-normal text-white/90">` →
     `We engineer every lap with utmost precision, chasing the apex on every circuit around the world.`
   - **Stat cell — top-right** (`absolute right-6 md:right-24 top-[14%]`):
     - Row (`flex items-center gap-3 justify-end`): a diagonal hairline `<div className="hidden md:block h-px w-24 bg-white/40 rotate-[20deg]" />` then `<span className="text-4xl md:text-5xl font-bold tracking-[-0.02em]">+370</span>`.
     - Label `<p className="text-[11px] font-semibold uppercase tracking-[1.1px] text-white/70 mt-1 text-right">km/h top speed</p>`.
   - **Stat cell — bottom-left** (`absolute left-6 md:left-20 bottom-20 md:bottom-24`):
     - Row (`flex items-center gap-3`): `<span … >+1.2k</span>` then hairline `rotate-[-20deg]`.
     - Label `… mt-1` → `laps led this season`.
   - **Stat cell — bottom-right** (`absolute right-6 md:right-20 bottom-16 md:bottom-20`):
     - Row (`flex items-center gap-3 justify-end`): hairline `rotate-[-20deg]` then `<span … >+58</span>`.
     - Label `… mt-1 text-right` → `race wins`.
   - **Bottom fade** — `<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#181818]" />` — a 192px gradient that sinks the footage into Carbon at the bottom edge.

All three stat numbers are **white** (`+58` is white, not red) — the only red on the page is the navbar CTA. The diagonal divider rules (`rotate-[20deg]` / `rotate-[-20deg]`) are hidden below `md`.

---

## LAYER 8 — ANIMATION STANDARDS

There is no entrance choreography and no animation library. The complete motion inventory:

- **Video cross-fade:** `transition-opacity duration-200` (200ms) between the active clip (`opacity-100`) and the inactive clips (`opacity-0`). Triggered by the `active` state flip on `onEnded`.
- **Playing footage:** each clip's own motion, full duration, advancing `1 → 2 → 3 → 1`.
- **CTA press:** `active:bg-[#b01e0a]` — an instantaneous Tailwind state swap on the `Get Tickets` button, no transition timing.

That is all. **No** scroll-triggered reveals, no `whileInView`, no stagger, no parallax, no typewriter, no counters, no blur-in. Do not add any.

---

## LAYER 9 — RESPONSIVE STANDARDS

- The page is exactly **one viewport tall** — `h-screen` section with `overflow-hidden`; `html/body/#root` are `height: 100%`. No scrolling content.
- Headline scales fluidly with the viewport: `text-[14vw]` on mobile, `text-[13vw]` at `md` and up — never a fixed display size.
- The scattered words and stat cells shift inset at the `md` breakpoint (e.g. `left-4 md:left-10`, `right-6 md:right-24`, `bottom-20 md:bottom-24`) so they breathe on desktop and tuck toward the edges on mobile.
- Nav links (`Team / Drivers / Races / Garage`) are `hidden md:flex` — on mobile only the logo + brand and the `Get Tickets` CTA remain on the bar. Navbar padding tightens to `px-4` on mobile, `md:px-6` on desktop.
- The diagonal divider hairlines (`h-px w-24 …`) are `hidden md:block` — they only appear at `md` and up.
- Description column caps at `max-w-[240px]`; stat numbers scale `text-4xl md:text-5xl`.

---

## LAYER 10 — ICON / LOGO

There is **no icon library**. The single graphic is the **inline SVG double-chevron logo** in the navbar (the speed mark), authored by hand with one `<path>` (verbatim in Layer 7's Navbar spec), filled `#ffffff`, sized `h-5 w-5`, `aria-hidden="true"`.

Do not import lucide-react or any icon package. Do not add a hamburger, social, or arrow icon.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute the stack: it is **Tailwind v4 via `@tailwindcss/vite`** with `@import "tailwindcss";` — **no `tailwind.config.js`**, no PostCSS config, no `@tailwind` directives. Vite 6 + React 18.3 + TypeScript strict.
- Substitute the font ("a sans like Inter" is not Inter); Inter is the only family, weights 400/500/600/700.
- Round colors — the canvas is exactly `#181818` (not `#000`), the accent exactly `#da291c`, the press state exactly `#b01e0a`.
- Spread the red beyond the single `Get Tickets` CTA. The three stat numbers are white; `+58` is **not** red.
- Reword copy — verbatim: headline words `Race` / `beyond` / `limits`; description `We engineer every lap with utmost precision, chasing the apex on every circuit around the world.`; stats `+370` / `km/h top speed`, `+1.2k` / `laps led this season`, `+58` / `race wins`; CTA `Get Tickets`; nav links `Team` / `Drivers` / `Races` / `Garage`; brand `zpeed`; page title `zpeed — motorsport racing team`.
- Change the video behavior: 3 clips loaded from the project CDN (`https://cdn.5sdesign.art/projects/zpeed/zpeed1.mp4` … `zpeed3.mp4`, lowercase), each plays full duration, advances on `onEnded` (`1 → 2 → 3 → 1`), cross-fades over **200ms**, all `muted playsInline preload="auto"`, only the first `autoPlay`. No timer, no controls.
- Change the navbar geometry: floating glass pill, `top-6`, inset `left-[50px] right-[50px]`, `h-16`, `rounded-full`, the exact glass classes + `shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.35)]`.
- Change the scattered-headline positions, the diagonal divider rotations (`20deg` / `-20deg`), or the 192px bottom fade to `#181818`.
- Add a second accent, a light theme, card borders, scroll content, or any animation library.

If a constraint conflicts with a framework limit, clamp to the nearest valid value and leave a comment — do not silently change.

---

## FILE TREE (exact output expected)

```
Zpeed/
├── index.html              # Inter from Google Fonts, title "zpeed — motorsport racing team"
├── package.json            # react, react-dom; dev: @tailwindcss/vite, tailwindcss v4, @vitejs/plugin-react, vite 6, typescript 5
├── vite.config.ts          # plugins: react() + tailwindcss()
├── tsconfig.json           # strict, jsx: react-jsx, target ES2020, noUnusedLocals/Parameters
└── src/                     # 3 cover loops load from the project CDN (no local public/videos/)
    ├── main.tsx           # createRoot + <StrictMode><App /></StrictMode>
    ├── index.css          # Layer 4 verbatim (@import "tailwindcss"; + body + .hero-title)
    ├── App.tsx            # renders <Hero />
    └── components/
        ├── Hero.tsx       # video loop + scattered headline + 3 stat cells + bottom fade
        └── Navbar.tsx     # floating glass pill, chevron logo, links, red CTA
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## DELIVERY CHECKLIST

- [ ] `npm create vite@latest . --template react-ts` (React 18.3 + Vite 6 + TypeScript).
- [ ] `npm i react@^18.3.1 react-dom@^18.3.1` and `npm i -D tailwindcss@^4.1.4 @tailwindcss/vite@^4.1.4 @vitejs/plugin-react vite@^6 typescript@^5.6`.
- [ ] `vite.config.ts` registers `react()` **and** `tailwindcss()`; there is **no** `tailwind.config.js` or `postcss.config.js`.
- [ ] `src/index.css` pasted verbatim from Layer 4 — starts with `@import "tailwindcss";`.
- [ ] `index.html` loads Inter (400/500/600/700), title `zpeed — motorsport racing team`.
- [ ] 3 cover videos load from the project CDN (`https://cdn.5sdesign.art/projects/zpeed/zpeed1.mp4 … zpeed3.mp4`, lowercase) — no local `public/videos/`, no stock footage.
- [ ] `Hero.tsx`: 3 stacked `<video>` (muted, playsInline, preload auto, first autoPlay), `onEnded` advances `1→2→3→1`, cross-fade `transition-opacity duration-200`, `useEffect([active])` rewinds + plays.
- [ ] Scattered headline `Race` / `beyond` / `limits` at the exact `top`/`left`/`right` insets, `text-[14vw] md:text-[13vw]`, `.hero-title`.
- [ ] Description paragraph + 3 white stat cells (`+370` / `+1.2k` / `+58`) with diagonal `rotate-[20deg]` / `rotate-[-20deg]` hairlines (`hidden md:block`), 192px bottom fade to `#181818`.
- [ ] `Navbar.tsx`: floating glass pill inset 50px, inline chevron SVG, brand `zpeed`, 4 links `hidden md:flex`, red `Get Tickets` CTA (`bg-[#da291c]`, `active:bg-[#b01e0a]`).
- [ ] Race red appears ONLY on the `Get Tickets` CTA; everything else white over footage.
- [ ] One screen, no scroll; canvas `#181818`; Inter only; `main.tsx` keeps `StrictMode`.
- [ ] `npm run build` passes clean (`tsc && vite build`, 0 TS errors).

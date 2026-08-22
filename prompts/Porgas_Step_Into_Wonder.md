## Porgas — Step Into Wonder Prompt

> Build the **Porgas — Step Into Wonder** immersive scroll-driven parallax landing page (an AI Mirror product). Two scenes inside a single sticky viewport, five image layers driven by scroll + smoothed mouse parallax, plus an arc-style card carousel. All page logic lives in one file: `src/App.tsx`.

---

## LAYER 1 — OPENING DECLARATION

Build a **single-page immersive parallax landing page** for **Step Into Wonder** — an AI mirror that opens onto living worlds and lets users capture themselves inside them, reimagined by AI.

Pinned stack (no substitutions):

- **React 18 + TypeScript + Vite**
- **Tailwind CSS 3** — used ONLY for responsive breakpoints and a small handful of utility classes (see Layer 9)
- `lucide-react` listed as dependency for compatibility but **NOT imported** in this page
- **No** other UI libraries, **no** animation libraries (no `motion/react`, no GSAP, no shadcn/ui, no headless-ui)

The aesthetic is **warm dark cinematic**: a deep brown-black canvas (`#0a0608`), two scroll-driven scenes inside a sticky viewport, photographic parallax layers with reverse-tracking smoothed mouse offset, and an arc card carousel that fans across a phantom arc tangent to the viewport bottom.

Default text family is `'Nunito', sans-serif`. Default page background is `#0a0608`. Do **not** use neon, purple, or saturated accent colors anywhere — palette is restrained earth + white.

**All page code lives in a SINGLE file: `src/App.tsx`.**

---

> ## 🔴 NON-NEGOTIABLE LAYOUT DECREE (read this before writing any JSX)
>
> **The hero is NEVER centered on a desktop viewport.** At any width ≥ 1024px:
>
> ```
> ┌──────────────────────────────────────────────────────────────────┐
> │  NAV (3 left · LOGO · 3 right)                                   │
> │                                                                  │
> │                                                                  │
> │                                                                  │
> │                                                                  │
> │                                                                  │
> │                                                                  │
> │                                                                  │
> │   STEP INTO                                                      │
> │   WONDER                                  ┌────┐┌────┐┌────┐    │
> │                                           │ R1 ││ 48 ││ R3 │    │
> │   A mirror that opens onto                │    ││ AI ││    │    │
> │   living worlds — gaze...                 └────┘└────┘└────┘    │
> │   • • • •                                                       │
> └──────────────────────────────────────────────────────────────────┘
>    bottom-left (60, 120)                bottom-right (40, 120)
> ```
>
> - **Heading + paragraph + slider dots: `position: absolute; bottom: 120px; left: 60px;`**
> - **3 image cards row: `position: absolute; bottom: 120px; right: 40px;`**
> - **No `align-items: center`, no `justify-content: center`, no centered column** anywhere in the desktop branch.
> - Centered column is reserved for viewports **≤ 1023px** (mobile + tablet). On desktop, use absolute positioning **only**.
>
> If the build comes out centered on a 1280px+ viewport, the build is **wrong** — re-check the absolute positions in Scene 1 UI / Layer 12.

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Nunito:wght@300..800&display=swap"
  rel="stylesheet"
/>
```

**Bodoni Moda** — serif headings, numerals, arc card titles. **Regular (400) only**, plus italic 400 for the single word `INTO`. Because `h1` / `h2` default to bold 700 in browsers, explicitly set `fontWeight: 400` on every heading element — otherwise the browser will faux-bold the missing 700 cut.

**Nunito** — body, nav, descriptions, labels. Weights 300–800 available; default 400.

Tailwind config: no font extension. Set the base family in CSS:

```css
html, body { font-family: 'Nunito', sans-serif; }
```

Use inline `fontFamily: "'Bodoni Moda', serif"` / `"'Nunito', sans-serif"` everywhere else.

If a weight outside the loaded set is requested, clamp to the nearest loaded weight — never let the browser synthesize.

---

## LAYER 3 — COLOR SYSTEM

Single dark theme. No `:root` token system needed — hex/rgba inline.

| Token | Value | Used for |
|---|---|---|
| Page background | `#0a0608` | `html, body, #root, sticky viewport` |
| Heading (mobile/tablet, over light portal) | `#3b1a0a` | `HeadingDark` |
| Heading accent (chevron in mobile, before removal) | `#6b2e0e` | (legacy; chevron has been removed) |
| Subtext (mobile/tablet) | `#5c2d0e` | `<p>` under HeadingDark |
| Heading (desktop, over photo) | `#ffffff` + textShadow `0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)` | Desktop hero `h1` |
| Subtext (desktop) | `rgba(255,245,235,0.88)` + textShadow `0 1px 12px rgba(0,0,0,0.8)` | Desktop hero `<p>` |
| Scene 2 heading | `#ffffff` + textShadow `0 2px 20px rgba(0,0,0,0.4)` | `MIRROR EVERY WORLD` |
| Scene 2 subtext | `rgba(255,255,255,0.82)` | Scene 2 `<p>` |
| Nav links | `#ffffff` opacity 0.9 | every `NavLink` |
| Arc card title | `#ffffff` + textShadow `0 1px 12px rgba(0,0,0,0.4)` | inside `ArcCardSlider` |
| Arc card desc | `rgba(255,255,255,0.85)` + textShadow `0 1px 10px rgba(0,0,0,0.4)` | inside `ArcCardSlider` |
| Arc card number circle | border `1.5px solid rgba(255,255,255,0.5)`, text `rgba(255,255,255,0.85)` | numbered badge |
| Arc card dark overlay | `linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.22) 100%)` | sits above bg, below content |
| Top fade gradient | `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)` | z-45, height 42vh |
| Bottom fade gradient | `linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)` | z-16, height 40% |
| Scene 1 card shadow | `0 8px 32px rgba(0,0,0,0.5)` mobile · `0 8px 32px rgba(0,0,0,0.45)` desktop | `Scene1Card` |
| Scene 1 card gradient overlay | `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 75%, transparent 100%)` | 60% height bottom of each card |

Do not round any of the above to "near" values.

---

## LAYER 4 — CUSTOM CSS / RESET

`src/index.css` is short and is the **only** stylesheet besides Tailwind's three directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: #0a0608;
  font-family: 'Nunito', sans-serif;
  scrollbar-gutter: stable;
}

#root { background: #0a0608; }

@keyframes bobUp {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* Scene 1 responsive switch — desktop is the default; hide it ≤1023px and show centered fallback. */
@media (max-width: 1023.98px) {
  .porgas-scene1-desktop-heading,
  .porgas-scene1-desktop-cards,
  .porgas-scene1-desktop-dots,
  .porgas-scene1-desktop-cue { display: none !important; }
  .porgas-scene1-mobile      { display: flex !important; }
}
```

No liquid-glass, no noise overlays, no shader hooks. The only glass effect on the page is an inline `backdropFilter: blur(5px)` on the lower 44% of each Scene 1 card, masked with a `linear-gradient(to top, black 55%, transparent 100%)` so the blur fades upward.

---

## LAYER 5 — IMAGE ASSETS (no video on this page)

This page uses **no video**. All atmospheric layers and card backgrounds are static images placed in `/Image/` at project root and imported into `App.tsx` so Vite hash-bundles them.

| File | Role | Display behavior |
|---|---|---|
| `Image/WORLD BG.png` | Distant world revealed past the portal | `<img object-fit: cover>` filling layer; scale 1 → 1.18 on scroll |
| `Image/PORTAL BG.png` | The portal you fall into | `object-fit: cover`; scale 1 → 7.5; opacity fades 1 → 0 between scroll 0.65 and 0.85; `transformOrigin: '52% 38%'` |
| `Image/Curtain left.png` | Foreground foliage at bottom-LEFT (transparent PNG, content packed in image's bottom-left) | not a "curtain" — anchored corner foliage; see Layer 7 |
| `Image/Curtain right.png` | Foreground foliage at bottom-RIGHT (mirror) | mirror of left |
| `Image/BOTTOM_CLOUDS.png` | Horizontal cloud band | full-width `<img>` (`width: 100%, height: auto`), parent positioned `bottom: -240` so the strip sits low and the lower portion is clipped by the viewport |
| `Image/Reel 01.png` `Reel 02.png` `Reel 03.png` | Backgrounds for the 3 hero cards (Scene 1) | square-ish photographic; cover, center |
| `Image/Back 01.jpg` … `Back 09.jpg` | Backgrounds for the 9 arc slider cards (Scene 2) | one per card, cover, center |
| `Image/Logo.png` | Nav logo (white art on transparent) | `<img height: 32, width: auto>` in `StarLogo` |

Import every asset via static ES import so Vite emits a hashed URL:

```ts
import worldBg     from '../Image/WORLD BG.png'
import portalBg    from '../Image/PORTAL BG.png'
import curtainLeft from '../Image/Curtain left.png'
import curtainRight from '../Image/Curtain right.png'
import bottomClouds from '../Image/BOTTOM_CLOUDS.png'
import reel01 from '../Image/Reel 01.png'
import reel02 from '../Image/Reel 02.png'
import reel03 from '../Image/Reel 03.png'
import back01 from '../Image/Back 01.jpg'
// ... back02 .. back09
import logo from '../Image/Logo.png'
```

If recreating with placeholder imagery: keep aspect ratios approximately square for cards, panoramic for WORLD_BG / PORTAL_BG, and horizontal cloud band for BOTTOM_CLOUDS. Foliage PNGs must be transparent with content packed into the bottom-left corner (for Curtain left) and bottom-right (for Curtain right).

### Dual-source asset map (use local for build hash, or fetch from CDN)

If you don't have the images locally, fetch each from the CDN (one HEAD-tested mirror per file). Either keep the `../Image/<Name>` Vite import (`<img src={worldBg} />`) for hashed-output builds, **OR** swap each `import` line to a plain const URL and use `<img src={WORLD_BG} />`:

```ts
const WORLD_BG       = 'https://cdn.5sdesign.art/projects/Porgas/world-bg.png'
const PORTAL_BG      = 'https://cdn.5sdesign.art/projects/Porgas/portal-bg.png'
const CURTAIN_LEFT   = 'https://cdn.5sdesign.art/projects/Porgas/curtain-left.png'
const CURTAIN_RIGHT  = 'https://cdn.5sdesign.art/projects/Porgas/curtain-right.png'
const BOTTOM_CLOUDS  = 'https://cdn.5sdesign.art/projects/Porgas/bottom-clouds.png'
const REEL_01        = 'https://cdn.5sdesign.art/projects/Porgas/reel-01.png'
const REEL_02        = 'https://cdn.5sdesign.art/projects/Porgas/reel-02.png'
const REEL_03        = 'https://cdn.5sdesign.art/projects/Porgas/reel-03.png'
// (back01–back09 are user-generated; placeholder same-aspect JPGs are acceptable)
```

Decide ONCE per build: either ALL Vite imports OR ALL CDN consts. Don't mix — keeps refs throughout `App.tsx` consistent. Name the constants UPPER_SNAKE either way; the rest of this prompt uses `WORLD_BG`/`PORTAL_BG`/etc. for clarity.

---

## LAYER 6 — SHARED COMPONENTS

All component definitions live at the top of `src/App.tsx`, before `App`. None take props beyond what is listed.

### `StarLogo()`

```tsx
function StarLogo() {
  return <img src={logo} alt="logo" style={{ height: 32, width: 'auto', display: 'block' }} />
}
```

### `NavLink({ children, size = 12 })`
Anchor `<a href="#">` with inline style:

```ts
fontFamily: "'Nunito', sans-serif"
fontSize: size           // 12 default, 11 on mobile
letterSpacing: '0.12em'
textTransform: 'uppercase'
color: '#fff'
opacity: 0.9
textDecoration: 'none'
cursor: 'pointer'
```

### `ScrollChevron()`
34×34 circle, `borderRadius: '50%'`, `border: '1.5px solid rgba(255,255,255,0.5)'`, centered SVG chevron `<path d="M3 5l4 4 4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />` inside a 14×14 viewBox. Element `animation: bobUp 1.8s ease-in-out infinite`.

### `PlayCircle({ size })`
White circle of given size, flex-centered, contains an SVG right-triangle:

```jsx
<svg width={round(size*0.34)} height={round(size*0.42)} viewBox="0 0 10 12">
  <path d="M0 0 L10 6 L0 12 Z" fill="#3b1a0a" />
</svg>
```

### `Scene1Card(props)`
Props (all sizes in px unless noted):
- `image` (string url)
- `size` (square dimension)
- `radius`
- `variant: 'reel' | 'number'`
- `number?` (string, used when variant === 'number')
- `label` (string)
- `inset = 12`
- `circleSize = 26`
- `numberSize = 28`
- `labelSize = 13`
- `withBlur = false`
- `boxShadow = '0 8px 32px rgba(0,0,0,0.5)'`

Structure:
1. Outer relative box `width/height = size`, `borderRadius: radius`, `overflow: hidden`, `backgroundImage: url(image)` cover center, `boxShadow`, `flexShrink: 0`.
2. Gradient overlay div: absolute, left/right 0, bottom 0, height `'60%'`, background `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 75%, transparent 100%)`, `pointerEvents: 'none'`.
3. If `withBlur`: blur layer absolute, left/right 0, bottom 0, height `'44%'`, `backdropFilter: 'blur(5px)'` (also `WebkitBackdropFilter`), `WebkitMaskImage: 'linear-gradient(to top, black 55%, transparent 100%)'` and `maskImage` same, `pointerEvents: 'none'`.
4. Content area: absolute `left: inset, right: inset, bottom: inset`.
   - `variant === 'reel'`: flex row, gap 8, `<PlayCircle size={circleSize}/>` + `<span style={{ color:'#fff', fontSize: labelSize, fontFamily:"'Nunito', sans-serif" }}>{label}</span>`.
   - `variant === 'number'`: stacked: numeral in `'Bodoni Moda'` `fontSize: numberSize`, color `#fff`, lineHeight 1; below, label in `'Nunito'` `fontSize: labelSize`, color `rgba(255,255,255,0.85)`, marginTop 3.

### `SliderDots()`
Four bars in a flex row gap 8:
- Index 0: `width 28, height 4, borderRadius 2, background rgba(255,255,255,0.9)`
- Others: `width 14, height 4, borderRadius 2, background rgba(255,255,255,0.35)`

### `HeadingDark({ headSize, reverieSize })`

```tsx
<h1 style={{ fontFamily: "'Bodoni Moda', serif", fontWeight: 400, color: '#3b1a0a', margin: 0 }}>
  <span className="tracking-widest" style={{ display:'block', fontSize: headSize, lineHeight: 1.1 }}>
    STEP <span style={{ fontStyle: 'italic' }}>INTO</span>
  </span>
  <span className="tracking-tight leading-none" style={{ display:'block', fontSize: reverieSize }}>
    WONDER
  </span>
</h1>
```

### `ArcCardSlider({ cards, rotationOffset, isMobile })`
Constants (px / deg):

| Name | Mobile | Desktop |
|---|---|---|
| `cardSpacingDeg` | 12 | 9 |
| `centerIndex` | `floor(cards.length / 2)` (=4) | same |
| `arcRadius` | 700 | 1100 |
| `cardW` | 160 | 220 |
| `cardH` | 175 | 230 |
| `sliderH` | 260 | 360 |
| `halfW` | `cardW / 2` | same |
| `cardRadius` | 18 | 26 |
| `bottomBase` | 140 | 200 |
| `titleSize` | 22 | 30 |
| `descSize` | 12 | 15 |

For each card `i`:

```ts
const baseDeg = (i - centerIndex) * cardSpacingDeg
const deg     = baseDeg - rotationOffset + (centerIndex * cardSpacingDeg)
const rad     = deg * Math.PI / 180
const x       = Math.sin(rad) * arcRadius
const y       = arcRadius - Math.cos(rad) * arcRadius
```

Wrapper style:

```ts
position: 'absolute'
bottom: -y + bottomBase
left: `calc(50% + ${x}px - ${halfW}px)`
width: cardW
height: cardH
transform: `rotate(${deg}deg)`
transformOrigin: `${halfW}px ${arcRadius}px`
```

Inner card style:

```ts
position: 'relative'
width: '100%', height: '100%'
borderRadius: cardRadius
backgroundImage: `url(${card.bg})`
backgroundSize: 'cover'
backgroundPosition: 'center'
boxShadow: '0 8px 40px rgba(40,30,40,0.28)'
padding: isMobile ? '16px 16px 18px' : '20px 22px 24px'
display: 'flex'
flexDirection: 'column'
justifyContent: 'flex-end'
overflow: 'hidden'
```

**DOM order inside the inner card is load-bearing — do not reorder:**
1. **Dark overlay** — absolute `inset: 0`, background `linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.22) 100%)`, `pointerEvents: 'none'`.
2. **Numbered circle** — absolute `top: 14 / 18` (mobile / desktop), `right: 14 / 18`, `width 24, height 24`, `borderRadius: '50%'`, `border: '1.5px solid rgba(255,255,255,0.5)'`, flex-centered, `fontSize 10`, `fontFamily 'Nunito'`, color `rgba(255,255,255,0.85)`. Text: `String(i + 1).padStart(2, '0')`.
3. **Title** — `position: 'relative'`, `fontFamily 'Bodoni Moda'`, `fontSize: titleSize`, color `'#fff'`, lineHeight 1.05, textShadow `'0 1px 12px rgba(0,0,0,0.4)'`. Text: `card.title`.
4. **Desc** — `position: 'relative'`, `fontFamily 'Nunito'`, `fontSize: descSize`, color `'rgba(255,255,255,0.85)'`, marginTop 6, lineHeight 1.4, textShadow `'0 1px 10px rgba(0,0,0,0.4)'`. Text: `card.desc`.

(Items 2–4 must come AFTER the overlay div so they paint above it.)

---

## LAYER 7 — SCENE ARCHITECTURE

### Outer structure

```tsx
<div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>
    {/* layers below */}
  </div>
</div>
```

### Z-index stack (bottom → top)

| z-index | Layer | Notes |
|---|---|---|
| auto (0) | World BG | absolute inset 0, `transformOrigin: '50% 50%'`, `willChange: 'transform'` |
| 9 | Arc card slider wrapper | absolute, `bottom: isMobile ? 60 : 80`, left/right 0, opacity = `scene2Opacity`, `pointerEvents: 'none'` |
| 10 | Bottom clouds | absolute, `bottom: -240`, left/right 0, `transformOrigin: '50% 100%'`, initial opacity `0.7` |
| 15 | Portal BG | absolute inset 0, `transformOrigin: '52% 38%'`, `willChange: 'transform, opacity'` |
| 16 | Bottom fade gradient | absolute, bottom 0, left/right 0, `height: '40%'`, `linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)`, `pointerEvents: 'none'` |
| 16 | Foliage LEFT | absolute inset 0, `transformOrigin: '0% 100%'`, contains `<img>` |
| 16 | Foliage RIGHT | absolute inset 0, `transformOrigin: '100% 100%'`, contains `<img>` |
| 20 | Scene 1 UI | absolute inset 0, `opacity: scene1Opacity`, `pointerEvents: 'none'` |
| 45 | Top fade gradient | absolute, top 0, left/right 0, `height: '42vh'`, `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)`, `pointerEvents: 'none'` |
| 46 | Scene 2 UI | absolute inset 0, `opacity: scene2Opacity`, `pointerEvents: 'none'`, flex column centered text-center, `paddingTop: '8vh'` mobile / `'12vh'` desktop |
| 50 | Nav | absolute top 0 left 0 right 0, flex space-between items-center |

### Foliage images (Curtain left / right) — DOM

```tsx
<div ref={curtainLRef} style={{ position:'absolute', inset:0, zIndex:16,
       transformOrigin:'0% 100%', willChange:'transform, opacity', pointerEvents:'none' }}>
  <img src={CURTAIN_LEFT} alt="" style={{
       position:'absolute', bottom:0, left:0,
       width:'clamp(220px, 42vw, 560px)', height:'auto', display:'block' }} />
</div>
```

Mirror for right (`transformOrigin: '100% 100%'`, `right: 0`).

### Bottom clouds DOM

```tsx
<div ref={cloudsRef} style={{ position:'absolute', bottom:-240, left:0, right:0, zIndex:10,
     transformOrigin:'50% 100%', opacity:0.7, willChange:'transform, opacity' }}>
  <img src={BOTTOM_CLOUDS} alt="" style={{ width:'100%', height:'auto', display:'block' }} />
</div>
```

### Navigation

**Mobile** (`className="flex md:hidden"`, full width, `justifyContent: 'space-between'`, `padding: '18px 20px'`):
- `<NavLink size={11}>Explore</NavLink>` · `<StarLogo />` · `<NavLink size={11}>Capture</NavLink>`

**Tablet/Desktop** (`className="hidden md:flex"`, full width, `justifyContent: 'space-between'`, `padding: '22px 48px'`):
- Left group (flex, gap 36): `Worlds` · `Mirror` · `Capture`
- `<StarLogo />`
- Right group (flex, gap 36): `Gallery` · `Story` · `Connect`

### Scene 1 UI — three responsive blocks

Wrapper: absolute inset 0, z-index 20, `opacity = clamp(1 - sp/0.22, 0, 1)`, `pointerEvents: 'none'`.

**Mobile** (`className="flex md:hidden"`):

```ts
flexDirection: 'column'
alignItems: 'center'
textAlign: 'center'
padding: '80px 24px 100px'
height: '100%'
justifyContent: 'flex-end'
gap: 24
```

Children in order:
1. `<HeadingDark headSize="clamp(26px, 7vw, 42px)" reverieSize="clamp(52px, 16vw, 80px)" />`
2. `<p className="leading-relaxed" style={{ fontFamily:"'Nunito', sans-serif", fontSize:15, color:'#5c2d0e', maxWidth:280 }}>` — **verbatim**:
   > A mirror that opens onto living worlds — gaze into distant horizons and capture yourself within them, reimagined by AI.
3. Single `Scene1Card`: `image={reel01}, size=140, radius=22, variant='reel', label='See It Live', labelSize=13, circleSize=26`.

**Tablet** (`className="hidden md:flex xl:hidden"`):

```ts
flexDirection: 'column'
alignItems: 'center'
textAlign: 'center'
padding: '80px 32px 96px'
height: '100%'
justifyContent: 'flex-end'
gap: 28
```

Children:
1. `<HeadingDark headSize="clamp(28px, 5vw, 44px)" reverieSize="clamp(60px, 12vw, 86px)" />`
2. `<p className="leading-relaxed" style={{ fontFamily:"'Nunito', sans-serif", fontSize:16, color:'#5c2d0e', maxWidth:400 }}>` — same hero copy.
3. `<div className="flex gap-3.5">` containing three `Scene1Card`, each `size=140, radius=22, withBlur=true`, `circleSize=26, labelSize=13`:
   - Card 1: `image={reel01}, variant='reel', label='See It Live'`
   - Card 2: `image={reel02}, variant='number', number='48', label='AI Worlds', numberSize=28`
   - Card 3: `image={reel03}, variant='reel', label='See It Live'`

**Desktop heading** (`className="hidden xl:block"`, absolute, `bottom: 120`, `left: 60`, `maxWidth: 440`):

```tsx
<h1 style={{
  fontFamily: "'Bodoni Moda', serif",
  fontWeight: 400,
  color: '#fff',
  margin: 0,
  textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
}}>
  <span style={{ display:'block', fontSize:'clamp(32px, 4.5vw, 54px)', lineHeight:1.1, letterSpacing:'0.04em' }}>
    STEP <span style={{ fontStyle:'italic' }}>INTO</span>
  </span>
  <span style={{ display:'block', fontSize:'clamp(50px, 7.5vw, 88px)', lineHeight:0.9, letterSpacing:'-0.02em' }}>
    WONDER
  </span>
</h1>
<p style={{
  fontFamily: "'Nunito', sans-serif",
  marginTop: 24,
  fontSize: 18,
  lineHeight: 1.7,
  color: 'rgba(255,245,235,0.88)',
  maxWidth: 300,
  textShadow: '0 1px 12px rgba(0,0,0,0.8)',
}}>
  A mirror that opens onto living worlds — gaze into distant horizons and capture yourself within them, reimagined by AI.
</p>
```

**Desktop cards** (`className="hidden xl:flex"`, absolute, `right: 40`, `bottom: 120`, `gap: 12`):
Three `Scene1Card`, each `size=158, radius=28, withBlur=true, boxShadow='0 8px 32px rgba(0,0,0,0.45)', circleSize=30, labelSize=18`:
- Card 1: `image={reel01}, variant='reel', label='See It Live'`
- Card 2: `image={reel02}, variant='number', number='48', label='AI Worlds', numberSize=36`
- Card 3: `image={reel03}, variant='reel', label='See It Live'`

**Slider dots — mobile/tablet** (`className="flex xl:hidden"`, absolute, `bottom: 28`, left/right 0, `justifyContent:'center'`, `gap: 8`): `<SliderDots />`.

**Slider dots — desktop** (`className="hidden xl:flex"`, absolute, `bottom: 40`, `left: 60`, `gap: 8`): `<SliderDots />`.

**Scroll cue — desktop only** (`className="hidden xl:flex"`, absolute, `bottom: 36`, left/right 0, flex column items-center, `gap: 10`):
- `<span style={{ fontFamily:"'Nunito', sans-serif", fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>Descend</span>`
- `<ScrollChevron />`

### Scene 2 UI

```tsx
<h2 style={{
  fontFamily: "'Bodoni Moda', serif",
  fontWeight: 400,
  color: '#fff',
  fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(38px, 6.5vw, 78px)',
  letterSpacing: '0.03em',
  lineHeight: 1.05,
  textShadow: '0 2px 20px rgba(0,0,0,0.4)',
  margin: 0,
  padding: '0 20px',
}}>
  MIRROR EVERY WORLD
</h2>
<p style={{
  fontFamily: "'Nunito', sans-serif",
  fontSize: isMobile ? 14 : 20,
  lineHeight: 1.6,
  letterSpacing: '-0.01em',
  maxWidth: isMobile ? 260 : 480,
  color: 'rgba(255,255,255,0.82)',
  marginTop: 18,
  padding: '0 20px',
}}>
  Step before the glass and choose your backdrop — every scene a place to see yourself, captured in a single AI-perfected frame.
</p>
```

### Arc card data (verbatim, in order)

```ts
type CardData = { title: string; desc: string; bg: string }

const CARD_DATA: CardData[] = [
  { title: 'Hidden Realms',  desc: 'Pose within luminous sanctuaries unseen by eyes',     bg: back01 },
  { title: 'Wild Solitudes', desc: 'Frame yourself against untamed, boundless horizons', bg: back02 },
  { title: 'Silent Havens',  desc: 'Capture calm in escapes beyond ordinary reach',      bg: back03 },
  { title: 'Bespoke Quests', desc: 'Worlds shaped around the portrait you imagine',      bg: back04 },
  { title: 'Vivid Drifts',   desc: 'Step into surreal passages of breathtaking color',   bg: back05 },
  { title: 'Mystic Crests',  desc: 'Stand on ridgelines wrapped in cloud and myth',      bg: back06 },
  { title: 'Deep Currents',  desc: 'Mirror yourself in glowing, uncharted depths',       bg: back07 },
  { title: 'Gilded Dusk',    desc: 'Catch amber light that stretches past all reason',   bg: back08 },
  { title: 'Glassy Tides',   desc: 'Reflect against waters of pure, perfect stillness',  bg: back09 },
]
```

---

## LAYER 8 — ANIMATION STANDARDS

### Helpers

```ts
const easeInOut = (t: number) => (t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
```

### Mouse parallax magnitudes (px per unit normalized mouse)

```ts
const MAG = { world: 6, clouds: 9, portal: 7, curtainL: 14, curtainR: 14 }
```

### Scroll progress

```ts
const onScroll = () => {
  const c = containerRef.current
  if (!c) return
  const max = c.scrollHeight - window.innerHeight
  const p = clamp(window.scrollY / (max || 1), 0, 1)
  scrollProgressRef.current = p
  setScrollProgress(p)
}
```

Attach to `window` `scroll` (passive) and `resize`. Stored in both React state (for opacity-driven UI) and a mutable ref (for rAF reads).

### rAF parallax loop

```ts
const target = { x: 0, y: 0 }     // raw mouse
const smooth = { x: 0, y: 0 }     // lerped mouse

const onMove = (e: MouseEvent) => {
  target.x = (e.clientX / window.innerWidth  - 0.5) * 2
  target.y = (e.clientY / window.innerHeight - 0.5) * 2
}
if (!isMobile) window.addEventListener('mousemove', onMove)

const tick = () => {
  smooth.x = lerp(smooth.x, target.x, 0.07)
  smooth.y = lerp(smooth.y, target.y, 0.07)
  const sp = scrollProgressRef.current
  const ep = easeInOut(sp)
  const mx = isMobile ? 0 : smooth.x
  const my = isMobile ? 0 : smooth.y

  // WORLD
  worldRef.current!.style.transform =
    `translate(${-mx*MAG.world}px, ${-my*MAG.world}px) scale(${lerp(1, 1.18, ep)})`

  // CLOUDS
  cloudsRef.current!.style.transform =
    `translate(${-mx*MAG.clouds}px, ${-my*MAG.clouds*0.4}px) scale(${lerp(1, 1.4, ep)})`
  cloudsRef.current!.style.opacity = String(lerp(0.7, 1, clamp(sp/0.05, 0, 1)))

  // PORTAL
  portalRef.current!.style.transform =
    `translate(${-mx*MAG.portal}px, ${-my*MAG.portal}px) scale(${lerp(1, 7.5, ep)})`
  portalRef.current!.style.opacity = String(clamp(1 - (sp - 0.65)/0.20, 0, 1))

  // FOLIAGE L / R — anchored bottom corner; grows from corner; fades out as portal is entered
  const folScale   = lerp(1, 1.7, ep)
  const folOpacity = clamp(1 - (sp - 0.5)/0.28, 0, 1)
  curtainLRef.current!.style.transform =
    `translate(${-mx*MAG.curtainL}px, ${-my*MAG.curtainL*0.3}px) scale(${folScale})`
  curtainLRef.current!.style.opacity = String(folOpacity)
  curtainRRef.current!.style.transform =
    `translate(${-mx*MAG.curtainR}px, ${-my*MAG.curtainR*0.3}px) scale(${folScale})`
  curtainRRef.current!.style.opacity = String(folOpacity)

  raf = requestAnimationFrame(tick)
}
raf = requestAnimationFrame(tick)
```

Notes:
- `transform` is written EVERY frame to refs (rAF owns transform). React must NOT set `transform` on these layer divs.
- `opacity` is rAF-owned on Clouds / Portal / Foliage. For Scene 1/2 UI wrappers opacity comes from React state (`scene1Opacity` / `scene2Opacity`).
- Mouse listener attached only when not mobile; on mobile `mx = my = 0`.
- Speed = 0.07 per frame lerp.

### Derived UI values

```ts
const scene1Opacity = clamp(1 - scrollProgress/0.22, 0, 1)
const scene2Opacity = clamp((scrollProgress - 0.68)/0.16, 0, 1)
const arcSweepDeg   = (CARD_DATA.length - 1) * 10           // = 80
const rotationOffset = lerp(0, arcSweepDeg, clamp((scrollProgress - 0.7)/0.3, 0, 1))
```

### Entrance timeline
Single timeout sets `uiVisible = true` at **600 ms** after mount. Each Scene 1 UI element fades in via CSS transition:

```ts
const fade = (delay: string): CSSProperties => ({
  opacity: uiVisible ? 1 : 0,
  transform: uiVisible ? 'translateY(0)' : 'translateY(20px)',
  transition: 'opacity 0.9s ease, transform 0.9s ease',
  transitionDelay: delay,
})
```

Per element:
| Element | delay |
|---|---|
| Mobile column | `0.3s` |
| Tablet column | `0.3s` |
| Desktop heading | `0.3s` |
| Desktop cards | `0.55s` |
| Slider dots (mobile & desktop) | `0.8s` |
| Scroll cue (desktop) | `0.9s` |

Foliage / clouds / portal / world have **no** entrance fade — they're present from first paint and only react to scroll + mouse.

### `useIsMobile()` hook

```ts
function useIsMobile() {
  const [m, setM] = useState(window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setM(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return m
}
```

---

## LAYER 9 — RESPONSIVE STANDARDS

### Tailwind `screens` override (critical)

```js
// tailwind.config.js
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1024px',     // <-- override; desktop split layout kicks in at this width
  '2xl': '1536px',
}
```

The `xl: 1024px` cutoff is what switches the layout from a centered column (mobile / tablet) to absolute-positioned heading-left + cards-right (desktop). At any viewport ≥ 1024px the layout MUST be left/right split — never centered.

### Tailwind usage scope
Use Tailwind only for:
- Responsive visibility: `flex md:hidden`, `hidden md:flex xl:hidden`, `hidden xl:block`, `hidden xl:flex`, `flex xl:hidden`.
- A handful of typography utilities: `tracking-widest`, `tracking-tight`, `leading-none`, `leading-relaxed`.
- Layout helpers: `flex`, `gap-3.5`.

**Everything else** is inline `CSSProperties`. Do not introduce additional Tailwind classes.

### A gotcha to avoid
If you put inline `style={{ display: 'flex' }}` on an element whose visibility is controlled by `md:hidden` / `xl:hidden`, the inline `display` wins over Tailwind's `display: none` media query. Always provide visibility via classes (`flex md:hidden`, not inline display + class). The current implementation enforces this.

---

## LAYER 10 — ICON SET

Only two icon affordances exist on this page; both inline SVG, no `lucide-react` import:

- **Play triangle** (inside `PlayCircle`):
  ```html
  <path d="M0 0 L10 6 L0 12 Z" fill="#3b1a0a" />
  ```
- **Scroll chevron** (inside `ScrollChevron`):
  ```html
  <path d="M3 5l4 4 4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ```

`lucide-react` is listed in `package.json` for compatibility but **must not** be imported in `App.tsx`. Do not add any other icon library.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do NOT:

- Substitute fonts. Bodoni Moda Regular 400 only (italic 400 for `INTO`); Nunito 300–800. "Close to" is not acceptable.
- Round any hex / rgba value.
- Re-word any copy — every English string in Layer 7 is verbatim.
- Change any parallax magnitude in `MAG` (6 / 9 / 7 / 14 / 14) or any of the scale ceilings (`1.18`, `1.4`, `7.5`, `1.7`).
- Reorder DOM children inside the arc card — overlay MUST come before the numbered circle / title / desc, otherwise the dark overlay paints on top of text.
- Pull in `motion/react`, GSAP, shadcn, headless-ui, or any animation/UI library. Animation is hand-rolled rAF + CSS transitions only.
- Set `transform` on a parallax layer ref via React style; rAF owns transform on World / Clouds / Portal / Foliage. React owns only `opacity` on Scene 1 / Scene 2 wrappers.

If an asset is genuinely missing, substitute with an equivalent same-aspect placeholder and add a one-line `// placeholder` comment near the import — never silently change a number or a string.

---

## LAYER 12 — `App.tsx` ASSEMBLY (canonical skeleton)

This is the **single-file assembly** all earlier layers fold into. Every ref / state / effect declared here is consumed by Layer 7's JSX and Layer 8's rAF loop. Reproduce the order verbatim.

```tsx
import { useEffect, useRef, useState, type CSSProperties } from 'react'

// — assets: pick ONE source convention from Layer 5 —
const WORLD_BG       = 'https://cdn.5sdesign.art/projects/Porgas/world-bg.png'
const PORTAL_BG      = 'https://cdn.5sdesign.art/projects/Porgas/portal-bg.png'
const CURTAIN_LEFT   = 'https://cdn.5sdesign.art/projects/Porgas/curtain-left.png'
const CURTAIN_RIGHT  = 'https://cdn.5sdesign.art/projects/Porgas/curtain-right.png'
const BOTTOM_CLOUDS  = 'https://cdn.5sdesign.art/projects/Porgas/bottom-clouds.png'
const REEL_01        = 'https://cdn.5sdesign.art/projects/Porgas/reel-01.png'
const REEL_02        = 'https://cdn.5sdesign.art/projects/Porgas/reel-02.png'
const REEL_03        = 'https://cdn.5sdesign.art/projects/Porgas/reel-03.png'
const BACKS: string[] = [ /* back01..back09 — local Vite imports OR CDN URLs */ ]

// — math helpers (Layer 8) —
const easeInOut = (t: number) => (t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t)
const lerp      = (a: number, b: number, t: number) => a + (b - a) * t
const clamp     = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// — useIsMobile (Layer 8) —
function useIsMobile() { /* exactly as Layer 8 */ }

// — shared components (Layer 6) —
function StarLogo()         { /* exactly as Layer 6 */ }
function NavLink(/* … */)   { /* exactly as Layer 6 */ }
function ScrollChevron()    { /* exactly as Layer 6 */ }
function PlayCircle(/* … */){ /* exactly as Layer 6 */ }
function Scene1Card(/* … */){ /* exactly as Layer 6 */ }
function SliderDots()       { /* exactly as Layer 6 */ }
function HeadingDark(/* … */){ /* exactly as Layer 6 */ }
function ArcCardSlider({ cards, rotationOffset, isMobile }: {
  cards: { title: string; desc: string; bg: string }[]
  rotationOffset: number
  isMobile: boolean
}) { /* exactly as Layer 6 */ }

// — arc data (Layer 7) —
type CardData = { title: string; desc: string; bg: string }
const CARD_DATA: CardData[] = [
  { title: 'Hidden Realms',  desc: 'Pose within luminous sanctuaries unseen by eyes',     bg: BACKS[0] },
  { title: 'Wild Solitudes', desc: 'Frame yourself against untamed, boundless horizons', bg: BACKS[1] },
  { title: 'Silent Havens',  desc: 'Capture calm in escapes beyond ordinary reach',      bg: BACKS[2] },
  { title: 'Bespoke Quests', desc: 'Worlds shaped around the portrait you imagine',      bg: BACKS[3] },
  { title: 'Vivid Drifts',   desc: 'Step into surreal passages of breathtaking color',   bg: BACKS[4] },
  { title: 'Mystic Crests',  desc: 'Stand on ridgelines wrapped in cloud and myth',      bg: BACKS[5] },
  { title: 'Deep Currents',  desc: 'Mirror yourself in glowing, uncharted depths',       bg: BACKS[6] },
  { title: 'Gilded Dusk',    desc: 'Catch amber light that stretches past all reason',   bg: BACKS[7] },
  { title: 'Glassy Tides',   desc: 'Reflect against waters of pure, perfect stillness',  bg: BACKS[8] },
]

export default function App() {
  const isMobile = useIsMobile()

  // refs touched by rAF (Layer 8) — never set from React style
  const containerRef = useRef<HTMLDivElement>(null)
  const worldRef     = useRef<HTMLDivElement>(null)
  const cloudsRef    = useRef<HTMLDivElement>(null)
  const portalRef    = useRef<HTMLDivElement>(null)
  const curtainLRef  = useRef<HTMLDivElement>(null)
  const curtainRRef  = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef(0)

  // React-owned state
  const [scrollProgress, setScrollProgress] = useState(0)
  const [uiVisible, setUiVisible]           = useState(false)

  // derived (Layer 8)
  const scene1Opacity = clamp(1 - scrollProgress/0.22, 0, 1)
  const scene2Opacity = clamp((scrollProgress - 0.68)/0.16, 0, 1)
  const arcSweepDeg   = (CARD_DATA.length - 1) * 10
  const rotationOffset = lerp(0, arcSweepDeg, clamp((scrollProgress - 0.7)/0.3, 0, 1))

  // scroll listener (Layer 8)
  useEffect(() => {
    const onScroll = () => {
      const c = containerRef.current; if (!c) return
      const max = c.scrollHeight - window.innerHeight
      const p = clamp(window.scrollY / (max || 1), 0, 1)
      scrollProgressRef.current = p
      setScrollProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // mouse + rAF parallax loop (Layer 8)
  useEffect(() => {
    const target = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    const MAG = { world: 6, clouds: 9, portal: 7, curtainL: 14, curtainR: 14 }
    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth  - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (!isMobile) window.addEventListener('mousemove', onMove)
    let raf = 0
    const tick = () => {
      smooth.x = lerp(smooth.x, target.x, 0.07)
      smooth.y = lerp(smooth.y, target.y, 0.07)
      const sp = scrollProgressRef.current
      const ep = easeInOut(sp)
      const mx = isMobile ? 0 : smooth.x
      const my = isMobile ? 0 : smooth.y
      if (worldRef.current) worldRef.current.style.transform =
        `translate(${-mx*MAG.world}px, ${-my*MAG.world}px) scale(${lerp(1, 1.18, ep)})`
      if (cloudsRef.current) {
        cloudsRef.current.style.transform =
          `translate(${-mx*MAG.clouds}px, ${-my*MAG.clouds*0.4}px) scale(${lerp(1, 1.4, ep)})`
        cloudsRef.current.style.opacity = String(lerp(0.7, 1, clamp(sp/0.05, 0, 1)))
      }
      if (portalRef.current) {
        portalRef.current.style.transform =
          `translate(${-mx*MAG.portal}px, ${-my*MAG.portal}px) scale(${lerp(1, 7.5, ep)})`
        portalRef.current.style.opacity = String(clamp(1 - (sp - 0.65)/0.20, 0, 1))
      }
      const folScale   = lerp(1, 1.7, ep)
      const folOpacity = clamp(1 - (sp - 0.5)/0.28, 0, 1)
      if (curtainLRef.current) {
        curtainLRef.current.style.transform =
          `translate(${-mx*MAG.curtainL}px, ${-my*MAG.curtainL*0.3}px) scale(${folScale})`
        curtainLRef.current.style.opacity = String(folOpacity)
      }
      if (curtainRRef.current) {
        curtainRRef.current.style.transform =
          `translate(${-mx*MAG.curtainR}px, ${-my*MAG.curtainR*0.3}px) scale(${folScale})`
        curtainRRef.current.style.opacity = String(folOpacity)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [isMobile])

  // entrance fade (Layer 8)
  useEffect(() => {
    const t = setTimeout(() => setUiVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  const fade = (delay: string): CSSProperties => ({
    opacity: uiVisible ? 1 : 0,
    transform: uiVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.9s ease, transform 0.9s ease',
    transitionDelay: delay,
  })

  return (
    <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>

        {/* z 0  · WORLD BG */}
        <div ref={worldRef} style={{ position:'absolute', inset:0, transformOrigin:'50% 50%', willChange:'transform' }}>
          <img src={WORLD_BG} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>

        {/* z 9  · ARC CARD SLIDER (Scene 2) */}
        <div style={{ position:'absolute', left:0, right:0, bottom: isMobile ? 60 : 80, zIndex:9, opacity:scene2Opacity, pointerEvents:'none' }}>
          <ArcCardSlider cards={CARD_DATA} rotationOffset={rotationOffset} isMobile={isMobile} />
        </div>

        {/* z 10 · BOTTOM CLOUDS */}
        <div ref={cloudsRef} style={{ position:'absolute', bottom:-240, left:0, right:0, zIndex:10,
             transformOrigin:'50% 100%', opacity:0.7, willChange:'transform, opacity' }}>
          <img src={BOTTOM_CLOUDS} alt="" style={{ width:'100%', height:'auto', display:'block' }} />
        </div>

        {/* z 15 · PORTAL BG */}
        <div ref={portalRef} style={{ position:'absolute', inset:0, zIndex:15,
             transformOrigin:'52% 38%', willChange:'transform, opacity' }}>
          <img src={PORTAL_BG} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>

        {/* z 16 · BOTTOM FADE */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', zIndex:16,
             background:'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents:'none' }} />

        {/* z 16 · FOLIAGE LEFT + RIGHT (Layer 7 templates) */}
        <div ref={curtainLRef} style={{ position:'absolute', inset:0, zIndex:16,
             transformOrigin:'0% 100%', willChange:'transform, opacity', pointerEvents:'none' }}>
          <img src={CURTAIN_LEFT} alt="" style={{ position:'absolute', bottom:0, left:0,
            width:'clamp(220px, 42vw, 560px)', height:'auto', display:'block' }} />
        </div>
        <div ref={curtainRRef} style={{ position:'absolute', inset:0, zIndex:16,
             transformOrigin:'100% 100%', willChange:'transform, opacity', pointerEvents:'none' }}>
          <img src={CURTAIN_RIGHT} alt="" style={{ position:'absolute', bottom:0, right:0,
            width:'clamp(220px, 42vw, 560px)', height:'auto', display:'block' }} />
        </div>

        {/* z 20 · SCENE 1 UI — DESKTOP IS THE DEFAULT.
            Heading + paragraph absolute bottom-LEFT (left:60, bottom:120).
            3 image cards row absolute bottom-RIGHT (right:40, bottom:120).
            At viewport ≤1023px the `.porgas-scene1-mobile` block becomes visible and the desktop blocks hide.
            DO NOT replace this with a centered column. */}
        <div style={{ position:'absolute', inset:0, zIndex:20, opacity:scene1Opacity, pointerEvents:'none' }}>

          {/* ── DESKTOP DEFAULT — heading bottom-LEFT ── */}
          <div className="porgas-scene1-desktop-heading" style={{ position:'absolute', bottom:120, left:60, maxWidth:440, ...fade('0.3s') }}>
            <h1 style={{
              fontFamily:"'Bodoni Moda', serif", fontWeight:400, color:'#fff', margin:0,
              textShadow:'0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
            }}>
              <span style={{ display:'block', fontSize:'clamp(32px, 4.5vw, 54px)', lineHeight:1.1, letterSpacing:'0.04em' }}>
                STEP <span style={{ fontStyle:'italic' }}>INTO</span>
              </span>
              <span style={{ display:'block', fontSize:'clamp(50px, 7.5vw, 88px)', lineHeight:0.9, letterSpacing:'-0.02em' }}>
                WONDER
              </span>
            </h1>
            <p style={{
              fontFamily:"'Nunito', sans-serif", marginTop:24, fontSize:18, lineHeight:1.7,
              color:'rgba(255,245,235,0.88)', maxWidth:300,
              textShadow:'0 1px 12px rgba(0,0,0,0.8)',
            }}>
              A mirror that opens onto living worlds — gaze into distant horizons and capture yourself within them, reimagined by AI.
            </p>
          </div>

          {/* ── DESKTOP DEFAULT — 3 cards bottom-RIGHT ── */}
          <div className="porgas-scene1-desktop-cards" style={{ position:'absolute', right:40, bottom:120, display:'flex', gap:12, ...fade('0.55s') }}>
            <Scene1Card image={REEL_01} size={158} radius={28} variant="reel"   label="See It Live" labelSize={18} circleSize={30} withBlur boxShadow="0 8px 32px rgba(0,0,0,0.45)" />
            <Scene1Card image={REEL_02} size={158} radius={28} variant="number" number="48" label="AI Worlds" labelSize={18} circleSize={30} numberSize={36} withBlur boxShadow="0 8px 32px rgba(0,0,0,0.45)" />
            <Scene1Card image={REEL_03} size={158} radius={28} variant="reel"   label="See It Live" labelSize={18} circleSize={30} withBlur boxShadow="0 8px 32px rgba(0,0,0,0.45)" />
          </div>

          {/* ── DESKTOP DEFAULT — slider dots bottom-LEFT under heading ── */}
          <div className="porgas-scene1-desktop-dots" style={{ position:'absolute', bottom:40, left:60, display:'flex', gap:8, ...fade('0.8s') }}>
            <SliderDots />
          </div>

          {/* ── DESKTOP DEFAULT — scroll cue centered bottom ── */}
          <div className="porgas-scene1-desktop-cue" style={{ position:'absolute', bottom:36, left:0, right:0, display:'flex', flexDirection:'column', alignItems:'center', gap:10, ...fade('0.9s') }}>
            <span style={{ fontFamily:"'Nunito', sans-serif", fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>Descend</span>
            <ScrollChevron />
          </div>

          {/* ── ≤1023px ONLY — centered fallback (mobile + tablet) ── */}
          <div className="porgas-scene1-mobile" style={{
            display:'none',            // base: hidden. Media query below flips to flex on ≤1023px.
            flexDirection:'column', alignItems:'center', textAlign:'center',
            height:'100%', justifyContent:'flex-end', gap:24, padding:'80px 24px 100px',
          }}>
            <div style={fade('0.3s')}>
              <HeadingDark headSize="clamp(26px, 7vw, 42px)" reverieSize="clamp(52px, 16vw, 80px)" />
            </div>
            <p style={{ fontFamily:"'Nunito', sans-serif", fontSize:15, color:'#5c2d0e', maxWidth:280, lineHeight:1.6, ...fade('0.3s') }}>
              A mirror that opens onto living worlds — gaze into distant horizons and capture yourself within them, reimagined by AI.
            </p>
            <div className="porgas-scene1-mobile-cards" style={{ display:'flex', gap:14, ...fade('0.55s') }}>
              <Scene1Card image={REEL_01} size={140} radius={22} variant="reel"   label="See It Live" labelSize={13} circleSize={26} withBlur />
              <Scene1Card image={REEL_02} size={140} radius={22} variant="number" number="48" label="AI Worlds" labelSize={13} circleSize={26} numberSize={28} withBlur />
              <Scene1Card image={REEL_03} size={140} radius={22} variant="reel"   label="See It Live" labelSize={13} circleSize={26} withBlur />
            </div>
            <div style={{ position:'absolute', bottom:28, left:0, right:0, display:'flex', justifyContent:'center', gap:8, ...fade('0.8s') }}>
              <SliderDots />
            </div>
          </div>

        </div>

        {/* z 45 · TOP FADE */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'42vh', zIndex:45,
             background:'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents:'none' }} />

        {/* z 46 · SCENE 2 UI (heading + paragraph) */}
        <div style={{ position:'absolute', inset:0, zIndex:46, opacity:scene2Opacity, pointerEvents:'none',
             display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
             paddingTop: isMobile ? '8vh' : '12vh' }}>
          <h2 style={{
            fontFamily:"'Bodoni Moda', serif", fontWeight:400, color:'#fff',
            fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(38px, 6.5vw, 78px)',
            letterSpacing:'0.03em', lineHeight:1.05,
            textShadow:'0 2px 20px rgba(0,0,0,0.4)', margin:0, padding:'0 20px',
          }}>
            MIRROR EVERY WORLD
          </h2>
          <p style={{
            fontFamily:"'Nunito', sans-serif", fontSize: isMobile ? 14 : 20, lineHeight:1.6,
            letterSpacing:'-0.01em', maxWidth: isMobile ? 260 : 480,
            color:'rgba(255,255,255,0.82)', marginTop:18, padding:'0 20px',
          }}>
            Step before the glass and choose your backdrop — every scene a place to see yourself, captured in a single AI-perfected frame.
          </p>
        </div>

        {/* z 50 · NAV */}
        <nav style={{ position:'absolute', top:0, left:0, right:0, zIndex:50 }}>
          {/* mobile */}
          <div className="flex md:hidden" style={{ width:'100%', justifyContent:'space-between', alignItems:'center', padding:'18px 20px' }}>
            <NavLink size={11}>Explore</NavLink>
            <StarLogo />
            <NavLink size={11}>Capture</NavLink>
          </div>
          {/* tablet / desktop */}
          <div className="hidden md:flex" style={{ width:'100%', justifyContent:'space-between', alignItems:'center', padding:'22px 48px' }}>
            <div style={{ display:'flex', gap:36 }}>
              <NavLink>Worlds</NavLink>
              <NavLink>Mirror</NavLink>
              <NavLink>Capture</NavLink>
            </div>
            <StarLogo />
            <div style={{ display:'flex', gap:36 }}>
              <NavLink>Gallery</NavLink>
              <NavLink>Story</NavLink>
              <NavLink>Connect</NavLink>
            </div>
          </div>
        </nav>

      </div>
    </div>
  )
}
```

**Implementation checklist before pasting into a tool:**

1. Replace every `/* exactly as Layer 6 */` with the body from Layer 6 — do not change any number / inline style.
2. Fill the **z 20 / z 46 / z 50** placeholders with Layer 7's mobile, tablet, desktop blocks. Apply `fade('0.3s' | '0.55s' | '0.8s' | '0.9s')` per the Layer 8 timing table.
3. If you go with Vite static imports (alternate to the CDN URLs above), replace each `const X = 'https://...'` line with `import X from '../Image/<Name>'`.
4. `back01..back09` are user-provided. If absent, ship 9 same-aspect placeholder JPGs into `Image/` and add a one-line `// placeholder` comment on each import — never silently change the title strings.

---

## FILE LAYOUT

```
/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── postcss.config.js
├── tailwind.config.js
├── Image/
│   ├── WORLD BG.png
│   ├── PORTAL BG.png
│   ├── Curtain left.png
│   ├── Curtain right.png
│   ├── BOTTOM_CLOUDS.png
│   ├── Reel 01.png
│   ├── Reel 02.png
│   ├── Reel 03.png
│   ├── Back 01.jpg .. Back 09.jpg
│   └── Logo.png
└── src/
    ├── main.tsx
    ├── index.css
    ├── vite-env.d.ts
    └── App.tsx
```

### `index.html` (skeleton)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Nunito:wght@300..800&display=swap" rel="stylesheet" />
    <title>Step Into Wonder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `package.json` (essential bits)

```json
{
  "name": "step-into-wonder",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },
  "dependencies": {
    "lucide-react": "^0.456.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

### `tsconfig.node.json`
Must NOT set `noEmit: true` — composite referenced projects in TS require emit, otherwise `tsc` errors with `TS6310`.

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

### `postcss.config.js`

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1100px', '2xl': '1536px' },
  },
  plugins: [],
}
```

### `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
```

### `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

---

## BUILD / RUN

```bash
npm install
npm run dev      # starts Vite on 5173 (auto-bumps if taken)
npm run build    # tsc + vite build, no errors expected
```

If port 5173 is occupied by another local Vite project, Vite auto-bumps to 5174 — open the URL Vite prints, not a hard-coded one.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

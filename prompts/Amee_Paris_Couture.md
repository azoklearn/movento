## Amée Paris Luxury Fashion Maison Prompt

## LAYER 1 — OPENING DECLARATION

Build a **single-page editorial landing** for **Amée Paris** — a women's fashion maison de couture. Reference layout: **NEONOVA** (huge hero wordmark + inline nav + scrolling marquee + drop showcase with 2 editorial photos).

Use the following **pinned** tech stack (do not substitute):

- **React 18 + TypeScript + Vite 6**
- **Tailwind CSS 3** with extended `colors` (cream/bone/ink) + `fontFamily` (Italiana/Michroma/Playfair Display/Inter)
- **lucide-react** — only: `Search`, `Heart`, `ShoppingBag`, `Diamond`, `ArrowUpRight`, `Instagram`
- **No animation library** — custom `FadeIn.tsx` (setTimeout-based) + `AnimatedHeading.tsx` (char-by-char stagger) handle all motion
- **4 Google Fonts** loaded via one `<link>` request

The aesthetic is **editorial Parisian** — cream `#F5F1EA` page background, near-black `#0E0E0E` ink for text, no chromatic accent. The signature visual is the huge **AMÉE PARIS** wordmark in Italiana, set across the bottom of the hero with each character distributed edge-to-edge via `flex justify-between` (so it stretches the full viewport width regardless of letter count).

**Do not use:** any chromatic accent (no gold, no rose, no green), gradients on backgrounds, framer-motion, the original Footer component (it exists in the repo but is intentionally NOT mounted), liquid-glass utility, emoji, drop shadows, eyebrow rows on DropShowcase (those were intentionally stripped during iteration).

---

## LAYER 2 — FONTS

In `index.html` head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=Italiana&family=Michroma&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
```

Tailwind config:

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],         // body, nav, marquee
  display: ['"Playfair Display"', 'Georgia', 'serif'], // decorative serif fallback (Marquee italic, eyebrows)
  italiana: ['Italiana', 'serif'],                     // huge wordmark + logo word
  michroma: ['Michroma', 'sans-serif'],                // "PARIS" caption + caps accent
},
```

---

## LAYER 3 — DESIGN TOKENS

```js
// tailwind.config.js — theme.extend
colors: {
  cream: '#F5F1EA',  // body bg, light sections
  bone:  '#EAE4D9',  // image fallback before load
  ink:   '#0E0E0E',  // primary text, dark sections
},
```

CSS utilities in `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Frosted glass — light variant */
  .liquid-glass {
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    border: 1px solid transparent;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
  }
  .liquid-glass::before {
    content: '';
    position: absolute; inset: 0; border-radius: inherit; padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none;
  }

  /* Frosted glass — dark variant */
  .liquid-glass-dark {
    background: rgba(0,0,0,0.32);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  /* Huge brand wordmark style */
  .brand-wordmark {
    font-family: 'Italiana', serif;
    letter-spacing: -0.04em;
    line-height: 0.82;
    text-shadow: 0 4px 32px rgba(0,0,0,0.15);
  }

  /* Marquee */
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .marquee-track { animation: marquee 38s linear infinite; }

  /* Grain overlay */
  .grain {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100' height='100' filter='url(%23n)' opacity='0.5'/></svg>");
    opacity: 0.06;
    mix-blend-mode: overlay;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

---

## LAYER 4 — ANIMATION

Two custom React components carry all motion (NO library):

### `FadeIn.tsx`

```tsx
import { useEffect, useState, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;        // ms
  duration?: number;     // ms
  y?: number;            // initial translateY in px
  className?: string;
  style?: CSSProperties;
}

export default function FadeIn({ children, delay = 0, duration = 900, y = 12, className, style }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(.22,1,.36,1), transform ${duration}ms cubic-bezier(.22,1,.36,1)`,
      }}
    >
      {children}
    </div>
  );
}
```

### `AnimatedHeading.tsx`

```tsx
import { useEffect, useState } from 'react';

interface Props {
  text: string;
  initialDelay?: number;  // ms
  charDelay?: number;     // ms per char
  charDuration?: number;  // ms
  className?: string;
  as?: 'h1' | 'h2' | 'span';
  justify?: boolean;      // distribute chars edge-to-edge via flex justify-between
}

export default function AnimatedHeading({
  text, initialDelay = 0, charDelay = 50, charDuration = 800, className, as: Tag = 'h1', justify = false,
}: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);

  const lines = text.split('\n');
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span
          key={li}
          className={justify ? 'flex justify-between w-full' : 'inline-block'}
        >
          {[...line].map((ch, ci) => (
            <span
              key={ci}
              className="inline-block"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateX(0)' : 'translateX(-12px)',
                transition: `opacity ${charDuration}ms cubic-bezier(.22,1,.36,1) ${ci * charDelay}ms, transform ${charDuration}ms cubic-bezier(.22,1,.36,1) ${ci * charDelay}ms`,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
```

### Animation timing table

| Element | Component | Settings |
|---|---|---|
| Navbar content | `FadeIn` | delay 120, duration 900, y −8 |
| Hero wordmark "AMÉE PARIS" | `AnimatedHeading justify={true}` | initialDelay 250, charDelay 65, charDuration 900 |
| La Maison block | `FadeIn` | delay 1100, duration 1100, y 18 |
| DropShowcase left image | `FadeIn` | delay 200, duration 1100, y 28 |
| DropShowcase right image | `FadeIn` | delay 360, duration 1100, y 28 |
| DropShowcase text | `FadeIn` | delay 520, duration 1100, y 20 |
| Marquee | CSS `marquee-track` 38s linear infinite |
| Image hover scale | CSS `transition transform duration-[1200ms] ease-out`, `group-hover:scale-[1.04]` |

---

## LAYER 5 — BACKGROUND ASSETS

**Hero video served from CDN:**

```ts
const HERO_VIDEO = "https://cdn.5sdesign.art/projects/Amee/amee-hero.mp4";
```

**Images — buyer supplies (or generate via Midjourney / DALL·E / Recraft / Pencil).** Save under `public/image/` with these exact filenames so the prompt code works as-written:

```
public/image/
├── background-section-2.png   ← DropShowcase section background
├── look-01.png                ← First editorial photo (DropShowcase left)
└── look-02.png                ← Second editorial photo (DropShowcase right)
```

| File | Suggested gen prompt | Specs |
|---|---|---|
| `background-section-2.png` | `cream-colored Parisian boutique interior, soft natural light, marble floor, minimal furniture, editorial fashion magazine aesthetic, no models, no products` | 2560×1440 landscape, JPG/PNG, soft/desaturated (this image sits BEHIND the images without an overlay — must be quiet) |
| `look-01.png` | `editorial fashion photo of a woman in a couture dress, beige/cream palette, Parisian apartment background, full-body shot, magazine cover quality, natural lighting, Italian Vogue aesthetic` | 1600×2000 portrait (4:5), JPG/PNG |
| `look-02.png` | `same model, different couture look, side profile, walking, Parisian street background, golden hour light, AnOther Magazine editorial aesthetic` | 1600×2000 portrait (4:5), JPG/PNG |

Constants in code reference local paths:

```ts
const BACKGROUND_SECTION = "/image/background-section-2.png";
const LOOK_01            = "/image/look-01.png";
const LOOK_02            = "/image/look-02.png";
```

**Hero video usage:**

```jsx
<video
  src={HERO_VIDEO}
  autoPlay loop muted playsInline
  className="absolute inset-0 w-full h-full object-cover"
/>
```

**3 overlay layers** on top of the hero video (in this order):

```jsx
{/* Top scrim — protects nav */}
<div
  className="absolute inset-x-0 top-0 h-[28vh] pointer-events-none"
  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
/>

{/* Bottom scrim — protects La Maison block */}
<div
  className="absolute inset-x-0 bottom-0 h-[55vh] pointer-events-none"
  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
/>

{/* Radial vignette */}
<div
  className="absolute inset-0 pointer-events-none"
  style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)' }}
/>
```

**Background section image** (DropShowcase) used as `background-image` on the section, full bleed cover.

---

## LAYER 6 — SHARED COMPONENTS

The 4 sections + 2 shared utilities. Also includes a `Footer.tsx` component file that is intentionally **NOT** rendered.

`src/components/`:
- `FadeIn.tsx` (Layer 4)
- `AnimatedHeading.tsx` (Layer 4)
- `Navbar.tsx` (Section 1)
- `Hero.tsx` (Section 2)
- `Marquee.tsx` (Section 3)
- `DropShowcase.tsx` (Section 4)
- `Footer.tsx` — exists but unused (do NOT import in `App.tsx`)

---

## LAYER 7 — SECTION-BY-SECTION SPEC

`App.tsx`:

```tsx
function App() {
  return (
    <main id="top" className="bg-cream text-ink">
      <div className="relative">
        <Navbar />
        <Hero />
      </div>
      <Marquee />
      <DropShowcase />
    </main>
  );
}
```

**Critical:** `<Navbar />` is rendered **outside** any `FadeIn` wrapper but uses `<FadeIn>` *inside* for its content. This avoids the `FadeIn` wrapper creating its own stacking context, which previously hid the nav behind the hero video.

### 7.1 Navbar

```jsx
<nav className="absolute top-0 left-0 right-0 z-50 px-8 md:px-12 lg:px-16 pt-7">
  <FadeIn delay={120} duration={900} y={-8} className="flex items-center justify-between">
    {/* Left: 3 nav links */}
    <div className="hidden md:flex items-center gap-8 text-sm text-white/90 lowercase tracking-wide">
      <a href="#new" className="hover:text-white transition-colors">new drop</a>
      <a href="#" className="hover:text-white transition-colors">our club</a>
      <a href="#contact" className="hover:text-white transition-colors">contacts</a>
    </div>

    {/* Center brand: "Amée" Italiana + "Paris" Michroma caption */}
    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
      <span className="font-italiana text-2xl text-white tracking-[0.06em]">Amée</span>
      <span className="font-michroma text-[10px] text-white/80 tracking-[0.32em] uppercase mt-0.5">Paris</span>
    </div>

    {/* Right: 3 icons */}
    <div className="flex items-center gap-5 text-white">
      <button aria-label="Search"><Search strokeWidth={1.3} className="w-5 h-5" /></button>
      <button aria-label="Wishlist"><Heart strokeWidth={1.3} className="w-5 h-5" /></button>
      <button aria-label="Cart"><ShoppingBag strokeWidth={1.3} className="w-5 h-5" /></button>
    </div>

    {/* Mobile hamburger (md:hidden) */}
    <button className="md:hidden w-9 h-9 rounded-full border border-white/30 flex items-center justify-center" aria-label="Menu">
      <span className="block w-4 h-px bg-white" />
    </button>
  </FadeIn>
</nav>
```

### 7.2 Hero

```jsx
<section className="relative h-[100svh] min-h-[680px] bg-ink overflow-hidden">
  {/* Background video (Layer 5) */}
  <video src={HERO_VIDEO} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />

  {/* 3 overlay layers (Layer 5) */}
  {/* Top scrim, bottom scrim, radial vignette */}

  {/* Huge wordmark — top of viewport */}
  <div className="absolute top-24 md:top-32 inset-x-0 px-6 md:px-10 lg:px-14 flex justify-center w-full">
    <div className="w-full">
      <AnimatedHeading
        as="h1"
        text="AMÉE PARIS"
        initialDelay={250}
        charDelay={65}
        charDuration={900}
        justify={true}
        className="brand-wordmark text-white font-italiana"
      />
    </div>
  </div>
  {/* Apply size to AnimatedHeading via wrapper inline style: */}
  <style>{`
    .brand-wordmark { font-size: clamp(4.5rem, 17.5vw, 20rem); }
  `}</style>

  {/* La Maison block — bottom-left */}
  <FadeIn delay={1100} duration={1100} y={18} className="absolute bottom-12 md:bottom-16 left-0 right-0 px-8 md:px-12 lg:px-16">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end">
      <div>
        <p className="font-display italic text-[13px] tracking-[0.4em] uppercase text-white/80">La Maison</p>
        <p className="mt-5 max-w-md text-[14.5px] font-light text-white/85 leading-[1.7]">
          Amée Paris is a maison de couture for women who treat their wardrobe as an archive — refined silhouettes, slow ateliers, and pieces that outlast the season they were made in.
        </p>
        <a
          href="#shop"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/70 text-white text-sm font-medium px-5 py-2.5 hover:bg-white hover:text-ink transition-colors"
        >
          Shop Now
        </a>
      </div>
      {/* Right column intentionally empty on desktop */}
    </div>
  </FadeIn>
</section>
```

### 7.3 Marquee

```jsx
<section className="bg-white text-ink py-8 md:py-10 overflow-hidden">
  <div className="marquee-track flex items-center gap-12 whitespace-nowrap">
    {/* Duplicate the list 2× for seamless loop */}
    {[...Array(2)].map((_, dup) => (
      <Fragment key={dup}>
        {['savoir-faire', 'maison', 'atelier', 'couture', 'soie', 'timeless', 'handcrafted', 'paris', 'origin', 'object of desire'].map((word) => (
          <span key={word + dup} className="flex items-center gap-12">
            <span className="font-sans italic font-bold uppercase text-2xl md:text-3xl tracking-[0.02em]">{word}</span>
            <Diamond strokeWidth={1.4} className="w-5 h-5 opacity-70" />
          </span>
        ))}
      </Fragment>
    ))}
  </div>
</section>
```

### 7.4 DropShowcase

```jsx
<section
  id="new"
  className="bg-cream py-24 md:py-32 px-6 md:px-10 lg:px-14 relative"
  style={{
    backgroundImage: `url(${BACKGROUND_SECTION}?v=2)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 md:gap-10">
    {/* Left image — col-span-5 */}
    <FadeIn delay={200} duration={1100} y={28} className="col-span-12 md:col-span-5 group">
      <div className="aspect-[4/5] overflow-hidden bg-bone">
        <img src={LOOK_01} alt="Amée Paris look 01" className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
      </div>
    </FadeIn>

    {/* Right image — col-span-5 with negative margin offset */}
    <FadeIn delay={360} duration={1100} y={28} className="col-span-12 md:col-span-5 md:-mt-16 group">
      <div className="aspect-[4/5] overflow-hidden bg-bone">
        <img src={LOOK_02} alt="Amée Paris look 02" className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
      </div>
    </FadeIn>

    {/* Text column — col-span-2 with 2 editorial paragraphs */}
    <FadeIn delay={520} duration={1100} y={20} className="col-span-12 md:col-span-2 space-y-6 mt-8 md:mt-16">
      <p className="text-[13.5px] font-light leading-[1.8] text-ink">
        Each look is built in the Paris atelier from a single bolt of fabric — chosen for the way it remembers the body, not the season.
      </p>
      <p className="text-[13.5px] font-light leading-[1.8] text-ink">
        The new drop arrives quietly. Twelve pieces, each cut by hand, photographed on the women who will wear them.
      </p>
    </FadeIn>
  </div>
</section>
```

**Iteration note (what was REMOVED from earlier drafts — do not reintroduce):**
- Eyebrow row "Édition No.008 / spring summer 2026" — stripped.
- 2 figcaption "Look 01" / "Look 02" — stripped.
- Glass card "Édition N°08: Noir Éternel" overlay — stripped.
- Round → Discover button — stripped.
- "Discover the Édition →" link — stripped.

The DropShowcase as specified above is **final**. Do not add any of the above back.

---

## LAYER 8 — RESPONSIVE BREAKPOINTS

| BP | Hero | Marquee | DropShowcase |
|---|---|---|---|
| **<768** | Wordmark `clamp(4.5rem, 17.5vw, ...)` (smaller end), nav center brand + hamburger only | Same speed | Images stack vertically, text below |
| **768–1023** | Full nav links + icons visible, wordmark `clamp(..., 17.5vw, ...)` (mid range) | Same | 2-col image grid (5+5+text-2) |
| **≥1024** | Wordmark up to `20rem`, padding `lg:px-14` | Same | Full grid with right image `-mt-16` offset |

---

## LAYER 9 — CONTENT STRINGS (verbatim)

| Location | String |
|---|---|
| Nav left links | `new drop`, `our club`, `contacts` (lowercase, intentional) |
| Brand center | `Amée` (Italiana) + `Paris` (Michroma, uppercase) |
| Hero wordmark | `AMÉE PARIS` (single line, edge-to-edge justify) |
| La Maison eyebrow | `La Maison` (Playfair italic, tracking 0.4em) |
| La Maison body | `Amée Paris is a maison de couture for women who treat their wardrobe as an archive — refined silhouettes, slow ateliers, and pieces that outlast the season they were made in.` |
| Hero CTA | `Shop Now` (outline pill) |
| Marquee words (10, looped 2×) | `savoir-faire`, `maison`, `atelier`, `couture`, `soie`, `timeless`, `handcrafted`, `paris`, `origin`, `object of desire` |
| DropShowcase text 1 | `Each look is built in the Paris atelier from a single bolt of fabric — chosen for the way it remembers the body, not the season.` |
| DropShowcase text 2 | `The new drop arrives quietly. Twelve pieces, each cut by hand, photographed on the women who will wear them.` |

Page `<title>`: `Amée Paris — Maison de couture`.

---

## LAYER 10 — FILE TREE

```
src/
├── main.tsx
├── App.tsx                    (4 sections only — NO Footer)
├── index.css                  (Tailwind + .liquid-glass, .liquid-glass-dark, .brand-wordmark, .marquee-track, .grain + reduced-motion)
└── components/
    ├── FadeIn.tsx
    ├── AnimatedHeading.tsx
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── Marquee.tsx
    ├── DropShowcase.tsx
    └── Footer.tsx             (EXISTS but NOT imported in App.tsx)

index.html                     (4 Google Fonts in one link + title)
package.json
vite.config.ts                 (port 5173)
tailwind.config.js             (extend colors + fontFamily)
```

---

## LAYER 11 — DELIVERY CHECKLIST

- [ ] `npm create vite@latest . --template react-ts`.
- [ ] `npm i tailwindcss@3 postcss autoprefixer lucide-react`.
- [ ] `tailwind.config.js` extends `colors.cream/bone/ink` + `fontFamily.sans/display/italiana/michroma`.
- [ ] `index.html` loads Inter + Italiana + Michroma + Playfair Display in one `<link>` request.
- [ ] `src/index.css` has Tailwind directives + 5 utility classes (`.liquid-glass`, `.liquid-glass-dark`, `.brand-wordmark`, `.marquee-track`, `.grain`) + reduced-motion override.
- [ ] `FadeIn.tsx` uses `useEffect` + `setTimeout` (no IntersectionObserver — mount-time fire).
- [ ] `AnimatedHeading.tsx` supports `justify={true}` mode where chars distribute via `flex justify-between w-full`.
- [ ] `App.tsx` renders ONLY: Navbar + Hero + Marquee + DropShowcase. No Footer, no other section.
- [ ] `Navbar` is `<nav absolute top-0 z-50>` with `FadeIn` INSIDE it (not wrapping it) — otherwise stacking context bug returns.
- [ ] Hero wordmark uses `AnimatedHeading justify={true}` with `initialDelay=250, charDelay=65, charDuration=900`.
- [ ] Hero wordmark size = `clamp(4.5rem, 17.5vw, 20rem)`.
- [ ] Hero video URL = `https://cdn.5sdesign.art/projects/Amee/amee-hero.mp4` with 3 overlay layers (top scrim 28vh, bottom scrim 55vh, radial vignette).
- [ ] Marquee uses `.marquee-track` (`animation: marquee 38s linear infinite`), text Inter Italic Bold uppercase, Diamond icons between words.
- [ ] DropShowcase background uses `?v=2` cache buster on the background image URL.
- [ ] DropShowcase right image has `md:-mt-16` offset (visually staggered from left).
- [ ] Image hover scale `1.04` over `1200ms ease-out`.
- [ ] No footer, no eyebrow row in DropShowcase, no figcaptions, no glass card, no Discover button.
- [ ] `prefers-reduced-motion: reduce` disables all transitions and `.marquee-track` animation.

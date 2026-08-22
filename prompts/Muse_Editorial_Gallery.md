# Muse — Editorial Art Gallery

## LAYER 1 — OPENING DECLARATION

Build a **multi-section editorial landing page** for **Muse** — a contemporary art exhibition studio with the tagline *"Look slowly. Look again."* Three locations (London · Kyoto · Mexico City).

Reference points: **Gagosian, David Zwirner, Hauser & Wirth, AnOther Magazine, Apartamento, The Gentlewoman**. Hero layout inspired by **Prisma**.

Use the following **pinned** tech stack (do not substitute):

- **React 18 + TypeScript (strict) + Vite 5**
- **Tailwind CSS 3** with extended `theme.extend.colors` + `fontFamily` + `letterSpacing`
- **framer-motion** for in-view animations
- **lucide-react** — only: `ArrowRight`, `ArrowUpRight`
- **@studio-freight/lenis** for inertial smooth scroll
- **No** other animation library. **No** UI kit (no shadcn, no Radix).

The aesthetic is **museum archive meets print magazine** — warm off-white (`#F4EFE6`), single chromatic accent in deep oxblood (`#6B2B1F`) used as punctuation, never as brand color. Fraunces serif display + Inter body + Instrument Serif italic flourish. Grain noise overlay at 6% opacity over imagery. Custom magnetic cursor (8px oxblood dot following mouse with spring physics).

**Do not use:** any other accent color than oxblood, gradients (except the hero vignette), framer-motion `<motion>` for everything (use only for in-view triggers), emoji, drop shadows on cards, neon, dark mode toggle (Archive section IS the only dark section — by design).

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400..500&family=Inter:wght@300;400;500&family=Instrument+Serif:ital@1&display=swap"
  rel="stylesheet"
/>
```

Tailwind config:

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Fraunces', 'Georgia', 'serif'],
  italic: ['"Instrument Serif"', 'serif'],
},
```

Activate Fraunces stylistic sets in CSS:

```css
.font-display {
  font-family: 'Fraunces', Georgia, serif;
  font-feature-settings: 'ss01', 'ss02';
  font-optical-sizing: auto;
}
.font-italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
}
```

---

## LAYER 3 — DESIGN TOKENS

```yaml
colors (Tailwind theme.extend.colors):
  bone:      '#F4EFE6'   # global background (warm off-white)
  paper:     '#FAF7F1'   # accent / Schedule section bg
  ink:       '#161413'   # primary text + Archive bg
  oxblood:   '#6B2B1F'   # THE accent — eyebrows, marker dots, hover fills
  ash:       '#8A8780'   # muted text — captions, metadata, dates
  border:    '#16141319' # 10% ink hairline

letterSpacing (Tailwind theme.extend.letterSpacing):
  micro:  '0.2em'   # UI text
  meta:   '0.3em'   # eyebrows + section labels

aspect-ratios (custom utilities):
  portrait:   3 / 4
  landscape:  4 / 3
  painting:   5 / 7   # signature crop for artworks

custom utilities:
  .grain          — SVG fractal noise, opacity 0.06, mix-blend-multiply
  .marquee-mask   — gradient mask for marquee edges
  .text-balance   — text-wrap: balance
  .dropcap        — first-letter: 4.5em oxblood Fraunces float
  .sepia-tint     — filter: sepia(0.15) saturate(0.92) contrast(1.02)
  .vertical-rl    — writing-mode: vertical-rl
```

Add globally:

```css
html { position: relative; }   /* fix framer-motion useScroll warning */
body { background: #F4EFE6; color: #161413; }
@media (min-width: 768px) { body { cursor: none; } }  /* magnetic cursor takes over */
```

---

## LAYER 4 — ANIMATION

```ts
const EASE_OUT = [0.22, 1, 0.36, 1];

// Words pull-up (WordsPullUp)
// Split text into words → wrap each in overflow-hidden span → animate motion.span from y: 100% → 0%
// Stagger 0.08s, duration 0.9s, ease EASE_OUT
// Trigger via useInView({ once: true, margin: '-10% 0px' })

// Card fade-up (NowShowing, Archive)
const cardItem = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay: i * 0.08, ease: EASE_OUT },
});

// Schedule row hover — full-row oxblood fill scaleX 0 → 1
// On hover: bg-oxblood slides from left, text turns bone, arrow translates 8px right
// Duration 0.6s, ease EASE_OUT

// MUSE wordmark fade-up (Footer)
// Each letter M-U-S-E staggered 0.15s, y: 60 → 0, useInView trigger
```

**Smooth scroll (Lenis):**

```ts
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return () => lenis.destroy();
}, []);
```

Skip if `prefers-reduced-motion: reduce`.

---

## LAYER 5 — BACKGROUND ASSETS

**Hero video** (the only motion video in the site):

```jsx
const HERO_VIDEO = "https://cdn.5sdesign.art/projects/Muse/muse-hero.mp4";

<video
  src={HERO_VIDEO}
  autoPlay loop muted playsInline
  className="absolute inset-0 w-full h-full object-cover"
/>
```

Overlay on top of video:

```jsx
{/* Vignette for legibility */}
<div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/65 pointer-events-none" />

{/* Grain overlay */}
<div className="absolute inset-0 grain pointer-events-none" aria-hidden="true" />
```

**Photo assets — buyer supplies these.** Save to `public/photos/`:

```
public/photos/
├── curator.jpg          (portrait, 3:4, 1200×1600)
├── art-01.jpg … 06.jpg  (NowShowing — aspect-[5/7] painting crop)
├── art-07.jpg … 18.jpg  (Archive — mixed aspect: portrait/landscape/painting/square for masonry)
└── visit-london.png     (Footer visit card image, landscape)
```

Photo treatment in code:

```jsx
// Sepia-tint + grain on every art image
<figure className="relative overflow-hidden aspect-painting sepia-tint">
  <img src={src} alt={alt} className="w-full h-full object-cover" />
  <div className="absolute inset-0 grain pointer-events-none" />
</figure>
```

---

## LAYER 6 — SHARED COMPONENTS

### MagneticCursor.tsx — custom cursor

```tsx
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e: MouseEvent) => { x.set(e.clientX - 4); y.set(e.clientY - 4); };
    const enter = () => ref.current?.classList.add('scale-[3]', 'opacity-30');
    const leave = () => ref.current?.classList.remove('scale-[3]', 'opacity-30');
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button, input, [data-cursor="hover"]').forEach((el) => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className="hidden md:block fixed top-0 left-0 z-[100] w-2 h-2 rounded-full bg-oxblood pointer-events-none transition-transform duration-200"
    />
  );
}
```

### ScrollProgress.tsx — 1px bar fixed top

```tsx
import { motion, useScroll } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-px bg-oxblood origin-left z-50"
    />
  );
}
```

### WordsPullUp.tsx — staggered word reveal

Splits text into words, each wrapped in `overflow-hidden` span, animates `y: 100% → 0%`. Use for hero wordmark, section titles, pull quotes.

### Eyebrow pattern (used across all sections)

```jsx
<div className="flex items-center gap-3 text-xs tracking-meta uppercase text-oxblood">
  <span className="w-8 h-px bg-oxblood" />
  <span>01 / NOW SHOWING</span>
</div>
```

---

## LAYER 7 — SECTION-BY-SECTION SPEC

Render order in `App.tsx`:

```
Hero → NowShowing → Archive → Curator → Schedule → Footer
```

App.tsx wrapper:

```jsx
<>
  <ScrollProgress />
  <MagneticCursor />
  <Navbar />
  <main className="min-h-screen bg-bone text-ink">
    {/* sections */}
  </main>
</>
```

### Navbar.tsx (fixed top)

`fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-5 flex items-center justify-between transition-colors`.

- **Transparent over hero**, switches to `bg-bone/85 backdrop-blur-sm border-b border-border` after scrolling past hero (scroll > viewport height).
- Left: brand `<a className="text-xl font-display tracking-[-0.02em]">Muse</a>`
- Center (desktop): links `Now Showing · Archive · Curator · Schedule · Visit` — text-sm font-medium, hover oxblood
- Right: `Subscribe` button — pill with oxblood border, hover fills oxblood

### SECTION 1 — Hero

Wrapper: `relative w-full h-screen overflow-hidden flex flex-col`.

**Layered children:**

1. `<video src={HERO_VIDEO}>` — absolute fill.
2. Gradient vignette overlay (Layer 5).
3. Grain overlay.
4. **Top metadata strip** — `absolute top-24 left-0 right-0 px-6 md:px-10 flex items-start justify-between text-bone`:
   - Left: `<span className="text-xs tracking-meta uppercase">EST. 2014 — LONDON · KYOTO · MEXICO CITY</span>`
   - Right (desktop only): real-time clock for 3 cities, formatted via `Intl.DateTimeFormat`, updates every 30s.
     ```tsx
     // Render:
     // 14:32 LON  ·  22:32 KYO  ·  08:32 MEX
     ```
5. **Right-side editorial overlay** — `absolute bottom-32 right-6 md:right-10 max-w-md text-bone z-10`:
   - Eyebrow `text-xs tracking-meta uppercase text-bone/70`: `EXHIBITION 01`
   - Tagline `mt-3 text-base md:text-lg leading-[1.4]`: `Muse curates contemporary art across three cities. Painting, sculpture, photography, installation — held to a museum standard, paced like a book.`
   - **Button** `mt-6 inline-flex items-center gap-3 bg-bone/10 backdrop-blur-md border border-bone/30 rounded-full px-2 py-2 pr-5 group hover:bg-bone/15 transition-colors`:
     - Inner circle `w-9 h-9 rounded-full bg-ink flex items-center justify-center`: `<ArrowRight className="w-4 h-4 text-bone" />`
     - Label `text-sm font-medium`: `Book a viewing`
6. **Massive wordmark "Muse"** — `absolute bottom-0 left-0 right-0 px-6 md:px-10 pointer-events-none`:
   ```jsx
   <h1 className="font-display font-light text-bone text-[33vw] md:text-[26vw] lg:text-[24vw] tracking-[-0.045em] leading-[0.9]">
     <WordsPullUp text="Muse" />
   </h1>
   ```
7. **Scroll cue** — `absolute bottom-10 left-6 md:left-10 vertical-rl text-bone/80 text-xs tracking-meta uppercase flex items-center gap-3`:
   - `SCROLL`
   - Vertical animated line (1px wide, 60px tall, gradient `from-bone/0 via-bone/80 to-bone/0`, loops `translateY` infinite over 2.4s)

### SECTION 2 — NowShowing

Wrapper: `py-24 md:py-40 px-6 md:px-10 max-w-[1280px] mx-auto`.

**Header** (`mb-12 md:mb-20`):
- Eyebrow: `01 / NOW SHOWING` (oxblood).
- `<h2 className="font-display font-light text-4xl md:text-6xl tracking-[-0.03em] leading-[1.05] mt-6 text-balance">Quiet Light <span className="font-italic">— six painters on what slow looking can hold</span></h2>`
- Date `mt-6 text-sm tracking-meta uppercase text-ash`: `MAR 4 — JUN 12, 2026 · LONDON`

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10`.

Each artwork (6 total) renders as `<figure>`:

```jsx
<motion.figure {...cardItem(i)} className="group">
  <div className="relative overflow-hidden aspect-painting sepia-tint">
    <img src={art.image} alt={`${art.artist}, ${art.title}, ${art.year}`}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
    <div className="absolute inset-0 grain pointer-events-none" />
  </div>
  <figcaption className="mt-5 space-y-1">
    <div className="text-xs tracking-meta uppercase text-ash">{art.year}</div>
    <div className="font-display text-lg leading-tight">
      <span className="font-medium">{art.artist}</span>{' — '}
      <span className="font-italic text-ink/80">{art.title}</span>
    </div>
    <div className="text-xs text-ash">{art.medium}</div>
  </figcaption>
</motion.figure>
```

**6 artworks** (verbatim in `data/artworks.ts`):

1. Aiko Tanaka — *Morning, Slowly* — Oil on linen, 2024
2. Mathilde Roux — *The Hour Before* — Egg tempera on panel, 2023
3. Diego Ferraz — *Untitled (Window)* — Pigment on paper, 2024
4. Hana Park — *Quiet Field VII* — Oil and wax on canvas, 2024
5. Olu Adeyemi — *Long Vowel* — Oil on linen, 2025
6. Yael Stern — *Late Light, Kyoto* — Oil on board, 2024

CTA below grid (`mt-16 flex justify-end`): `<a className="inline-flex items-center gap-2 text-sm tracking-meta uppercase text-oxblood group">View all 38 works <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></a>`.

### SECTION 3 — Archive (inverted dark)

Wrapper: `bg-ink text-bone py-24 md:py-40 px-6 md:px-10`.

**Header** (`max-w-[1280px] mx-auto mb-12 md:mb-16`):
- Eyebrow: `02 / ARCHIVE — A LIVING RECORD` — **color bone** (NOT oxblood here, by design).
- Title: `<h2 className="font-display font-light text-4xl md:text-6xl tracking-[-0.03em] leading-[1.05] mt-6">Forty-seven exhibitions, <span className="font-italic">fourteen years.</span></h2>`
- Body `mt-6 text-bone/70 max-w-md leading-[1.6]`: `Every Muse show stays in the archive — same care, same crops, same captions as the night it opened. Look back as slowly as you looked forward.`

**Filter pills** (`mt-10 flex flex-wrap gap-2`):
- `All`, `Painting`, `Sculpture`, `Photography`, `Installation`, `Video`, `On Paper`
- Each pill: `px-4 py-2 rounded-full border border-bone/20 text-xs tracking-meta uppercase text-bone/70 hover:bg-bone hover:text-ink transition-colors`
- Active pill: `bg-bone text-ink`
- State via `useState<string>('All')` + `useMemo` filter

**Masonry grid** (`mt-12 max-w-[1440px] mx-auto columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6`):

Each archive item:

```jsx
<figure className="break-inside-avoid mb-4 md:mb-6 group relative overflow-hidden">
  <img src={item.image} alt={item.title}
    className="w-full h-auto sepia-tint transition-transform duration-700 group-hover:scale-[1.04]" />
  <div className="absolute inset-0 grain pointer-events-none" />
  {/* Metadata reveal on hover */}
  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/95 to-transparent text-bone translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
    <div className="text-xs tracking-meta uppercase text-bone/70">{item.year} · {item.category}</div>
    <div className="font-display mt-1">{item.title}</div>
  </div>
</figure>
```

**12 archive items** with mixed aspect ratios for organic masonry (in `data/archive.ts`):

1. *Architectures of Memory* — 2023 — Installation
2. *Slow Burn* — 2023 — Painting
3. *The Glass Hour* — 2022 — Sculpture
4. *Notations* — 2022 — On Paper
5. *Salt Light* — 2021 — Photography
6. *Quiet Field IV* — 2021 — Painting
7. *A Soft Address* — 2020 — Video
8. *Tessera* — 2020 — Sculpture
9. *Long Vowel (Drafts)* — 2019 — On Paper
10. *Edges (Kyoto)* — 2019 — Photography
11. *Hands, Repeating* — 2018 — Installation
12. *Morning Light, Earlier* — 2017 — Painting

### SECTION 4 — The Curator

Wrapper: `py-24 md:py-40 px-6 md:px-10 max-w-[1280px] mx-auto`.

**12-col grid** (`grid grid-cols-12 gap-6 md:gap-10`):

- **Portrait** (`col-span-12 md:col-span-4 md:col-start-2`):
  ```jsx
  <figure>
    <div className="relative overflow-hidden aspect-[3/4] sepia-tint grayscale-[0.3]">
      <img src="/photos/curator.jpg" alt="Elena Marchetti, Founding Curator"
        className="w-full h-full object-cover" />
      <div className="absolute inset-0 grain pointer-events-none" />
    </div>
    <figcaption className="mt-4 font-italic text-sm text-ash">
      Elena Marchetti — Founding Curator, photographed in the Kyoto gallery, 2025
    </figcaption>
  </figure>
  ```

- **Text column** (`col-span-12 md:col-span-6 md:col-start-6`):
  - Eyebrow `text-xs tracking-meta uppercase text-oxblood`: `03 / THE CURATOR`
  - Pull quote `mt-8 font-display font-light text-3xl md:text-4xl tracking-[-0.02em] leading-[1.15] text-balance` (use `WordsPullUp`):
    > A gallery is a place where you give yourself permission to <span class="font-italic">stay.</span>
  - Body `mt-10 text-base leading-[1.7] text-ink/85 dropcap`:
    > Elena founded Muse in 2014 with a simple promise: every work shown would be one she had spent at least an hour with first. Fourteen years later, the rule has not loosened. She trained at the Slade, sat in for Hauser & Wirth, then walked away to do this — slower, smaller, and more carefully than any institution would let her.
  - **Signature** (`mt-10 inline-block`):
    ```jsx
    <svg viewBox="0 0 240 80" className="w-32 h-auto text-oxblood">
      <!-- inline handwritten "Elena M." SVG path, stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" -->
    </svg>
    ```
  - Credentials list `mt-8 space-y-1 text-xs tracking-meta uppercase text-ash`:
    - `SLADE SCHOOL OF FINE ART · LONDON`
    - `FORMER ASSOCIATE CURATOR · HAUSER & WIRTH`
    - `MEMBER · INTERNATIONAL ASSOCIATION OF ART CRITICS`

### SECTION 5 — Schedule

Wrapper: `bg-paper py-24 md:py-40 px-6 md:px-10`.

**Header** (`max-w-[1280px] mx-auto`):
- Eyebrow `04 / WHAT'S NEXT` (oxblood).
- Title `mt-6 font-display font-light text-4xl md:text-6xl tracking-[-0.03em] leading-[1.05]`: `The year ahead, <span className="font-italic">briefly.</span>`

**4 rows** (`mt-16 max-w-[1280px] mx-auto`):

Each row: `relative group cursor-pointer border-t border-ink/10 py-8 md:py-10 grid grid-cols-12 gap-6 items-center transition-colors`.

Layered:
- Background slide overlay: `<span className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 bg-oxblood transition-transform duration-700 ease-out -z-0" />`
- Content z-10:
  1. **Date stamp** (`col-span-2 md:col-span-1`): `text-xs tracking-meta uppercase font-medium group-hover:text-bone`: `MAY` / `16` on two lines.
  2. **Title block** (`col-span-10 md:col-span-5`):
     - Title `font-display text-2xl md:text-3xl group-hover:text-bone`: e.g. `Architectures of Memory`
     - Italic subtitle `font-italic text-base text-ink/70 group-hover:text-bone/80`: e.g. *Eight artists on what a room remembers.*
  3. **Description** (`hidden md:block md:col-span-4`): `text-sm text-ink/70 group-hover:text-bone/80 leading-[1.5] max-w-md`: 2-line body.
  4. **City + arrow** (`col-span-12 md:col-span-2 flex items-center justify-end gap-2 text-xs tracking-meta uppercase group-hover:text-bone`):
     - City name (e.g. `LONDON`)
     - `<ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />`

**4 entries** (verbatim in `data/schedule.ts`):

1. **MAY 16** — *Architectures of Memory* — `Eight artists on what a room remembers.` — `Wartime drawings, lived ceilings, the soft weight of a domestic doorway.` — `LONDON`
2. **JUL 04** — *Slow Burn* — `Six painters working at the speed of attention.` — `Egg tempera, gesso panels, layered glaze — work made by repetition, not gesture.` — `MEXICO CITY`
3. **SEP 12** — *The Glass Hour* — `Sculpture and photography in the half-light.` — `Cast glass, slow exposures, and the bright minute before dusk leaves the studio.` — `KYOTO`
4. **NOV 22** — *Notations* — `Drawings from a fourteen-year archive.` — `Studies, marginalia, working notes — the private register beneath the finished work.` — `LONDON`

### SECTION 6 — Footer

Wrapper: `bg-bone pt-24 md:pt-32 px-6 md:px-10`.

**Tier 1 — Visit card** (`max-w-[1280px] mx-auto border border-ink/15 p-8 md:p-12 grid grid-cols-12 gap-6 md:gap-10 relative overflow-hidden`):

- **Left** (`col-span-12 md:col-span-6 z-10`):
  - Eyebrow `05 / VISIT` (oxblood).
  - `<address className="not-italic mt-6 font-display font-light text-3xl md:text-4xl tracking-[-0.02em] leading-[1.1]">
    14 Heddon Street<br/>London W1B 4DA
    </address>`
  - Hours `mt-6 text-sm text-ink/70 leading-[1.7]`:
    - `Tuesday — Saturday · 11 am – 6 pm`
    - `Sunday · By appointment`
    - `Closed Monday`
  - Pill button `mt-8 inline-flex items-center gap-3 bg-ink text-bone rounded-full pl-5 pr-2 py-2 group hover:bg-oxblood transition-colors`:
    - `<span className="text-sm font-medium">Plan your visit</span>`
    - `<span className="w-8 h-8 rounded-full bg-bone/15 flex items-center justify-center"><ArrowUpRight className="w-3.5 h-3.5 text-bone" /></span>`

- **Right image** (`col-span-12 md:col-span-6 md:col-start-7 md:-mt-12 md:-mb-12 md:-mr-12 relative`):
  ```jsx
  <div className="relative h-64 md:h-auto md:absolute md:inset-0">
    <img src="/photos/visit-london.png" alt="The London gallery"
      className="absolute inset-0 w-full h-full object-cover" />
    <div
      className="absolute inset-0 sepia-tint"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 35%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)' }}
    />
    <div className="absolute inset-0 grain pointer-events-none" />
  </div>
  ```

**Tier 2 — Newsletter** (`max-w-[1280px] mx-auto mt-24 md:mt-32 grid grid-cols-12 gap-6 md:gap-10`):
- Eyebrow `col-span-12 md:col-span-3`: `QUARTERLY DISPATCH`
- Right (`col-span-12 md:col-span-9`):
  - `<h3 className="font-display font-light text-3xl md:text-5xl tracking-[-0.03em] leading-[1.1]">A letter, four times a year. <span className="font-italic">No more, no less.</span></h3>`
  - Form `mt-10 flex items-end gap-4 max-w-md`:
    - `<input type="email" placeholder="Your email" className="flex-1 bg-transparent border-b border-ink/30 focus:border-oxblood outline-none py-3 text-base placeholder-ink/40 transition-colors" />`
    - `<button className="text-oxblood p-3 hover:translate-x-1 transition-transform"><ArrowRight className="w-5 h-5" /></button>`

**Tier 3 — Marquee** (`mt-24 md:mt-32 border-t border-ink/10 py-8 marquee-mask overflow-hidden`):
- `<MarqueeRow speed={40}>` with text:
  - `Look slowly · Look again · Look slowly · Look again · Look slowly · Look again`
- Style: `font-italic text-2xl md:text-4xl text-ink/40 whitespace-nowrap`

**Massive wordmark MUSE** (`max-w-full px-6 md:px-10 select-none pointer-events-none`):

```jsx
<div className="flex justify-between items-end leading-[0.85] -mb-[2vw]">
  {['M', 'U', 'S', 'E'].map((char, i) => (
    <motion.span
      key={char}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: i * 0.15, ease: EASE_OUT }}
      className="font-display font-light text-ink text-[28vw] tracking-[-0.045em]"
    >
      {char}
    </motion.span>
  ))}
</div>
```

**Bottom bar** (`border-t border-ink/10 mt-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs tracking-meta uppercase text-ash`):

- Left: `© MUSE · 2014–2026`
- Center: `INSTAGRAM · ARE.NA · SUBSTACK`
- Right: `Design by Hdezign`

---

## LAYER 8 — RESPONSIVE BREAKPOINTS

| Breakpoint | Hero | NowShowing | Archive | Curator | Schedule |
|---|---|---|---|---|---|
| **<640** | wordmark `text-[33vw]`, scroll cue hidden, clock hidden | 1 col | 2 cols (CSS columns) | stacked, portrait full-width | rows: date + title + city only (desc hidden) |
| **640–767** | — | 2 cols | 2 cols | stacked | same |
| **768–1023** | wordmark `text-[26vw]`, navbar full | 2 cols | 3 cols | stacked | full 4-zone row |
| **≥1024** | wordmark `text-[24vw]` | 3 cols | 4 cols | 12-col layout (4 + 6/start-6) | — |

---

## LAYER 9 — CONTENT STRINGS (verbatim)

Copy these exactly — do not paraphrase the editorial copy. Tone matters.

(See sections 1–6 above for all strings. Critical italics, hyphens, and en-dashes preserved.)

---

## LAYER 10 — FILE TREE

```
src/
├── main.tsx
├── App.tsx                    (Lenis + ScrollProgress + MagneticCursor + 6 sections)
├── index.css                  (Tailwind + custom utilities: grain, dropcap, sepia-tint, vertical-rl, marquee-mask)
├── components/
│   ├── Hero.tsx
│   ├── NowShowing.tsx
│   ├── Archive.tsx
│   ├── Curator.tsx
│   ├── Schedule.tsx
│   ├── Footer.tsx
│   ├── shared/
│   │   ├── WordsPullUp.tsx
│   │   ├── MarqueeRow.tsx
│   │   ├── MagneticCursor.tsx
│   │   └── ScrollProgress.tsx
│   └── ui/
│       └── Navbar.tsx
└── data/
    ├── artworks.ts            (6 NowShowing items)
    ├── archive.ts             (12 archive items + categories)
    └── schedule.ts            (4 upcoming exhibitions)
```

`tailwind.config.js`:

```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F4EFE6',
        paper: '#FAF7F1',
        ink: '#161413',
        oxblood: '#6B2B1F',
        ash: '#8A8780',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        italic: ['"Instrument Serif"', 'serif'],
      },
      letterSpacing: {
        micro: '0.2em',
        meta: '0.3em',
      },
      aspectRatio: {
        painting: '5 / 7',
      },
    },
  },
};
```

---

## LAYER 11 — DELIVERY CHECKLIST

- [ ] `npm create vite@latest .` (React + TS).
- [ ] `npm i tailwindcss@3 postcss autoprefixer framer-motion @studio-freight/lenis lucide-react`.
- [ ] Tailwind init, extend theme as Layer 10.
- [ ] `index.html` loads Fraunces + Inter + Instrument Serif.
- [ ] All 6 components + 4 shared + Navbar built.
- [ ] `App.tsx` mounts Lenis, ScrollProgress, MagneticCursor.
- [ ] `HERO_VIDEO` constant references `https://cdn.5sdesign.art/projects/Muse/muse-hero.mp4`.
- [ ] `public/photos/` contains 22 art files + curator.jpg + visit-london.png (buyer supplies).
- [ ] Navbar transitions from transparent → `bg-bone/85 backdrop-blur` past hero.
- [ ] Hero clock updates every 30s with `Intl.DateTimeFormat` for `Europe/London`, `Asia/Tokyo`, `America/Mexico_City`.
- [ ] Archive section uses `bg-ink text-bone` (only dark section).
- [ ] Archive eyebrow uses `text-bone` (NOT oxblood).
- [ ] Schedule rows fill oxblood on full-row hover (scaleX from left).
- [ ] Footer "MUSE" wordmark animates letter-by-letter (M, U, S, E) on inView.
- [ ] Magnetic cursor active md+ only; native cursor restored when `prefers-reduced-motion: reduce`.
- [ ] All images have meaningful `alt` text formatted as `${artist}, ${title}, ${medium}, ${year}` for artworks.
- [ ] No purple, no indigo, no neon — only bone + ink + oxblood + ash + paper.
- [ ] Lenis skipped under reduced-motion.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

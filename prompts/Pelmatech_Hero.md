## Pelmatech Hero Prompt

Build a single-page React + TanStack Start + TypeScript + Tailwind v4 app (shadcn-ui base) that exactly recreates the Pelmatech landing page described below. Use motion/react (framer-motion) and lucide-react. Implement the page inside src/routes/index.tsx with helper components in src/components/. Use the exact pixel values, fonts, colors, and animation timings listed. Do not invent extra design tokens.

==========================================================
PROJECT NAME
==========================================================
projectname/  (Pelmatech — Your Personal Health Companion)

==========================================================
FILE / FOLDER STRUCTURE
==========================================================
src/
  assets/
    blur-doctor.png        (portrait of a doctor, soft background blur — used in team carousel)
    happy-doctor.png       (smiling doctor portrait — used in team carousel)
    young-doctor.png       (young doctor portrait — used in team carousel)
    doctor-computer.png    (hero full-bleed photo of a doctor at a computer)
    clock-lamp.png         (still life: clock + lamp — benefits card 01 "Unavailable")
    pills.png              (still life: pills — benefits card 02 "Unethical")
    waitlist.png           (still life: waiting room — benefits card 03 "Waitlist")
    logo.svg               (white Pelmatech wordmark+icon, used on dark hero)
    logo-dark.svg          (black Pelmatech wordmark+icon, swapped in once user scrolls past hero)
  components/
    Header.tsx
    AnimatedHeading.tsx    (exports AnimatedHeading, AnimatedText, MaskedImage)
    TeamCarousel.tsx
    ui/                    (default shadcn primitives, untouched)
  routes/
    __root.tsx             (root shell, head, responsive-zoom script, QueryClientProvider, Outlet)
    index.tsx              (Hero + TeamSection + BenefitsSection)
  styles.css               (Tailwind v4 entry + design tokens)

All images above are referenced by `import x from "@/assets/<file>"`. A zip with every asset is shipped alongside this prompt.

==========================================================
GLOBAL SETUP
==========================================================
- Tailwind v4 via `@import "tailwindcss" source(none);` and `@source "../src";` in src/styles.css. Also `@import "tw-animate-css";`.
- Google fonts are loaded in __root.tsx head() via a `<link rel="stylesheet">` to:
  https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400;500;600&display=swap
- Page font stack defaults to "Helvetica Neue", Helvetica, Arial, sans-serif (set on body via the --font-sans token).
- Headings (h1..h4) use the same --font-display stack with letter-spacing: -0.025em.
- A second font stack named "TT Hoves" is used in the TeamSection and TeamCarousel via inline style:
  fontFamily: '"TT Hoves", "Helvetica Neue", Helvetica, Arial, sans-serif'
- Background of <body>: var(--background).
- html { scroll-behavior: smooth; }
- All borders inherit var(--color-border) via `* { border-color: var(--color-border); }`.
- -webkit-font-smoothing: antialiased on body.

Design tokens (in :root, defined in oklch):
```
--background:        oklch(0.97 0.005 100);   /* near-white, very slight warm */
--foreground:        oklch(0.18 0.01 100);    /* near-black */
--muted:             oklch(0.93 0.005 100);
--muted-foreground:  oklch(0.45 0.01 100);
--surface:           oklch(0.94 0.005 100);   /* benefits section background */
--accent:            oklch(0.55 0.12 155);
--accent-foreground: oklch(0.98 0 0);
--border:            oklch(0.88 0.005 100);
--header-bg:         oklch(0.25 0.01 100 / 0.85);  /* translucent pill bg of nav */
```

@theme inline maps each --color-* token to its var so Tailwind utilities like bg-surface, text-muted-foreground work.

==========================================================
RESPONSIVE ZOOM (CRITICAL)
==========================================================
The whole document is uniformly downscaled below 1728px using CSS `zoom`. From 1728px–1980px (and above) zoom is 1 — leave the layout at its native pixel sizes.

Implementation in src/routes/__root.tsx:
- Inline `<script>` injected in shellComponent head:
```js
(function(){
  function u(){
    var w = document.documentElement.clientWidth;
    var z = w < 1728 ? w / 1728 : 1;
    document.documentElement.style.zoom = String(z);
  }
  u();
  window.addEventListener('resize', u);
})();
```
- The same logic is duplicated inside a `useEffect` in RootComponent so it re-applies after hydration.

Because of this zoom, all pixel values below are written at the 1728px reference width.

==========================================================
LAYER / DOM HIERARCHY (top-level)
==========================================================
```
<html>
  <head> head() meta, stylesheets, fonts, zoom script </head>
  <body>
    <div class="bg-background text-foreground">
      <Header />                    (fixed, z-50)
      <main>
        <Hero />                    (section, h-screen, dark photo)
        <TeamSection>               (section, white bg)
          <TeamCarousel intro={...} />
        </TeamSection>
        <BenefitsSection />         (section, bg-surface, 3-card grid)
      </main>
    </div>
  </body>
</html>
```

==========================================================
1) HEADER  (src/components/Header.tsx)
==========================================================
- `<header>` fixed, top:24px (top-6), left:0, right:0, z-50, horizontal padding 32px (px-8), flex items-center justify-between.
- Left: `<img>` of the logo.
  - Initial src: src/assets/logo.svg (white version).
  - When window.scrollY > window.innerHeight - 80 the src swaps to src/assets/logo-dark.svg (black version).
  - className="h-8 w-auto transition-opacity"
  - Detection via a `scroll` listener attached on mount (passive: true), removed on unmount.
- Right: `<nav>` pill containing nav links and Menu button.
  - className: flex items-center gap-1, background: var(--header-bg) with backdrop-blur-md, text-white, rounded-full, pl-2 pr-2 py-2.
  - Items array: ["Home", "Artists", "Releases", "Contact"]. Each is an `<a href="#">` with px-5 py-2 text-sm rounded-full.
    - The first one ("Home") is highlighted: bg-white/10 font-medium.
    - The rest: opacity-80 hover:opacity-100, transition.
  - Trailing button: ml-2 flex items-center gap-2 px-4 py-2 text-sm rounded-full hover:bg-white/10
    - Contains `<Menu className="w-4 h-4" />` from lucide-react and the label "Menu".

==========================================================
2) HERO SECTION  (Hero in src/routes/index.tsx)
==========================================================
- `<section>` relative, h-screen, min-h-[780px], w-full, overflow-hidden.
- Background image: `<img src={doctor-computer.png} alt="Doctor working at computer" />` absolute inset-0 w-full h-full object-cover.
- Two stacked dark overlays (the slight darkening filter the user requested):
  1. absolute inset-0 bg-black/25
  2. absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
- Content wrapper: absolute inset-0, flex flex-col, justify-end, pb-16, px-8 md:px-12.

  Bottom content row: flex items-end justify-between gap-8.

  LEFT column (max-w-3xl):
    Headline (AnimatedHeading as h1, className "text-white font-medium leading-[1.05]"):
      ```
      <span style={{ fontSize: "72.73px", lineHeight: 1.05, display: "block" }}>
        Your Personal<br />Health Companion
      </span>
      ```
    Description wrapper: mt-8 w-max, then AnimatedText "text-white/85 max-w-xl leading-relaxed":
      ```
      <span style={{ fontSize: "20.99px", lineHeight: "28.21px", display: "block", width: "608px" }}>
        Meet your personal online health companion — a comprehensive platform offering tools for tracking your fitness goals, monitoring your nutrition, and scheduling your workouts.
      </span>
      ```

  RIGHT column (flex items-center gap-6 shrink-0 pb-1):
    - Primary CTA button:
      className: "bg-white text-foreground rounded-full pl-6 pr-2 py-2 flex items-center gap-3 font-medium text-sm hover:bg-white/90 transition"
      Label: "Try for Free"
      Trailing circular icon badge:
        ```
        <span className="w-9 h-9 rounded-full bg-foreground text-white flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4" />
        </span>
        ```
    - Secondary link `<a href="#">` className "text-white flex items-center gap-1 text-sm font-medium":
      "Schedule Demo " + `<ArrowUpRight className="w-4 h-4" />`.

- Hero footer strip (under the headline row, mt-12 pt-5):
  className: "border-t border-white/20 flex items-center justify-between tracking-[0.2em] text-white/70 uppercase"
  Inline style { fontSize: "12px" }
  Three flex children:
    1. "Enterprise Management Applications"
    2. ```
       <span className="flex items-center gap-6">
         <span><span className="text-white">01</span> / 04</span>
         <span>Next</span>
       </span>
       ```
    3. "Scroll to Explore"

==========================================================
3) TEAM SECTION  (TeamSection in src/routes/index.tsx + TeamCarousel)
==========================================================
- `<section>` py-32, px-8 md:px-12, fontFamily TT Hoves stack.
- Heading block is left-padded by exactly paddingLeft: "335.26px" so it aligns with the left edge of the first doctor card in the carousel below.
- Eyebrow row (mb-16): flex gap-24, tracking-[0.2em] uppercase, color text-muted-foreground, style { fontSize: "11.26px", fontFamily: TT Hoves }
    children: `<span>Pelmatech</span><span>Our Team</span>`
- AnimatedHeading "font-medium leading-[1.05]":
    ```
    <span style={{ fontSize: "58.55px", lineHeight: 1.05, display: "block", fontFamily: TT Hoves }}>
      Get to Know the People<br />that Get It All Done
    </span>
    ```

- mt-20 wrapper holds `<TeamCarousel intro={...}>`:
  intro prop = AnimatedText "text-muted-foreground leading-relaxed" containing:
    ```
    <span style={{ fontSize: "16.89px", lineHeight: 1.5, display: "block", width: "270px", fontFamily: TT Hoves }}>
      On our platform, our devoted team works ceaselessly to enhance our online presence and ensure the best possible customer experience.
    </span>
    ```

TeamCarousel (src/components/TeamCarousel.tsx)
- Team data (5 entries, role uppercase tracked):
```
{ img: blur-doctor.png,  role: "SURGEON GENERAL", name: "Dr. Helga Brooks"  }
{ img: happy-doctor.png, role: "PEDIATRICIAN",   name: "Dr. Kwame Mbeki"   }
{ img: young-doctor.png, role: "THERAPIST",      name: "Dr. Matteo Dubois" }
{ img: happy-doctor.png, role: "NEUROLOGIST",    name: "Dr. Hana Sato"     }
{ img: blur-doctor.png,  role: "CARDIOLOGIST",   name: "Dr. Aria Vance"    }
```
- Constants:
```
INTRO_WIDTH = 324  (the left intro text column; ~270px text + ~54px right gap; this also forces the first card to start at x=335.26 to match the heading)
GAP = 11.26 (pixel gap between intro and cards AND between cards)
visible = 3.25  (3 full cards + a sliver of the 4th visible to the right)
maxIndex = Math.max(0, Math.ceil(team.length - visible))
```
- Outer wrapper: relative; onMouseEnter/Leave toggle `hovered`.
- Inner row: flex, style { gap: 11.26px }.
- Intro column: shrink-0, width 324px, renders the `intro` node.
- Viewport: relative overflow-hidden flex-1 min-w-0.
- Track: `<motion.div>` className "flex" with
```
style.gap = 11.26
style.width = `calc(${team.length} * ((100% - ${(visible-1)*GAP}px) / ${visible}) + ${(team.length-1)*GAP}px)`
animate.x  = `calc(${-index} * (100% + ${GAP}px) / ${team.length})`
transition { duration: 0.7, ease: [0.22,1,0.36,1] }
```
- Each card: shrink-0, width = `calc((100% - ${(team.length-1)*GAP}px) / ${team.length})`, fontFamily TT Hoves.
  - Image wrapper: aspect-[3/4] overflow-hidden bg-muted; inside `<MaskedImage src={m.img} alt={m.name} className="w-full h-full" delay={i*0.08} />`.
  - Caption pt-6:
    - `<p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{role}</p>`
    - `<p className="text-xl mt-2 font-medium">{name}</p>`

- Hover control (the central circular arrow puck), wrapped in `<AnimatePresence>`:
  When `hovered` true, render `<motion.div>` absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10, with
    initial { opacity: 0, scale: 0.85 }, animate { opacity: 1, scale: 1 }, exit { opacity: 0, scale: 0.85 }, transition { duration: 0.25 }.
  Inside it: a circular pill `<div>`
    className "flex items-center justify-center gap-4 rounded-full cursor-pointer"
    style { width: 126, height: 126, background: "rgba(72, 72, 72, 0.16)", backdropFilter: "blur(84px)", WebkitBackdropFilter: "blur(84px)" }
  containing two `<button>`s with className "flex items-center justify-center text-white disabled:opacity-30 transition cursor-pointer":
    - prev: ArrowLeft (w-7 h-7), disabled when index===0, onClick: setIndex(i=>Math.max(0,i-1))
    - next: ArrowRight (w-7 h-7), disabled when index>=maxIndex, onClick: setIndex(i=>Math.min(maxIndex,i+1))

==========================================================
4) BENEFITS SECTION  (BenefitsSection in src/routes/index.tsx)
==========================================================
- `<section>` py-32 px-8 md:px-12 bg-surface.
- Top intro grid (mb-24): grid grid-cols-12 gap-12.
  - Left col (col-span-12 md:col-span-7): AnimatedHeading "text-5xl md:text-6xl font-medium leading-[1.05]":
      Explore the Benefits of<br />Our Platform
  - Right col (col-span-12 md:col-span-4 md:col-start-9 md:pt-4): AnimatedText "text-base text-muted-foreground leading-relaxed":
      By choosing an online platform over an offline one, artists can reach a global audience more easily, connect with fans worldwide, and shape the future of music in a dynamic way.

- 3-card grid (relative grid grid-cols-1 md:grid-cols-3) with custom borders:
  - Two interior VERTICAL lines (between cards only) drawn via the wrapper's backgroundImage:
```
backgroundImage:
  "linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px)"
backgroundSize: "1px 100%, 1px 100%"
backgroundPosition: "33.3333% 0, 66.6666% 0"
backgroundRepeat: "no-repeat"
```
  - Two HORIZONTAL lines (top + bottom of the row) implemented as `<span aria-hidden>`:
```
pointer-events-none absolute left-0 right-0 top-0 (or bottom-0) h-px
style background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.45) 15%, rgba(255,255,255,0.45) 85%, transparent 100%)"
```
    The fade-out near the edges is intentional — the lines must vanish toward the section's left/right edges.

  Items array (in order):
```
01 "Unavailable"  desc "We understand that there may be times when a doctor is not available to assist you." img clock-lamp.png
02 "Unethical"    desc "When a doctor lacks integrity, they may prescribe medications for promotional purposes instead of the patient's actual needs, leading to serious consequences for health." img pills.png
03 "Waitlist"     desc "Patients may experience long waiting times, sometimes for hours, before receiving assistance from the doctor." img waitlist.png
```

  Each card: p-10 flex flex-col gap-8.
    - card 01 and 03 layout: content on top, image on bottom (image is in `<div className="mt-auto">`).
    - card 02 is REVERSED: image on top, content in `<div className="mt-auto">`.

  Card content block:
```
<div className="flex items-start gap-3 mb-4">
  <span className="text-xs text-muted-foreground mt-2">(01)</span>
  <AnimatedHeading as="h3" className="text-3xl font-medium" delay={i*0.1}>{title}</AnimatedHeading>
</div>
<AnimatedText className="text-sm text-muted-foreground leading-relaxed max-w-sm" delay={0.2 + i*0.1}>{desc}</AnimatedText>
```

  Card image: `<div className="aspect-square overflow-hidden"><MaskedImage src={img} alt={title} className="w-full h-full" delay={i*0.12} /></div>`

==========================================================
ANIMATION PRIMITIVES (src/components/AnimatedHeading.tsx)
==========================================================
All animations use motion/react.

AnimatedHeading({ children, className, as: As="h2", delay=0 })
```
const MotionTag = motion(As)
initial: { opacity: 0, y: 30, filter: "blur(12px)" }
whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }
viewport: { once: true, margin: "-80px" }
transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }
```

AnimatedText({ children, className, delay=0.15 })
```
motion.p
initial: { opacity: 0, y: 20 }
whileInView: { opacity: 1, y: 0 }
viewport: { once: true, margin: "-80px" }
transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
```

MaskedImage({ src, alt, className, delay=0 })
```
motion.div wrapping <img className="w-full h-full object-cover" />
initial: { clipPath: "inset(100% 0 0 0)" }       /* fully clipped from the top */
whileInView: { clipPath: "inset(0% 0 0 0)" }     /* reveal downward, unmasking from bottom to top */
viewport: { once: true, margin: "-80px" }
transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }
```

These three components are used everywhere — every headline, paragraph, and image on the page enters with these exact animations.

==========================================================
INTERACTIONS RECAP
==========================================================
- Hero CTAs hover: white button darkens to white/90; secondary link no hover style.
- Nav links hover: opacity 80% → 100%; first link permanently bg-white/10. Menu button hover bg-white/10.
- Logo swap occurs when scrollY > innerHeight - 80 (i.e. once you scroll past the dark hero, the logo turns black).
- TeamCarousel: hovering the carousel area shows the central 126px circular blurred puck with two arrows; cursor becomes pointer over the puck and each button; clicking arrows slides the track horizontally with cubic ease (0.22, 1, 0.36, 1) over 0.7s. visible=3.25 keeps the next card peeking on the right.
- BenefitsSection borders use rgba(255,255,255,0.45). Verticals only span between cards; horizontals fade to transparent at the section edges.
- prefers-reduced-motion is not specially handled; framer-motion respects user OS settings by default.

==========================================================
PACKAGES
==========================================================
- @tanstack/react-router, @tanstack/react-start, @tanstack/react-query
- motion (used as `motion/react`)
- lucide-react (icons used: Menu, ArrowUpRight, ArrowLeft, ArrowRight)
- tailwindcss v4, tw-animate-css
- All shadcn-ui primitives under src/components/ui/ stay at defaults; only Button has the standard cva variants.

==========================================================
ICONS USED (lucide-react)
==========================================================
- Menu          → nav "Menu" button
- ArrowUpRight  → hero "Try for Free" badge and "Schedule Demo" link
- ArrowLeft     → carousel previous
- ArrowRight    → carousel next

# Nutrition-Health Hero 01 Halo

A full-screen nutrition/health hero header for the "Halo" brand, built with React, Tailwind CSS, Framer Motion, and lucide-react icons. It pairs a dark-green rounded hero card (badge, headline, paragraph, two CTAs, two feature blurbs) with an animated dual-column photo mosaic on the right, plus a top navbar and a grayscale client logo bar.

## 1. Tech stack
- **React** (client component, `"use client"`).
- **framer-motion** — `motion` components and `Variants` type for entrance + continuous marquee animations.
- **lucide-react** — icons: `ArrowUpRight`, `Headphones`, `Share2`, `ShieldCheck`.
- **Tailwind CSS** — all styling via utility classes.
- No other libraries.

## 2. Fonts & global styles

Load the Jost font from Google Fonts inside the component (rendered as `<link>` tags, not a global stylesheet):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
```

- Font weights loaded: Jost 400, 500, 600, 700.
- Body text uses Tailwind class `font-jost` (map to the Jost family). The headline uses `font-body` (the app/site body font); scope it so it does not override global fonts.
- Text selection styling on the outer wrapper: `selection:bg-[#034F46] selection:text-white`.
- The wrapper uses `bg-background` and various elements use `text-foreground` (Tailwind theme tokens). If those tokens are unavailable, treat `bg-background` as white (`#FFFFFF`) and `text-foreground` as near-black.

## 3. Section container
- Outer wrapper: `min-h-screen flex flex-col bg-background` plus the selection classes above (and any passed `className`).
- Composed of: `<Navbar>`, then a `<main className="flex-1 flex flex-col">` containing the hero `<section>` and the `<LogoBar>`.

## 4. Navbar
- Element: `motion.nav`, `flex items-center justify-between py-4 bg-background z-20 relative max-w-[1360px] w-full mx-auto px-4 md:px-6`.
- Entrance: `initial={{ y: -10, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`, `transition={{ duration: 0.4 }}`.
- **Left — Logo:** wrapper `flex items-center h-[40px]`; `<img>` src `https://cdn.jiro.build/Halo/Company%20logo%20black.png`, alt "Company Logo", classes `h-8 w-auto object-contain`, `referrerPolicy="no-referrer"`.
- **Center — Nav links** (`hidden md:flex items-center gap-0`): four pill links, each `flex items-center gap-[2px] px-4 py-1 bg-transparent border border-gray-200 rounded-full font-jost text-[14px] font-normal leading-[24px] text-gray-700 hover:bg-gray-100 transition-colors`. Labels and hrefs: About → `#about`, Services → `#services`, Products → `#products`, FAQs → `#faqs`.
- **Right — Contact + CTA** (`flex items-center gap-4 lg:gap-6`):
  - Phone block `hidden lg:flex items-center gap-2 text-sm text-foreground font-medium`: `Headphones` icon `h-4 w-4` + text `(009)323-2323`.
  - CTA button `rounded-full bg-[#F0F2F1] p-1 flex items-center gap-3 hover:opacity-90 transition-opacity group`: inner circle `w-8 h-8 aspect-square rounded-full bg-[#034F46] flex items-center justify-center` holding `ArrowUpRight` `h-4 w-4 text-white`; label span `pr-5 font-jost text-[16px] font-normal leading-[24px] text-[#034F46]` reading "Explore Plans".

## 5. Structure — section by section

### Hero section
- `<section className="w-full flex justify-center px-4 md:px-6 py-4">`.
- Inner hero card: `motion.div`, classes `w-full max-w-[1360px] h-auto lg:h-[788px] rounded-[40px] bg-[#034F46] overflow-hidden flex flex-col lg:flex-row shadow-2xl px-6 lg:pl-[74px] lg:pr-[80px] py-12 lg:py-0`.
- Card entrance: `initial={{ opacity: 0, scale: 0.98 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ duration: 0.8 }}`.

#### Left content column
- `motion.div` with `containerVariants` (`initial="hidden" animate="visible"`), classes `flex flex-col justify-center items-start gap-10 lg:gap-[70px] w-full lg:w-[563px]`.
- Inner `flex flex-col` group; each child is a `motion.div`/`motion.h1`/`motion.p` using `itemVariants`:
  - **Badge** (`mb-6`): span `inline-flex items-center justify-center gap-[10px] rounded-full bg-[#E5F0C6]/10 border border-[#E5F0C6]/30 px-5 py-0 font-jost text-[12px] font-normal leading-[24px] uppercase text-[#E5F0C6]`, text "THE TIME IS RIGHT TO".
  - **Headline** `h1`: `w-full lg:w-[491px] font-body font-medium text-[40px] lg:text-[56px] leading-tight lg:leading-[64px] text-white tracking-[-1px]`. Copy across two lines (with `<br/>`): "Power Your Day" / "With Real Nutrition".
  - **Paragraph** `p`: `mt-6 w-full lg:w-[491px] font-jost text-[18px] font-normal leading-[24px] text-white/80`. Copy: "Developed with nutrition experts and backed by research, our solutions deliver measurable, sustainable health improvements."
  - **CTA row** (`mt-10 flex flex-wrap items-center gap-4`):
    - Primary button `flex items-center justify-center gap-[10px] rounded-[99px] p-[4px_16px_4px_4px] bg-[#E5F0C6] backdrop-blur-[50px] font-jost text-[16px] font-normal leading-[24px] text-[#034F46] hover:opacity-90 transition-opacity`. Contains a `w-[44px] h-[44px] aspect-square rounded-full flex items-center justify-center` wrapper holding an inline SVG (44×44), then label "Explore Expert Plans". SVG:

      ```html
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="22" fill="#034F46"/>
        <path d="M17 27.5L26.5 18M26.5 18V26M26.5 18H18.5" stroke="#E5F0C6"/>
      </svg>
      ```

    - Secondary button `flex items-center justify-center gap-[10px] rounded-[99px] p-[14px_20px] bg-white/10 backdrop-blur-[50px] font-jost text-[16px] font-normal leading-[24px] text-white transition-colors hover:bg-white/20`, text "Shop Natural Products".
- **Feature row** (`motion.div` with `itemVariants`, `self-stretch`): inner `flex flex-col sm:flex-row items-start gap-[22px]`.
  - Feature 1: `flex items-start gap-4 flex-1 self-stretch`; icon wrapper `flex-shrink-0 w-8 h-8` with `ShieldCheck` `w-8 h-8 text-white`; title `h3` `text-[18px] font-normal text-white font-jost leading-[20px] whitespace-nowrap` "Patient-Centered approach"; body `p` `text-[14px] text-white/70 leading-[16px] font-jost mt-2` "We tailor treatments to fit your unique health needs and goals."
  - Divider: `hidden sm:block w-[1px] h-[40px] bg-white/30 self-center`.
  - Feature 2: same layout; icon `Share2` `w-8 h-8 text-white`; title "Safety & Hygiene standards"; body "Strict protocols to ensure your health and safety are always protected."

#### Right photo mosaic column
- `motion.div` `flex-1 relative overflow-hidden hidden lg:flex items-center justify-end h-full max-h-[900px]`. Entrance: `initial={{ opacity: 0, x: 30 }}`, `animate={{ opacity: 1, x: 0 }}`, `transition={{ duration: 1, delay: 0.4 }}`. (Hidden below `lg`.)
- Inner `flex gap-4 h-full` holding two scrolling sub-columns.
- **Left sub-column:** wrapper `relative h-full overflow-hidden`; a `motion.div` `flex flex-col gap-4` that scrolls up: `animate={{ y: [0, -1396] }}`, `transition={{ duration: 30, repeat: Infinity, ease: "linear" }}`. Image list (8 items, the first four repeated): Frame 37, Frame 36, Frame 35, Frame 34-1, Frame 37, Frame 36, Frame 35, Frame 34-1.
- **Right sub-column:** wrapper `relative h-full overflow-hidden pt-20`; a `motion.div` `flex flex-col gap-4` that scrolls (offset start): `animate={{ y: [-1047, 0] }}`, `transition={{ duration: 25, repeat: Infinity, ease: "linear" }}`. Image list (6 items, first three repeated): Frame 33, Frame 32, Frame 31, Frame 33, Frame 32, Frame 31.
- Each image cell: `w-[280px] h-[333px] rounded-[32px] overflow-hidden shadow-xl border-[4px] border-white/12 flex-shrink-0`; `<img>` `object-cover w-full h-full hover:scale-105 transition-transform duration-700`, `referrerPolicy="no-referrer"`.

### LogoBar
- `motion.div` `py-10 flex items-center justify-between flex-wrap gap-10 max-w-[1360px] w-full mx-auto px-4 md:px-6`.
- Entrance: `initial={{ y: 16, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`, `transition={{ duration: 0.5, delay: 0.5 }}`.
- 7 client logos, each `<img>` `h-5 object-contain opacity-70 grayscale hover:grayscale-0 transition-all`, `referrerPolicy="no-referrer"`. Brands/alts: NVIDIA, ERICSSON, Carta, Cisco, FedEx, Amazon, Zoom.

## 6. Assets (every URL)
- Logo: `https://cdn.jiro.build/Halo/Company%20logo%20black.png`
- Client logos:
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20Nvidia%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20Ericsson%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20Carta%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20Cisco%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20FedEx%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20amazon%20%E2%86%92%20SVG.png`
  - `https://cdn.jiro.build/Halo/icons/Item%20%E2%86%92%20zoom%20%E2%86%92%20SVG.png`
- Mosaic images:
  - `https://cdn.jiro.build/Halo/image/Frame%2037.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2036.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2035.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2034-1.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2033.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2032.png`
  - `https://cdn.jiro.build/Halo/image/Frame%2031.png`

## 7. Animations
- **Navbar:** slide down + fade, `y -10 → 0`, opacity `0 → 1`, duration 0.4s.
- **Hero card:** fade + scale, opacity `0 → 1`, scale `0.98 → 1`, duration 0.8s.
- **Left column stagger:** `containerVariants` (hidden opacity 0 → visible opacity 1, `staggerChildren: 0.1`, `delayChildren: 0.1`); each `itemVariants` child animates `y 20 → 0`, opacity `0 → 1`, duration 0.6s.
- **Right mosaic column:** fade + slide, opacity `0 → 1`, `x 30 → 0`, duration 1s, delay 0.4s.
- **Marquee — left sub-column:** continuous vertical scroll `y: [0, -1396]`, duration 30s, `repeat: Infinity`, `ease: "linear"`.
- **Marquee — right sub-column:** continuous vertical scroll `y: [-1047, 0]`, duration 25s, `repeat: Infinity`, `ease: "linear"`.
- **LogoBar:** slide up + fade, `y 16 → 0`, opacity `0 → 1`, duration 0.5s, delay 0.5s.
- **Image hover:** `hover:scale-105 transition-transform duration-700`.
- **Logo hover:** grayscale → color (`grayscale hover:grayscale-0 transition-all`).

## 8. Responsive
- Navbar center links: `hidden md:flex`. Phone block: `hidden lg:flex`. Gap widens `gap-4 lg:gap-6`.
- Hero card: stacks `flex-col` then `lg:flex-row`; height `h-auto` then `lg:h-[788px]`; padding `px-6 py-12` then `lg:pl-[74px] lg:pr-[80px] lg:py-0`.
- Left column width `w-full` then `lg:w-[563px]`; gap `gap-10 lg:gap-[70px]`. Headline/paragraph width capped at `lg:w-[491px]`.
- Headline size `text-[40px]` → `lg:text-[56px]`; line height `leading-tight` → `lg:leading-[64px]`.
- Feature row: `flex-col` → `sm:flex-row`; divider only `sm:block`.
- Right mosaic column entirely hidden below `lg` (`hidden lg:flex`).
- Page side padding `px-4 md:px-6` across navbar, hero section, logo bar.

## 9. Key design principles
- Brand palette: deep green `#034F46` (card + accents), pale lime `#E5F0C6` (badge text, primary CTA), light gray `#F0F2F1` (navbar CTA bg); white text with `/80`, `/70`, `/30`, `/12`, `/10` opacities for hierarchy on the dark card.
- Large `rounded-[40px]` hero card and `rounded-[99px]` / `rounded-full` pills give a soft, premium feel.
- Centered max-width `1360px` container keeps navbar, hero, and logo bar aligned.
- Continuous, opposite-feeling vertical marquees create a living gallery; subtle 4px translucent borders frame each photo.
- Staggered entrance animations sequence the left-column content for a polished load.

## 10. Common mistakes to avoid
- Do not set global `body`/`html`/`*` fonts or resets; scope Jost (`font-jost`) and the body font (`font-body`) to this section only.
- Keep exact marquee values (`y: [0, -1396]` at 30s; `y: [-1047, 0]` at 25s, linear, infinite) — these tune the loop seam.
- Preserve `referrerPolicy="no-referrer"` on all images (CDN requires it).
- Keep the duplicated image lists (8 and 6 entries) so the loops appear seamless; do not de-duplicate.
- Keep exact hexes (`#034F46`, `#E5F0C6`, `#F0F2F1`) and opacity suffixes; do not approximate.
- Hide the right mosaic below `lg` (`hidden lg:flex`); do not render it on mobile.
- Use the inline 44×44 SVG arrow with path `M17 27.5L26.5 18M26.5 18V26M26.5 18H18.5` for the primary CTA, not a lucide icon.
- Preserve all copy verbatim, including "(009)323-2323" and the all-caps badge "THE TIME IS RIGHT TO".

## 11. Page title
Nutrition-Health Hero 01 Halo

## Integration (build-safety — do not skip)
- Add this section as a **new** component file with a unique name. Don't edit or overwrite any existing file except to add its import and render it.
- Render it **after** all existing sections; keep every previously built section exactly as-is — never replace or remove them.
- If no project exists, create a minimal React + Tailwind app; if one exists, use it as-is — don't re-scaffold or change the Tailwind/build config or version.
- Keep it self-contained: scope its fonts and any resets to this section; never set global body/html/* styles or a global font.
- Install only the libraries this section names.

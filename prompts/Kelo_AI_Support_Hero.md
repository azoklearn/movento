# AI Customer Support Hero Kelo

A full-bleed dark hero for "Kelo", an AI customer-support / next-gen chatbot product, with a looping background video, a floating glass navigation pill, centered headline + CTA, and a fading company-logo row. Built in React.

## Tech stack
- React (client component, `"use client"`), with `useRef`, `useState`, `useEffect`
- framer-motion (`motion`, `AnimatePresence`) for entrance animations and the mobile menu

## Fonts & global styles
- No custom font imports; uses the app's default sans-serif stack. Do not set any global font; scope everything to this section.

## Section container
- Root `<section>`: `min-h-[110vh] flex flex-col bg-black relative w-full` (plus any passed `className`).
- A background `<video>` and a dark overlay sit behind the content; nav and content layer above via z-index.

## Structure section by section

### Background video + overlay
- `<video>` with `autoPlay muted loop playsInline`, classes `absolute inset-0 w-full h-full object-cover z-0`.
- Source: `https://cdn.jiro.build/Kelo/Hero%2003.mp4`, `type="video/mp4"`.
- Playback rate is set to `0.6` (slowed) via a ref in `useEffect`.
- Overlay `<div>`: `absolute inset-0 bg-black/20 z-[1]` (light 20% black tint).

### Navigation bar (floating glass pill)
- `<motion.nav>`: `absolute top-6 left-0 right-0 z-50 px-6`. Entrance: `initial y -20 opacity 0` -> `y 0 opacity 1`, duration 0.8s, ease `easeOut`.
- Inner container `max-w-4xl mx-auto`.
- Pill: `flex items-center justify-between p-2 px-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10`.
- Left: logo `<img>` `h-[22px] w-auto`, `referrerPolicy="no-referrer"`, alt `Kelo Logo`, src `https://cdn.jiro.build/Kelo/Kelo%20White.svg`.
- Center (desktop, `hidden md:flex items-center gap-5`): nav links `Features`, `Solutions`, `Pricing`, `About`. Each link: `text-[13px] font-medium text-white/70 hover:text-white`, hrefs are lowercased anchors (`#features`, etc.). Each has an underline span that grows from `w-0` to `w-full` on group hover (`absolute -bottom-1 left-0 h-0.5 bg-white`).
- Right (desktop, `hidden md:flex items-center gap-2`):
  - `Log in` text button: `text-[13px] font-medium text-white/70 hover:text-white px-2 py-1.5`.
  - `Get Started` button: `rounded-full px-4 py-1.5 text-[13px] font-semibold bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95`.
- Mobile hamburger button (`md:hidden`, `w-8 h-8`, three `w-5 h-[2px] bg-white` bars). When open, bars animate: top `rotate-45 translate-y-[7px]`, middle `opacity-0`, bottom `-rotate-45 -translate-y-[7px]`, transition `duration-300`.

### Mobile menu (AnimatePresence)
- Appears when `menuOpen`. `<motion.div>` `md:hidden mt-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3`. Enter/exit `opacity 0, y -10` <-> `opacity 1, y 0`, duration 0.25s ease `easeOut`.
- Same four links (`text-[15px]`, `py-2 px-3 rounded-lg hover:bg-white/10`), each closes the menu on click.
- Divider `border-t border-white/10 pt-3 mt-1`, then `Log in` (text button) and `Get Started` (`rounded-full px-5 py-2.5 text-[15px] font-semibold bg-white text-black`).

### Hero content (centered)
- Wrapper: `relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-[148px] pb-16 z-10`, inner `flex flex-col items-center w-full`.
- Headline `<motion.h1>`: `font-semibold text-5xl md:text-6xl lg:text-[66px] leading-[1.1] tracking-[-0.02em] text-white max-w-4xl mt-0 mb-5`. Entrance `opacity 0, y 20` -> in, duration 0.6s, delay 0.1s, ease `easeOut`. Copy (two lines):
  - `The Future of` then a `<br/>` then `The Next-Gen ` followed by `Chatbot` in italics (`<span className="italic">Chatbot</span>`).
- Subheadline `<motion.p>`: `text-base md:text-lg text-white/90 max-w-[480px] leading-relaxed mb-8`, entrance duration 0.6s delay 0.2s. Copy verbatim: `The smarter way to manage sales starts with using tools that streamline every step of the process`.
- CTA block `<motion.div>` (`flex flex-col items-center gap-3`, entrance duration 0.6s delay 0.3s):
  - Button: `rounded-full px-8 py-4 text-base font-semibold bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 shadow-2xl hover:scale-105 active:scale-95`, inline boxShadow `0 8px 32px 0 rgba(31, 38, 135, 0.37)`. Copy: `Get 14 Days Free Trial`.
  - Microcopy span: `text-sm text-white/60`, copy `No Credit Card Required`.

### Company logos row
- `<motion.div>` with a stagger container: `mt-[60px] flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 hover:opacity-80 transition-opacity duration-500`.
- Container variants: hidden `opacity 0` -> show `opacity 1` with `staggerChildren 0.1`, `delayChildren 0.5`.
- Each logo `<motion.img>`: child variants hidden `opacity 0, y 10` -> show `opacity 1, y 0`; `whileHover { scale 1.1, opacity 1 }`. Classes `h-6 w-auto brightness-0 invert` (renders logos white), `referrerPolicy="no-referrer"`.
- Logos in order: Google, Amazon, Microsoft, Netflix, Spotify, Meta, Apple, Airbnb, Slack.

## Assets (every URL)
- Background video: `https://cdn.jiro.build/Kelo/Hero%2003.mp4`
- Logo (Kelo wordmark, white): `https://cdn.jiro.build/Kelo/Kelo%20White.svg`
- Company logos (all rendered white via `brightness-0 invert`):
  - Google: `https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg`
  - Amazon: `https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg`
  - Microsoft: `https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg`
  - Netflix: `https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg`
  - Spotify: `https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg`
  - Meta: `https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg`
  - Apple: `https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg`
  - Airbnb: `https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg`
  - Slack: `https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg`

## Animations
- Nav: slide down + fade, 0.8s ease `easeOut`.
- Headline: fade up (y 20), 0.6s, delay 0.1s.
- Subheadline: fade up (y 16), 0.6s, delay 0.2s.
- CTA block: fade up (y 16), 0.6s, delay 0.3s.
- Logos: container stagger 0.1s with 0.5s delay before children; each logo fades up (y 10); hover scales to 1.1 and full opacity.
- Hamburger bars rotate/fade with `duration-300`; mobile menu enters/exits over 0.25s.
- Button hover/active scale 1.05 / 0.95; video plays at 0.6x speed.

## Responsive
- Nav links and auth buttons hidden below `md`; hamburger + animated mobile menu shown below `md`.
- Headline scales `text-5xl` -> `md:text-6xl` -> `lg:text-[66px]`.
- Logo row wraps (`flex-wrap`, `gap-x-12 gap-y-8`).
- Section is `min-h-[110vh]`; content has top padding `pt-[148px]` to clear the floating nav.

## Key design principles
- Dark, cinematic hero: slowed looping video under a light 20% overlay keeps text legible while motion stays subtle.
- Glassmorphism throughout (`bg-white/5`-`/20`, `backdrop-blur-xl`, white borders) for nav, CTA, and mobile menu.
- Monochrome logo wall (white via `brightness-0 invert`) at low opacity that lifts on hover.
- Staggered top-to-bottom entrance for a polished load.

## Common mistakes to avoid
- Do not paste the whole component as one code block.
- Keep the video playbackRate at `0.6` and the overlay at `bg-black/20` (not heavier).
- Preserve exact opacity utilities (`white/5`, `white/10`, `white/20`, `white/60`, `white/70`, `white/90`) and the CTA inline boxShadow `0 8px 32px 0 rgba(31, 38, 135, 0.37)`.
- Keep `Chatbot` italic and the `<br/>` line break in the headline.
- Render logos white with `brightness-0 invert`; keep `referrerPolicy="no-referrer"` on remote images.
- Do not set global styles; scope to this section.

## Page title
AI Customer Support Hero Kelo

## Integration (build-safety — do not skip)
- Add this section as a **new** component file with a unique name. Don't edit or overwrite any existing file except to add its import and render it.
- Render it **after** all existing sections; keep every previously built section exactly as-is — never replace or remove them.
- If no project exists, create a minimal React + Tailwind app; if one exists, use it as-is — don't re-scaffold or change the Tailwind/build config or version.
- Keep it self-contained: scope its fonts and any resets to this section; never set global body/html/* styles or a global font.
- Install only the libraries this section names.

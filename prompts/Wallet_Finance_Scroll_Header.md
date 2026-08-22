# Finance Header - Wallet

A full-screen, scroll-scrubbed crypto/finance hero section for the "Wallet" brand featuring a background astro/space video that scrubs through its first 4 seconds as the user scrolls and then auto-plays, plus two split headings that animate in from opposite edges.

## Tech stack
- React (with "use client" for Next.js App Router)
- Tailwind CSS
- framer-motion (motion, AnimatePresence)
- lucide-react (icons: Check, Menu, X, ArrowUpRight, Send, ChevronDown)

## Fonts & global styles
- Import Google Font "Anybody": `https://fonts.googleapis.com/css2?family=Anybody:wght@400;500;700&display=swap`
- The primary heading font is `Anybody, sans-serif` (weight 400 for headings, 500 for the Wallet logo label).
- The Contact Us button label uses `"Cabinet Grotesk", sans-serif`, weight 700 (fall back to a bold grotesque sans if Cabinet Grotesk is unavailable).
- A monospace font (`font-mono`) is used for small UI labels and status readouts.
- Add a scoped `<style>` block controlling responsive heading sizes via the `.anybody-heading` class:

```css
@media (min-width: 1024px) { .anybody-heading { font-size: 70px !important; line-height: 1.1 !important; } }
@media (min-width: 768px) and (max-width: 1023px) { .anybody-heading { font-size: 52px !important; line-height: 1.1 !important; } }
@media (max-width: 767px) { .anybody-heading { font-size: 34px !important; line-height: 1.2 !important; } }
```

## Section container
- Outer wrapper: `position: relative`, full width, height `250vh` (this tall height creates the scroll runway), `background: black`, white text, `user-select: none`.
- Inside it a sticky viewport: `position: sticky; top: 0; left: 0; width: 100%; height: 100vh; overflow: hidden`.

## Structure, section by section

1. **Background video** — absolutely positioned `inset-0`, `w-full h-full object-cover`, `z-index: 0`, `opacity: 0.9`, `transition-opacity duration-1000`. Attributes: `muted`, `playsInline`, `loop`. Source: `https://cdn.jiro.build/Wallet/Astro.mp4`.

2. **Overlays (z-10, pointer-events none)** — a `bg-black/35` full-cover layer, and a `bg-gradient-to-t from-black via-transparent to-black/60` full-cover gradient.

3. **Header bar (z-30)** — absolutely pinned top, flex justify-between, padding `px-4 py-6` on mobile and `md:px-[80px] md:py-12` on desktop.
   - **Left: Wallet logo badge** — a button with `flex items-center gap-1.5 md:gap-2.5`, padding `px-2.5 py-1.5 md:px-4 md:py-2.5`, `rounded-lg`, `border border-white/10`, `bg-white/5` (hover `bg-white/10`), `active:scale-95`, `backdrop-blur-md`. Contains a 16px (mobile) / 20px (desktop) logo image from `https://cdn.jiro.build/Wallet/Ardor.png` (alt "Wallet Logo", `object-contain`, `referrerPolicy="no-referrer"`) and the label "Wallet" in Anybody 500, 14px mobile / 18px desktop, line-height 16px, color #FFF. Clicking it toggles a simulated wallet connect.
   - **Right: actions** — a hamburger menu button (icon-only, padding `p-2.5 md:p-3.5`, `rounded-lg border border-white/10 bg-white/5` hover `bg-white/10`, `backdrop-blur-md`, Menu icon 16/18px) that opens a right-side drawer; and a Contact Us button styled inline: `display:flex; padding:10px 14px` (mobile) / `14px 20px` (desktop); `gap:6px`; `border-radius:8px`; `border:1px solid #404040`; `background:#FFF`; hover `scale-105`, `active:scale-95`, `box-shadow: 0 4px 20px rgba(255,255,255,0.15)` growing to `0 8px 30px rgba(255,255,255,0.25)` on hover, `transition-all duration-300`. Label "Contact Us" in Cabinet Grotesk 700, color #0B3A17, 14px mobile / 18px desktop, line-height 16px.

4. **Main content body (z-20)** relative full-size:
   - **Left heading block** — absolute `left-6 top-[140px]` mobile / `md:left-[80px] md:top-[239px]` desktop, text-left. Heading text "Connect your" + line break + "wallet" using `.anybody-heading`, color #FFF, weight 400.
   - **Right heading block** — absolute `right-6 bottom-12` mobile / `md:right-[80px] md:bottom-[90px]` desktop, text-right. Heading "Hold the Future" + line break + "in Your Hands." using `.anybody-heading`, color #FFF, weight 400. Its opacity and horizontal offset are driven by scroll progress (see animations).
   - **Scroll indicator** — centered near bottom (`bottom-12 left-1/2 -translate-x-1/2`), `font-mono text-[10px] tracking-[0.2em] text-white/40`, label "SCROLL TO PLAY UNIVERSE" above a bouncing ChevronDown (14px). Hidden once scroll progress passes 92%.

5. **Slide-out drawer (fixed z-50)** — full-screen `bg-black/80 backdrop-blur-md` overlay flexing content to the right; panel `w-full max-w-md h-full bg-neutral-950 border-l border-white/10 p-8`, flex column justify-between. Top row: small triangle SVG + label "PORTAL DIRECTORY" (`font-mono tracking-widest text-xs uppercase text-neutral-400`) and a round close button. Nav items (each `p-4 rounded-xl` hover `bg-white/5` + faint border, cursor pointer, with an ArrowUpRight 18px that lightens on hover, and label hovers to `text-amber-400`): "Connect Keystore" (triggers connect and closes drawer), "Ecosystem" (desc "Cosmic scale chains"), "Security Protocols" (desc "Military-grade cryptographic shield"), "Interstellar Hub" (desc "Multi-signature smart network"). Footer (`border-t border-white/5 pt-6 font-mono text-xs text-neutral-500`): "NETWORK STATUS:" / "ACTIVE MAINNET" (`text-emerald-400 animate-pulse`), "LATENCY:" / "14ms (DECENTRALIZED)".

6. **Contact modal (fixed z-50)** — full-screen `bg-black/80 backdrop-blur-md`, centered. Panel `w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl`, padding `p-6 md:p-8`. Header "Contact Wallet Agent" (text-xl semibold) + round close button. Form fields (each label `font-mono text-xs uppercase tracking-wider text-neutral-400`, inputs `bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-sm` focus border `white/30`): "Your Name" (placeholder "John Doe"), "Secure Email Address" (placeholder "john@securesite.org"), "Transmission Message" (textarea 4 rows, placeholder "Type your secure message here..."). Submit button full-width, `bg-white text-black font-semibold rounded-lg` hover `bg-neutral-200`, with Send icon + "Transmit Secure Message". On submit shows a success state: emerald check circle, "Transmission Confirmed", and copy "Your message has been secure-routed into our interstellar support relays. Expect response shortly." which auto-dismisses after 2.5s.

## Assets
- Background video: `https://cdn.jiro.build/Wallet/Astro.mp4`
- Wallet logo image: `https://cdn.jiro.build/Wallet/Ardor.png`

## Animations

- **Scroll scrub + autoplay video (signature effect):** compute `progress = clamp(window.scrollY / (documentElement.scrollHeight - innerHeight), 0, 1)`. While `progress < 0.95`, keep the video paused and set `video.currentTime = progress * 4` to manually scrub the first 4 seconds. Once `progress >= 0.95`, disable native loop, start playing from 4s, and via a `timeupdate`/`ended` handler snap `currentTime` back to 4s whenever it reaches the end (`duration - 0.2`) to create a seamless custom loop of the tail segment.

```js
const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
if (progress >= 0.95) {
  if (video.paused) {
    video.loop = false;
    if (video.currentTime < 4) video.currentTime = 4;
    video.play();
  }
} else {
  if (!video.paused) video.pause();
  video.currentTime = progress * 4;
}
```

- **Left heading:** framer-motion, `initial {opacity:0, x:-40}` → `animate {opacity:1, x:0}`, duration 1, ease `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Right heading:** driven directly by scroll: `rightOpacity = clamp((progress - 0.1) / 0.8, 0, 1)`; `translateX = (1 - rightOpacity) * (isMobile ? 30 : 120)px`; CSS transition `transform 0.15s ease-out, opacity 0.15s ease-out`.
- **Scroll indicator:** enter `{opacity:0,y:10}` → `{opacity:0.7,y:0}`, exit `{opacity:0,y:-15}` via AnimatePresence; the chevron bounces `y: [0,6,0]` on an infinite 1.5s repeat. Hidden when progress >= 0.92.
- **Drawer:** overlay fades in/out; panel slides `x:100% → 0` with spring (damping 25, stiffness 200).
- **Contact modal:** overlay fades; panel `{scale:0.95,y:15} → {scale:1,y:0}`; success block fades in.

## Responsive behavior
- Breakpoint at 768px (`md`) — an `isMobile` state (window.innerWidth < 768) also drives inline padding/font sizes and the right-heading slide distance (30px mobile vs 120px desktop).
- Heading sizes: 34px (<768px), 52px (768-1023px), 70px (>=1024px) via the `.anybody-heading` media queries.
- Header padding grows from `px-4 py-6` to `md:px-[80px] md:py-12`; icons and button padding scale up at `md`.

## Key design principles
- Dark cinematic space aesthetic with translucent glassmorphic controls (`bg-white/5`, `backdrop-blur-md`, thin white borders).
- Scroll IS the timeline: the video, right heading, and indicator all read from a single normalized scroll-progress value.
- High-contrast white Contact button (deep green label #0B3A17) as the single bright CTA.
- Split-composition typography: left heading top-left, right heading bottom-right.

## Common mistakes to avoid
- Do not let the video's native `loop` fight the custom tail-loop; set `video.loop = false` before autoplay.
- The `250vh` outer height is required for the scroll runway — do not shrink it.
- Keep overlays `pointer-events-none` so header buttons remain clickable.
- Always null-check the video ref before touching `currentTime`/`play`.

## Page title
Finance Header - Wallet

## Integration (build-safety — do not skip)
- Add this section as a **new** component file with a unique name. Don't edit or overwrite any existing file except to add its import and render it.
- Render it **after** all existing sections; keep every previously built section exactly as-is — never replace or remove them.
- If no project exists, create a minimal React + Tailwind app; if one exists, use it as-is — don't re-scaffold or change the Tailwind/build config or version.
- Keep it self-contained: scope its fonts and any resets to this section; never set global `body`/`html`/`*` styles or a global font.
- Install only the libraries this section names.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

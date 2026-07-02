## Creative Studio Showcase Prompt

Build a full-page creative studio hero with a splash screen entrance, spotlight cursor reveal, word-by-word headline animation, and animated burger menu. Vanilla HTML + CSS + JavaScript only.

## Tech Stack
- Vanilla HTML + CSS + JavaScript (no frameworks)
- Google Font: `Inter` weights 300, 400, 500, 600, 700

## Color Palette
- Background: `#E4E4E4`
- Foreground/cream: `#F4F1E8`
- Dark: `#111111` / `#0B0B0B`
- Accent: `#75C5DE`
- Muted text: `#9A9590`

## Splash Screen
- `position: fixed; inset: 0; z-index: 9999; pointer-events: none; overflow: hidden`
- Two rows of 5 boxes each (`20%` wide, `50%` tall). Top row boxes animate `translateY(-100%)`, bottom row `translateY(100%)` — each with staggered delay `0s, 0.05s, 0.1s, 0.15s, 0.2s`
- Duration: 1s, easing `cubic-bezier(0.96,-0.02,0.38,1.01)`, fill forwards
- Box color: `#75C5DE`
- At `animation-delay: 1.35s`, fade out the entire splash wrapper to `opacity: 0; visibility: hidden`

## Navigation
### Logo (fixed top-left)
- `position: fixed; top: 30px (40px md+); left: 0; width: 50%; z-index: 10; mix-blend-mode: difference`
- Padding-left: `20px (40px md+)`
- Logo: `<img src="https://framerusercontent.com/images/VMcS7YYTM5PXfXvlHc9u3hSCMM.svg" width="32" height="32" />`

### Burger Button (fixed top-right)
- `position: fixed; top: 16px (27px md+); right: 0; width: 50%; z-index: 10; justify-content: flex-end`
- Padding-right: `20px (40px md+)`
- Button: `width: 59px; height: 59px; border-radius: 50%; background: #F4F1E8`
- Two bars (`24×2px`, bg `#111111`), gap 4px
- Hover: bg `#0B0B0B`, bars turn `#F4F1E8`
- Open state: bg `#0B0B0B`, bars rotate to X (`45deg / -45deg`)

### Menu Panel
- `position: fixed; z-index: 9; left: 8px; right: 8px; border-radius: 20px; background: rgba(17,17,17,0.95); backdrop-filter: blur(26px)`
- Padding: `90px 32px 32px` (60px all on md+ with fixed width `420px`, right `7px`)
- Slide in from `top: -600px; opacity: 0` to `top: 0 (7px md+); opacity: 1` on open — transition `0.5s cubic-bezier(0.25,0.46,0.45,0.94)`
- Nav links: "Work", "About", "Blog" — `font-size: 36px (42px md+); font-weight: 500; color: #F4F1E8`, hover `opacity: 0.7`
- Below nav: email link `studio@norakessler.com` (color `#9A9590`, hover `#F4F1E8`) + social links "Pinterest", "Behance", "Letterboxd" (same style, underlined)
- CTA button "Let's talk": pill shape with expanding white bg, cyan circle with arrow icon — same mechanic as hero CTA but smaller (38px circle, font-size 14px, padding `8px 40px`)

## Hero Section
- `position: relative; width: 100%; background: #E4E4E4; min-height: 100vh (height: 100vh on md+)`

### Big Background Text
- `position: absolute; bottom: -30px (-40px md+); left: 0; right: 0; z-index: 2; text-align: center`
- `<h2>Visuals</h2>` — `font-weight: 500; color: #F4F1E8; line-height: 80%; letter-spacing: -0.04em; font-size: clamp(180px, 28vw, 560px)`
- Slide-up entrance: `translateY(330px)` → `translateY(0)`, duration 1s, easing `cubic-bezier(0.16,1,0.3,1)`, delay 1.5s

### Base Image Layer
- `position: absolute; top: 30vh (0 on md+); left: 0; right: 0; bottom: 0; z-index: 5`
- `background-image: url('https://soft-zoom-63098134.figma.site/_assets/v11/5c9f982199fde1d9b85a20e5396f0fa7bacaf9a3.png?w=2560')`
- `background-size: cover; background-position: 60% center (center on md+)`
- Entrance: `opacity: 0; transform: scale(1.5) rotate(3deg)` → `opacity: 1; transform: scale(1) rotate(0)`, duration 1.2s, easing `cubic-bezier(0.25,0.46,0.45,0.94)`, delay 1s

### Reveal Image Layer (spotlight)
- Same positioning as base image, `z-index: 7; pointer-events: none`
- `background-image: url('https://soft-zoom-63098134.figma.site/_assets/v11/6be2165e31648955b4e071f4cf2a50bc572b9bfd.png?w=1536')`
- Masked via canvas-based radial gradient (see Spotlight section)

### Hero Content
- On mobile: `position: relative; z-index: 8; padding: 110px 16px 24px`
- On desktop: `position: absolute; inset: 0; z-index: 8; padding: 160px 40px 100px`
- Headline `<h1>`: `font-size: 22px (28px md+); font-weight: 500; line-height: 120%; letter-spacing: -0.02em; color: #111111; max-width: 447px`
  - Text: "I build compelling visual stories & motion that make ideas shine."
  - **Word-by-word reveal**: split on spaces, wrap each word in `<span class="word-reveal">` with staggered `animation-delay: 1 + i*0.05s`
  - Each word: `opacity: 0 → 1; translateY(10px → 0); blur(10px → 0)`, duration 0.4s ease

### CTA Button "Start a project now"
- Pill shape: `border-radius: 9999px; padding: 8px; gap: 12px; background: none; border: none`
- Inner white bg span: `position: absolute; top: 5px; bottom: 5px; left: 8px; width: calc(100% - 8px - 8px - 48px(54px md+) - 12px); border-radius: 9999px; background: white`
- On hover: width expands to `calc(100% - 16px)`, transition `0.4s cubic-bezier(0.25,0.46,0.45,0.94)`
- Text "Start a project now": `color: #111111; font-weight: 500; font-size: 16px (18px md+); padding: 12px 32px (16px 40px md+)`
- Right circle: `width: 48px (54px md+); height: 48px (54px md+); border-radius: 50%; background: #75C5DE` with diagonal arrow SVG (white, strokeWidth 2)
- On hover: circle `translateX(-7px)`
- Entrance: `opacity: 0; translateY(60px) scale(0.4)` → visible, duration 0.8s, `cubic-bezier(0.25,0.46,0.45,0.94)`, delay 1s

## Spotlight Reveal Effect
- Hidden `<canvas id="reveal-canvas">` (absolute, inset 0, pointer-events none)
- Radius: `SPOTLIGHT_R = 260`
- `requestAnimationFrame` loop: smooth mouse toward cursor with factor 0.1
- Each frame:
  - Clear canvas
  - `createRadialGradient(sx, sy, 0, sx, sy, 260)` with stops: `0→rgba(255,255,255,1)`, `0.4→1`, `0.6→0.75`, `0.75→0.4`, `0.88→0.12`, `1→0`
  - Draw arc and fill
  - Convert to `toDataURL()` and apply as `webkitMaskImage` + `maskImage` with `maskSize: 100% 100%` on the reveal image layer
- Initial mouse position off-screen `{ x: -999, y: -999 }`

## Responsive Breakpoints
- `<768px` = mobile: single column, hidden nav links, hero top padding 110px
- `≥768px` = desktop: hero fills 100vh, menu panel anchored right

## Accessibility
- `@media (prefers-reduced-motion: reduce)`: disable all animations, set final states immediately

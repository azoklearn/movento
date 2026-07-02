## Veldara Hero Prompt

Build a scroll-driven video hero page for "Veldara" using vanilla HTML, CSS, and JavaScript (no frameworks). The page features a scroll-scrubbed background video, animated particles, fixed cards that reveal on scroll, and a section-three fade-in.

## Tech Stack
- Vanilla HTML + CSS + JavaScript (no frameworks)
- Google Font: `Inter` weights 400, 500, 600, 700 (via Google Fonts link)

## Global CSS Reset
```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body { overflow-x: hidden; }
body { font-family: 'Inter', sans-serif; background: #010101; color: #fff; }
```

## Scroll Video Background
- `#scroll-video-container`: `position: fixed; inset: 0; z-index: -10; background: #0a0a0a; top: -20%`
- Contains a `<canvas id="video-canvas">` and `<video id="video-fallback">` (both `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`) plus a dark overlay `rgba(0,0,0,0.2)`
- Video URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4`
- On page load, fetch the video as a blob, create an `<video>` element, and extract frames using `createImageBitmap` at `Math.max(30, Math.min(120, Math.round(duration * 24)))` frames. Scale frames to max 1280px wide. Store as an array of `ImageBitmap`.
- `getProgress()` maps `scrollY` from `[vh*0.5 … documentHeight-vh]` to `[0…1]`
- Each `requestAnimationFrame`, map progress to frame index and `drawImage` onto canvas (cover-fit: `scale = max(cw/fw, ch/fh)`, center-offset)
- Fallback: if frame extraction fails, use `videoEl.currentTime = progress * duration` via seeked events
- On resize: update canvas pixel dimensions with `devicePixelRatio` (capped at 2), reset `lastFrameIndex`

## Particles
- `<canvas id="particles-canvas">`: `position: fixed; inset: 0; pointer-events: none; z-index: 3`
- Particle count: `Math.floor((width * height) / 12000)`
- Each particle: `{ x, y, vx: ±0.3, vy: ±0.3, size: 0.5–2, opacity: 0.2–0.8 }`
- Each frame: clear, move, wrap edges, draw white circles
- Re-create particles on resize

## Navigation
- `position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2.5rem`
- Left: logo text "veldara" (font-weight 700, 1.25rem, letter-spacing -0.025em)
- Center: nav links "Guides", "Journal" (hidden on mobile `<768px`)
- Right: social icon links — GitHub, Discord, Twitter SVG icons (1.25rem, color #d1d5db, hover white)

## Hero Section
- `position: relative; height: 100vh; display: flex; flex-direction: column`
- Gradient overlay: `background: linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)`
- Content: `position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; padding: 0 1.5rem 6rem`
  - Subtitle: "Our Purpose:" — `font-size: 0.875rem; color: #9ca3af; margin-bottom: 1rem; letter-spacing: 0.05em`
  - `<h1>`: `font-size: clamp(1.5rem, 5vw, 3.75rem); font-weight: 600; line-height: 1.15; max-width: 48rem`
    - Text: `Instantly craft immersive <span class="underlined"><span class="line"></span><span>3D worlds</span></span> on the web.`
    - `.underlined .line`: `position: absolute; bottom: 0.25rem; left: 0; width: 100%; height: 10px; background: #2C5C88; border-radius: 2px`
  - CTAs row: flex, gap 1rem, margin-top 2.5rem, wrap, center
    - Code box: dark bg `#1a1a1a`, border `rgba(55,65,81,0.5)`, rounded-lg, padding `0.875rem 2rem` — shows blue `>` prompt + `npm i @veldara/core` in monospace
    - CTA button: `background: #2C5C88`, white text, rounded-lg, `padding: 0.875rem 2rem`, "Get Started →", hover `#3a7aad`
- Bounce arrow: centered chevron-down SVG, color #6b7280, CSS bounce animation

## Fixed Cards (scroll-triggered)
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 4; padding: 2rem 2.5rem`
- Inner grid: `max-width: 72rem; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem` (1 col on mobile)
- Cards:
  1. **Explore Veldara** — "Veldara merges the elegance of Svelte 5 with the depth of Three.js within easy reach. It's crafted to be robust and adaptable while remaining intuitive and simple to grasp."
  2. **Unlock Three.js** — "The web is growing increasingly dimensional. At its heart, Veldara offers a composable declarative API for building performant Three.js experiences on the web."
  3. **Connect Everything** — "Veldara ships with tooling for physics, XR, animation, layouting, model loading, and extensive utilities to make building compelling 3D apps for the web effortless."
- Card h3: `font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 1rem`
- Card p: `color: #d1d5db; font-size: 0.875rem; line-height: 1.6`
- Visibility: `opacity: 0; pointer-events: none` by default; animate in/out based on scroll position within `#cards-trigger` zone
- Reveal mask: on desktop `linear-gradient(to right, black X%, transparent X+15%)`, mobile `linear-gradient(to bottom, ...)` where X = `progress * 130`
- Fade in/out smoothly using `fadeIn` and `fadeOut` computed from scroll proximity to trigger zone

## Page Structure (scroll spacers)
```html
<section id="hero">…</section>
<div style="height:150vh;"></div>
<div id="cards-trigger" style="height:200vh;"></div>
<div style="height:100vh;"></div>
<section id="section-three">…</section>
```

## Section Three
- `position: relative; min-height: 100vh; display: flex; align-items: flex-end; justify-content: center; padding: 0 2.5rem 8rem`
- Inner div: starts `opacity:0; transform: translateY(32px); filter: blur(8px)`, transitions to visible on IntersectionObserver (`threshold: 0.15`)
- Content: `<p>Presenting</p>` + `<h2>Veldara 8</h2>` (font-size `clamp(1.875rem, 6vw, 4.5rem)`, font-weight 700)

## Hero Fade on Scroll
- `document.getElementById('hero').style.opacity = Math.max(0, 1 - scrollY / (innerHeight * 0.3))`

## Color Palette
- Background: `#010101`
- Accent blue: `#2C5C88`
- Text muted: `#9ca3af`, `#d1d5db`
- White: `#fff`

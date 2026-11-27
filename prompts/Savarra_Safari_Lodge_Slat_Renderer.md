# Savarra — Safari Lodge Investment: full build prompt

Build a three-section, scroll-driven landing page for a fictional safari-lodge investment called **SAVARRA**. The page is one `index.html` (inline CSS + JS) plus self-hosted fonts. Every image and clip loads straight from the Higgsfield result URLs listed below. The signature effect is a **WebGL "slat" renderer** that redraws photos and videos as rows of vertical lines whose width follows brightness. Everything below must be reproduced exactly.

---

## 1. Stack, libraries and global settings

- Load in this order from jsDelivr:
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js`
  - `https://cdn.jsdelivr.net/npm/lenis@1.3.15/dist/lenis.min.js` (plus `lenis.css` from the same folder in `<head>`)
- `gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)`, `gsap.config({ nullTargetWarn:false })`.
- Custom eases (copied from the reference site):
  - `InOut` = `0.76,0,0.24,1`
  - `Out` = `0.25,1,0.5,1`
  - `In` = `0.5,0,0.75,0`
- Timing constants: `durS = .4`, `durL = 1.2`, `stagger = .1`, `delayReveal = .2`.
- **Lenis** smooth scroll:
  - options: `duration 1.2`, `smoothWheel true`, `touchMultiplier 2`, `easing t => min(1, 1.001 − 2^(−10t))`, `infinite false`, `autoRaf false`
  - drive it from `gsap.ticker.add(t => lenis.raf(t*1000))`, with `gsap.ticker.lagSmoothing(0)` and `lenis.on("scroll", ScrollTrigger.update)`
  - all in-page `#` links call `lenis.scrollTo(target, { duration:1.6 })`
- Breakpoint `BP = 992` px. Desktop = `innerWidth ≥ 992`. Crossing the breakpoint on resize reloads the page.
- `prefers-reduced-motion: reduce` disables:
  - Lenis, every scroll scrub and every loop
  - the dolly scrub
  - the slat draw-ins: slat layers are shown at their final levels
  - the bird flights: birds are parked in place
  - the equaliser animation on the sound icon (it shows static bars)
- Start everything only after the fonts are loaded:
  - wait on `document.fonts.load('700 100px Syncopate')`, `('600 40px "Cormorant Garamond"')` and `('20px "Krona One"')`
  - then call `initScrollVideo → initHeroMotion → initScenes → initWhy → initText → initMagnetic`, then `ScrollTrigger.refresh()`

## 2. Fonts (self-hosted latin woff2 in `assets/fonts/`)

| Role | Family / weight | Source |
|---|---|---|
| Serif quote + section title + nothing else | Cormorant Garamond 600 | https://fonts.google.com/specimen/Cormorant+Garamond (latin woff2) |
| All small caps labels, nav, buttons, info row, badge | Krona One 400 | https://fonts.google.com/specimen/Krona+One |
| Nav logo + the giant slat wordmark (drawn into a canvas) | Syncopate 700 | https://fonts.google.com/specimen/Syncopate |

CSS custom properties:
- `--serif: "Cormorant Garamond", Georgia, serif`
- `--label: "Krona One", Arial, sans-serif`
- `--wide: "Syncopate", Arial, sans-serif`

`.lbl` = Krona One, uppercase, letter-spacing `.06em`. Every small text uses `max(11px, …)` so nothing is ever under 11 px.

## 3. Colours

| Token | Hex | Use |
|---|---|---|
| `--dark` | `#120c07` | page background, prologue, hero shadows, slat bars on sand |
| `--deep` | `#29190c` | (palette) |
| `--stage` | `#edd9cf` | cream stage of section 3, slat band fill |
| `--cream` | `#f0e2d4` | text on dark, slat bars on dark, wordmark |
| `--ember` | `#c9926a` | "Consultation" pill |
| `--clay` | `#6d4638` | (palette) |
| `--ink` | `#1c120a` | section-3 text |
| sand | `#c09272` | background of the hero scroll area, slat stage around the shrinking hero |
| slat ink | `#29190c` | bars in section 3 |
| label brown | `#3a2618` | "UNIQUENESS" label |

Palette name: "Campfire umber".

## 4. Layout unit

- `--u: min(100vw/1440, 100vh/900)`. Every desktop size is `calc(N * var(--u))`, measured on a 1440×900 frame.
- Below 992 px: `--u: 100vw/390`, or `100vh/390` in landscape.

## 5. Assets (use these exact URLs; never re-host)

Image wrapper: `https://images.higgs.ai/?default=1&output=webp&url=<encodeURIComponent(result_url)>&w=2048&q=90`.
Base `CF = https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/`.

| Key | Kind | URL (append to CF) | What it is |
|---|---|---|---|
| dolly | video 1280×720, 24 fps, 5 s | `hf_20261127_075326_45e42d39-00f4-4c74-9c90-5ba233fb43f4.mp4` | Kling 3 camera dolly forward through the lodge courtyard |
| herd | video 1276×720, loop | `hf_20261127_075332_3402758d-81b7-4c2f-a15e-4af2c1d39f3b.mp4` | three giraffes walking + one acacia, on pure black |
| grow | video 720×1280, play once | `hf_20261127_075342_e4d5673d-dce5-4f3a-bbf6-b954479997e2.mp4` | acacia growing from a sapling to a full tree, on black |
| egrets | video 960×960, loop | `hf_20261127_075346_035c9c3b-fa18-4c20-8e09-5b3ab8ae5c0b.mp4` | seven white egrets flapping in place, on black |
| plate | image (wrapper, `w=1400`/`2048`) | `hf_20261127_075131_03af1295-d235-4be2-98ac-3762e8b10de0.png` | hero still (courtyard, no UI) |
| acacia | image | `hf_20261127_075134_28bc20a4-7a98-45c6-8c50-9ab46dfa7187.png` | single acacia on black, 1360×2048 |
| hills | image | `hf_20261127_090756_1f4f07e2-2ea7-49d7-b623-a0587dd288f5.png` | misty layered savanna hills, ground near-black at the bottom, sky pure black, 4:3 |
| ridge | image | `hf_20261127_090759_edf571ce-eb55-4986-96dd-4ece3a90470a.png` | one pale distant ridge band on black, 4:3 |
| huts | image | `hf_20261127_090801_6b5e67c6-077f-4ba6-9179-86abaebda375.png` | two thatched rondavels on black, 1:1 |
| cloud | image | `hf_20261127_090805_2a28cc34-c9b1-448e-aba8-6abc89cc2de6.png` | one soft cumulus on black, 3:2 |
| cards | image 2048×2048 2×2 sheet | `hf_20261127_075144_175f1302-11c1-4f72-b7ef-35320b7d50e1.png` | TL tented suite, TR outdoor stone bath, BL fire-pit lounge, BR deck (unused) |

All clips are `muted`, `playsinline` and `crossOrigin="anonymous"`, with `preload="auto"`. The Higgsfield CDN sends `Access-Control-Allow-Origin: *`.

## 6. The slat renderer (`slatCanvas(canvas, layers, { bg, fill })`)

A port of the reference site's `initCanvasEffect`. One WebGL context per canvas:
- context options: `alpha:true`, `antialias:false`, `premultipliedAlpha:false`
- blending: `SRC_ALPHA, ONE_MINUS_SRC_ALPHA`
- canvas sizing: device-pixel ratio capped at **1.5**; the canvas is sized by a ResizeObserver
- frame rate: renders at 60 fps only while the canvas is within 20% of the viewport (IntersectionObserver, `rootMargin "20% 0px 20% 0px"`)

**Layer definition:**
- `{ type:"image"|"video"|"canvas", src|el, uv?, flipX?, flipY?, loop?, cut?, fade?, config }`
- config defaults:
  - levels: `gamma 1, blackPoint 0, whitePoint 255, threshold 255`
  - grid: `xSquares 100, ySquares 100`
  - bar width range: `minSquareWidth "-2%", maxSquareWidth "102%"` (of one cell)
  - rect: `x 0, y 0, width "100%", height "100%"`, where `%` is of the canvas and `vw` is relative to the canvas CSS width
  - `bgOpacity 1, fillOpacity 1`

**Grid averaging (essential for the smooth look):**
- Before upload, draw the source down to `(xSquares×3) × (ySquares×3)` px.
- Use repeated halving with `imageSmoothingQuality "high"`, on a black background, so each cell reads one averaged tone.
- Videos are re-averaged into the same small canvas every time `currentTime` changes, and then re-uploaded.

**Fragment shader, per pixel:**
1. Discard outside the layer rect (bounds in GL pixels; `y` flipped: `by = H − y − h`).
2. `lc = local 0..1` position. Cell index `ci = floor(lc·grid)`, cell centre `cc0 = (ci+.5)/grid`. Apply `flipX` / `flipY`, then sample the texture at the cell centre.
3. Discard if alpha `< .01`, or if `r, g, b` are all `< cut`:
   - `cut` = `.035` for images, `.01` for videos, `.003` for the hills, so their near-black ground still draws.
   - Also discard if any of the 8 neighbouring texels (1 texel radius) fails the same test. This erodes ragged edges.
4. Levels: `rgb = clamp((rgb·255 − blackPoint)/(whitePoint − blackPoint))`, with optional `pow(rgb, gamma)` first. Brightness `br = avg(rgb)·alpha`.
5. Optional bottom fade: `br = mix(br, 1, 1 − smoothstep(0, fade, lc.y))`.
6. If `br > threshold/255`, paint `bg`.
7. Otherwise the bar width is `lw = ((1−br)·(maxW−minW) + minW)`, in cells. Paint `fill` where `|cellLocalX − .5| < lw/2`, else `bg` (with `bgOpacity`).

Result: dark tones become wide bars and bright tones thin bars. Inverting the levels (`blackPoint > whitePoint`) flips that. Tweening `blackPoint/whitePoint` from `256/255` (nothing drawn) to the final values makes the art "draw itself in".

**Shared clips:**
- Each video URL gets exactly **one** `<video>` element, shared by every canvas that uses it. This avoids Chrome's 6-connection stall.
- Playback is reference-counted: a clip plays while at least one canvas using it is on screen and pauses when none are.
- A clip with `loop:false` plays once, then holds its last frame.
- A layer whose clip arrives late still appears when it lands. The 8 s timeout only stops the canvas waiting for it.

## 7. Section 1 — Hero (scroll area `400vh`, background sand `#c09272`)

**Structure:**
- `.hero-scroll-area` (relative, 400vh)
  - `.hero-w` (sticky, top 0, 100vh, overflow hidden, z 1) holding a `<canvas class="hero-video">` and the overlay `.hero-s`
  - `.intro-bg` scene: absolute, `top 200vh`, `height 200vh`, z 0, desktop only
  - `.intro-over` scene: same box, z 2

**Background camera move (scroll-scrubbed image sequence):**
- **Poster:** paint the plate image immediately, cover-fit. Use the crop 40/2048 from the top and 1152/2048 tall, so it matches frame 0 of the clip.
- **Caching:** load the dolly clip, play it once muted, and on every `requestVideoFrameCallback` grab the frame into a canvas.
  - Store it as a JPEG blob (`quality .9`) at index `round(mediaTime·24)`, for 120 frames.
- **Scrub:** `gsap.to({f:0}, { f:119, snap:"f", ease:"none", scrollTrigger:{ trigger:area, start:"top top", end:"75% bottom", scrub:.25 } })`.
  - Each update paints the nearest cached frame, cover-fit into the canvas, at DPR up to 2.
- **Below 992 px:** hide the canvas and show the plate `<img>` (`object-fit:cover`).
- **Bottom scrim:** `.hero-s:before` = `linear-gradient(to top, rgba(18,12,7,.62) 0%, rgba(18,12,7,.38) 26%, transparent 52%)`.

**Overlay content (desktop sizes in `u`):**

- **Nav** (absolute, `top 30u`, `height 40u`, padding `0 36u 0 28u`, flex space-between):
  - **Left** (gap 42u):
    - burger: two 30u-wide lines, 2u thick, 13u apart (border-top and border-bottom of one box), followed by the text "MENU" with a 14u gap
    - "ABOUT"
    - both links are 13u Krona One and go to `#prologue`
  - **Centre:** "SAVARRA" in Syncopate 700, 30u, letter-spacing .01em, linking to `#top`.
  - **Right** (gap 26u):
    - "EN" in 13u Krona One
    - a pill "CONSULTATION": height 35u, padding 0 22u, radius 999, background `#c9926a`, cream text 12.5u, linking to `#prologue`
- **Label** "INVESTMENT PROJECT": absolute, `left 52u`, `top 132u`, 22u Krona One, letter-spacing .09em.
- **Giant wordmark:** `<canvas>` in `.wordmark-w`.
  - box: `left 50%`, `translateX(-50%)`, `bottom max(176u, 8px)`, `width 980u`, `height 182u`
  - `filter: drop-shadow(0 3u 14u rgba(10,6,3,.55))`
  - **Texture (2400×440):**
    1. Black fill. Draw "SAVARRA" in white Syncopate 700 300 px on baseline 352, scaled to 98% of the width horizontally and ×1.08 vertically.
    2. Split into `cols` columns (desktop 240, mobile 150). Each column gets a random brightness `.7–.9` (seeded LCG, `seed 7`, `×16807 mod 2147483647`).
    3. Each column also gets random drips: up to 60 px above its top-most letter pixel and up to 90 px below its bottom-most, each `rand·rand`. Drips are a centred stripe 34% of the column wide.
  - **Render:** with the slat shader, `xSquares = cols`, `ySquares 60`, `blackPoint 255`, fill cream, `bgOpacity 0`.
  - **Load-in:** tween `whitePoint` from `255.5 → 0` over **1.6 s**, delay **.35 s**, ease `Out`. The lines grow in.
- **Badge:**
  - circle: `146u`, `left calc(50% − 58u)`, `bottom max(372u, 18px + 182u)`, border 1.5u `rgba(240,226,212,.9)`
  - text "INVEST IN / SAVARRA", 12u, line-height 1.35, links to `#prologue`
- **Info row:**
  - box: absolute, `left 425u`, `right 10u`, `bottom 52u`, three equal columns, centred text
  - columns:
    - "PRIVATE LODGE / SOUTHERN PLAINS"
    - "LONG-TERM VALUE / SUSTAINABLE STAYS"
    - "EXCLUSIVE ACCESS / LIMITED OWNERSHIP"
  - type: titles 13.5u, sub-lines 9.5u (min 11 px), letter-spacing .06/.08em, sub-lines at 90% opacity
  - 1.5u cream dividers before columns 2 and 3, extending 6u above and below
- **Sound icon:**
  - fixed `left 18u`, `bottom 22u`, five 2u bars
  - CSS `eq` keyframes (height 25% → 100%, 1 s ease-in-out, infinite alternate), delays −.3/−.6/−.15/−.45 s
  - click toggles `.off`, which pauses the animation; the bars turn ink-coloured while section 3 is on screen

**Load animations:**
- **Label:** split into words; each word pops from `scale 0`, opacity 0 and `yPercent` wrap `[−150, 75, −75, 150]` to rest. Duration 1.2 s, delay .25 s, stagger `.025` from random, ease `Out`.
- **Nav and info row:** `from yPercent 60, opacity 0`, 1.2 s, delay .3 s, stagger .1, ease `Out`.
- **Badge:** `from scale 0, rotate −25°, opacity 0`, 1.2 s, delay .5 s, ease `Out`.

**Scroll motion (desktop, original numbers):**
- Label + wordmark: `yPercent −100, scale .5, opacity 0`. Scroll range `start "top top"`, `end "50% bottom"`, `scrub .25`, ease none.
- From `"70% bottom"` to `"bottom bottom"` (`scrub 1`):
  - the whole `.hero-w` scales to **.3** (ease `Out`, duration 1): the hero shrinks into a small window over the sand
  - `.hero-s` fades to 0 over the first third
- Mobile:
  - label + wordmark: `yPercent −60`, fade out
  - from `50% bottom` to `bottom bottom`: the hero scales to .55

**Magnetic buttons** (MENU, CONSULTATION, badge; hover-capable devices only):
- On mousemove, move the button by 35% of the cursor offset and rotate it `dx·4°`, `.6 s power3.out`.
- On leave, return with `1.2 s elastic.out(1, .3)`.

**`.intro-over` slat scene:**
- Colours: background sand, bars dark. Canvas = 100vw × 200vh.
- Layers (% of that canvas):
  1. hills: `x 0, y 40%, w 100%, h 60%`, BP 25 / WP 200, `cut .003`
  2. huts: `x 56%, y 66%, w 14%, h 12%`, BP 25 / WP 200
  3. acacia (desktop only): `x 70%, y 42%, w 43.5%, h 52%`, BP 55 / WP 175, grid 150×100
  4. herd video: `x 0, y 72%, w 72%, h 32%`, BP 15 / WP 255, grid 200×150
  5. cloud (desktop only): `x 5%, y 25%, w 65%, h 45vw`, gamma .55, BP 25 / WP 255
  6. egrets video: `x −33.33%, y 30%, w 33.33%, h 33.33vw` (66.66 on mobile), BP 255 / WP 0 (inverted)
- Scroll motion:
  - `start "50% bottom" → end "bottom top"` (scrub): hills levels to 45/175 and huts to 75/150
  - cloud `x → −30%` from `"top bottom"` to `"bottom 50%"`
  - egrets loop: `x → 100%` over 5 s, linear, delay 5, repeat ∞, repeatDelay 5, running only while on screen
- The hills' near-black ground draws as solid dark bars, so it melts seamlessly into the dark prologue below.

**`.intro-bg` slat scene (desktop):**
- Colours: background sand, bars dark.
- Layers:
  - ridge: `x 0, y 45%, w 100%, h 60%`, BP 0 / WP 255
  - cloud (flipX): `x 30%, y 0, w 65%, h 45vw`, gamma .55
  - egrets: `x −33.33%, y 0, w/h 33.33%/33.33vw`, inverted
- Motion: cloud `x → 60%` on scroll, plus the same egret loop.

## 8. Section 2 — Prologue (`#prologue`, height 118vh, background `#120c07`, z 3)

**Slat scene** (full section canvas, background dark, bars cream, all videos inverted BP 200 / WP 25):
- **Left acacia:** `grow` clip, play-once: `x −8%, y 8%, w 36%, h 90%`, grid 125×150.
- **Right acacia:** same clip with flipX: `x 62%, y 40%, w 24%, h 58%`.
- **Giraffes:** `herd` loop: `x 8%, y 52%, w 50%, h 38%`, grid 200×120.
- **Egrets:**
  - layer: `w 20%`, `h 20vw`, `y 39%`, BP 255 / WP 0, grid 140×140
  - they **fly forward** with a GSAP timeline: `x −20% → 100%`, 7 s, linear, `repeat −1`, `repeatDelay 2`
  - the flight plays only while the section intersects (mobile: `x −50%`, `y 40%`, `50%/50vw`, 5 s)
- Mobile positions:
  - left tree `−22/52/70/48`
  - right tree `52/64/52/36`
  - herd `−4/72/92/26`

**Copy:**
- **Quote:**
  - text: "WHERE THE PLAINS STRETCH GOLD TO THE EDGE OF THE SKY AND THE NIGHT FIRE GATHERS OLD STORIES, SAVARRA OPENS A DOOR TO THE WILD THAT NEVER CLOSES"
  - Cormorant Garamond 600, uppercase, 47u, line-height 1.03, letter-spacing −.005em, cream
  - right-aligned in a 600u box at `right 52u`, `top 110u`
  - **Highlight:** SplitText into chars. Animate `from opacity .1` over the timeline `start "top 75%"`, `end "bottom 60%"`, scrubbed, stagger .1, ease `Out`. The quote lights up letter by letter as you scroll.
- **Label "··· PROLOGUE ···":**
  - absolute, bottom 30u, centred
  - small caps 11.5u; the dots are `• • •` pseudo-elements with a 14u gap
  - reveals word-pop once (`start "top bottom"`)

**Slat band strip** (`.band-strip`, 26vh tall, 16vh on mobile, dark):
- A canvas whose texture is a 600×200 per-column vertical gradient: `rgb(4,4,4) → rgb(60,60,60)` at a wavy height → white at the bottom.
  - wavy height = `.6 − lift·.4`, where `lift = .5 + .3·sin(i/600·2.2π + 1.3) + rand·.12`, seeded with 11
- Rendered as cream (`#edd9cf`) bars on the dark: grid 150×40, inverted levels.
- Cream bars rise and thicken toward the bottom, turning the dark into the cream of section 3 (the reference site's transition art).

## 9. Section 3 — Why Savarra captivates (`#why`, 300vh, background `#edd9cf`)

**Structure:**
- `.why-sticky` (sticky, 100vh, overflow hidden) containing:
  - a full-bleed slat canvas (bars `#29190c` on the cream, `bgOpacity 0`)
  - a `.why-frame` of `1440u × 790u`, centred with translate(−50%,−50%)

**Frame content (mockup positions, in u):**
- **Label "··· UNIQUENESS ···":**
  - absolute at `left 172u` inside the title block
  - colour `#3a2618`, 11.5u
  - word-pop reveal
- **Title:**
  - block at `left 215u`, `top 400u`, `transform-origin 40% 60%`
  - `<h2>` 42u below the label: Cormorant Garamond 600, 90u, uppercase, line-height .74, letter-spacing −.012em
  - line 1 "WHY SAVARRA"; line 2 "CAPTIVATES" indented 107u
- **Cards** (absolute `<a>`):
  - styling: background = the cards sheet at `background-size 204% 204%`; shadow `0 10u 30u rgba(60,35,15,.22)`
  - each card has a 36u round arrow button 14u from the bottom-right corner (1.5u white ring, chevron drawn with two borders)
  - c1 tented suite: `left 628, top 93, 408×275`, bg-pos `1% 1%`, z 3
  - c2 stone bath: `left 1050, top 143, 275×182`, bg-pos `99% 1%`, z 2
  - c3 fire lounge: `left 964, top 340, 409×203`, bg-pos `1% 99%`, z 2

**Slat scene layers** (desktop rects in 1440×900 design units, converted live to % of the viewport; recomputed on resize):
- **Egrets:**
  - rect `[130, 102, 317, 316]`, grid 140, final levels BP 200 / WP 55
  - they **fly across** the whole viewport: `x −w% → 100%`, 7 s linear, repeat ∞, repeatDelay 2, while the section is visible
- **Top-right acacia:** the whole tree, flipX, rect `[1110, 35, 300, 452]`. Canopy at the top right, trunk behind the cards.
- **Bottom-left acacia:** the whole tree, rect `[15, 560, 200, 301]`, beside the title.
- Both trees: gamma .6, grid 170×150, final levels BP 30 / WP 235.
- All three start at BP 256 / WP 255, which draws nothing.

**Motion (desktop, scroll-scrubbed):**
- **Title:** `scale 0 → 1`, ease `InOut`, from `"top 70%"` to `"top −40%"`.
- **Draw-in:** egrets and trees tween to their final levels, linear, from `"top 80%"` to `"top −60%"`.
- **Cards:** one timeline from `"top top"` to `"bottom bottom"` (scrub). Cards are seeded (`seed 3`), for each card i:
  - **Random values:**
    - `r.x = (10·rand+20)·±1`
    - `r.y = 5·±1`
    - `r.rot = (5·rand+5)·±1`
  - **From:**
    - `x = viewportWidth − cardLeft + 40` (just off the right edge)
    - `xPercent = r.x`
    - `yPercent = r.y + 75 ± 15` (+15 for even i, −15 for odd)
    - `rotation = r.rot`
  - **To:** `x 0`, `xPercent 0`, `yPercent 0`, `rotation 0`, ease `Out`, duration 1, starting at `i·.45`.
  - A final `.35` hold.
  - Each card flies in tilted from the right and settles into the mockup layout.
- **Mobile:**
  - the section is not pinned; content flows: label and title, then the cards stacked full width at 3:2 (c2 at 78%, aligned right)
  - each card reveals from `scale 0, rotateY −90°, rotate −25°`, 1.2 s, delay .2, ease `Out`, `transformPerspective 1000`, `toggleActions "play none none reset"`
  - slat layers use % positions: egrets `52/0/46/18`, top tree `62/1/34/13`, bottom tree `2/86/30/12`

## 10. Small screens (< 992 px)

- **Unit:** `--u = 100vw/390` (`100vh/390` in landscape).
- **Hero:**
  - 200vh tall, showing the plate image
  - nav keeps the burger, logo and pill, and hides "ABOUT" and "EN"; logo 17u
  - label at `top 78u`, 13u
  - wordmark `358u × 70u`, 150 columns, at `bottom 34px + 92u`
  - badge 100u at `top 128u`, centred
  - info row at `bottom 34px` with 9u / 7.5u text
  - the hero shrinks to .55 on scroll
  - the `.intro-bg` scene is hidden; the `.intro-over` scene is 100vh tall starting at 100vh
- **Landscape phones:** wordmark left-aligned `330u × 46u`; badge 80u at top-right; label at `top 62u`.
- **Prologue:** auto height, padding `70u 0 330u`; the quote flows in normal order at 25u.
- **Sound icon:** moves to bottom-right.
- Every text is ≥ 11 px and every tap target ≥ 24 px.

## 11. Copy (exact)

- **Nav:** "MENU", "ABOUT", "SAVARRA", "EN", "CONSULTATION".
- **Hero:**
  - label "INVESTMENT PROJECT"
  - wordmark "SAVARRA"
  - badge "INVEST IN / SAVARRA"
  - info row "PRIVATE LODGE / SOUTHERN PLAINS", "LONG-TERM VALUE / SUSTAINABLE STAYS", "EXCLUSIVE ACCESS / LIMITED OWNERSHIP"
- **Prologue:** the quote in §8, plus "PROLOGUE".
- **Section 3:** "UNIQUENESS", "WHY SAVARRA / CAPTIVATES". Card labels (aria-label only): "Canvas suite", "Open-air bath", "Fire lounge".
- No cookie banner. No other sections. The page ends when section 3 finishes its card animation.

Build a one-screen landing hero for **Logios**, "a new school of ancient thought". The whole page is a single full-viewport stage: a brick-red field, cream type pinned to the corners, and in the centre a marble bust of a Greek philosopher rendered live as a dithered, 1-bit halftone that slowly turns like a sculpture on a turntable and spins when the visitor moves their pointer sideways. It should feel like a risograph print that happens to be alive: flat, two colours, precise, no gradients, no shadows, no rounded cards.

Plain HTML, CSS and vanilla JS with a raw WebGL canvas. No framework, no build step, no libraries. Three files (`index.html`, `css/style.css`, `js/hero.js`); the one image asset is loaded from the URL in section 1.

## 1. The bust asset (hosted, nothing to generate)

The bust is not a 3D model. It is a 360° turntable of a marble bust, packed into one sprite atlas and dithered in a shader. The atlas is already hosted; use this URL directly as the texture, do not download, regenerate or re-encode it:

```
https://res.cloudinary.com/ce2yatay/image/upload/logios/bust-atlas.webp
```

- 3456 × 3456 WebP, under 1 MB, greyscale: white marble on pure black.
- 144 frames in a 12 × 12 grid of 288px tiles, read left to right, top to bottom. Frame 0 is the front view; the 144 frames make exactly one full turn, so the last frame leads back into the first.
- Played forwards, the face turns toward the viewer's left. The design spins the other way, so step through the frames backwards.
- Inside each tile the bust is centred, the crown of the head sits 5.3% down from the top, the bust is about 63% of the tile wide (the head alone about 53%), and the chest runs off the bottom edge of the tile.
- The turn is not perfectly even: it eases in and out around the front view. Leave that as it is.
- The host sends `Access-Control-Allow-Origin: *`. Set `crossOrigin = 'anonymous'` on the `Image` before assigning `src`, otherwise WebGL will refuse it as a texture.

## 2. The stage

Reference frame is 1440 × 810; express sizes against the viewport so the composition keeps its proportions. The page never scrolls on desktop.

- **Colours.** Background `#962614`. Type and dither `#EFE6D5`. Muted labels are the cream at 56% opacity. One accent, amber `#FEB23B`, used only for the three 9px stat squares.
- **Type.** Geist (400/500/600) for display and body, Geist Mono (400/500) for nav and labels. Both from Google Fonts.
- **Edge padding** `clamp(18px, 2.6vw, 48px)` on all sides.

Elements, all absolutely positioned over a full-bleed `<canvas>`:

- **Nav**, top. Wordmark "Logios" left (14px, weight 500). Links PRODUCT, RESOURCES, BLOG, PRICING centred, mono 11px uppercase, ~3.2vw apart, with a 1px underline that wipes in from the left on hover. "SIGN IN" right: mono 11px uppercase in a 28px-tall, 1px cream outline, square corners, inverts to cream fill with red text on hover.
- **Headline** `<h1>`, top-left, starting ~15% down: "Thought" / "that lasts." on two lines. `clamp(46px, 5.4vw, 112px)`, weight 400, line-height 1, letter-spacing −0.052em.
- **Closing line**, bottom-right, same style, left-aligned within itself: "Reason" / "to endure".
- **Lede**, bottom-left, three short lines, ~15px weight 600: "A new school of ancient thought. / Where classical reason meets / modern precision".
- **Three stat markers** floating in the empty red, each an amber square, a bold 10px value and a 9px mono uppercase label in muted cream:
  - `0.002s` SOCRATIC ANSWER at left 89.3vw, top 21.6vh
  - `48.7K` QUESTIONS ANSWERED at left 84.8vw, top 42.6vh
  - `365d` ENDLESS / CURIOSITY at left 12.9vw, top 66.4vh

  The first two values flicker like instrument read-outs: latency alternates between 0.002s and 0.003s every ~1.4s, the count drifts randomly between 48.1K and 48.9K every ~1.9s. Use tabular figures so nothing jitters sideways.
- **The bust**, centred. Its square tile is about 1.04 × the stage height (capped at 0.72 × the width). The crown of the head lands ~8.5% down the stage, just under the nav; the beard ends around 83%; the chest bleeds off the bottom. The tile's own edges must never be visible.

**Load-in.** Headline lines rise out of an overflow mask (translateY 110% → 0, 1.1s, `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 90ms; the closing line follows ~350ms later). The lede and stats fade in after. The bust resolves out of the red over 1.6s, brightest dots first.

## 3. The dither shader

One full-screen triangle, one fragment shader, the hosted atlas uploaded as a single-channel `LUMINANCE` texture with linear filtering. Work in CSS pixels (divide `gl_FragCoord` by the device pixel ratio, capped at 2, and flip Y).

1. **Rotation.** A fractional frame index selects two neighbouring atlas tiles; sample both and mix by the fraction, so the turn is smooth rather than stepped. Clamp tile UVs slightly inside each tile to avoid bleeding.
2. **Grid.** Dither pixels are ~2.6 CSS px at 1440 wide (`width / 580`, clamped 2–4.5, snapped to device pixels). Each block takes its brightness from one sample at the block centre.
3. **Tone.** Before thresholding: unsharp-mask against four taps 2.4 blocks away (strength ~0.85) so the carving reads; stretch levels (black 0.07, white 1.06, gamma 1.1); inside the silhouette (raw brightness above ~0.08) never drop below 0.14 so the shadow side dissolves into a sparse stipple instead of vanishing; cap at 0.9 so highlights keep a lattice of red dots and never become a flat fill. The black backdrop must stay perfectly empty.
4. **Threshold.** 4 × 4 Bayer matrix indexed by block coordinate. Cream if brightness beats the threshold, red otherwise. Two colours only, no anti-aliasing.
5. **Texture zones.** A slow value-noise field, snapped to a lattice four blocks wide so borders stay blocky, splits the image into three textures that drift over time: plain Bayer (most of it), a "grain" zone where the threshold is 60% white noise, and a "coarse" zone where blocks are twice as large and drawn as tiles with a hairline red gutter.
6. **Pointer wake.** Keep the last 10 pointer positions (one every ~46px of travel), each fading over 1.5s. Near them the coarse zone is forced on, so the cursor leaves a trail of chunky pixels across the bust.

## 4. Motion and input

- Idle: the bust turns at ~24°/s, continuously.
- Pointer: horizontal travel adds rotation (0.22° per px) on top of the idle spin, eased with a critically damped follow so it feels weighted. Moving right should drag the visible surface to the right, which with this atlas means stepping backwards through the frames.
- Touch: horizontal drag does the same at double sensitivity.
- Pause the loop when the tab is hidden.
- `prefers-reduced-motion`: no idle spin, no load-in, no flickering stats; the bust is static and only follows the pointer.
- If WebGL is unavailable, leave the red stage and the copy: the page must still read.

## 5. Small screens

Below 760px wide, or whenever the viewport is taller than it is wide: hide the nav links (keep wordmark and SIGN IN); headline at `clamp(40px, 12.6vw, 68px)` starting 84px down; the three stats become one row directly under the headline with labels wrapping to two lines; the bust shrinks (tile = min(0.78 × height, 1.5 × width)) and its crown starts just below the stats row; the closing line sits right-aligned above the lede; a red gradient scrim over the bottom 46% of the stage keeps both legible over the chest. Nothing may overlap text illegibly at 375 × 812, 768 × 1024 or 1024 × 700.

## Done when

- At 1440 × 810 the page matches the composition above: red field, bust centred and turning, type in the corners, three amber markers.
- The bust reads clearly as a bearded marble head from every angle, with visible tonal modelling (solid-ish highlights, checkered mid-tones, sparse shadows), and the background around it is pure flat red.
- Moving the pointer left and right spins it in the matching direction and leaves a wake of larger pixels.
- No console errors, steady 60fps on a laptop, one image request for the bust.

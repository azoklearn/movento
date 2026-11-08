# Ciao Energy: 3D Can Carousel (exact recreation prompt)

## What it is

Build a single-page, scroll-driven **product site for an energy drink**, Ciao Energy, with six flavours. Use plain HTML, CSS and JavaScript in one `index.html`, with no framework and no build step. Load only these libraries from CDNs:
- **three@0.161.0** through an importmap
- **lenis@1.3.23**
- **GSAP 3.15** with ScrollTrigger and SplitText

The page is black.
- **3D scene:** a full-screen WebGL canvas sits behind everything. It shows a row of chrome-and-label 3D cans floating between two chrome podiums, one above and one below. The active can sits centred and tilted.
- **Flavour switching:** dragging or clicking the arrows slides the row and changes flavour. The UI then recolours to that flavour's two colours.
- **Scrolling:** scrolling never moves the DOM. Every section is a fixed layer. The scroll position scrubs **one GSAP timeline** that flies the camera and re-poses the cans through 11 stages: hero, profile, 4 benefits, "Zero Bullshit" video, packshot swirl, fly-out, fly-in and loop.
- **Infinite scroll:** past the footer, the page loops back to the hero.
- **Frame:** a thin mono HUD frames the screen, and a glowing progress line runs along the top.

## Media: every asset URL

**`BASE` = `https://cdn.jsdelivr.net/gh/azoklearn/ciao-energy-site@main/`**

Every path below is relative to `BASE`. jsDelivr serves them with CORS, which three.js needs. If you copy the files next to `index.html`, use the paths as relative URLs instead.

### 3D (three.js)
| Path | What |
|---|---|
| `assets/3d/can.glb` | The can. It contains a mesh named **`Shell`** (the printed label), plus the metal parts (lid, bottom). |
| `assets/3d/base.glb` | Two chrome podiums: `children[0]` is the floor ring, `children[1]` the ceiling ring. |
| `assets/3d/hdri2.hdr` | Studio HDRI, used as `scene.environment` through PMREM. |
| `assets/img/can-metallic-2.avif` | Metalness map, shared by can and label. |
| `assets/img/spot-mask.avif` | `map` (gobo) of the third spotlight. |

### Can labels (wrapped on `Shell`, in this order)
| # | Flavour | Texture |
|---|---|---|
| 0 | Double Litchi | `assets/textures/ciao-energy_texture_double-litchi.avif` |
| 1 | Coco Citron Vert | `assets/textures/ciao-energy_texture_coco-citron-vert.avif` |
| 2 | Kiwi Concombre | `assets/textures/ciao-energy_texture_Kiwi-Concombre.avif` |
| 3 | Pêche Blanche | `assets/textures/ciao-energy_texture_peche-blanche.avif` |
| 4 | Pomme Rhubarbe | `assets/textures/ciao-energy_texture_pomme-rhubarbe.avif` |
| 5 | Abricot Framboise | `assets/textures/ciao-energy_texture_abricot_framboise.avif` |

### Video (each one `.webm` first, then `.mp4`)
| Use | Path (no extension) |
|---|---|
| Loader (logo forming, plays once) | `assets/videos/Ciao-energy_loader-v2` |
| Flavour 0 background loop | `assets/videos/Ciao-energy_background_double-litchi` |
| Flavour 1 | `assets/videos/Ciao-energy_background_coco-citron` |
| Flavour 2 | `assets/videos/Ciao-energy_background_kiwi-concombre` |
| Flavour 3 | `assets/videos/Ciao-energy_background_peche-blanche` |
| Flavour 4 | `assets/videos/Ciao-energy_background_pomme-rhubarbe` |
| Flavour 5 | `assets/videos/Ciao-energy_background_framboise` |

### Images
- **Logo:** `assets/img/Ciao-Energy_logo.svg` (white, horizontal) and `assets/img/Ciao-Energy_logo-black.svg`.
- **Favicons:** `assets/img/Ciao_energy-fav-dark.png` and `assets/img/Ciao_energy-fav-light.png`.
- **Open Graph image:** `assets/img/Ciao-energy_meta-img.jpg`.
- **"Zero Bullshit" blur mask:** `assets/img/zero-bullshit-mask.svg`.

### Icons (inline them as SVG, `currentColor`)
| Path | viewBox | Use |
|---|---|---|
| `assets/icons/sound-bars.svg` | 14×8 | 4 rounded bars, sound toggle |
| `assets/icons/menu-dots.svg` | 8×8 | 5 dots, MENU button |
| `assets/icons/menu-emblem.svg` | 51×47 | emblem in the mobile menu |
| `assets/icons/arrow-prev.svg` / `arrow-next.svg` | 17×32 | dotted chevrons, carousel arrows |
| `assets/icons/pagination.svg` | 1000×40 | gooey gradient bar and dot (see Pagination) |
| `assets/icons/corner-tl.svg`, `corner-tr.svg`, `corner-bl.svg`, `corner-br.svg` | 9×9 | rounded corner brackets |
| `assets/icons/benefit-1-sucre.svg` … `benefit-4-stevia.svg` | ~20×25 | the 4 benefit nav icons |
| `assets/icons/zero-bullshit.svg` | 1314×405 | big "ZERO BULLSHIT" wordmark (paths) |
| `assets/icons/scroll-arrows.svg` | 35×146 | 3 stacked chevron groups (`svg > g` ×3), scroll hint |
| `assets/icons/faq-chevron.svg` | 24×24 | dotted chevron, FAQ |

### Sounds (Web Audio, volume .5)
| Key | Path | When |
|---|---|---|
| change | `assets/sounds/CIAO-ENERGY-defilementui.mp3` | flavour index changes |
| enter | `assets/sounds/CIAO-ENERGY-doubleclic-canette.mp3` | first scroll out of the hero, going down |
| benefits | `assets/sounds/CIAO-ENERGY-transition2.mp3` | arriving on a benefits section, or clicking a benefit icon |
| click | `assets/sounds/CIAO-ENERGY-Clickui.mp3` | MENU, menu links, FAQ questions |

## Fonts

| Family (CSS name) | File | Use |
|---|---|---|
| `Franklin Gothic Atf` (weight 900, italic) | `assets/fonts/LibreFranklin-BlackItalic.woff2` | All headings, uppercase |
| `Geist` (weight 300) | `assets/fonts/Geist-Light.woff2` | Body |
| `Geist` (weight 400) | `assets/fonts/Geist-Regular.woff2` | Body and buttons |
| `Geistmono` (weight 400) | `assets/fonts/GeistMono-Regular.woff2` | HUD |

- **Heading stack:** `"Franklin Gothic Atf", Arial, sans-serif`. Headings use `font-weight:500` in CSS, so the browser uses the face declared above.
- **Body stack:** `Geist, Arial, sans-serif`, weight 300, line-height 1.5.
- **Root size:** `html { font-size: clamp(0.875rem, 0.833vw, 1rem) }`. All sizes below are in rem.

## Tokens

```css
--black:#000; --white:#fff; --n-lightest:#eee;
--white-5:rgba(255,255,255,.05); --white-20:rgba(255,255,255,.2); --white-30:rgba(255,255,255,.3);
--white-50:rgba(255,255,255,.5); --white-60:rgba(255,255,255,.6); --white-80:rgba(255,255,255,.8);
--pad-global:4%;            /* side page padding */
--xxs:.5rem; --xs:clamp(.75rem,.65vw,1rem); --s:clamp(1.25rem,1.1vw,1.5rem); --m:clamp(1.5rem,1.4vw,2rem);
--l:clamp(2rem,2vw,3rem); --xl:clamp(2.5rem,2.8vw,4rem); --xxl:clamp(3rem,3.5vw,5rem);
--h:clamp(3.5rem,4vw,6rem); --xh:clamp(4rem,4.8vw,7rem); --xxh:clamp(5rem,6.5vw,10rem);
--nav-h:8rem; --radius-xs:.25rem; --radius-s:.5rem; --radius-m:1rem; --blur:2rem;
```

**Animated flavour colours.** Register these with `@property` so they can transition:

```css
@property --taste-primary   { syntax:'<color>'; inherits:true; initial-value:#959492; }
@property --taste-secondary { syntax:'<color>'; inherits:true; initial-value:#eeeeee; }
@property --loader-reveal   { syntax:'<length>'; inherits:true; initial-value:100vh; }
:root { transition: --taste-primary .6s ease-in-out, --taste-secondary .6s ease-in-out; }
```

**Flavour palette.** Set `primary` and `secondary` on `:root`, debounced 150ms after an index change.

| # | Flavour | primary | secondary |
|---|---|---|---|
| 0 | Double Litchi | #3D2B68 | #9089D3 |
| 1 | Coco Citron Vert | #27326B | #00A6E2 |
| 2 | Kiwi Concombre | #024A44 | #71BD96 |
| 3 | Pêche Blanche | #BA5200 | #EFB36B |
| 4 | Pomme Rhubarbe | #9B0984 | #E6A0E8 |
| 5 | Abricot Framboise | #800035 | #FF659D |

## Global layers

- **Body:** black, white text, `user-select:none`, antialiased, `-webkit-tap-highlight-color:transparent`.
- **`body::before`** (fixed, z −1, 100vh): `linear-gradient(9.02deg, #eee -30%, #959492 15%, #000 65%)`, with `transform:translateY(var(--loader-reveal))`. It slides up from below when the loader ends.
- **`body::after`** (fixed, z −1): `radial-gradient(88.85% 121.19% at 43.49% 112.49%, var(--taste-secondary) 4.96%, var(--taste-primary) 54.38%, #000 93.49%)`. Opacity is 0, and 1 when `body.is-profile-active` (transition .4s).
- **Canvas:** `position:fixed; inset:0`, appended to `<main>`, transparent clear colour.
- **Sections:** every `<section>` is an empty scroll spacer, `min-height:125svh; pointer-events:none`. Its visual content lives in `position:fixed; inset:0` containers that are shown and hidden by ScrollTrigger.
- **Section order** (11): gamme, profile, benefits-1, benefits-2, benefits-3, benefits-4, argument, full-gamme, faq (also holds the newsletter and footer), last-copy, last.

## 1. Loader

- **Container:** full-screen black, z 10000, flex centred.
- **Video:** `muted playsinline`, no loop, `width:24.1svh`, positioned at `top:49.2%; left:49.9%; transform:scaleX(.95) translate(-50%,-50%)`. It shows the vertical CIAO ENERGY logo turning from outline to chrome.
- **Percent:** `0%`, at the bottom (`bottom:var(--xh)`), `letter-spacing:1rem`. It follows `currentTime/duration·99`. If the video fails or doesn't start within 3s, fake it to 90% over 8s (`power1.out`).
- **Hidden at start:** `.gamme_container`, `.navbar`, `.hud` and the canvas, all `autoAlpha:0`. Scroll is locked (`overflow:hidden`, `lenis.stop()`, wheel and touchmove blocked with `preventDefault` in capture).
- **Enter.** Once the video has ended **and** the 3D scene has emitted `carousel:ready`:
  1. Tween the percent to 100 over .4s, then fade it out (.4s, delay .3).
  2. Start a timeline (delay .5, default `power3.out`):
     - t0: loader `autoAlpha 0` over .6s (`power2.in`), then `display:none`.
     - t0: canvas `autoAlpha 1` over .6s.
     - t0.2: `--loader-reveal` 100vh → 0vh over 1s (`power2.out`).
     - t0.3: navbar from `yPercent:-120, autoAlpha 0` to 0/1 over .9s.
     - t0.4: `.hud_left` from `x:-10rem`, and `.hud_right` from `x:10rem`, both to 0 over .9s.
     - t0.5: gamme container `autoAlpha 1` over 1s.
  3. In parallel, run the **3D intro**:
     - Set: `camPosZ 25, spacing 10, baseOffset 3, lightIntensity 0, lightWidth 2, canSpin 20°, pointerInfluence 0`.
     - Tween `lightIntensity → 30` at t0, `camPosZ → 29` at t1, and everything back to the start values at t2 (`power4.out`, 2.5s each).
     - Then unlock the scroll.

## 2. Navbar (fixed, top, z 10)

- **Layout:** padding `var(--m) var(--pad-global) 0`, a column of two rows with a `var(--s)` gap.
- **Behind it:** `.navbar_overlay` is 100% × 8rem, `linear-gradient(#0009,#0000)`.

**Row 1: scroll progress.** A 1px-tall flex row: a 1px white square, a track, then another 1px square.
- **Track:** `--white-20`, holding `.scroll_indicator` (`width: calc(var(--p)*100%)`). `--p` is `scroll/(scrollHeight−vh)` through `gsap.quickTo(.3s, power3.out)`.
- **The indicator stacks four layers**, all centred vertically:
  - **core:** 1px, `linear-gradient(to right, rgba(255,255,255,.05), rgba(255,255,255,.35) 55%, #fff)`
  - **mid:** 3px, blur 2px, `linear-gradient(to right, transparent, rgba(255,255,255,.25) 60%, rgba(255,255,255,.95))`
  - **halo:** 12px, blur 7px, `linear-gradient(to right, transparent, rgba(255,255,255,.1) 65%, rgba(255,255,255,.5))`
  - **hotspot:** 28 × 6px at the right end, `translate(40%,-50%)`, blur 2px, `radial-gradient(ellipse, #fff, rgba(255,255,255,.5) 35%, transparent 70%)`

**Row 2: three columns** (`1fr max-content 1fr`).

- **Left: sound toggle.** `.875rem`, text "ON" plus `sound-bars.svg` (~.9rem wide).
  - **Playing:** each bar loops a tween of `attr.height` to `random(2,8,.1)` (`y=(8−h)/2`, `random(.2,.5)`s, `power1.inOut`).
  - **Click:** toggles "OFF". Bars go to height 2 (`y:3`) over .3s, and all sounds are muted.
- **Centre: logo.** `assets/img/Ciao-Energy_logo.svg`, 9rem wide (8rem under 480px).
- **Right: menu.** `menu-dots.svg` (8px) plus "MENU", .875rem.
  - **Hover (desktop):** the 5 dots loop `scale 1 → .5 → 1` (.4s each, `power2.inOut`, stagger .1).
  - **Menu panel (desktop):** absolutely positioned under the button, centred (`left:50%; translateX(-50%)`, `top:var(--xxl)`). Padding `var(--m) var(--s)`, 1px `--white-20` border, radius 1rem, `--white-5` fill, `backdrop-filter:blur(1rem)`.
  - **Menu links:** "Gamme" (#gamme), "Bénéfices" (#benefits-1), "FAQ" (#FAQ), "Newsletter" (#newsletter). Geist 400, uppercase, `clamp(2rem,2vw,2.25rem)`, padding `var(--xs) var(--s)`, 1px `--white-20` bottom border.
  - **Open:** `height 0 → auto` and `opacity 0 → 1` over .6s (`power3.inOut`). Each link reveals with a lines mask (below), delay `.3 + i·.06`.
  - **Close:** links mask out (stagger .05), then the panel collapses (.5s, delay .3). A click outside closes it.
- **Far right (desktop only):** a small white "CONTACT" button (`mailto:contact@ciaoenergy.com`).

## 3. HUD (fixed, z 1, `pointer-events:none`)

- **Layout:** padding `var(--nav-h) 0 var(--l)`, Geistmono .75rem, colour `--white-50`. Flex, space-between, side padding `--pad-global`.
- **Left column:**
  - At the top, `corner-tl` (9px) with "C" under it.
  - At the bottom, "E" and "_", then the **scroll hint**, then `corner-bl`.
- **Right column:** mirrors it: `corner-tr` and "_", then the scroll hint, "_" and `corner-br`.
- **Scroll hint:** `scroll-arrows.svg` is 1.25rem wide, positioned `left:50%; bottom:10rem`. Its 3 groups loop:
  1. From `opacity 0, scale 0` (first `y:100`, last `y:−100`), they appear one after another (.6s, `power2.out`, overlapping −.4s).
  2. They hold .3s.
  3. They fade out (.4s, stagger .25).
  4. `repeatDelay` .3.
- **`.gradient_overlay`** inside the HUD: fixed, 120% × 120% at −10%/−10%, `linear-gradient(180deg, transparent, #0000 70%, #000 95%)`, `filter:blur(1rem)`, opacity 1.

## 4. 3D scene (the core)

### Renderer
- `WebGLRenderer({antialias:true, alpha:true})`, clear colour `0x000000` at alpha 0.
- `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, `ColorManagement.enabled = true`.
- **`lowPower`** = iOS (or iPad as MacIntel with touch) **or** `innerWidth < 1024`.
- **Pixel ratio:** `min(dpr, 2)` when lowPower, else `min(dpr, 1.5)`.
- **Camera:** `PerspectiveCamera(20, w/h, .1, 1000)`.

### Post-processing
`EffectComposer` into a render target sized `w·pr × h·pr`. Its type is `UnsignedByteType` when lowPower, else `HalfFloatType`.

The pass order is:
1. `RenderPass`
2. `UnrealBloomPass(new Vector2(w·.5, h·.5), .1, .1, 1)`, desktop only
3. `OutputPass`
4. `SMAAPass`, desktop only

### Environment tint
The HDRI goes through `PMREMGenerator.fromEquirectangular` into `scene.environment`. Every material gets this `onBeforeCompile`, which tints the indirect light (uniforms shared by reference):

```js
const tint = { color:{value:new THREE.Color(0xffffff)}, strength:{value:1} };
material.onBeforeCompile = (shader) => {
  shader.uniforms.tintColor = tint.color; shader.uniforms.tintStrength = tint.strength;
  shader.fragmentShader = 'uniform vec3 tintColor;\nuniform float tintStrength;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>',
    `#include <lights_fragment_end>
     reflectedLight.indirectDiffuse  *= tintColor * tintStrength;
     reflectedLight.indirectSpecular *= tintColor * tintStrength;`);
};
```

### Materials
All materials are `MeshPhysicalMaterial` on desktop. With lowPower, use `MeshStandardMaterial` and drop clearcoat, sheen, ior and reflectivity.

| Material | color | metalness | roughness | other |
|---|---|---|---|---|
| base (podiums) | 0xababab | .9 | .3 | sheen .3, sheenRoughness .2, sheenColor white, reflectivity 1, ior 2, envMapIntensity .1 |
| can metal | 0x555555 | .9 | .2 | sheen .8, sheenRoughness .2, clearcoat 1, clearcoatRoughness .1, reflectivity 1, ior 2, metalnessMap `can-metallic-2`, envMapIntensity 3 |
| label (one per flavour) | 0xababab | .9 | .2 | sheen .05, sheenRoughness .125, clearcoat .5, clearcoatRoughness .3, reflectivity 1, ior 2, `map` = flavour texture (sRGB), metalnessMap `can-metallic-2`, envMapIntensity 1 |

### Models
- **Base:** load `base.glb`, set every mesh to the base material and add it to the scene.
- **Cans:**
  1. Load `can.glb`. Every mesh **not** named `Shell` gets the can metal material.
  2. For each of the 6 flavours, clone the scene and give `Shell` that flavour's label material. Set `rotation.z = π/360·45`.
  3. Duplicate the cans in order (`clone()`) until there are **24** (12 when lowPower).

### Lights
| Light | colour | intensity | distance | angle | penumbra | decay | position | target |
|---|---|---|---|---|---|---|---|---|
| spot1 | white | data.lightIntensity | 8 | π/4·lightWidth | 1 | .1 | (0, 3.5, 0) | (0, 0, 1) |
| spot2 | white | data.lightIntensity | 8 | π/4·lightWidth | 1 | .1 | (0, −3, 2) | (0, 0, 1.8) |
| spot3 | white | data.spotIntensity | 15 | π/8 | 1 | .1 | (0, spotY, 2) | (0, spotY−2.5, 0) |

spot3 has `map = spot-mask.avif`.

### Carousel state
- **Start values:** `spacing = 3.5`, `offset = 0` (6 labels is even), `target = position = −1.5`, later reset to `offset`.
- **`getIndex()`:** `wrap(round((position + offset)/spacing), 0, 6)`.
- **`goTo(i)`:** `target = i·spacing − offset`. `next` and `previous` are `goTo(index ± 1)`, unwrapped.
- **Every frame:**
  - When not dragging, snap `target` to the nearest multiple of `spacing`.
  - `position = lerp(position, target, dt·10)`.
  - When the index changes, emit `changed({index, previous})`.
- Expose `window.carousel` and dispatch `window` `carousel:ready` once the cans are built.

### Scroll-driven pose (`data`)
All 3D parameters live in one object. A paused GSAP timeline tweens it, and every frame calls `timeline.seek(scrollWrapped / scrollHeight)`. Each step's duration is `sectionHeight / scrollHeight` (default ease `power1.inOut`).

**Start values (`startData`):**
- **Camera:** `camPos (0, 0, 29)`, `camRot (0, 0, 0)`, `fov 20`.
- **Cans:** `canScale 1`, `canPos (0, 0, 0)`, `canRot (0, 0, 0)`, `canSpin 0`, `spacing 1`, `wave 1`, `swirl 0`, `baseOffset 0`.
- **Lights and input:** `lightIntensity 50`, `lightWidth 1`, `tintStrength 1`, `spotIntensity 0`, `spotY 3`, `pointerInfluence .2`, `swipeSpeed 1`.

**Keyframes** (angles in degrees; convert to radians). Steps 1–5 reach their values over the section named, in order. Fields not listed keep the start values.

| Step (section) | camPos (x,y,z) | camRot (x,y,z) | fov | canPos (x,y,z) | canRot (x,y,z) | canSpin | spacing | wave | swirl | baseOffset | lightInt | lightW | tint | spotInt | spotY | ptr | swipeSpeed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 Taste (→ profile) | 0,0,6 | 0,0,0 | 40 | .5,−.5,0 | −37.5,15,22.5 | 0 | 3.5 | 0 | 0 | 3 | 30 | 1 | 1 | 0 | 3 | .2 | 1 |
| *set `swipe.active = false`* | | | | | | | | | | | | | | | | | |
| 2 Benefit 1 | 0,−2,12 | 10,0,−10 | 20 | 0,−.8,0 | 0,0,0 | 120 | 2.2 | 0 | 0 | 3 | 0 | 1 | .2 | 35 | 2.2 | 0 | 1 |
| 3 Benefit 2 | 0,−2,12 | 10,0,5 | 20 | 0,−.48,0 | 0,0,0 | 130 | 2.2 | 0 | 0 | 3 | 0 | 1 | .2 | 35 | 2.2 | 0 | 1 |
| 4 Benefit 3 | 0,−2,12 | 10,0,−10 | 20 | 0,.02,0 | 0,0,0 | 120 | 2.2 | 0 | 0 | 3 | 0 | 1 | .2 | 35 | 2.2 | 0 | 1 |
| 5 Benefit 4 | 0,−2,12 | 10,0,5 | 20 | 0,.5,0 | 0,0,0 | 130 | 2.2 | 0 | 0 | 3 | 0 | 1 | .2 | 35 | 2.2 | 0 | 1 |
| 6 No bullshit | 0,0,8 | 0,0,0 | 45 | 0,0,−.5 | −20,0,−5 | 0 | 5 | 0 | 0 | 3 | 45 | 1.5 | 2 | 0 | 3 | .2 | 1 |
| *set `swipe.active = true`* | | | | | | | | | | | | | | | | | |
| 7 Packshot | −3,−3.5,20 | 10,−9,−10 | 30 | 0,0,−.4 | 0,0,0 | 0 | .47 | 0 | 1 | 20 | 10 | 3 | 2 | 0 | 3 | 0 | 2 |
| 8 Move offscreen | 0,−5.5,10 | 0,0,0 | 30 | 0,0,−.4 | 0,0,0 | 0 | .6 | 0 | 1 | 20 | 0 | 3 | (2) | 0 | 3 | 0 | 1 |
| *set `swipe.active = false`; set camPos 0,8,10, camRot 0, fov 20, spacing 5, swirl 0* | | | | | | | | | | | | | | | | | |
| 9 Return | 0,0,29 | 0,0,0 | 20 | 0,0,.5 | 0,0,0 | 20 | 5 | 0 | 0 | 10 | 50 | 1 | 1 | 0 | 3 | .2 | 1 |
| 10 Loop | → `startData` | | | | | | | | | | | | | | | | |

Rebuild the timeline on width resize.

### Per can, every frame (copy this exactly)

```js
const minX = cans.length * -0.5 * carousel.spacing, maxX = -minX;
const p0 = clamp(scroll.distanceTo(0) / sections[0].height, 0, 1);   // 0 on hero → 1 once past it
const windowRatio = clamp(1440 / scrollWidth, 1, 2.4);
const wave = windowRatio * 0.25 * (1 - p0) * data.wave;

cans.forEach((can, i) => {
  const x = wrap(i * carousel.spacing - carousel.position, minX, maxX);
  const p = clamp(1 - Math.abs(x) / carousel.spacing, 0, 1);         // 1 = active can
  const p1 = Math.min(p, p0);
  let s = 1.2, px = x * data.spacing, py = Math.sin(px * wave);
  let pz = (-Math.abs(x) - 0.2) * data.wave;
  let rx = -Math.PI/180*20 * data.wave;
  let ry = (px * 0.5 - Math.PI/180*20) * data.wave;
  let rz = Math.PI/360*22.5 * data.wave;
  rx = lerp(rx, x * 0.06 * windowRatio + 0.2, data.swirl);           // packshot swirl
  s = lerp(s, data.canScale, p0); py = lerp(py, data.canPosY, p0); pz = lerp(pz, data.canPosZ, p0);
  rx += data.canRotX; ry = lerp(ry, data.canRotY, p1); rz = lerp(rz, data.canRotZ, p1);
  can.position.set(px, py, pz); can.rotation.set(rx, ry, rz); can.scale.setScalar(s);
  can.rotation.y += pointer.smoothX / 1280 * data.pointerInfluence * p;
  can.rotation.x += pointer.smoothY / 1280 * data.pointerInfluence * p;
  can.children.forEach(c => { if (c.isMesh) c.rotation.z = can.rotation.y * 0.6 + data.canSpin * p; });
});
base.children[0].position.y = -data.baseOffset; base.children[1].position.y = data.baseOffset;
camera.position.set(data.camPosX, data.camPosY, data.camPosZ);
camera.rotation.set(data.camRotX, data.camRotY, data.camRotZ); camera.fov = data.fov; camera.updateProjectionMatrix();
spot1.intensity = spot2.intensity = data.lightIntensity; spot1.angle = spot2.angle = Math.PI/4 * data.lightWidth;
spot3.intensity = data.spotIntensity; spot3.position.set(0, data.spotY, 2); spot3.target.position.set(0, data.spotY - 2.5, 0);
tint.strength.value = data.tintStrength;
```

`pointer.smooth` = `lerp(smooth, mouse, dt·10)`, starting at the screen centre.

### Input on the canvas
- **Drag (mouse or touch), only while `swipe.active`:**
  - Lock the axis after 2px.
  - On the horizontal axis, accumulate `deltaX` and call `lenis.stop()`.
  - Each frame, `target −= deltaX·.02·data.swipeSpeed`.
  - On release, `deltaX *= 8` (a flick), then `lenis.start()`.
- **Click** (raycast, hero only, not after a drag):
  - A can to the right calls `next()`. A can to the left calls `previous()`.
  - The centre can scrolls to section 2 (1.5s, ease-out cubic).
- **Cursor in the hero:** `pointer` over the active can, `grab` elsewhere, `grabbing` while dragging.
- **WebGL context loss:** pause rendering only. The loader must keep rendering.

### Scroll
- **Lenis:** `new Lenis({autoRaf:false, infinite:true, syncTouch:true})`, driven from the same rAF (`lenis.raf(ms)`).
- **Wrapping:** wrap the position into `[0, scrollHeight−vh]`. Clamp `targetScroll` at 0 (no overscroll above the hero).
- **Loop guard:** if the wrapped position jumps back by more than 60% of the total, scroll to section 0 over 1.2s (ease-out cubic, `lock:true`).
- **`scroll.to(pos)`:** subtracts 10px when `pos ≠ 0`.
- **Desktop wheel paging:** this applies for anchor sections 0–6.
  - `preventDefault` the wheel event. Ignore |deltaY| < 4.
  - Go one section up or down: 1.5s for anchors 0, 1, 5 and 6, else 1s (ease-out cubic, `lock:true`).
  - Stay locked for the duration.
  - Also snap (debounced 250ms on scroll, 50ms on scrollend) for sections 0–1.
- **Mobile (< 1024px) paging:**
  - Applies when the anchor index is ≤ 7.
  - A vertical swipe (axis locked after 2px) is `preventDefault`-ed.
  - On touchend, if |dy| > 24px, go to the next or previous section over 1.5s.

## 5. Hero: Gamme (`.gamme_container`, fixed)

- **Container:** flex, content at the bottom, centred text, height 100svh.
- **Hidden H1** (for SEO): "Ciao Energy – L'energy drink parfaite".
- **Gradient glow:** `.gamme_gradient-wrapper` is absolute and full, with `filter:blur(6rem)`.
  - It holds a circle (`aspect-ratio:1`, width 120%, max 70%) centred horizontally and pushed down `translate(-50%,95%)`, so only its top arc shows above the bottom edge.
  - **Fill:** `conic-gradient(from 17deg, #00a6e2 0deg, #71bd96 72.7deg, #eeb169 142.8deg, #e59de6 214.7deg, #ff659d 287deg, #9089d3 360deg)`.
  - **On every flavour change** it rotates by `−delta·60°` (shortest way, cumulative) over .8s (`power2.inOut`).
  - **Also:** a 3rem `backdrop-filter:blur(15rem)` strip, 100vw wide, at the bottom.
- **Flavour title** (bottom centre): 6 stacked absolute slides. Each one is `.heading-style-h2`: Franklin italic, uppercase, `clamp(2.25rem,3vw,3rem)`, two lines. The second line has `margin-top:-.35em` and line-height 1.2 inside the mask.
  - **On change:** fade the slides with `autoAlpha` (.5s). The old title's chars mask out, and the new one's chars mask in (delay .3).
- **Arrows:** `.carousel_nav` is absolute at `top:50%; left:50%`, `max-width:35vh`, with the arrows at its bottom corners.
  - They hold `arrow-prev.svg` and `arrow-next.svg` (~1rem × 2rem).
  - Clicking calls `previous()` or `next()`.
  - **Hover:** shapes loop `scale 1 → .5 → 1` (stagger .08).
- **Pagination:** inline `pagination.svg` at full width, height 8px.
  - It has a rounded 8px bar and an r 18 dot, both filled with the 6-stop gradient `#9089D3 → #00A6E2 → #71BD96 → #EEB169 → #E59DE6 → #FF659D`.
  - Both sit under a "liquid" filter: `feGaussianBlur 4` plus `feColorMatrix … 0 0 0 20 -10`, so the dot melts into the bar.
  - **Dot position:** `cx = 20 + 960/5·index`.
  - **Normal change:** `cx` tweens over .6s (`power3.out`).
  - **Wrap (5 → 0 or 0 → 5):** the dot exits sideways (`x ±150, scale 0`, .3s), jumps, and enters from the other side (.45s).
  - **Pointer:** pointerdown and drag on it call `goTo` for the nearest index (`cursor:grab`).
- **"SCROLLER POUR DÉCOUVRIR":** .875rem, uppercase, `--white-60`.
- **Leaving the hero** (ScrollTrigger at the section's `bottom bottom`, play and reverse, .5s):
  - Pagination, scroll hints, the prev arrow, "Scroller…" and the gradient fade out.
  - Desktop: the title fades and `.carousel_nav` max-width goes to 55%.
  - Mobile: the next arrow fades and the title moves `y:-2.5rem`.

## 6. Profile (`.section.is-profile`)

- **Entering:** add `body.is-profile-active`, so the flavour radial background fades in. Fade in `.profile_container` and `.carousel_title-bis-wrapper`.
- **Left column** (padding-left `var(--xxh)`, max 28rem, centred vertically): the flavour title (h2 style), then a 1.25rem paragraph framed by `corner-tl` and `corner-br` at −1rem. Reveal the lines with a mask.
- **Background titles:** `.carousel_title-bis-wrapper` fills the screen and holds each flavour name as 2 words. They are uppercase, `--white-30`, with the lines spread across the full width (`display:flex; justify-content:space-between` on `.line`). Chars mask in on change.
- **Flavour copy:**

| # | Text |
|---|---|
| 0 | Une explosion exotique. Une recette intense en litchi qui rappelle les saveurs d’Asie tropicale. |
| 1 | Une parenthèse tropicale. On a mélangé la douceur lactée de la coco et l’acidité du citron vert. |
| 2 | Le Ciao Energy le plus rafraîchissant de la gamme. Le kiwi apporte son éclat juteux, le concombre une grande fraîcheur. |
| 3 | Un instant rempli de douceur. On a créé une energy drink florale et délicatement parfumée à la pêche blanche. |
| 4 | L’energy drink aux fruits du jardin. Une recette qui marie la fraîcheur de la pomme et l'acidité de la rhubarbe. |
| 5 | Un duo solaire et gourmand. On a mélangé la douceur de l'abricot et la vivacité de la framboise. |

## 7. Benefits ×4 (`.section.is-benefits`, ids `benefits-1`…`benefits-4`)

- **Layout:** each is a fixed `.benefits_container`, centred, padding-left `var(--xxh)`. The text block is left-aligned, max 28rem, 1.25rem.
- **Content, top to bottom:**
  1. **Subhead:** a square chip in `--taste-secondary` holding "×" in `--taste-primary`.
  2. A white label (black text, 1rem, uppercase) holding the *removed* ingredient. A 1px black strike line (`::before`, `scaleX(var(--benefits-line))`, origin left) draws across it: 0 → 1 over .8s, delay 1s.
  3. **H2:** Franklin italic uppercase `clamp(2.25rem,3vw,3rem)`, revealed per char.
  4. **Paragraph:** revealed per line.
- **Entering** (both directions): fade the container in (delay .35) and run the reveals (delay .35). Leaving masks everything out.

| # | Struck-through | H2 | Paragraph |
|---|---|---|---|
| 1 | 11G de sucres | Moins / de sucre | Une boisson énergisante moins sucrée, avec exclusivement du sucre de canne, choisi pour son origine végétale et son caractère en bouche. |
| 2 | Arômes artificiels | arômes / naturels | Pour leur puissance aromatique et leur richesse gustative, on a soigneusement sélectionné des arômes naturels issus de fruits et de plantes. |
| 3 | Caféine artificielle | caféine issue de grains de café | Pour l’énergie, on a choisi des grains de café, source naturelle de caféine, complétés par du guarana, lui aussi naturel. |
| 4 | Aspartame sucralose acéfulfame K | stevia | Pour compléter le sucre de canne et apporter douceur et gourmandise, on a choisi d’ajouter un édulcorant d’origine végétale avec des extraits de stévia. |

**Benefits nav:** fixed, right `--pad-global`, vertically centred, a column with a `var(--s)` gap.
- **Items:** 4 round icon buttons (`benefit-*.svg`, 2 × 2.25rem). Each has padding `var(--xs)`, a 1.5px `--white-20` border, `--white-5` fill, `backdrop-filter:blur(.5rem)` and `--white-50` colour, separated by 1px dots.
- **`.is-active`** (the current benefit): border `--taste-secondary`, `box-shadow: inset 0 2px 4px rgba(255,255,255,.3), inset -3px 3px 15px var(--taste-secondary)`, white icon.
- **Visible** from the profile section through benefit 4.

## 8. Argument: "Zero Bullshit" (`.section.is-argument`)

- **Videos:** fill the screen with 6 stacked `<video muted loop playsinline>`, one per flavour, desktop `object-fit:fill`, mobile `cover`.
  - Only the active flavour's video is visible (`autoAlpha`, .6s) and playing.
  - Pause everything when the section is out of view.
- **Wordmark:** centred on top, `zero-bullshit.svg`, 80% wide (max 100rem).
  - Its paths are filled with `--taste-secondary`, with `mix-blend-mode:screen` and `filter: drop-shadow(0 0 80px var(--taste-secondary)) drop-shadow(0 0 90px var(--taste-primary))`.
  - A `backdrop-filter:blur(2rem)` layer, masked by `zero-bullshit-mask.svg`, sits under it.
- **Entering:**
  1. The paths pop in from `scale .6, autoAlpha 0` (.5s, `back.out(2)`, stagger .04, delay .4).
  2. The blur layer fades in (delay 1s).
  3. `.gradient_overlay` fades out.
- **Leaving:** reverse.
- **Mobile:** the wordmark is 70% wide (max 17.5rem), at `bottom: var(--xxl)`, with no glow and no blur.

## 9. Full gamme (`.section.is-full-gamme`)

This section is empty. It's where the **packshot** swirl plays: all cans packed tightly and fanned in 3D. Entering it removes `is-profile-active`.

## 10. FAQ, newsletter, footer (`.section.is-faq`, id `FAQ`)

**Title:** "FOIRE AUX / QUESTIONS", Franklin italic, `clamp(2.25rem,7.5vw,10rem)`, line-height .8, left-aligned (centred on mobile), z −1.

**Accordion:**
- **Separators:** 1px `--white-20` between items.
- **Question:** Geist `clamp(1.25rem,1.25vw,1.5rem)`, padding 1.25rem 0, with the `faq-chevron.svg` icon (2rem) on the right. The icon turns 180° when open.
- **Answer:** 1.125rem, height animated from 0 to auto (.4s).
- Each click plays the `click` sound.

| Question | Answer |
|---|---|
| Qu'est-ce qui distingue Ciao Energy des autres boissons énergisantes ? | Ciao Energy a été pensée comme la boisson énergisante parfaite. On a fait le choix d'une recette à teneur réduite en sucres par rapport aux boissons énergisantes classiques, de mettre des arômes naturels plutôt que des arômes artificiels, de mettre de la caféine issue de grains de café plutôt que de la caféine de synthèse, et de mettre un édulcorant d’origine végétale (la stévia) plutôt que des édulcorants de synthèse (aspartame, sucralose et acésulfame K). |
| Ciao Energy est-elle une boisson pétillante ? | Oui, Ciao Energy est une boisson gazeuse. On a choisi une effervescence marquée pour amplifier la fraîcheur en bouche. |
| Quelle est la teneur en sucres et en calories de Ciao Energy ? | Ciao Energy contient 4 g de sucre et 17 kcal pour 100 mL. On a dosé le sucre avec parcimonie en associant sucre de canne et extraits de stévia. |
| Quelles sont les vitamines présentes dans Ciao Energy ? | Une canette de Ciao Energy contient de la niacine (vitamine B3), de la vitamine B6 et de la biotine (vitamine B8) qui contribuent à un métabolisme énergétique normal. La niacine (vitamine B3) et la vitamine B6 contribuent à la réduction de la fatigue. |
| Ciao Energy contient-elle des colorants artificiels ? | Non. On a fait le choix de ne pas utiliser de colorants artificiels dans Ciao Energy. Nos couleurs sont élaborées à partir de denrées alimentaires colorantes. |
| Ciao Energy est-elle une boisson contenant de la taurine ? | Non, nous n’avons pas mis de taurine dans Ciao Energy. La taurine est un ingrédient typique des boissons énergisantes traditionnelles, mais qui n'apporte pas d'énergie en elle-même. Avec Ciao Energy, on est partis sur des sources végétales de caféine (grains de café et guarana), et on a préféré garder une recette simple, sans ajouter d'ingrédient qu'on ne jugeait pas indispensable. |
| Ciao Energy peut-elle être consommée par tout le monde ? | Ayant une teneur élevée en caféine (32 mg/100ml), on déconseille la consommation de Ciao Energy aux enfants et aux femmes enceintes ou allaitantes. |
| Où est embouteillé Ciao Energy ? | Ciao Energy est embouteillée en France avec des standards de qualité européens. |
| Comment conserver ma canette de Ciao Energy ? | Avant ouverture, conservez votre canette à température ambiante, à l'abri de la lumière et de la chaleur. Pour la déguster au mieux, on recommande de la servir bien fraîche. Après ouverture, à conserver au réfrigérateur et à consommer sous 1 jour. La date limite de consommation est indiquée sous la canette. |

**Newsletter** (id `newsletter`, centred, max-width medium):
1. "REJOIGNEZ-NOUS" in h2 style, line-height .8.
2. "Rejoignez la communauté et soyez les premiers au courant de nos actualités et des nouveaux produits Ciao Energy."
3. An email input with a floating label "VOTRE ADRESSE MAIL". The label is .875rem at opacity .6, and shrinks to .75rem and moves up 65% on focus or when valid. The input has a 1px `--white-20` ring, which becomes 2px white on focus.
4. A white button "S'INSCRIRE".
5. "En vous inscrivant vous acceptez notre politique de confidentialité" (.875rem, link underlined).

The form posts to `#` and is **left for the owner to wire up**.

**Footer:**
- "© 2026 CIAO ENERGY" (.75rem, centred).
- A glass bar: max 50rem, padding `var(--xs) var(--s)`, radius .5rem, `--white-5` fill, `backdrop-filter:blur(2rem)`.
- **Its contents:** outlined "TIKTOK" and "INSTAGRAM" buttons (6.5rem, 1.5px white border, radius .25rem, .875rem). Between them sit the links "Mentions légales", "CGU" and "Politique de confidentialité" (.75rem, uppercase).

## 11. Buttons

- **Style:** white fill, black text, uppercase, Geist 400, padding 1.25rem 1.5rem, radius .5rem, `box-shadow:0 0 20px rgba(255,255,255,.6)`.
- **Hover (desktop > 991px):** split the label into chars, duplicated in a second layer absolutely positioned underneath (`y:110%`), inside an `overflow:hidden` inline-flex.
  - **Enter:** the top chars go to `y:-110%` while the bottom chars go to 0.
  - **Leave:** reverse.
  - Timing: .4s, `power3.inOut`, stagger `min(.025, .25/charCount)`.

## 12. Text reveals (shared)

- **`lines-mask`:** `SplitText(el,{type:'lines', mask:'lines', linesClass:'line'})`. Lines start at `yPercent:110`.
  - `in` goes to 0: .7s, `power3.out`, stagger .08.
  - `out` goes to −110.
- **`chars-mask`:** the same with `type:'lines,chars'`. It animates the chars over .6s with stagger .01.
- **Overwrite:** both use `overwrite:true` on every call.

## 13. Sounds

- **Engine:** one `AudioContext`. Preload all four buffers with `fetch` and `decodeAudioData`.
- **Unlock:** on the first pointerdown, touchstart, keydown or wheel (`ctx.resume()`).
- **Playback:** `BufferSource → Gain(.5) → destination`. Skip it if the sound toggle is OFF.
- **`enter`:** plays when the first scroll from the hero crosses `max(3% of the hero height, 24px)` going down.
- **`benefits`:** plays when the nearest section changes to an adjacent `is-benefits` one.
- **Lock:** clicking a menu link or a benefit icon locks the scroll sounds for 1.8s.

## 14. Responsive (≤ 991px)

- **Menu:** full-screen black panel, 100vw × 100svh, `padding-top:8rem`, links `2.5rem`. `menu-emblem.svg` shows in the middle, with "CONTACT" plus social buttons and "© 2026 CIAO ENERGY" at the bottom.
  - Open: .8s, links stagger .1, delay .45. The extras come in after them.
  - Close: .7s.
- **Hidden:** the background flavour titles, the gradient blur strip and the corner brackets.
- **Text:** profile and benefits text are centred at the bottom (`align-items:flex-end`), with benefits max 22.5rem.
- **3D:** lowPower mode (Standard materials, no bloom or SMAA, 12 cans, DPR ≤ 2).
- **Pagination:** the vertical swipe pager is described in §4.
- **FAQ:** the HUD fades out while the FAQ section is in view.
- **≤ 767px:** navbar min-height 4rem. Footer bar becomes a 2-column grid with the links stacked first.

## 15. Head

- **Title and language:** `<title>Ciao Energy - L’energy drink parfaite</title>`, `lang="fr-FR"`.
- **Meta description:** "Ciao Energy, une gamme de boisson énergisante zero bullshit. Moins de sucre. Arômes naturels. Caféine d'origine végétale. Vitamines. Extraits de stévia. 6 saveurs."
- **Open Graph image:** `assets/img/Ciao-energy_meta-img.jpg`.
- **Favicons:** dark and light, through `prefers-color-scheme`.
- **Scroll restoration:** `history.scrollRestoration = 'manual'`. Always start at scroll 0.

## Deliverable

Deliver one self-contained `index.html` (inline CSS and JS, the three.js module script last). Then:
1. Serve it over HTTP, since `file://` blocks the GLB and HDR loads.
2. Check the console has no errors.
3. Check the loader reaches 100% and the cans appear.

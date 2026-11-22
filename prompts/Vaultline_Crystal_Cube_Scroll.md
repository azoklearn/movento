Build the landing page for **Vaultline**, a product that turns treasuries and private credit into liquid tokens ("real-world yield with 24/7 redemptions & zero lockups"). The page is strictly black, grey and white. It scrolls normally, but behind the text sits one fixed scene: a dark crystal hanging in a cone of light that ripples like sunlight through water. As the visitor scrolls, the crystal glides from pose to pose, a dotted landscape rises under it, and a frosted glass cube closes around it and turns. Quiet, technical, precise: a wide grotesque for headlines, a monospace for everything small, film grain over all of it.

Plain HTML, CSS and vanilla JS, no libraries and no WebGL: CSS 3D transforms for the cube, two small 2D canvases, one `requestAnimationFrame` loop. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

| URL | Size | What it is |
|---|---|---|
| `https://res.cloudinary.com/ce2yatay/image/upload/vaultline/crystal.webp` | 640 × 1494, transparent | The crystal, cut out: a tall marquise shape pointed at both ends, matte black on top, a translucent smoky tip at the bottom that catches the light |
| `https://res.cloudinary.com/ce2yatay/image/upload/vaultline/caustics.webp` | 1920 × 1074, black background | White water caustics (a net of bright wavering lines), brightest at the top centre and fading to black on the sides and at the bottom. Always used with `mix-blend-mode: screen` |

Preload both.

## 2. Look

- Colours: page `#060607`; type `#f2f2f4`; dim type the same at 50%; hairlines the same at 12%; cards `rgba(22,22,25,.66)` with a 10px backdrop blur; the one tint is the primary button, a pale lilac gradient (`#cdc8f6 → #e9e7fc → #d6d2f7`) with dark text and a faint lilac glow.
- Fonts (Google Fonts): **Archivo** variable, set at `font-stretch: 112%`, weight 400, for headlines, logo and figures (letter-spacing −0.045em on headlines); **JetBrains Mono** for paragraphs, labels, buttons and the table; **Space Grotesk** only for the ampersand in the hero headline.
- Buttons: 143 × 42px, 3px radius, mono 12px uppercase. Primary: the lilac gradient. Secondary: 1px border at 28% white on `rgba(14,14,16,.55)`.
- Sizes below are for a 1440px-wide window; scale with `vw` and clamp.

## 3. The fixed scene (behind everything, `position: fixed; inset: 0; pointer-events: none`)

From back to front:

1. **Haze**: a huge soft radial glow (white at 17% in the centre, gone by 62% of the radius, 150vmax across) centred on the crystal.
2. **Caustics**: a box `max(84vw, 120vh)` wide with the picture's ratio, hanging from the top of the screen, horizontally centred on the crystal. Inside it, two copies of `caustics.webp` (one mirrored), both `mix-blend-mode: screen`, opacities 0.75 and 0.55, each drifting on its own slow loop (19s and 27s, alternate: a few percent of translation, scale 1.02 ↔ 1.1, ±1.5° of rotation) so the light never repeats. Mask the box with an ellipse anchored at the top centre so the light falls as a cone.
3. **Dust**: a full-screen canvas drawn once (and on resize): about one speck per 9,000px², 0.4–1.2px, white at 12–70%.
4. **Terrain**: a canvas over the bottom 44vh. A grid of points on gently rolling ground, in perspective: 72 rows from near to far (depth `z = 1.5 + (r/71)^1.45 × 12.5`), points 0.15 apart across; each point at screen `x = centre + (x/z) × focal × 0.62`, `y = horizon + ((1.2 − height)/z) × focal × 0.86`, with `focal = 1.1 × canvas height`, horizon at 8% of the canvas; `height` is two slow sine waves (amplitudes 0.36 and 0.12) that move with time and with the scroll. Dots 0.7–1.9px, fainter with distance. It reads as a dotted landscape receding to a horizon.
5. **Rig**: a zero-size box at the crystal's position with `perspective: 1500px`. In it, the **cube**: a `transform-style: preserve-3d` element rotated `rotateX rotateY rotateZ`, with six faces each `min(47vh, 62vw)` square pushed out by half an edge. Faces: 1px border at 34% white, a faint diagonal white gradient (15% → 3% → 9%), an inner glow, and a noise texture on top; the top face is much brighter (58% → 36% grey-white) so the cube reads as frosted glass lit from above. The **crystal** image (60vh tall) is a child of the cube so that the faces in front of it veil it and the ones behind do not; it carries the inverse of the cube's rotation (`rotateZ(−z) rotateY(−y) rotateX(−x)`, then its scale, then `translate(−50%, −50%)`), so it always faces the screen, upright, while the cube turns around it.
6. **Grain**: a 180px noise tile (made once on a small canvas: white pixels with random alpha up to 27%), `mix-blend-mode: screen`, 50% opacity, jumping between five offsets every 0.7s. The same tile is the texture of the cube faces.

**Poses.** Each section names a pose; the scene reaches it when that section's centre is in the middle of the screen (the first at the top of the page, the last at the bottom), and glides between neighbours with a smootherstep so it lingers on each. Scroll is eased first: `shown += (scrollY − shown) × (1 − exp(−dt × 5.5))`.

| Section | Crystal centre x (from screen centre) | y (from top) | Crystal scale | Cube | Light opacity | Terrain |
|---|---|---|---|---|---|---|
| Hero | 0 | 49vh | 1 | hidden | 1 | hidden |
| Exit | +19.8vw | 36vh | 0.62 | hidden | 0.9 | hidden |
| Collateral | 0 | 36vh | 0.40 | hidden | 0.85 | shown |
| Secured | 0 | 49vh | 0.46 | shown | 0.4 | shown |
| Investors | 0 | 13vh | 0.46 | shown | 0 | shown |
| Enter | 0 | 43vh | 0.46 | shown | 1 | shown |

The crystal also bobs ±0.7vh on a slow sine. The cube turns with the scroll: `rotateY = 32° + 215° × progress + 2.2°/s`, `rotateX = −24° ± 7°`, `rotateZ = 8° ± 5°`.

## 4. Page

A fixed header: left, a small faceted-gem icon and "Vaultline" (20px); right, a small outlined "Enter app" button that fades in only once the hero has scrolled half a screen away.

Six sections, each at least one screen tall, content centred unless noted. Every text block arrives out of a blur when it enters the screen (opacity 0 → 1, `blur(14px)` → 0, 14px rise, 1.2s, 130ms apart within a section).

1. **Hero** (100vh). `h1`, three centred lines, 66px, line-height 1.17: "Real-world yield / with 24/7 redemptions / & zero lockups". Mono paragraph, 15px, two lines: "Vaultline turns treasuries and private credit into open liquid tokens with audited reserves & same-block exits." Buttons "ENTER APP" (primary) and "LEARN MORE". A tiny "SCROLL" near the bottom. The type sits directly over the crystal.
2. **Exit** (118vh), two columns. Left, `h2` 72px, line-height 1.07, three lines: "Exit positions / in seconds – / not days"; mono paragraph: "Always-on redemption rails for 24/7 liquidity and same-block settlement." Right, lower than the title (just under the crystal): a comparison card 29vw wide, mono 13px, rows 41px tall separated by hairlines, three columns:

   | | ● vlUSD | Legacy fund |
   |---|---|---|
   | Redemption | ~9 sec | 1–2 days |
   | Hours | 24/7 | Market hours |
   | Mgmt fee | 0.10% | 0.50% |
   | Spread | 2 bps | 35 bps |

   Row labels and the "Legacy fund" column are dim; the vlUSD column is bright.
3. **Collateral** (112vh). `h2` 49px: "Collateral that never sleeps". Under it, a full-width bar of four cells divided by hairlines, each with a tiny mono uppercase label and a 41px figure: TOTAL VALUE LOCKED **$412M**, NET YIELD · 30D **5.4%**, ACTIVE HOLDERS **18,240**, MEDIAN REDEMPTION **9s**. The figures are tied to the scroll: they start at 28% of their value when the bar enters the bottom of the screen and reach it by the time the bar has risen 62% of the screen height (ease-out).
4. **Secured** (165vh). `h2` 104px, one line: "Secured by design". It is `position: sticky` near the top so it stays above the cube while the section passes. At the bottom of the section, two groups side by side, each with a tiny mono label and logos set in type: "CUSTODY PARTNERS:" Northbank, HALCYON; "CONTRACTS AUDITED BY:" LEDGERPROOF, quorum **labs**, Sablewatch.
5. **Investors** (100vh), content at the bottom over the terrain. Label "INVESTORS & PARTNERS", then a 5 × 3 grid of fifteen logos set in type, about 66vw wide: Meridian, ORBITAL, *kestrel*, atlas&co, Nova/9, Fieldstone, POLARIS, Halo Capital, cinder, ARCADIA_, lumen, Tessera, WAYPOINT, *Driftwood*, ridge.vc. Make each read as a different brand using only weight (300/700), width, italics, letter-spacing, uppercase, the mono font, and a tiny inline SVG mark for a few of them (diamond, ring with slash, drop, three squares, zig-zag).
6. **Enter** (100vh). `h2` 64px, two lines: "Put idle capital / to work"; mono line "Mint, hold and redeem tokenized assets in one place."; buttons "ENTER APP" and "READ DOCS". At the very bottom, a 10px mono footer: left "© 2026 Vaultline Labs", right "Docs · Security · X · Discord · Terms".

## 5. Opening

Black screen. When the two pictures and the fonts are ready, the scene fades in over 2.4s (the crystal comes out of the dark under the light), the logo follows, and 0.7s later the hero text arrives line by line out of the blur.

## 6. Small screens (≤ 820px)

- Poses change so the crystal sits above stacked copy: Exit centred at 17vh, scale 0.36; Collateral 27vh, 0.36; cube sections scale 0.40 with the cube edge `min(40vh, 70vw)`.
- Exit becomes one column: title, paragraph, then the card full width.
- The stats bar becomes 2 × 2; the investors grid 3 columns; partner groups stack; the footer stacks and centres.

## 7. Details

- The whole scene is decorative (`aria-hidden`); all copy is real text; one `h1`. The comparison is marked up as a table (`role="table"` or a real `<table>`), the stats as a `<dl>`.
- `prefers-reduced-motion`: no scroll easing, no bobbing, no drifting light or jumping grain, text simply fades.
- Visible focus rings (1px lilac outline).

## 8. Checks

- Top of the page: the crystal hangs in the middle under the rippling light, headline over it.
- Scrolling: the crystal slides right and shrinks beside "Exit positions", returns to the centre above "Collateral that never sleeps" while the dotted landscape appears and the figures climb, then the glass cube appears around it under "Secured by design" and turns as you scroll; over the investors grid the cube rises half out of the screen; at the end it comes back to the centre under the light.
- The crystal stays upright and facing the screen whatever the cube's angle, and is veiled by the cube's front faces.
- No horizontal scroll at any width; no console errors; both images return 200.

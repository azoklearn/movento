Build the landing page for **Uvra**, a small high-altitude winery ("picked by hand and aged as long as they need"). The whole page is one film that the visitor scrubs by scrolling: it opens in a dim museum in front of a classical painting of the harvest, pushes through the frame into the painting, flies down the vineyard, closes in on a hand picking grapes, a basket, the press, the cellar, a crystal glass, three bottles, a banquet under a pergola, then pulls back until the banquet is itself a painting on the museum wall. Each chapter of the film gets one line of copy that fades in and out at its moment. Quiet, rich and editorial: a big serif with blush italic accents over warm, dark paint.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop that reads the scroll position, a `position: sticky` stage, a `<canvas>` for the film. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. The film (hosted, nothing to generate)

One 33.4-second, 16:9 video is hosted on Cloudinary, which serves any moment of it as a still image. The page never plays the video: it loads 334 stills (10 per second of film) and draws them on a canvas. Use these URLs as they are; do not download, regenerate or re-encode anything.

Frame `i` (0 to 333):

```
https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<W>,q_50/uvra/harvest-film.webp
```

- `<T>` is the offset in seconds: `Math.max(0, (i - 0.5) / 10).toFixed(3)`. (The offset returns the first frame at or after it, so aim half a frame early.) Frame 0 is `so_0.000`, frame 1 is `so_0.050`, frame 333 is `so_33.250`.
- `<W>` is `960`, or `640` on small screens: use 640 when `Math.min(innerWidth, innerHeight * 16 / 9) * Math.min(devicePixelRatio, 2) < 900`.
- Only these two widths with `q_50` are already cached. Keep the URL exactly in this form, with three decimals; anything else makes Cloudinary render new images on the fly and the first load is slow.
- Weight: about 11 MB for all 960 frames (33 KB each), 6 MB at 640.

The same film as a plain video, for reference only: `https://res.cloudinary.com/ce2yatay/video/upload/uvra/harvest-film.mp4`

What is in it, in film progress `p` (0 = first frame, 1 = last):

| p | On screen |
| --- | --- |
| 0 – 0.07 | Museum: a gilded frame on a dark brown wall, centred, the painting inside is a woman in white raising a bunch of grapes; blurred heads of visitors along the bottom |
| 0.07 – 0.15 | Push through the frame; the woman and the vineyard fill the screen |
| 0.16 – 0.26 | High view down a path between vine rows, harvesters, a villa on the hill, a big cloudy sky across the top third |
| 0.27 – 0.35 | Close-up: a hand cradling a heavy bunch of dark grapes, leaves upper left, hills on the right |
| 0.36 – 0.39 | A wicker basket of grapes, the camera sinks into the dark fruit |
| 0.40 – 0.48 | Dark cellar: a wooden basket press, a stream of ruby juice falling just left of centre |
| 0.50 – 0.60 | Candlelit vaulted cellar, the winemaker holding a glass wine thief |
| 0.63 – 0.69 | Extreme close-up of a cut-crystal glass, wine trickling in, candle flames left and right; the left third is dark |
| 0.71 – 0.81 | Pull back: three bottles (white, rosé, red) and the glass on white linen |
| 0.83 – 0.91 | Pull back: a long banquet table under a vine pergola at dusk, guests raising glasses |
| 0.945 – 1 | Pull back: the banquet is a painting in a gilded frame in the same museum, heads along the bottom |

## 2. Look

- **Colour.** Night `#0b0705` (page and footer background). Paper `#f5efe8` (all text). Blush `#ecd9e3` (italic accents, filled buttons). Dim text is paper at 50%.
- **Type** (Google Fonts). Instrument Serif, regular and italic, for headlines; every `<em>` is Instrument Serif italic in blush. Inter 400/500/600 for body, nav and buttons. DM Mono 400 for two small labels.
- **Buttons.** Small pills, 26px high, 12px side padding, 11.5px/500 Inter. Filled: blush background, text `#1b1210`. Outlined: 1px paper at 60%, paper text, a faint dark fill `rgba(11,7,5,.28)`. Hover: white fill, dark text. Press: scale 0.97.
- **Legibility.** A veil over the film: a top gradient from `rgba(11,7,5,.42)` to clear at 22%, and a bottom gradient from `rgba(11,7,5,.5)` to clear at 34%. Headlines and body copy carry a soft dark text-shadow.
- Page padding: `clamp(14px, 2.9vw, 52px)` on the sides (called *pad* below).

## 3. Page structure

1. A fixed header over everything.
2. `<main class="track">`, 1250vh tall, containing a sticky stage (`top: 0; height: 100svh; overflow: hidden`) that holds the canvas, the veil and the eight blocks of copy, all absolutely positioned over each other.
3. A short footer after the track.

### Header (fixed, three columns: chapters left, logo centre, actions right; aligned to the top)

- **Chapters**, top left: a vertical list about `clamp(120px, 11.5vw, 190px)` wide, `clamp(11.5px, .95vw, 15px)`/500. Each row has the name on the left and a roman numeral on the right (Instrument Serif, a little smaller), with a hairline (`paper` at 10%) under every row but the last: The estate I, Vineyard II, Harvest III, Cellar IV, Wines V, Visits VI, Club VII. Rows are dim; the current chapter is full paper (0.4s colour transition).
- **Logo**, centre: a small grape-bunch glyph (inline SVG: six circles in a 3-2-1 triangle with a short stem) and the word "Uvra" in Inter 600, `clamp(15px, 1.25vw, 20px)`.
- **Actions**, right: a dim "Shop" link with a tiny bag icon, an outlined pill "Book a visit", a filled pill "Uvra Club".
- A **meter**: a 2px-wide, ~3vh-tall paper tick fixed on the right edge of the window that travels from top to bottom with film progress.

## 4. The engine (`js/main.js`)

- **Progress.** Each frame: `target = clamp(-track.getBoundingClientRect().top / (track.height - innerHeight) / 0.965, 0, 1)`. The film ends at 96.5% of the track so the last scene can be read before the footer arrives. Ease the shown progress toward the target: `shown += (target - shown) * (1 - Math.exp(-dt * 7))`, with `dt` capped at 0.05 s. Everything (film, copy, chapters, meter) is driven by `shown`.
- **Loading.** Load frame 0 first and paint it, then the last frame, then the rest coarse to fine: every 32nd frame, then every 16th, 8th, 4th, 2nd, then all, eight downloads at a time. Never block the page on loading.
- **Painting.** The canvas is 1280 × 720 with `object-fit: cover` filling the stage. Film position is `shown * 333`. If the two frames around it are loaded, draw the lower one, then the upper one on top with `globalAlpha` equal to the fraction, so 10 frames a second reads as smooth motion. If they are not loaded yet, draw the nearest loaded frame and keep trying. When the scroll has settled, snap to the nearest whole frame so the picture at rest is sharp.
- **Copy.** Every scene has `data-show="inFrom,inTo,outFrom,outTo"` in film progress. Visibility is `smoothstep(inFrom, inTo, p) * (1 - smoothstep(outFrom, outTo, p))`. Apply it as opacity, plus up to 12px of blur and 22px of vertical travel: copy rises in from below and lifts out upward. Hidden scenes get `visibility: hidden`.
- **Chapters.** A chapter starts at its scene's `inTo + 0.004` (the estate starts at 0). The current chapter is the last one whose start is at most 0.03 ahead of `p`. Clicking a chapter, the logo, or a header action smooth-scrolls to that chapter's start: `track.offsetTop + start * 0.965 * (track.offsetHeight - innerHeight)`. Header mapping: logo → estate, Shop → wines, Book a visit → visits, Uvra Club → club. Buttons inside scenes do nothing (prevent the default jump).

## 5. The eight scenes

Headlines ("title") are Instrument Serif, `clamp(34px, 4.5vw, 84px)`, line-height 1. Body lines ("lede") are Inter 500, `clamp(13px, 1.12vw, 18px)`, line-height 1.42, at most 32 characters wide. Words in *italics* below are `<em>`.

| # | id / chapter | `data-show` | Copy | Where it sits |
| --- | --- | --- | --- | --- |
| 1 | `estate` | `-1,-1,0.04,0.072` (visible from the start) | Label: "Allegory of the harvest". Lede: "High-altitude wines, picked by hand and aged *as long as they need*." Giant `h1`: "Every wine has a *landscape*" | Label at `left: 23.5vw; top: 8.2vh` (just above the top-left corner of the picture frame). Lede at left pad, `top: 62vh`, 30ch. Giant line along the bottom |
| 2 | `vineyard` | `0.158,0.18,0.24,0.26` | "It starts *up high*." / "Forty-five acres at 1,600 feet, where cold nights keep the grapes' acidity." | Centred, in the sky: `padding-top: 11.5vh`, title then lede |
| 3 | `harvest` | `0.268,0.285,0.335,0.352` | "Picked *by hand*." / "Bunch by bunch, into 40 lb lugs, in the first hours of the morning." | Title bottom left; lede bottom right, 28ch |
| 4 | `cellar` | `0.402,0.42,0.465,0.482` | "Pressed *slowly*." / "The basket press draws the juice without bitterness from the skins." | Vertically centred, starting at `63vw` from the left (to the right of the stream of juice) |
| 5 | (no id, still the Cellar chapter) | `0.628,0.645,0.672,0.688` | "Tasted *barrel* (line break) *by barrel*." / "It only goes into the bottle when the winemaker tastes it and says it's ready." | Vertically centred at left pad, in the left 40% (left of the glass), lede 26ch |
| 6 | `wines` | `0.708,0.725,0.795,0.812` | "Three wines, *one hillside*." / "From the same harvest, in small lots. Free shipping on two bottles or more." / filled pill "See the wines" | Centred along the bottom, lede on one line |
| 7 | `visits` | `0.826,0.842,0.892,0.908` | "The table is *in the vineyard*." / "Guided tastings, a paired lunch under the pergola and the open harvest, in September." / outlined pill "Book a visit" | Title bottom left; lede and pill bottom right, 30ch |
| 8 | `club` | `0.945,0.965,2,2` (never leaves) | Label: "The harvest banquet". Lede: "Three bottles a season, picked by the winemaker, and an invitation to the harvest." / filled pill "Join the club". Giant `h2`: "Pull up *a chair*" | Same layout as scene 1: label above the frame, lede and pill at left pad, `top: 56vh`, 24ch, giant line along the bottom |

- **Giant lines** (scenes 1 and 8): Instrument Serif, `clamp(46px, 10.1vw, 196px)`, line-height 0.92, letter-spacing −0.02em, one line, anchored `clamp(18px, 4.2vh, 44px)` above the bottom, from left pad. On load, the first one rises out of a mask (translateY 112% → 0, 1.3s, `cubic-bezier(0.16, 1, 0.3, 1)`, 0.25s delay).
- **Labels**: DM Mono, `clamp(9px, .72vw, 11.5px)`, uppercase, letter-spacing 0.22em, paper at 60%, with a 4px dot before the text.

## 6. Footer

Night background, two columns aligned to the bottom. Left: the logo, then "High-altitude wines in small lots, since the 2009 vintage." in Instrument Serif at `clamp(20px, 2.15vw, 38px)` (24ch wide), then in small dim text "Please drink responsibly. You must be 21 or older to purchase." Right, right-aligned, 12.5px/500: Shop, Visits, Club (these scroll back to their chapters), hello@uvra.com, then small dim "© 2026 Uvra Wines".

## 7. Small screens (760px and below)

- Header: logo on the left, only the "Uvra Club" pill on the right; hide the chapter list, Shop and "Book a visit".
- The film is cropped to its centre by `object-fit: cover`; it still reads.
- Every scene's copy stacks in the bottom-left corner (title, lede, button), left-aligned, with a stronger bottom veil (`rgba(11,7,5,.82)` fading out at 52%).
- Titles `clamp(38px, 12.2vw, 68px)`, ledes 14.5px. Giant lines `clamp(50px, 17.5vw, 96px)`, allowed to wrap onto two lines, with the lede (and pill) sitting just above them.
- The first label moves to left pad, 76px from the top; hide the last one.
- Footer stacks into one left-aligned column.

## 8. Details that matter

- `prefers-reduced-motion`: no easing (the film follows the scroll directly), no blur or travel on the copy (opacity only), no rise animation, instant chapter jumps.
- Preconnect to `https://res.cloudinary.com` and the Google Fonts hosts.
- The canvas is decorative (`aria-hidden`); the copy is real text in the DOM with one `h1`. Visible focus rings (1.5px blush outline).
- No horizontal scroll at any width.

## 9. Check before you finish

- At rest at the top: museum, label, lede, giant headline; "The estate" is lit.
- Scroll slowly: the film moves smoothly in both directions, and each line of copy appears over the footage described in the table in section 1 (for example "Pressed *slowly*." sits to the right of the stream of juice; "Three wines, *one hillside*." sits under the three bottles).
- At the end of the track: the banquet painting in the museum, "Pull up *a chair*", then the footer.
- Clicking "Wines" in the chapter list lands on the three bottles with their copy fully visible.
- No console errors; no frame request returns anything but 200.

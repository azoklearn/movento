Build the landing page for **Rastro**, a night test drive: a 911 GT3, a mountain road with 284 curves, an instructor in the passenger seat ("No showroom, no dealership. You drive the ridge and decide at the bottom."). The page is near-black with one red. It opens on a black-and-white film of the car leaving into the fog, its tail lights the only colour, scrubbed by the scroll under a newsprint dot screen; then a tachometer whose needle climbs as you scroll; then the road drawing itself in red; then four colour photographs of the night; then a solid red booking panel. Tight neo-grotesque type, tiny mono labels, red crosshairs like a camera viewfinder.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop, four `position: sticky` stages, one `<canvas>`, two inline SVGs. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

**The film.** One 8-second, 1080p video (1932 × 1080) on Cloudinary, which serves any moment of it as a still. The page never plays it: it loads 97 stills (12 per second) and draws them on a canvas. Every frame `i` (0 to 96) exists in a light version for scrubbing and a sharp one for when the film stops:

```
light:  https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<W>,q_40/rastro/film.webp
sharp:  https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<S>,q_80/rastro/film.webp
```

- `<T>` = `Math.max(0, (i - 0.5) / 12).toFixed(3)` (frame 0 is `so_0.000`, frame 96 is `so_7.958`).
- `<W>` = `960`, or `640` when `innerWidth < 760`. `<S>` = `1920`, or `1280` when `innerWidth < 760` or `Math.max(innerWidth, innerHeight * 16 / 9) * Math.min(devicePixelRatio, 2) < 1300`.
- Only these four combinations are cached; keep the URLs exactly in this form with three decimals.
- The light film weighs about 2 MB (23 KB a frame); sharp frames about 120 KB each, fetched one at a time.

What is in it: a dark sports car with a big rear wing, seen from behind, pulls out of a wet hairpin (a valley of lights on the left at first), and drives away down a forest road into fog; black and white except its red tail-light bar and the red streaks it leaves on the wet road. The car starts right of centre and ends small in the centre.

**Stills.** Base `https://res.cloudinary.com/ce2yatay/image/upload/rastro/`

| File | Size | What it is |
|---|---|---|
| `night-1.webp` | 2240 × 1267 | Colour, night: a gas station canopy, three people, the car, red lights on wet ground |
| `night-2.webp` | 2240 × 1267 | Aerial: the road coiling down a cliff, drawn as red light trails, mist |
| `night-3.webp` | 2240 × 1267 | The car parked at an overlook, a river of amber lights in the valley |
| `night-4.webp` | 2240 × 1267 | First light: the car, headlights on, on an empty wet road |
| `d-rear.webp`, `d-wing.webp`, `d-wheel.webp`, `d-shift.webp` | 800 × 603 | Black-and-white details (rear, wing, wheel, gear lever), each fading to black at its edges |

## 2. Look

- Colours: page `#0b0b0c`, red `#f5190f`, type `#f3ede4`.
- Fonts (Google Fonts): **Inter Tight** 400–500, letter-spacing −0.045em on large type, −0.065em on the biggest; **JetBrains Mono** for labels (8–9px, uppercase, 0.14em).
- **Dot screen**: over the film and the dark photo, a layer `radial-gradient(circle, rgba(0,0,0,.62) 0.9px, transparent 1.25px)` tiled at 4px with `mix-blend-mode: multiply`, so the pictures look printed.
- **Crosshairs**: a few 11px red "+" marks at fixed spots on each stage.
- Fixed header (appears once the opening title has scrolled away): left mono "**01** THE RIDGE" (number red; it follows the section: 02 TACHOMETER, 03 284 CURVES, 04 THE NIGHT, 05 BOOK), centre "R A S T R O" in widely spaced mono, right two short red lines as a menu mark. Fixed at the bottom centre: an outlined pill "Book a test drive ↗" that turns red on hover and hides over the booking panel.

## 3. Stage 01: the ridge (`560vh` track)

Sticky stage with the canvas (`object-fit: cover`, contrast 1.12) under the dot screen. Track progress `p`, eased (`shown += (target − shown) × (1 − exp(−dt × 7))`). The film uses the first 66% (`film = p / 0.66`); the last third dims it for the sentence.

- **Opening (p < 0.07)**: top-left, a huge red "Rastro." (13.6vw, weight 500) underlined by a red rule; under the rule a row of three tiny labels: "Rastro Ridge", "284 curves", and "Night" at the far right of the screen. Bottom-right a huge red "911" (20.5vw) running off the corner; bottom-left mono "35°19′N 83°47′W". All of it fades between 1.5% and 7%.
- **Stamps**: at mid-height, left "NOV 12", right a clock that runs from "11:40 PM" to "11:47 PM" with the film (2.35vw, uppercase). Near the car a tiny dark HUD box with a red left edge shows rpm and gear readouts that change with the film. Stamps and HUD fade out around 60%.
- **Film engine**: load light frame 0, then the last, then the rest coarse to fine (every 32nd, 16th, 8th, 4th, 2nd, all), eight at a time. While moving, cross-fade the two frames around the position with `globalAlpha`. At rest, snap to a whole frame and, after 140ms, fetch its sharp version and fade it in over 0.3s. On tall screens move `object-position` x from 68% to 50% over the first 40% of the film so the car stays in the crop.
- **The sentence (p 0.62 → 1)**: the film dims to 14%. Top-left, 2.24vw, 27em wide: "Five hundred and two horsepower, no turbos, and a road with 284 curves that drops three thousand feet into the dark. The GT3 wasn’t built for straight lines. **It was built for this.**" Split it into words: they start at 22% white and light up one by one as `p` goes from 0.72 to 0.96; the last sentence lights up red. Right of centre, a small note: red mono "[ NIGHT / TEST ]" and "Test drive with an instructor, departing Robbinsville at 11:40 PM. Groups of three cars. Back before sunrise."

## 4. Stage 02: tachometer (`520vh` track)

Sticky stage. An inline SVG gauge, `min(92vw, 164vh)` wide, sitting near the bottom: a thin semicircular arc from left to right, ten ticks numbered 0–9 ("9,000" on the last), a red needle from a red hub at the bottom centre. With `rev = smoothstep(0.04, 0.96, p)`: the needle turns from pointing left to pointing right (`−90° + 180° × rev`), and a red stroke follows it along the arc (`stroke-dashoffset`). Left of the hub a mono number counts the revs (0 → 9,000, steps of 10, turning red above 8,000) with "RPM / 03 / 06" beside it.

Six specs appear one at a time, each for about ±8.5% of the track around its moment, with a rise and fade; four have a detail picture behind the text (masked with a soft radial fade, slightly overlapping the caption). Each has a tiny mono tag and a 1.4vw line:

| At | Tag | Line | Picture | Where |
|---|---|---|---|---|
| 0.14 | 01 · 1,500 RPM | 502 hp, naturally aspirated. No turbo between your foot and the engine. | `d-rear` | left, mid-height |
| 0.30 | 02 · 3,000 RPM | 0 to 60 mph in 3.2 s, with the PDK. | none | lower right |
| 0.46 | 03 · 4,500 RPM | Fixed swan-neck rear wing, 4 positions. | `d-wing` | top centre, right-aligned |
| 0.62 | 04 · 6,000 RPM | 3,164 lb curb weight. | `d-wheel` | right, lower |
| 0.78 | 05 · 7,500 RPM | 7-speed PDK. Or a 6-speed manual, if you prefer. | `d-shift` | left, lower, right-aligned |
| 0.92 | 06 · 9,000 RPM | Six cylinders, 4.0 liters. Redline at 9,000 rpm. | none | upper right |

## 5. Stage 03: 284 curves (`340vh` track)

Sticky stage over `night-2.webp` in greyscale at 42% brightness under the dot screen. Top-left, red, 6.5vw, weight 500: "284 curves / and no two / alike." On the right (from 60vw, 82vh tall) an SVG path of a road snaking down in seven switchbacks: a faint grey copy of the whole path, and a red copy that draws itself as `p` goes 0.06 → 0.94, with a red dot riding its tip. Bottom-right a mono counter "000 → 284" with "/ 284" and an altitude falling from "4,790 ft" to "1,510 ft". Bottom-left: red mono "[ 7.5 MI · 4,790 FT ]" and "Seven and a half miles of asphalt clinging to the hillside, from the overlook down to Robbinsville. Every curve asks for a different gear."

## 6. Stage 04: the night (`440vh` track)

Sticky stage with the four `night-*.webp` photographs stacked full-bleed in colour. As the track scrolls, each next picture wipes up over the last from the bottom edge (`clip-path: inset(X% 0 0 0)`), every picture easing from 1.1× to 1.02×. Bottom-left caption per picture (a red mono number, a title, a small line); bottom-right four short bars and "02 / 04".

1. [01] Robbinsville, 11:40 PM — Coffee, tires warming, the instructor walks through the descent.
2. [11] Curve 47 — The tightest on the ridge. Second gear, 7,800 rpm on exit.
3. [19] The overlook, 4,790 ft — A two-minute stop. The engine ticks as it cools.
4. [24] Back before sunrise — The road is drying by the time you hand back the key.

## 7. Book and footer

**Book** (solid red `#f5190f`, cream type): mono "[ BOOK ]"; a 2.75vw statement, 21.5em wide: "No showroom, no dealership. You drive the ridge with an instructor beside you and decide at the bottom."; a one-row form with underlined fields and tiny mono labels: NAME, MOBILE, NIGHT (a select: Nov 12 · Thursday / Nov 19 · Thursday / Nov 26 · Thursday), and a cream pill "Take me down the ridge ↗" (turns black on hover). On submit, validate and replace the form with "You’re on the list. We’ll text you the meeting point." Bottom-right, the huge "911" again, in cream.

**Footer** (black): "R A S T R O" in spaced mono; four small columns: "Night test drive / Rastro Ridge, NC"; "Thursdays · Nov 12 · Nov 19 · Nov 26 / Departing Robbinsville, 11:40 PM"; mono "35°19′N 83°47′W / 4,790 ft"; "Back to top ↑". Last line, dim: "Concept demo. Fictional site, no affiliation with the manufacturer; the model name only identifies the car pictured." and "© 2026".

## 8. Small screens (≤ 760px)

Title 25vw, "911" 36vw; hide the HUD; the sentence at 23px with the note at the bottom; the gauge 150vw wide and raised, specs all at the top-left with their picture 46vw wide; the road drawing on the right half below the title; captions above the counter; the form in one column; footer 2 × 2.

## 9. Details and checks

- The canvas, gauge and road are decorative (`aria-hidden`); all copy is real text, one `h1`. `prefers-reduced-motion`: no easing, no zooms.
- Top: "Rastro." and "911" in red over the first frame, the clock at 11:40 PM.
- Scrolling: the car leaves into the fog while the clock runs to 11:47; the picture dims and the sentence lights up word by word, ending in red.
- The needle sweeps to 9,000 while six specs come and go; the road draws in red while the counter runs to 284; four photographs wipe up one after another; the red panel closes the page.
- Stop anywhere in the film: the frame sharpens within half a second.
- No horizontal scroll at any width; no console errors; no frame request returns anything but 200.

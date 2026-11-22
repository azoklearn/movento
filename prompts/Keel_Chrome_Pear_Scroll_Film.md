Build the landing page for **Keel**, a studio that builds custom software and gets paid as a share of the revenue it drives ("Not a partner on the clock, a partner in the payout"). The first part of the page is a film the visitor scrubs by scrolling: a world of liquid-chrome classical statues under a deep blue sky. It opens on a statue holding up a light ringed with glowing circles above a crowd of statues, sinks into a chrome pear tree, a chrome hand picks a pear, a statue slices it, and two hands hold the halves, which show real pear flesh. Then the picture breaks into pixels and leaves open sky, where the second part of the page, a list of what Keel does, is read beside drifting chrome clouds. White serif headlines, tiny mono labels on black buttons, thin white drafting hairlines over everything.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop, a `position: sticky` stage, one `<canvas>`. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

**The film.** One 15-second, 1080p video (1932 × 1080) is hosted on Cloudinary, which serves any moment of it as a still image. The page never plays the video: it loads 181 stills (12 per second of film) and draws them on a canvas. Every frame `i` (0 to 180) exists in two versions: a light one for scrubbing, and a full-quality one shown when the film stops.

```
light:  https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<W>,q_40/keel/film.webp
sharp:  https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<S>,q_80/keel/film.webp
```

- `<T>` is the offset in seconds: `Math.max(0, (i - 0.5) / 12).toFixed(3)`. (The offset returns the first frame at or after it, so aim half a frame early.) Frame 0 is `so_0.000`, frame 1 is `so_0.042`, frame 180 is `so_14.958`.
- `<W>` (light) is `960`, or `640` when `innerWidth < 760`.
- `<S>` (sharp) is `1920`, or `1280` when `innerWidth < 760` or when `Math.max(innerWidth, innerHeight * 16 / 9) * Math.min(devicePixelRatio, 2) < 1300`.
- Only these four combinations (`w_640,q_40`, `w_960,q_40`, `w_1280,q_80`, `w_1920,q_80`) are already cached. Keep the URL exactly in this form, with three decimals; anything else makes Cloudinary render new images on the fly and the first load is slow.
- Weight: the whole film is preloaded in the light version only, about 10 MB at 960 (55 KB a frame) or 5 MB at 640. Sharp frames are fetched one at a time, only for the frame the film rests on (about 255 KB at 1920, 140 KB at 1280).

The same film as a plain video, for reference only: `https://res.cloudinary.com/ce2yatay/video/upload/keel/film.mp4`

What is in it, in film progress `f` (0 = first frame, 1 = last):

| `f` | Picture |
|---|---|
| 0 – 0.06 | Low angle, deep blue sky: a chrome statue of a robed woman on a column (right) holds up a blazing white orb ringed by five thin glowing circles; a crowd of chrome statues along the bottom looks up |
| 0.06 – 0.28 | The camera drops past a robed figure seen from behind at a chrome balustrade, beside the fluted column |
| 0.28 – 0.36 | Open sky and clouds, a chrome tree approaching |
| 0.36 – 0.50 | Inside the canopy of a chrome pear tree: mirror leaves, chrome pears |
| 0.50 – 0.58 | A chrome hand with an engraved cuff closes around one pear, centre |
| 0.58 – 0.66 | The pear is carried out of the tree |
| 0.66 – 0.82 | A chrome statue of a curly-haired young man (right) holds the pear and slices it with a small knife |
| 0.82 – 1 | Two chrome hands, from left and right, hold the two halves side by side in the centre: chrome skin, real creamy flesh and seeds; a chrome leaf falls, a white cloud below |

**The cloud.** `https://res.cloudinary.com/ce2yatay/image/upload/keel/cloud.webp` (875 × 481, transparent): one puffy cloud made of mirror chrome. It is reused six times at different sizes, some mirrored.

## 2. Look

- Colours: sky gradient `#3d69c4 → #5a88d6` behind the film, continuing `#5a88d6 → #76a3e2` down the list section; type white; buttons `#07080c` with white text; hairlines white at 30%.
- Fonts (Google Fonts): **Newsreader** 400 for headlines (tight, −0.022em); **Inter** 500 for body; **JetBrains Mono** 700 for buttons, tags and labels, uppercase with wide tracking (0.24–0.32em).
- Sizes for a 1280px-wide window; scale with `vw` and clamp: headlines 50px (`3.95vw`), line-height 1.08; serif sub-line 17px; body 13px; list titles 26px; mono 8–10px.
- Buttons: black, 3px radius, about 33px tall, mono label, then a small square outlined box holding "→" (the box fills white on hover). Tags: a small pill, white at 24% opacity, tiny mono caps.
- Text over the film gets a soft blue text-shadow for legibility.

## 3. Fixed chrome (above everything, `pointer-events: none` except links)

- **Header**, 68px tall: left, a white water-drop icon centred in the first 68px; right, a small black "APPLY →" button (a `mailto:`).
- **Hairlines**: one horizontal line across the page at 68px from the top, one vertical line down the page at 68px from the left. Under the header, in the left gutter, a tiny 2 × 2 dot grid.
- **Section index**, hanging on the left hairline about 68px below the header: four short ticks stacked 22px apart; the current one is longer (22px against 7px). Beside the first tick, a mono label naming the current part: nothing during the opening, then "THE STANDARD" (from `f` = 0.30), "THE SHARE" (from `f` = 0.82), "THE WORK" (once the list section passes the middle of the screen). Clicking a tick scrolls to that part.

## 4. Part one: the film (`<main class="track">`, 1000vh tall)

A sticky stage (`top: 0; height: 100svh; overflow: hidden`) with the sky gradient as its background, holding the canvas (`object-fit: cover`), the first cloud, and two blocks of copy. Track progress `p` runs 0 → 1; the film uses the first 90% (`f = p / 0.9`), the dissolve the last 10% (`d = (p − 0.9) / 0.1`).

**Copy.** Each block has `data-show="inFrom,inTo,outFrom,outTo"` in film progress; visibility is `smoothstep(inFrom, inTo, f) × (1 − smoothstep(outFrom, outTo, f))`, applied as opacity plus up to 10px of blur and 20px of vertical travel (rises in, lifts out).

| Block | `data-show` | Content |
|---|---|---|
| Opening | `-1,-1,0.065,0.105` (visible from the start) | `h1` "Keel helps you emerge." / serif sub-line on two lines: "Not a partner on the clock, / a partner in the payout." / button "START A PARTNERSHIP →". Lower row: tag "ON CALL FOR YOU", then a paragraph: "We ship custom software, rank it where customers search, and take our pay as a share of the revenue it drives. No retainers, no hours: if you don’t grow, we don’t get paid." |
| Standard | `0.5,0.55,0.765,0.8` | `h2` on two lines: "We excel at / what it takes." Lower row: tag "UNDENIABLE", then "At Keel, we help the best businesses become undeniable." |

Layout of both: type starts 8.4vw from the left. A third hairline crosses the stage at 69vh, with a small four-point sparkle where it meets the left hairline. The headline group sits just above that line (its bottom at 65vh); the lower row sits just under it (72.4vh), as two columns: the tag, then the paragraph 13.9vw further right, at most 33vw wide.

**Engine.**

- Progress: each frame, `target = clamp(−track.getBoundingClientRect().top / (track.height − innerHeight), 0, 1)`, eased `shown += (target − shown) × (1 − exp(−dt × 7))`, `dt` capped at 0.05s.
- Loading: light frame 0 first, then the last frame, then the rest coarse to fine (every 32nd, 16th, 8th, 4th, 2nd, then all), eight downloads at a time. Never block the page.
- Painting while moving: the canvas is as large as the sharp frame (1920 × 1073, or 1280 × 716). Film position is `f × 180`; if the two light frames around it are loaded, draw the lower one then the upper one with `globalAlpha` equal to the fraction (so 12 frames a second reads as smooth); otherwise draw the nearest loaded frame and keep trying.
- At rest (`|target − shown| < 0.0003`): snap to the nearest whole frame; after 140ms on it, request that frame's sharp version, and fade it in over 0.3s on top of the light one. Keep the last 24 sharp frames in memory.
- **Dissolve** (`d` from 0 to 1): draw the last frame (sharp if available) and erase square cells from it with `clearRect`, so the sky gradient behind the canvas shows through. Cells are 1/150 of the canvas width. Each cell has a fixed vanishing moment `0.62 × distance + 0.38 × random`, where distance is measured from a point just above the picture's centre (0 at the centre, 1 at the far edges, stretched so the picture clears as a wide oval): the picture opens between the two pear halves and the hole grows outward. A cell is gone when `1.12 × d` exceeds its moment. For a short while after a cell goes (the first 0.07), about half of them leave a smaller square of debris (white, pale blue or deep navy) that is pushed outward from the centre. By `d ≈ 0.9` nothing is left.
- **First cloud**: centred at 43% of the stage height, 30vw wide, behind the copy. Its opacity is `smoothstep(0.4, 0.85, d)` and it grows from 0.78 to 1: it condenses out of the dissolving picture and is alone on the sky when the track ends.
- On tall screens the film is cropped at the sides: set the canvas `object-position` x from 72% at the start (the statue and its light) to 50% by `f` = 0.3.

## 5. Part two: the work (a normal section, about 300vh)

Sky gradient `#5a88d6 → #76a3e2`, so it continues the stage seamlessly.

- **Ruler**: a vertical white line at 61.5vw, the full height of the section, with a 16px tick every 100px and a 34px tick every 300px. A tiny mono percentage sticks near the bottom of the screen just left of the ruler and reads how far through the section the visitor is ("42%").
- **List**, just right of the ruler, 31vw wide, items 27vh apart; each item is a tag, a serif title (26px, two lines), and a paragraph; items fade and rise 14px as they enter:
  1. SEARCH ENGINE OPTIMISATION / "Everything it takes to be found, under one roof." / "Search and software are one discipline at Keel. The product is built to rank from its first commit, and the SEO is done by the people who wrote the code."
  2. CUSTOM SOFTWARE / "Custom software, made like products, not projects." / "We ship custom software, rank it where customers search, and take our pay as a share of the revenue it drives."
  3. CONVERSION / "Conversion systems, pricing and funnel changes." / "No retainers, no hours: if you don’t grow, we don’t get paid."
  4. RETENTION / "Retention loops, lifecycle and owned audience." / "Every line of code, every page, every asset — assigned to you from day one."
  5. THE SHARE / "One core. Two halves." / "We only take a piece of what we ship. Tell us what you’re building and we’ll tell you, honestly, whether we can lift it." / button "START A PARTNERSHIP →"
- **Clouds**: five copies of the cloud placed down the left two thirds of the section (one near the right edge), 20–26vw wide, two of them mirrored, each with a soft blue drop shadow. Each drifts at its own rate against the scroll (between −0.1 and +0.24 of the scroll distance) and bobs ±8px slowly.
- A tiny mono footer at the bottom: "© 2026 KEEL" left, "PAID ON THE SHARE, NEVER ON THE CLOCK." right.

## 6. Small screens (≤ 760px)

- Type starts just right of the left hairline; headlines 36px; the lower row stacks (tag above paragraph).
- The ruler moves onto the left hairline, the list takes the full width to its right, clouds are 46vw wide and sit on the right half.
- First cloud 62vw wide.

## 7. Details

- The canvas, clouds and hairlines are decorative (`aria-hidden` / empty `alt`); all copy is real text with one `h1`. Index ticks are links with labels.
- `prefers-reduced-motion`: no scroll easing, no blur or travel on the copy, sharp frames swap in without a fade, clouds do not bob.
- Visible focus rings (1.5px white outline).

## 8. Checks

- At rest at the top: the statue and its rings of light, headline at the left, black button, the paragraph row under the low hairline.
- Scroll slowly: the film moves smoothly in both directions; "We excel at what it takes." appears as the hand closes on the pear and leaves after the knife; the index label changes to "THE STANDARD", then "THE SHARE".
- Stop anywhere: within about half a second the picture sharpens, and one `w_1920,q_80` (or `w_1280,q_80`) request appears for that frame.
- At the end of the film the two pear halves break into pixels from the middle outward, the sky shows through, and one chrome cloud is left in the centre.
- Then the list scrolls in beside the ruler, the percentage climbs, clouds drift, and the label reads "THE WORK".
- No horizontal scroll at any width; no console errors; no frame request returns anything but 200.

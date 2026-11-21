Build the landing page for **Lumen & Co.**, a podcast growth studio ("strategy, creative and promotion for podcasts and creators who want to go further"). One long page, four scenes, everything in a single blue: a classical statue wrapped in tape printed SPONSORED, podcast covers drifting past it, a block of stats that turns as you scroll, a fly-through of covers on navy that ends on a glowing crystal mark, and a thick blue route that draws itself through four steps. Editorial and confident: big serif headlines with italic accents, cool paper background, royal blue, deep navy, nothing else.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop that reads the scroll position, `position: sticky` stages, CSS 3D for the stat block. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, nothing to generate)

Use these URLs directly; do not download, regenerate or re-encode anything. Base: `https://res.cloudinary.com/ce2yatay/image/upload/lumen/`

| File | What it is |
| --- | --- |
| `statue.webp` | 1400 × 1400, transparent. A royal-blue statue bust wrapped in SPONSORED tape, face turned to the right, cut off at the chest by the bottom edge; shoulders span the full width. |
| `ribbon.webp` | 760 × 1156, transparent. A blue ribbon curling in a vertical spiral, printed SPONSORED ///. |
| `crystal.webp` | 800 × 800, on pure black. A glowing blue eight-pointed crystal star. Show it with `mix-blend-mode: screen` on the navy. |
| `stats/mic.webp` | 660 × 876. Studio microphone, tinted, on flat `#5f76d6`. |
| `stats/headphones.webp` | 800 × 800. Headphones, tinted, on flat `#0d1740`. |
| `stats/host.webp` | 660 × 876. A host speaking into a mic, tinted, on flat `#cad1e9`. |
| `covers/next-episode.webp` | 660 × 876 each, blue-tinted photographs with no text: studio microphone (dark) |
| `covers/on-air.webp` | mixing desk (bright) |
| `covers/long-form.webp` | mountains (pale) |
| `covers/host.webp` | woman with headphones at a mic |
| `covers/ideas.webp` | woman in profile on bright blue |
| `covers/creator-talks.webp` | broadcast mic on a boom arm (light) |
| `covers/diaries.webp` | man looking up at a night sky (dark) |
| `covers/deeper.webp` | rocky coastline |
| `covers/idea-hour.webp` | vintage microphone (dark) |
| `covers/better.webp` | man in a cap, hazy and pale |

The three `stats/` images have a flat background that is exactly the colour of the card face they sit on, so they need no cut-out. The cover photographs carry no lettering: titles are set in HTML on top.

## 2. Look

- **Colour.** Paper `#f2f3f9`. Ink `#0d1433`. Blue `#2644ea`. Night `#0b1119`. Ghost line `#d6daeb`.
- **Type.** DM Serif Display (regular and italic) for headlines, numbers and the logo word. Inter (400/500/600) for body and labels. Barlow Condensed 700, uppercase, for cover titles. Caveat 700 for one handwritten cover. All from Google Fonts.
- **Buttons.** Fully rounded blue pills, white 13px/600 label followed by a small arrow that nudges right on hover.

## 3. Covers (one component, used in two scenes)

A 3:4 card with 0.62em corners, the photograph as background, a soft shadow, a condensed uppercase title at the top left and a small waveform glyph at the bottom left. Size everything in em of the card width (`font-size: width / 10`) so a cover looks identical at any scale.

| Cover | Title | Notes |
| --- | --- | --- |
| next-episode | THE / NEXT / EPISODE | white |
| on-air | ON AIR | white, larger |
| long-form | THE / LONG / FORM | navy text |
| host | none | |
| ideas | IDEAS / IN PUBLIC | white |
| small | SMALL / SHOWS / BIG / DREAMS | no photo: flat `#07122f`, very large title, a long waveform across the bottom |
| creator-talks | CREATOR / TALKS | white |
| diaries | THE / CREATOR / DIARIES | white |
| deeper | Deeper / Conversations | Caveat, not uppercase, rotated −9° |
| idea-hour | THE / IDEA / HOUR | white |
| better | BETTER / THAN / YESTERDAY | navy text, larger |

## 4. Scene one: hero (one viewport, paper)

- **Curtain.** On load a navy sheet with a deeply curved bottom edge covers the screen, then lifts off the top (1.25s, `cubic-bezier(0.7, 0, 0.2, 1)`).
- **Nav**, scrolls away with the hero: at left a blue eight-armed asterisk and "Lumen & Co." in serif; centred links Podcasts, Creators, Growth, About, each with a shallow blue arc drawn under it like a pen stroke; "Book a call →" pill at right.
- **Headline**, top right, right-aligned, two lines at `min(5.8vw, 11.6vh)`: "Grow shows into" / "loyal *audiences.*" (last word italic). Each line rises out of a mask after the curtain.
- **Statue**, bottom-anchored, 11vw from the left, `min(87vh, 48vw)` wide, rising in slightly as it fades up.
- **Cover rail.** The eleven covers (9.8vw wide, in the table's order) travel right to left in an endless loop along a shallow arc: lowest at 62% of the width and 55% of the height, climbing about 12–13% of the height toward both edges, each card tilted to the slope of the arc. They drift on their own and scrolling pushes them along. The rail sits **behind** the statue, so covers disappear behind its head and reappear. On load the row slides in from the right while fading up.
- **Aside**, right edge at 68% of the height: the sentence "Strategy, creative and promotion for podcasts and creators who want to go further." and a larger "Book a call →" pill.
- **Badge**, bottom left: the words "LUMEN & CO · MADE FOR LOUDER SHOWS ·" set on a circle that rotates slowly, with a four-pointed star in the centre.

## 5. Scene two: the numbers (about 330vh tall, sticky stage, paper)

- A single enormous serif sentence, `10.2vw`, runs across the middle and slides left with the scroll: "grow every show while we watch the *charts* climb ·" repeated.
- In front of it, centred, a **four-sided block** about `min(21vw, 37vh)` wide and 0.7:1 in proportion, built with CSS 3D (four faces at 0°, 90°, 180°, 270°, each pushed out by half the width). It makes three quarter-turns over the pinned scroll, eased, and arrives already turning (about 34° left to go as the section scrolls in). Faces dim slightly as they turn away. A soft shadow sits under it.
- Each face: a small label, a big serif number, and an image anchored to the bottom.

| Face | Colour | Label | Number | Image |
| --- | --- | --- | --- | --- |
| 1 | `#2644e8` | Avg. listens per show | 48K+ | `statue.webp` |
| 2 | `#5f76d6` | Total downloads | 320K+ | `stats/mic.webp` |
| 3 | `#0d1740` | Audience growth | +178% | `stats/headphones.webp` |
| 4 | `#cad1e9` (navy text) | Episode completion | 87% | `stats/host.webp` |

## 6. Scene three: the fly-through (about 460vh tall, sticky stage, night)

Covers hang in depth and the camera flies forward as you scroll. Do the projection yourself in 2D: each cover has a position `(x, y)` in half-viewports from the centre and a distance `z`; on screen it is drawn at `(x, y) / d` with scale `1 / d`, where `d = z − camera`. It emerges from the dark when far (fade in between `d` 3.9 and 2.9), dissolves as it passes the camera (fade out between 0.5 and 0.2), and nearer covers stack on top. Base width at `d = 1` is 14vw.

Scatter ten covers between `z` 1.15 and 4.45, off-axis in all four quadrants. The eleventh, **small** (SMALL SHOWS BIG DREAMS), sits almost on the axis at `z` 4.9 and is the destination: over the first 76% of the scroll the camera travels until that cover is at `d = 0.55`, about a quarter of the viewport wide, alone in the centre. Between 80% and 90% it shrinks a little and fades while `crystal.webp` fades in at the same spot, scaling from 0.5 to 1 and untwisting 40°; after that the crystal just turns very slowly.

Put the navy background on the sticky stage itself, not only on the section, or the `screen` blend has nothing to blend with.

## 7. Scene four: the route (paper)

- **Head.** Left, a small paragraph: "We handle the strategy, creative, editing and promotion, so you can focus on what you do best." Right, right-aligned serif at 5.6vw on two lines: "Four steps, then" / "*louder shows*". The headline darkens from 35% to full opacity as it scrolls in.
- **The route** lives in a full-width box with a 1440 × 1640 coordinate system. One SVG path, stroke 22, round caps, drawn twice: a ghost in `#d6daeb` and the blue line on top, revealed with `stroke-dashoffset` as you scroll so its tip runs a little ahead of the middle of the screen. Use exactly this path:

```
M-30 250C140 160 320 122 448 133C610 147 708 290 735 440C756 556 722 592 667 585C566 572 520 520 556 462C594 402 700 418 790 442C960 488 1110 552 1178 652C1262 776 1258 900 1168 968C1100 1018 1010 1032 945 1048C790 1086 600 1128 548 1240C500 1344 620 1424 790 1452C850 1462 900 1465 941 1463C1100 1456 1300 1432 1470 1404
```

  It sweeps in from the left, loops once, swings out to the right, and snakes back down.
- **Steps.** A navy numbered dot sits on the line at each point below; the copy block is placed beside it (positions in % of the box). Dot and copy start muted (grey dot, copy at 28%) and wake up when the blue line reaches the dot.

| # | Dot at | Title | Text | Copy block |
| --- | --- | --- | --- | --- |
| 01 | 448, 133 | Audit | We study every episode, chart and listener drop-off before we change a thing. | left 47.6%, top 8.4% |
| 02 | 667, 585 | Shape | Format, artwork and trailers get rebuilt around what keeps people listening. | left 57.6%, top 17.8% |
| 03 | 945, 1048 | Launch | Paid, social and cross-promo campaigns put each episode in front of the right ears. | right 29.9%, top 53.4%, right-aligned |
| 04 | 941, 1463 | Grow | Weekly reports, fast tests and steady tweaks keep the charts climbing. | left 10.3%, top 78.4% |

- **Ribbon.** `ribbon.webp` hangs at the left edge, 17% of the width, starting 23% down the box, drifting a little slower than the page.
- **Footer**, centred, small: "© Lumen & Co. Podcast growth studio."

## 8. Small screens and motion preferences

Below 760px: hide the nav links and the badge; headline left-aligned at 10.6vw with the aside sentence and button directly under it; statue about 104vw wide, shifted left; covers 27vw wide; the stat block 52vw wide and the sentence at 22vw; fly-through covers 34vw; the route becomes a straight vertical rail down the left with the four steps stacked beside it, the rail filling as you scroll.

With `prefers-reduced-motion`: no curtain, no load-in, no idle drift or idle rotation; everything tied directly to scrolling still works.

## Done when

- The hero shows the statue with covers passing behind its head, the headline top right, and the rail keeps moving.
- Scrolling turns the stat block through all four faces while the sentence slides behind it.
- The navy scene flies through the covers, stops on SMALL SHOWS BIG DREAMS, and turns it into the crystal with no black box around it.
- The blue line draws itself through 01 to 04 and each step wakes as the line arrives.
- No console errors; 375 × 812 and 1440 × 810 both hold together with no overlapping text.

Build the landing page for **Crimson Rite**, a tattoo studio that treats ink as a ritual ("where ink is a vow written on skin"). The page is a full-screen experience in five scenes that the visitor plays by scrolling: stone statues lit in crimson on a black void, huge blackletter words that sit *behind* the statues, a few quiet lines of white type in the bottom-left corner, then four black-and-white portraits of the artists. Dark, sacred, gothic and very restrained: black, one red, white type.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop that reads the scroll position, one `position: sticky` stage. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

Base: `https://res.cloudinary.com/ce2yatay/image/upload/crimson-rite/`

| File | Size | What it is |
|---|---|---|
| `hero.webp` | 2240 × 1267 | Scene 1. A veiled stone woman raising a dagger, standing on a rock base in the centre of a black void, a vertical shaft of red light behind her, red mist on the ground |
| `hero-cut.webp` | 2240 × 1267 | The same picture with everything but the statue transparent. Same size, pixel-aligned with `hero.webp` |
| `about.webp` | 2240 × 1267 | Scene 2. Close-up of that statue from below: veiled face upper centre-right, raised fist gripping the dagger hilt top-left, glowing red edges |
| `legacy.webp` | 2240 × 1267 | Scene 3. A second statue (hair in a bun, draped dress) seen from below, raising a torch that glows red; she fills the right-centre. At the far left edge, the dark head of another statue, close to the camera |
| `legacy-cut.webp` | 2240 × 1267 | Cut-out of both statues of `legacy.webp` (the torch glow stays in the background), pixel-aligned |
| `artists.webp` | 2240 × 1267 | Scene 4. The torch statue full-length on a round pedestal, centred, red haze and low red fog over a glossy floor |
| `artists-cut.webp` | 2240 × 1267 | Cut-out of that statue and its pedestal, pixel-aligned |
| `keepers/bram.webp` | 600 × 1024 | Portrait, black and white: bearded tattooer bent over a forearm |
| `keepers/ike.webp` | 600 × 1024 | Portrait: black silhouette in a cap, in profile, on pure white |
| `keepers/sable.webp` | 600 × 1024 | Portrait: freckled face, very close, looking at the camera |
| `keepers/nia.webp` | 600 × 1024 | Portrait: short dark hair, arms crossed, floral sleeves |

Preload `hero.webp` and `hero-cut.webp`; lazy-load the rest.

## 2. Look

- Colours: page `#050303`; type `#f4efec`; secondary type the same at 62%; blackletter words `#560e0a` at 84% opacity; the one bright word ("Creators") `#b21e1a` at 80%.
- Fonts (Google Fonts): **Manufacturing Consent** for the blackletter words; **Inter Tight** 400 and 500 for everything else, with tight tracking (`letter-spacing: -0.03em` body, `-0.05em` on titles).
- Sizes, given for a 1440px-wide window; scale them with `vw` and clamp: side padding 66px (`4.58vw`, min 20px); small labels 12px; body 13px; titles 29px (`2.02vw`), weight 400; lead paragraphs 24.5px (`1.7vw`), line-height 1.36.
- Over the whole stage: about 45 tiny red embers drifting slowly upward on a canvas (`mix-blend-mode: screen`, flickering, radius 0.5–1.7px with a faint halo), and a barely visible pinstripe (`repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 1px, transparent 1px 7px)`).
- Hide the scrollbar; the progress bar (section 4) replaces it.

## 3. Structure

`<main class="track">` is 720vh tall and contains one sticky stage (`top: 0; height: 100svh; overflow: hidden`). The five scenes are stacked in it, each `position: absolute; inset: 0`. Scroll progress `p` (0 at the top of the track, 1 at the end) decides everything.

| Scene | `p` range | Content |
|---|---|---|
| 1 `hero` | 0 – 0.20 | picture + word "Crimson" + copy |
| 2 `about` | 0.20 – 0.41 | picture + copy |
| 3 `legacy` | 0.41 – 0.64 | picture + word "Our Legacy" + pinned note + copy |
| 4 `artists` | 0.64 – 0.82 | picture + two-line word "The Artists / Behind the Ink" |
| 5 `keepers` | 0.82 – 1 | four portrait cards + word "Creators" + copy |

**The word behind the statue.** In scenes 1, 3 and 4 the layers are, from back to front: the full picture, the blackletter word, the cut-out. Picture and cut-out are both `position: absolute; inset: 0; width/height: 100%; object-fit: cover` and receive exactly the same transform, so they stay aligned and the word appears to pass behind the statue while sitting in front of the light and the mist.

**Blackletter words.** Centred horizontally, one line (`white-space: nowrap`), sized by script so that the word spans a set share of the viewport width (measure it at 100px, then scale; redo on resize and once fonts have loaded):

| Word | Width | Vertical centre |
|---|---|---|
| Crimson | 66.7vw | 34.5vh |
| Our Legacy | 76.4vw | 37.5vh |
| The Artists / Behind the Ink | first line 76vw; the second line is the same size, so it is wider than the screen and is cropped on both sides | 45.5vh, line-height 0.96 |
| Creators | 39.8vw | the middle of the cards |

**Copy block** (scenes 1–3): bottom-left, `left: 66px; bottom: 13vh` (15.6vh in the hero), 35vw wide. A small label, then:

- Scene 1: label "Ink Under a Red Moon"; `h1` "Art Born from the Rite" (29px); small text, 3 lines about 10.5em wide: "Welcome to Crimson Rite, where ink is a vow written on skin."
- Scene 2: label "About Our Studio"; lead: "Our studio is a temple for those who honour the ritual of ink, the precision of the needle, and the depth of personal devotion. Here, every tattoo is a vow sealed in red light."
- Scene 3: label "Sealing Your Legacy"; lead: "Crimson Rite is more than a tattoo studio, it is a ceremony. Whether you seek a sign of rebirth, a mark of courage, or a design that speaks to your blood, we bring it to life with precision and devotion."

**Pinned note** (scene 3): at `right: 66px; top: 44vh`, 186 × 178px (12.9vw wide). A thin white outline drawn as an open path: along the top for two thirds of the width, then diagonally down to the right edge, down the right edge, then back along the bottom for three quarters of the width (no left side). Inside: top-left "Artists / Blackwork & Fine Line" on three lines; bottom-left a 20px "+"; bottom-right, smaller and dimmer, "High-contrast designs with intricate details".

**Scene 5, the keepers.** Black background, no picture. Four cards in a row, top at 18.3vh, each 232 × 396px at 1440 (height `min(27.5vw, 50vh)`, width from the ratio), left edges at 66px, 29.17vw, 54.86vw and 79.17vw. Each card:

- The portrait, greyscale, `object-fit: cover`, clipped with two cut corners: `clip-path: polygon(0 0, 80.2% 0, 100% 16.4%, 100% 100%, 16.8% 100%, 0 90.2%)`, with a 1px outline at 34% white following the same shape (an SVG polygon with `vector-effect: non-scaling-stroke`).
- A black tab in the top-left corner, 18% of the width and 35% of the height, holding the name set vertically, reading upward, 11px uppercase, weight 500: BRAM HOLT, IKE MORROW, SABLE QUINN, NIA VOSS. Under the name a small "✦" that shows only on the card under the pointer (the first card has it by default).
- A crosshair near the bottom-right corner: a 30px "+" with a small gap at its centre.
- On hover the portrait scales to 1.07 slowly.

The word "Creators" in bright red sits over the middle of the row, on top of the cards. Below the cards, anchored `bottom: 6.7vh`: label "Our Artistry", `h2` "Meet the Keepers" (29px), then three small paragraphs starting at 66px, 28.3vw and 54.5vw: "At Crimson Rite, every artist is a keeper of the sacred craft." / "Our artists work in many styles, but share one ritual vision." / "More than tattoo artists, they are keepers of tradition, devotion and your story."

## 4. Header and progress bar (fixed, above the stage)

- **Header**, top padding 36px: left "CRIMSON RITE" (20px, weight 500) with "UTC+01:00" (11px) under it; a nav starting at 25.3vw in three small uppercase columns, 12px, weight 500: "ABOUT US / PROJECTS (78)", "ARTIST (09) / STUDIO", "LAB"; right "BOOK A VISIT ↗" (a `mailto:` link). Links dim to 55% on hover. About us and Studio go to scene 2, Projects and Lab to scene 3, Artist to scene 5, the logo to the top.
- **Progress bar**, 10vh from the bottom: a 1px line at 30% white from 64vw, 18.4vw long, with a 28 × 3px white mark that travels along it with `p`. At the right edge, the label "KEEP SCROLLING" and a 26px cross made of two 1.5px lines; the cross rotates with the scroll (`p × 1260deg`). Clicking the label scrolls to the middle of the next scene. In scene 5 the line fades out and the label slides up and is replaced by "GO TO HOMEPAGE", which scrolls back to the top.

## 5. Motion (`js/main.js`)

- **Progress.** Each frame: `target = clamp((scrollY − trackTop) / (trackHeight − innerHeight), 0, 1)`, eased: `shown += (target − shown) × (1 − exp(−dt × 6.5))`, `dt` capped at 0.05s. Everything is driven by `shown`.
- **Scenes dip to black.** A scene's opacity is `smoothstep(from, from + 0.014, p) × (1 − smoothstep(to − 0.014, to, p))` (the first never fades in, the last never fades out). Set `visibility: hidden` at 0. A scene gets the class `is-on` while its opacity is above 0.6; all the reveals below are CSS transitions hanging on that class, so they replay each time a scene is entered.
- **Camera drift.** Within a scene, `local = (p − from) / (to − from)` moves the picture (and its cut-out, identically): hero scale 1.04 → 1.17, drifting 1.4vw down; about scale 1.06 → 1.13, sliding from +1.6vw to −1.6vw; legacy scale 1.13 → 1.05, sliding from −1.1vw to +0.7vw; artists scale 1.04 → 1.11. Add a little pointer parallax (fine pointers only, eased): pictures move up to 0.55vw against the pointer, the blackletter word up to 0.45vw with it, which separates statue, word and background.
- **Reveals on `is-on`.** Blackletter word: opacity 0 → 0.84 over 1.5s ("Creators" starts after 1.1s). Small labels and titles: fade and rise 8px. Paragraphs: split by script into their rendered lines, each line in an `overflow: hidden` mask, rising from 108% to 0 over 1s with 85ms between lines (re-split on resize). Hero headline: word by word, opacity 0 → 1, 150ms apart. Pinned note: the outline draws itself (`stroke-dashoffset` 1 → 0, 1.6s), the "+" turns in, the two texts rise. Portrait cards: each card sits in an `overflow: hidden` box and rises from 103% to 0 over 1.25s, 120ms apart, so the cards grow upward from their own bottom edge.
- **Opening.** While the hero pictures and fonts load (at least 0.9s): black screen with only the progress line and the cross, which spins. Then the header fades in (logo, nav, and "Book a visit" last), the hero picture comes out of the dark over 2s, "Crimson" appears, the headline lights up word by word, the small text rises, and "KEEP SCROLLING" fades in.
- Easing for all rises: `cubic-bezier(0.19, 0.8, 0.2, 1)`.

## 6. Small screens (≤ 760px)

- Hide the nav; keep the logo and "Book a visit".
- Words wider: Crimson 92vw, Our Legacy 95vw, The Artists 90vw, Creators 80vw.
- Pictures keep `object-fit: cover`; shift the focus so the subject stays in view: about `object-position: 58% 50%`, legacy `61% 50%`.
- Copy block full width minus padding, lead 18px; pinned note 150px wide at `top: 13vh`.
- Progress bar 22px from the bottom, its line on the left (32vw long).
- The portrait cards become one row wider than the screen (cards `min(92vw, 46vh)` tall, 14px apart, starting at the left padding) that the scroll slides sideways across scene 5: `translateX(−smoothstep(0.22, 0.86, local) × overflow)`. "Creators" stays centred over it. The three paragraphs stack.

## 7. Details

- Accessibility: one `h1` (hero), `h2`s for "The Artists Behind the Ink" and "Meet the Keepers"; the other blackletter words are decorative (`aria-hidden`). Split text keeps its full sentence in `aria-label`. The bottom button has one label that follows its state. Visible focus ring (1px white outline, 4px offset).
- `prefers-reduced-motion`: no easing of the scroll, no camera drift, no parallax, no embers; transitions near-instant.
- Nothing is readable before the opening has laid out the type (no flash of unsplit text).

## 8. Checks

- At rest at the top: the dagger statue whole in the centre, from the dagger tip near the header to its rock base near the bottom, "Crimson" behind it with the "m" hidden by the statue, copy bottom-left, progress mark at the start of the line.
- Scrolling: each scene dips to black into the next; inside a scene the picture drifts and the type rises line by line.
- Scene 3: "Our Legacy" passes behind the torch statue and behind the dark head at the left edge; the note's outline draws itself.
- Scene 4: "Behind the Ink" is cropped by both edges of the screen.
- Scene 5: the four cards rise one after another, "Creators" appears over them, the label reads "GO TO HOMEPAGE" and returns to the top.
- No horizontal scroll at any width; no console errors; every image returns 200.

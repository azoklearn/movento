Build the site for **Sunbrew**, a raw living kombucha brewed in Lisbon, sold in four flavours. It has two views in one page. The home view is a wheel: bottles ride an arc above a big yellow sun and you spin them by scrolling or dragging. Click a bottle and it flies out of the wheel and lands in the middle of that flavour's product page, under a huge serif title. The mood is a sunny Mediterranean label come to life: cream paper, one burnt orange, one sun yellow, lots of air, generous serif capitals, nothing glossy or techy.

Plain HTML, CSS and vanilla JS, no libraries: one `requestAnimationFrame` loop for the wheel, the Web Animations API for the view changes, `IntersectionObserver` for reveals. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, nothing to generate)

Use these URLs directly in the page; do not download, regenerate or re-encode anything.

**Four bottle cut-outs**, transparent WebP, 600 × 1396 each, identical framing: a stubby amber swing-top bottle seen straight on, filling the image edge to edge (so the image's box is the bottle's box).

```
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/bottles/lemon.webp
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/bottles/hibiscus.webp
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/bottles/orange.webp
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/bottles/ginger.webp
```

Lemon has a yellow label, hibiscus a pink label and a ruby drink, orange an orange label, ginger a sage green label.

**Four lifestyle photographs**, WebP, 1168 × 834 (1.4:1), for the product page gallery, in this order:

```
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/scenes/hibiscus.webp      (hibiscus bottle, flowers, terracotta wall)
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/scenes/orange.webp        (orange bottle in an orange grove)
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/scenes/lemon-ginger.webp  (lemon and ginger bottles, iced glass, sunset)
https://res.cloudinary.com/ce2yatay/image/upload/sunbrew/scenes/all.webp           (all four on a wooden table in an orchard)
```

Everything else (logo, sun, ring lettering, card decorations) is drawn in SVG by you.

## 2. Look

- **Colour.** Page `#fcf8ed`. Sun `#ffd04a`. Brand orange `#ce4e17` for the logo, display titles and small caps labels. Brown `#8a431c` for body copy. Near-black brown `#2e1d11` for the ring lettering. Hairlines `#e3d9c2`. Cards `#feedc1`.
- **Type.** Playfair Display 400 for anything serif: titles in capitals with tight leading (0.86), the ring lettering, the hero notes, the logo word. Jost (400/500/600) for body copy and labels. Both from Google Fonts.
- **Logo**, fixed top centre on the home view and scrolling with the page on the product view: a small rising sun (half disc on a horizon line with five short rays) above the word SUNBREW in letterspaced serif capitals, all brand orange. Clicking it returns to the wheel.
- **Pointer label.** A small white pill (24px tall, 9.5px uppercase Jost 600 in brand orange, a 5px diamond before the text) that follows the mouse with a slight lag and pops in with a little overshoot whenever the pointer is over something with a `data-tip`: "Discover the product" on bottles and cards, "Drag" on the gallery. Because the wheel turns under a resting pointer, re-check what is under the pointer a few times a second, not only on mouse move. Hidden on touch devices.

## 3. Home: the wheel

A fixed, full-viewport stage; the page itself does not scroll here.

- **Sun.** A rounded heptagon (corner rounding about 17% of each edge), sun yellow, centred horizontally, about 80% of the viewport wide (capped by height), with its top edge around 43% down the screen so most of it is below the fold. Around it runs a ring of serif lettering, "BREW · FIZZ · BLOOM ·" repeated twice, on a circle at about 82% of the sun's radius so the letters straddle the flat edges. Fit the font size so the two repeats close the circle exactly.
- **Bottles.** Sixteen bottles (the four flavours repeated, in the order lemon, hibiscus, orange, ginger), one every 22.5° on a large circle whose centre is far below the screen. Pick the radius so neighbours sit about 30% of the viewport width apart; the bottle at the top of the arc is centred at 47.5% of the height and is about 47% of the viewport tall. Each bottle leans with the arc (0.9 × its angle), shrinks toward 66% of its size by 45° off-centre, and is hidden beyond 66°. Only the first four are focusable; the repeats are `aria-hidden`.
- **Spin.** The wheel drifts slowly on its own (about 2.6°/s) and pauses while a bottle is hovered. Mouse wheel or trackpad scroll turns it (0.07° per pixel), dragging turns it one-to-one with the pointer, arrow keys step one bottle. The displayed angle eases toward the target. The sun turns at half the wheel's speed, the ring lettering at the same speed.
- **Life.** While spinning, bottles swing back against the motion (up to 18°, proportional to speed) as if hanging from the wheel, and the whole row gets a motion blur of up to 5px at speed. A hovered bottle grows 8%.
- A small letterspaced serif caption, "SCROLL TO DISCOVER", sits bottom centre.

## 4. From wheel to product

Clicking a bottle (not the end of a drag):

1. Fill the product page for that flavour and show it underneath the wheel.
2. Animate the product page's hero bottle from the clicked bottle's exact position, size and tilt to its resting place (1.25s, `cubic-bezier(0.7, 0, 0.2, 1)`), hiding the clicked one, so the bottle appears to fly out of the wheel.
3. Fade the wheel out (0.65s) while it scales down slightly.
4. Reveal the title: each line rises out of an overflow mask (108% → 0, 1.1s, `cubic-bezier(0.16, 1, 0.3, 1)`, 110ms apart), then the two notes fade up.
5. Unlock page scrolling and set the URL hash to `#/lemon`, `#/hibiscus`, `#/orange` or `#/ginger`. Opening such a URL directly shows the product page without the flight; the back button and the logo return to the wheel.

## 5. Product page

- **Hero**, one viewport tall. The title is two centred lines of serif capitals at `min(12.2vw, 23vh)`, starting about 19.5% down. The bottle is centred, about 22% of the viewport wide, with its top at 66% of the height, so only the stopper and neck show above the fold. At 79% of the height, two serif notes: "Raw Living / Kombucha" on the left and "Brewed in Lisbon – / Portugal" right-aligned on the right, both 10vw in from the edges.
- **The bottle leaves faster than the page.** Over the first 55% of a viewport of scrolling it lifts by almost a full viewport on top of the scroll, tips to −22°, shrinks to 70%, and fades out over the last third, passing across the title on its way.
- **Copy**, centred: the flavour's sentence in Jost at about 2vw, a small brown diamond, then one line: "**Contains:** naturally occurring caffeine from black and green tea, and less than 0.5% alcohol from fermentation."
- **Facts**, a three-column table about 64% of the viewport wide with a hairline on top and between columns: SERVING TIPS (the flavour's tip), BOTTLE SIZES (three 44px outlined circles: 25cl, 33cl, 75cl), STORAGE ("Keep chilled. Best within three days of opening."). Column labels are 11px uppercase Jost 600 in brand orange.
- **Gallery**, a horizontal row of the four photographs, each 58% of the viewport wide with 12–16px rounded corners, starting 20% in from the left. Drag it with the mouse (with a little glide on release); native horizontal scroll on touch; no visible scrollbar.
- **"The other products"**, a two-line serif title at 9.6vw whose lines rise out of a mask when it scrolls into view, then four cards in a row (0.77:1, rounded, `#feedc1`), one per flavour, each with its bottle at 74% of the card height. On hover the card turns to the flavour's tint, tilts 2.5° and grows slightly; the bottle tips −5°; and five small flat SVG motifs pop out from behind it with an overshoot, staggered: red hibiscus flowers on pink `#fbb7ab`, lemon slices on `#ffe27c`, orange slices on `#ffc78e`, ginger leaves and root slices on `#d3e2ad`. Clicking a card fades the page, scrolls to the top and replays the title reveal for that flavour.
- A one-line footer: "Sunbrew — raw living kombucha" / "Brewed in Lisbon, Portugal".

Content per flavour:

| Flavour | Title | Sentence | Serving tip |
| --- | --- | --- | --- |
| lemon | LEMON AND / HONEY | Sun-ripened lemons pressed by hand meet raw wildflower honey in a slow ferment that stays bright, round and gently sparkling. | Pour over ice with a twist of zest, or top with soda for a long afternoon spritz. |
| hibiscus | HIBISCUS / AND ROSE | Dried hibiscus petals steep overnight with a breath of rose, for a ruby ferment that is tart, floral and softly sparkling. | Serve very cold in a wine glass, with a few crushed raspberries at the bottom. |
| orange | ORANGE AND / BLOSSOM | Algarve oranges and a few drops of orange blossom water turn a slow ferment into something sunny, juicy and lightly sparkling. | Pour over ice with a strip of peel, or add a splash to a glass of sparkling wine. |
| ginger | GINGER AND / LIME | Fresh ginger root grated by hand and a squeeze of lime give this ferment its warmth, its bite and its fine sparkle. | Drink it straight from the fridge, or stir with mint leaves and crushed ice. |

## 6. Small screens and motion preferences

Below 760px wide: bottles on the wheel are 40% of the height and sit 62% of the width apart, the sun is wider than the screen; the product title is 13.4vw; the hero bottle is 46vw wide starting at 54% of the height, with the two notes moved above it (40% down); the facts stack in one column; gallery photos are 84vw; the cards are two per row.

With `prefers-reduced-motion`: no idle drift, no swing, no blur, view changes and reveals are instant.

## Done when

- The home view shows three or four bottles on an arc over the sun with the ring lettering turning as you scroll, and nothing else scrolls.
- Clicking a bottle visibly carries that same bottle into the product page, with no jump at either end.
- Scrolling the product page sends the bottle up across the title, then shows the copy, the facts, the draggable gallery and the four cards with their hover decorations.
- All four flavours open from the wheel, from the cards and from their `#/…` URLs, and the logo returns to the wheel.
- No console errors; 375 × 812 and 1440 × 810 both hold together with no overlapping text.

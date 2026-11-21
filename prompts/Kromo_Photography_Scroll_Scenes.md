Build the one-page site of Kromo, a portrait and advertising photographer. The page is a string of seven scenes that the scroll moves through: a hero where he points his camera at you and his pictures play inside the lens; a dark gallery of signed prints that travels sideways and ends on his manifesto; a pinned stage that swaps through five advertising campaigns; a paper-coloured section about free portraits in the park; a line of personal photos hung from a cord; and a wine-red closing scene with the call to book. Loud and physical: huge condensed capitals, signal red, photo paper with white borders, prints that tilt, fly and pile up.

Plain HTML, CSS and vanilla JS, no libraries: one requestAnimationFrame loop that reads the scroll position, position: sticky stages, CSS transforms. Files: index.html, css/style.css, js/main.js.

## 1. Assets (hosted, nothing to generate)

Use these URLs directly; do not download, regenerate or re-encode anything. Base: https://res.cloudinary.com/ce2yatay/image/upload/kromo/

| File | What it is |
|---|---|
| hero.webp | 1168 × 880, transparent. Kromo from the chest up, holding a black camera in front of his face, the lens pointed straight at you. The lens glass is a circle centred at 50.17% / 44.1% of the image, about 17.6% of the image width across. Shoulders span the full width; cut off by the bottom edge. |
| footer.webp | 678 × 1152, transparent. Kromo in three-quarter profile facing left, looking through the viewfinder; cut off by the right and bottom edges. |
| lens/dancers.webp | 1344 × 752. Three dancers leaping in front of a yellow wall. |
| lens/boxer.webp | 1344 × 752. A boxer throwing a punch at the camera, red light. |
| lens/surf.webp | 1344 × 752. A surfer inside a wave under a bursting sun. |
| lens/hands.webp | 800 × 800. A luthier's hands carving a guitar neck. |
| prints/champ.webp, salt.webp, master.webp, midnight.webp, leap.webp | 660 × 876 each. The five signed prints: a boxer with her gloves up; a laughing surfer with a yellow board; an old luthier holding a guitar body; a trumpet player in red light; a dancer leaping in front of a yellow wall. |
| bts/light.webp, coffee.webp, floor.webp | 720 × 720 each. Behind-the-scenes flash snapshots: adjusting a studio light; a model laughing with a coffee; cups, lenses and tape on the floor. |
| campaigns/sneaker.webp | 1100 × 805, transparent. A chrome-silver running shoe, toe to the lower right. |
| campaigns/aro-bw.webp, aro-colour.webp | 660 × 876 each. Two magazine covers: a black-and-white profile; a laughing woman in blue sunglasses on orange. |
| campaigns/cais.webp | 751 × 860, transparent. A laughing woman in a blue windbreaker, waist up, cut off by the bottom edge. |
| campaigns/cans.webp | 1100 × 831, transparent. Three soda cans: green, orange, pink. |
| campaigns/perfume.webp | 861 × 1148, transparent. A square amber perfume bottle with a gold cap, slightly tilted. |
| park/1.webp … park/5.webp | 1024 × 688 each, colour, subject centred. 1: the street studio (a family posing in front of a blue backdrop, the photographer from behind). 2: a man in white leaning on a stick. 3: a hand holding a printed portrait. 4: two girls laughing. 5: prints hung on a string. |
| off/dirt-road.webp, market.webp, bar.webp, road.webp, coffee.webp, football.webp | 660 × 876 each. Personal travel photos. |

Everything else is drawn in code: the K mark, the signature, the client logos, the grain.

## 2. Look

Colour. Paper #e3ddd5. Ink #151312. Red #e8200f. Night #0e0d0d. Wine #2b0c0d. Cream #ddd3c8. Yellow #f6b521. Photo paper #f5f2ec.
Type (Google Fonts). Anton for the two giant section titles. Archivo 900 at font-stretch: 68% for the word behind the hero. Big Shoulders Display 800 for every headline, the header label and the year markers. Hanken Grotesk 400–700 for body text, links and buttons. JetBrains Mono for print captions. Playfair Display italic for one client logo. Everything display is uppercase.
Grain. A fixed full-screen noise layer over everything (inline SVG feTurbulence as a background image, mix-blend-mode: soft-light, about 30% opacity).
Buttons. Fully rounded pills, 700 uppercase, letter-spacing 0.07em, about 0.74vw text: white on the dark stage, ink on paper, yellow (larger) for the final call. They scale to 0.96 when pressed.
Signature. An inline SVG scribble in red, three round-capped strokes: the tall slanted stem of a K, the K's arm running into a low wavy line, and an underline. It draws itself (stroke-dashoffset, one stroke after the other, about 1.5 s). It appears large in the hero and the closing scene, and tiny on every print.
K mark. A heavy geometric K with a small red dot beside the upper arm.
Signed print (one component, reused): photo paper with a border about 5% of its width on the top and sides, the photo cropped to 4:5, and a strip below holding the small red signature on the left, an edition number in mono ("1/25") and a little conic colour wheel on the right. Soft double drop shadow. Size every inner measure in em of the print width so a print looks identical at any size.

## 3. The header (fixed)

K mark top left, "KROMO PHOTOGRAPHY" centred (visible only over the hero; fades out as you leave it), a two-line menu button top right (second line shorter) that opens a small dark rounded panel with the seven links and turns into a cross. Each of the three is ink over paper and white over the dark scenes. Because the scene changes are slanted, decide the colour separately for the left, centre and right of the header. A thin 2px tick on the right edge of the window travels down with page progress.

Links scroll smoothly to: Home (top), Signed prints (gallery pinned), Manifesto (quote fully lit), Campaigns (stage pinned), Park portraits, Off the clock, Contact (bottom).

## 4. Opening (on load, about 3 s, scroll locked)

Three full-screen pictures flash one after the other, about half a second each, as duotones: the boxer in red, the surf in red, the dancers in yellow. (Colour block behind, the photo in greyscale blended with multiply, plus a dark tint blended with screen so the blacks become deep red or olive.) Each scales from 1.14 to 1; the second and third wipe in from the right behind a slanted edge.
Cut: the dancers are now in full colour and turn out to be inside the lens. The hero figure starts scaled up (about 12 times, from the centre of the lens, so the lens covers the screen) and pulls back to its place in 1.5 s with a strong ease-out. While it pulls back the picture is split into red, green and blue copies a couple of percent apart that slide back together (three stacked copies, each multiplied by one pure colour and blended with screen).
As the zoom lands: the header fades in, the two notes rise in, the print on the left "develops" (blurred and washed out to sharp), the signature draws.

## 5. Scene 1 · Hero (paper)

A 200vh section with a sticky 100vh stage, so it stays pinned while the gallery rises over it.

Behind: the word KROMO twice, enormous (font-size about 35.5vw, line-height 0.72), in a paper tone slightly darker than the background (#d3ccc2). The first row is pushed left so its K is cut off ("ROMO" starts near the left edge); the second row starts at about 21vw so its last O is cut off. The rows drift a few vw in opposite directions as you scroll away.
Centre: hero.webp, anchored to the bottom, centred at 49%, as tall as min(50.2vw, 85vh). On top of it, exactly over the lens glass, a circle that shows a picture: dancers, then the luthier's hands, then the sneaker on a blue radial background, then the boxer, changing every 1.9 s (cross-fade with the new picture scaling from 1.25 to 1). Give the circle an inner shadow and a faint highlight so it reads as glass.
Left, at 41% from the top, about 12.6vw wide: the signed print of the boxer (tilted −3°, edition 1/25), then: "The photo that started it all: the champ in her corner, a minute after the last round. It's print number one."
Right, same height and width: the large signature, then: "For twelve years I've stood on this side of the lens. What passes through it, from the ring to the magazine cover, is here."
Notes are Hanken Grotesk 500, about 1.13vw, line-height 1.24.

Leaving the hero. The next section rises over the pinned hero with a slanted top edge: clip-path: polygon(0 S, 100% 0, 100% 100%, 0 100%) where S = sin(π × progress) × 21vw, so the edge leans as it climbs (right side first) and is flat again when it arrives. Meanwhile the print on the left leaves its place, flies to the right and up in a slight arc, turns over once around its vertical axis (the back is plain photo paper with the K mark and "ARTIST'S PRINT / COTTON PAPER" in small mono) and lands exactly as the first print of the gallery. Use one fixed element for the flight and hide the two real prints while it is in the air.

## 6. Scenes 2 and 3 · Signed prints, then the manifesto (dark, one pinned stage)

A 530vh section (night background) with a sticky 100vh stage. After it pins there are two phases:

Sideways (260vh of scroll). A track moves left by exactly the distance that brings the manifesto, placed at its far end, to the centre of the screen.

Pinned behind the track: the giant title SIGNED PRINTS across the top (Anton, sized to span the page between the paddings, filled with a vertical gradient from bright red #d41d11 at the top to almost black-red at the bottom); a row of big dark year numbers (2017, 2019, 2021, 2023, 2025; #1e1c1c, 6.4vw, 39vw apart, each with a faint vertical hairline to its left) near the bottom, moving at 0.46 of the track's speed; and a ruler of small ticks along the bottom edge. Title, years and ruler fade out as the manifesto arrives.
On the track: five signed prints, 17.2vw wide, 32vw apart starting at 38vw, at staggered heights and tilts, each with a mono caption centred under it (name in bold, then lens data in grey; uppercase, letter-spacing 0.24em):

| Print | Top | Tilt | Edition | Caption |
|---|---|---|---|---|
| champ | 13vh | −3° | 1/25 | THE CHAMP · 85 MM · F/2 · 1/250 |
| salt | 32vh | 2° | 7/25 | SALT · 200 MM · F/4 · 1/2000 |
| master | 6vh | −2° | 3/15 | THE MASTER · 50 MM · F/1.4 · 1/125 |
| midnight | 28vh | 2.5° | 12/30 | MIDNIGHT · 35 MM · F/1.8 · 1/60 |
| leap | 15vh | −2° | 2/10 | LEAP · 24 MM · F/8 · 1/4000 |

At the end of the track, one screen wide: a pair of quote marks in dim cream, then the manifesto in cream, Big Shoulders Display 800, about 7.45vw, three centred lines: "I DON’T SHOOT THE POSE. / I SHOOT THE SECOND / AFTER IT." and under it, small: "The pose is what people want to show. The second after is who they are. / That's the gap where I press the shutter." As it slides in, the background turns from night to wine, and the letters of the quote go from 16% to full cream one by one, left to right.
The pile (170vh of scroll). The quote stays centred. Three snapshots (bts/light, coffee, floor; classic instant-photo frames, 23.6vw wide, square picture, thick bottom border) rise from below one after the other and stack on top of the quote, slightly offset, tilted −5°, 3.5° and −1.5°. The background fades from wine back to night. Then the stage unpins and scrolls away.

## 7. Scene 4 · Campaigns (dark, pinned)

A 620vh section with a sticky 100vh stage: five slides, then one extra viewport during which the next section covers it.

Behind everything: the giant title CAMPAIGNS, same style as SIGNED PRINTS, a little lower.
Centre: one visual per campaign, in front of the title. Each arrives from below (about 58vh of travel, ease-out) while the previous one fades and lifts away; the first one rises as the section arrives.
sneaker.webp, about 54vw wide, slightly rotated, drop shadow.
The two Aro covers as bordered prints, about 23.4vw wide: the black-and-white one in front on the left (−4°), the colour one behind on the right (3.5°).
cais.webp, 84vh tall, standing on the bottom edge.
cans.webp, about 53vw wide.
perfume.webp, 79vh tall.
Lower left: a column of five small dots (the current one stretches into a white bar) and the current campaign's name and blurb, which cross-fade:
Zéfiro — The Zéfiro 3 launch. Twelve product shots and the street series that took over bus shelters nationwide for two months.
Aro Magazine — Two covers in the same year. The winter issue won the editors' association portrait award.
Cais — The entire fall collection, from the catalog to the store windows: forty looks in three days in the studio.
Bento — The three cans of the summer line, shot with real ice and zero retouching on the drops.
Mirra — The new bottle under twelve different lights, for the holiday campaign in magazines and on billboards.
Lower right: a white pill, "GET A QUOTE".
Along the bottom: client marks running to the left in an endless loop (about 34 s), faded at both ends, each set in its own style: "Faísca" with a lightning bolt; "VÉRTICE" widely spaced; "ZÉFIRO" heavy and slanted; a ring then "ARO" widely spaced; "cais." bold; "BENTO" inside a rounded outline; "Mirra" in serif italic; a small triangle then "DUNA".

## 8. Scene 5 · Portraits in the park (paper)

Rises over the pinned campaigns stage with the same slanted edge as before.

Headline in red, Big Shoulders Display 800, about 8.25vw, one line: PORTRAITS ARE FOR EVERYONE.
A strip of the five park photos, 31.6vw tall, full width, 0.42vw gaps. It works like an accordion: one panel is open (3.75 times wider, in colour), the others are narrow, black and white, with a fine dot screen over them. It starts with five equal black-and-white panels and opens the first one when it scrolls into view; hovering, clicking or focusing a panel opens that one (0.9 s ease-out).
Under it, a row: "Portraits in the park" in bold on the left; then "Once a month the studio hits the street: a blue backdrop, one light and a portrait printed on the spot, free, for anyone walking by."; and an ink pill on the right, "BRING IT TO MY BLOCK".

## 9. Scene 6 · Off the clock (paper)

Headline in red, centred, about 7.7vw, two lines: OFF THE CLOCK, / STILL SHOOTING.
Under it a thin dark cord across the whole width, with six photos hanging from it (off/ in the order dirt-road, market, bar, road, coffee, football): 22.4vw wide, white border, 3:4, about 4.3vw apart, alternately tilted between −2.5° and 3°, each held by a small black clip. The row is wider than the screen and drifts to the left as the section crosses the viewport, until the last photo has come in.

## 10. Scene 7 · Contact (wine red)

Scenes 6 and 7 share one backdrop: a full-screen sticky layer behind both, a radial wine-red gradient (#5c1215 → #3b0c0f → #230809), whose opacity goes from 0 to 1 as the last scene comes up, so the whole screen turns from paper to wine at once (Kromo's head appears at the bottom right while the page is still paper). When it has turned, the header goes white and the scene's parts come in.

Left: a dark panel (#2b1d1d) from top to bottom, about 21.6vw wide, with a stepped right edge (narrower in its upper half). In it: the seven links in white, Hanken Grotesk 500, about 1.78vw, vertically centred; at the bottom a small sneaker.webp, four social icons (Instagram, Bē, Pinterest, WhatsApp), a hairline, and tiny grey text: "Portraits and advertising", "Privacy Terms", "© 2026 Kromo", "Demo photos". It slides in from the left.
Centre (at about 47% across): the signature drawing itself, then the headline in off-white, about 8.5vw, two lines: THE NEXT SHOT / IS YOURS, revealed by a wipe from the left, then a yellow pill, "BOOK A SHOOT".
Right: footer.webp, 86% of the height, standing on the bottom edge, slightly off the right side.
Bottom: the same running client marks, dimmer, behind Kromo.

## 11. Small screens (760px and below)

Hero: the figure fills the lower part (min(98vw, 58vh) tall, centred); the print and its note sit top left, the signature and its note top right; the word is larger and cropped. No flying print.
Gallery: same sideways travel with larger prints (48vw, 66vw apart); the quote at about 9.5vw; snapshots 58vw.
Campaigns: visuals sized to the width; a gradient fades the bottom of the picture into the night behind the caption.
Park: headline on two lines, strip 78vw tall, the row stacks.
Off the clock: photos 56vw.
Contact: headline at the top, Kromo lower right, the panel becomes a small bar at the bottom with the icons and the small print only.

## 12. Details that matter

Ease the scroll position used for the transforms a little (shown += (scroll − shown) × (1 − e^(−12·dt))), but use the real position for the slanted edges and the header colours.
prefers-reduced-motion: no opening sequence, no easing, no flying print, no marquee; everything is simply in place.
Real text in the DOM: one h1 (the hero line on the right), an h2 per scene, alt text on the photographs; the lens, the snapshots and the marquee copies are decorative.
Preload hero.webp and lens/dancers.webp; lazy-load everything below the hero.
No horizontal scroll at any width.

## 13. Check before you finish

Reload: three flashes, the pull-back out of the lens, then the hero at rest with the lens picture changing.
Scroll slowly out of the hero: the slanted dark edge climbs, the print flips once and lands as "The Champ".
Keep scrolling: the prints pass sideways, the quote lights up on wine red, three snapshots pile on it.
Campaigns: five visuals in order, each with the right name and blurb; the paper section then covers the perfume with a slanted edge.
The park strip opens its first panel in colour; hovering another opens that one.
The page ends on "THE NEXT SHOT IS YOURS" with the yellow button; every menu link lands on its scene.
No console errors.

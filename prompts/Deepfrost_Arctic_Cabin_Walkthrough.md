Build the site for **Deepfrost**, a 120 m² holiday cabin for four on Kvitfjord in the Norwegian Arctic. The site is a walk through the house and nothing else. It opens outside at dusk: a black timber cabin with a glowing glass wing on a snowy shore, a huge "DEEP" standing in the sky *behind* the mountains and a script "frost" in front of them. Scrolling carries the camera up the slope, through the glass and into the lounge. From there, buttons on a small card walk the camera to the kitchen or the bath and back. There is one screen; it never scrolls past the lounge.

Plain HTML, CSS and vanilla JS, no libraries. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

Stills, base `https://res.cloudinary.com/ce2yatay/image/upload/deepfrost/`

| File | Size | What it is |
|---|---|---|
| `exterior.webp` | 2400 × 1357 | The cabin right of centre, glass wing on stilts at its left, fjord at the left, snowy ridges, the top 40% is dark dusk sky |
| `lounge.webp` | 2400 × 1357 | Black wood stove in the centre, sheepskin chair left of it, pale sofa on the right, glass along the left and the far end |
| `kitchen.webp` | 2400 × 1357 | Oak island in the centre, three brass lamps, a long window behind, stools on the right |
| `bath.webp` | 2400 × 1357 | Stone tub right of centre in front of a full-height window, steam, bathrobes on the right wall |
| `sky.png` | 1344 × 760 | A mask for `exterior.webp`: opaque where the sky is, transparent from the ridge line down |

Camera moves, hosted as videos but **used frame by frame** (never played as video):

| Clip | From → to |
|---|---|
| `deepfrost/in` | outside → lounge (up the slope and through the glass) |
| `deepfrost/to-kitchen` | lounge → kitchen |
| `deepfrost/to-bath` | lounge → bath |

Each clip has 121 frames (24 per second), numbered 0 to 120. Frame `k` is this image, and the URL must be written exactly this way (these exact URLs are already cached):

```
https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,w_<W>,q_45/<clip>.webp
T = max(0, (k − 0.5) / 24), written with 3 decimals      W = 1280, or 960 on phones (shorter screen side under 700px)
```

Use all 121 frames of `in`, and every second frame (k = 0, 2, 4 … 120, so 61 images) of the two others. The first frame of each clip matches the still it starts from and the last frame matches the still it ends on.

## 2. Look

- Colours: night `#0b1220`, snow `#eef2f7` for all type, ice `#a9bedb` for labels, glass cards `rgba(17,27,43,.74)` with a 16px backdrop blur (the facts card is bluer: `rgba(43,62,98,.56)`), side panel `#0f1826`.
- Fonts (Google Fonts): **Archivo** variable with its width axis (`Archivo:wdth,wght@62..125,400..900`). Use it expanded (`font-stretch: 125%`) at weight 800 for "DEEP" and at weight 700 for card titles, and at normal width for everything else. **Cormorant Garamond** italic 500 for "frost".
- Hide the page scrollbar. Stills and frames are always drawn to cover the screen.

## 3. Structure

One section 460vh tall containing one `position: sticky` full-screen stage. In the stage, from back to front: a `<canvas>` for the frames; the four stills stacked as `<img>` (only one opaque at a time, 0.4s fade in, 0.22s fade out); a light dark gradient over the top 17% so the navigation stays readable; the hero text; the room card.

**Fixed navigation** (white type, 22px from the top, 32px from the sides): left, two pills 36px tall, "HOME" (filled snow, dark text; it returns outside) and "THE HOUSE" (outlined; it opens the room list); centre, a small house icon with "Deepfrost" (bold, letter-spaced) over "Nordkyn" in ice; right, "CONTACT" and "BOOK A STAY" with a long thin arrow. 13px, weight 600, uppercase.

## 4. Outside (the hero)

- "DEEP": 18.4vw, line-height 0.74, left 3.5vw, top 19vh. It lives in a full-stage layer that carries `sky.png` as a CSS mask (`mask-size: cover`, same position as the picture), so the ridge line cuts the bottom of the letters and the word reads as standing behind the mountains.
- "frost": 13.6vw italic, white, left edge, top 44.5vh, in front of everything. Give it generous padding so its swashes are not clipped.
- Top right at 13vh: a glass card with four lines, label in ice then value in bold: Location: Kvitfjord, Norwegian Arctic / Sleeps: 4 in 2 bedrooms / Area: 120 m² / Stay: Whole house, self check-in.
- Bottom centre: a small button, "Scroll to go in through the glass.", with a 1px line that drips under it. Clicking it does the scroll for the visitor.
- On load: "DEEP" slides in from beyond the left edge (1.25s), "frost" is revealed from left to right by a clip (1.15s, 0.4s later), then the card and the hint fade in.

## 5. Scroll: in through the glass

Take the scroll progress of the section (0 to 1) and ease it (`shown += (target − shown) × (1 − exp(−dt × 7))`).

- 0 → 0.12: the hero leaves. "DEEP" slides out to the left by 82vw, "frost" drifts 30vw to the right and fades, the facts card sinks 9vh and fades, the hint fades first.
- 0.085 → 0.975: the `in` clip, frame = progress across those 121 images, drawn on the canvas. While the film is moving no still is shown; at or before its start the `exterior` still is shown, at its end the `lounge` still fades in over the last frame (the stills are sharper than the frames).
- At the end the visitor is in the lounge and the room card appears 0.24s later. Scrolling back up hides the card and runs the film backwards.

Load the 121 frames of `in` at page load (eight at a time) and, if a frame is not there yet, draw the nearest loaded one. Load the two room clips when the lounge is first reached.

## 6. Rooms

The room card sits bottom left (32px from the left, 40px from the bottom, about 32vw wide, 28px padding, 10px radius): title in expanded Archivo 34px with the area beside it in small ice type, a lede at 17.5px, a line of text at 15px, then outlined pill buttons.

| Room | Area | Lede | Text | Buttons |
|---|---|---|---|---|
| The lounge | 46 m² | Eleven metres of glass facing north up the fjord. | A wood stove, two deep sofas, a sheepskin chair and nothing on the walls, because the weather is the picture. | Walk to the bath · Go to the kitchen |
| The kitchen | 22 m² | The island seats four, under brass. | A window runs the length of the worktop, with the fjord just outside it. | ← Back to the lounge |
| The bath | 14 m² | One stone tub, set against the glass. | It fills from the spring behind the house in twelve minutes. Lie low enough and the water in the tub meets the water in the fjord. | ← Back to the lounge |

A button hides the card, plays that room's clip on the canvas over 2.3 seconds (forwards to go, **backwards** to come back, so no second clip is needed), then fades the destination still in and shows its card. While the visitor is in the kitchen or the bath, or a walk is playing, lock page scrolling (`overflow: hidden` on `<html>`); unlock in the lounge. If the frames are not loaded after 4 seconds, or the visitor prefers reduced motion, cross-fade the stills instead.

One function goes to any room from anywhere and always passes through the lounge: from the kitchen to outside it walks back to the lounge, then scrolls the page to the top with its own eased tween (2.6s, cancelled if the visitor scrolls); from outside to the bath it scrolls to the bottom, waits for the lounge, then walks.

## 7. Side panel (slides in from the right, 460px wide, dark veil behind, Escape closes, focus stays inside)

- **The house**: "120 m² on one floor, built in 2019 on the north shore of Kvitfjord. Charred spruce outside, pine and oak inside, glass wherever the water is." Then a list: Lounge 46 m², Kitchen 22 m², Bath 14 m² (each with a "Go there" button that closes the panel and goes to the room), North bedroom 14 m² (King bed), East bedroom 12 m² (Two singles), Entry and drying room 12 m² (Boots, skis). A note on heating, firewood and check-in times, and a "Book a stay" button.
- **Contact**: who keeps the house, an email link, a phone link with hours, and how to get there (fly to Mehamn, 50 minutes by road).
- **Book a stay**: "The whole house, for up to four. NOK 6,400 a night, three nights at least." Fields: arriving (date, at least two days ahead, prefilled three weeks ahead), nights (3 to 21, default 4), guests (1 to 4), name, email. A line under the fields gives the departure date and the total live (nights × 6,400 + 1,200 for cleaning). On submit, check each field, show one plain message at the first problem and focus it; when everything is right, replace the form with a confirmation that repeats the dates, the guests, the total and the email.

## 8. Small screens (≤ 760px)

A portrait screen shows only a slice of each picture, so give each a horizontal focus and use it for the still, the mask and the canvas alike (interpolate it during a clip): outside 52%, lounge 47%, kitchen 50%, bath 68%. "DEEP" 26vw at 12svh from the top with "frost" 25vw tucked under it; the facts card spans the width above the hint; the room card spans the width at the bottom with a 26px title. Navigation: smaller pills, no "Contact", "BOOK →" on the right; under 520px drop the centre mark. The side panel takes the whole width.

## 9. Details and checks

- One `h1` (visually hidden, the big words are decoration); the room card is `aria-live="polite"`; all controls are real buttons and links with visible focus.
- Top of the page: the bottom of "DEEP" disappears behind the ridge at the left and under the "P"; "frost" overlaps the mountains.
- Scrolling: the words leave, the house grows, the camera passes the glass and stops in the lounge with its card. Scrolling back reverses all of it.
- "Go to the kitchen" walks past a dark timber wall to the island; "Back to the lounge" plays the same walk in reverse. "Walk to the bath" goes down a corridor to the tub.
- From the kitchen, "HOME" returns outside in one go. From outside, "The house" → Bath → "Go there" ends in the bath.
- The booking form refuses an empty name with a message, then confirms with the right total (4 nights = NOK 26,800).
- No horizontal scroll at any width, no console errors, every image returns 200.

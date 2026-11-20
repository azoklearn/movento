Build the landing page for **Avelon Drive**, a premium car rental in New York that delivers the car to your door. The page is not a stack of sections: it is one continuous, scroll-driven film. A black sedan fills the screen; as you scroll, the footage shrinks into a card, the page turns white around it, the camera swings round the car, and the card finally dissolves into a carousel of the fleet where the chosen car grows to fill the stage above a booking bar. The tone is quiet and expensive: black, white, three greys, one typeface, no gradients, no shadows, generous empty space.

Plain HTML, CSS and vanilla JS. GSAP 3 + ScrollTrigger from cdnjs is the only library. Files: `index.html`, `css/style.css`, `js/main.js`; all media is loaded from the URLs in section 1.

## 1. Assets (hosted, nothing to generate)

Everything visual is already hosted. Use these URLs directly in the page; do not download, regenerate or re-encode anything.

**The film** is one 10-second studio shot of a black sedan on a pure black background: a chauffeur gets into the driver's seat and shuts the door, then the camera swings down and around the back of the car and settles on an exact side profile, nose pointing right. It is used as a sequence of 151 still frames (15 per second, 1280 × 720, WebP, about 19 KB each). Frame `i` (0 to 150) is at:

```
https://res.cloudinary.com/ce2yatay/video/upload/so_<T>,q_72/avelon-drive/hero-film.webp
```

where `<T>` is `Math.max(0, (i - 0.5) / 15).toFixed(3)`: `0.000` for frame 0, `0.033` for frame 1, `0.100` for frame 2 … `9.967` for frame 150. Keep that formula exactly: the host returns the first frame at or after the offset, so aiming half a frame early is what lands on frame `i`, and using the same strings keeps every frame on the CDN cache.

- Frames 0–30: the chauffeur gets in; the door is shut at frame 30.
- Frames 30–150: the camera move. The last frames are the still side profile.
- The car spans about 75% of the frame width in frame 0 and about 97% in frame 150, vertically centred. The background is true black, so the frame has no visible edges on a black box.

**The five cars** are side views, nose pointing right, on pure white, all on the same 1400 × 560 canvas with the tyres on the same baseline (y = 520) and the car's centre about 56.5% of the way down the image. The widest cars are 1320px of the 1400.

| Car | Colour | URL |
| --- | --- | --- |
| Range Rover | graphite | `https://res.cloudinary.com/ce2yatay/image/upload/avelon-drive/cars/range.webp` |
| Porsche 911 | red | `https://res.cloudinary.com/ce2yatay/image/upload/avelon-drive/cars/porsche.webp` |
| Mercedes S-Class | black | `https://res.cloudinary.com/ce2yatay/image/upload/avelon-drive/cars/sclass.webp` |
| BMW 7 Series | navy | `https://res.cloudinary.com/ce2yatay/image/upload/avelon-drive/cars/bmw.webp` |
| Bentley Continental GT | green | `https://res.cloudinary.com/ce2yatay/image/upload/avelon-drive/cars/bentley.webp` |

Keep them in that order with the S-Class in the middle as the starting car: it is the same car as in the film, and the hand-over from film to carousel depends on it.

## 2. Look

- **Colour.** Black `#000`, white `#fff`, ink `#0a0a0a`, tile grey `#f2f2f2`, darker grey `#e6e6e6`, muted text `#8e8e8e`. Red only ever comes from the tail lamps and the 911.
- **Type.** Inter (optical sizing on), weight 500 for almost everything, tight tracking: −0.055em on display sizes, −0.045em on statements, −0.01em on UI text.
- **Edge padding** `clamp(16px, 2.2vw, 40px)`.
- **Buttons**: 40px tall, 8px radius, 13px/500, three fills (solid black, `#f2f2f2`, `#e6e6e6`), scale to 0.97 on press. **Pills**: 30px tall, fully rounded, 12px text, used for "New York" with a small map-pin icon.
- **Nav**, fixed, ~84px tall: wordmark left (a small slanted pill glyph + lowercase name, 18px); links starting at 40.6vw: "Overview", then a wider gap, then "Fleet", "Experience", "Contact" (13px/500); "Reserve" button right. The link of the current section is dimmed to 45%. Draw the whole nav in white with a white Reserve button and give it `mix-blend-mode: difference`: it then reads white on the black film and black on the white page, and the button flips from white to black, with no theme logic.

## 3. Structure

One `<main>` track about 720vh tall containing one `position: sticky; height: 100svh` stage. Everything lives in the stage, absolutely positioned, and is moved by a single GSAP timeline scrubbed by the track's scroll progress (`scrub: 0.7`). Layers, back to front: the film box, the statement and marquee, the fleet line, the cars, the booking bar, then the hero copy on top.

- **Film box**: a `<div>` with a 1280 × 720 `<canvas>` centred inside it. JS draws the current frame; the canvas is sized like `object-fit: cover` but never cropped harder than 1.37 × the box width, times a zoom factor. Give the canvas `mix-blend-mode: screen` and the box `isolation: isolate`, so the footage's black always takes the colour of the box behind it. Load frame 0 first, then the rest coarse-to-fine (every 16th, 8th, 4th, 2nd, all) with six parallel requests, and always paint the nearest loaded frame.
- **Hero copy** (white, over the film): a "New York" pill and, under it, "The car you want, at your door. / No counters, no paperwork — just the keys." at left, 42% down; "Scroll ↓" bottom-left; the title along the bottom at `min(7.6vw, 12.5vh)`: "Premium" in grey `#777` starting at 40.8vw, "Car / Rental" in white on two lines at the right edge.
- **Statement** (right of the card, same top and height as the card): five fixed lines at 3.55vw, "It's not about getting there. / It's about how you arrive. / Your car meets you / at the door — fuelled, / detailed, silent." with a grey "Reserve" button pinned to the bottom of the column.
- **Marquee** near the bottom: marque names (Mercedes-Benz, Porsche, Range Rover, BMW, Bentley, Aston Martin, Maserati, Lamborghini, Ferrari, Rolls-Royce) in `#b2b2b2`, drifting left forever, edges faded with a mask.
- **Fleet line**, centred, about 11.4em wide at `min(3.9vw, 5.5vh)`: "A private collection, not a car park: S-Class to Continental GT, each car detailed, insured and at your door within the hour, anywhere in New York." Split into words.
- **Cars**: five `<figure>`s, `mix-blend-mode: multiply` so the white studio backdrop disappears. Do not put a z-index on their parent: they must share the stage's stacking context to multiply against the film box behind them.
- **Booking bar**, bottom: five grey tiles in a row with 12px radius: previous arrow · car name (3.3vw) with a one-line description and a "Specifications" button · a "New York" pill and a "+3" pill · "Per day", the price, a black "Reserve" button · next arrow.

## 4. The scroll timeline (10 units)

| When | What happens |
| --- | --- |
| 0 → 1.2 | Film plays frames 0 → 30 (the door closing). |
| 0.3 → 1.1 | Hero copy blurs (14px), fades and drifts up. |
| 0.9 → 2.4 | The full-bleed film box shrinks into a card at the left (46% of the width, 1.3:1, 16–24px radius, vertically centred a little above the middle); the white page appears around it. In the hero the film is zoomed so the car spans about two thirds of the width; as a card it is at full cover. |
| 1.2 → 3.7 | Film plays frames 30 → 150 (the camera orbit to the side profile). |
| 2.15 → 3.4 | Statement lines arrive one by one (blur 12px → 0, rise 26px, 0.16 stagger), then the marquee and the button. |
| 4.3 → 5.5 | Statement and marquee blur away; the card drops to the lower centre and shrinks to a third of the width, while the film zooms out so the side-on car becomes exactly the size of a carousel car. |
| 5.3 → 6.6 | The black card turns into a light grey plate, the footage fades out, and the five cut-outs fade in from a 16px blur with the S-Class sitting exactly where the filmed car was; then the plate fades away. |
| 5.8 → 7.3 | The fleet line resolves word by word (blur 10px → 0, 0.045 stagger) while the row of cars climbs to 73% of the height. |
| 7.4 → 8.3 | The line blurs away and the row rises to the middle. |
| 8.0 → 9.0 | Focus: every car scales from carousel size (23vw) to stage size (about 70vw, capped by height), the spacing opens up, and the neighbours blur (16px) and fade as they slide off. |
| 8.8 → 9.6 | Booking bar tiles rise in, staggered. |

Drive it with three plain state objects (the box rectangle, the frame number, the row) tweened by the timeline and painted by one `render()` function, so nothing else writes to the moving elements. Rebuild the timeline on resize.

## 5. Interaction

- The arrows (and ← → once the car is in focus) change the car: the row slides with `power3.inOut` over 0.9s, wrapping endlessly; name, description, price and pill blur out, swap and blur back in.
- Nav links scroll smoothly to the matching point of the timeline: Overview 0, Experience 3.9, Fleet 7.3, Contact and both Reserve buttons 10.
- On load (only at the top of the page): nav fades in, the film fades in, the pill and lede rise out of a blur, the title words resolve from a 26px blur.
- `prefers-reduced-motion`: no intro, no marquee, scrub without smoothing, instant car changes.
- If GSAP fails to load, add a class that lays everything out as a plain stacked page.

## 6. Small screens

Below 760px wide or on portrait screens: hide the nav links; hero lede at the top, title stacked bottom-left at 15.5vw ("Premium" / "Car" / "Rental"); the card sits full-width under the nav with the statement below it at 6.6vw; carousel cars are 60vw wide and the focused car 95vw; the booking bar becomes two rows (name tile on top; arrow, pills, price, arrow underneath).

## Done when

- At the top of the page a black sedan with a chauffeur at the open door fills a black screen, with the title along the bottom.
- Scrolling never cuts: the film becomes the card, the card becomes the centre car of the carousel, the centre car becomes the hero of the booking view, with no jump in the car's position or size at either hand-over.
- The nav stays legible at every scroll position.
- The arrows cycle through all five cars and the bar updates.
- No console errors; 375 × 812 and 1440 × 810 both hold together with no overlapping text.

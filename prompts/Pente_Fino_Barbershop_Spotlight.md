Build the landing page for **Pente Fino**, a Brooklyn barbershop ("You pick the cut. We go over it with a fine comb."). Everything is black, white and grey: one barber chair under one spotlight, sections that alternate between near-black and warm paper, photographs lit by a single lamp. Headlines pair a light and a very wide heavy weight of the same typeface in one sentence ("Every cut **has a number.**"); everything small is monospaced, uppercase and widely tracked. The page is long and mostly ordinary scrolling, with a short opening, two pinned moments, and small interactions everywhere.

Plain HTML, CSS and vanilla JS, no libraries. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

Base: `https://res.cloudinary.com/ce2yatay/image/upload/pente-fino/`

| File | Size | What it is |
|---|---|---|
| `hair.webp` | 2240 × 1267 | Opening background: macro of dark hair being combed |
| `chair.webp` | 890 × 1500, transparent | The barber chair, cut out |
| `clipper.webp`, `clock.webp`, `tin.webp`, `spray.webp` | ~320–700px, transparent | Cut-out objects: a clipper, a chrome wall clock, a pomade tin, a spray bottle |
| `caio.webp`, `renan.webp`, `davi.webp` (880 × 1168), `toninho.webp` (1168 × 880) | | The four barbers at work, each under one pendant lamp, very dark |
| `cut1.webp` … `cut8.webp` | 640 × 849 | Eight haircut portraits on dark grey |
| `pomade.webp`, `oil.webp`, `tonic.webp`, `comb.webp` | 800 × 800 | Four products on a pedestal under a spotlight |

All pictures are greyscale. Preload `hair.webp` and `chair.webp`; lazy-load the rest.

## 2. Look

- Colours: black `#0a0a0a`, card black `#141414`, paper `#e9e7e3`, white `#f5f4f1`. No other colour.
- Fonts (Google Fonts): **Syne** 400 and 700–800 for the name and all headlines (letter-spacing −0.045em; the heavy weight is much wider, which is the point); **Hanken Grotesk** for text; **JetBrains Mono**, 9–10px, uppercase, 0.16em tracking, for every label.
- Headlines 52px on a 1440px window (`3.25vw`), section labels like "#0 · THE MENU" above them at 55% opacity.
- Buttons are pills: white (or black on paper) with a small black circle holding "↗" that turns 45° on hover; secondary buttons are outlined.
- Text blocks arrive out of a 10px blur with a 16px rise when they enter the screen.

## 3. Header and opening

- **Opening** (about 2.6s, with a "SKIP" button): full-screen `hair.webp` easing from 1.12× to 1×, and the name centred over it on two lines, "pente" in the light weight and "fino" in the heavy one, each rising out of a blur. Tiny mono labels in the four corners: "PENTE FINO · BARBERSHOP", "SKIP", "CUT · BEARD · HOT TOWEL", "GUARD #0". It fades out to reveal the page.
- **Header**, fixed: left a small comb icon and "PENTE FINO"; centre a pill-shaped translucent nav (Services, Barbers, Club, Shop, Location) that highlights the current section; right a small "Book ↗" pill. The header reads the section under it and flips between white-on-dark and black-on-paper.

## 4. Sections

**0 · Hero** (pinned, 230vh track, black). A soft cone of light falls from the top centre. Behind the chair, top-left, a huge "pente" (light weight, 29vw, silver gradient text); in front of the chair's base, bottom-right, a huge "fino" (heavy, 23vw, grey-to-black gradient). The chair is 76vh tall, centred, standing near the bottom. Top-left `h1`: "You pick the cut. / **We go over it with a fine comb.**" Top-right mono: "○ CLOSED NOW · OPENS TODAY AT 9:00 AM". Bottom-left: "Fades, straight razors and hot towel shaves. **Book your barber in under a minute.**", buttons "Book a chair ↗" and "See prices", then "★★★★★ 4.9 · 612 GOOGLE REVIEWS". As the track scrolls: the two words drift apart (9vw), the chair grows to 1.12×, the copy fades (8–30%), the light fades (30–70%), and a paper-coloured wash covers the stage (45–95%) while the chair fades to a ghost, so the hero dissolves into the first paper section.

**1 · Services** (paper). "#0 · THE MENU", "Every cut **has a number.**", "Every price covers the wash, a hot towel on your neck and a razor lineup on the way out. No surprises in the chair." Then a list of rows separated by hairlines: number, name with a one-line note, minutes, price, small "Book ↗". Rows are pale (30% black) until hovered, when the row turns black and indents; the clipper cut-out follows the pointer over the list with a slight lag and tilts with its speed.

| # | Name | Note | Min | Price |
|---|---|---|---|---|
| #0 | Fade | skin at the bottom, blended up as high as you like | 45 | $50 |
| #1 | Taper | clean around the ears and the neck, length left on top | 40 | $45 |
| #2 | Scissor cut | scissors only, for longer hair that needs to move | 50 | $55 |
| #3 | Lineup | temples and edges by straight razor, between cuts | 20 | $25 |
| #4 | Beard shape-up | shape, line and a hot towel to finish | 25 | $30 |
| #5 | Hot towel shave | two towels, warm lather and a straight razor | 40 | $45 |
| #6 | Cut and beard | the fade and the beard in the same chair | 70 | $75 |

Mono note under the list: "EVERY SERVICE ENDS WITH A RAZOR LINEUP · CARD AND APPLE PAY AT THE CHAIR".

**2 · Why book here** (pinned, 320vh track, paper). Centred sentence: "Nobody should have / to DM at midnight for / **a 2 PM haircut.**" Three cut-out objects float around it in three seats (upper left, upper right, below the sentence), each with a soft shadow and a slow bob. As the track scrolls, every object moves one seat on, twice. Under the sentence a black pill names the current step: "**~1 day** TEXT REMINDER THE DAY BEFORE" → "**$10** DEPOSIT, TAKEN OFF YOUR CUT" → "**60 s** TO BOOK, MIDDLE OF THE NIGHT OR NOT".

**3 · Barbers** (black). "#2 · THE CHAIRS", "Four mirrors. **Pick yours.**", "Every barber has his own station and his own calendar. Pick a mirror to switch on his light." A row of four tall panels (30vw high), each a barber photo, darkened to 35% brightness, with a lamp cord and shade above it. The active panel is 3.3× wider, full brightness, with a thin white frame and a lit lamp; hovering or clicking another panel moves the light. Captions bottom-left: "#1 **Caio**", "#2 **Renan**", "#3 **Toninho**", "#4 **Davi**"; the active one adds a mono line (e.g. "SCISSORS AND RAZOR · 31 YEARS BEHIND THE CHAIR"). Toninho is active first.

Below: filter chips (All, Caio, Renan, Toninho, Davi) and a 4-column grid of the eight haircut portraits, each with a small "BY CAIO" tag, name, price and "BOOK THIS CUT →": Fade with a part $55, Curly taper $50, Textured fringe $60, Classic side part $55, Buzz and beard $65, Loose quiff $55, Fade with a design $65, Full beard $75. Chips filter the grid by barber.

**4 · Club** (paper). "#3 · THE CLUB", "Your cut, **on the calendar.**", "A fade holds for about three weeks. Club members get a standing chair and pay less than the menu price." Three plan cards fanned like a hand of cards: the outer two white and rotated ±4°, the middle one black, larger, on top, with a tilted "MOST POPULAR" flag.

| Plan | Price | Lines | Saving | Button |
|---|---|---|---|---|
| LINEUP | $39/mo | Two lineups a month · 10% off any cut · Book 14 days ahead | YOU SAVE $11 A MONTH | Sign up |
| FADE CLUB | $119/mo | Two fades a month · Unlimited lineups · Your chair held every other Friday | YOU SAVE **$31** A MONTH | Join the club ↗ |
| EVERY WEEK | $209/mo | A cut every week · Beard shape-up included · First pick of Saturday slots | YOU SAVE $131 A MONTH | Sign up |

**5 · Shop** (black). "#4 · THE COUNTER", "What your barber **used on you.**", "Take it home after your cut or get it at your door the next day." Four product cards: Matte pomade $24 (3.5 OZ), Beard oil $22 (1 FL OZ), Hair tonic $20 (6.8 FL OZ), Pocket comb $14 (ACETATE), each with an "Add to bag +" chip that toggles to "In the bag ✓". Then a gift-card block: left, a brushed-silver card (CSS gradient, rotated −3°) reading "PENTE FINO", "$ 150", "GIFT CARD · ANY SERVICE"; right, "A chair, **gift-wrapped.**", "Lands in their inbox within a minute, works for any service or product, and never expires.", amount chips $75 / $150 / $250 that change the number on the card, and "Send a gift card ↗".

**6 · Reviews** (paper). "#5 · SAID IN THE CHAIR". A giant light "4.9" (21vw) with "★★★★★ · 612 GOOGLE REVIEWS", and beside it a black quote card that looks like the top of a stack, with a white "1 / 4 · NEXT →" pill on its corner that cycles four quotes with a quick fade. First quote: "“Caio rescued a fade another shop had wrecked. I booked my next one before I got out of the chair.” MARCOS · FADE".

**7 · Location** (black, two columns). "#6 · WHERE WE ARE", "Two blocks from **the subway.**", "240 Alder St · Brooklyn, NY 11201 / Validated parking on the corner", "**Text +1 (555) 010-0142**", an hours table (MON – FRI 9 AM – 7 PM; SATURDAY · TODAY 9 AM – 8 PM, highlighted; SUNDAY 10 AM – 4 PM) and a tilted outlined tag "WALK-INS UNTIL 6 PM". Right: an abstract SVG map (dark blocks, thick darker streets at a slight angle), a white line that draws itself from a small ring labelled SUBWAY to a large white dot labelled PENTE FINO, caption "4 MIN WALK FROM THE SUBWAY".

**8 · Questions** (black). "Before / **you book.**" and an accordion: Why a $10 deposit? · What if I’m running late? · When should I book my next cut? · Do you take walk-ins? · How do I pay? (short honest answers). Below, an outlined bar: "✂ Hiring: **two chairs for rent** · steady clientele, your hours, your book." with "Tell me more".

**9 · Close** (black). "Open today **at 9:00 AM.**" with "Book a chair ↗", then the name "pente fino" in the heavy weight sized to the full page width with a grey-to-black vertical gradient, and a mono footer (section links; "PENTE FINO BARBERSHOP · 240 ALDER ST · FADES, RAZORS AND PEOPLE · © 2026").

## 5. Small screens (≤ 820px)

Hide the centre nav; hero words at 40vw / 34vw with the chair 58vh tall; the service rows drop the minutes and the button; the mirrors stack vertically (the active one 46vh tall, the others 13vh); grids go to two columns; plan cards stack unrotated; two-column blocks become one.

## 6. Details

- Semantic lists and buttons (`aria-pressed` on mirrors, `aria-expanded` on questions, tabs for the chips); one `h1`.
- `prefers-reduced-motion`: no blur-in, no opening animation, no easing.

## 7. Checks

- The opening shows the name over hair, then the chair under its light between "pente" (behind) and "fino" (in front).
- Scrolling the hero turns the room to paper; hovering the price list brings the clipper to the pointer.
- In "why book here" the three objects trade places twice and the pill changes each time.
- Hovering a mirror moves the light; chips filter the cuts; gift amounts change the card; "NEXT" turns the quote; questions open.
- The header is white over black sections and black over paper ones.
- No horizontal scroll at any width; no console errors; every image returns 200.

Build the landing page for **Capiá**, a Denver burger joint whose mascot is a capybara ("My Capiá, my calm."). It is loud and friendly: flat sheets of black, cream, mustard yellow, tomato red and green that follow each other with torn-paper edges; a chunky condensed headline face next to a brush script; real food photography cut out and floating; little rounded stickers and tags tilted a few degrees; everything bounces slightly when touched. The page scrolls normally. Its heart is a four-part menu (Burgers, Sides, Drinks, Desserts), each a full-screen coloured sheet where picking an item swaps a big "exploded" picture of it.

Plain HTML, CSS and vanilla JS, no libraries. Files: `index.html`, `css/style.css`, `js/main.js`.

## 1. Assets (hosted, use these URLs as they are)

Base: `https://res.cloudinary.com/ce2yatay/image/upload/capia/`. All cut-outs have transparent backgrounds.

| File | Size | What it is |
|---|---|---|
| `hero-burger.webp` | 1200 × 1121 | The hero burger alone, cut out |
| `bit-tomato.webp`, `bit-lettuce.webp`, `bit-cheese.webp`, `bit-onion.webp`, `bit-pickles.webp`, `bit-bun.webp` | 420px wide | Loose ingredients, cut out |
| `item-<name>.webp` | 1300px wide | One exploded view per menu item: the product in the middle with its ingredients floating around it, cut out as one picture. Names: `classic`, `bacon`, `pinon`, `chicken`, `fries`, `rings`, `polenta`, `shake`, `tea`, `brownie`, `flan` |
| `thumb-<name>.webp` | up to 220px | The product alone, small, for the picker (same names) |
| `mascot.webp` | 900 × 731 | Black line drawing: a capybara in a cap riding a delivery scooter |
| `capy.webp` | 400 × 273 | Black line icon: a capybara lying down. Use `filter: invert(1)` to show it white |
| `about-buns.webp`, `about-griddle.webp`, `about-shop.webp` | 900 × 678 | Photos: brushing buns, patties on the griddle, the shop at dusk |

## 2. Look

- Colours: black `#171310`, cream `#f6efe2`, yellow `#f9b21c`, red `#de3a26`, green `#3c8a42`.
- Fonts (Google Fonts): **Bricolage Grotesque** at `font-stretch: 78%`, weight 800, letter-spacing −0.035em, for headlines; **Yellowtail** for the script; **DM Sans** 400–700 for text and small caps labels.
- Buttons: fully rounded pills, bold, with a "›"; on hover they straighten and grow 6% with a springy easing (`cubic-bezier(0.3, 1.5, 0.5, 1)`).
- **Torn edges**: every sheet except the hero paints a ragged strip of its own colour over the bottom of the sheet above (a pseudo-element `clip-path: polygon(...)` built by script from three summed sines, about 1.6vw tall, different for each sheet).

## 3. Sections

**Header** (not fixed, over the hero): left the `capy` icon in white and "Capiá"; right small caps "MENU ▾", "ABOUT", "CONTACT".

**Hero** (black, one screen). Left at 13vw / 19vh: `h1` "My Capiá," in white (5.1vw) and under it, shifted left and tilted −5°, "my calm." in yellow script. A white pill "See the menu ›", tilted −3°. Right (from 59vw, 30vw wide): the burger, bobbing gently and leaning toward the pointer, with a soft shadow. Around it the loose ingredients (tomato and lettuce above, cheese and onion to the left, two blurred pickles further out): as the page scrolls they drift outward and spin, each at its own depth, and they lean away from the pointer. A red rounded sticker "House Classic ›", tilted −7°, overlaps the burger's lower left. Top-right of the burger, a round seal: the text "GRIDDLED TO ORDER · NO RUSH · STAY CALM ·" on a circle, turning slowly, with the white capy icon in the middle. The bottom of the hero is a big cream wave (an SVG curve rising from left to right).

**Mascot** (cream, centred). `h2` "Call him what / you like," with four small tilted tags popping in around it one after another: green "MR. CAPIÁ", red "CAPI", black "BIG GUY", yellow "THE KID". Script line: "he’s always had a way of putting / hunger in a good mood." Red pill "Meet Capiá ›". Below, `mascot.webp` (15vw) rides across the screen from left to right as the section scrolls past.

**Words** (black strip, torn). Two rows of big headline words that slide in opposite directions with the scroll and slowly on their own, coloured in rotation yellow / red / cream / light green: "Juicy Toasted Griddled Melty Crispy Smoky No rush" and "Piping hot House-made Fresh Golden Creamy Spicy Easygoing".

**Menu**: four sheets, each at least one screen tall, centred:

- a headline (the category),
- a picker: "‹", a row of pills, "›". Each pill has the item's thumbnail poking out on the left, its name in bold and a two-word note; the active pill is black with white text (yellow with black text on the dark sheet),
- a stage 50vh tall: behind, the word "Capiá" in huge white script at 26% opacity, tilted −7°; in front, the item's exploded picture with a soft shadow; two tilted tags, one black top-left and one white bottom-right,
- a line of ingredients, and a pill "Order burgers ›" (and so on).

Picking another item: the picture shrinks to 82%, tilts and fades, the tags pop out, then the new picture springs in and the texts change (about 280ms out, 700ms in).

| Sheet | Colour | Items: name · note · tag A · tag B · ingredients |
|---|---|---|
| Burgers | yellow, black type | House Classic · double smash · 6 OZ OF BEEF · BEST SELLER · brioche bun · two 3 oz smash patties · cheddar · pickles · onion · house sauce |
| | | Bacon Kid · crispy bacon · 1/3 LB OF BEEF · SMOKY · brioche bun · 1/3 lb house blend · cheddar · bacon · caramelized onions · smoked mayo |
| | | Mountain Piñon · white cheddar · HOUSE RECIPE · ONLY IN DENVER · brioche bun · 1/3 lb house blend · aged white cheddar · toasted pine nut crumble · arugula · roasted garlic mayo |
| | | Crispy Chicken · extra crunchy · BUTTERMILK BRINED · HOT HONEY · brioche bun · fried chicken thigh · slaw · pickles · hot honey |
| Sides | red, white type | House Fries · hand-cut · 10 OZ SERVING · MADE TO SHARE · skin-on potatoes · herb salt · rosemary · fry sauce |
| | | Onion Rings · battered fresh · 8 RINGS · EXTRA CRISPY · onion · crispy batter · paprika · herb mayo |
| | | Polenta Fries · crispy outside · GLUTEN-FREE · WITH PARMESAN · polenta · parmesan · parsley · tomato dip |
| Drinks | green, white type | Strawberry Shake · house ice cream · 16 OZ · HAND-SPUN · vanilla ice cream · fresh strawberries · whipped cream |
| | | Lemon Iced Tea · house-brewed · 20 OZ · UNSWEETENED · black tea · lemon · mint · lots of ice |
| Desserts | black, white type, yellow button | Brownie Sundae · hot inside · SERVED WARM · MADE TO SHARE · brownie · vanilla ice cream · chocolate sauce |
| | | Caramel Flan · like grandma’s · BAKED DAILY · SILKY · eggs · milk · vanilla · dark caramel |

While any menu sheet is in view, a small white rounded rail with four dots is fixed at the left edge; the dot of the current sheet is dark (yellow on the black sheet); dots link to the sheets.

**About** (cream, torn). A row of five small tilted stamps (yellow "BUNS BAKED DAILY", red "FRESH BEEF", green "GRIDDLED TO ORDER", grey "MOUNTAIN PIÑON", outlined "NO RUSH"). `h2` "Let the griddle / do the talking". Paragraph: "Capiá started on a Denver street corner with a simple idea: buns out of the oven every morning, beef ground fresh every day and a griddle that’s good and hot. When the cold rolls in, mountain piñon goes on the menu. The rest of the year it’s business as usual, no rush: every burger is built to order, just the way you like it." Three photos in soft blob shapes (irregular `border-radius`), each with a flat offset shadow in green, yellow, red; the middle one larger; on hover a blob relaxes into a rounder shape.

**Club** (black, torn). At the top, a fan of seven portrait cards (10.4vw wide, ratio 0.62, 12px radius) stacked almost on top of each other; moving the pointer toward either side of the screen spreads the fan wide. Each card is one flat colour with three short words in the headline face, a product picture cropped at its bottom, and a tiny "@capia.burger": "Tonight we smash." (yellow), "Fries made to share." (red), "Sunset, a burger, a capy." (green), "easy, kid." (black with yellow text), "No rush. Ever." (cream), "Griddled to order." (yellow), "Stay calm." (red). Under the fan, in yellow: "Moments of calm on / @capia.burger", with a small tilted yellow tag "MOVE YOUR MOUSE". Then the newsletter: a white ring with the white capy icon, "Join the / calm club.", a cream email field and a red pill "Sign up ›" (on submit, validate and show "You’re in. Stay calm."). Footer lines: "Capiá Burger | Denver, CO | Tue–Sun · 6–11 PM" and "© 2026 Capiá. All rights reserved. Privacy | Cookies". Last, edge to edge, sized by script to the page width: "my Capiá. **my calm.**" in cream and yellow, its descenders cut by the bottom of the page.

## 4. Small screens (≤ 760px)

Hero: title 13vw at the top, burger 62vw wide at the bottom centre; the picker becomes a horizontally scrolling row without arrows; the stage is 62vw tall with the picture slightly wider than the screen; hide the rail; photos stack; cards 30vw wide; the newsletter stacks.

## 5. Details and checks

- One `h1`; the picker is a `tablist`; decorative pictures have empty `alt`. `prefers-reduced-motion`: no bobbing, no drifting words, no spinning seal.
- Top: the burger with its ingredients floating, "my calm." in yellow script, the seal turning, a cream wave below.
- Scrolling: the ingredients fly apart; the mascot rides across while the tags pop; the two rows of words cross.
- Each menu sheet has a torn top edge; clicking a pill or an arrow swaps the exploded picture, the tags and the ingredients; the rail marks the sheet.
- Moving the pointer over the last section spreads the fan of cards.
- No horizontal scroll at any width; no console errors; every image returns 200.

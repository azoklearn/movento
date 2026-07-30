# MOSS® — Dark Botanical Commerce Landing

## LAYER 1 — OPENING DECLARATION

Build a **single-page landing** for **MOSS®** — a **premium sea moss multivitamin brand**.

Use the following **pinned** tech stack (do not substitute):

- **Vanilla HTML5 + CSS + JavaScript** — exactly 3 files: `index.html`, `styles.css`, `script.js`. No frameworks, no build step, no external JS libraries.
- Icons: inline SVG only (one cart icon, spec in Section 0). No icon libraries.
- Animation: CSS transitions/keyframes only. **No scroll-reveal** — all content renders statically visible.

The aesthetic is **dark botanical minimal: near-black canvas, hairline borders, frosted-glass pill buttons, ultra-light display headlines with italic serif accent words, and a full-screen looping background video in the hero**. `#060606` is the global background. Default text color is `#f4f2ee`. **Do not use purple, indigo, neon green, or any saturated accent color anywhere — the palette is strictly monochrome warm-white on black.**

---

## LAYER 2 — FONTS

Load via Google Fonts in `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
```

- **Body & headings:** `DM Sans` — headlines render at weight **300**, body 300–400, labels/buttons 500–700.
- **Accent:** `DM Serif Display` *italic* — used ONLY inside `<em>` for single emphasized words inside headlines.

```css
body { font-family: "DM Sans", system-ui, sans-serif; font-weight: 300; line-height: 1.6; -webkit-font-smoothing: antialiased; }
em   { font-family: "DM Serif Display", Georgia, serif; font-style: italic; font-weight: 400; }
```

If a weight is unavailable, clamp down to the nearest available weight — do not synthesize.

---

## LAYER 3 — COLOR SYSTEM

Define on `:root` in `styles.css`. Ship as single dark theme, hex + rgba:

```css
:root {
  --bg: #060606;                             /* page background */
  --bg-soft: #0d0d0d;                        /* section / card background */
  --bg-card: #111111;                        /* image placeholder fill */
  --line: rgba(255, 255, 255, 0.14);         /* visible hairline borders */
  --line-soft: rgba(255, 255, 255, 0.08);    /* subtle hairline borders */
  --text: #f4f2ee;                           /* primary text (warm white) */
  --text-dim: rgba(244, 242, 238, 0.62);     /* secondary text */
  --text-faint: rgba(244, 242, 238, 0.38);   /* tertiary text, numbers */
  --accent: #f4f2ee;

  --radius-pill: 999px;
  --radius: 18px;
  --pad-x: clamp(20px, 5vw, 72px);           /* global horizontal padding */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);    /* standard easing everywhere */
}
```

---

## LAYER 4 — CUSTOM CSS UTILITIES (the "design DNA")

Paste verbatim — do not paraphrase, do not "improve".

### 4a. Pill (signature nav/button treatment — frosted glass)

```css
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  color: var(--text);
  font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  text-decoration: none; cursor: pointer; white-space: nowrap;
  transition: background 0.35s var(--ease), border-color 0.35s var(--ease);
}
.pill:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.3); }
.pill-ghost { background: transparent; }
```

### 4b. Primary CTA (solid white pill)

```css
.cta {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 30px; border-radius: var(--radius-pill);
  background: var(--text); color: #000;
  font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
  text-decoration: none;
  transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease);
}
.cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255, 255, 255, 0.12); }
.cta-arrow { font-size: 13px; transition: transform 0.35s var(--ease); }
.cta:hover .cta-arrow { transform: translateX(4px); }
```

### 4c. Eyebrow label

```css
.eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.28em;
  text-transform: uppercase; color: var(--text-dim); margin-bottom: 20px;
}
.eyebrow.center { text-align: center; }
```

### 4d. Section title

```css
.section-title {
  font-size: clamp(34px, 4.6vw, 62px);
  font-weight: 300; line-height: 1.08; letter-spacing: -0.02em;
}
.section-title.center { text-align: center; }
```

### 4e. Image placeholder (every non-hero image slot)

```css
.ph {
  background: var(--bg-card);
  border: 1px dashed var(--line-soft);
  position: relative; overflow: hidden;
}
.ph::after {
  content: attr(data-label);
  position: absolute; inset: 0; display: grid; place-items: center;
  font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--text-faint);
}
```

### 4f. Marquee keyframes

```css
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
```

---

## LAYER 5 — MEDIA ASSETS

**Hero — looping background video.** Reference the URL directly; do not swap it for a stock or placeholder video:

```html
<div class="hero-media">
  <video src="https://cdn.5sdesign.art/projects/moss/hero.mp4" autoplay muted loop playsinline></video>
</div>
```

```css
.hero-media { position: absolute; inset: 0; background: #000; }
.hero-media video { width: 100%; height: 100%; object-fit: cover; }
/* readability vignette over the video */
.hero-media::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 45%);
}
```

If the video fails to load, the hero falls back to solid black — which is by design.

**Final CTA section — Option D, solid black** with radial vignette:

```css
.final-media { position: absolute; inset: 0; background: #000; border-top: 1px solid var(--line-soft); }
.final-media::after { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); }
```

All other imagery = `.ph` placeholders (Layer 4e) — swap in your own product/lifestyle photos, keeping each slot's aspect ratio and radius.

---

## LAYER 6 — SHARED COMPONENTS / BEHAVIOR (script.js, entire file)

```js
// Nav background after scrolling past hero top
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 40), { passive: true });

// FAQ accordion: opening one closes the others
document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});
```

`html { scroll-behavior: smooth; }` for anchor links.

---

## LAYER 7 — SECTIONS (in DOM order)

### SECTION 0 — NAV (fixed header)

- Container: `<header class="nav">` — `position: fixed; top/left/right: 0; z-index: 100; padding: 18px var(--pad-x); transition: background 0.4s var(--ease);`
- Scrolled state: `.nav.scrolled { background: rgba(6,6,6,0.72); backdrop-filter: blur(16px); }`
- Inner: flex, `justify-content: space-between; position: relative;` — groups `display: flex; gap: 8px;`
- **Left group** (3 `.pill` links): `Shop` → `#shop`, `Affirm` → `#inside`, `News` → `#journal`
- **Center brand** (absolute, `left: 50%; transform: translateX(-50%)`): `MOSS<sup>®</sup>` — 20px, weight 600, letter-spacing 0.12em; `sup` 9px weight 400
- **Right group**: `.pill` link `Login`; `.pill` button `USD <span class="caret">▾</span>` (caret 8px, opacity 0.7); `.pill pill-icon` cart button (padding 9px 12px) containing a 16×16 inline SVG bag — `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"`, paths `M6 8h12l-1 12H7L6 8z` and `M9 8V6a3 3 0 0 1 6 0v2` — plus badge `.cart-count` "0": absolute −4px top/right, 16×16 circle, background `var(--text)`, black text 9px weight 600.

### SECTION 1 — HERO

- Container: `<section class="hero" id="top">` — `position: relative; min-height: 100svh; display: flex; align-items: center; justify-content: center; overflow: hidden;`
- Background: Layer 5 video + vignette. **No play button, no other UI in the hero.**
- Content block `.hero-content`: relative, z-index 4, `text-align: center; padding: 0 var(--pad-x); max-width: 1000px;` — **vertically and horizontally centered in the viewport**.
- Hero eyebrow override (bolder + full white for readability on video):
  ```css
  .hero-content .eyebrow { font-weight: 700; color: var(--text); }
  ```
- H1 `.hero-title`: `font-size: clamp(36px, 5.4vw, 72px); font-weight: 300; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 36px;`
- Copy (exact, `<br>` after "multivitamin", `<em>` on "ever"):

```
SEA MOSS & BLADDERWRACK
The only natural multivitamin
you will ever need.
[SHOP NOW →]   ← .cta linking to #shop, arrow in <span class="cta-arrow">
```

### SECTION 2 — MARQUEE STRIP

- `<div class="marquee" aria-hidden="true">` — `overflow: hidden; padding: 16px 0; background: var(--bg-soft);` bordered top+bottom `1px solid var(--line-soft)`.
- Track: `display: flex; gap: 40px; width: max-content; animation: marquee 28s linear infinite;` — items 11px weight 500 letter-spacing 0.24em uppercase `var(--text-dim)`, separated by `<i>✦</i>` (10px, `var(--text-faint)`, `font-style: normal`).
- Sequence, duplicated ×2 back-to-back for the seamless −50% loop:

```
92 of 102 essential minerals ✦ Wildcrafted, never farmed ✦ Vegan & gluten free ✦ Third-party lab tested ✦ Small-batch, made weekly ✦
```

### SECTION 3 — INTRO

- `<section class="intro">` — `padding: clamp(90px, 14vh, 160px) var(--pad-x); max-width: 920px; margin: 0 auto; text-align: center;`
- Title `.intro-title`: `clamp(30px, 4vw, 54px)`, weight 300, line-height 1.15, margin-bottom 28px. Body `.intro-body`: `clamp(15px, 1.3vw, 18px)`, `var(--text-dim)`, max-width 620px centered.

```
ONE SPOONFUL A DAY
Nature already made the perfect supplement.
We just bottled it.            ← <em>bottled</em>
Sea moss and bladderwrack carry 92 of the 102 minerals your body is made of — straight from the ocean, nothing synthesized, nothing added. One gel, every morning, and your body takes what it needs.
```

### SECTION 4 — SHOP

- `<section class="shop" id="shop">` — `padding: 0 var(--pad-x) clamp(90px, 14vh, 160px);`
- Head row `.section-head`: flex, `align-items: flex-end; justify-content: space-between; margin-bottom: 44px;` — title `Shop the ritual` (`<em>ritual</em>`) + `.pill pill-ghost` link `View all`.
- Grid `.product-grid`: `grid-template-columns: repeat(4, 1fr); gap: 16px;`
- Card `.product-card`: `border: 1px solid var(--line-soft); border-radius: var(--radius); overflow: hidden; background: var(--bg-soft);` hover → border `var(--line)`, `translateY(-4px)`, both 0.35s var(--ease).
- Card media `.product-media ph` with `data-label="Product image"`: `aspect-ratio: 4/5; border: none; border-bottom: 1px dashed var(--line-soft);`
- Tag `.tag` (absolute top 14px left 14px): white pill, black text 9px weight 600 letter-spacing 0.18em uppercase, padding 5px 12px.
- Info: padding 20px; h3 17px weight 500; p 13px `var(--text-dim)` `min-height: 40px`; row flex space-between with `.price` 19px weight 500 (`.per` 12px dim weight 400) + `.pill` action.
- 4 products (name / description / price / button / tag):

```
1. Original Sea Moss Gel — Wildcrafted sea moss & spring water. The everyday multivitamin. — $38 — Add to cart — tag: Bestseller
2. Bladderwrack Blend — Sea moss + bladderwrack for thyroid & metabolism support. — $42 — Add to cart — tag: New
3. Elderberry Infusion — Immunity-forward. Sea moss infused with wild elderberry. — $44 — Add to cart
4. The Monthly Ritual — Subscribe & save 20%. Fresh batch at your door, every month. — $30/mo — Subscribe
```

### SECTION 5 — WHAT'S INSIDE

- `<section class="inside" id="inside">` — 2-col grid `1fr 1fr`, `gap: clamp(40px, 6vw, 96px)`, `align-items: center`, padding as Section 4.
- Left: `.inside-media ph` `data-label="Ingredient image"` — `aspect-ratio: 4/5; border-radius: var(--radius);`
- Right: eyebrow + title (margin-bottom 40px) + `.mineral-list` — rows flex gap 24px, `padding: 22px 0`, `border-top: 1px solid var(--line-soft)` (last also border-bottom); number 11px `var(--text-faint)` letter-spacing 0.1em padding-top 5px; h4 16px weight 500; p 13.5px dim.

```
WHAT'S INSIDE
92 minerals.
Two ingredients.               ← <em>ingredients</em>
01  Iodine & Selenium — Natural thyroid support — energy, focus and metabolism regulation.
02  Zinc & Iron — Immune defense and oxygen flow, absorbed the way nature intended.
03  Potassium & Magnesium — Muscle recovery, deeper sleep and a calmer nervous system.
04  Collagen-boosting compounds — Skin, hair and joints — fed from the inside out.
```

### SECTION 6 — BENEFITS

- `<section class="benefits">` — centered eyebrow + centered title (margin-bottom 52px), grid `repeat(4, 1fr)` gap 16px.
- Card `.benefit-card`: `border: 1px solid var(--line-soft); border-radius: var(--radius); background: var(--bg-soft); padding: 32px 26px;` hover border `var(--line)`.
- Icon `.benefit-icon`: 44×44 circle, `border: 1px solid var(--line)`, glyph 17px, margin-bottom 22px. Glyphs are plain text characters: `☀︎` `❍` `✚` `≈`.

```
WHY SEA MOSS
Felt in weeks, not months.     ← <em>weeks</em>
☀︎ Steady energy — No caffeine spike, no crash. Minerals your cells actually run on.
❍ Clearer skin — Sulfur and collagen precursors that show up in the mirror.
✚ Stronger immunity — Antiviral, antimicrobial, and rich in zinc — year-round defense.
≈ Better digestion — A natural prebiotic that soothes and feeds your gut lining.
```

### SECTION 7 — THE RITUAL

- `<section class="ritual">` — same 2-col grid as Section 5; text LEFT, media RIGHT (`.ritual-media ph` `data-label="Lifestyle image"`, aspect 4/5, radius).
- Steps `.ritual-steps`: rows flex baseline gap 20px, 16px text, `padding: 18px 0`, hairline top borders (last also bottom); numbers 11px faint. Margin-bottom 40px, then `.cta` (class `cta cta-dark`, same white style).

```
THE RITUAL
One spoon.
Any morning.                   ← <em>morning</em>
01  Take one tablespoon, straight or stirred.
02  Add to smoothies, coffee, tea or water.
03  Keep refrigerated — every batch is made fresh.
[START YOUR RITUAL →]          ← links to #shop
```

### SECTION 8 — REVIEWS

- `<section class="reviews" id="journal">` — centered head (title margin-bottom 52px), grid `repeat(3, 1fr)` gap 16px.
- Card `.review-card` (`<figure>`): hairline border, radius, `background: var(--bg-soft)`, padding 34px 30px. Stars `★★★★★` 13px letter-spacing 4px margin-bottom 20px; quote 16px line-height 1.55 margin-bottom 22px; caption 12px dim.

```
LOVED BY 40,000+
Word of mouth.                 ← <em>mouth</em>
★★★★★ "Three weeks in and my energy is completely different. I stopped buying five separate supplements." — Amara J., verified buyer
★★★★★ "My skin has never been clearer. It's the only thing I changed in my routine." — Danielle R., verified buyer
★★★★★ "Tastes like nothing in my smoothie, works like everything. Subscribed after the first jar." — Marcus T., verified buyer
```

### SECTION 9 — FAQ

- `<section class="faq">` — `max-width: 860px; margin: 0 auto;` centered title (margin-bottom 48px).
- Native `<details>` items, hairline top borders (last also bottom). `<summary>`: flex space-between, `padding: 24px 0`, 16.5px weight 400, marker hidden, trailing `<span class="faq-plus">+</span>` (20px weight 300 dim) rotating 45° when open (0.3s var(--ease)). Answer `<p>`: `padding: 0 0 26px`, 14.5px dim, max-width 640px. Behavior: Layer 6 accordion.

```
Questions, answered.           ← <em>answered</em>
Q: What does sea moss gel taste like?
A: Nearly nothing — a faint ocean-mineral note. In a smoothie or tea, it disappears completely.
Q: How long does a jar last?
A: One jar is roughly a 30-day supply at one tablespoon per day. Keep it refrigerated and it stays fresh for 3–4 weeks.
Q: Where is your sea moss from?
A: Wildcrafted off the coast of St. Lucia — ocean-grown, sun-dried, never pool-farmed. Every batch is third-party lab tested.
Q: Can I take it while pregnant?
A: Sea moss is a whole food, but we always recommend checking with your doctor first — especially regarding iodine intake.
Q: What's your shipping & return policy?
A: Cold-packed and shipped within 48 hours, free over $50. Not feeling it? 30-day money-back guarantee, no questions asked.
```

### SECTION 10 — FINAL CTA

- `<section class="final">` — `position: relative; min-height: 72svh; display: grid; place-items: center; text-align: center; overflow: hidden;` background per Layer 5 (solid black + radial vignette).
- Content z-index 2, `padding: 100px var(--pad-x)`. Title `.final-title`: `clamp(32px, 4.6vw, 60px)`, weight 300, line-height 1.12, margin-bottom 40px.

```
Your body already knows
what to do with it.            ← <em>do</em>
[SHOP NOW →]                   ← links to #shop
```

### SECTION 11 — FOOTER

- `<footer class="footer">` — `border-top: 1px solid var(--line-soft); background: var(--bg-soft); padding: clamp(60px, 8vh, 90px) var(--pad-x) 36px;`
- Top grid `1.4fr 1fr 1fr 1.4fr` gap 40px, margin-bottom 70px:
  - **Col 1:** brand `MOSS®` (static position) + tagline `The ocean's multivitamin,` `<br>` `delivered fresh.` (14px dim, margin-top 18px)
  - **Col 2 "SHOP":** Sea Moss Gel · Bladderwrack Blend · Elderberry Infusion · Subscriptions
  - **Col 3 "COMPANY":** Our story · Lab results · Journal · Contact
  - **Col 4 "STAY IN THE LOOP":** newsletter form — pill input placeholder `Email address` (transparent, hairline border, focus border rgba(255,255,255,0.4)) + `.pill` submit `Join`; then socials row `Instagram · TikTok · YouTube` (12px uppercase dim, hover white)
- Column headings: 11px weight 500 letter-spacing 0.24em uppercase `var(--text-faint)` margin-bottom 20px. Links: block, 14px dim, `padding: 5px 0`, hover → `var(--text)` 0.3s.
- Bottom bar: flex space-between, `padding-top: 28px; border-top: 1px solid var(--line-soft);` 12px `var(--text-faint)`:

```
© 2026 MOSS. All rights reserved.        Privacy   Terms   Shipping
```

---

## LAYER 8 — ANIMATION STANDARDS (project-wide)

- Standard easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Hover transitions: 0.35s (pills, cards, CTA); nav background 0.4s; link colors 0.3s.
- Marquee: 28s linear infinite, translateX(−50%), track duplicated ×2, disabled under `prefers-reduced-motion`.
- **No entrance/scroll-reveal animations.** Content must never be hidden behind opacity-0 states. The only JS behaviors are the two in Layer 6.

---

## LAYER 9 — RESPONSIVE STANDARDS

- Global horizontal padding: `var(--pad-x)` = `clamp(20px, 5vw, 72px)`. Section bottom rhythm: `clamp(90px, 14vh, 160px)`.
- All display type uses `clamp()` — never fixed sizes (values given per section in Layer 7).
- `@media (max-width: 1024px)`: product grid & benefit grid → 2 columns; footer top → 2 columns.
- `@media (max-width: 760px)`: hide `.nav-left`; brand becomes static (nav = brand + right group, space-between); `.inside` and `.ritual` → 1 column with `.ritual-media` ordered first (`order: -1`); reviews → 1 column; `.section-head` stacks (`flex-direction: column; align-items: flex-start`).
- `@media (max-width: 520px)`: product grid, benefit grid, footer top → 1 column; footer bottom stacks left-aligned.

---

## LAYER 10 — ICON SET

This asset uses **no icon library**. Permitted glyphs only:

```
- Cart bag           → the single inline SVG specified in Section 0 (nav cart button only)
- →                  → CTA arrows (text character inside .cta-arrow)
- ▾                  → currency dropdown caret only
- ✦                  → marquee separator only
- ☀︎ ❍ ✚ ≈           → the 4 benefit-card glyphs, in this exact order
- + (rotates 45°)    → FAQ toggle indicator only
- ★★★★★              → review stars only
```

Reject any other icon.

---

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:

- Substitute fonts ("similar to DM Sans" is not DM Sans).
- Round color values ("close to #060606" is not #060606; "white" is not #f4f2ee).
- Shorten or paraphrase copy — every string in Layer 7 is verbatim, including punctuation, `&`, em-dashes, and the `<em>` accent words.
- Add scroll-reveal, parallax, or any entrance animation — this asset intentionally has none.
- Add a play button, badges, or any element not specified in the hero.
- Move the hero content — it is dead-center of the viewport, not bottom-aligned.
- Swap the CDN hero video (Layer 5) for a stock/external video — if it fails to load, the hero falls back to solid black, which is by design.

If a constraint conflicts with platform limitations, clamp to the nearest valid value and note the substitution as a comment — do not silently change.

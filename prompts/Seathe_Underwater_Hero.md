# SEATHE — Underwater Heart-Rate Hero

> Paste this whole file into your AI website builder (Claude Code · Cursor · v0 · Lovable · Bolt · Windsurf). It reproduces the SEATHE hero exactly. Reproduce every value verbatim — fonts, hex colors, pixel sizes, copy, SVG paths, and transition timings. Do not substitute, round, shorten, or "improve" anything.

---

## 1 · OPENING DECLARATION

Build a **single full-screen hero section** for **SEATHE** — a wearable guardian that tracks a diver's heart rate in real time underwater and alerts their team the instant something changes.

Pinned tech stack (do not substitute):

- **React 18 + TypeScript + Vite**
- **Tailwind CSS 3** (default config + the extensions below)
- **No animation library.** The hero is fully static — all content is visible on first paint. Use plain CSS transitions only (hover states). Never hide content behind scroll or entrance reveals.
- **No icon library.** All three icons (chevron, search, star) are inline SVGs with the exact paths in §10.

The aesthetic is **dark, cinematic, underwater**: a full-bleed looping background video, a near-black wash for legibility, a high-contrast serif headline in warm off-white, and a single warm-orange accent used **only** on the review stars. The hero's base color is `#050607` (it sits behind the video as a fallback); the `<body>` is `#000`. Default text color is `#f1efe9`. **Do not use purple, indigo, blue, or neon colors anywhere.**

Deliver one route (`/`) rendering the hero. Keep all custom CSS in a single `index.css` (or `globals.css`), imported once.

---

## 2 · FONTS

Load via Google Fonts in `index.html` (preconnect first), or at the top of `index.css`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

CSS-import equivalent:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@400;500;600;700&display=swap');
```

- **Playfair Display** (400/500/600/700) — the headline only.
- **Inter** (400/500) — logo, nav, subtitle, CTA, reviews, everything else.

Tailwind config extension:

```js
fontFamily: {
  display: ['"Playfair Display"', 'Georgia', 'serif'],
  sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
}
```

`html, body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }`

The page `<title>` is `SEATHE — Heart-rate protection, beneath the surface`.

---

## 3 · COLOR SYSTEM

Define as CSS custom properties on `:root` in `index.css`:

```css
:root {
  --bg:          #050607;                      /* fallback behind the video */
  --ink:         #f1efe9;                       /* headline / primary text   */
  --ink-soft:    rgba(241, 239, 233, 0.66);    /* subtitle, nav links        */
  --ink-faint:   rgba(241, 239, 233, 0.45);    /* nav dot separators         */
  --pill-bg:     rgba(18, 19, 21, 0.55);       /* glass nav pill background  */
  --pill-border: rgba(255, 255, 255, 0.10);    /* glass nav pill hairline    */
  --star:        #e8893c;                       /* review stars (only accent) */
  --cta-bg:      #f6f4ef;                       /* CTA pill fill              */
  --cta-ink:     #15171a;                       /* CTA pill text              */

  --font-display: "Playfair Display", Georgia, serif;
  --font-sans:    "Inter", system-ui, -apple-system, sans-serif;
}
```

The warm orange `#e8893c` is the single accent on the page — it appears on the five review stars and nowhere else.

---

## 4 · CUSTOM CSS (design DNA — paste verbatim)

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }

body {
  font-family: var(--font-sans);
  background: #000;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

/* Hero shell — vertical flex column: nav top, content middle, reviews bottom */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg);
}

/* Full-bleed background video */
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;          /* fill the hero edge-to-edge, no bars */
  object-position: center;
  z-index: 0;
}

/* Dark wash + edge vignette so the foreground text stays readable */
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 50% 36%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.45) 100%),
    linear-gradient(180deg, rgba(5, 6, 7, 0.55) 0%, rgba(5, 6, 7, 0.15) 32%, rgba(5, 6, 7, 0.35) 100%);
}
```

---

## 5 · BACKGROUND ASSET

A looping, muted background video fills the hero, behind everything.

```jsx
<video
  className="hero-video"
  autoPlay loop muted playsInline preload="auto"
>
  <source src="https://cdn.5sdesign.art/projects/seathe/background.mp4" type="video/mp4" />
</video>
<div className="hero-overlay" />
```

**Source requirement:** the clip must have **no baked-in black bars** — no letterbox or pillarbox in the file itself. Crop the source to its visible content before exporting; `object-fit: cover` then fills the hero edge-to-edge at every size. Black edges baked into the file cannot be removed with CSS.

z-index stack: video `z-0` → overlay `z-1` → nav `z-3`, hero content and reviews `z-2`.

---

## 6 · SHARED COMPONENTS

None. The hero is static — no `FadeIn`, no scroll triggers, no JS animation. The only motion is the looping video and the two CSS hover transitions in §8.

---

## 7 · SECTION — HERO (the only section)

**Container** — `<section className="hero">` (from §4). A vertical flex column: nav at the top, hero content below it, and the reviews row pinned to the bottom via `margin-top: auto`.

### 7.1 · Navbar
Position: `relative; z-index: 3;` · `display:flex; align-items:center; justify-content:space-between;` · padding `30px 52px`.

**Logo (left)** — text **`SEATHE`**, an `<a>` link.
- Inter, weight 500, `font-size:18px`, `letter-spacing:0.34em`, color `var(--ink)`, no underline.

**Center nav pill** — absolutely centered: `position:absolute; left:50%; transform:translateX(-50%);`
- `display:flex; align-items:center; gap:18px; padding:13px 28px;`
- `background:var(--pill-bg); border:1px solid var(--pill-border); border-radius:999px; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);`
- Four links separated by dot spans, in order: **`Home`** · **`How It Works`** · **`Technology`** · **`Use Cases`**
- Links: color `var(--ink-soft)`, `font-size:14.5px`, `letter-spacing:0.01em`, `transition:color 0.2s ease`; on hover → `var(--ink)`.
- Dot separator: `<span>` `width:3px; height:3px; border-radius:50%; background:var(--ink-faint);`

**Right actions** — `display:flex; align-items:center; gap:22px; color:var(--ink-soft);`
- **Lang button**: text **`EN`** + chevron-down SVG (§10a). `display:inline-flex; align-items:center; gap:6px; font-size:14px;` hover → `var(--ink)`. The chevron SVG carries `margin-top:1px`.
- **Search button**: search SVG (§10b), `aria-label="Search"`, hover → `var(--ink)`.

### 7.2 · Hero content
Wrapper: `position:relative; z-index:2; text-align:center; padding:14vh 24px 0;`

**Headline** — `<h1>`, two lines via `<br/>`:

```
A New Way to Dive
Safe at Heart
```

- Playfair Display, weight 500, `font-size:clamp(40px, 6.6vw, 90px)`, `line-height:1.08`, `letter-spacing:-0.005em`, color `var(--ink)`.
- Wrap the second line (`Safe at Heart`) in a span with `white-space:nowrap` (it relaxes to `normal` at ≤860px — see §9).

**Subtitle** — `<p>`, `max-width:480px; margin:26px auto 0; font-size:17px; line-height:1.62; color:var(--ink-soft);`
Exact text (the `—` is a real em dash):

```
SEATHE is a wearable guardian that tracks your heart rate in real time underwater — alerting you and your team the instant something changes. It stays in sync with how your body breathes the deep.
```

**CTA** — `<a>` pill, text **`See How It Works`**
- `display:inline-block; margin-top:36px; padding:16px 34px; border-radius:999px;`
- `background:var(--cta-bg); color:var(--cta-ink);` Inter weight 500, `font-size:15px`, no underline.
- `box-shadow:0 10px 40px rgba(0,0,0,0.35); transition:transform 0.2s ease, box-shadow 0.2s ease;`
- Hover: `transform:translateY(-2px); box-shadow:0 16px 50px rgba(0,0,0,0.45);`

### 7.3 · Reviews row (pinned bottom-center)
Wrapper: `position:relative; z-index:2; margin-top:auto; display:flex; align-items:center; justify-content:center; gap:16px; padding:0 24px 44px;`
- **`Reviews 1,042`** — Inter 500, `font-size:14px`, color `var(--ink)`.
- **Stars** — `<div>` `display:flex; gap:5px;` containing **five** identical star SVGs (§10c), each `width:22px; height:22px; fill:var(--star);`. Add `aria-label="Rated 4.8 out of 5"` on the wrapper.
- **`Excellent Score`** — Inter 500, `font-size:14px`, color `var(--ink)`.

---

## 8 · ANIMATION STANDARDS

The hero is static. The only transitions:
- Nav links + lang/search buttons: `transition: color 0.2s ease` (muted → full `--ink` on hover).
- CTA: `transition: transform 0.2s ease, box-shadow 0.2s ease` → lifts `-2px` with a deeper shadow on hover.

No entrance fades, no blur-in, no scroll reveals, no Framer Motion. Content renders fully on first paint.

---

## 9 · RESPONSIVE STANDARDS

```css
@media (max-width: 860px) {
  .nav { padding: 22px 24px; }
  .nav-pill { display: none; }              /* hide the center pill */
  .hero-content { padding-top: 18vh; }
  .headline-line2 { white-space: normal; }  /* let line 2 wrap */
}
@media (max-width: 520px) {
  .logo { font-size: 16px; letter-spacing: 0.28em; }
  .subtitle { font-size: 15.5px; }
  .reviews { flex-wrap: wrap; gap: 10px 14px; }
}
```

The headline always uses `clamp()` (never a fixed size). The background video keeps `object-fit: cover` at every breakpoint.

---

## 10 · ICONS (inline SVG — exact paths)

**10a · Chevron-down (in the EN button)**

```html
<svg width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
  <path d="M1 1.5L5.5 5.5L10 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**10b · Search**

```html
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
  <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

**10c · Star (×5, filled `--star`)**

```html
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 7.1-1.01z"/>
</svg>
```

---

## 11 · REPRODUCE-EXACTLY CLAUSE

Reproduce exactly. Do not:
- Substitute fonts — Playfair Display (headline) and Inter (everything else) only.
- Round color values — `#050607`, `#f1efe9`, `#e8893c`, `#f6f4ef`, `#15171a` are exact.
- Spread the warm orange `#e8893c` beyond the five review stars.
- Shorten or reword any copy — the headline is `A New Way to Dive` / `Safe at Heart`, the subtitle is verbatim with a real em dash.
- Add animation libraries or scroll/entrance reveals — the hero is static, fully visible on load.
- Swap the inline SVG paths for an icon library.
- Leave any black bars baked into the background video — crop the source to its visible content first.

If a constraint conflicts with a tool limitation (e.g. an unavailable font weight), clamp to the nearest valid value and note the substitution in a comment — never silently change it.

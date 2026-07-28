## Mapple Headphone Store Prompt

## LAYER 1 — OPENING DECLARATION

Build a single-page, full-viewport headphone store landing called **Mapple**. Page title: `Mapple — Over-Ear Headphones`. Meta description: `Mapple over-ear wireless headphones. Three finishes. One signature sound.` All copy is English; the brand name is **Mapple** (with an `®` superscript in the logo only). The screen is split into **3 vertical color panels** — one per product finish. Hovering a panel smoothly expands it (the other two compress) and reveals the product details (finish line, large price, description, spec list, Buy Now button) with a staggered rise, plus a giant repeated "MAPPLE" watermark behind the product. Leaving the layout returns all panels to equal width. The page never scrolls — it is one composed viewport with a floating liquid-glass navigation pill centered at the top.

Tech stack (exact): **React 19 + Vite 6 + Tailwind CSS 4** (via `@tailwindcss/vite` plugin) + **GSAP with `@gsap/react`** (`useGSAP` hook, `gsap.registerPlugin(useGSAP)`). No other libraries. Dev server port **5950**.

Files: `index.html`, `src/main.jsx` (StrictMode root), `src/index.css` (Tailwind import + theme + custom CSS), `src/App.jsx` (all UI + animation), `src/data/products.js` (all product content and per-product theme colors — the single source of truth for copy).

## LAYER 2 — FONTS

Google Fonts, one family for everything:

```
https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&display=swap
```

Tailwind theme vars — all four point to the same stack `'Google Sans Flex', 'Google Sans', system-ui, sans-serif`:
`--font-sans`, `--font-display`, `--font-body`, `--font-mono`.
Body uses `--font-body`, antialiased. Small technical labels (index numbers, nav links, specs, cart) use the `font-mono` utility but render in the same family — they differentiate by size/uppercase/letter-spacing only.

## LAYER 3 — ASSETS

- 3 product images: transparent-background PNG renders of over-ear headphones, one per finish. Download them from the CDN and place at `public/products/`:
  - `https://cdn.5sdesign.art/projects/mapple/noir.png` → `public/products/noir.png` (black / gold)
  - `https://cdn.5sdesign.art/projects/mapple/frost.png` → `public/products/frost.png` (silver / white)
  - `https://cdn.5sdesign.art/projects/mapple/moss.png` → `public/products/moss.png` (forest green)
- To sell your own product, swap these three files for your own transparent-background renders — keep the filenames and the code untouched.
- No icon set, no video, no other assets. The glow and watermark are pure CSS/text.

## LAYER 4 — DESIGN TOKENS

Global:
- Page background `#0e0d0b`. Selection: background `#c9a35c`, text `#16120b`.
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` on `:root`.
- `html, body, #root { height: 100% }`, `overscroll-behavior: none`.

Per-product themes (in `src/data/products.js`):

| token | 01 Noir | 02 Frost | 03 Moss |
|---|---|---|---|
| bg | `#161209` | `#c6cbd4` | `#4d5744` |
| text | `#f2ead8` | `#24272d` | `#eaeddd` |
| muted | `rgba(242,234,216,.55)` | `rgba(36,39,45,.55)` | `rgba(234,237,221,.55)` |
| watermark | `rgba(242,234,216,.07)` | `rgba(255,255,255,.32)` | `rgba(234,237,221,.08)` |
| accent | `#c9a35c` | `#5b6474` | `#c8a97e` |
| buttonBg | `#f2ead8` | `#24272d` | `#eaeddd` |
| buttonText | `#16120b` | `#eef0f4` | `#2c3226` |
| glow | `rgba(201,163,92,.16)` | `rgba(255,255,255,.35)` | `rgba(200,169,126,.14)` |

## LAYER 5 — CONTENT (copy verbatim — do not paraphrase)

**Product 01 — Mapple Noir** · finish `Midnight Gold` · `$299.00` · specs `Active NC / 40h battery / Hi-Res audio`
> Matte black anodized aluminum with brushed gold hardware. Studio-grade 40mm drivers and adaptive noise cancellation, tuned for depth.

**Product 02 — Mapple Frost** · finish `Polar Silver` · `$249.00` · specs `Active NC / 40h battery / Ultra-light`
> Polished silver with breathable knit mesh in arctic white. The same signature sound, wrapped in a finish that stays cool all day.

**Product 03 — Mapple Moss** · finish `Forest Bronze` · `$279.00` · specs `Active NC / 40h battery / Spatial audio`
> Deep forest green paired with warm bronze accents. A quiet, organic colorway with spatial audio that feels like open air.

Nav links: `Headphones` · `Sound` · `Support` · `Cart (0)`. Logo: `Mapple®`.
Detail eyebrow line per panel: `{finish} · Wireless Over-Ear`.

## LAYER 6 — LIQUID GLASS NAV (`.glass-nav`)

Floating pill, horizontally centered, `top: 1.25rem` (md: `1.75rem`), z-40, absolute over the panels.

- Base: `background: linear-gradient(120deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.05) 40%, rgba(255,255,255,.02) 60%, rgba(255,255,255,.10) 100%), rgba(18,16,13,.28)`; `backdrop-filter: blur(22px) saturate(180%)` (+ `-webkit-` twin); `border-radius: 9999px`; `isolation: isolate`.
- Box-shadow stack: `inset 0 1px 0 rgba(255,255,255,.40)`, `inset 0 -1px 0 rgba(255,255,255,.08)`, `inset 1px 0 0 rgba(255,255,255,.12)`, `inset -1px 0 0 rgba(255,255,255,.12)`, `0 12px 40px rgba(0,0,0,.28)`, `0 2px 8px rgba(0,0,0,.12)`.
- `::before` specular sheen: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,.18) 38%, rgba(255,255,255,.05) 48%, transparent 60%)`, `background-size: 250% 100%`, position `120% 0`; on nav hover slides to `-20% 0` with `transition: background-position 1.2s var(--ease-out-expo)`.
- `::after` bottom refraction: `inset: 55% 6% -2% 6%`, radial gradient `rgba(255,255,255,.14) → transparent 65%`, `filter: blur(3px)`.
- Contents: logo (18px bold, tight tracking) · 3 links (11px uppercase, tracking .18em, `white/75`, each a `.glass-link` pill — hover `background rgba(255,255,255,.12)` + white text, .35s ease) · Cart button (white/90 pill, dark text, 11px uppercase, hover solid white). Middle links hidden below `md`.

## LAYER 7 — SECTIONS (one panel per product)

Each panel: `flex: 1 1 0%`, `min-width/min-height: 0`, `will-change: flex-grow`, `overflow: hidden`, `cursor: pointer`, background/text from its theme. Stacked inside (z-order bottom→top):

1. **Watermark** (z-0, hidden by default): 3 stacked lines of `Mapple`, uppercase, `font-size: clamp(4rem, 13vw, 13rem)`, weight 800, `letter-spacing: -0.04em`, `line-height: 0.82`, color = theme watermark, centered column.
2. **Glow** (z-0): 60vmin circle centered on the panel, `radial-gradient(circle, {theme.glow} 0%, transparent 70%)`, `blur(64px)`.
3. **Product image** (z-10): centered, `max-height: 46vh` (md: `56vh`), `max-width: 86%`, `object-contain`, bottom padding `10vh` (md: `8vh`), `filter: drop-shadow(0 40px 60px rgba(0,0,0,.35))`.
4. **Idle label** (z-20, bottom bar): left — index (`01`, 11px, tracking .2em, muted) above product name (18px semibold, tight); right — price (11px, tracking .15em, muted).
5. **Details** (z-30, bottom-centered column, hidden by default, pointer-events none): eyebrow (11px uppercase, tracking .28em, accent) → price H2 (36px, md 48px, bold, tight) → description (13px, relaxed, max-width 24rem, muted) → specs joined by ` / ` (10px uppercase, tracking .2em, muted) → **Buy Now** pill (px 2rem, py .75rem, 13px semibold, theme buttonBg/buttonText, CSS hover scale 1.05 over .3s; clickable only while its panel is active).

Layout: `flex-col` on mobile, `md:flex-row` on desktop. Header + panels fill exactly 100% height.

## LAYER 8 — ANIMATION STANDARDS (GSAP — exact values)

**Entrance timeline** (once on load, defaults `power3.out`):
panels `yPercent: 6, autoAlpha: 0, duration .9, stagger .12` → image wrappers `y: 70, autoAlpha: 0, duration 1.1, stagger .12` at `-=0.5` → idle-label wrappers `y: 20, autoAlpha: 0, duration .8, stagger .1` at `-=0.7` → header `y: -16, autoAlpha: 0, duration .7` at `-=0.8`.

**Hover state machine** — React state `active: index | null`; re-runs a `useGSAP` block with `dependencies: [active]`, all tweens `overwrite: 'auto'`. For each panel (`isActive`, `idle` = nothing hovered):
- flexGrow → active `2.6`, idle `1`, compressed `0.7` — `1.05s power4.out`.
- product image → active `scale 1.06, y -14`; idle `scale 1, y 0`; compressed `scale 0.92` — `1.05s power4.out`.
- watermark → active `autoAlpha 1, scale 1` (`.9s power2.out`); otherwise `autoAlpha 0, scale 1.04` (`.35s`).
- glow → active `opacity 1, scale 1.25`; idle `.6`; compressed `.25` — `.9s power2.out`.
- idle label → active `autoAlpha 0, y -12` (`.3s`); idle `1`; compressed `.4` (`.55s`).
- detail items (5 children) → on activate `fromTo` `{y: 26, autoAlpha: 0}` → `{y: 0, autoAlpha: 1}`, `duration .75, stagger .055, delay .18, power3.out`; on deactivate `to {autoAlpha: 0, y: 14}, .25s power2.in`.

**Input wiring**: `onMouseEnter` on each panel sets `active = i`; `onClick` does the same (touch); `onMouseLeave` on the panels container resets to `null`.

**Reduced motion**: read `prefers-reduced-motion: reduce` once; multiply every GSAP duration by 0 when set, plus a global CSS guard forcing `animation-duration`/`transition-duration` to `0.01ms`. No exceptions.

## LAYER 9 — RESPONSIVE

Single breakpoint `md` (48rem): panels row→column, image max-height 56vh→46vh, nav center links hidden, price H2 48px→36px, header top offset 1.75rem→1.25rem. The hover/tap expand behavior is identical in both orientations (flexGrow works on the column too).

## LAYER 10 — ICON SET

None. The page is deliberately icon-free — the nav is text-only and the panels carry hierarchy through type, color and motion. Do not add cart, arrow or social icons anywhere.

## LAYER 11 — REPRODUCE-EXACTLY CLAUSE

- Keep every hex value, rgba value, duration, ease, stagger, delay, flexGrow ratio, and copy string exactly as written above — they are the design.
- One page, no scroll, no extra sections, no footer.
- Do not swap the font family, do not add icon libraries, do not add UI kits or component libraries.
- All product copy, prices and themes live only in `src/data/products.js`.
- Do not remove the `prefers-reduced-motion` guard.
- The brand is Mapple everywhere — page title, logo, watermark, product names.

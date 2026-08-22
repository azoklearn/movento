# Juice Header

A full-screen dark-themed juice/hydration e-commerce hero header for the brand "Strip" featuring a full-bleed mix-blend-screen background video and a floating ingredients card stack that animates in from the right.

## Tech stack
- React (with "use client")
- framer-motion (motion, AnimatePresence) for navbar transitions, drawer/modal enter-exit, toast notifications, and staggered ingredient cards
- lucide-react for icons (Leaf, Zap, ShieldCheck, Sparkles, Droplet, ArrowRight, Menu, X, ShoppingBag, Plus, Minus, PhoneCall, Heart, Citrus, Brain, Cherry)

## Fonts & global styles

Load Google Fonts inside the JSX return:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- Body / default font: Inter, sans-serif
- Display headings (H1 hero, H2 ingredients heading): Oswald, sans-serif
- Monospace elements (labels, prices, Veo footer): font-mono (system monospace)
- Root wrapper: `bg-black text-white`, `selection:bg-[#ffd5a5] selection:text-black`, `overflow-x-hidden`, min-h-screen.

## Section container
- Outermost element: `relative min-h-screen bg-black text-white overflow-x-hidden`.
- Content max width: `max-w-[1680px] mx-auto`, horizontal padding `px-8 lg:px-12`.
- An absolutely positioned radial-gradient layer sits behind everything at `-z-10`, using the active flavor color at low opacity: `radial-gradient(circle 500px at 50% 50%, #ffd5a515, transparent)` with `transition-all duration-1000 ease-in-out`.

## Structure, section by section

### 1. Notification toast (AnimatePresence, fixed)

Fixed at `top-24 left-1/2 -translate-x-1/2 z-50`. Pill `bg-[#121214] border border-white/10 px-6 py-3 rounded-2xl shadow-2xl` with a small `w-2 h-2 rounded-full animate-ping` dot colored by the active flavor (#ffd5a5) and a `text-sm font-medium` message. Auto-dismisses after 3000ms.

### 2. Fixed header navbar
- `fixed top-0 left-0 w-full z-40 transition-all duration-300`.
- When page scrollY > 20: `bg-black/85 backdrop-blur-md py-4 border-b border-white/5`; otherwise `bg-transparent py-6`.
- Left: logo pill — `flex items-center gap-2 px-4 py-2 bg-[#1a1a1e]/80 backdrop-blur-md border border-white/10 rounded-xl` hover `bg-[#222226]`. Inside: an 18x18 lightning-bolt SVG (path `M19 10h-6V3L5 14h6v7z`) plus the word "Strip" in `font-bold tracking-tight`, fontSize 16px / lineHeight 20px. Animates in with initial opacity 0, x -20.
- Right action row (`flex items-center gap-2.5`): (a) hamburger toggle button — `p-2.5 rounded-xl bg-[#1a1a1e]/80 border border-white/10` hover `bg-[#222226]` with an 18x18 Menu icon; (b) "Contact Us" solid white pill — `px-5 py-2.5 rounded-xl bg-white text-black font-semibold shadow-md`, fontSize 16px, hover scale 1.02 / tap scale 0.98, hover `bg-white/95`.

### 3. Mobile drawer menu (AnimatePresence)
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm z-40`, fade in/out.
- Panel: `fixed top-0 right-0 w-80 h-full bg-[#0d0d0f] border-l border-white/5 z-50 p-6 flex flex-col justify-between shadow-2xl`, slides in from x:"100%" to 0 with spring (damping 25, stiffness 200).
- Header row: small white rounded-lg logo square with black bolt icon + "strip" `text-xl font-bold`, and a close X button (`p-1.5 rounded-full bg-white/5 border border-white/10`).
- Nav list: ["Products", "Ingredients", "About Us", "Stories"] as `text-lg font-medium py-2` buttons; active tab uses the flavor text color `text-[#ffd5a5]`, others `text-gray-400 hover:text-white`. Clicking triggers a "Navigated to X" toast.
- Footer of drawer: phone support block (10x10 rounded-full `bg-[#161619]` circle with PhoneCall icon, label "Call Support" in font-mono uppercase, number "+1 (800) 555-STRIP") and a full-width flavor-colored "Contact Us" button with ArrowRight.

### 4. Hero main section
- `relative min-h-screen pt-32 pb-16 lg:py-0 lg:h-screen flex items-center justify-center z-10 overflow-hidden`.
- Background video layer at `-z-10`: `<video>` `object-cover mix-blend-screen opacity-90 scale-100 lg:scale-[1.05]` with `transition-all duration-1000 ease-in-out`, source URL below. A CSS filter tied to the active flavor is applied (default `hue-rotate(0deg) saturate(1.1)`). Behind the video a `w-96 h-96 rounded-full blur-[140px] opacity-25 mix-blend-screen` ambient glow colored by the flavor.
- 12-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center`).
  - LEFT (`lg:col-span-5`, order-2 lg:order-1, z-20): giant uppercase display headline in Oswald, `font-normal tracking-tight`, sizes `text-[2.6rem] sm:text-[3.8rem] lg:text-[67px]` with `lg:leading-[80px] leading-[1.1]`, text: "POWERFUL / DRINKS. / BUILT FOR / EVERY / ADVENTURE." (each on its own line via `<br />`).
  - MIDDLE (`lg:col-span-3`, order-1 lg:order-2): empty spacer, height `h-[220px] sm:h-[300px] lg:h-full` to let the central video bottle shine.
  - RIGHT (`lg:col-span-4`, order-3, z-20, space-y-6): H2 in Oswald `text-3xl lg:text-[32px] font-semibold tracking-tight leading-[1.15]` reading "Clean Ingredients. / Real Results.", then a vertical stack of 3 ingredient cards.
- Ingredient card (each 300px wide): `flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-[18px]`, hover `border-white/20 bg-white/[0.05]`, `transition-all duration-300`. Left: `w-11 h-11 rounded-full border border-white/10` circle with an 18x18 lucide icon colored by the flavor. Right: title in `font-semibold` 18px + description in `text-gray-400` fontSize 16px / lineHeight 19px. Default peach ingredients: (Leaf) "Real Fruit Extracts" - "Made with real peaches for a naturally delicious taste."; (Droplet) "Essential Hydration" - "Electrolytes & minerals to support your daily hydration."; (ShieldCheck) "Better for You" - "No artificial colors, flavors, or preservatives."
- Bottom-right corner: `absolute bottom-6 right-8 z-30 text-[11px] font-mono tracking-widest text-white/35 font-medium uppercase` label reading "Veo".

### 5. Side cart slide-over (AnimatePresence)
- Backdrop `fixed inset-0 bg-black/70 backdrop-blur-sm z-50`; panel `fixed top-0 right-0 w-full sm:w-[28rem] h-full bg-[#0d0d0f] border-l border-white/10 z-50 p-6 flex flex-col justify-between shadow-2xl`, slides in from x:"100%" with spring (damping 25, stiffness 200).
- Header: ShoppingBag icon (flavor color) + "Your Cart (N items)" and a close X.
- Empty state: gray ShoppingBag circle, "Your cart is empty", helper text, and a flavor-colored "Quick Add Peach Perfect" pill.
- Item state: product card (`bg-white/[0.02] border border-white/5 rounded-2xl p-4`) with a peach emoji thumbnail, product name, price "$2.99" in flavor color, a quantity stepper (minus/plus in `bg-white/5 rounded-lg border`), and a red "Remove" link. Plus a free-shipping promo card (`bg-[#ffd5a5]/5 border border-[#ffd5a5]/10 rounded-2xl`) with a Sparkles icon.
- Footer (only when items > 0): Subtotal / Shipping (FREE, green) / Total (flavor color, font-mono) and a "Proceed to Checkout" button `rounded-xl text-black font-bold` styled with `backgroundColor: flavor` and boxShadow `0 8px 24px -6px #ffd5a540`.

### 6. Contact Us modal (AnimatePresence)
- Backdrop `fixed inset-0 bg-black/80 backdrop-blur-md z-50`; modal `max-w-md w-full bg-[#0d0d0f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl`, centered, scale 0.9->1 enter.
- Header "Get In Touch" + close X. Form with three fields (Full Name, Email Address, Your Message textarea rows=3), each label in `text-xs font-mono uppercase tracking-wider text-gray-500`, inputs `bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm` focus border `#ffd5a5`. Submit button is flavor-colored `text-black font-bold` with ArrowRight; on submit prevents default, closes modal, and fires a success toast.

## Assets
- Background video: `https://cdn.jiro.build/videos/header/Juice%20Video%20Header.mp4` (loop, muted, playsInline, autoplay via ref).

## Animations
- Navbar background/padding: CSS `transition-all duration-300`, toggled by scrollY > 20.
- Logo entrance: framer-motion initial opacity 0 / x -20 -> opacity 1 / x 0.
- Toast: enter `{ opacity: 0, y: -50, scale: 0.9 }` -> `{ opacity: 1, y: 0, scale: 1 }`, exit `{ opacity: 0, y: -20, scale: 0.95 }`.
- Drawers/cart: `initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}` with `transition={{ type: "spring", damping: 25, stiffness: 200 }}`.
- Modal: scale/opacity 0.9->1.
- Ingredient cards: staggered entrance `initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }}`.
- Video + background glow + radial gradient: color/filter cross-fade via `transition-all duration-1000 ease-in-out`.
- Ping dot on toast: Tailwind `animate-ping`.

## Responsive behavior
- Base (mobile): single-column grid; hero column order is video-spacer (order-1), headline (order-2), ingredients (order-3). Headline `text-[2.6rem]`, hero padding `pt-32 pb-16`.
- sm (≥640px): headline `text-[3.8rem]`; cart panel becomes `sm:w-[28rem]`; middle spacer grows to `h-[300px]`.
- md (≥768px): empty desktop-nav placeholder slot appears.
- lg (≥1024px): 12-column layout activates (5 / 3 / 4 split); hero becomes `lg:h-screen` with `lg:py-0`; headline `text-[67px]` / `leading-[80px]`; video scales `lg:scale-[1.05]`; ingredients column right-aligns (`lg:items-end lg:text-right`); padding `lg:px-12`.

## Key design principles
- Dark, cinematic hydration aesthetic: pure black canvas, mix-blend-screen video, soft flavor-tinted glows.
- One accent color (default peach #ffd5a5) drives icons, prices, buttons, and glows for cohesion.
- Oversized Oswald display type balanced against small Inter/mono supporting text.
- Glassmorphism cards (`bg-white/[0.03] backdrop-blur-md border border-white/10`).
- Everything is interactive but non-intrusive (toasts auto-dismiss, drawers slide from the right).

## Common mistakes to avoid
- Do NOT use backtick template literals in the code; build inline styles with string concatenation.
- Keep the video `mix-blend-screen` on a black background so it composites correctly; do not add a solid background behind it.
- Ensure the hero section is `position relative` and content columns carry `z-20` above the `-z-10` video layer.
- Give every AnimatePresence child and every `.map()` item a unique key.
- Cast any inline style with CSS variables to React.CSSProperties (none required here, but keep the rule).

## Page title
Strip — Powerful Drinks. Built For Every Adventure.

## Integration (build-safety — do not skip)
- Add this section as a **new** component file with a unique name. Don't edit or overwrite any existing file except to add its import and render it.
- Render it **after** all existing sections; keep every previously built section exactly as-is — never replace or remove them.
- If no project exists, create a minimal React + Tailwind app; if one exists, use it as-is — don't re-scaffold or change the Tailwind/build config or version.
- Keep it self-contained: scope its fonts and any resets to this section; never set global `body`/`html`/`*` styles or a global font.
- Install only the libraries this section names.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

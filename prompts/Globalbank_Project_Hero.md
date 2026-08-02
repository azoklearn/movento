# GlobalBank — Project Management Hero

Create a fully responsive, modern hero section for a project management tool using HTML, Tailwind CSS via CDN, and vanilla JavaScript. All code must be in a single `index.html` file. Use the 'Inter' font from Google Fonts.

Follow these strict requirements exactly:

**1. Background Video Structure**
- Set the `<body>` background color to `transparent` (`bg-transparent` or via CSS).
- Use a fixed background video container behind everything: `<div class="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-[#eef1f0]">`.
- Inside, place the `<video>` with classes `w-full h-full object-cover` and attributes `autoplay loop muted playsinline`.
- Video URL: `https://cdn.sceneai.art/Hero%20Section%20Video/aa476a86-3c53-4229-b946-84f699108e53.mp4`
- Do NOT add any extra white shapes, masks, fading gradients, or frames on top of or below the video. It must cleanly fill the background.

**2. Navigation Bar**
- Layout: Max-width 7xl, mx-auto, px-6 py-6. Fade it in on load.
- Top Left Logo: Use the exact Logo 1 SVG code provided below. Assign it classes `h-6 w-auto`. The main shape fill must be `#22c55e`.
- Desktop Links: "Home" (text-gray-900), "About Us", "Features", "Pricing" (text-gray-700 hover:text-gray-900). Text size exactly `14px` (`text-[14px]`), `font-normal`.
- Right Actions: "Pages" button with a small chevron (`text-gray-500`), and a "Get Started" link. Text size exactly `14px`, `font-normal`. "Get Started" padding should be `px-5 py-2 border border-gray-400 rounded-full text-gray-900 hover:bg-gray-100`.
- Mobile Menu Button: A hamburger icon and a hidden close 'X' icon for toggling the mobile menu.

**3. Mobile Menu Overlay**
- Create a fixed full-screen overlay (`z-40`, `bg-[#eef1f0]/95 backdrop-blur-md`), hidden by default (`hidden flex-col`).
- Links inside: Home, About Us, Features, Pricing, Pages (`text-2xl font-medium`). Get Started button (`mt-4 px-8 py-3 border border-gray-400 rounded-full text-lg font-medium hover:bg-gray-200`).
- Use JavaScript to toggle this menu, swap the hamburger/close icons, disable body scroll (`overflow: hidden`), and animate the links sliding up step-by-step (`transform translateY(15px)` to `0`, `opacity 0` to `1` with staggered delays).

**4. Main Hero Text (Center)**
- Container: `pt-16 md:pt-28 pb-12 text-center max-w-4xl mx-auto w-full z-20`.
- Headline: "Think Ahead. Move Fast. Exceed Expectations." Font size exactly `46px` (`text-[46px]`), `font-bold leading-[1.1] tracking-tight`. "Think", "Ahead.", "Move", "Fast." are text-[#1a2e24]. "Exceed Expectations." must be on a new line and colored green (`text-[#22c55e]`). Wrap each word in a `<span class="word-group">` for JS animation.
- Subheadline: Text size exactly `15px` (`text-[15px]`), `font-normal text-gray-700 max-w-[42rem] mx-auto leading-relaxed`. It MUST break into exactly two lines using a `<br>` tag:
  - Line 1: "All-in-one project management software built for modern teams. Track progress,"
  - Line 2: "collaborate seamlessly, and hit every deadline with confidence."
- Hero CTA Buttons: "Try for Free" (`bg-[#22c55e] hover:bg-[#16a34a] text-white`) and "See Pricing" (`border border-gray-400 text-gray-800 hover:bg-gray-100/50`). Both buttons must have classes: `px-6 py-2.5 rounded-full font-medium text-[14px]`.

**5. Bottom Logos**
- Container: Use `mt-auto pt-32 pb-8 flex items-end justify-center` to push the logos to the bottom of the screen. Inside, max-width 7xl, flex wrap, justify-between items-center.
- Place 5 logos here. Use the exact SVGs provided below (Logos 2 through 6).
- Classes for SVGs: `h-5 md:h-6 w-auto text-white opacity-90 hover:opacity-100 transition-opacity`.
- The 4th logo should have `hidden md:block`. The 5th logo should have `hidden lg:block`.

**6. JavaScript Loading Animations**
- Headline: Add a CSS keyframe `fadeUp` animation. Animate `.word-group` spans word-by-word starting at a 0.2s delay, staggering by 0.15s.
- Subheadline: Dynamically split the `<p>` text by `<br>` and spaces, wrap each word in a span with Tailwind classes (`opacity-0 translate-y-4 transition-all duration-500`), and animate them very quickly step-by-step using `setTimeout` starting after a 1.0s delay (staggered by 0.04s).

---
**ASSETS TO USE EXACTLY AS FORMATTED:**

Main Top Left Logo (Logo 1):
<svg fill="none" height="24" viewBox="0 0 193 48" class="h-6 w-auto">
    <path d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z" fill="#22c55e"/> 
    <g fill="#0a0a0a">
        <path clip-rule="evenodd" d="m98.3415 31.405c.812 1.131 2.3205 1.827 4.0025 1.827 4.321 0 6.902-2.987 6.902-7.54s-2.581-7.54-6.844-7.54c-1.827 0-3.2485.696-4.0605 1.769v-7.888h-4.031v20.967h4.031zm6.9315-5.713c0 2.436-1.45 4.06-3.567 4.06-2.1755 0-3.5964-1.624-3.5964-4.06 0-2.465 1.4209-4.089 3.5964-4.089 2.117 0 3.567 1.624 3.567 4.089z" fill-rule="evenodd"/>
        <path clip-rule="evenodd" d="m116.283 18.152c3.683 0 6.38 2.146 6.38 5.452v9.396h-4.002v-2.03c-.493 1.363-2.117 2.262-4.118 2.262-2.842 0-4.785-1.885-4.785-4.379 0-2.871 2.146-4.611 5.336-4.611h2.465c.725 0 1.102-.464 1.102-1.073 0-1.218-.957-2.059-2.61-2.059-1.769 0-2.668 1.102-2.726 2.32h-3.596c.174-2.929 2.552-5.278 6.554-5.278zm-.725 12.151c1.972 0 3.103-1.45 3.103-3.306v-.203h-2.958c-1.218 0-2.088.754-2.088 1.885 0 .957.812 1.624 1.943 1.624z" fill-rule="evenodd"/>
        <path d="m124.502 12.033v20.967h4.031v-20.967z"/>
        <path clip-rule="evenodd" d="m130.965 12.7h8.062c3.683 0 6.438 1.827 6.438 5.22 0 1.914-1.189 3.364-2.378 4.002 1.856.725 3.422 2.349 3.422 5.017 0 3.857-2.958 6.061-7.25 6.061h-8.294zm4.292 7.743h3.451c1.856 0 2.726-.783 2.726-2.146s-.87-2.146-2.813-2.146h-3.364zm0 8.787h3.625c2.407 0 3.48-.87 3.48-2.523s-1.073-2.581-3.48-2.581h-3.625z" fill-rule="evenodd"/>
        <path clip-rule="evenodd" d="m160.191 23.604c0-3.306-2.697-5.452-6.38-5.452-4.002 0-6.38 2.349-6.554 5.278h3.596c.058-1.218.957-2.32 2.726-2.32 1.653 0 2.61.841 2.61 2.059 0 .609-.377 1.073-1.102 1.073h-2.465c-3.19 0-5.336 1.74-5.336 4.611 0 2.494 1.943 4.379 4.785 4.379 2.001 0 3.625-.899 4.118-2.262v2.03h4.002zm-4.002 3.393c0 1.856-1.131 3.306-3.103 3.306-1.131 0-1.943-.667-1.943-1.624 0-1.131.87-1.885 2.088-1.885h2.958z" fill-rule="evenodd"/>
        <path d="m161.798 33v-14.37h4.06v1.784c.812-1.421 2.436-2.262 4.437-2.262 3.306 0 5.452 2.378 5.452 5.742v9.106h-4.06v-8.207c0-1.769-1.131-3.045-2.813-3.045-1.769 0-3.016 1.363-3.016 3.248v8.004z"/>
        <path d="m183.461 26.823 4.147 6.177h4.872l-6.293-8.874 5.58-5.496h-5.105l-4.825 4.742v-11.339h-4.06v20.967h4.06v-4.582z"/>
        <path clip-rule="evenodd" d="m92.3105 22.5652-4.6451-4.6452h-5.7898l-4.6451 4.6452v5.7897l4.6451 4.6451h5.7898l4.6451-4.6451zm-12.2026 2.8771 2.7638 2.7638c1.0585 1.0243 2.7059 1.0209 3.7256.0011l2.7649-2.7649-2.7649-2.7649c-1.0212-1.0212-2.7032-1.0212-3.7245 0z" fill-rule="evenodd"/>
        <path d="m71.2017 12.033v20.967h4.031v-20.967z"/>
        <path d="m50 22.85c0 6.931 4.785 10.382 9.976 10.382 2.61 0 4.756-1.334 5.423-3.335v3.103h3.857v-7.83c0-.7918-.2789-1.5313-.756-2.1067-.5889-.7102-1.4797-1.1703-2.521-1.1703h-5.51v3.277h3.915c.493 0 .812.319.812.812 0 1.885-2.494 3.712-5.017 3.712-3.364 0-6.032-2.639-6.032-6.844s2.668-6.641 6.119-6.641c2.61 0 4.408 1.421 4.727 3.596h4.321c-.261-4.35-3.915-7.337-9.019-7.337-5.365 0-10.295 3.451-10.295 10.382z"/>
    </g>
</svg>

The five bottom logos (Logos 2 through 6) are the standard grayscale client wordmarks supplied with this asset; reuse the same five SVGs in order, applying `hidden md:block` to the fourth and `hidden lg:block` to the fifth.

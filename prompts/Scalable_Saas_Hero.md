# Scalable — Analytics SaaS Hero

Build a dark, premium SaaS landing page hero called Scalable that looks identical to a modern analytics product launch page. Follow every step exactly. Do not improvise styles or skip tokens.

STEP 1 — Tech Stack & Setup

Use React with TypeScript and Vite, with TanStack Router using file-based routing where the home route file is the index route. Use Tailwind CSS v4 with all design tokens defined in the global stylesheet using the oklch color format. Every color in the UI must come from a semantic CSS variable. Do not use hard-coded hex or rgb values inside components.

STEP 2 — Design Tokens

Add the following semantic tokens to the root of the global stylesheet. Background is a near-black dark tone. Foreground is a near-white tone. Brand is a vivid purple-indigo used for the main CTA. Brand foreground is near-white. Pill is a dark grey used for the small badge background. Success is a vibrant green used for the status dot and the delta badges on stat cards. All tokens must be expressed in oklch.

STEP 3 — Page Shell

The root container fills the viewport with the dark background and light foreground, hides horizontal overflow, and centers all content horizontally. Use a wide max width for the navigation bar, a medium max width for the hero text column, and a slightly wider max width for the logos row and the dashboard mockup.

STEP 4 — Sticky Navbar

The header is sticky to the top of the viewport, sits above all other content, is horizontally centered with the wide max width, uses generous horizontal and vertical padding, has a soft translucent dark background, and applies a medium backdrop blur so content scrolls smoothly underneath. On the left, place a small rounded square logo filled with the brand color containing a tiny white square rotated 45 degrees, followed by the wordmark Scalable in a large semibold tracked-tight font. In the center, on desktop only, show a horizontal nav with About, Blog, Changelog (with a small pill that says "✦ New" filled with the brand color), Pricing, and Pages with a small dropdown caret. On the right, show a pill-shaped CTA button filled with the brand color and white text that says Book Your Demo.

STEP 5 — Hero Section with Video Gradient Background

Wrap the hero in a relatively positioned section.

STEP 5a — Gradient Video Background

Use a looping abstract gradient video with soft purple, blue, and teal blobs.

VIDEO BACKGROUND LINK: https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4

Save the video into the local assets folder and import it into the route file. Render it inside an absolutely positioned wrapper that is non-interactive, sits behind all content on the z-axis, is horizontally centered, and is shifted upward so the gradient bleeds up into the navbar area. The video itself autoplays, loops, is muted, and plays inline. It is intentionally oversized (taller and wider than the viewport), uses object-cover, has slightly reduced opacity, uses mix-blend-screen with the dark background, and has a heavy blur filter applied so it reads as an ambient atmospheric glow rather than a sharp video.

STEP 5b — Hero Content

The hero content sits above the video on the z-axis, is centered as a single vertical column, has horizontal padding, generous top padding, and is fully center-aligned. At the top, place a small pill badge with rounded-full shape, the dark pill background token, a glowing green status dot (using the success token with a soft outer shadow glow in the same color), and the text "New Feature: Zapier Integration". Below the pill, place the headline with a tight line height and tight letter spacing, scaling responsively from large on mobile to very large on desktop, in a medium font weight. The headline reads on two lines: first line "Manage your sales and", and second line "analytics in one place." where only the words "one place." use a serif italic font in normal weight, while the rest of the headline stays in the default sans. Below the headline, add a constrained-width sub-copy in a muted foreground color: "Track custom events, increase form submissions, optimise conversion rates and optimise your sales flow with Scalable." Below the sub-copy, place a pill-shaped CTA button filled with the brand color, white text, comfortable padding, and a soft glowing drop shadow tinted with the brand color, with the label Book Your Demo.

STEP 6 — Logos Row

Below the hero, centered with the medium-wide max width and generous top padding, show a small muted caption that reads "Used by global powerhouses like". Below the caption, render a horizontally centered, wrapping row of brand wordmarks with comfortable column and row gaps, all in a softly muted foreground color and a uniform large size. The wordmarks are: SAVANNAH in bold with extra wide letter tracking, M MILANO in bold, ◆ luminous in medium weight, theo in serif italic, and ◐ Amsterdam in medium weight.

STEP 7 — Dashboard Mockup

Below the logos, centered with the wider max width and bottom padding, render a glassmorphic dashboard card. The outer card uses a large rounded corner radius, a thin translucent white border, a very subtle translucent white background, a strong drop shadow, and a heavy backdrop blur.

STEP 7a — Top Stat Cards

Inside the dashboard, the top row is a three-column responsive grid of stat cards. Each stat card has medium rounded corners, a thin translucent white border, an even more subtle translucent white background, a small backdrop blur, and inner padding. The header row of each card shows a small muted label on the left and a small green delta badge on the right (rounded-full pill, a tinted success background at low opacity, and the success color for the text). Below the header, show a large semibold tight-tracked numeric value. Use these three cards in order: Total Profit with value $9,432.25 and delta +84%, Total Revenue with value $404,585 and delta +47%, and Products Sold with value 1,457 and delta +24%.

STEP 7b — Three-Column Row

Below the stat cards, render a responsive grid with a fixed narrow left column, a flexible middle column, and a fixed narrow right column, with comfortable gaps. The left card shows the label Total Balance with a large value $675,931 and below it a full-width pill-shaped Withdraw button filled with the brand color and white text, then a thin divider, then a row with Total Income $21,478 with 92% on the right, then another divider, then Total Expense $9,627 in a muted foreground color. The middle card shows a header row with the title Revenue Overview on the left and four small tabs on the right (Daily, Weekly, Monthly active, Yearly) where only the active tab uses the full foreground color and the others are muted. Below the header, render a smooth SVG line chart on a 600 by 200 viewBox with four faint horizontal grid lines, a single smooth cubic Bezier path stroked with a linear gradient that transitions from a bright teal-cyan to a deeper blue, and a single white dot near the middle of the line surrounded by a soft translucent halo. The right card shows four progress rows for Employee, Independent Contractor, Contracted Employee, and Stakeholders, each with a small label on top and a thin track underneath in low-opacity white with a fill bar in slightly brighter translucent white at varied widths between roughly 40% and 90%.

STEP 8 — Final Polishing Rules

Every element inside the hero is center-aligned. All borders use translucent white at low opacity. All glass surfaces use translucent white at very low opacity. All buttons are pill-shaped. All cards use medium or large rounded corners. Typography is default sans for the entire UI, with serif italic used only for the words "one place." in the headline. The atmospheric smoothness comes from the medium backdrop blur on the navbar, the heavy backdrop blur on the dashboard, the heavy blur filter on the gradient video, and the mix-blend-screen blending mode that lets the gradient glow through the dark background. Do not add any external animation libraries; motion comes entirely from the looping gradient video.

STEP 9 — SEO

Set the route page title to "Scalable — Manage your sales and analytics in one place" and the meta description to "Track custom events, increase form submissions, optimise conversion rates and optimise your sales flow with Scalable."

# Brightly — Cinematic Dark Landing

Develop a premium, cinematic dark-mode landing page for "Brightly" using React and Tailwind CSS. The final output must be a single-file App.jsx.

1. Brand Identity & Assets

Logo Interaction (CRITICAL): A circular sunburst/asterisk icon. SVG: viewBox="0 0 24 24", strokeWidth="2.5". Background: bg-gradient-to-br from-[#FF4D4D] via-[#F97316] to-[#EC4899].

Behavior: On Mobile and Tablet, clicking the Logo MUST toggle the navigation menu items.

Assets:

Background Video: https://cdn.sceneai.art/Hero Section Video/060c6237-0a73-45f0-aea2-80291c52641d.mp4

Dashboard Image: https://cdn.sceneai.art/Hero section image/0af7fd86-98c4-46c6-ad8b-dd299a32456a.png

2. Layout & Spacing Rules

Navbar (Fixed): Height approx 80px.

Items: 'Product', 'Customer', 'Pricing', 'Resources', 'Company'.

Mobile Behavior: Hidden by default; revealed via fullscreen overlay when Logo or Hamburger is clicked.

Precise Hero Spacing:

Navbar Bottom to Header Top: Exactly 100px.

Header Bottom to Secondary Text Top: Exactly 24px.

Secondary Text Bottom to CTA Button Top: Exactly 24px.

Full-Width Hero Video: The video must cover the entire hero section without gaps on the left or right side.

Video Masking: Fade video smoothly to solid black (#050505) at exactly the vertical midpoint (approx 85% depth) of the dashboard preview image.

3. Typography & Copy

Main Header: "Organize your day, master your productivity flow" (text-5xl or 6xl on desktop, bold, centered).

Secondary Text: "Manage projects effortlessly with smart tools, stay on track, meet deadlines, and keep your team productive." (text-gray-400, centered).

4. Animation & Interactivity

Word-by-Word Reveal: Main and Secondary text must reveal word-by-word over a 4-second duration using staggered opacity/blur.

Staged Loading:

Text starts revealing at 0s.

Button fades in at 3.5s.

Dashboard fades in at 4s.

CTA Button Hover: * Default: White bg, black text.

Hover/Hold: Background transitions to bg-gradient-to-r from-[#F97316] to-[#EF4444], text turns White, scale increases to 1.05x.

5. Technical Requirements

Single-file React component.

Use Tailwind CSS for all styling.

Use object-cover for the video to ensure it spans the whole hero without distortion.

Include a grainy texture overlay (0.03 opacity) across the whole page.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

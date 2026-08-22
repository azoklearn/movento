# Airlines — Travel Booking Hero

Create a highly polished, responsive landing page using a single HTML file and Tailwind CSS via CDN. Use the 'Inter' font from Google Fonts.

Step 1: Base Layout & Background
- Create a 100vh hero section.
- Add a background video covering the entire screen (object-fit: cover). The video must play automatically, loop indefinitely, be muted, and have the playsinline attribute.
- Use this exact video URL: https://cdn.sceneai.art/Hero Section Video/01d1f8de-fec0-4bf5-8b48-9fc2dbc8c6b0.mp4
- Add a dark gradient overlay on top of the video (from 10% opacity black at the top to 40% opacity black at the bottom) so text is readable.
- Hide the browser scrollbars globally for a cinematic look.

Step 2: Navigation Bar
- Place a navigation bar at the top with a smooth fade-in-up animation on page load.
- Logo: Just text saying "Airlines" (white, semibold, text-xl). Do not use an icon.
- Menu Items: About, Services, Locations, Places, Support. Font size must be exactly 14px with regular weight (font-normal), text color white with 90% opacity.
- Right-side Action: A transparent button saying "Start Travel" with a white border, 14px regular text. Include a hover effect changing the background to white and text to black.
- Include a mobile hamburger menu icon (hidden on desktop).

Step 3: Hero Content (Center)
- Vertically and horizontally center the main content with a max-width container. All text should be center-aligned.
- Apply a staggered fade-in-up animation to all elements here, delayed slightly after the navbar.
- Main Headline: "Travel the World<br>Without Any Stress". Font size must be exactly 38px on mobile and 56px on desktop, font-weight medium, line-height tight (1.1), white text.
- Secondary Text: "Let us take care of the planning while you enjoy meaningful travel experiences crafted just for you." Font size must be exactly 15px on mobile (18px on desktop), white text with 80% opacity.
- CTA Button: "Start Exploring". Solid white background, black text, 15px font size, font-weight medium. The left and right padding must be exactly 26px (px-[26px]), top and bottom 12px. Include a subtle shadow and a hover effect that scales the button up slightly (scale-105) and increases the shadow.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

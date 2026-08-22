# Zyphor — Productivity SaaS Hero

1. General Setup & Assets
Tech Stack: React (single file), Tailwind CSS. Use lucide-react for standard icons if needed (like the mobile Menu).
Main Background: Deep dark color, exactly #0b0c10.
Video Background: Insert a <video> tag fixed to the background (z-index 0) using URL: https://cdn.sceneai.art/Hero Section Video/973fa3f6-7715-4e73-9cfd-100ee86285b5.mp4. It must have object-cover to cover the entire screen, with NO dark overlays blocking it.
Base Text: White font color, modern sans-serif font (like Inter).
2. Navigation Bar (Navbar)
Layout: Fixed top, highly responsive. Padding top/bottom around 20px on desktop. On scroll, add bg-[#0e0f14]/90 with backdrop-blur-md and border-b border-white/5.
Logo: Text "Oasis" (bold, 20px) alongside a circular white wavy SVG icon.
Navigation Links: "Product", "Customer", "Pricing", "Resources", "Company". Color: #A1A1AA, Font size: 14px, Font weight: 500. Hover state: white. Hidden on mobile.
Log in Button: Background #1c1d22, text white, rounded 8px, padding x-5 y-2, subtle border border border-white/10. Font size 14px. Hidden on mobile.
Mobile Menu: Hamburger menu icon for mobile (lucide-react), toggling a clean dark full-screen overlay containing the links and login button.
3. Hero Section & Typography
Container: Max-width 1400px, centered, left-aligned text content. Top padding ~180px to clear the navbar.
Heading (H1): "Master your day, [line break] boost productivity". Extremely large text (e.g., text-[4.5rem] on lg screens), very bold (font-weight 700 or 800), tight line-height (leading-[1.1]). Color: White.
Paragraph (P): "Manage projects effortlessly with smart tools, stay on track, meet deadlines, and keep your team productive." Color: #A1A1AA, max-width 650px, font size 20px, relaxed line-height. Margin bottom ~40px.
4. Call to Action (CTA) Buttons
Container: Flex row, gap 16px. Stack on mobile.
Primary Button ("Get started"): Background MUST be precisely #6744FF (Purple). Text MUST be white. Rounded 12px, padding x-8 y-3.5, font size 16px, font-medium. No border.
Secondary Button ("How it works"): Background #1c1d22 (Dark Gray), text white. Rounded 12px, padding x-8 y-3.5, font size 16px, font-medium. Border exactly border border-white/10.
5. Dashboard Mockup Image
Placement: Placed below the Hero text and buttons (margin top ~100px). Centered.
URL: Use exactly https://cdn.sceneai.art/Hero section image/f818ffa9-3074-43cc-8ca5-953c97da9edd.png.
Wrapper Styling: Wrap the <img> in a div that has background #0e0f14, border border border-white/10, and strictly rounded-t-[24px] (only top corners rounded). Ensure overflow-hidden so the image perfectly respects the top rounded corners. Make sure the container is w-full up to a reasonable max-width.
6. The 4-Second Staggered Animation Sequence
CSS Setup: Inject custom CSS keyframes (fadeInUp, fadeInDown, fadeInScale) into the document using a <style> tag, as Tailwind doesn't have these exact animations natively.
Navbar: Animate in immediately sliding down (fadeInDown).
Text: Build a custom AnimatedText component that takes a string, splits it into words, wraps each word in a span with an opacity-0 class, and uses an inline animationDelay based on its index. Apply this to the H1 and P tags so they appear word-by-word sequentially.
Buttons: Fade and slide up the entire button container (fadeInUp) at ~2.2 seconds, after the text animation finishes.
Dashboard Image: Fade and scale up slightly (fadeInScale) at ~2.8 seconds.
The complete sequence should naturally finish within a 4-second window on page load.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

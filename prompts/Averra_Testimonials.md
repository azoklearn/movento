# Averra — Testimonial Slider

Create a fully responsive React Testimonial Slider component using Tailwind CSS in a single file.

1. Design & Layout Specs
Container: min-h-screen, flex column centered (flex flex-col items-center justify-center), background color #EBEFE5. All content within the main container must be perfectly center-aligned.
Selection: Text selection should have a background of #a5e038 and text color of black.
Top Label: The text "• TESTIMONIALS", uppercase, wide letter spacing (tracking-[0.2em]), small text, dark gray, centered.
Main Typography: The main quote text must be normal weight (font-normal), have tight tracking, color #111111, and responsive sizing (28px on mobile, scaling up to 54px on desktop). Line height should be around 1.2 to 1.3. Text must be perfectly center-aligned.
2. Animation Requirements (CRITICAL)
Word-by-Word Reveal: The main quote must load smoothly word-by-word. Split the text and wrap each word in spans.
Keyframes: Each word should start at opacity: 0 and transform: translateY(100%), then animate to opacity: 1 and translateY(0). Use this exact timing function: cubic-bezier(0.22, 1, 0.36, 1).
Responsive Wrapping Fix: To ensure the animated text wraps perfectly on mobile devices, do not force the wrapper into an inline-block; instead, output a standard space (" ") between the word elements so native browser wrapping works natively.
Staggering: Stagger the delay of each word by 0.04s.
Fade Ins: The author block and navigation buttons should have a simple fade-in animation that delays until after the text starts revealing (e.g., 0.4s and 0.5s delays).
3. Component State & Data
Include state to cycle forward and backward through 3 testimonials. Re-trigger the animations every time the testimonial changes (by updating a key prop).
Use this exact data array with these exact image URLs (all male profiles):

John Doe (CEO, Tech Innovations)
Quote: "They brought clarity to complex problems, breaking down barriers and delivering innovative solutions."
Image: https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80
David Smith (Founder, Nexus Dynamics)
Quote: "Their team was an absolute game-changer for our workflow. We scaled faster and with much more confidence."
Image: https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80
Marcus Chen (VP of Engineering, GlobalCorp)
Quote: "A truly collaborative process from start to finish. The results completely exceeded our initial expectations."
Image: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80
4. Author Block & Navigation Buttons
Author UI: The entire author block must be horizontally centered on the page. Inside this centered block, layout the items horizontally (flex items-center gap-4): a circular 48x48px (or 56x56px) profile image on the left, with the Name (large, dark text) and Title (smaller, gray text) stacked vertically and left-aligned relative to the image.
Buttons UI: Place two buttons (Left/Right) in a flex row, completely centered below the author block with a small gap between them.
Button Style: Background #181A15, rounded corners (rounded-xl or rounded-2xl), dimensions around 56x56px.
Icons: Use simple SVG left/right arrows colored neon green (#A5E038) with a sleek stroke width (strokeWidth={1.5}).
Hover Effects: On hover, the button background should turn solid black, and the arrows should smoothly translate a few pixels in the direction they are pointing. Add a subtle shadow on hover.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

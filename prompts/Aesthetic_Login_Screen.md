# Aesthetic Onboarding — Login Screen

Create a modern, high-end login screen in React using Tailwind CSS and Lucide React icons. The layout should have a dark, immersive theme with a frosted glass card overlay.

### 1. Global Background
- Full screen, `min-h-screen`, black background.
- Include a fixed, full-screen background video (`https://cdn.midjourney.com/video/71048e88-d8e6-470e-88ef-555c01eacb12/0.mp4`) that is muted, looping, auto-playing, and scaled to 105%.
- Add a fixed overlay with 10% black opacity and `backdrop-blur-sm` to dim the background video.

### 2. Main Center Card
- Create a main container that sits above the background (`z-10`), flex row (column on mobile), max-width 1040px, min-height 650px.
- Background should be solid white, with a subtle gray border, heavy rounded corners (`rounded-[2.5rem]`), and a soft black drop shadow.

### 3. Left Side (Video Mask Area)
- Takes up 45% of the width.
- Background `#0c0c0e`, rounded corners (`rounded-[2rem]`), and `overflow-hidden`.
- Inside, place the exact same background video (`https://cdn.midjourney.com/video/71048e88-d8e6-470e-88ef-555c01eacb12/0.mp4`), fully visible (no dark overlays), absolute inset-0, covering the entire left container.

### 4. Right Side (Form Area)
- Takes up 55% of the width, padded generously.
- Include a decorative, absolutely positioned blurred circle in the top-left corner (`w-64 h-64 blur-[80px]`) using a sunset gradient (`#FF512F` to `#F09819`) at 20% opacity.
- **Header:** "Welcome back" (40px font size, semibold, tight tracking, dark text) and subtitle "Sign in to your account" (sm, gray-500). Center aligned.
- **Social Buttons:** Two full-width buttons ("Continue with Google" and "Continue with X"). Include SVGs for the logos. Style: Light gray background (`bg-gray-50`), gray border, `rounded-[1.25rem]`, padding 16px. Add a right-aligned ArrowRight icon that slightly darkens on hover.
- **Divider:** Flex row with "OR" text (10px, uppercase, wide tracking, gray-400) flanked by 1px horizontal lines that fade out to transparent at the edges.
- **Email Input Group:**
  - A container with `bg-gray-50`, gray border, `rounded-[1.25rem]`, padding 8px. Changes to white background and darker border on focus-within.
  - Left side: Stacked "Email" label (11px) and transparent text input ("Enter your email").
  - **Submit Button (CRITICAL):** On the right side, a circular button (52x52px). It must have a solid black fill. Around the button, create a bold, multi-colored border using a conic gradient (`#00c6ff, #0072ff, #ff007a, #ff8a00, #00c6ff`). 
  - **Button Interaction:** When hovering over the button, the conic-gradient border must continuously rotate (`animate-spin`), and an outer glowing blur of the exact same conic gradient should become fully visible and spin alongside it. The inner black button should have an inner shadow, and the white ArrowRight icon inside should translate slightly to the right (`translate-x-0.5`).
- **Footer:** "Don't have an account?" (gray-500) followed by a "Sign up" link where the text has a background clip with the sunset gradient (`from-[#FF512F] to-[#F09819]`). Center aligned at the bottom.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

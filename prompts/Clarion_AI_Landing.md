# ClarionAI — Dark AI Landing Page

Create a modern, responsive, single-file React landing page using Tailwind CSS. The design must use a sleek dark theme (pure black background bg-black, white text) with custom scroll-reveal animations (a FadeInUp wrapper component that slides elements up from translate-y-10 and opacity-0 to opacity-100 over 1000ms).
Set the global HTML scroll behavior to smooth.
Brand Name: "Plety". Please create a custom, modern, stroke-based SVG logo (e.g., a minimal geometric shape) to mimic the sleek style of "Untitled UI" logos.
Please build the application section-by-section with these exact, pixel-perfect specifications:

1. Navigation Bar (Sticky & Responsive)
State: Fixed to the top (z-50). Starts transparent, but transitions to bg-black/80 backdrop-blur-md when scrolled past 20px.
Layout: max-w-7xl mx-auto px-6.
Desktop: Logo on left. Links in center (About, Features, FAQ, Contact) using text-sm font-medium text-gray-300 hover:text-white. "Get started" button on right (bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/5).
Mobile: Hamburger icon. Tapping it opens a smooth dropdown menu. Tapping any link must seamlessly scroll to the section ID and auto-close the menu.
2. Hero Section (id="about")
Layout: min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0.
Background Video: Place a <video> (URL: https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4) absolutely positioned behind the content (-z-10, object-cover min-w-full min-h-full opacity-90). Overlay it with bg-gradient-to-b from-black/30 via-transparent to-black.
Top Badge: "✨ Announcing API 2.0" (px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm).
Headline: "The intelligence layer \n for clear decisions." The word "decisions." must be wrapped in a span with font-serif italic font-normal. The whole heading is text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center.
Sub-text: "Our platform integrates seamlessly into your stack to deliver real-time understanding, not just predictions." (Force font size to exactly text-[16px], text-gray-400 max-w-2xl text-center).
Buttons: Flex row. Primary: "Get started" (White bg, black text). Secondary: "Learn more" (Dark gray bg #1F1F22, white text, border white/5).
Marquee (Trusted by industry leaders): - Text: text-sm text-gray-500 font-medium mb-8 text-center mt-24.
CRITICAL FIX FOR MARQUEE: To make the infinite loop completely flawless without breaking, use a wrapper with overflow-hidden and a CSS mask-image linear gradient to fade the edges. Inside, create a flex container with w-max and an animation animate-[marquee_30s_linear_infinite]. Inside that container, render an array of 5 dummy brand logos (Springfield, Orbitc, Cloud, Amster, Nexus using stroke SVGs) duplicated 3 to 4 times so the screen is always full. Items must have flex-shrink-0 px-8.
3. Feature 1: AI Chat (id="features")
Layout: 2 columns (lg:grid-cols-2 gap-16 py-24 px-6 max-w-7xl mx-auto). Text on Left, Mockup on Right.
Left Text:
Badge: "✨ AI chat" (yellow text).
Headline: "Where speed meets intelligent conversation." (text-4xl md:text-5xl font-semibold).
Subtext: "A conversational AI assistant that understands your questions, provides intelligent answers, and helps you get things done fast from casual chats to complex tasks."
Button: "Get started".
Right Mockup: rounded-3xl overflow-hidden p-8 border border-white/10 relative.
Background Video: URL https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4 (absolute inset-0 object-cover w-full h-full with bg-black/20 overlay).
Card: Floating UI element bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4. Top chips (Create image, etc.), bottom input with "Ask anything..." and mic/soundwave icons.
4. Feature 2: AI Transcription
Layout: 2 columns (lg:grid-cols-2 gap-16 py-24 px-6 max-w-7xl mx-auto). Mockup on Left, Text on Right.
Left Mockup: rounded-3xl overflow-hidden p-8 border border-white/10 relative.
Background Video: URL https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4 (absolute inset-0 object-cover w-full h-full with bg-black/20 overlay).
Card: Floating UI element bg-[#1C1C1E]/90. Shows a play button, "11:06 AM – Chris", a visual waveform, and dummy transcription text below.
Right Text:
Badge: "✨ AI transcription" (green text).
Headline: "Turn speech into text with speed and precision."
Subtext: "Automatically convert speech into accurate, editable text in real time. Perfect for meetings, interviews, voice notes, and more, powered by advanced speech recognition technology."
Button: "Get started".
5. FAQ Section (id="faq")
Layout: py-32 px-6 max-w-3xl mx-auto.
Headline: "We've got answers" (Centered, text-4xl md:text-5xl font-semibold mb-12).
Container Styling (Match Reference EXACTLY):
The main wrapper must be completely transparent but have a visible border: border border-white/10 rounded-xl bg-transparent.
Accordion Items (5 total):
Use standard questions (e.g., "Is my data safe...").
Each item except the last must have a bottom border: border-b border-white/10.
Button area padding: py-6 px-6. Question text text-base text-white font-medium.
Icon: A standard Plus (+) that rotates perfectly into an (x) when opened.
Animation: Answer body must use CSS grid trick (grid-template-rows: 0fr to 1fr) to transition flawlessly. Text is text-gray-400 text-sm pb-6 px-6.
6. Footer Section (id="contact")
Layout: relative z-0 pt-32 pb-10 px-6 border-t border-white/5.
Background Video: URL https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4 (absolute inset-0 object-cover w-full h-full opacity-40 -z-10). Add strong overlay bg-gradient-to-b from-black via-black/60 to-black so links remain legible.
Top CTA: "Ready to automate everything?" (Center aligned, everything? is italic serif). Followed by the two main buttons (Get started & Learn more). Add a large margin bottom (mb-32) below this.
Link Grid: grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto mb-24.
Col 1: Plety Logo + Title (text-xl font-bold). Subtext: "Speed, scale, and smarts — deployed."
Col 2 (Product): About, Pricing, Changelog, Contact.
Col 3 (Legal): Terms of service, Privacy policy, 404.
Col 4 (Connect): Instagram, YouTube, LinkedIn, Twitter / X.
Link styling: text-sm text-gray-400 hover:text-white transition-colors.
Bottom Bar: flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-8.
Layout EXACTLY as: © 2026 Plety. All rights reserved [dot] by Re-text [dot] Made in Gemini. The names "Re-text" and "Gemini" should be slightly brighter (text-gray-300).

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

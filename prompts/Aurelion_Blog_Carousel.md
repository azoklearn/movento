# Aurelion — Feature Blogs Carousel

Create a React application using Tailwind CSS and lucide-react icons for a "Feature Blogs" section. The entire code must be in a single file. Follow these step-by-step instructions with absolute precision to match the exact design:
1. Overall Layout & Typography:

Background & Colors: The main container background must be a light grayish-white (#f3f4f4). All main text should be a dark gray/black (#1a1a1a).
Container: Wrap the content in a container with a max-width of 1400px, centered (mx-auto), with horizontal padding (px-4 to px-8) and large vertical padding (py-16 to py-24).
Header Section (Centered):
Label: Create a small label reading "ABOUT VISTAL". It must be uppercase, bold (font-bold), small (text-xs), and have wide letter spacing (tracking-wider). Next to the text (on the left), include a small solid black square (w-2 h-2 bg-black). Flex them to align center.
Main Title: Below the label, add the title "Our feature blogs". Use a large font size (text-4xl mobile, up to text-7xl desktop), medium weight (font-medium), and tight letter spacing (tracking-tight or tracking-tighter).
2. Entrance Loading Animations:

You must implement a staggered CSS animation that triggers when the component loads.
The animation should smoothly fade in (opacity: 0 to 1) and slide up (translateY(30px) to 0).
The small label fades up first.
CRITICAL: The main title "Our feature blogs" MUST animate word-by-word. Wrap each word in a span and apply a staggered animation delay to each word.
The carousel and buttons should fade up after the title.
3. Carousel Structure:

Below the header, create a horizontally scrollable container.
It must use Flexbox (flex, gap-6).
Hide the native scrollbar using custom CSS (::-webkit-scrollbar { display: none; }).
Enable CSS snap scrolling (snap-x snap-mandatory, overflow-x-auto) so it works beautifully on touch devices.
4. Card Design (Pixel-Perfect Details):

Card Wrapper: Each card must be flex-none, with a width of 85vw on mobile, and fixed to 400px or 450px on larger screens. Make them snap to the center/start (snap-center sm:snap-start).
Card Base: Background must be solid white (bg-white). The corners must be heavily rounded (rounded-[2rem]).
CRITICAL PADDING: The card MUST have inner padding (e.g., p-4 or p-5) so the image is NOT flush against the edges of the white card.
Image Container: Inside the padded card, place an image container with an aspect ratio of 4/3 (aspect-[4/3]). Give this container rounded corners as well (rounded-2xl) and overflow-hidden. Apply a subtle mb-6 margin below it.
Card Text:
Date: Small text (text-sm), medium weight, gray color (text-gray-500), with mb-3.
Title: Large text (text-2xl), medium weight (font-medium), tight line height (leading-tight). Restrict it to 3 lines max (line-clamp-3).
Link: A "LEARN MORE" text at the bottom. It must be text-sm, font-bold, uppercase, and tracking-wide. Give it a thin black underline that grows thicker on hover.
5. Hover Effects (Strict Constraints):

Card Hover: When the user's mouse enters the card, the card's background color MUST smoothly transition from white to yellow (#f3de58).
WHAT NOT TO DO: Do NOT add any box-shadow, drop-shadow, or upward lift/translate effect to the card. The card must remain completely flat on the page. Only the background color changes.
Image Hover: When hovering the card, the image inside should scale up very slightly (scale-105) over 700ms.
6. Navigation Buttons:

Below the carousel, center two circular buttons (Left and Right arrows). Use lucide-react for the icons (<ArrowLeft />, <ArrowRight />).
Button Styling: Width/Height of 56px (w-14 h-14), perfectly round (rounded-full). Background color must be very dark gray (bg-[#1c1c1c]). The icon color inside must be yellow (text-[#f3de58]).
Button Hover: On hover, the button background should turn pure black.
Functionality: Clicking these buttons must programmatically scroll the carousel container left or right by the width of exactly one card plus the gap.
7. Data & Images:
Use the following exact mock data array and image URLs:

Title: "The Green Space Revolution: Is the 'Living Building' the Future of..."
Date: October 4, 2024
Image: https://cdn.sceneai.art/Image%20for%20any%20section/20009828-ab1c-4b6a-a1d8-59ba1fcc0415.webp
Title: "Form Meets Function: Why Good Design Starts with Purpose"
Date: October 4, 2024
Image: https://cdn.sceneai.art/Image%20for%20any%20section/687a21b2-e30f-4df3-93e0-20f43dab94c7.webp
Title: "5 Ways Functional Architecture Can Add Value to Your Home"
Date: October 4, 2024
Image: https://cdn.sceneai.art/Image%20for%20any%20section/7fce3708-e690-4b42-bc46-6117a04d0501.png
Title: "Sustainable Materials: Building for the Next Generation"
Date: October 5, 2024
Image: https://cdn.sceneai.art/Image%20for%20any%20section/b0688a16-2d8b-4bfb-8f7f-201788eae921.webp
Title: "Maximizing Natural Light in Modern Interior Spaces"
Date: October 6, 2024
Image: https://cdn.sceneai.art/Image%20for%20any%20section/bb56b4f0-50c0-42bf-8aea-d21fa5e55460.webp

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

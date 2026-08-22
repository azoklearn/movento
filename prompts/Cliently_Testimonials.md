# Cliently — Agency Testimonials Carousel

build a pixel-perfect, responsive "Testimonials" section using React and Tailwind CSS. The design should match a modern, high-end agency aesthetic.

Tech Stack
React (Functional components, hooks like useState, useEffect, useRef)
Tailwind CSS (for all styling, layout, and responsive breakpoints)
Lucide React (for ArrowLeft and ArrowRight icons)
Layout & UI Requirements
Container & Background: The section should have a white background, full width, min-height of the screen, and centered content. Use a max-width container (e.g., max-w-[1400px]) for the main content.
Header Section:
Tagline: A small uppercase tracking-widest text saying "▪ TESTIMONIALS" in very dark gray (#18181b).
Main Heading: "What they say about us?" in large, semi-bold text (text-[56px] on desktop).
Subtext: "Here's what they shared about their experience working with our team." in a lighter gray (#71717a).
Navigation Buttons:
Round buttons (w-[46px] h-[46px]) with a light gray background (#f4f4f5) containing Lucide ArrowLeft and ArrowRight icons.
On hover, they should darken slightly (hover:bg-[#e4e4e7]).
Place them on the top-right aligned with the header for desktop, and centered below the carousel for mobile devices.
Carousel & Card Requirements
Responsive Behavior: - Display 3 cards side-by-side on desktop (lg).
Display 2 cards on tablet (md).
Display 1 card on mobile.
The carousel must slide smoothly left and right when the navigation buttons are clicked.
Card Styling:
Rectangular cards with a fixed height of h-[440px] and heavily rounded corners (rounded-[32px]).
Image Background: Use an <img> tag covering the whole card (object-cover).
Hover Effect: When a card is hovered, the background image should slowly zoom in (duration-[1500ms] group-hover:scale-110).
Gradient Overlays: Add double black-to-transparent gradients originating from the bottom so the white text on top is perfectly readable.
Card Content (Overlaid on Image):
Note: Since the card height is now 440px, ensure inner padding is balanced (e.g., p-8) and text sizes are scaled to fit perfectly without overflowing.
Top left: "Logo" text (vary the typography slightly per card to simulate different brand logos, scaled to e.g., text-[20px]).
Bottom area: A serif closing quote mark (”) acting as a decorative element (size adjusted for the card).
Below the quote mark: The main quote text (scaled to fit the 440px height, e.g., text-[17px] leading-relaxed), followed by the author name (text-[14px] text-right opacity-80 mt-4).
Animation Requirements (Crucial)
Implement a custom load sequence using CSS keyframes or inline styled delays:

Word-by-Word Reveal: The header text (Tagline, Main Heading, and Subtext) must animate in word-by-word. Each word should start hidden (opacity: 0) and translated down, then smoothly slide up into place over a 4-second sequence.
Staggered Sections: - The header text sequence starts first.
The desktop navigation buttons slide in from the right slightly after.
The entire carousel container fades and slides up smoothly at the end of the text animation.
Data to Use (Including Image URLs)
Please populate the carousel strictly with this exact data:
Card 1:

Logo: LOGOIPSUM
Quote: "They brought clarity to complex problems, breaking down barriers and delivering beyond our expectations."
Author: "- John Doe Tech Innovations"
Image URL: https://cdn.sceneai.art/Hero%20section%20image/3654d348-a98c-4320-bc14-3f458b45a50d.png
Card 2:

Logo: LOQO
Quote: "Their insight resolved difficult hurdles, opening new paths and creating highly effective strategies for our team."
Author: "- John Doe Tech Innovations"
Image URL: https://cdn.sceneai.art/Hero%20section%20image/2b6256a4-a054-4628-8774-7d43fc1f2646.png
Card 3:

Logo: LGO
Quote: "We found focus for tricky requirements, cutting through noise and providing truly actionable solutions."
Author: "- John Doe Tech Innovations"
Image URL: https://cdn.sceneai.art/Hero%20section%20image/32eb126d-51ed-4853-9626-dd702aba04dc.png
Card 4:

Logo: IPSUM
Quote: "The strategic approach completely changed our trajectory, allowing us to scale faster than we ever anticipated."
Author: "- John Doe Tech Innovations"
Image URL: https://cdn.sceneai.art/Hero%20section%20image/8dae17e6-2475-46d6-bce8-f72631954cfe.png
Please put all code into a single file with App as the default export.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

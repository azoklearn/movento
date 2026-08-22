# LaunchPad — Market Insights Blog Section

Generate a single HTML file containing a "Market Insights" section using Tailwind CSS (via CDN) and the 'Inter' font.
CRITICAL RULES - DO NOT IGNORE:

DO NOT add any extra UI elements (no navbars, no global footers, no page backgrounds).
DO NOT add box-shadows or borders to the cards.
DO NOT change any units. You MUST use the exact pixel (px) values provided for font sizes.
DO NOT add or remove any text. Use the exact text and <br> tags provided below.
Global & Animation Styles:

Container: antialiased py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto.
Print CSS: Add a <style> block with @media print { body, h2, h3, p, span, a, div { color: blue !important; border-color: blue !important; } }.
Animation CSS: Add base classes .animate-item { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; } and .animate-item.visible { opacity: 1; transform: translateY(0); }.
JavaScript: Add a script to add the .visible class to #header-section after 100ms, and to each .card-item sequentially with a staggered delay (e.g., 250ms, 400ms, 550ms) after the DOM loads.
Header Section (ID: header-section, Class: animate-item):

Layout: Flex container, column on mobile, row on tablet/desktop (md:flex-row), justify-between, aligned to bottom (md:items-end), mb-12.
Left Side (Heading):
Text: "Expert Insights for
Better Growth"
Styling: Exact inline style font-size: 36px; letter-spacing: -0.02em;. Classes: font-bold tracking-tight leading-tight max-w-lg mb-6 md:mb-0 text-gray-900.
Right Side (Subtext & Button container): Flex column, align start on mobile, align end on desktop (md:items-end), text-left mobile, text-right desktop.
Subtext: "We fuel bold ideas, driving them
forward with sharp strategy"
Subtext Styling: Exact inline style font-size: 15px;. Classes: text-gray-500 max-w-xs mb-4.
Button: Text "View Blogs →". Classes: inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm.
Grid Section:

Layout: CSS Grid. 1 column mobile, 2 cols tablet (md:grid-cols-2), 3 cols desktop (lg:grid-cols-3). Gap: gap-8.
Card Specifications (Apply to all 3 cards, Class: animate-item card-item):

Layout: Flex column (flex flex-col).
Main Image Wrapper: rounded-2xl overflow-hidden aspect-[4/3] mb-6.
Main Image: w-full h-full object-cover transition-transform duration-500 hover:scale-105.
Tag Wrapper: mb-4.
Tag: inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium.
Title: Exact inline style font-size: 18px;. Classes: font-semibold mb-3 leading-snug text-gray-900.
Description: Exact inline style font-size: 14px;. Classes: text-gray-500 mb-6 flex-grow leading-relaxed.
Author Footer: flex items-center mt-auto. Profile image (w-10 h-10 rounded-full mr-3 object-cover), Author Name (text-sm font-semibold text-gray-900), Date (text-xs text-gray-500).
Exact Card Data:
Card 1:

Tag: Marketing
Title: "Stop Chasing Vanity Metrics,
Start Measuring Real Growth"
Description: "Stop Mistaking Engagement for Revenue. We detail
how to Audit Your Data and Pivot from Likes"
Main Image URL: https://cdn.sceneai.art/Image%20for%20Blog%20section/88aec046-9b66-4fe6-b23c-b7cb548140da.jpg
Author Name: Alistair Finch | Date: January 12,2025
Author Image URL: https://cdn.sceneai.art/Only%20man%20image/0ccd6017-25fc-493b-abdf-321915dde101.jpg
Card 2:

Tag: Clarity
Title: "Reach Similar Customers Who
Convert More Often"
Description: "Stop wasting ad budget on generic targeting. We
reveal the counter-intuitive data points"
Main Image URL: https://cdn.sceneai.art/Image%20for%20Blog%20section/ef860558-2d11-42d9-aaf9-0ec5e0dca5b7.webp
Author Name: Liam Walker | Date: August 19,2025
Author Image URL: https://cdn.sceneai.art/Only%20man%20image/15f51708-d9b1-4faf-abf6-f0cdf7d64f8f.jpg
Card 3:

Tag: Revenue
Title: "Stop Chasing First-Time
Customer Growth"
Description: "This article exposes the critical error that starves
long-term profitability optimizing solely"
Main Image URL: https://cdn.sceneai.art/Image%20for%20Blog%20section/fceff2cf-8c36-4aa6-b0ab-93467e78d68f.webp
Author Name: Julian Reed | Date: June 24,2025
Author Image URL: https://cdn.sceneai.art/Only%20man%20image/7e1339ef-7a01-4979-93c8-21d97af291ee.webp

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

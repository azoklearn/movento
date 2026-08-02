# Designy — Minimal Card Footer

Please create a modern, responsive footer component using React and Tailwind CSS. The design should exactly match the following specifications:

1. Overall Layout & Container

Use a full-screen wrapper with a very light gray background (bg-[#FAFAFA]) to showcase the component. Center the footer vertically and horizontally with responsive padding (p-4 md:p-8 lg:p-12).

The main footer element should be a card with a maximum width of 1100px.

Card Styling: White background, highly rounded corners (rounded-[28px]), a very subtle border (border-[#F9FAFB]), and a soft shadow (shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]).

Card Padding: px-6 py-10 on mobile, px-12 py-12 on tablet, and px-[72px] py-[56px] on desktop.

2. Top Section: Brand & Navigation (Flex Layout)

Create a container for the top half using flexbox: column on mobile, row on desktop (lg:flex-row), with justify-between and a gap of 12 (mobile) or 8 (desktop). Add mb-12.

Left Column (Brand):

Take up 100% width on mobile, 40% on desktop.

Logo: Create a custom SVG logo (a 24x24 black square #0A0A0A with rx=5, containing three parallel white diagonal lines pointing up-right).

Brand Name: Next to the logo, add "Designy" in #0A0A0A, text size 19px, font-bold, and tracking-tight.

Description: Below the brand name, add the text: "Designy empowers teams to transform raw data into clear, compelling visuals — making insights easier to share, understand, and act on." Style it with #71717A, text size 13px, leading-[1.6], max-w-[340px], mt-5, and mb-6.

Social Icons: Below the description, add a row of 4 icons (X/Twitter, Instagram, LinkedIn, GitHub). Use Lucide React or SVGs. Style them with #0A0A0A, size ~15-18px. Add a hover effect that drops opacity to 70%.

Right Column (Links Grid):

Take up 100% width on mobile, 50% on desktop.

Use a CSS Grid: 2 columns on mobile, 3 columns on tablet/desktop. Gap should be 8 (mobile) to 4 (desktop).

Column 1 (Product): Features, Pricing, Integrations, Changelog.

Column 2 (Resources): Documentation, Tutorials, Blog, Support.

Column 3 (Company): About, Careers, Contact, Partners.

Link Column Styling: - Headers: #0A0A0A, font-semibold, text-[14px], mb-5.

Links list: flex column with gap-3.5.

Links: #71717A, text-[13px]. On hover, change text to #0A0A0A with a transition.

3. Divider

Add a horizontal rule <hr> below the top section.

Color: border-[#F4F4F5].

Margin: mb-6, w-full.

4. Bottom Section: Copyright & Legal

Flexbox layout: flex-col-reverse on mobile, md:flex-row on tablet/desktop. justify-between, items-start md:items-center.

Copyright (Left): "© [Current Year] Designy. All rights reserved." Styled as #71717A, text-[13px].

Legal Links (Right): Privacy Policy, Terms of Service, Cookies Settings.

Legal Links Styling: Flex row with wrapping, gap 4 to 6. Text is #71717A, size 13px.

Legal Links Hover State: Use a custom underline. Default state: underline, underline-offset-[4px], decoration-[#E5E7EB]. Hover state: change text and decoration to #0A0A0A with a transition.

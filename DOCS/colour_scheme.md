{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww22060\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # ThriveSend Color Scheme\
\
## Overview\
\
This document defines the official color scheme for ThriveSend, ensuring consistent visual identity across all interfaces and components. This color scheme replaces previous versions and should be used as the definitive reference for all development work.\
\
## Color Palette\
\
### Base Colors\
- **White**: `#FFFFFF` - Used for text on dark backgrounds, card backgrounds in light mode\
- **Black**: `#000000` - Used for extreme contrast needs, rarely needed directly\
\
### Primary (Indigo)\
- **Main**: `#4F46E5` - Used for primary buttons, key UI elements, and brand identity\
- **Light**: `#818CF8` - Used for hover states, backgrounds, and secondary elements\
- **Dark**: `#4338CA` - Used for active states and contrast needs\
\
#### Full Shade Range\
| Shade | Hex Code | Usage |\
|-------|----------|-------|\
| 50 | `#eef2ff` | Very light backgrounds, hover states in light mode |\
| 100 | `#e0e7ff` | Light backgrounds, disabled states |\
| 200 | `#c7d2fe` | Borders, dividers in light mode |\
| 300 | `#a5b4fc` | Text on dark backgrounds |\
| 400 | `#818cf8` | Secondary UI elements, light variant |\
| 500 | `#4F46E5` | **Main** - Primary UI elements |\
| 600 | `#4338CA` | **Dark** - Active states, pressed buttons |\
| 700 | `#3730a3` | Strong emphasis, dark mode elements |\
| 800 | `#312e81` | Very dark UI elements |\
| 900 | `#27265f` | Extra dark UI elements |\
| 950 | `#1a1841` | Extreme contrast situations |\
\
### Secondary (Green)\
- **Main**: `#10B981` - Used for success states, badges, and highlights\
- **Light**: `#34D399` - Used for lighter success states and backgrounds\
\
#### Full Shade Range\
| Shade | Hex Code | Usage |\
|-------|----------|-------|\
| 50 | `#ecfdf5` | Very light success backgrounds |\
| 100 | `#d1fae5` | Light success backgrounds |\
| 200 | `#a7f3d0` | Borders, dividers for success states |\
| 300 | `#6ee7b7` | Secondary success indicators |\
| 400 | `#34D399` | **Light** - Light success variant |\
| 500 | `#10B981` | **Main** - Primary success indicators, badges |\
| 600 | `#059669` | Active success states |\
| 700 | `#047857` | Strong success emphasis |\
| 800 | `#065f46` | Very dark success elements |\
| 900 | `#064e3b` | Extra dark success elements |\
| 950 | `#022c22` | Extreme contrast situations |\
\
### Accent (Amber)\
- **Main**: `#F59E0B` - Used for warnings, attention-grabbing elements, and highlights\
\
#### Full Shade Range\
| Shade | Hex Code | Usage |\
|-------|----------|-------|\
| 50 | `#fffbeb` | Very light warning backgrounds |\
| 100 | `#fef3c7` | Light warning backgrounds |\
| 200 | `#fde68a` | Borders, dividers for warning states |\
| 300 | `#fcd34d` | Secondary warning indicators |\
| 400 | `#fbbf24` | Light warning variant |\
| 500 | `#F59E0B` | **Main** - Primary warning indicators, badges |\
| 600 | `#d97706` | Active warning states |\
| 700 | `#b45309` | Strong warning emphasis |\
| 800 | `#92400e` | Very dark warning elements |\
| 900 | `#78350f` | Extra dark warning elements |\
| 950 | `#451a03` | Extreme contrast situations |\
\
### Neutral\
- **Text**: `#1F2937` - Main text color\
- **Text Light**: `#6B7280` - Secondary text, descriptions, placeholders\
- **Text Dark**: `#111827` - Text color for dark mode\
- **Background**: `#F9FAFB` - Main background color\
- **Background Dark**: `#111827` - Background color for dark mode\
- **Card**: `#FFFFFF` - Card and container backgrounds\
- **Border**: `#E5E7EB` - Borders, dividers, separators\
\
### Gradient\
- **Purple**: `#7C3AED` - Used in gradients with primary colors\
- **Gradient Example**: `bg-gradient-to-r from-primary-500 to-gradient-purple`\
\
## Usage Guidelines\
\
### Buttons\
- **Primary Button**: Background `primary-500`, Hover `primary-600`, Text `white`\
- **Secondary Button**: Background `white`, Border `primary-500`, Text `primary-500`\
- **Success Button**: Background `secondary-500`, Hover `secondary-600`, Text `white`\
- **Warning Button**: Background `accent-500`, Hover `accent-600`, Text `white`\
\
### Text\
- **Headings**: `neutral-text`\
- **Body**: `neutral-text`\
- **Secondary Text**: `neutral-text-light`\
- **Links**: `primary-500`, Hover `primary-600`\
\
### Backgrounds\
- **Main Background**: `neutral-background`\
- **Card Background**: `neutral-card`\
- **Dark Mode Background**: `neutral-background-dark`\
- **Dark Mode Card**: Darker shade than background\
\
### Borders\
- **Regular Border**: `neutral-border`\
- **Focus Border**: `primary-400`\
- **Error Border**: `red-500` (use system red)\
\
### Status Indicators\
- **Success**: `secondary-500`\
- **Warning**: `accent-500`\
- **Error**: `red-500` (use system red)\
- **Info**: `primary-500`\
\
## Dark Mode Support\
\
ThriveSend supports dark mode using Tailwind's dark mode utilities. Dark mode should maintain the same color semantics but with adjusted brightnesses to maintain proper contrast.\
\
### Dark Mode Color Mappings\
- **Background**: `neutral-background-dark`\
- **Text**: `text-custom-white` (use this custom utility instead of text-white)\
- **Cards**: Use darker shades than the background\
- **Primary Actions**: Use `primary-400` instead of `primary-500` for better visibility\
- **Borders**: Use darker borders with higher opacity for subtle definition\
\
### Important Note\
When working with white text, use our custom utility class `text-custom-white` instead of Tailwind's `text-white` to avoid compilation issues. Similarly, use `text-custom-black` for black text.\
\
## Technical Implementation\
\
### Tailwind CSS\
ThriveSend uses Tailwind CSS for styling, with a custom color configuration defined in `tailwind.config.ts`. Colors are accessible through class names following the pattern:\
\
- Primary: `bg-primary-500`, `text-primary-600`, etc.\
- Secondary: `bg-secondary-400`, `border-secondary-300`, etc.\
- Accent: `bg-accent-500`, `text-accent-700`, etc.\
- Neutral: `bg-neutral-background`, `text-neutral-text`, etc.\
- Gradients: `bg-gradient-to-r from-primary-500 to-gradient-purple`\
\
### Important Note on Tailwind 4.1.4\
Tailwind CSS 4.1.4 has some changes in how utility classes work. Some basic utility classes like `text-white` and `font-semibold` may not be recognized. For common components, we've created custom CSS classes in globals.css that don't rely on Tailwind's @apply directive. \
\
When creating new components, prefer:\
1. Use direct semantic classes like `text-primary-500` instead of `text-white`\
2. For white text, use our custom `.text-custom-white` class\
3. For complex components, use regular CSS properties instead of relying on Tailwind's @apply\
\
### Dark Mode\
Use Tailwind's dark mode feature to define dark mode variants:\
\
```jsx\
<div className="bg-neutral-card dark:bg-neutral-background-dark text-neutral-text dark:text-white">\
  <h1 className="text-primary-500 dark:text-primary-400">Hello World</h1>\
</div>\
```\
\
### ShadCN UI Integration\
When using ShadCN UI components, customize them with our color scheme:\
\
```jsx\
<Button className="bg-primary-500 hover:bg-primary-600 text-white">\
  Primary Button\
</Button>\
\
<Button variant="outline" className="border-primary-500 text-primary-500">\
  Secondary Button\
</Button>\
```\
\
### PWA Support\
For PWA manifest and splash screens, use these color values:\
\
```json\
\{\
  "theme_color": "#4F46E5",\
  "background_color": "#F9FAFB",\
  "display": "standalone"\
\}\
```\
\
## Examples\
\
### Component Examples\
```jsx\
// Primary Button\
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md">\
  Click Me\
</button>\
\
// Success Card\
<div className="bg-secondary-50 border border-secondary-200 p-4 rounded-md">\
  <p className="text-secondary-700">Success message goes here</p>\
</div>\
\
// Warning Badge\
<span className="bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-semibold">\
  New\
</span>\
```\
\
### Gradient Examples\
```jsx\
// Primary to Purple Gradient\
<div className="bg-gradient-to-r from-primary-500 to-gradient-purple text-white p-4 rounded-md">\
  Gradient Card\
</div>\
\
// Green Success Gradient\
<div className="bg-gradient-to-r from-secondary-400 to-secondary-600 text-white p-4 rounded-md">\
  Success Gradient\
</div>\
```\
\
## Migration Guide\
\
If you're updating from a previous color scheme, please follow these steps:\
\
1. Update your imports to use the new color tokens\
2. Replace old color values with the new semantic color names\
3. Test all UI components in both light and dark modes\
4. Pay special attention to contrast and accessibility\
\
## Versioning\
\
**Current Version**: 2.0.0  \
**Last Updated**: 2025-01  \
**Previous Version**: 1.0.0 (Original design system) }
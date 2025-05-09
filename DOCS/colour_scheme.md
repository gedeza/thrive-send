# ThriveSend Color Scheme

## Overview

This document defines the official color scheme for ThriveSend, ensuring a consistent, accessible visual identity across all interfaces and components. This color scheme replaces previous versions and is the definitive reference for all development work.

---
\
## Color Palette

### Base Colors

- **White**: `#FFFFFF` – For text on dark backgrounds, card backgrounds in light mode.
- **Black**: `#000000` – For extreme contrast needs, rarely needed directly.

### Primary (Indigo)
- **Main**: `#4F46E5` – For primary buttons, key UI elements, and brand identity.
- **Light**: `#818CF8` – Hover states, backgrounds, secondary elements.
- **Dark**: `#4338CA` – Active states and contrast needs.

| Shade | Hex    | Usage                                     |
|-------|--------|-------------------------------------------|
| 50    | #eef2ff | Very light backgrounds, hover states      |
| 100   | #e0e7ff | Light backgrounds, disabled states        |
| 200   | #c7d2fe | Borders, dividers in light mode           |
| 300   | #a5b4fc | Text on dark backgrounds                  |
| 400   | #818cf8 | Secondary UI, light variant               |
| 500   | #4F46E5 | **Main** - Primary UI elements            |
| 600   | #4338CA | **Dark** - Active states, pressed buttons |
| 700   | #3730a3 | Strong emphasis, dark mode elements       |
| 800   | #312e81 | Very dark UI elements                     |
| 900   | #27265f | Extra dark UI elements                    |
| 950   | #1a1841 | Extreme contrast situations               |
\
### Secondary (Green)
- **Main**: `#10B981` – Success states, badges, highlights.
- **Light**: `#34D399` – Lighter success states, backgrounds.

| Shade | Hex     | Usage                          |
|-------|---------|--------------------------------|
| 50    | #ecfdf5 | Very light success backgrounds |
| 100   | #d1fae5 | Light success backgrounds      |
| 200   | #a7f3d0 | Borders, dividers              |
| 300   | #6ee7b7 | Secondary success indicators   |
| 400   | #34D399 | **Light** - Light variant      |
| 500   | #10B981 | **Main** - Primary indicators  |
| 600   | #059669 | Active success states          |
| 700   | #047857 | Strong success emphasis        |
| 800   | #065f46 | Very dark success elements     |
| 900   | #064e3b | Extra dark success elements    |
| 950   | #022c22 | Extreme contrast situations    |

### Accent (Amber)
- **Main**: `#F59E0B` – Warnings, attention elements, highlights.

| Shade | Hex     | Usage                          |
|-------|---------|--------------------------------|
| 50    | #fffbeb | Very light warning backgrounds |
| 100   | #fef3c7 | Light warning backgrounds      |
| 200   | #fde68a | Borders, dividers              |
| 300   | #fcd34d | Secondary indicators           |
| 400   | #fbbf24 | Light warning variant          |
| 500   | #F59E0B | **Main** - Warning indicators  |
| 600   | #d97706 | Active warning states          |
| 700   | #b45309 | Strong warning emphasis        |
| 800   | #92400e | Very dark warning elements     |
| 900   | #78350f | Extra dark warning elements    |
| 950   | #451a03 | Extreme contrast situations    |
\
### Neutral

- **Text**: `#1F2937` (Main)
- **Text Light**: `#6B7280` (Secondary, placeholders)
- **Text Dark**: `#111827` (Dark mode)
- **Background**: `#F9FAFB`
- **Background Dark**: `#111827`
- **Card**: `#FFFFFF`
- **Border**: `#E5E7EB`

### Gradient

- **Purple**: `#7C3AED` – for gradients with primary colors.
- Example: `bg-gradient-to-r from-primary-500 to-gradient-purple`

---
\
## Usage Guidelines

### 🎨 **Buttons**

> **All button color/contrast must use semantic color names. For any white text, use the custom class `.text-custom-white` (defined in global-fonts.css) never Tailwind's `text-white`, to avoid build issues and ensure consistency.**

| Variant   | Background        | Hover             | Border                | Text              |
|-----------|------------------|-------------------|-----------------------|-------------------|
| Primary   | `primary-500`    | `primary-600`     | —                     | `.text-custom-white` |
| Secondary | `white`          | `primary-50`      | `primary-500`         | `primary-500`     |
| Success   | `secondary-500`  | `secondary-600`   | —                     | `.text-custom-white` |
| Warning   | `accent-500`     | `accent-600`      | —                     | `.text-custom-white` |

**Sample Usage:**  
```jsx
// Primary Button
<Button variant="primary">Label</Button> // Renders bg-primary-500 hover:bg-primary-600 text-custom-white

// Secondary Button
<Button variant="secondary">Label</Button> // Renders bg-white border border-primary-500 text-primary-500

// Success Button
<Button variant="success">Label</Button> // Renders bg-secondary-500 hover:bg-secondary-600 text-custom-white

// Warning Button
<Button variant="warning">Label</Button> // Renders bg-accent-500 hover:bg-accent-600 text-custom-white
```

For custom text color on any button, always use `.text-custom-white` or `.text-custom-black` (see below).

---

### **Text**

- Headings: `text-neutral-text`
- Body: `text-neutral-text`
- Secondary Text: `text-neutral-text-light`
- Links: `text-primary-500` (hover: `text-primary-600`)
- For white text: always prefer `.text-custom-white`
\
### **Backgrounds**

- Main: `bg-neutral-background`
- Card: `bg-neutral-card`
- Dark Mode: `bg-neutral-background-dark`  
  - Use shades like `primary-400` for highest visibility on dark backgrounds.

---

### **Borders**

- Regular: `border-neutral-border`
- Focus: `border-primary-400`
- Error: `border-red-500`

---

### **Status Indicators**

- Success: `bg-secondary-500`
- Warning: `bg-accent-500`
- Error: `bg-red-500` (system red)
- Info: `bg-primary-500`
\
### **Dark Mode Support**

ThriveSend supports dark mode using Tailwind dark mode utilities. Maintain semantic color meaning, but use lighter shades for backgrounds and swap primary accents for max contrast.  
**Important:** For dark backgrounds, use `primary-400` instead of `primary-500` for action buttons.

#### Dark Mode Color Mapping

- Background: `bg-neutral-background-dark`
- Text: `.text-custom-white`
- Cards: Darker than background (i.e. `bg-neutral-900`)
- Primary actions: prefer `primary-400`
- Borders: darker, higher opacity for subtlety

#### Example Dark Mode

```jsx
<div className="bg-neutral-card dark:bg-neutral-background-dark text-neutral-text dark:text-custom-white">
  <h1 className="text-primary-500 dark:text-primary-400">Hello World</h1>
  <Button variant="primary" className="dark:bg-primary-400">Dark mode button</Button>
</div>
```
\
### **Technical Implementation**

- All tokens are defined in `tailwind.config.js` and mapped for use in class names like `bg-primary-500`, `text-primary-400`, etc.
- For any white or black text, only use `.text-custom-white` or `.text-custom-black` (never Tailwind's `text-white` or `text-black` directly).
- Custom classes are provided in `/styles/global-fonts.css`.

---

### **ShadCN UI Integration**

- When using external component libraries (e.g. ShadCN), **always override classes** to match our semantic tokens and text-class (`.text-custom-white`) conventions.

```jsx
<Button className="bg-primary-500 hover:bg-primary-600 text-custom-white">
  Primary Action
</Button>
<Button variant="outline" className="border-primary-500 text-primary-500">
  Secondary Action
</Button>
```
\
### **Examples**

#### **Component Examples**

```jsx
// Primary Button
<button className="bg-primary-500 hover:bg-primary-600 text-custom-white px-4 py-2 rounded-md">
  Click Me
</button>

// Success Card
<div className="bg-secondary-50 border border-secondary-200 p-4 rounded-md">
  <p className="text-secondary-700">Success message</p>
</div>

// Warning Badge
<span className="bg-accent-500 text-custom-white px-2 py-1 rounded-full text-xs font-semibold">
  New
</span>
```

#### Gradient Example

```jsx
// Primary to Purple Gradient
<div className="bg-gradient-to-r from-primary-500 to-gradient-purple text-custom-white p-4 rounded-md">
  Gradient Card
</div>
```

---
\
## **Migration Guide**

1. Update all button and text color utilities to semantic tokens and `.text-custom-white` as described.
2. Test UI in both light and dark modes.
3. Double check accessibility: ensure minimum contrast ratios.
4. Remove all direct uses of Tailwind's `text-white` in favor of `.text-custom-white`.
\
## **Versioning**

- **Current Version**: 2.1.0  
- **Last Updated**: 2025-06  
- **Changelog**: Emphasized `.text-custom-white` and clarified button/class usage everywhere per implementation.

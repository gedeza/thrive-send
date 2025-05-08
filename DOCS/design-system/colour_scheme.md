# ThriveSend Color Scheme Policy & Enforcement (2024-06 Update)

> **Notice (2024-06):**  
> This document defines the **single source of truth** for all color usage in ThriveSend.  
> **ALL color styling must use the semantic tokens included below.**  
> No raw hex, `text-white`, `text-black`, or Tailwind default colors outside the token system are allowed.  
> Compliance is enforced through regular [color scheme audits](color_scheme_compliance_audit.md) and CI/linting.  
> **See:** [README.md](../README.md), [PRD.md](../PRD.md), and [color_scheme_compliance_audit.md](color_scheme_compliance_audit.md) for rationale, workflow, and enforcement.

---
## Overview

This document contains:
- The official ThriveSend color palette as semantic tokens for backgrounds, text, states, and accents.
- Usage rules for all code and design artifacts.
- Migration requirements from previous schemes.
- Technical integration notes (Tailwind, CSS, ShadCN UI, tokens).
- How this doc links to the compliance audit and development workflow.

---
## Color Palette (Tokens)

### Base Colors

- **white**: `#FFFFFF`  
- **black**: `#000000`  
- **background**: `#F9FAFB`  
- **background-dark**: `#111827`  
- **card**: `#FFFFFF`  
- **border**: `#E5E7EB`  
### Primary (Indigo)

| Name         | Token / Tailwind         | Hex       | Usage                                        |
|--------------|-------------------------|-----------|----------------------------------------------|
| Main         | `primary-500`           | #4F46E5   | Buttons, highlights, brand identity          |
| Light        | `primary-400`/`primary-100` | #818CF8/#e0e7ff | Hover, cards, backgrounds, secondary |
| Dark         | `primary-600`           | #4338CA   | Active states, pressed buttons               |
| ...shades... | ...see below...         | ...       | ...                                          |

**Full shade series (for backgrounds, states, gradients) is available in the Tailwind config and design tokens.**
### Secondary (Green)

| Name     | Token / Tailwind   | Hex     | Usage                 |
|----------|-------------------|---------|-----------------------|
| Main     | `secondary-500`   | #10B981 | Success, badges       |
| Light    | `secondary-400`   | #34D399 | Lighter success/states|
### Accent (Amber)

| Name     | Token / Tailwind   | Hex     | Usage                     |
|----------|-------------------|---------|---------------------------|
| Main     | `accent-500`      | #F59E0B | Warnings, highlights      |
| Light    | `accent-400`      | #fbbf24 | Light warning/secondary   |
### Neutral / Utility

| Purpose          | Token                | Hex       |
|------------------|---------------------|-----------|
| Text             | `neutral-text`      | #1F2937   |
| Text Light       | `neutral-text-light`| #6B7280   |
| Text Dark        | `neutral-text-dark` | #111827   |
| Card             | `neutral-card`      | #FFFFFF   |
| Border           | `neutral-border`    | #E5E7EB   |
| Background       | `neutral-background`| #F9FAFB   |
| Background Dark  | `neutral-background-dark` | #111827 |

### Gradients

- **purple**: `#7C3AED`
- Example: `bg-gradient-to-r from-primary-500 to-gradient-purple`

--- 
## Usage Rules & Guidelines

### 🔹 STRICT COLOR ENFORCEMENT

- **ALL colors must be referenced via semantic tokens defined above and in Tailwind config.**
- **DO NOT use:**
  - Raw hex codes in components or stylesheets
  - Tailwind default classes like `text-white`, `text-black`, `bg-blue-500`
  - Named CSS colors ("red", "blue", etc.)
- **ALWAYS use:**
  - `bg-primary-500`, `text-secondary-600`, `border-accent-200`, etc. (from token palette)
  - `.text-custom-white`, `.text-custom-black` for white/black text when needed (defined in global CSS).
  - Existing util classes mapped to centralized tokens.

> **Non-compliant code will fail audit and may be blocked from merging.**

### Button, Card & Badge Examples

```jsx
// Primary Button
<button className="bg-primary-500 hover:bg-primary-600 text-custom-white px-4 py-2 rounded-md">
  Click Me
</button>

// Success Card
<div className="bg-secondary-50 border border-secondary-200 p-4 rounded-md">
  <p className="text-secondary-700">Success message goes here</p>
</div>

// Warning Badge
<span className="bg-accent-500 text-custom-white px-2 py-1 rounded-full text-xs font-semibold">
  New
</span>
```
---

## Technical Integration

### Tailwind CSS

- All tokens are mapped in `tailwind.config.js`.
- Use classnames like `bg-primary-500`, `text-neutral-text`, etc.
- For dark mode, use `dark:bg-neutral-background-dark`, `dark:text-custom-white`, etc.

### ShadCN UI / Other Libraries

- Customize their color props and classes to use **our tokens**, not their built-in/vanilla palettes.
- Do NOT use out-of-the-box MUI or ShadCN colors for production—always override with semantic tokens.

### Custom Utility Classes

- Use `.text-custom-white` instead of Tailwind's `text-white` for white text.
- Use `.text-custom-black` likewise for black text.
- Utilities are defined in `global.css` and used consistently everywhere.

---

## Compliance Audit & Developer Workflow

- **All UI code is subject to regular color scheme compliance audits, tracked in [color_scheme_compliance_audit.md](color_scheme_compliance_audit.md).**
- See audit file for known gaps, open issues, and audit status.
- CI/CD will (or soon will) run automated linters/scripts to catch unauthorized color usage.
- Contributors MUST check both this doc and the audit file before styling components.
---

## Migration Guide

1. Refactor any use of legacy/previous color classes or hardcoded values in components/styles.
2. Replace with the correct semantic token class (as above).
3. Test in **both light and dark modes** for accessibility and proper contrast.
4. DO NOT submit code using deprecated color classes or direct hex codes.
5. Any newly-touched UI code must be brought into compliance even if it's unrelated to the main PR change.

---

## FAQ & Best Practices

**Q: Can I use a hex value directly if it matches a token?**  
A: **No!** Always use the semantic class/token so theming is future-proof and auditable.

**Q: I need a color not in this list, what do I do?**  
A: Discuss it in an issue or with design leads—**never add colors ad hoc.** New color tokens are added centrally after review.

**Q: How do I ensure my code passes the audit?**  
A: Run the compliance script or check [color_scheme_compliance_audit.md](color_scheme_compliance_audit.md) for what to check, and validate classnames.
---

## Versioning & Changelog

- **Version:** 3.0.0  
- **Last Updated:** 2024-06  
- **Major changes (2024-06):**
  - **Centralized token-based color enforcement**
  - **Audit and compliance workflow documented**
  - **Strict ban on all non-token color, Tailwind class, or hex usage**
  - **Custom classes for special cases enacted**
  - **Readme/doc alignment with enforced design system**
  - **Technical implementation guidance updated**

Old version(s) and migration history are retained for audit trail and onboarding.

---

> This document is the single source of truth for ThriveSend's visual identity and color policy.  
> ALL contributors must read and follow this for every PR, review, and design decision.

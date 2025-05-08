# ThriveSend Theme: Integration & Usage Guide

## Where to Use Tokens

- **Colors:**  
  - Always use `theme.colors` for backgrounds, texts, etc.
- **Buttons:**  
  - Use the `Button` base component from `/src/components/ui/Button.tsx`
  - Reference `theme.button` for new button types
- **Borders:**  
  - For all borders, use `theme.border.default` (or `.focus`, `.radius.sm`/`.md`, `.width.thin`/`.medium`)
- **Shadows:**  
  - Use `theme.shadow.sm`, `md`, or `lg` for elevations.
- **Transitions:**  
  - Use `theme.transition.DEFAULT` for animations/hover/focus transitions.

## Example Usage

```typescript
import { theme } from "@/lib/theme";
import Button from "@/components/ui/Button";

// For a primary background:
<div style={{ background: theme.colors.primary.DEFAULT }} />

// For a button:
<Button variant="secondary" size="lg">Save</Button>

// For a border:
<div style={{
  border: `${theme.border.width.thin} solid ${theme.border.default}`,
  borderRadius: theme.border.radius.md
}} />
```

## How to Extend

- Need a new button or border style?  
  - **Always add it to `theme.ts` first** and then use it everywhere.
- Never hard-code color, shadow, border, or transition values in components!

---

## Migration Checklist (for teams)

- [ ] Overwrite `/src/lib/theme.ts` with the new theme definition
- [ ] Replace all old Button usages with the new UI Button
- [ ] Replace all border, color, shadow, and transition usages with theme tokens
- [ ] Notify team and update documentation

---

**Use this guide and artifacts to keep all new implementation 100% theme-driven and maintainable!**
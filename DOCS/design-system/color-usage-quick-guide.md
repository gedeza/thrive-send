# ThriveSend Color Token Quick Reference

## How to Use

- **Import the theme:**
  ```typescript
  import { theme } from '@/lib/theme';
  ```

- **Reference colors in your components:**
  ```typescript
  style={{ color: theme.colors.primary.DEFAULT }}
  // or
  sx={{ borderColor: theme.colors.gray[200] }}
  ```

- **For alpha/rgba effects:**
  ```typescript
  import { hexToRgba } from '@/lib/colorUtils';
  const subtleBorder = hexToRgba(theme.colors.foreground, 0.12);
  ```

## Principles

- ❌ Never hard-code hex or rgb/rgba in components.
- ✅ Always use `theme.colors` tokens or helpers.
- 🛡 If the color you need doesn't exist, **add it to `/src/lib/theme.ts`**!
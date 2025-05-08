# Enforcing Centralized Color Tokens with ESLint

## Purpose

This guide describes how to apply lint rules that ensure color values in your code are always referenced from `/src/lib/theme.ts`, never hard-coded.

---

## How It Works

- **Restricts use of hex color literals** (e.g. `#1976d2`, `#fff`) in all JS/TSX files except `/src/lib/theme.ts`.
- **Flags use of `rgb()` and `rgba()` property access** for color assignment.

---

## Installation & Usage

1. **Place the config override**  
   Save `/.eslintrc.color-tokens.json` in your project root.

2. **Merge it with your main ESLint config**  
   - If using `.eslintrc.js` or `.eslintrc.json`, add the override from `.eslintrc.color-tokens.json` into the `"overrides"` array of your main ESLint configuration.
   - Or, use a tool like [eslint-merge](https://www.npmjs.com/package/eslint-merge) to combine them.

3. **Run ESLint**
   ```sh
   npx eslint .
   ```

   Any instance of a hard-coded color (hex, rgb, rgba) outside your theme file will trigger an error.

---

## Example Offenses

```tsx
// ❌ ERROR
const style = { color: "#0ff" };

// ❌ ERROR
style.background = "rgb(111,222,0)";

// ❌ ERROR
style.border = "1px solid rgba(0,0,0,0.1)";
```

---

## Allowed

```typescript
// ✔️ In src/lib/theme.ts only:
export const theme = { colors: { primary: "#1976d2" } };

// ✔️ Everywhere:
import { theme } from "@/lib/theme";
const style = { color: theme.colors.primary.DEFAULT };
```

---

## Notes

- Your main theme file (`/src/lib/theme.ts`) is excluded so tokens can be defined there.
- False positives may occur if you use the words "rgb" or "rgba" as variable names for other purposes—keep naming clear.

---

## Advanced: Automating Lint in CI/Pre-commit

- Add an ESLint check in your **CI pipeline** and/or as a **pre-commit hook** (with [lint-staged](https://github.com/okonet/lint-staged)), so violations are flagged early.

---
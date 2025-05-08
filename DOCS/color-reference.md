# Color Reference & Design Swatch

_This document is your canonical palette. Designers and developers must reference this for all UI needs._

| **UI Role**             | **Token**                       | **Color**     | **Notes**                    |
|-------------------------|----------------------------------|---------------|------------------------------|
| Brand Primary (main)    | `theme.colors.primary.DEFAULT`   | #4f46e5       | All main actions, buttons    |
| Brand Primary (light)   | `theme.colors.primary.light`     | #818cf8       | On hover, focus ring         |
| Secondary Action        | `theme.colors.secondary.DEFAULT` | #10b981       | Secondary buttons            |
| Background (app)        | `theme.colors.background`        | #ffffff       | Main app bg                  |
| Foreground (main text)  | `theme.colors.foreground`        | #111827       | Headings, base content text  |
| Body/Text Subdued       | `theme.colors.gray[400]`         | #9ca3af       | Secondary text               |
| Divider                | `theme.colors.border`            | #e5e7eb       | Lines, dividers              |
| Card Background         | `theme.colors.card.DEFAULT`      | #ffffff       | Card surfaces                |
| Card Foreground         | `theme.colors.card.foreground`   | #111827       | Text on cards                |
| Muted BG (subtle)       | `theme.colors.muted.DEFAULT`     | #f3f4f6       | Inputs, subtle backgrounds   |
| Success                 | `theme.colors.success`           | #22c55e       | Success alerts, icons        |
| Error                   | `theme.colors.error`             | #ef4444       | Error states, inputs         |
| Warning                 | `theme.colors.warning`           | #f59e0b       | Warning/alert states         |

**Always use these tokens for the listed UI role!  
If a role is missing, add it here before using a token.**

- Don’t invent new tokens for trivial variations!
- If design agrees, you can alias tokens, e.g., `theme.colors.divider = theme.colors.gray[200]`
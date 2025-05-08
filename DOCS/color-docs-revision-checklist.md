# Color System Documentation Update Checklist

Use this checklist to ensure your documentation (README.md, PRD.md, and others) fully reflects your new centralized color and theming approach.

---

## 1. README.md

- [ ] **Add/Update 'Design Tokens & Color Scheme' Section**
  - Describe the use of centralized semantic color tokens.
  - Specify prohibition on raw hex, `text-white`/`text-black`, and generic Tailwind color classes.
  - Link to `colour_scheme.md` and the compliance audit doc.
  - Example snippet:
    ```
    ## Design Tokens & Color Scheme

    All UI colors are referenced exclusively via semantic tokens—defined in [colour_scheme.md](DOCS/colour_scheme.md).  
    Do not use raw hex codes or Tailwind’s default color classes.  
    All contributions are subject to [color scheme compliance audit](DOCS/color_scheme_compliance_audit.md).
    ```

- [ ] **Update Technology Stack & Development Guidelines**
  - Emphasize the custom theming system and its rationale.

---

## 2. PRD.md

- [ ] **Design System section (`6.1`)**
  - Clearly state that color styling is centralized and enforced via tokens.
  - Example snippet:
    ```
    - All color styling must use semantic tokens from [colour_scheme.md](colour_scheme.md).
    - No raw hex, generic Tailwind, or named CSS colors allowed in UI code.
    - Compliance is monitored via [color_scheme_compliance_audit.md](color_scheme_compliance_audit.md).
    ```
- [ ] **Non-Functional/Accessibility/Usability sections**
  - Describe how centralized color tokens help with maintainability and accessibility.

---

## 3. Related Docs

- [ ] Update any other docs, design guidelines, or onboarding materials to reference the token system.

---

**Tip:** Announce this change broadly and ensure CI/linting automation is in place to sustain compliance.
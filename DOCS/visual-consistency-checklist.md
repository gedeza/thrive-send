# Visual Consistency Audit Checklist

Use this checklist when reviewing new components or pages to ensure they maintain visual consistency with the design system.

## Colors

- [ ] Uses token-based colors (e.g., `bg-primary` not `bg-[#4F46E5]`)
- [ ] Color combinations follow accessible contrast ratios
- [ ] Gradients follow standard patterns (`from-primary to-primary-dark`)
- [ ] Text colors use standard tokens (`text-foreground`, `text-muted-foreground`)
- [ ] Hover/active states use standard color variations

## Typography

- [ ] Font family consistent with design system
- [ ] Uses standard font size tokens 
- [ ] Uses standard font weight tokens
- [ ] Line height appropriate for text size and context
- [ ] Headings follow hierarchy patterns
- [ ] Text alignment follows layout patterns

## Spacing & Layout

- [ ] Uses standard spacing tokens for padding/margin
- [ ] Container widths follow design system
- [ ] Grid layouts use standard gap values
- [ ] Section padding is consistent
- [ ] Responsive behavior follows breakpoint patterns
- [ ] Layout adapts properly at all viewport sizes

## Components

- [ ] Buttons follow standard styles and variants
- [ ] Cards use consistent styling (border, shadow, radius)
- [ ] Form controls match design system patterns
- [ ] Icons follow standard color and size patterns
- [ ] Interactive elements have consistent hover/focus states
- [ ] Animations/transitions use standard durations and easing

## Accessibility

- [ ] Color contrast meets WCAG AA standards
- [ ] Focus states are visible
- [ ] Interactive elements have appropriate hover states
- [ ] Text size is legible at all viewport sizes
- [ ] Critical UI is not dependent on color alone

## Common Issues to Watch For

- Mixed use of color formats (hex, RGB, HSL vs. tokens)
- Inconsistent border radius values
- Custom shadows that don't match design system
- Non-standard spacing between elements
- Hard-coded font sizes or weights
- Inconsistent text colors for similar element types
- Varying container widths without purpose

## Component-Specific Guidelines

### Buttons
- Primary buttons: `bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark`
- Secondary buttons: `bg-white border border-border text-foreground rounded-lg hover:bg-primary/5`
- Sized appropriately for content and importance

### Cards
- Standard styling: `bg-white border border-border rounded-xl p-6 shadow-sm`
- Interactive cards: Add `hover:-translate-y-2 hover:shadow-lg transition-all`
- Featured cards: Use `border-primary` and `shadow-lg`

### Text Elements
- Headings use appropriate size and weight for hierarchy
- Body text uses `text-foreground` and appropriate size
- Secondary text uses `text-muted-foreground`
- Link text has clear hover states

## Pull Request Visual Review Process

1. Compare new components to existing ones
2. Check color usage against tokens
3. Verify spacing consistency
4. Ensure responsive behavior matches patterns
5. Test interactive states match design system
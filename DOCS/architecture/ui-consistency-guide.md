# UI Consistency Reference Guide

## 1. Color Tokens

| Token Name | Usage | Tailwind Class | CSS Value |
|------------|-------|---------------|-----------|
| `primary` | Primary buttons, key accents | `bg-primary` | `#4F46E5` (indigo-600) |
| `primary-dark` | Hover states, gradients | `bg-primary-dark` | `#4338CA` (indigo-700) |
| `primary-light` | Subtle backgrounds, icons | `bg-primary/10` | `rgba(79, 70, 229, 0.1)` |
| `border` | Subtle separators | `border-border` | `#E2E8F0` (slate-200) |
| `muted-foreground` | Secondary text | `text-muted-foreground` | `#64748B` (slate-500) |
| `foreground` | Primary text | `text-foreground` | `#1E293B` (slate-800) |
| `background` | Page background | `bg-background` | `#F8FAFC` (slate-50) |
| `card` | Card backgrounds | `bg-card` | `#FFFFFF` (white) |
| `white` | White text | `text-white` | `#FFFFFF` |

## 2. Buttons

### Primary Button
```tsx
<Button className="rounded-lg shadow-sm hover:bg-primary-dark transition-colors">
  Button Text
</Button>
```

### Secondary/Outline Button
```tsx
<Button variant="outline" className="rounded-lg hover:bg-primary/5 transition-colors">
  Button Text
</Button>
```

### Large CTA Button
```tsx
<Button size="lg" className="min-w-[200px] rounded-lg shadow-sm hover:bg-primary-dark transition-colors">
  Call to Action
</Button>
```

## 3. Card Components

### Standard Card
```tsx
<div className="bg-white border border-border rounded-xl p-6 shadow-sm">
  {/* Card content */}
</div>
```

### Interactive Card
```tsx
<div className="bg-white border border-border rounded-xl p-6 transition-all hover:-translate-y-2 hover:shadow-lg">
  {/* Card content */}
</div>
```

### Featured Card
```tsx
<div className="bg-white border border-primary rounded-xl p-6 shadow-lg">
  {/* Card content */}
</div>
```

## 4. Typography

### Headings
- Hero: `text-4xl md:text-5xl lg:text-6xl font-extrabold`
- Section: `text-3xl md:text-4xl font-extrabold`
- Card: `text-xl font-bold`
- Subtitle: `text-lg text-muted-foreground`

### Text
- Body: `text-foreground`
- Secondary: `text-muted-foreground`
- Small: `text-sm text-muted-foreground`

### Gradient Text
```tsx
<h2 className="bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text">
  Gradient Heading
</h2>
```

## 5. Layout & Spacing

### Section Spacing
- Standard section: `py-24` (6rem top and bottom)
- Compact section: `py-16` (4rem top and bottom)
- Header/footer: `py-8` (2rem top and bottom)

### Container
```tsx
<div className="container mx-auto px-4 max-w-7xl">
  {/* Content */}
</div>
```

### Grids
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Grid items */}
</div>
```

## 6. Icons & Visual Elements

### Icon Containers
```tsx
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
  <IconComponent className="w-6 h-6" />
</div>
```

### Dividers/Accents
```tsx
<div className="h-1 w-full bg-gradient-to-r from-primary to-green-500 rounded"></div>
```

## 7. Visual DO's and DON'Ts

### DO:
- Use token-based colors (`bg-primary` over hardcoded values)
- Maintain consistent rounded corners (`rounded-lg` for buttons, `rounded-xl` for cards)
- Use shadows consistently (`shadow-sm` for subtle elements, `shadow-lg` for featured elements)
- Keep padding/margin proportional within components

### DON'T:
- Mix color systems (avoid mixing hex codes with token classes)
- Use inconsistent border-radius values across similar components
- Vary container widths without purpose
- Use custom animation values when standards exist
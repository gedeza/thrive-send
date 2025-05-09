# Gold Standard: MainLayout Usage

To ensure all app areas have a consistent layout, sidebar, and header, wrap main content using the `MainLayout` component. This promotes shared navigation and responsive UX across the platform.

## Basic Usage

```tsx
import { MainLayout } from "@/components/layout/main-layout";

export default function ExamplePage() {
  return (
    <MainLayout>
      {/* Page content goes here */}
    </MainLayout>
  );
}
```

## With Custom Sidebar Items

```tsx
import { MainLayout } from "@/components/layout/main-layout";
import { customSidebarItems } from "@/components/layout/sidebar.defaults";

export default function ExamplePage() {
  return (
    <MainLayout sidebarItems={customSidebarItems}>
      {/* Page content */}
    </MainLayout>
  );
}
```

## Options

- `headerProps` - Pass extra props to customize the Header.
- `sidebarItems` - Array of sidebar items for this section/page.
- `showSidebar` - Set to `false` if you do not want a sidebar.
- `collapsibleSidebar` - Boolean, defaults to `true`.

## Guidelines

- Use `MainLayout` for all dashboard, internal, or feature pages.
- Only top-level layout (e.g., `/app/layout.tsx`) should manage html/body/global styles.
- Customize navigation and header using provided props rather than re-implementing layouts.

## Reference

See `/components/layout/main-layout.tsx` for advanced details and prop documentation.
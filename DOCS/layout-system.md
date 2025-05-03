# ThriveSend Layout System

## Overview

ThriveSend uses a hybrid layout approach that combines Next.js App Router layouts with React component-based layouts. This document explains how these systems work together and the best practices for using them.

## Layout Architecture

Our layout system consists of two primary parts:

1. **App Router Layouts**: Located in `src/app/(dashboard)/layout.tsx`
2. **Component Layouts**: Located in `src/components/layout/main-layout.tsx`

### App Router Layouts

The App Router layout provides the base structure for entire route groups. For dashboard routes, this layout includes:

- The primary sidebar navigation for dashboard sections
- Mobile header with navigation toggle
- Main content wrapper with proper overflow handling

```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        {/* Sidebar content */}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### Component Layouts

The `MainLayout` component is used within pages to provide consistent structure for content, including:

- Conditional sidebar rendering (when not in dashboard routes)
- Header with search and user information
- Content container with consistent padding

```tsx
// src/components/layout/main-layout.tsx
export function MainLayout({ 
  children, 
  headerProps,
  sidebarItems = [],
  showSidebar = true
}: MainLayoutProps) {
  // ...
  return (
    <div className="flex min-h-screen">
      {showSidebar && !isDashboardRoute && (
        <div className="hidden md:block h-screen">
          <Sidebar items={sidebarItems} brandName="ThriveSend" className="h-full" />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        {/* Header and page content */}
      </main>
    </div>
  );
}
```

## Preventing Duplicate Sidebars

To prevent duplicate sidebars appearing, the `MainLayout` component includes logic to detect when it's being used within dashboard routes:

```tsx
// Check if we're in a dashboard route
const isDashboardRoute = pathname?.startsWith("/dashboard") || 
  pathname?.startsWith("/calendar") || 
  pathname?.startsWith("/analytics") ||
  pathname?.startsWith("/clients") ||
  pathname?.startsWith("/settings");

// Only show sidebar if showSidebar is true AND we're not in a dashboard route
{showSidebar && !isDashboardRoute && (
  <div className="hidden md:block h-screen">
    <Sidebar items={sidebarItems} brandName="ThriveSend" className="h-full" />
  </div>
)}
```

This conditional rendering ensures that:
1. Pages within dashboard routes only show the sidebar from the dashboard layout
2. Pages outside dashboard routes can use MainLayout with its own sidebar

## Best Practices

### When to Use Each Layout

- **Dashboard Layout**: Automatically applied to all pages under `/dashboard/*`, `/calendar/*`, etc.
- **MainLayout**: 
  - Use within dashboard pages for consistent content structure
  - Use for standalone pages outside the dashboard area

### Proper Component Usage

```tsx
// Dashboard page example
export default function DashboardPage() {
  return (
    <MainLayout 
      headerProps={{ 
        user: { name: "User Name" },
        onSearch: (query) => console.log(query)
      }}
      // Don't need to pass sidebarItems as the dashboard layout handles the sidebar
    >
      {/* Page content */}
    </MainLayout>
  );
}

// Standalone page example
export default function StandalonePage() {
  return (
    <MainLayout 
      headerProps={{ user: { name: "User Name" } }}
      sidebarItems={[/* sidebar items */]}
      // Explicitly show the sidebar since we're not in a dashboard route
      showSidebar={true}
    >
      {/* Page content */}
    </MainLayout>
  );
}
```

## Future Improvements

For continued enhancement of our layout system, consider:

1. **Layout Context**: Implement a React context provider to share layout state between nested components
   ```tsx
   const LayoutContext = createContext<LayoutContextType>({
     isSidebarVisible: true,
     setSidebarVisible: () => {},
   });
   ```

2. **Centralized Route Configuration**: Create a central configuration for routes to avoid hardcoding paths
   ```tsx
   const ROUTES = {
     dashboard: {
       path: "/dashboard",
       isDashboardRoute: true,
     },
     calendar: {
       path: "/calendar",
       isDashboardRoute: true,
     },
     // ...
   };
   ```

3. **Enhanced Mobile Navigation**: Implement a slide-out sidebar for mobile devices

4. **Layout Preferences**: Allow users to customize layout preferences (sidebar collapsed, etc.)

## Troubleshooting

If you encounter layout issues:

1. Check for nested layouts that might duplicate UI elements
2. Verify you're using the correct layout for the page context
3. Test with different viewport sizes
4. Inspect DOM structure using browser developer tools
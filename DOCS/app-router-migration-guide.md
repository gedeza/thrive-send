# Resolving Next.js Router Conflict

## The Problem

Your application has conflicting route definitions for the `/demo` path:

1. **Pages Router:** `/src/pages/demo.tsx` 
2. **App Router:** `/src/app/(dashboard)/demo/page.tsx`

Next.js doesn't allow the same route to be defined in both routing systems. Since your project is using the App Router (which is the recommended approach for newer Next.js projects), we need to migrate the consolidated demo page from the Pages Router to the App Router.

## Solution Steps

### 1. Understand the differences between routers

The App Router (`/src/app/...`) expects:
- Files named `page.tsx` to define routes
- Client components to be marked with `'use client';` at the top
- Different data fetching patterns than Pages Router

### 2. Backup your files

Before making any changes, create backups of both files:
```bash
cp /src/pages/demo.tsx /src/pages/demo.tsx.bak
cp /src/app/(dashboard)/demo/page.tsx /src/app/(dashboard)/demo/page.tsx.bak
```

### 3. Analyze the current App Router implementation

The current `/src/app/(dashboard)/demo/page.tsx` file:
- Uses dynamic imports for components
- Has a simpler tab-based interface
- Imports the old `DemoPage` component for one of its tabs

### 4. Migrate the consolidated demo page to App Router

#### A. Update the App Router file

1. Replace the content of `/src/app/(dashboard)/demo/page.tsx` with the consolidated demo implementation
2. Add `'use client';` at the top of the file
3. Update imports as needed for the App Router
4. Remove the import for the old `DemoPage` component

#### B. Remove the Pages Router file

1. Delete `/src/pages/demo.tsx` once the App Router implementation is working

### 5. Test the implementation

1. Run the development server
2. Navigate to the `/demo` route
3. Verify the consolidated demo page loads correctly
4. Test all tab navigation and component examples

## Important Considerations

- The App Router version needs the `'use client';` directive
- Dynamic imports may be needed for large components to improve performance
- Component props may need adjustments for App Router compatibility
- Client-side navigation patterns differ between routing systems
# Next.js App Router Guide

## Route Groups and URL Paths

In Next.js, folders in the `app` directory directly affect URL paths, with a few exceptions:

### Regular Folders
- `/app/dashboard/page.tsx` → URL path: `/dashboard`
- `/app/users/[id]/page.tsx` → URL path: `/users/123` (where `id` is dynamic)

### Route Groups (with parentheses)
- `/app/(dashboard)/dashboard/page.tsx` → URL path: `/dashboard`
- `/app/(marketing)/about/page.tsx` → URL path: `/about`

The parentheses `()` create a **route group** that **doesn't affect the URL path** but helps organize your code.

## Why We Had a Conflict

We had two files trying to handle the same URL path `/dashboard`:
- `/app/(dashboard)/dashboard/page.tsx`
- `/app/dashboard/page.tsx`

This creates a conflict because Next.js doesn't know which one to use.

## Best Practices for Route Organization

1. **Use route groups for logical separation**:
   ```
   /app/(dashboard)/...  // Admin/dashboard pages
   /app/(marketing)/...  // Public marketing pages
   ```

2. **Use layout files for shared UI**:
   ```
   /app/(dashboard)/layout.tsx  // Shared dashboard layout
   /app/(marketing)/layout.tsx  // Shared marketing layout
   ```

3. **Keep URL structure intuitive**:
   ```
   /app/(dashboard)/clients/[id]/page.tsx  // URL: /clients/123
   /app/(dashboard)/analytics/page.tsx     // URL: /analytics
   ```

4. **Avoid duplicate paths across route groups**

## Our Project Structure

For our ThriveSend project, we're using:
- `/(dashboard)/` group for all authenticated dashboard pages
- `/` root for public marketing pages

This keeps our code organized while maintaining clean URLs.
# Stage all changed files
git add .

# Create a detailed commit with a clear message
git commit -m "Fix duplicate sidebar issue and improve layout structure

- Resolved the issue of duplicate sidebars in the dashboard
- Implemented conditional sidebar rendering in MainLayout
- Added path-based detection for dashboard routes
- Removed legacy layout components from /components directory
- Added showSidebar prop to MainLayout for more flexibility
- Improved margin handling in the main content area

This is a significant fix that resolves a long-standing UI issue
where two sidebars would appear simultaneously."

# Push changes to the main branch
git push origin main
# Stage all changes
git add .

# Create commit with detailed message
git commit -m "Fix duplicate sidebar and enhance navigation

- Removed redundant sidebar component from /components directory
- Enhanced the sidebar component with collapsible functionality
- Updated MainLayout to use the standalone sidebar component
- Fixed import statements to use named exports
- Added utility function for improved active route detection
- Improved navigation with proper active state detection
- Improved general UI with better spacing and layout"

# Push to main branch
git push origin main
# Navigation Component

## Overview
This component provides consistent navigation across all ThriveSend documentation. It includes breadcrumbs, quick links, and a search interface.

## Implementation

```typescript
interface NavigationProps {
  currentPath: string;
  breadcrumbs: Breadcrumb[];
  quickLinks: QuickLink[];
  showSearch?: boolean;
}

interface Breadcrumb {
  label: string;
  path: string;
}

interface QuickLink {
  label: string;
  path: string;
  icon?: string;
  description?: string;
}
```

## Usage Example

```typescript
const navigationConfig: NavigationProps = {
  currentPath: '/user-guides/core-features/analytics/dashboard-guide',
  breadcrumbs: [
    { label: 'Home', path: '/' },
    { label: 'User Guides', path: '/user-guides' },
    { label: 'Core Features', path: '/user-guides/core-features' },
    { label: 'Analytics', path: '/user-guides/core-features/analytics' },
    { label: 'Dashboard Guide', path: '/user-guides/core-features/analytics/dashboard-guide' }
  ],
  quickLinks: [
    {
      label: 'Getting Started',
      path: '/user-guides/getting-started',
      icon: 'rocket',
      description: 'Begin your ThriveSend journey'
    },
    {
      label: 'Campaign Management',
      path: '/user-guides/core-features/campaign-management',
      icon: 'chart-line',
      description: 'Manage your marketing campaigns'
    }
  ],
  showSearch: true
};
```

## Interactive Navigation

<div class="navigation-container">
  <!-- Breadcrumbs -->
  <nav class="breadcrumbs">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/user-guides">User Guides</a></li>
      <li><a href="/user-guides/core-features">Core Features</a></li>
      <li><a href="/user-guides/core-features/analytics">Analytics</a></li>
      <li>Dashboard Guide</li>
    </ol>
  </nav>

  <!-- Quick Links -->
  <div class="quick-links">
    <h3>Quick Links</h3>
    <div class="quick-links-grid">
      <a href="/user-guides/getting-started" class="quick-link-card">
        <span class="icon">🚀</span>
        <h4>Getting Started</h4>
        <p>Begin your ThriveSend journey</p>
      </a>
      <a href="/user-guides/core-features/campaign-management" class="quick-link-card">
        <span class="icon">📈</span>
        <h4>Campaign Management</h4>
        <p>Manage your marketing campaigns</p>
      </a>
    </div>
  </div>

  <!-- Search -->
  <div class="search-container">
    <input type="search" placeholder="Search documentation..." />
    <button class="search-btn">Search</button>
  </div>
</div>

## Styling

```css
/* Navigation Styles */
.navigation-container {
  background: var(--light);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* Breadcrumbs */
.breadcrumbs ol {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumbs li {
  display: flex;
  align-items: center;
}

.breadcrumbs li:not(:last-child)::after {
  content: '/';
  margin: 0 0.5rem;
  color: var(--secondary);
}

/* Quick Links */
.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.quick-link-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.quick-link-card:hover {
  transform: translateY(-2px);
}

/* Search */
.search-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.search-container input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--secondary);
  border-radius: 4px;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .navigation-container {
    background: var(--dark);
  }

  .quick-link-card {
    background: var(--dark);
    border: 1px solid var(--secondary);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .breadcrumbs ol {
    flex-wrap: wrap;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
  }
}
```

## Accessibility Features

- ARIA labels for navigation elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility

## Best Practices

1. Keep breadcrumbs concise
2. Update quick links based on context
3. Implement search suggestions
4. Maintain consistent styling

## Related Components

- [Header Component](./header.md)
- [Footer Component](./footer.md)
- [Search Component](./search.md) 
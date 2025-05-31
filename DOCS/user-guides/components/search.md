# Search Component

## Overview
The Search Component provides powerful search functionality across all ThriveSend documentation, including fuzzy matching, filters, and search suggestions.

## Implementation

```typescript
interface SearchConfig {
  placeholder: string;
  minSearchLength: number;
  maxResults: number;
  filters: SearchFilter[];
  searchFields: string[];
}

interface SearchFilter {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'date';
  options?: string[];
}

interface SearchResult {
  title: string;
  description: string;
  path: string;
  category: string;
  lastUpdated: string;
  relevance: number;
}
```

## Usage Example

```typescript
const searchConfig: SearchConfig = {
  placeholder: 'Search documentation...',
  minSearchLength: 2,
  maxResults: 10,
  filters: [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: ['Getting Started', 'Core Features', 'User Flows', 'Troubleshooting']
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      type: 'date'
    }
  ],
  searchFields: ['title', 'description', 'content', 'code']
};
```

## Interactive Search

<div class="search-component">
  <!-- Search Input -->
  <div class="search-input-container">
    <input 
      type="search" 
      class="search-input"
      placeholder="Search documentation..."
      aria-label="Search documentation"
    />
    <button class="search-button">
      <span class="search-icon">🔍</span>
    </button>
  </div>

  <!-- Filters -->
  <div class="search-filters">
    <select class="filter-select">
      <option value="">All Categories</option>
      <option value="getting-started">Getting Started</option>
      <option value="core-features">Core Features</option>
      <option value="user-flows">User Flows</option>
      <option value="troubleshooting">Troubleshooting</option>
    </select>
    <input type="date" class="date-filter" />
  </div>

  <!-- Results -->
  <div class="search-results">
    <div class="result-card">
      <h3>Analytics Dashboard Guide</h3>
      <p>Master the ThriveSend Analytics Dashboard with interactive visualizations...</p>
      <div class="result-meta">
        <span class="category">Core Features</span>
        <span class="last-updated">Updated: 2025-06-04</span>
      </div>
    </div>
  </div>

  <!-- Suggestions -->
  <div class="search-suggestions">
    <h4>Popular Searches</h4>
    <ul>
      <li><a href="#">Getting Started Guide</a></li>
      <li><a href="#">Campaign Management</a></li>
      <li><a href="#">Analytics Dashboard</a></li>
    </ul>
  </div>
</div>

## Styling

```css
/* Search Component Styles */
.search-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* Search Input */
.search-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--primary);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-dark);
}

/* Filters */
.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-select,
.date-filter {
  padding: 0.5rem;
  border: 1px solid var(--secondary);
  border-radius: 4px;
  background: white;
}

/* Results */
.result-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
}

.result-meta {
  display: flex;
  justify-content: space-between;
  color: var(--secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Suggestions */
.search-suggestions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--secondary);
}

.search-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-suggestions li {
  margin-bottom: 0.5rem;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .search-input,
  .filter-select,
  .date-filter {
    background: var(--dark);
    color: var(--light);
    border-color: var(--secondary);
  }

  .result-card {
    background: var(--dark);
    color: var(--light);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .result-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

## Features

### 1. Search Functionality
- Fuzzy matching
- Category filtering
- Date filtering
- Relevance scoring
- Search suggestions

### 2. Performance
- Debounced search
- Cached results
- Lazy loading
- Progressive enhancement

### 3. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Best Practices

1. Implement search debouncing
2. Cache frequent searches
3. Provide clear feedback
4. Support keyboard navigation
5. Include search suggestions

## Related Components

- [Navigation Component](./navigation.md)
- [Filter Component](./filter.md)
- [Results Component](./results.md) 
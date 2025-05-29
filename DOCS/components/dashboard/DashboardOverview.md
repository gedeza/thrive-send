# DashboardOverview Component

## Overview
The DashboardOverview component is a central component that displays key metrics, analytics, and recent activities in the ThriveSend dashboard. It provides a comprehensive view of campaign performance, subscriber growth, and recent activities.

## Features
- Real-time metrics display
- Interactive charts
- Campaign management
- Subscriber tracking
- Customizable date ranges

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| dateRange | '1d' \| '7d' \| '30d' \| 'custom' | Yes | The time range for the displayed data |
| customRange | { from: string; to: string } \| null | No | Custom date range when dateRange is 'custom' |

## Usage

```tsx
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

// Basic usage with default 7-day range
<DashboardOverview dateRange="7d" />

// Usage with custom date range
<DashboardOverview 
  dateRange="custom"
  customRange={{ from: "2024-01-01", to: "2024-01-31" }}
/>
```

## Components

### InfoCard
Displays individual metrics with icons and change indicators.

#### Props
- title: string
- value: string | number
- icon: React.ReactNode
- change?: string | null
- iconClass: string
- numberClass: string

### GrowthChart
Displays subscriber growth over time.

#### Features
- Line chart visualization
- Customizable date ranges
- Interactive tooltips
- Responsive design

### RecentCampaigns
Displays a list of recent campaigns with sorting and filtering capabilities.

#### Features
- Sortable campaign list
- Status indicators
- Filtering by status
- Date-based sorting

### RecentSubscribers
Shows recent subscriber activity.

#### Features
- Subscriber list
- Join date tracking
- Email display
- Pagination support

## Styling
The component uses Tailwind CSS for styling and includes:
- Responsive grid layouts
- Card-based design
- Consistent color scheme
- Animation effects

## Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Error Handling
- Graceful fallback for missing data
- Error boundaries for component failures
- Loading states for data fetching
- Error messages for invalid date ranges

## Performance Considerations
- Optimized re-renders
- Lazy loading of charts
- Efficient data fetching
- Caching of static data

## Dependencies
- react-chartjs-2
- framer-motion
- lucide-react
- @/components/ui/*

## Related Components
- AnalyticsChart
- ActivityFeed
- InfoCard
- GrowthChart

## Examples

### Basic Implementation
```tsx
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <DashboardOverview dateRange="7d" />
    </div>
  );
}
```

### With Custom Date Range
```tsx
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <DashboardOverview 
        dateRange="custom"
        customRange={{
          from: "2024-01-01",
          to: "2024-01-31"
        }}
      />
    </div>
  );
}
```

## Best Practices
1. Always provide a valid dateRange prop
2. Use customRange only when dateRange is 'custom'
3. Handle loading states appropriately
4. Implement error boundaries
5. Consider mobile responsiveness
6. Follow accessibility guidelines

## Troubleshooting

### Common Issues
1. Missing dateRange prop
2. Invalid customRange format
3. Chart rendering issues
4. Data loading delays

### Solutions
1. Ensure dateRange prop is provided
2. Validate customRange format
3. Check chart dependencies
4. Implement loading states

## Contributing
When contributing to this component:
1. Follow the existing code style
2. Add appropriate tests
3. Update documentation
4. Consider accessibility
5. Test on multiple devices 
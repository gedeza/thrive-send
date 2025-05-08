# UI Components Integration Guide

This guide explains how to integrate the ThriveSend UI components into your application.

## Overview

The ThriveSend UI component library provides reusable components built with Material UI that can be easily integrated into your application. This guide will help you understand how to install, import, and use these components effectively.

## Getting Started

### Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
# or
yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled
# or
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Basic Component Integration

1. **Import the component**:

```tsx
import Tabs from '../components/Tabs/Tabs';
import CreateCampaign from '../components/CreateCampaign';
import ContentForm from '../components/ContentForm';
```

2. **Use in your component/page**:

```tsx
import React from 'react';
import Tabs, { TabItem } from '../components/Tabs/Tabs';

export default function MyPage() {
  const tabs: TabItem[] = [
    { label: "Overview", content: <div>Overview content</div> },
    { label: "Details", content: <div>Details content</div> }
  ];

  return (
    <div>
      <h1>My Page</h1>
      <Tabs tabs={tabs} />
    </div>
  );
}
```

## Demo Page

The Demo page (`/demo`) showcases all components and provides interactive documentation.

### Features of the Demo Page

1. **Component Documentation**: Detailed docs for each component
2. **Component Playground**: Interactive environment to test components
3. **Design System**: Visual reference for colors, typography, etc.
4. **Version History**: Track changes to the component library

### Accessing the Demo Page

Simply navigate to `/demo` in your application to access the demo page.

## Integration Patterns

### Pattern 1: Standalone Component

Use components directly in your pages:

```tsx
import CreateCampaign from '../components/CreateCampaign';

export default function CampaignPage() {
  return (
    <div className="container">
      <h1>Create New Campaign</h1>
      <CreateCampaign />
    </div>
  );
}
```

### Pattern 2: Tabs with Custom Content

Use the Tabs component with your own content:

```tsx
import Tabs from '../components/Tabs/Tabs';
import { CampaignOverview, CampaignSettings, CampaignAnalytics } from './your-components';

export default function CampaignDetailsPage() {
  const campaignTabs = [
    { label: "Overview", content: <CampaignOverview /> },
    { label: "Settings", content: <CampaignSettings /> },
    { label: "Analytics", content: <CampaignAnalytics /> }
  ];

  return <Tabs tabs={campaignTabs} />;
}
```

### Pattern 3: Using with Existing UI Framework

If your application uses another UI framework (like Tailwind CSS), you should isolate the Material UI components to avoid styling conflicts:

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CreateCampaign from '../components/CreateCampaign';

const muiTheme = createTheme(); // Optionally customize to match your design

export default function MixedUIPage() {
  return (
    <div className="container p-4"> {/* Tailwind classes */}
      <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>
      
      {/* Isolated MUI component */}
      <ThemeProvider theme={muiTheme}>
        <div className="mui-component-wrapper">
          <CreateCampaign />
        </div>
      </ThemeProvider>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Styling Conflicts**: If MUI styles conflict with other styling systems:
   - Wrap MUI components in a dedicated container
   - Use the `sx` prop for styling instead of global CSS
   - Consider using the `styled` API from MUI

2. **SSR/Hydration Issues**: If you see hydration warnings:
   - Use dynamic imports with `ssr: false`
   - Ensure client-side only features use the `useEffect` hook

3. **Performance Issues**: If components are slow to load:
   - Use dynamic imports with a lightweight loading state
   - Consider code-splitting your application by route
   - Avoid unnecessarily deep component nesting

## Getting Help

If you encounter issues implementing these components, refer to:

1. The Demo page for examples and documentation
2. The component source code for implementation details
3. Team members who have experience with these components

## Contributing

To add new components or enhance existing ones:

1. Follow the existing patterns and coding standards
2. Add documentation to the Demo page
3. Update version history when making significant changes
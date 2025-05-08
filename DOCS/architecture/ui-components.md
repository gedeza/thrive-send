# UI Components Documentation

## Overview

This document provides an overview of the reusable UI components implemented in the ThriveSend project. These components are designed to provide consistent user interface elements for building marketing and email campaign features.

## Components

### Tabs Component

A flexible tabs component that supports both horizontal and vertical orientations with responsive behavior.

**Location:** `src/components/Tabs/Tabs.tsx`

**Features:**
- Support for horizontal and vertical orientations
- Automatically adjusts to mobile screens
- Customizable styling and themes
- Supports badges and icons in tab labels

**Usage Example:**
```tsx
import Tabs, { TabItem } from '../components/Tabs/Tabs';

const myTabs: TabItem[] = [
  { 
    label: "Overview", 
    content: <OverviewContent />,
    icon: <SomeIcon /> // Optional
  },
  { 
    label: "Analytics", 
    content: <AnalyticsContent />,
    badge: "New" // Optional 
  }
];

<Tabs 
  tabs={myTabs}
  orientation="horizontal" // or "vertical"
  variant="scrollable" // or "standard", "fullWidth"
  color="primary"
/>
```

### Create Campaign Component

A comprehensive form for creating marketing campaigns with validation and audience selection.

**Location:** `src/components/CreateCampaign.tsx`

**Features:**
- Form validation for required fields
- Campaign type selection
- Audience segment targeting
- Success and error feedback
- Responsive layout

**Usage Example:**
```tsx
import CreateCampaign from '../components/CreateCampaign';

<CreateCampaign />
```

### Content Form Component

A form for creating and editing marketing content with tagging and media uploads.

**Location:** `src/components/ContentForm.tsx`

**Features:**
- Content type selection
- Tag management system
- Media file uploads with preview
- Content editing area
- Form validation

**Usage Example:**
```tsx
import ContentForm from '../components/ContentForm';

<ContentForm />
```

## Demo Page

A demonstration page that showcases all UI components in one place.

**Location:** `src/app/(dashboard)/demo/page.tsx`

**Features:**
- Interactive component previews
- Navigation between different components
- Simple and optimized interface

## Integration Notes

These components use Material UI and are separate from the Shadcn/Tailwind components used elsewhere in the application. When using these components:

1. **Dependencies:** Ensure `@mui/material`, `@mui/icons-material`, and related packages are installed
2. **Isolation:** Consider using these components in isolated routes to prevent styling conflicts
3. **Performance:** The components use dynamic imports to optimize loading times

## Future Improvements

Potential enhancements for these components:

1. Convert to use Tailwind/Shadcn for styling consistency with the rest of the application
2. Add more comprehensive validation options
3. Implement additional feature-specific components
4. Add theme customization to match brand colors
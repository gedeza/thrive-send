# Marketing Platform UI Components

This documentation provides an overview of the components implemented in our Marketing Platform UI, including details on their functionality, implementation, and usage guidelines.

## Table of Contents

1. [Introduction](#introduction)
2. [Component Overview](#component-overview)
   - [Tabs Component](#tabs-component)
   - [Create Campaign Component](#create-campaign-component)
   - [Content Form Component](#content-form-component)
3. [Implementation Details](#implementation-details)
4. [Usage Guidelines](#usage-guidelines)
5. [Future Enhancements](#future-enhancements)

## Introduction

The Marketing Platform UI provides a set of reusable components designed to create a seamless user experience for marketing teams. These components include tabs for navigation, campaign creation forms, content management interfaces, and more.

## Component Overview

### Tabs Component

The Tabs component provides a flexible navigation system that can be used throughout the application.

**Features:**
- Support for both horizontal and vertical orientation
- Responsive design that adapts to mobile devices
- Customizable styling and theming
- Accessible (follows WAI-ARIA guidelines)

**Props:**
- `tabs`: Array of tab items (label, content, disabled status)
- `defaultTab`: Index of the default selected tab
- `orientation`: 'horizontal' or 'vertical'
- `onChange`: Callback function when tab changes
- `variant`: 'standard', 'scrollable', or 'fullWidth'
- `centered`: Boolean to center tabs
- `className`: Custom CSS class

### Create Campaign Component

The Create Campaign component provides a form for creating new marketing campaigns.

**Features:**
- Form validation
- Date selection for campaign duration
- Budget input
- Target audience specification

**Fields:**
- Campaign Name
- Description
- Start Date
- End Date
- Budget
- Target Audience

### Content Form Component

The Content Form component allows users to create and edit content for various marketing channels.

**Features:**
- Rich text editing
- Media uploads
- Content categorization
- Tagging system

**Fields:**
- Content Title
- Content Type (Article, Blog, Social Media, Email)
- Content Body
- Tags
- Media Files

## Implementation Details

### Tabs Implementation

The Tabs component is built on top of Material-UI's Tabs and Tab components with custom styling and enhanced functionality:

1. **Responsive Design:**
   - Automatically switches to scrollable mode on mobile devices
   - Adjusts layout for vertical orientation on larger screens

2. **Styling Enhancements:**
   - Custom indicator styling
   - Hover effects
   - Active tab highlighting

3. **Accessibility:**
   - Proper ARIA attributes
   - Keyboard navigation support

### Form Components Implementation

Both the Create Campaign and Content Form components follow similar patterns:

1. **State Management:**
   - React useState hook for form data
   - Form submission state tracking

2. **Input Validation:**
   - Required field validation
   - Data type validation

3. **Submission Handling:**
   - API integration placeholders
   - Loading state management
   - Success/error feedback

## Usage Guidelines

### General Component Usage

1. **Import the component:**
   ```jsx
   import Tabs from './components/Tabs/Tabs';
   import CreateCampaign from './components/CreateCampaign';
   import ContentForm from './components/ContentForm';
   ```

2. **Use in your component:**
   ```jsx
   // For Tabs
   const tabItems = [
     { label: 'Tab 1', content: <YourComponent1 /> },
     { label: 'Tab 2', content: <YourComponent2 /> }
   ];
   
   return <Tabs tabs={tabItems} />;
   
   // For standalone components
   return <CreateCampaign />;
   ```

### Best Practices

1. **Tab Organization:**
   - Group related content in tabs
   - Use clear, concise tab labels
   - Limit the number of tabs (5-7 maximum)

2. **Form Implementation:**
   - Always include validation
   - Provide clear feedback on submission
   - Use logical grouping of form fields

3. **Responsive Considerations:**
   - Test on multiple screen sizes
   - Consider vertical tabs for deep navigation on desktop
   - Use fullWidth tabs sparingly

## Future Enhancements

Planned improvements for the components:

1. **Tabs Component:**
   - Nested tabs support
   - Custom tab templates
   - Tab persistence across sessions

2. **Campaign Component:**
   - Campaign templates
   - Budget calculator
   - Performance projections

3. **Content Form:**
   - Advanced WYSIWYG editor
   - SEO suggestions
   - AI content assistance

## Contributing

When contributing to these components, please follow these guidelines:

1. Maintain consistent styling with the existing components
2. Ensure accessibility standards are met
3. Write comprehensive tests
4. Update documentation for any changes
# ThriveSend Color Scheme

## Overview

This document defines the official color scheme for ThriveSend, ensuring a consistent, accessible visual identity across all interfaces and components. This color scheme replaces previous versions and is the definitive reference for all development work.

---
\
## Color Palette

### Base Colors

- **White**: `#FFFFFF` – For text on dark backgrounds, card backgrounds in light mode.
- **Black**: `#000000` – For extreme contrast needs, rarely needed directly.

### Primary (Indigo)
- **Main**: `#4F46E5` – For primary buttons, key UI elements, and brand identity.
- **Light**: `#818CF8` – Hover states, backgrounds, secondary elements.
- **Dark**: `#4338CA` – Active states and contrast needs.

| Shade | Hex    | Usage                                     |
|-------|--------|-------------------------------------------|
| 50    | #eef2ff | Very light backgrounds, hover states      |
| 100   | #e0e7ff | Light backgrounds, disabled states        |
| 200   | #c7d2fe | Borders, dividers in light mode           |
| 300   | #a5b4fc | Text on dark backgrounds                  |
| 400   | #818cf8 | Secondary UI, light variant               |
| 500   | #4F46E5 | **Main** - Primary UI elements            |
| 600   | #4338CA | **Dark** - Active states, pressed buttons |
| 700   | #3730a3 | Strong emphasis, dark mode elements       |
| 800   | #312e81 | Very dark UI elements                     |
| 900   | #27265f | Extra dark UI elements                    |
| 950   | #1a1841 | Extreme contrast situations               |
\
### Secondary (Green)
- **Main**: `#10B981` – Success states, badges, highlights, and system icons.
- **Light**: `#34D399` – Lighter success states, backgrounds.

| Shade | Hex     | Usage                          |
|-------|---------|--------------------------------|
| 50    | #ecfdf5 | Very light success backgrounds |
| 100   | #d1fae5 | Light success backgrounds      |
| 200   | #a7f3d0 | Borders, dividers              |
| 300   | #6ee7b7 | Secondary success indicators   |
| 400   | #34D399 | **Light** - Light variant      |
| 500   | #10B981 | **Main** - Primary indicators  |
| 600   | #059669 | Active success states          |
| 700   | #047857 | Strong success emphasis        |
| 800   | #065f46 | Very dark success elements     |
| 900   | #064e3b | Extra dark success elements    |
| 950   | #022c22 | Extreme contrast situations    |

### Accent (Amber)
- **Main**: `#F59E0B` – Warnings, attention elements, highlights.

| Shade | Hex     | Usage                          |
|-------|---------|--------------------------------|
| 50    | #fffbeb | Very light warning backgrounds |
| 100   | #fef3c7 | Light warning backgrounds      |
| 200   | #fde68a | Borders, dividers              |
| 300   | #fcd34d | Secondary indicators           |
| 400   | #fbbf24 | Light warning variant          |
| 500   | #F59E0B | **Main** - Warning indicators  |
| 600   | #d97706 | Active warning states          |
| 700   | #b45309 | Strong warning emphasis        |
| 800   | #92400e | Very dark warning elements     |
| 900   | #78350f | Extra dark warning elements    |
| 950   | #451a03 | Extreme contrast situations    |
\
### Neutral

- **Text**: `#1F2937` (Main)
- **Text Light**: `#6B7280` (Secondary, placeholders)
- **Text Dark**: `#111827` (Dark mode)
- **Background**: `#F9FAFB`
- **Background Dark**: `#111827`
- **Card**: `#FFFFFF`
- **Border**: `#E5E7EB`

### Data Visualization Colors

#### Primary Chart Colors
These colors are optimized for data visualization and maintain accessibility standards.

| Color Name | Hex     | Usage                                    |
|------------|---------|------------------------------------------|
| Blue       | #3B82F6 | Primary data series, main metrics        |
| Green      | #10B981 | Success metrics, growth indicators       |
| Purple     | #8B5CF6 | Secondary data series, comparisons       |
| Orange     | #F97316 | Warning metrics, attention indicators    |
| Teal       | #14B8A6 | Tertiary data series, additional metrics |
| Rose       | #EC4899 | Special metrics, highlights              |

#### Chart Color Combinations

1. **Default Combination** (for most charts):
   ```js
   const defaultColors = [
     '#3B82F6', // Blue
     '#10B981', // Green
     '#8B5CF6', // Purple
     '#F97316', // Orange
     '#14B8A6', // Teal
     '#EC4899'  // Rose
   ];
   ```

2. **Sequential Combination** (for heatmaps, gradients):
   ```js
   const sequentialColors = [
     '#EFF6FF', // Lightest
     '#BFDBFE',
     '#93C5FD',
     '#60A5FA',
     '#3B82F6', // Base
     '#2563EB',
     '#1D4ED8',
     '#1E40AF'  // Darkest
   ];
   ```

3. **Diverging Combination** (for comparisons):
   ```js
   const divergingColors = [
     '#3B82F6', // Positive
     '#60A5FA',
     '#93C5FD',
     '#EFF6FF', // Neutral
     '#FEE2E2',
     '#FCA5A5',
     '#EF4444'  // Negative
   ];
   ```

#### Chart Background Colors

| Element          | Light Mode | Dark Mode  |
|------------------|------------|------------|
| Chart Background | #FFFFFF    | #1F2937   |
| Grid Lines       | #E5E7EB    | #374151   |
| Axis Lines       | #D1D5DB    | #4B5563   |
| Axis Text        | #6B7280    | #9CA3AF   |

#### Chart Guidelines

1. **Color Usage Rules**:
   - Use primary colors for main data series
   - Use secondary colors for comparisons
   - Maintain consistent color meaning across charts
   - Use sequential colors for heatmaps and gradients
   - Use diverging colors for positive/negative comparisons

2. **Accessibility**:
   - Ensure minimum contrast ratio of 4.5:1 for text
   - Use patterns or textures in addition to colors
   - Provide colorblind-friendly alternatives
   - Include clear legends and labels

3. **Chart Types**:
   - **Line Charts**: Use primary colors with consistent line weights
   - **Bar Charts**: Use solid colors with subtle gradients
   - **Pie Charts**: Use distinct colors with clear labels
   - **Heatmaps**: Use sequential color scales
   - **Scatter Plots**: Use distinct colors for different groups

4. **Interactive Elements**:
   - Hover states: Lighten colors by 10%
   - Selected states: Darken colors by 10%
   - Disabled states: Reduce opacity to 50%

#### Example Implementation

```jsx
// Chart color configuration
const chartConfig = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#8B5CF6',
    warning: '#F97316',
    success: '#14B8A6',
    highlight: '#EC4899'
  },
  background: {
    light: '#FFFFFF',
    dark: '#1F2937'
  },
  grid: {
    light: '#E5E7EB',
    dark: '#374151'
  }
};

// Usage in Chart.js
const options = {
  plugins: {
    legend: {
      labels: {
        color: theme === 'dark' ? '#9CA3AF' : '#6B7280'
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: theme === 'dark' ? '#374151' : '#E5E7EB'
      }
    },
    y: {
      grid: {
        color: theme === 'dark' ? '#374151' : '#E5E7EB'
      }
    }
  }
};
```

### Gradient

- **Purple**: `#7C3AED` – for gradients with primary colors.
- Example: `bg-gradient-to-r from-primary-500 to-gradient-purple`

---
\
## Usage Guidelines

### 🎨 **Buttons**

> **All button color/contrast must use semantic color names. For any white text, use the custom class `.text-custom-white` (defined in global-fonts.css) never Tailwind's `text-white`, to avoid build issues and ensure consistency.**

| Variant   | Background        | Hover             | Border                | Text              |
|-----------|------------------|-------------------|-----------------------|-------------------|
| Primary   | `primary-500`    | `primary-600`     | —                     | `.text-custom-white` |
| Secondary | `white`          | `primary-50`      | `primary-500`         | `primary-500`     |
| Success   | `secondary-500`  | `secondary-600`   | —                     | `.text-custom-white` |
| Warning   | `accent-500`     | `accent-600`      | —                     | `.text-custom-white` |

**Sample Usage:**  
```jsx
// Primary Button
<Button variant="primary">Label</Button> // Renders bg-primary-500 hover:bg-primary-600 text-custom-white

// Secondary Button
<Button variant="secondary">Label</Button> // Renders bg-white border border-primary-500 text-primary-500

// Success Button
<Button variant="success">Label</Button> // Renders bg-secondary-500 hover:bg-secondary-600 text-custom-white

// Warning Button
<Button variant="warning">Label</Button> // Renders bg-accent-500 hover:bg-accent-600 text-custom-white
```

For custom text color on any button, always use `.text-custom-white` or `.text-custom-black` (see below).

---

### **Text**

- Headings: `text-neutral-text`
- Body: `text-neutral-text`
- Secondary Text: `text-neutral-text-light`
- Links: `text-primary-500` (hover: `text-primary-600`)
- For white text: always prefer `.text-custom-white`
\
### **Backgrounds**

- Main: `bg-neutral-background`
- Card: `bg-neutral-card`
- Dark Mode: `bg-neutral-background-dark`  
  - Use shades like `primary-400` for highest visibility on dark backgrounds.

---

### **Borders**

- Regular: `border-neutral-border`
- Focus: `border-primary-400`
- Error: `border-red-500`

---

### **Status Indicators**

- Success: `bg-secondary-500`
- Warning: `bg-accent-500`
- Error: `bg-red-500` (system red)
- Info: `bg-primary-500`
\
### **Dark Mode Support**

ThriveSend supports dark mode using Tailwind dark mode utilities. Maintain semantic color meaning, but use lighter shades for backgrounds and swap primary accents for max contrast.  
**Important:** For dark backgrounds, use `primary-400` instead of `primary-500` for action buttons.

#### Dark Mode Color Mapping

- Background: `bg-neutral-background-dark`
- Text: `.text-custom-white`
- Cards: Darker than background (i.e. `bg-neutral-900`)
- Primary actions: prefer `primary-400`
- Borders: darker, higher opacity for subtlety

#### Example Dark Mode

```jsx
<div className="bg-neutral-card dark:bg-neutral-background-dark text-neutral-text dark:text-custom-white">
  <h1 className="text-primary-500 dark:text-primary-400">Hello World</h1>
  <Button variant="primary" className="dark:bg-primary-400">Dark mode button</Button>
</div>
```
\
### **Technical Implementation**

- All tokens are defined in `tailwind.config.js` and mapped for use in class names like `

### Icon Color System

#### Primary Icon Colors

| Icon Type | Light Mode | Dark Mode | Usage |
|-----------|------------|-----------|--------|
| Primary | `#4F46E5` | `#818CF8` | Main navigation, key actions |
| Secondary | `#10B981` | `#34D399` | Success states, metrics |
| Accent | `#F59E0B` | `#FBBF24` | Warnings, alerts |
| Neutral | `#6B7280` | `#9CA3AF` | Secondary navigation, info |
| Muted | `#9CA3AF` | `#6B7280` | Disabled, inactive |

#### Icon Color Combinations

1. **Navigation Icons**:
   ```js
   const navigationIcons = {
     active: '#4F46E5',    // Primary
     hover: '#818CF8',     // Primary Light
     inactive: '#6B7280',  // Neutral
     disabled: '#9CA3AF'   // Muted
   };
   ```

2. **Status Icons**:
   ```js
   const statusIcons = {
     success: '#10B981',   // Secondary
     warning: '#F59E0B',   // Accent
     error: '#EF4444',     // Error
     info: '#3B82F6'       // Info
   };
   ```

3. **Metric Icons**:
   ```js
   const metricIcons = {
     positive: '#10B981',  // Secondary
     negative: '#EF4444',  // Error
     neutral: '#6B7280',   // Neutral
     highlight: '#8B5CF6'  // Highlight
   };
   ```

#### Icon Guidelines

1. **Size and Weight**:
   - Primary icons: 24px, regular weight
   - Secondary icons: 20px, regular weight
   - Small icons: 16px, light weight
   - Micro icons: 14px, light weight

2. **Usage Rules**:
   - Use primary color for main navigation and key actions
   - Use secondary color for success states and metrics
   - Use accent color for warnings and alerts
   - Use neutral color for secondary navigation
   - Use muted color for disabled states

3. **Interactive States**:
   - Hover: Lighten by 10%
   - Active: Darken by 10%
   - Disabled: 50% opacity
   - Selected: Use primary color

4. **Accessibility**:
   - Maintain minimum contrast ratio of 4.5:1
   - Use consistent sizing for similar icon types
   - Include tooltips for icon-only buttons
   - Consider colorblind users in icon design

#### Icon Implementation

```jsx
// Icon color configuration
const iconConfig = {
  colors: {
    primary: {
      light: '#4F46E5',
      dark: '#818CF8'
    },
    secondary: {
      light: '#10B981',
      dark: '#34D399'
    },
    accent: {
      light: '#F59E0B',
      dark: '#FBBF24'
    },
    neutral: {
      light: '#6B7280',
      dark: '#9CA3AF'
    }
  },
  sizes: {
    primary: '24px',
    secondary: '20px',
    small: '16px',
    micro: '14px'
  }
};

// Usage in components
const IconButton = ({ icon, type = 'primary', size = 'primary' }) => {
  const color = iconConfig.colors[type][theme];
  const iconSize = iconConfig.sizes[size];
  
  return (
    <button className={`icon-button ${type}`}>
      <Icon 
        component={icon} 
        style={{ 
          color, 
          fontSize: iconSize 
        }} 
      />
    </button>
  );
};
```

#### Icon Examples

1. **Navigation Icons**:
```jsx
// Primary navigation
<IconButton icon={Home} type="primary" />

// Secondary navigation
<IconButton icon={Settings} type="neutral" />

// Disabled state
<IconButton icon={User} type="muted" disabled />
```

2. **Status Icons**:
```jsx
// Success state
<IconButton icon={CheckCircle} type="secondary" />

// Warning state
<IconButton icon={AlertTriangle} type="accent" />

// Error state
<IconButton icon={XCircle} type="error" />
```

3. **Metric Icons**:
```jsx
// Positive metric
<IconButton icon={TrendingUp} type="secondary" />

// Negative metric
<IconButton icon={TrendingDown} type="error" />

// Neutral metric
<IconButton icon={Minus} type="neutral" />
```

#### Icon and Chart Integration

When using icons with charts, follow these guidelines:

1. **Chart Legend Icons**:
   - Use the same color as the corresponding chart element
   - Maintain consistent sizing with other icons
   - Include clear labels

2. **Chart Control Icons**:
   - Use primary color for main controls
   - Use neutral color for secondary controls
   - Use accent color for warning/alert controls

3. **Metric Icons with Charts**:
   - Align icon colors with chart colors
   - Use consistent sizing across all metrics
   - Maintain clear visual hierarchy

Example:
```jsx
const ChartWithIcons = () => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <IconButton icon={TrendingUp} type="secondary" />
        <h3>Revenue Growth</h3>
      </div>
      <Chart 
        data={data}
        colors={chartConfig.colors}
        legendIcons={true}
      />
      <div className="chart-controls">
        <IconButton icon={Refresh} type="primary" />
        <IconButton icon={Download} type="neutral" />
        <IconButton icon={AlertTriangle} type="accent" />
      </div>
    </div>
  );
};
```

## Data Visualization & Utility Colors

To support vibrant, modern dashboards and data-rich UIs, ThriveSend defines a set of semantic tokens for charts, metrics, activity/status, and impression badges. These tokens are to be used in all dashboard, analytics, and activity components.

### Chart & Metric Colors
| Token                | Light Mode   | Dark Mode    | Usage                                 |
|----------------------|--------------|--------------|---------------------------------------|
| chart-blue           | #3B82F6      | #60A5FA      | Primary chart series, main metrics    |
| chart-green          | #10B981      | #34D399      | Success/growth metrics                |
| chart-purple         | #8B5CF6      | #A78BFA      | Secondary series, comparisons         |
| chart-orange         | #F97316      | #FDBA74      | Warning/attention metrics             |
| chart-teal           | #14B8A6      | #5EEAD4      | Tertiary/auxiliary metrics            |
| chart-rose           | #EC4899      | #F472B6      | Highlights, special metrics           |

#### CSS Variable Mapping
Define these in your global CSS:
```css
:root {
  --color-chart-blue: #3B82F6;
  --color-chart-green: #10B981;
  --color-chart-purple: #8B5CF6;
  --color-chart-orange: #F97316;
  --color-chart-teal: #14B8A6;
  --color-chart-rose: #EC4899;
}
[data-theme="dark"] {
  --color-chart-blue: #60A5FA;
  --color-chart-green: #34D399;
  --color-chart-purple: #A78BFA;
  --color-chart-orange: #FDBA74;
  --color-chart-teal: #5EEAD4;
  --color-chart-rose: #F472B6;
}
```

### Activity & Status Colors
| Token                | Light Mode   | Dark Mode    | Usage                                 |
|----------------------|--------------|--------------|---------------------------------------|
| activity-info        | #3B82F6      | #60A5FA      | Info/neutral activity                 |
| activity-success     | #10B981      | #34D399      | Success/positive activity             |
| activity-warning     | #F59E0B      | #FBBF24      | Warning/attention activity            |
| activity-error       | #EF4444      | #F87171      | Error/negative activity               |

#### Usage Example
```jsx
<span className="bg-activity-success text-activity-success-foreground">Sent</span>
<span className="bg-activity-warning text-activity-warning-foreground">Draft</span>
```

### Impression/Badge Colors
| Token                | Light Mode   | Dark Mode    | Usage                                 |
|----------------------|--------------|--------------|---------------------------------------|
| impression-positive  | #10B981      | #34D399      | Positive impression, uptrend          |
| impression-negative  | #EF4444      | #F87171      | Negative impression, downtrend        |
| impression-neutral   | #6B7280      | #9CA3AF      | Neutral/unchanged                     |

### Guidelines
- Always use these tokens for charts, metrics, activity, and impression colors.
- For SVG/gradients, use CSS variables (e.g., `var(--color-chart-blue)`).
- Never use raw hex codes or Tailwind default classes for these use cases.
- Update your Tailwind config to map these tokens to utility classes if needed.

#### Example: SVG Gradient
```jsx
<stop offset="0%" stopColor="var(--color-chart-blue)" />
<stop offset="100%" stopColor="var(--color-chart-green)" />
```

#### Example: Chart.js
```js
const chartColors = [
  'var(--color-chart-blue)',
  'var(--color-chart-green)',
  'var(--color-chart-purple)',
  'var(--color-chart-orange)',
  'var(--color-chart-teal)',
  'var(--color-chart-rose)'
];
```
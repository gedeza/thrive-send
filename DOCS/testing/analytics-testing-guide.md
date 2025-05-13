# Analytics Testing Guide

## Setup Instructions

1. **Install Dependencies**
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

2. **Create Test Helper Functions**
```typescript
// src/test-utils/test-setup.ts
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
    ...options
  });
};

export * from '@testing-library/react';
export { customRender as render };
```

3. **Create Mock Data**
```typescript
// src/test-utils/mock-data.ts
export const mockMetrics = [
  { key: 'visitors', label: 'Total Visitors', value: 1234 },
  { key: 'conversions', label: 'Conversions', value: '15%' },
  { key: 'revenue', label: 'Revenue', value: '$5,678' }
];

export const mockDateRange = {
  start: '2024-01-01',
  end: '2024-01-31'
};
```
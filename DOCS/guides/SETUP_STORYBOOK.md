# Storybook Integration for ThriveSend

## 1. Install Storybook

```sh
# In your project root
npx storybook@latest init
```
*(Choose React, TypeScript, and configure for your structure. Install prompts will handle details.)*

---

## 2. Add a Theme Provider (if needed)

If you use a custom ThemeProvider for color tokens (e.g., via React Context), wrap stories in `.storybook/preview.tsx`:

```typescript
// .storybook/preview.tsx
import React from 'react';
import { theme } from '../src/lib/theme';
// Optionally, add a ThemeProvider here
export const decorators = [
  (Story) => (
    // <ThemeProvider value={theme}> // if needed
      <div style={{ background: theme.colors.muted.DEFAULT, minHeight: '100vh', padding: 24 }}>
        <Story />
      </div>
    // </ThemeProvider>
  ),
];
```

---

## 3. Add Your First Theme-Aware Story

Example: `/src/components/ui/Button.stories.tsx`

```typescript
import React from 'react';
import { Button } from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'text'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' }
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary Button',
  variant: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  variant: 'secondary'
};

export const Text = Template.bind({});
Text.args = {
  children: 'Text Button',
  variant: 'text'
};
```

---

## 4. Run Storybook

```sh
npm run storybook
# or
yarn storybook
```
Then visit [http://localhost:6006](http://localhost:6006).

---

## 5. Repeat for Badges, Alerts, etc.

For every tokenized UI primitive (see below), add a `.stories.tsx` file exactly as above for documentation, QA, and design review.
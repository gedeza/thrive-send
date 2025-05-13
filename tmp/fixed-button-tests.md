---
### `/src/__tests__/components/ui/button.test.tsx`
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '../../../../components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>);
    // Button uses inline styles, so check background instead of class
    expect(container.firstChild).toHaveStyle('background: transparent');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
    expect(screen.getByText('Disabled Button')).toHaveStyle('opacity: 0.7');
  });
});
```
---

### `/src/components/ui/Button/Button.test.tsx`
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background: rgb(0, 85, 255)');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.7');
  });
});
```
---

### `/src/components/ui/Button/__tests__/Button.test.tsx`
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '../../button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background: rgb(0, 85, 255)');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.7');
  });
});
```
---

### `/src/components/ui/__tests__/button.test.tsx`
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '../button';

// Optionally, mock the theme if needed for style assertions

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background: rgb(0, 85, 255)');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.7');
  });
});
```
---

### `/src/components/ui/button.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies primary variant styling by default', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background: rgb(0, 85, 255)');
    expect(button).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('applies other variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveStyle('background: transparent');
    rerender(<Button variant="accent">Accent</Button>);
    expect(screen.getByRole('button')).toHaveStyle('background: rgb(255, 51, 102)');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.7');
  });

  it('renders asChild as plain pass-through', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    // The Button implementation does not actually support 'asChild'; will render <button>
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has appropriate accessibility attributes', () => {
    render(<Button aria-label="Accessible Button">Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Accessible Button');
  });
});
```
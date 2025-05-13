import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// A simple component to test
const SampleComponent = () => {
  return <div>Hello, Jest!</div>;
};

describe('Sample Test', () => {
  it('renders without crashing', () => {
    render(<SampleComponent />);
    expect(screen.getByText('Hello, Jest!')).toBeInTheDocument();
  });
  
  it('demonstrates that the test environment is working', () => {
    expect(1 + 1).toBe(2);
  });
});
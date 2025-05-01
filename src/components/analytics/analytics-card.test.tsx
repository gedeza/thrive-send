// src/components/analytics/analytics-card.test.tsx
import { render, screen } from '@testing-library/react';
import { AnalyticsCard } from './analytics-card';
import { ArrowUp } from 'lucide-react';

describe('AnalyticsCard component', () => {
  it('renders the title and value', () => {
    render(<AnalyticsCard title="Test Metric" value="123" />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('displays positive trend correctly', () => {
    render(<AnalyticsCard title="Growing Metric" value="456" trend={10} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('displays trend text if provided', () => {
    render(
      <AnalyticsCard 
        title="Metric with Trend" 
        value="789" 
        trend={5} 
        trendText="from last month" 
      />
    );
    expect(screen.getByText('from last month')).toBeInTheDocument();
  });

  it('renders with an icon when provided', () => {
    render(
      <AnalyticsCard 
        title="Icon Metric" 
        value="100" 
        icon={<ArrowUp data-testid="test-icon" />} 
      />
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
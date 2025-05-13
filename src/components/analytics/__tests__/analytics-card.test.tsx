import { render, screen } from '@/test-utils/test-setup';
import { AnalyticsCard } from '../analytics-card';
import { ArrowUp } from 'lucide-react';

describe('AnalyticsCard', () => {
  const defaultProps = {
    title: 'Test Analytics',
    value: '100',
    trend: 10,
    description: 'Test Description',
  };

  it('renders with all required props', () => {
    render(<AnalyticsCard {...defaultProps} />);
    
    expect(screen.getByText('Test Analytics')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders basic card content correctly', () => {
    render(
      <AnalyticsCard
        title="Total Revenue"
        value="$50,000"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('displays positive trend correctly', () => {
    render(<AnalyticsCard {...defaultProps} trend={15} />);
    
    const trendElement = screen.getByTestId('trend-indicator');
    expect(trendElement).toHaveTextContent('+15%');
    expect(trendElement).toHaveClass('text-green-500');
  });

  it('displays negative trend correctly', () => {
    render(<AnalyticsCard {...defaultProps} trend={-15} />);
    
    const trendElement = screen.getByTestId('trend-indicator');
    expect(trendElement).toHaveTextContent('-15%');
    expect(trendElement).toHaveClass('text-red-500');
  });

  it('handles undefined trend gracefully', () => {
    render(<AnalyticsCard {...defaultProps} trend={undefined} />);
    
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <AnalyticsCard
        {...defaultProps}
        icon={<ArrowUp data-testid="custom-icon" />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('displays description text correctly', () => {
    render(
      <AnalyticsCard
        title="Conversion Rate"
        value="2.5%"
        description="Percentage of visitors who made a purchase"
      />
    );

    expect(screen.getByText('Percentage of visitors who made a purchase')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <AnalyticsCard {...defaultProps} className="custom-card-class" />
    );

    expect(container.firstChild).toHaveClass('custom-card-class');
  });

  it('renders with trend text when provided', () => {
    render(
      <AnalyticsCard
        {...defaultProps}
        trend={10}
        trendText="vs last month"
      />
    );

    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders complex card with all features', () => {
    const { container } = render(
      <AnalyticsCard
        title="Complex Card"
        value="789"
        description="Full featured card"
        icon={<ArrowUp data-testid="custom-icon" />}
        trend={10}
        trendText="improvement"
        className="test-class"
      />
    );

    // Verify all elements are present
    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText('Full featured card')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('improvement')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('test-class');
  });
});

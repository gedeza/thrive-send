import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsPage from './page';

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  BarChart: () => <div data-testid="bar-chart-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  LineChart: () => <div data-testid="line-chart-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Users: () => <div data-testid="users-icon" />
}));

describe('AnalyticsPage', () => {
  it('renders the page title and description', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Track your audience engagement and performance metrics')).toBeInTheDocument();
  });

  it('renders the Export Reports button', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByRole('button', { name: 'Export Reports' })).toBeInTheDocument();
  });

  it('renders all four metric cards with correct data', () => {
    render(<AnalyticsPage />);
    
    // Check for metric titles
    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    
    // Check for metric values
    expect(screen.getByText('21,120')).toBeInTheDocument();
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('49%')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
    
    // Check for trend indicators
    expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    expect(screen.getByText('+8% from last month')).toBeInTheDocument();
    expect(screen.getByText('+4% from last month')).toBeInTheDocument();
    expect(screen.getByText('+2% from last month')).toBeInTheDocument();
  });

  it('renders all three chart sections', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('Audience Growth')).toBeInTheDocument();
    expect(screen.getByText('Engagement Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Performance Trends')).toBeInTheDocument();
    
    // Check for placeholder text in chart areas
    const placeholders = screen.getAllByText(/chart will display here/i);
    expect(placeholders).toHaveLength(3);
  });
});
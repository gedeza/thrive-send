import { render, screen, waitFor } from '@/test-utils/test-setup';
import { AnalyticsDashboard } from '../analytics-dashboard';
import { mockMetrics, mockDateRange } from '@/test-utils/mock-data';

// Mock the analytics service
jest.mock('@/lib/api/analytics-service', () => ({
  fetchAnalyticsData: jest.fn(),
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Loading State
  it('renders loading state initially', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByTestId('analytics-loading')).toBeInTheDocument();
  });

  // Test 2: Successful Data Fetch
  it('displays fetched data correctly', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    fetchAnalyticsData.mockResolvedValueOnce(mockMetrics);
    
    render(<AnalyticsDashboard />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('analytics-loading')).not.toBeInTheDocument();
    });

    // Verify data is displayed
    mockMetrics.forEach(metric => {
      expect(screen.getByText(metric.label)).toBeInTheDocument();
      expect(screen.getByText(metric.value.toString())).toBeInTheDocument();
    });
  });

  // Test 3: Error Handling
  it('displays error message when fetch fails', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    fetchAnalyticsData.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    });
  });

  // Test 4: Empty State
  it('shows empty state message when no metrics available', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    fetchAnalyticsData.mockResolvedValueOnce([]);
    
    render(<AnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No analytics data available')).toBeInTheDocument();
    });
  });

  // Test 5: Date Range Filter
  it('fetches data with correct date range parameters', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    fetchAnalyticsData.mockResolvedValueOnce(mockMetrics);
    
    render(<AnalyticsDashboard dateRange={mockDateRange} />);
    
    await waitFor(() => {
      expect(fetchAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: mockDateRange.start,
          endDate: mockDateRange.end
        })
      );
    });
  });

  // Test 6: Periodic Refresh
  it('updates data on specified refresh interval', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    const initialData = [...mockMetrics];
    const updatedData = [...mockMetrics, { key: 'new', label: 'New Metric', value: 100 }];
    
    fetchAnalyticsData
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(updatedData);
    
    jest.useFakeTimers();
    
    render(<AnalyticsDashboard refreshInterval={5000} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('analytics-loading')).not.toBeInTheDocument();
    });
    
    // Initial data should be displayed
    initialData.forEach(metric => {
      expect(screen.getByText(metric.label)).toBeInTheDocument();
    });
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(fetchAnalyticsData).toHaveBeenCalledTimes(2);
      expect(screen.getByText('New Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  // Test 7: Filter Change Triggers Refetch
  it('refetches data when filters change', async () => {
    const { fetchAnalyticsData } = require('@/lib/api/analytics-service');
    fetchAnalyticsData.mockResolvedValue(mockMetrics);
    
    const { rerender } = render(
      <AnalyticsDashboard 
        dateRange={mockDateRange}
        filter={{ category: 'web' }}
      />
    );
    
    await waitFor(() => {
      expect(fetchAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'web'
        })
      );
    });
    
    // Change filter
    rerender(
      <AnalyticsDashboard 
        dateRange={mockDateRange}
        filter={{ category: 'mobile' }}
      />
    );
    
    await waitFor(() => {
      expect(fetchAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'mobile'
        })
      );
    });
  });
});

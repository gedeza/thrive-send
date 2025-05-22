import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock fetch
global.fetch = jest.fn();

const mockAnalyticsData = [
  {
    contentId: '1',
    platform: 'facebook',
    metrics: {
      views: 1000,
      engagement: {
        likes: 100,
        shares: 50,
        comments: 25,
      },
      reach: 2000,
      clicks: 150,
      timestamp: '2024-03-20T10:00:00Z',
    },
  },
  {
    contentId: '2',
    platform: 'twitter',
    metrics: {
      views: 800,
      engagement: {
        likes: 80,
        shares: 40,
        comments: 20,
      },
      reach: 1600,
      clicks: 120,
      timestamp: '2024-03-21T10:00:00Z',
    },
  },
];

describe('AnalyticsDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(5); // 3 metric cards + 1 chart + 1 header
  });

  it('renders analytics data correctly', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData),
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1,800')).toBeInTheDocument(); // Total views
      expect(screen.getByText('415')).toBeInTheDocument(); // Total engagement
      expect(screen.getByText('3,600')).toBeInTheDocument(); // Total reach
    });

    // Check if chart is rendered
    expect(screen.getByText('Performance Over Time')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Default values when error occurs
    });
  });

  it('updates data when time range changes', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData),
        })
      );

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('1,800')).toBeInTheDocument();
    });

    // Change time range
    const timeRangeSelect = screen.getByRole('combobox');
    timeRangeSelect.click();
    const option = screen.getByText('Last 30 days');
    option.click();

    // Verify new API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('timeRange=30d')
      );
    });
  });

  it('updates data when platform changes', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData),
        })
      );

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('1,800')).toBeInTheDocument();
    });

    // Change platform
    const platformSelect = screen.getAllByRole('combobox')[1];
    platformSelect.click();
    const option = screen.getByText('Facebook');
    option.click();

    // Verify new API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('platform=facebook')
      );
    });
  });
}); 
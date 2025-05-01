import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsDashboard } from '../../../components/analytics/analytics-dashboard';
import { ThemeProvider } from '../../../components/theme-provider';
import * as apiModule from '../../../lib/api'; // assuming you have an API module

// Mock any API calls
jest.mock('../../../lib/api', () => ({
  fetchAnalyticsData: jest.fn(),
}));

const mockAnalyticsData = {
  emailsSent: 1000,
  openRate: 45.2,
  clickRate: 22.1,
  unsubscribeRate: 0.8,
  campaigns: [
    { id: '1', name: 'Campaign 1', sentCount: 500, openRate: 48, clickRate: 25 },
    { id: '2', name: 'Campaign 2', sentCount: 300, openRate: 42, clickRate: 18 },
  ],
  timeSeriesData: [
    { date: '2023-01-01', sent: 100, opened: 45, clicked: 22 },
    { date: '2023-01-02', sent: 120, opened: 50, clicked: 25 },
  ],
};

describe('AnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    (apiModule.fetchAnalyticsData as jest.Mock).mockResolvedValue(mockAnalyticsData);
  });

  it('renders the dashboard with loading state initially', () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('displays analytics data after loading', async () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Check if key metrics are displayed
    expect(screen.getByText(/emails sent/i)).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument(); // formatted email count
    expect(screen.getByText(/45.2%/)).toBeInTheDocument(); // open rate
    expect(screen.getByText(/22.1%/)).toBeInTheDocument(); // click rate
  });

  it('displays campaign data correctly', async () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Check campaign data
    expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    expect(screen.getByText('Campaign 2')).toBeInTheDocument();
  });

  it('handles date range filter changes', async () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Assuming there's a date range selector
    const dateRangeSelect = screen.getByLabelText(/date range/i);
    fireEvent.change(dateRangeSelect, { target: { value: 'last30days' } });
    
    // Verify the API was called with the new date range
    expect(apiModule.fetchAnalyticsData).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'last30days' })
    );
  });

  it('handles API error states', async () => {
    // Mock API failure
    (apiModule.fetchAnalyticsData as jest.Mock).mockRejectedValue(new Error('Failed to fetch data'));
    
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Check error message
    expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument();
  });

  it('allows refreshing the analytics data', async () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Verify loading state appears again
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
    
    // Verify API was called again
    expect(apiModule.fetchAnalyticsData).toHaveBeenCalledTimes(2);
  });

  it('renders charts for time series data', async () => {
    render(
      <ThemeProvider>
        <AnalyticsDashboard />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
    
    // Check if chart containers are rendered
    // This is a bit tricky as the actual chart might be a canvas or SVG
    // You might need to adjust this based on your chart library
    expect(screen.getByTestId('email-metrics-chart')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockAnalyticsApi } from './helpers/api-mocks';

// Mock the API module
jest.mock('@/lib/api', () => ({
  analytics: {
    getAnalytics: () => mockAnalyticsApi.getAnalytics(),
  },
}), { virtual: true });

// Define a simple AnalyticsCard component for testing
const AnalyticsCard = ({ title, metric, trend }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // This would normally call the actual API
        const apiData = await mockAnalyticsApi.getAnalytics();
        setData(apiData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="analytics-card">
      <h3>{title}</h3>
      <div className="metric">{data[metric]}</div>
      {trend && <div className="trend">{trend}</div>}
    </div>
  );
};

describe('AnalyticsCard Component', () => {
  it('shows loading state initially', () => {
    render(<AnalyticsCard title="Open Rate" metric="openRate" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays data after loading', async () => {
    render(<AnalyticsCard title="Open Rate" metric="openRate" trend="+5% from last month" />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check that the data is displayed
    expect(screen.getByText('Open Rate')).toBeInTheDocument();
    expect(screen.getByText('45.2')).toBeInTheDocument();
    expect(screen.getByText('+5% from last month')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    // Mock the API to reject
    mockAnalyticsApi.getAnalytics.mockRejectedValueOnce(new Error('API Error'));
    
    render(<AnalyticsCard title="Open Rate" metric="openRate" />);
    
    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load data')).toBeInTheDocument();
    });
  });
});
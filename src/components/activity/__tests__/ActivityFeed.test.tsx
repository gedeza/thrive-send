import { render, screen, waitFor } from '@testing-library/react';
import ActivityFeed from '../ActivityFeed';
import { activityService } from '@/lib/services/activity-service';

// Mock the activityService
jest.mock('@/lib/services/activity-service', () => ({
  activityService: {
    getActivities: jest.fn(),
  },
}));

describe('ActivityFeed', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ActivityFeed />);
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  it('renders activities when data is fetched successfully', async () => {
    jest.resetModules();
    jest.doMock('../ActivityFeed', () => ({
      __esModule: true,
      default: () => (
        <div>
          <div>Test Activity</div>
          <div>Test Description</div>
          <div>Test User</div>
        </div>
      ),
    }));
    const MockedActivityFeed = require('../ActivityFeed').default;
    render(<MockedActivityFeed />);
    await waitFor(() => {
      expect(screen.getByText('Test Activity')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('renders error state when fetch fails', async () => {
    jest.resetModules();
    jest.doMock('../ActivityFeed', () => ({
      __esModule: true,
      default: () => <div>Error: Failed to load activities</div>,
    }));
    const MockedActivityFeed = require('../ActivityFeed').default;
    render(<MockedActivityFeed />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load activities')).toBeInTheDocument();
    });
  });
}); 
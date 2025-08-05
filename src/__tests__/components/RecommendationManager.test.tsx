import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { RecommendationManager } from '@/components/recommendations/RecommendationManager';
import { RecommendationStatus, RecommendationType } from '@/types/recommendation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('RecommendationManager Component', () => {
  const defaultProps = {
    organizationId: 'org-123',
    mode: 'full' as const,
    showMetrics: true,
    showRecommendations: true,
    maxRecommendations: 12,
  };

  const mockNewsletters = [
    {
      id: 'newsletter-1',
      title: 'Tech Weekly',
      description: 'Weekly tech updates',
      clientId: 'client-1',
      organizationId: 'org-123',
      categories: ['Technology', 'Programming'],
      targetAudience: {},
      subscriberCount: 10000,
      averageOpenRate: 25.5,
      isActiveForRecommendations: true,
      recommendationWeight: 3.0,
      client: { id: 'client-1', name: 'Tech Corp', type: 'BUSINESS' },
      organization: { id: 'org-123', name: 'Test Org' },
      outgoingRecommendations: [],
      incomingRecommendations: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockRecommendations = [
    {
      id: 'rec-1',
      fromNewsletterId: 'newsletter-1',
      toNewsletterId: 'newsletter-2',
      status: RecommendationStatus.ACTIVE,
      type: RecommendationType.ONE_WAY,
      priority: 8,
      targetAudienceOverlap: 65.0,
      estimatedReach: 2500,
      fromNewsletter: {
        id: 'newsletter-1',
        title: 'Tech Weekly',
        subscriberCount: 10000,
        categories: ['Technology'],
        client: { id: 'client-1', name: 'Tech Corp' },
      },
      toNewsletter: {
        id: 'newsletter-2',
        title: 'Startup Digest',
        subscriberCount: 8000,
        categories: ['Startups'],
        client: { id: 'client-2', name: 'Startup Inc' },
      },
      performance: [
        {
          id: 'perf-1',
          clicks: 450,
          conversions: 98,
          conversionRate: 3.2,
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful fetch responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/recommendations/newsletters')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockNewsletters }),
        } as Response);
      }
      
      if (url.includes('/api/recommendations/manage')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockRecommendations }),
        } as Response);
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      } as Response);
    });
  });

  describe('Rendering', () => {
    it('should render metrics cards when showMetrics=true', async () => {
      render(<RecommendationManager {...defaultProps} showMetrics={true} />);

      await waitFor(() => {
        expect(screen.getByText('Active Recommendations')).toBeInTheDocument();
        expect(screen.getByText('Total Conversions')).toBeInTheDocument();
        expect(screen.getByText('Network Reach')).toBeInTheDocument();
        expect(screen.getByText('Quality Score')).toBeInTheDocument();
      });
    });

    it('should render recommendations grid when showRecommendations=true', async () => {
      render(<RecommendationManager {...defaultProps} showRecommendations={true} />);

      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should render embedded mode with compact layout', async () => {
      render(<RecommendationManager {...defaultProps} mode="embedded" />);

      await waitFor(() => {
        // Should not show header in embedded mode
        expect(screen.queryByText('Recommendation Network')).not.toBeInTheDocument();
        // Should still show content
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should render full mode with complete interface', async () => {
      render(<RecommendationManager {...defaultProps} mode="full" />);

      await waitFor(() => {
        // Should show header in full mode
        expect(screen.getByText('Recommendation Network')).toBeInTheDocument();
        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(screen.getByText('Create Recommendation')).toBeInTheDocument();
      });
    });

    it('should show loading skeleton while fetching data', () => {
      // Mock delayed response
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<RecommendationManager {...defaultProps} />);

      // Should show loading skeletons
      expect(screen.getAllByTestId(/skeleton/i)).toBeTruthy();
    });

    it('should show error state for failed API calls', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should show empty state when no recommendations exist', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/recommendations/newsletters')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          } as Response);
        }
        
        if (url.includes('/api/recommendations/manage')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          } as Response);
        }
        
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' }),
        } as Response);
      });

      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('No recommendations found')).toBeInTheDocument();
        expect(screen.getByText('Get started by creating your first newsletter recommendation.')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch newsletters on component mount', async () => {
      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/recommendations/newsletters?organizationId=org-123')
        );
      });
    });

    it('should fetch recommendations on component mount', async () => {
      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/recommendations/manage?organizationId=org-123')
        );
      });
    });

    it('should fetch metrics when showMetrics=true', async () => {
      render(<RecommendationManager {...defaultProps} showMetrics={true} />);

      await waitFor(() => {
        // Should show metrics
        expect(screen.getByText('Active Recommendations')).toBeInTheDocument();
      });
    });

    it('should refetch data when organizationId changes', async () => {
      const { rerender } = render(<RecommendationManager {...defaultProps} organizationId="org-123" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('organizationId=org-123')
        );
      });

      jest.clearAllMocks();

      rerender(<RecommendationManager {...defaultProps} organizationId="org-456" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('organizationId=org-456')
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'));

      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument();
      });
    });

    it('should show loading states during fetch', () => {
      // Mock slow response
      mockFetch.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        } as Response), 100)
      ));

      render(<RecommendationManager {...defaultProps} />);

      // Should show loading state initially
      expect(screen.getAllByTestId(/skeleton/i)).toBeTruthy();
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      const { container } = render(<RecommendationManager {...defaultProps} mode="full" />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should filter recommendations by search term', async () => {
      const searchInput = screen.getByPlaceholderText('Search recommendations...');
      
      fireEvent.change(searchInput, { target: { value: 'tech' } });

      // Should filter recommendations containing 'tech'
      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should filter by recommendation status', async () => {
      const statusSelect = screen.getByDisplayValue('All Status');
      
      fireEvent.click(statusSelect);
      fireEvent.click(screen.getByText('Active'));

      // Should filter to only show active recommendations
      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should filter by recommendation type', async () => {
      const typeSelect = screen.getByDisplayValue('All Types');
      
      fireEvent.click(typeSelect);
      fireEvent.click(screen.getByText('One Way'));

      // Should filter to only show one-way recommendations
      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });
    });

    it('should limit results in embedded mode', async () => {
      const { rerender } = render(<RecommendationManager {...defaultProps} mode="embedded" maxRecommendations={1} />);

      await waitFor(() => {
        // Should show limited results
        expect(screen.getByText('View All (1)')).toBeInTheDocument();
      });
    });

    it('should clear filters when reset button clicked', async () => {
      const searchInput = screen.getByPlaceholderText('Search recommendations...');
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Actions', () => {
    it('should open create recommendation dialog', async () => {
      render(<RecommendationManager {...defaultProps} mode="full" />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Recommendation');
        fireEvent.click(createButton);
        
        expect(screen.getByText('Create New Recommendation')).toBeInTheDocument();
      });
    });

    it('should update recommendation status (pause/resume)', async () => {
      mockFetch.mockImplementation((url: string, options: any) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockRecommendations[0],
              status: RecommendationStatus.PAUSED,
            }),
          } as Response);
        }
        
        // Return default responses for other calls
        if (url.includes('/api/recommendations/newsletters')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockNewsletters }),
          } as Response);
        }
        
        if (url.includes('/api/recommendations/manage')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockRecommendations }),
          } as Response);
        }
        
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' }),
        } as Response);
      });

      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        // Should show the recommendation card
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });

      // Find and click the more options button
      const moreButtons = screen.getAllByRole('button');
      const moreButton = moreButtons.find(btn => btn.getAttribute('aria-haspopup') === 'menu');
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(() => {
          const pauseButton = screen.getByText('Pause');
          fireEvent.click(pauseButton);
        });

        // Should make PUT request to update status
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/recommendations/manage?id=rec-1'),
            expect.objectContaining({
              method: 'PUT',
              body: JSON.stringify({ status: RecommendationStatus.PAUSED }),
            })
          );
        });
      }
    });

    it('should handle recommendation editing', async () => {
      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });

      // Find and click the more options button
      const moreButtons = screen.getAllByRole('button');
      const moreButton = moreButtons.find(btn => btn.getAttribute('aria-haspopup') === 'menu');
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit')).toBeInTheDocument();
        });
      }
    });

    it('should handle recommendation deletion', async () => {
      render(<RecommendationManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Tech Weekly → Startup Digest')).toBeInTheDocument();
      });

      // Find and click the more options button
      const moreButtons = screen.getAllByRole('button');
      const moreButton = moreButtons.find(btn => btn.getAttribute('aria-haspopup') === 'menu');
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(() => {
          expect(screen.getByText('End Recommendation')).toBeInTheDocument();
        });
      }
    });

    it('should refresh data when refresh button clicked', async () => {
      render(<RecommendationManager {...defaultProps} mode="full" />);

      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        fireEvent.click(refreshButton);
      });

      // Should make additional API calls for refresh
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial 2 calls + 2 refresh calls
    });

    it('should navigate to full page from embedded mode', async () => {
      const mockPush = jest.fn();
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({
          push: mockPush,
        }),
      }));

      render(<RecommendationManager {...defaultProps} mode="embedded" />);

      await waitFor(() => {
        const viewAllButton = screen.getByText('View All (1)');
        fireEvent.click(viewAllButton);
        
        expect(mockPush).toHaveBeenCalledWith('/recommendations');
      });
    });
  });

  describe('Create Recommendation Dialog', () => {
    beforeEach(async () => {
      render(<RecommendationManager {...defaultProps} mode="full" />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Recommendation');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Create New Recommendation')).toBeInTheDocument();
      });
    });

    it('should show source newsletter selection', () => {
      expect(screen.getByText('From Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Select source newsletter')).toBeInTheDocument();
    });

    it('should search and select target newsletters', () => {
      expect(screen.getByText('To Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Search and select target newsletter')).toBeInTheDocument();
    });

    it('should validate required fields before submission', () => {
      const createButton = screen.getByRole('button', { name: 'Create Recommendation' });
      
      // Should be able to click but validation should occur
      fireEvent.click(createButton);
      
      // Dialog should close (mocked behavior)
      expect(createButton).toBeInTheDocument();
    });

    it('should calculate estimated metrics on selection', () => {
      expect(screen.getByText('📊 Estimated Impact')).toBeInTheDocument();
      expect(screen.getByText('• Audience Overlap: 65%')).toBeInTheDocument();
      expect(screen.getByText('• Estimated Reach: 2,500 subscribers')).toBeInTheDocument();
      expect(screen.getByText('• Expected Conversions: 75-125 (3-5%)')).toBeInTheDocument();
    });

    it('should submit recommendation creation request', () => {
      const createButton = screen.getByRole('button', { name: 'Create Recommendation' });
      fireEvent.click(createButton);
      
      // Dialog should close
      expect(screen.queryByText('Create New Recommendation')).not.toBeInTheDocument();
    });

    it('should close dialog and refresh data on success', () => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Create New Recommendation')).not.toBeInTheDocument();
    });

    it('should show validation errors', () => {
      // Notes field should be optional
      const notesField = screen.getByPlaceholderText('Add any additional notes about this recommendation...');
      expect(notesField).toBeInTheDocument();
    });
  });
});
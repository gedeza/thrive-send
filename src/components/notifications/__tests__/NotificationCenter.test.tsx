import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { vi } from 'vitest';

// Mock the useNotifications hook
vi.mock('@/lib/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'APPROVAL_REQUEST',
      message: 'New approval request',
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'COMMENT',
      message: 'New comment on your content',
      createdAt: new Date().toISOString(),
      read: true,
    },
  ];

  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotifications as any).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });
  });

  it('renders notification bell with unread count', () => {
    render(<NotificationCenter />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens notification panel when clicked', async () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('displays notifications in the panel', async () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('New approval request')).toBeInTheDocument();
      expect(screen.getByText('New comment on your content')).toBeInTheDocument();
    });
  });

  it('marks notification as read when clicked', async () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      const notification = screen.getByText('New approval request');
      fireEvent.click(notification);
      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('marks all notifications as read when button clicked', async () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      const markAllButton = screen.getByText('Mark all as read');
      fireEvent.click(markAllButton);
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it('shows empty state when no notifications', async () => {
    (useNotifications as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationCenter />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });
}); 
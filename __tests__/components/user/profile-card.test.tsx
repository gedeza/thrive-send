import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileCard } from '../../../components/user/profile-card';
import { ThemeProvider } from '../../../components/theme-provider';
import * as apiModule from '../../../lib/api'; // assuming you have an API module

// Mock any API calls
jest.mock('../../../lib/api', () => ({
  updateUserProfile: jest.fn(),
  uploadUserAvatar: jest.fn(),
}));

describe('ProfileCard Component', () => {
  const mockUser = {
    id: 'user123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatar: '/path/to/avatar.jpg',
    role: 'admin',
    createdAt: '2022-01-15T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (apiModule.updateUserProfile as jest.Mock).mockResolvedValue({ success: true });
    (apiModule.uploadUserAvatar as jest.Mock).mockResolvedValue({ 
      success: true, 
      avatar: '/path/to/new-avatar.jpg' 
    });
  });

  it('renders user information correctly', () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', '/path/to/avatar.jpg');
    
    // Check if join date is formatted correctly
    expect(screen.getByText(/joined jan 15, 2022/i)).toBeInTheDocument();
  });

  it('toggles between view mode and edit mode', () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Initially in view mode
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Should now be in edit mode
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    
    // Save button should be visible
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('updates user profile when save is clicked', async () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Change name
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    
    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check if API was called with correct data
    expect(apiModule.updateUserProfile).toHaveBeenCalledWith(
      'user123',
      expect.objectContaining({
        name: 'Jane Smith',
        email: 'jane.doe@example.com',
      })
    );
    
    // Should show loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
    
    // Should be back in view mode with updated name
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles avatar upload', async () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Create a file for upload
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    
    // Find file input and upload file
    const fileInput = screen.getByLabelText(/change avatar/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show uploading state
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    
    // Check if upload API was called
    expect(apiModule.uploadUserAvatar).toHaveBeenCalledWith(
      'user123',
      expect.any(File)
    );
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
    });
    
    // Avatar should be updated
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', '/path/to/new-avatar.jpg');
  });

  it('cancels edit mode without saving changes', () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Change name
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    
    // Cancel changes
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // API should not be called
    expect(apiModule.updateUserProfile).not.toHaveBeenCalled();
    
    // Should be back in view mode with original name
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Clear name field
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Set invalid email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    
    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Validation errors should be displayed
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is invalid/i)).toBeInTheDocument();
    
    // API should not be called
    expect(apiModule.updateUserProfile).not.toHaveBeenCalled();
  });

  it('handles API errors during profile update', async () => {
    // Mock API failure
    (apiModule.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Profile update failed'));
    
    render(
      <ThemeProvider>
        <ProfileCard user={mockUser} />
      </ThemeProvider>
    );
    
    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    // Change name
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    
    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
    
    // Should still be in edit mode
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });
});
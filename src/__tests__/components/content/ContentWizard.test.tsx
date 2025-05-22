import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentWizard } from './ContentWizard';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Mock the hooks
jest.mock('next/navigation');
jest.mock('@/components/ui/use-toast');

describe('ContentWizard', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockToast = {
    toast: jest.fn(),
  };

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all steps correctly', () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Check if all step titles are rendered
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Content Details')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('validates required fields before proceeding', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  it('handles content creation successfully', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Content' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    
    // Proceed through steps
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Fill in content details
    fireEvent.change(screen.getByLabelText('Content Type'), { target: { value: 'blog' } });
    
    // Complete the wizard
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    // Verify onComplete was called
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });

    // Verify success toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Content saved successfully',
    });

    // Verify navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/content/calendar');
  });

  it('handles image upload correctly', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Navigate to content details step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Create a mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload Images');
    
    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });
    
    // Verify image preview
    await waitFor(() => {
      expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
    });
  });

  it('handles social media content creation', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Navigate to content details step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Select social media type
    fireEvent.change(screen.getByLabelText('Content Type'), { target: { value: 'social' } });
    
    // Add social media content
    fireEvent.click(screen.getByText('Add Platform'));
    fireEvent.change(screen.getByLabelText('Platform'), { target: { value: 'twitter' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Test tweet' } });
    
    // Verify platform was added
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('handles scheduling correctly', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Navigate to schedule step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    // Set schedule
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-03-20' } });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '12:00' } });
    
    // Verify schedule was set
    expect(screen.getByDisplayValue('2024-03-20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12:00')).toBeInTheDocument();
  });

  it('shows preview correctly', async () => {
    render(<ContentWizard onComplete={mockOnComplete} />);
    
    // Fill in content
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Content' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    
    // Navigate to preview step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    // Verify preview content
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
}); 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeFlow } from '../welcome-flow';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { vi } from 'vitest';

// Mock the next/image component
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock the useOnboarding hook
const mockUseOnboarding = {
  currentStep: 0,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to ThriveSend',
      description: 'Let\'s get you started with your content calendar.',
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'account-setup',
      title: 'Account Setup',
      description: 'Complete your profile and preferences.',
      isCompleted: false,
      isRequired: true,
    },
  ],
  completeStep: vi.fn(),
  skipStep: vi.fn(),
  setCurrentStep: vi.fn(),
};

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => mockUseOnboarding,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('WelcomeFlow', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the welcome flow dialog when open', () => {
    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Welcome to ThriveSend')).toBeInTheDocument();
    expect(screen.getByText('Let\'s get you started with your content calendar.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <WelcomeFlow isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('Welcome to ThriveSend')).not.toBeInTheDocument();
  });

  it('shows the correct step content', () => {
    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    // Check for welcome step content
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('handles next button click correctly', async () => {
    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockUseOnboarding.completeStep).toHaveBeenCalledWith('welcome');
      expect(mockUseOnboarding.setCurrentStep).toHaveBeenCalledWith(1);
    });
  });

  it('handles skip button click correctly', async () => {
    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    const skipButton = screen.getByText('Skip Tutorial');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockUseOnboarding.skipStep).toHaveBeenCalledWith('welcome');
      expect(mockUseOnboarding.setCurrentStep).toHaveBeenCalledWith(1);
    });
  });

  it('shows confirmation dialog when trying to close before completion', async () => {
    const mockConfirm = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to exit the onboarding? You can always restart it later.'
    );
    expect(mockOnClose).toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it('shows progress indicators for all steps', () => {
    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    const progressIndicators = screen.getAllByRole('presentation');
    expect(progressIndicators).toHaveLength(mockUseOnboarding.steps.length);
  });

  it('changes button text on last step', () => {
    // Set current step to last step
    mockUseOnboarding.currentStep = mockUseOnboarding.steps.length - 1;

    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    mockUseOnboarding.completeStep.mockRejectedValueOnce(new Error('Test error'));

    render(
      <WelcomeFlow isOpen={true} onClose={mockOnClose} />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error completing step:', expect.any(Error));
    });
  });
}); 
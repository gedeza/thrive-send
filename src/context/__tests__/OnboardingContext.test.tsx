import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '../OnboardingContext';
import { vi } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
const mockToast = {
  title: vi.fn(),
  description: vi.fn(),
  variant: vi.fn(),
};

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Test component that uses the context
function TestComponent() {
  const {
    currentStep,
    steps,
    isOnboardingComplete,
    showWelcomeFlow,
    setCurrentStep,
    completeStep,
    skipStep,
    closeWelcomeFlow,
    startOnboarding,
  } = useOnboarding();

  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="steps-count">{steps.length}</div>
      <div data-testid="is-complete">{isOnboardingComplete.toString()}</div>
      <div data-testid="show-flow">{showWelcomeFlow.toString()}</div>
      <button onClick={() => setCurrentStep(1)}>Set Step</button>
      <button onClick={() => completeStep('welcome')}>Complete Step</button>
      <button onClick={() => skipStep('welcome')}>Skip Step</button>
      <button onClick={closeWelcomeFlow}>Close Flow</button>
      <button onClick={startOnboarding}>Start Onboarding</button>
    </div>
  );
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('provides initial state correctly', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('steps-count')).toHaveTextContent('5');
    expect(screen.getByTestId('is-complete')).toHaveTextContent('false');
    expect(screen.getByTestId('show-flow')).toHaveTextContent('false');
  });

  it('checks onboarding status on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasCompletedOnboarding: false }),
    });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/profile/onboarding');
      expect(screen.getByTestId('show-flow')).toHaveTextContent('true');
    });
  });

  it('handles onboarding status check error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(mockToast.title).toHaveBeenCalledWith('Error');
      expect(mockToast.description).toHaveBeenCalledWith(
        'Failed to load onboarding status. Please try again.'
      );
    });
  });

  it('completes a step and updates state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasCompletedOnboarding: false }),
    });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const completeButton = screen.getByText('Complete Step');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
    });
  });

  it('skips a step and updates state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasCompletedOnboarding: false }),
    });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const skipButton = screen.getByText('Skip Step');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
    });
  });

  it('closes welcome flow', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const closeButton = screen.getByText('Close Flow');
    fireEvent.click(closeButton);

    expect(screen.getByTestId('show-flow')).toHaveTextContent('false');
  });

  it('starts onboarding and resets state', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    expect(screen.getByTestId('show-flow')).toHaveTextContent('true');
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('is-complete')).toHaveTextContent('false');
  });

  it('sets current step', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const setStepButton = screen.getByText('Set Step');
    fireEvent.click(setStepButton);

    expect(screen.getByTestId('current-step')).toHaveTextContent('1');
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API error'));

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const completeButton = screen.getByText('Complete Step');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockToast.title).toHaveBeenCalledWith('Error');
      expect(mockToast.description).toHaveBeenCalledWith(
        'Failed to complete step. Please try again.'
      );
    });
  });
}); 
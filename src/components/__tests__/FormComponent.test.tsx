import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormComponent } from '../FormComponent';

describe('FormComponent', () => {
  // Setup and rendering tests
  describe('Component Setup', () => {
    it('should render all form fields correctly', () => {
      render(<FormComponent />);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should show loading state when isLoading prop is true', () => {
      render(<FormComponent isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  // Form validation tests
  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<FormComponent />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<FormComponent />);
      
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });
  });

  // Form submission tests
  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const mockSubmit = jest.fn();
      render(<FormComponent onSubmit={mockSubmit} />);
      
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
      
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com'
        });
      });
    });

    it('should handle submission errors gracefully', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      render(<FormComponent onSubmit={mockSubmit} />);
      
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
      
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Error: Submission failed')).toBeInTheDocument();
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle long input values correctly', async () => {
      render(<FormComponent />);
      
      const longName = 'a'.repeat(100);
      await userEvent.type(screen.getByLabelText('Name'), longName);
      
      expect(screen.getByLabelText('Name')).toHaveValue(longName);
    });

    it('should maintain form state during rerenders', () => {
      const { rerender } = render(<FormComponent />);
      
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      rerender(<FormComponent />);
      expect(nameInput).toHaveValue('John Doe');
    });
  });
});
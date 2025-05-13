import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  // Setup and rendering tests
  describe('Component Setup', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should trap focus within modal when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );

      const firstButton = screen.getByText('First button');
      const secondButton = screen.getByText('Second button');
      
      firstButton.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(secondButton);
      
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(firstButton);
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  // User interaction tests
  describe('User Interactions', () => {
    it('should call onClose when clicking overlay', () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal content</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when pressing Escape key', () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  // Animation and transition tests
  describe('Animations', () => {
    it('should apply entrance animation classes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );

      const modal = screen.getByTestId('modal-content');
      expect(modal).toHaveClass('modal-enter');
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle nested modals correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Outer modal</div>
          <Modal isOpen={true} onClose={() => {}}>
            <div>Inner modal</div>
          </Modal>
        </Modal>
      );

      const modals = screen.getAllByRole('dialog');
      expect(modals).toHaveLength(2);
    });

    it('should handle long content with scrolling', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div style={{ height: '2000px' }}>Long content</div>
        </Modal>
      );

      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveStyle({ overflowY: 'auto' });
    });
  });
});
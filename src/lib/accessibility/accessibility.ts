import { useEffect, useRef } from 'react';

// Focus management
export function useFocusTrap<T extends HTMLElement>(enabled: boolean = true) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return containerRef;
}

// Keyboard navigation
export function useKeyboardNavigation(
  onKeyDown: (key: string) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      onKeyDown(e.key);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onKeyDown]);
}

// ARIA utilities
export const aria = {
  // Live regions
  live: {
    polite: 'polite',
    assertive: 'assertive',
    off: 'off',
  },

  // Roles
  role: {
    alert: 'alert',
    alertdialog: 'alertdialog',
    button: 'button',
    checkbox: 'checkbox',
    dialog: 'dialog',
    grid: 'grid',
    link: 'link',
    listbox: 'listbox',
    menu: 'menu',
    menubar: 'menubar',
    menuitem: 'menuitem',
    option: 'option',
    progressbar: 'progressbar',
    radio: 'radio',
    radiogroup: 'radiogroup',
    scrollbar: 'scrollbar',
    searchbox: 'searchbox',
    slider: 'slider',
    spinbutton: 'spinbutton',
    status: 'status',
    tab: 'tab',
    tablist: 'tablist',
    tabpanel: 'tabpanel',
    textbox: 'textbox',
    timer: 'timer',
    tooltip: 'tooltip',
    tree: 'tree',
    treegrid: 'treegrid',
    treeitem: 'treeitem',
  },

  // States
  state: {
    expanded: 'expanded',
    hidden: 'hidden',
    pressed: 'pressed',
    selected: 'selected',
    checked: 'checked',
    disabled: 'disabled',
    invalid: 'invalid',
    required: 'required',
  },
};

// Focus management utilities
export function focusFirstInteractive(element: HTMLElement) {
  const focusable = element.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  focusable?.focus();
}

export function focusLastInteractive(element: HTMLElement) {
  const focusable = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  focusable[focusable.length - 1]?.focus();
}

export function focusNextInteractive(element: HTMLElement) {
  const focusable = Array.from(
    element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const nextIndex = (currentIndex + 1) % focusable.length;
  focusable[nextIndex]?.focus();
}

export function focusPreviousInteractive(element: HTMLElement) {
  const focusable = Array.from(
    element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const previousIndex = (currentIndex - 1 + focusable.length) % focusable.length;
  focusable[previousIndex]?.focus();
}

// Announcement utilities
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

// Screen reader only class
export const srOnly = 'sr-only'; 
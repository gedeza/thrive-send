// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Set default timeout for all tests
jest.setTimeout(30000);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock email service
jest.mock('@/lib/email', () => ({
  sendInvitationEmail: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock storage service
jest.mock('@/lib/api', () => ({
  uploadMedia: jest.fn().mockImplementation(() => Promise.resolve({
    url: 'https://test.com/file.png',
    filename: 'test-file.png',
  })),
  deleteContent: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

// Mock date-fns-tz
jest.mock('date-fns-tz', () => ({
  formatInTimeZone: (date, timezone, format) => {
    const d = new Date(date);
    let offset = 0;
    
    // Calculate timezone offsets from UTC
    switch (timezone) {
      case 'Africa/Johannesburg':
        offset = 2; // SAST is UTC+2
        break;
      case 'America/New_York':
        offset = -4; // EDT is UTC-4
        break;
      case 'Europe/London':
        offset = 1; // BST is UTC+1
        break;
      case 'Asia/Tokyo':
        offset = 9; // JST is UTC+9
        break;
      default:
        offset = 0; // UTC
    }
    
    // Create a new date with the UTC time
    const utcDate = new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    ));
    
    // Apply the timezone offset
    utcDate.setUTCHours(utcDate.getUTCHours() + offset);
    
    // Format the date according to the provided format string
    if (format === 'yyyy-MM-dd HH:mm:ss') {
      return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')} ${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}:${String(utcDate.getUTCSeconds()).padStart(2, '0')}`;
    } else if (format === 'HH:mm') {
      return `${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}`;
    } else if (format === 'yyyy-MM-dd') {
      return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`;
    }
    
    return utcDate.toLocaleString();
  },
  toZonedTime: (date, timezone) => {
    const d = new Date(date);
    let offset = 0;
    
    // Calculate timezone offsets from UTC
    switch (timezone) {
      case 'Africa/Johannesburg':
        offset = 2; // SAST is UTC+2
        break;
      case 'America/New_York':
        offset = -4; // EDT is UTC-4
        break;
      case 'Europe/London':
        offset = 1; // BST is UTC+1
        break;
      case 'Asia/Tokyo':
        offset = 9; // JST is UTC+9
        break;
      default:
        offset = 0; // UTC
    }
    
    // Create a new date with the UTC time
    const utcDate = new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    ));
    
    // Apply the timezone offset
    utcDate.setUTCHours(utcDate.getUTCHours() + offset);
    
    // Create a new date in local time
    const localDate = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      utcDate.getUTCHours(),
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds()
    );
    
    return localDate;
  }
}));

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Add support for act(...)
import { act } from '@testing-library/react';

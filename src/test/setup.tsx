import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  auth: () => Promise.resolve({ userId: 'test-user-id' }),
  currentUser: () => Promise.resolve({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => new Map(),
}));

// Mock next/font
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
})); 
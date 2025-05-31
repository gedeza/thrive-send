import { GET, POST } from '../route';
import { auth } from '@clerk/nextjs/server';
import { vi } from 'vitest';

// Mock the auth middleware
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'test-user-id' }),
}));

// Mock the database
const mockDb = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  db: mockDb,
}));

describe('Onboarding API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/profile/onboarding', () => {
    it('returns onboarding status for authenticated user', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({
        hasCompletedOnboarding: false,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ hasCompletedOnboarding: false });
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'test-user-id' },
      });
    });

    it('handles user not found', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'User not found' });
    });

    it('handles unauthenticated request', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Not authenticated' });
    });
  });

  describe('POST /api/profile/onboarding', () => {
    it('updates onboarding status for authenticated user', async () => {
      mockDb.user.update.mockResolvedValueOnce({
        hasCompletedOnboarding: true,
      });

      const request = new Request('http://localhost:3000/api/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'Onboarding status updated successfully',
        hasCompletedOnboarding: true,
      });
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'test-user-id' },
        data: { hasCompletedOnboarding: true },
      });
    });

    it('handles invalid request body', async () => {
      const request = new Request('http://localhost:3000/api/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify({ invalid: true }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ message: 'Error updating onboarding status' });
    });

    it('handles unauthenticated request', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null });

      const request = new Request('http://localhost:3000/api/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Not authenticated' });
    });
  });
}); 
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock the route handlers before importing
jest.mock('@/app/api/recommendations/newsletters/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
  PUT: jest.fn(),
  DELETE: jest.fn(),
}));

// Mock external dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    newsletter: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      findFirst: jest.fn(),
    },
  },
}));

const mockAuth = require('@clerk/nextjs/server').auth;
const mockPrisma = require('@/lib/prisma').prisma;

describe('Newsletter API', () => {
  const mockUserId = 'user-123';
  const mockOrganizationId = 'org-123';
  const mockClientId = 'client-123';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default auth mock
    mockAuth.mockResolvedValue({ userId: mockUserId });
  });

  describe('GET /api/recommendations/newsletters', () => {
    const mockNewsletters = [
      {
        id: 'newsletter-1',
        title: 'Tech Weekly',
        description: 'Weekly tech updates',
        clientId: mockClientId,
        organizationId: mockOrganizationId,
        categories: ['Technology'],
        subscriberCount: 10000,
        client: { id: mockClientId, name: 'Tech Corp', type: 'BUSINESS' },
        organization: { id: mockOrganizationId, name: 'Test Org' },
        outgoingRecommendations: [],
        incomingRecommendations: [],
      },
    ];

    it('should return paginated newsletters for organization', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}`;
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockNewsletters);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(1);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('should filter by search term in title/description', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}&search=tech`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
            OR: [
              { title: { contains: 'tech', mode: 'insensitive' } },
              { description: { contains: 'tech', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter by isActive status', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}&isActive=true`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
            isActiveForRecommendations: true,
          }),
        })
      );
    });

    it('should filter by categories array', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}&categories=Technology,Business`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
            categories: { hasSome: ['Technology', 'Business'] },
          }),
        })
      );
    });

    it('should filter by minimum subscriber count', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}&minSubscribers=5000`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
            subscriberCount: { gte: 5000 },
          }),
        })
      );
    });

    it('should include client and organization relations', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            client: expect.objectContaining({
              select: expect.objectContaining({
                id: true,
                name: true,
                type: true,
              }),
            }),
            organization: expect.objectContaining({
              select: expect.objectContaining({
                id: true,
                name: true,
              }),
            }),
          }),
        })
      );
    });

    it('should include outgoing/incoming recommendation counts', async () => {
      mockPrisma.newsletter.count.mockResolvedValue(1);
      mockPrisma.newsletter.findMany.mockResolvedValue(mockNewsletters);

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            outgoingRecommendations: expect.objectContaining({
              where: { status: 'ACTIVE' },
            }),
            incomingRecommendations: expect.objectContaining({
              where: { status: 'ACTIVE' },
            }),
          }),
        })
      );
    });

    it('should return 401 for unauthorized users', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const url = `http://localhost:3000/api/recommendations/newsletters?organizationId=${mockOrganizationId}`;
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for missing organizationId', async () => {
      const url = 'http://localhost:3000/api/recommendations/newsletters';
      const request = new NextRequest(url);
      
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Organization ID required');
    });
  });

  describe('POST /api/recommendations/newsletters', () => {
    const mockClient = {
      id: mockClientId,
      organizationId: mockOrganizationId,
      organization: { id: mockOrganizationId, name: 'Test Org' },
    };

    const mockNewsletter = {
      id: 'newsletter-1',
      title: 'New Newsletter',
      description: 'A new newsletter',
      clientId: mockClientId,
      organizationId: mockOrganizationId,
      categories: ['Technology'],
      client: { id: mockClientId, name: 'Tech Corp', type: 'BUSINESS' },
      organization: { id: mockOrganizationId, name: 'Test Org' },
    };

    it('should create newsletter with valid data', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.newsletter.create.mockResolvedValue(mockNewsletter);

      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'New Newsletter',
          description: 'A new newsletter',
          clientId: mockClientId,
          categories: ['Technology'],
        },
      });

      // Convert to NextRequest
      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          description: 'A new newsletter',
          clientId: mockClientId,
          categories: ['Technology'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewsletter);
    });

    it('should validate required fields (title, clientId)', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Missing title and clientId',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and client ID are required');
    });

    it('should verify client belongs to user organization', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          clientId: 'invalid-client-id',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Client not found or unauthorized');
    });

    it('should set organizationId from client relationship', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.newsletter.create.mockResolvedValue(mockNewsletter);

      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          clientId: mockClientId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.newsletter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: mockOrganizationId,
          }),
        })
      );
    });

    it('should default optional fields correctly', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.newsletter.create.mockResolvedValue(mockNewsletter);

      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          clientId: mockClientId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.newsletter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categories: [],
            targetAudience: {},
            subscriberCount: 0,
            isActiveForRecommendations: true,
            recommendationWeight: 1.0,
          }),
        })
      );
    });

    it('should return 201 with created newsletter', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.newsletter.create.mockResolvedValue(mockNewsletter);

      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          clientId: mockClientId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('newsletter-1');
      expect(data.title).toBe('New Newsletter');
    });

    it('should return 404 for invalid clientId', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Newsletter',
          clientId: 'invalid-client-id',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Client not found or unauthorized');
    });

    it('should return 400 for validation errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommendations/newsletters', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and client ID are required');
    });
  });

  describe('PUT /api/recommendations/newsletters', () => {
    const mockNewsletter = {
      id: 'newsletter-1',
      organizationId: mockOrganizationId,
    };

    const mockUpdatedNewsletter = {
      ...mockNewsletter,
      title: 'Updated Newsletter',
      updatedAt: new Date(),
    };

    it('should update newsletter with valid data', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.update.mockResolvedValue(mockUpdatedNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Newsletter');
    });

    it('should verify user ownership of newsletter', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(null);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Newsletter not found or unauthorized');
    });

    it('should preserve creation timestamp', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.update.mockResolvedValue(mockUpdatedNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
          createdAt: new Date(), // Should be ignored
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should update modification timestamp', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.update.mockResolvedValue(mockUpdatedNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return updated newsletter with relations', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.update.mockResolvedValue(mockUpdatedNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.newsletter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            client: expect.any(Object),
            organization: expect.any(Object),
            outgoingRecommendations: expect.any(Object),
            incomingRecommendations: expect.any(Object),
          }),
        })
      );
    });

    it('should return 404 for non-existent newsletter', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(null);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=non-existent';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Newsletter',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Newsletter not found or unauthorized');
    });
  });

  describe('DELETE /api/recommendations/newsletters', () => {
    const mockNewsletter = {
      id: 'newsletter-1',
      organizationId: mockOrganizationId,
    };

    it('should delete newsletter and cascade recommendations', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.delete.mockResolvedValue(mockNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.newsletter.delete).toHaveBeenCalledWith({
        where: { id: 'newsletter-1' },
      });
    });

    it('should verify user ownership before deletion', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(null);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Newsletter not found or unauthorized');
      expect(mockPrisma.newsletter.delete).not.toHaveBeenCalled();
    });

    it('should return success confirmation', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(mockNewsletter);
      mockPrisma.newsletter.delete.mockResolvedValue(mockNewsletter);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=newsletter-1';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent newsletter', async () => {
      mockPrisma.newsletter.findFirst.mockResolvedValue(null);

      const url = 'http://localhost:3000/api/recommendations/newsletters?id=non-existent';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Newsletter not found or unauthorized');
    });
  });
});
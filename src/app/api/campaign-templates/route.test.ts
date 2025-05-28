import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    campaignTemplate: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    organizationMember: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Campaign Templates API", () => {
  const mockUserId = "user_123";
  const mockOrgId = "org_123";
  const mockInternalUserId = "internal_user_123";

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
  });

  describe("GET /api/campaign-templates", () => {
    it("should return templates for valid organization", async () => {
      // Mock data
      const mockTemplates = [
        {
          id: "template_1",
          name: "Test Template",
          organizationId: mockOrgId,
          userId: mockInternalUserId,
        },
      ];

      // Mock dependencies
      (prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member_1",
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockInternalUserId,
        clerkId: mockUserId,
      });
      (prisma.campaignTemplate.findMany as jest.Mock).mockResolvedValue(
        mockTemplates
      );

      // Create request
      const request = new NextRequest(
        new URL(`http://localhost/api/campaign-templates?organizationId=${mockOrgId}`)
      );

      // Execute
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockTemplates);
      expect(prisma.campaignTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: mockOrgId },
        })
      );
    });

    it("should return 400 if organizationId is missing", async () => {
      const request = new NextRequest(
        new URL("http://localhost/api/campaign-templates")
      );

      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it("should return 403 if user lacks organization access", async () => {
      (prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        new URL(`http://localhost/api/campaign-templates?organizationId=${mockOrgId}`)
      );

      const response = await GET(request);
      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/campaign-templates", () => {
    const validTemplate = {
      name: "New Template",
      description: "Test description",
      status: "DRAFT",
    };

    it("should create template with valid data", async () => {
      // Mock dependencies
      (prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member_1",
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockInternalUserId,
        clerkId: mockUserId,
      });
      (prisma.campaignTemplate.create as jest.Mock).mockResolvedValue({
        ...validTemplate,
        id: "template_1",
        organizationId: mockOrgId,
        userId: mockInternalUserId,
      });

      // Create request
      const request = new NextRequest(
        new URL(`http://localhost/api/campaign-templates?organizationId=${mockOrgId}`),
        {
          method: "POST",
          body: JSON.stringify(validTemplate),
        }
      );

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        ...validTemplate,
        organizationId: mockOrgId,
        userId: mockInternalUserId,
      });
    });

    it("should return 400 for invalid template data", async () => {
      const request = new NextRequest(
        new URL(`http://localhost/api/campaign-templates?organizationId=${mockOrgId}`),
        {
          method: "POST",
          body: JSON.stringify({ name: "" }), // Invalid data
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
}); 
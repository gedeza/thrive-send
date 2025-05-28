import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withOrganization } from "@/middleware/auth";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

// Validation schema
const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export async function GET(request: NextRequest) {
  return withOrganization(request, async (req) => {
    try {
      const templates = await prisma.campaignTemplate.findMany({
        where: { organizationId: req.auth.organizationId },
        orderBy: { createdAt: "desc" },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return NextResponse.json(templates);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withOrganization(request, async (req) => {
    try {
      const body = await request.json();
      const validatedData = templateSchema.parse(body);

      const template = await prisma.campaignTemplate.create({
        data: {
          ...validatedData,
          organizationId: req.auth.organizationId!,
          userId: req.auth.user.id,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return NextResponse.json(template, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 
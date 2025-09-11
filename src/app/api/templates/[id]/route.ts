import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getAuth } from '@clerk/nextjs/server';

// Zod schema for partial update
const templateUpdateSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }).optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  previewImage: z.string().optional(),
});

// Zod schema for template validation
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  content: z.string().optional(),
});

/**
 * Verify user has access to the specified organization
 */
async function verifyOrganizationAccess(userId: string, organizationId: string) {
  const orgMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      }
    }
  });
  return !!orgMembership;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    const template = await prisma.template.findUnique({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Return with author info manually structured
    return NextResponse.json({
      ...template,
      author: {
        name: template.User?.name,
        email: template.User?.email,
      },
      User: undefined, // Remove the User field from the response
    });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;
    const body = await req.json();

    try {
      const validatedData = templateSchema.parse(body);

      const template = await prisma.template.update({
        where: {
          id,
          organizationId: orgId,
        },
        data: {
          ...validatedData,
          lastUpdated: new Date(),
        },
      });

      return NextResponse.json(template);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    await prisma.template.delete({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
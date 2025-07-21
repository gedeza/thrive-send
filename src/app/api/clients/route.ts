import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createValidationResponse,
  createNotFoundResponse,
  handleApiError 
} from "@/lib/api-utils";
import { 
  CreateClientSchema, 
  ClientFilterSchema,
  PaginationSchema,
  OrganizationIdSchema,
  validateRequestAsync 
} from "@/lib/validation";
import type { ClientResponse, PaginatedResponse } from "@/types/api";

// GET: List all clients for the user's organizations with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    
    // Validate organization ID
    const organizationIdValidation = await validateRequestAsync(
      OrganizationIdSchema,
      searchParams.get("organizationId")
    );
    
    if (!organizationIdValidation.success) {
      return createValidationResponse("organizationId is required and must be valid");
    }

    // Validate pagination parameters
    const paginationValidation = await validateRequestAsync(PaginationSchema, {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!paginationValidation.success) {
      return createValidationResponse("Invalid pagination parameters", paginationValidation.errors.errors);
    }

    // Validate filters
    const filtersValidation = await validateRequestAsync(ClientFilterSchema, {
      status: searchParams.get("status") || "all",
      type: searchParams.get("type") || "all",
      industry: searchParams.get("industry"),
      search: searchParams.get("search"),
    });

    if (!filtersValidation.success) {
      return createValidationResponse("Invalid filter parameters", filtersValidation.errors.errors);
    }

    const { page, limit, sortBy, sortOrder } = paginationValidation.data;
    const filters = filtersValidation.data;
    const organizationId = organizationIdValidation.data;

    // Find the organization
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: organizationId },
          { clerkOrganizationId: organizationId }
        ]
      }
    });

    if (!organization) {
      return createNotFoundResponse("Organization");
    }

    // Build where clause with filters
    const whereClause: any = {
      organizationId: organization.id,
    };

    if (filters.status !== 'all') {
      whereClause.status = filters.status;
    }

    if (filters.type !== 'all') {
      whereClause.type = filters.type;
    }

    if (filters.industry) {
      whereClause.industry = {
        contains: filters.industry,
        mode: 'insensitive' as const,
      };
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { email: { contains: filters.search, mode: 'insensitive' as const } },
        { industry: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    // Get total count for pagination
    const totalCount = await db.client.count({ where: whereClause });

    // Fetch clients with pagination
    const clients = await db.client.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            handle: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
          take: 5, // Limit projects for performance
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);
    
    const paginatedResponse: PaginatedResponse<ClientResponse> = {
      data: clients as ClientResponse[],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      message: `Retrieved ${clients.length} clients`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(paginatedResponse);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new client
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log("Received client creation request:", body);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body. Please check your data format." },
        { status: 400 }
      );
    }
    
    const { name, email, phone, address, type, website, industry, organizationId } = body;

    // Validate input
    if (!name || !email || !type || !organizationId) {
      console.error("Missing required fields:", { name, email, type, organizationId });
      return NextResponse.json(
        { error: "Name, email, type, and organizationId are required" },
        { status: 400 }
      );
    }

    // Map Clerk organizationId to internal organization id
    const organization = await db.organization.findUnique({
      where: { clerkOrganizationId: organizationId },
    });
    if (!organization) {
      console.error("No organization found for Clerk organizationId:", organizationId);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 400 }
      );
    }
    const internalOrganizationId = organization.id;

    // Verify user has access to the organization
    try {
      const membership = await db.organizationMember.findFirst({
        where: {
          organizationId: internalOrganizationId,
          user: { clerkId: session.userId }
        }
      });

      if (!membership) {
        console.error("User does not have access to organization:", { userId: session.userId, organizationId: internalOrganizationId });
        return NextResponse.json(
          { error: "You don't have access to this organization" },
          { status: 403 }
        );
      }

      // Check for existing client with same email
      const existingClient = await db.client.findFirst({
        where: {
          email,
          organizationId: internalOrganizationId,
        },
      });

      if (existingClient) {
        console.error("Client with email already exists:", { email, organizationId: internalOrganizationId });
        return NextResponse.json(
          { error: "A client with this email already exists in this organization" },
          { status: 409 }
        );
      }

      // Create new client
      const client = await db.client.create({
        data: {
          name,
          email,
          phone: phone || null,
          address: address || null,
          type,
          website: website || null,
          industry: industry || null,
          organization: { connect: { id: internalOrganizationId } },
        },
      });

      console.log("Successfully created client:", client);
      return NextResponse.json(client, { status: 201 });
    } catch (error) {
      console.error("Error with database operation:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: "A client with this information already exists" },
            { status: 409 }
          );
        } else if (error.code === 'P2003') {
          return NextResponse.json(
            { error: "Referenced organization does not exist" },
            { status: 400 }
          );
        } else if (error.code === 'P1001') {
          return NextResponse.json(
            { error: "Cannot connect to the database. Please try again later." },
            { status: 503 }
          );
        } else if (error.meta?.target && typeof error.meta.target === 'string' && error.meta.target.includes('website')) {
          return NextResponse.json(
            { error: "The website URL is invalid. Please use a valid URL format." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Database error occurred while creating client" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in client creation API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

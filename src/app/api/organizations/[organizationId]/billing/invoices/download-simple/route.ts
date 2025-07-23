import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is member of organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: userId,
        role: {
          in: ['ADMIN', 'OWNER'] // Only admins/owners can download all invoices
        }
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized to download invoices" },
        { status: 403 }
      );
    }

    // Get all invoices for the organization
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: params.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: "No invoices found" },
        { status: 404 }
      );
    }

    // Create a CSV file with all invoice data (simpler alternative to ZIP)
    const csvHeader = "Invoice Number,Date,Amount,Status,Description\n";
    const csvRows = invoices.map(invoice => 
      `"${invoice.invoiceNumber}","${invoice.createdAt.toLocaleDateString()}","$${(invoice.amount / 100).toFixed(2)}","${invoice.status.toUpperCase()}","${invoice.description || 'Subscription payment'}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invoices-${params.organizationId}.csv"`,
      },
    });

  } catch (error) {
    console.error("Error creating invoice CSV:", error);
    return NextResponse.json(
      { error: "Failed to create invoice download" },
      { status: 500 }
    );
  }
}
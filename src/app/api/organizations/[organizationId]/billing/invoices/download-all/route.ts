import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import JSZip from "jszip";

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

    // Create ZIP file with invoice data
    const zip = new JSZip();
    
    // For demo purposes, create sample invoice files
    // In production, you would fetch actual PDF files from Stripe or your payment provider
    for (const invoice of invoices) {
      const invoiceContent = `
INVOICE: ${invoice.invoiceNumber}
Date: ${invoice.createdAt.toLocaleDateString()}
Amount: $${(invoice.amount / 100).toFixed(2)}
Status: ${invoice.status.toUpperCase()}

Organization: ${params.organizationId}
Description: ${invoice.description || 'Subscription payment'}

Thank you for your business!
`;
      
      zip.file(`${invoice.invoiceNumber}.txt`, invoiceContent);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="invoices-${params.organizationId}.zip"`,
      },
    });

  } catch (error) {
    console.error("Error creating invoice ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create invoice download" },
      { status: 500 }
    );
  }
}
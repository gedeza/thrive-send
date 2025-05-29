import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;

    // Check if the ClientDocument table exists by querying a small amount of data
    try {
      // Fetch documents with uploaded by user info
      const documents = await db.$queryRaw`
        SELECT 
          d.id,
          d.title,
          d."fileUrl",
          d."fileType",
          COALESCE(d.size, 0) as size,
          d.status,
          d."createdAt",
          json_build_object(
            'id', u.id,
            'name', COALESCE(u.name, CONCAT(u."firstName", ' ', u."lastName"))
          ) as "uploadedBy"
        FROM "ClientDocument" d
        JOIN "User" u ON d."uploadedById" = u.id
        WHERE d."clientId" = ${clientId}
        ORDER BY d."createdAt" DESC
      `;

      return NextResponse.json({ documents });
    } catch (error) {
      console.error('Database error in documents API:', error);
      
      // If the error is related to missing tables, return empty documents instead of error
      if (error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return NextResponse.json({ documents: [], message: 'Document table not initialized yet' });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return new NextResponse('File is required', { status: 400 });
    }

    // TODO: Implement file upload to storage service (e.g., S3)
    // For now, we'll just simulate it
    const fileUrl = 'https://example.com/files/' + file.name;
    const fileType = file.name.split('.').pop() || '';
    const size = file.size;

    try {
      // Create document record
      const document = (await db.$queryRaw`
        WITH new_document AS (
          INSERT INTO "ClientDocument" (
            title,
            "fileUrl",
            "fileType",
            size,
            "clientId",
            "uploadedById",
            status,
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${title || file.name},
            ${fileUrl},
            ${fileType},
            ${size},
            ${clientId},
            ${userId},
            'ACTIVE',
            NOW(),
            NOW()
          )
          RETURNING *
        )
        SELECT 
          d.*,
          json_build_object(
            'id', u.id,
            'name', COALESCE(u.name, CONCAT(u."firstName", ' ', u."lastName"))
          ) as "uploadedBy"
        FROM new_document d
        JOIN "User" u ON d."uploadedById" = u.id
      ` as any[])[0];

      return NextResponse.json(document);
    } catch (error) {
      console.error('Database error in documents API:', error);
      
      // If the error is related to missing tables, return a more specific error
      if (error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    const data = await request.json();
    const { documentId, ...updateData } = data;

    try {
      // Update document
      const document = (await db.$queryRaw`
        WITH updated_document AS (
          UPDATE "ClientDocument"
          SET
            title = ${updateData.title},
            status = ${updateData.status},
            "updatedAt" = NOW()
          WHERE id = ${documentId}
            AND "clientId" = ${clientId}
          RETURNING *
        )
        SELECT 
          d.*,
          json_build_object(
            'id', u.id,
            'name', COALESCE(u.name, CONCAT(u."firstName", ' ', u."lastName"))
          ) as "uploadedBy"
        FROM updated_document d
        JOIN "User" u ON d."uploadedById" = u.id
      ` as any[])[0];

      if (!document) {
        return new NextResponse('Document not found', { status: 404 });
      }

      return NextResponse.json(document);
    } catch (error) {
      console.error('Database error in documents API:', error);
      
      // If the error is related to missing tables, return a more specific error
      if (error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error updating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');

    if (!documentId) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    try {
      // Delete document
      await db.$executeRaw`
        DELETE FROM "ClientDocument"
        WHERE id = ${documentId}
          AND "clientId" = ${clientId}
      `;

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('Database error in documents API:', error);
      
      // If the error is related to missing tables, return a more specific error
      if (error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
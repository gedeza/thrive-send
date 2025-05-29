import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

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

    // Fetch documents with uploaded by user info
    const documents = await db.$queryRaw`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.file_url as "fileUrl",
        d.file_type as "fileType",
        d.size,
        d.version,
        d.status,
        d.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', COALESCE(u.name, CONCAT(u.first_name, ' ', u.last_name))
        ) as "uploadedBy"
      FROM "ClientDocument" d
      JOIN "User" u ON d.uploaded_by_id = u.id
      WHERE d.client_id = ${clientId}
      ORDER BY d.created_at DESC
    `;

    return NextResponse.json({ documents });
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
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return new NextResponse('File is required', { status: 400 });
    }

    // TODO: Implement file upload to storage service (e.g., S3)
    // For now, we'll just simulate it
    const fileUrl = 'https://example.com/files/' + file.name;
    const fileType = file.name.split('.').pop() || '';
    const size = file.size;

    // Create document record
    const document = (await db.$queryRaw`
      WITH new_document AS (
        INSERT INTO "ClientDocument" (
          name,
          description,
          file_url,
          file_type,
          size,
          client_id,
          uploaded_by_id,
          version,
          status,
          created_at,
          updated_at
        )
        VALUES (
          ${name || file.name},
          ${description},
          ${fileUrl},
          ${fileType},
          ${size},
          ${clientId},
          ${userId},
          1,
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
          'name', COALESCE(u.name, CONCAT(u.first_name, ' ', u.last_name))
        ) as "uploadedBy"
      FROM new_document d
      JOIN "User" u ON d.uploaded_by_id = u.id
    ` as any[])[0];

    return NextResponse.json(document);
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

    // Update document
    const document = (await db.$queryRaw`
      WITH updated_document AS (
        UPDATE "ClientDocument"
        SET
          name = ${updateData.name},
          description = ${updateData.description},
          status = ${updateData.status},
          updated_at = NOW()
        WHERE id = ${documentId}
          AND client_id = ${clientId}
        RETURNING *
      )
      SELECT 
        d.*,
        json_build_object(
          'id', u.id,
          'name', COALESCE(u.name, CONCAT(u.first_name, ' ', u.last_name))
        ) as "uploadedBy"
      FROM updated_document d
      JOIN "User" u ON d.uploaded_by_id = u.id
    ` as any[])[0];

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    return NextResponse.json(document);
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

    // Delete document
    await db.$executeRaw`
      DELETE FROM "ClientDocument"
      WHERE id = ${documentId}
        AND client_id = ${clientId}
    `;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
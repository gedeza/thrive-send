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
          d.status,
          d."createdAt",
          d."updatedAt",
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
    } catch (_error) {
      console.error("", _error);
      
      // If the error is related to missing tables, return empty documents instead of error
      if (_error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return NextResponse.json({ documents: [], message: 'Document table not initialized yet' });
      }
      
      throw _error;
    }
  } catch (_error) {
    console.error("", _error);
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

    // Implement basic file upload to local storage
    // In production, this should be replaced with cloud storage (S3, etc.)
    const fileName = `${Date.now()}-${file.name}`;
    const fileType = file.name.split('.').pop() || '';

    // Create uploads directory if it doesn't exist
    const uploadDir = './public/uploads';
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file to local storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    try {
      // Create document record
      const document = (await db.$queryRaw`
        WITH new_document AS (
          INSERT INTO "ClientDocument" (
            title,
            "fileUrl",
            "fileType",
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
            ${clientId},
            ${userId},
            'DRAFT',
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
    } catch (_error) {
      console.error("", _error);
      
      // If the error is related to missing tables, return a more specific error
      if (_error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw _error;
    }
  } catch (_error) {
    console.error("", _error);
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
    } catch (_error) {
      console.error("", _error);
      
      // If the error is related to missing tables, return a more specific error
      if (_error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw _error;
    }
  } catch (_error) {
    console.error("", _error);
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
    } catch (_error) {
      console.error("", _error);
      
      // If the error is related to missing tables, return a more specific error
      if (_error instanceof Error && error.message && (
        error.message.includes('relation "ClientDocument" does not exist') ||
        error.message.includes('column d.') ||
        (error instanceof PrismaClientKnownRequestError && error.code === 'P2010')
      )) {
        return new NextResponse('Document feature not initialized. Please run database migrations.', { status: 500 });
      }
      
      throw _error;
    }
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage, generateThumbnail } from '@/lib/services/image-optimizer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 80,
      format: 'webp'
    });

    // Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(buffer);

    // Save files
    const filePath = join(uploadDir, filename);
    const thumbnailPath = join(uploadDir, `thumb_${filename}`);

    await writeFile(filePath, optimizedBuffer);
    await writeFile(thumbnailPath, thumbnailBuffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/thumb_${filename}`,
      filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 
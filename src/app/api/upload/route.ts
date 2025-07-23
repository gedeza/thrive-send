import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage, generateThumbnail } from '@/lib/services/image-optimizer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file ? { name: file.name, type: file.type, size: file.size } : 'No file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - allow more types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Supported: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

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

    console.log('Saving files to:', { filePath, thumbnailPath });

    await writeFile(filePath, optimizedBuffer);
    await writeFile(thumbnailPath, thumbnailBuffer);

    const result = {
      url: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/thumb_${filename}`,
      filename
    };

    console.log('Upload successful:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 
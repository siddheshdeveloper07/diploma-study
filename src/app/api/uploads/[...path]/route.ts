import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { UploadService } from '@/lib/uploadService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const fileName = pathArray.join('/');
    
    // Check if GCS is configured
    if (UploadService['isGCSConfigured']()) {
      // If GCS is configured, redirect to the GCS URL
      const files = await UploadService.getFilesList();
      const fileMetadata = files.find(f => f.name === fileName);
      
      if (fileMetadata) {
        return NextResponse.redirect(fileMetadata.url);
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    } else {
      // Fallback to local file serving
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      
      try {
        const fileBuffer = await fs.readFile(filePath);
        const fileExtension = path.extname(fileName).toLowerCase();
        
        let contentType = 'application/octet-stream';
        if (fileExtension === '.pdf') {
          contentType = 'application/pdf';
        } else if (fileExtension === '.docx') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        
        return new NextResponse(fileBuffer as BodyInit, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Cache-Control': 'public, max-age=31536000',
            'X-Frame-Options': 'SAMEORIGIN',
          },
        });
      } catch (error) {
        console.error('Error reading file:', error);
        return new NextResponse('File not found', { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

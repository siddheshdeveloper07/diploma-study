import { NextResponse } from 'next/server';
import { UploadService } from '@/lib/uploadService';

export async function GET() {
  try {
    // Test GCS configuration
    const isGCSConfigured = UploadService['isGCSConfigured']();
    
    if (!isGCSConfigured) {
      return NextResponse.json({
        status: 'local',
        message: 'Using local storage - GCS not configured',
        env: {
          GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
          GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
          NODE_ENV: process.env.NODE_ENV,
        }
      });
    }

    // Try to get files list
    const files = await UploadService.getFilesList();
    
    return NextResponse.json({
      status: 'gcs',
      message: 'Using Google Cloud Storage',
      fileCount: files.length,
      sampleFiles: files.slice(0, 3).map(f => ({
        name: f.name,
        url: f.url,
        size: f.size
      })),
      env: {
        GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('GCS test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error testing GCS configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
        NODE_ENV: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}

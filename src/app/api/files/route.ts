import { NextRequest, NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || null;
    
    const files = await UploadService.getFilesList(folderId);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}



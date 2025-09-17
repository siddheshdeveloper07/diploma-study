import { NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function GET() {
  try {
    const files = await UploadService.getFilesList();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}



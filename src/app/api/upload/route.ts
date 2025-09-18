import { NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const customName = formData.get("customName") as string | undefined;
    const folderId = formData.get("folderId") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert FormData file to a File-like object
    const fileData = file as { name?: string; type?: string; arrayBuffer: () => Promise<ArrayBuffer> };
    const originalName = fileData.name || "upload.pdf";
    const fileType = fileData.type || "application/pdf";
    const isPdfByMime = fileType === "application/pdf";
    const isPdfByExt = originalName.toLowerCase().endsWith(".pdf");

    if (!isPdfByMime && !isPdfByExt) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Create a File-like object for the upload service
    const fileObject = {
      name: originalName,
      type: fileType,
      arrayBuffer: () => fileData.arrayBuffer(),
    } as File;

    const fileMetadata = await UploadService.uploadFile(fileObject, customName, folderId || null);

    return NextResponse.json({ 
      message: "Uploaded successfully", 
      file: fileMetadata 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}



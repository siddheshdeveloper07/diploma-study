import { NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const customName = formData.get("customName") as string | undefined;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalName = file.name || "upload.pdf";
    const isPdfByMime = (file as File).type === "application/pdf";
    const isPdfByExt = originalName.toLowerCase().endsWith(".pdf");

    if (!isPdfByMime && !isPdfByExt) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const fileMetadata = await UploadService.uploadFile(file as File, customName);

    return NextResponse.json({ 
      message: "Uploaded successfully", 
      file: fileMetadata 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}



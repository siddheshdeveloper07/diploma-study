import { NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function PUT(request: Request) {
  try {
    const { fileId, newName } = await request.json();

    if (!fileId || !newName) {
      return NextResponse.json({ error: "File ID and new name are required" }, { status: 400 });
    }

    const success = await UploadService.renameFile(fileId, newName);

    if (success) {
      return NextResponse.json({ message: "File renamed successfully" });
    } else {
      return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
    }
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const success = await UploadService.deleteFile(fileId);

    if (success) {
      return NextResponse.json({ message: "File deleted successfully" });
    } else {
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

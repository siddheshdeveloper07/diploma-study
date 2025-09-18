import { NextResponse } from "next/server";
import { UploadService } from "@/lib/uploadService";

export async function PUT(request: Request) {
  try {
    const { fileId, newName, newFolderId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    if (newName !== undefined) {
      if (!newName) {
        return NextResponse.json({ error: "New name is required" }, { status: 400 });
      }

      const success = await UploadService.renameFile(fileId, newName);
      if (!success) {
        return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
      }
    }

    if (newFolderId !== undefined) {
      const success = await UploadService.moveFile(fileId, newFolderId);
      if (!success) {
        return NextResponse.json({ error: "Failed to move file" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "File updated successfully" });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
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

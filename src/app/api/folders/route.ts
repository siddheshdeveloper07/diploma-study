import { NextRequest, NextResponse } from "next/server";
import { FolderService } from "@/lib/folderService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    let folders;
    if (parentId === 'all') {
      folders = await FolderService.getAllFolders();
    } else {
      folders = await FolderService.getFolders(parentId || null);
    }
    
    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: "Failed to list folders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await FolderService.createFolder(name.trim(), parentId || null);
    return NextResponse.json({ folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { folderId, newName, newParentId } = await request.json();
    
    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    if (newName !== undefined) {
      if (!newName || !newName.trim()) {
        return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
      }
      
      const success = await FolderService.renameFolder(folderId, newName.trim());
      if (!success) {
        return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 });
      }
    }

    if (newParentId !== undefined) {
      const success = await FolderService.moveFolder(folderId, newParentId);
      if (!success) {
        return NextResponse.json({ error: "Failed to move folder" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { folderId } = await request.json();
    
    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    const success = await FolderService.deleteFolder(folderId);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

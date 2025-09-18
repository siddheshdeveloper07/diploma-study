export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  url: string;
  type: 'file';
  folderId: string | null; // null means root folder
  publicId?: string;
  gcsName?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null; // null means root folder
  type: 'folder';
  color?: string; // For folder customization
}

export type FileSystemItem = FileItem | FolderItem;

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface FolderStats {
  folderId: string | null;
  fileCount: number;
  totalSize: number;
}

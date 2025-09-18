import { Storage } from '@google-cloud/storage';
import { promises as fs } from 'fs';
import path from 'path';
import { FolderItem, FolderStats } from '@/types/fileSystem';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'diplomastudy-files';

export class FolderService {
  private static FOLDERS_FILE = 'folders.json';
  
  private static isGCSConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GCS_BUCKET_NAME
    );
  }

  // Folder operations
  static async createFolder(name: string, parentId: string | null = null): Promise<FolderItem> {
    const folder: FolderItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      parentId,
      type: 'folder',
      color: this.getRandomFolderColor(),
    };

    if (this.isGCSConfigured()) {
      await this.saveGCSFolder(folder);
    } else {
      await this.saveLocalFolder(folder);
    }

    return folder;
  }

  static async getFolders(parentId: string | null = null): Promise<FolderItem[]> {
    if (this.isGCSConfigured()) {
      return this.getGCSFolders(parentId);
    } else {
      return this.getLocalFolders(parentId);
    }
  }

  static async renameFolder(folderId: string, newName: string): Promise<boolean> {
    if (this.isGCSConfigured()) {
      return this.renameGCSFolder(folderId, newName);
    } else {
      return this.renameLocalFolder(folderId, newName);
    }
  }

  static async deleteFolder(folderId: string): Promise<boolean> {
    if (this.isGCSConfigured()) {
      return this.deleteGCSFolder(folderId);
    } else {
      return this.deleteLocalFolder(folderId);
    }
  }

  static async moveFolder(folderId: string, newParentId: string | null): Promise<boolean> {
    if (this.isGCSConfigured()) {
      return this.moveGCSFolder(folderId, newParentId);
    } else {
      return this.moveLocalFolder(folderId, newParentId);
    }
  }

  // GCS folder operations
  private static async saveGCSFolder(folder: FolderItem): Promise<void> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      let folders: FolderItem[] = [];
      try {
        const [exists] = await foldersFile.exists();
        if (exists) {
          const [data] = await foldersFile.download();
          folders = JSON.parse(data.toString());
        }
      } catch (_error) {
        console.log('Creating new folders file');
      }

      folders.push(folder);
      await foldersFile.save(JSON.stringify(folders, null, 2), {
        metadata: { contentType: 'application/json' },
      });
    } catch (error) {
      console.error('Error saving GCS folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  private static async getGCSFolders(parentId: string | null = null): Promise<FolderItem[]> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      const [exists] = await foldersFile.exists();
      if (!exists) return [];

      const [data] = await foldersFile.download();
      const folders: FolderItem[] = JSON.parse(data.toString());
      
      return folders.filter(folder => folder.parentId === parentId);
    } catch (error) {
      console.error('Error fetching GCS folders:', error);
      return [];
    }
  }

  private static async renameGCSFolder(folderId: string, newName: string): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      const [data] = await foldersFile.download();
      const folders: FolderItem[] = JSON.parse(data.toString());
      
      const folderIndex = folders.findIndex(f => f.id === folderId);
      if (folderIndex === -1) return false;

      folders[folderIndex].name = newName.trim();
      
      await foldersFile.save(JSON.stringify(folders, null, 2), {
        metadata: { contentType: 'application/json' },
      });

      return true;
    } catch (error) {
      console.error('Error renaming GCS folder:', error);
      return false;
    }
  }

  private static async deleteGCSFolder(folderId: string): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      const [data] = await foldersFile.download();
      const folders: FolderItem[] = JSON.parse(data.toString());
      
      const updatedFolders = folders.filter(f => f.id !== folderId && f.parentId !== folderId);
      
      await foldersFile.save(JSON.stringify(updatedFolders, null, 2), {
        metadata: { contentType: 'application/json' },
      });

      return true;
    } catch (error) {
      console.error('Error deleting GCS folder:', error);
      return false;
    }
  }

  private static async moveGCSFolder(folderId: string, newParentId: string | null): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      const [data] = await foldersFile.download();
      const folders: FolderItem[] = JSON.parse(data.toString());
      
      const folderIndex = folders.findIndex(f => f.id === folderId);
      if (folderIndex === -1) return false;

      folders[folderIndex].parentId = newParentId;
      
      await foldersFile.save(JSON.stringify(folders, null, 2), {
        metadata: { contentType: 'application/json' },
      });

      return true;
    } catch (error) {
      console.error('Error moving GCS folder:', error);
      return false;
    }
  }

  // Local folder operations
  private static async saveLocalFolder(folder: FolderItem): Promise<void> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      await fs.mkdir(path.dirname(foldersFile), { recursive: true });
      
      let folders: FolderItem[] = [];
      try {
        const data = await fs.readFile(foldersFile, 'utf-8');
        folders = JSON.parse(data);
      } catch (_error) {
        console.log('Creating new folders file');
      }

      folders.push(folder);
      await fs.writeFile(foldersFile, JSON.stringify(folders, null, 2));
    } catch (error) {
      console.error('Error saving local folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  private static async getLocalFolders(parentId: string | null = null): Promise<FolderItem[]> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      
      try {
        const data = await fs.readFile(foldersFile, 'utf-8');
        const folders: FolderItem[] = JSON.parse(data);
        return folders.filter(folder => folder.parentId === parentId);
      } catch (_error) {
        return [];
      }
    } catch (error) {
      console.error('Error fetching local folders:', error);
      return [];
    }
  }

  private static async renameLocalFolder(folderId: string, newName: string): Promise<boolean> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      
      const data = await fs.readFile(foldersFile, 'utf-8');
      const folders: FolderItem[] = JSON.parse(data);
      
      const folderIndex = folders.findIndex(f => f.id === folderId);
      if (folderIndex === -1) return false;

      folders[folderIndex].name = newName.trim();
      
      await fs.writeFile(foldersFile, JSON.stringify(folders, null, 2));
      return true;
    } catch (error) {
      console.error('Error renaming local folder:', error);
      return false;
    }
  }

  private static async deleteLocalFolder(folderId: string): Promise<boolean> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      
      const data = await fs.readFile(foldersFile, 'utf-8');
      const folders: FolderItem[] = JSON.parse(data);
      
      const updatedFolders = folders.filter(f => f.id !== folderId && f.parentId !== folderId);
      
      await fs.writeFile(foldersFile, JSON.stringify(updatedFolders, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting local folder:', error);
      return false;
    }
  }

  private static async moveLocalFolder(folderId: string, newParentId: string | null): Promise<boolean> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      
      const data = await fs.readFile(foldersFile, 'utf-8');
      const folders: FolderItem[] = JSON.parse(data);
      
      const folderIndex = folders.findIndex(f => f.id === folderId);
      if (folderIndex === -1) return false;

      folders[folderIndex].parentId = newParentId;
      
      await fs.writeFile(foldersFile, JSON.stringify(folders, null, 2));
      return true;
    } catch (error) {
      console.error('Error moving local folder:', error);
      return false;
    }
  }

  // Helper functions
  private static getRandomFolderColor(): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16', // Lime
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static async getFolderStats(folderId: string | null = null): Promise<FolderStats> {
    // This would typically come from the UploadService
    // For now, return basic stats
    return {
      folderId,
      fileCount: 0,
      totalSize: 0,
    };
  }

  static async getAllFolders(): Promise<FolderItem[]> {
    if (this.isGCSConfigured()) {
      return this.getAllGCSFolders();
    } else {
      return this.getAllLocalFolders();
    }
  }

  private static async getAllGCSFolders(): Promise<FolderItem[]> {
    try {
      const bucket = storage.bucket(bucketName);
      const foldersFile = bucket.file(`diploma-study/metadata/${this.FOLDERS_FILE}`);
      
      const [exists] = await foldersFile.exists();
      if (!exists) return [];

      const [data] = await foldersFile.download();
      return JSON.parse(data.toString());
    } catch (error) {
      console.error('Error fetching all GCS folders:', error);
      return [];
    }
  }

  private static async getAllLocalFolders(): Promise<FolderItem[]> {
    try {
      const foldersFile = path.join(process.cwd(), 'data', this.FOLDERS_FILE);
      
      try {
        const data = await fs.readFile(foldersFile, 'utf-8');
        return JSON.parse(data);
      } catch (_error) {
        return [];
      }
    } catch (error) {
      console.error('Error fetching all local folders:', error);
      return [];
    }
  }
}

import { promises as fs } from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'diplomastudy-files';

interface FileMetadataRecord {
  fileId: string;
  folderId: string | null;
  updatedAt: string;
}

export class FileMetadataService {
  private static METADATA_FILE = 'file-metadata.json';
  
  private static isGCSConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GCS_BUCKET_NAME
    );
  }

  // Update file's folder association
  static async updateFileFolder(fileId: string, folderId: string | null): Promise<boolean> {
    console.log(`Updating file ${fileId} folder association to:`, folderId);
    
    if (this.isGCSConfigured()) {
      return this.updateGCSFileFolder(fileId, folderId);
    } else {
      return this.updateLocalFileFolder(fileId, folderId);
    }
  }

  // Get file's folder association
  static async getFileFolder(fileId: string): Promise<string | null> {
    if (this.isGCSConfigured()) {
      return this.getGCSFileFolder(fileId);
    } else {
      return this.getLocalFileFolder(fileId);
    }
  }

  // Get all file-folder associations
  static async getAllFileMetadata(): Promise<Record<string, string | null>> {
    if (this.isGCSConfigured()) {
      return this.getAllGCSFileMetadata();
    } else {
      return this.getAllLocalFileMetadata();
    }
  }

  // GCS implementations
  private static async updateGCSFileFolder(fileId: string, folderId: string | null): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const metadataFile = bucket.file(`diploma-study/metadata/${this.METADATA_FILE}`);
      
      let metadata: FileMetadataRecord[] = [];
      try {
        const [exists] = await metadataFile.exists();
        if (exists) {
          const [data] = await metadataFile.download();
          metadata = JSON.parse(data.toString());
        }
      } catch (error) {
        console.log('Creating new file metadata');
      }

      // Remove existing record for this file
      metadata = metadata.filter(record => record.fileId !== fileId);
      
      // Add new record
      metadata.push({
        fileId,
        folderId,
        updatedAt: new Date().toISOString()
      });

      await metadataFile.save(JSON.stringify(metadata, null, 2), {
        metadata: { contentType: 'application/json' },
      });

      return true;
    } catch (error) {
      console.error('Error updating GCS file metadata:', error);
      return false;
    }
  }

  private static async getGCSFileFolder(fileId: string): Promise<string | null> {
    try {
      const bucket = storage.bucket(bucketName);
      const metadataFile = bucket.file(`diploma-study/metadata/${this.METADATA_FILE}`);
      
      const [exists] = await metadataFile.exists();
      if (!exists) return null;

      const [data] = await metadataFile.download();
      const metadata: FileMetadataRecord[] = JSON.parse(data.toString());
      
      const record = metadata.find(m => m.fileId === fileId);
      return record ? record.folderId : null;
    } catch (error) {
      console.error('Error getting GCS file metadata:', error);
      return null;
    }
  }

  private static async getAllGCSFileMetadata(): Promise<Record<string, string | null>> {
    try {
      const bucket = storage.bucket(bucketName);
      const metadataFile = bucket.file(`diploma-study/metadata/${this.METADATA_FILE}`);
      
      const [exists] = await metadataFile.exists();
      if (!exists) return {};

      const [data] = await metadataFile.download();
      const metadata: FileMetadataRecord[] = JSON.parse(data.toString());
      
      const result: Record<string, string | null> = {};
      metadata.forEach(record => {
        result[record.fileId] = record.folderId;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting all GCS file metadata:', error);
      return {};
    }
  }

  // Local implementations
  private static async updateLocalFileFolder(fileId: string, folderId: string | null): Promise<boolean> {
    try {
      const metadataPath = path.join(process.cwd(), 'data', this.METADATA_FILE);
      await fs.mkdir(path.dirname(metadataPath), { recursive: true });
      
      let metadata: FileMetadataRecord[] = [];
      try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(data);
      } catch (error) {
        console.log('Creating new file metadata');
      }

      // Remove existing record for this file
      metadata = metadata.filter(record => record.fileId !== fileId);
      
      // Add new record
      metadata.push({
        fileId,
        folderId,
        updatedAt: new Date().toISOString()
      });

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`Successfully updated file ${fileId} folder association to ${folderId}`);
      return true;
    } catch (error) {
      console.error('Error updating local file metadata:', error);
      return false;
    }
  }

  private static async getLocalFileFolder(fileId: string): Promise<string | null> {
    try {
      const metadataPath = path.join(process.cwd(), 'data', this.METADATA_FILE);
      
      try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: FileMetadataRecord[] = JSON.parse(data);
        
        const record = metadata.find(m => m.fileId === fileId);
        return record ? record.folderId : null;
      } catch (error) {
        return null;
      }
    } catch (error) {
      console.error('Error getting local file metadata:', error);
      return null;
    }
  }

  private static async getAllLocalFileMetadata(): Promise<Record<string, string | null>> {
    try {
      const metadataPath = path.join(process.cwd(), 'data', this.METADATA_FILE);
      
      try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: FileMetadataRecord[] = JSON.parse(data);
        
        const result: Record<string, string | null> = {};
        metadata.forEach(record => {
          result[record.fileId] = record.folderId;
        });
        
        return result;
      } catch (error) {
        return {};
      }
    } catch (error) {
      console.error('Error getting all local file metadata:', error);
      return {};
    }
  }

  // Clean up orphaned metadata (files that no longer exist)
  static async cleanupMetadata(existingFileIds: string[]): Promise<void> {
    if (this.isGCSConfigured()) {
      await this.cleanupGCSMetadata(existingFileIds);
    } else {
      await this.cleanupLocalMetadata(existingFileIds);
    }
  }

  private static async cleanupGCSMetadata(existingFileIds: string[]): Promise<void> {
    try {
      const bucket = storage.bucket(bucketName);
      const metadataFile = bucket.file(`diploma-study/metadata/${this.METADATA_FILE}`);
      
      const [exists] = await metadataFile.exists();
      if (!exists) return;

      const [data] = await metadataFile.download();
      const metadata: FileMetadataRecord[] = JSON.parse(data.toString());
      
      const cleanedMetadata = metadata.filter(record => 
        existingFileIds.includes(record.fileId)
      );

      await metadataFile.save(JSON.stringify(cleanedMetadata, null, 2), {
        metadata: { contentType: 'application/json' },
      });
    } catch (error) {
      console.error('Error cleaning up GCS metadata:', error);
    }
  }

  private static async cleanupLocalMetadata(existingFileIds: string[]): Promise<void> {
    try {
      const metadataPath = path.join(process.cwd(), 'data', this.METADATA_FILE);
      
      try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: FileMetadataRecord[] = JSON.parse(data);
        
        const cleanedMetadata = metadata.filter(record => 
          existingFileIds.includes(record.fileId)
        );

        await fs.writeFile(metadataPath, JSON.stringify(cleanedMetadata, null, 2));
      } catch (error) {
        // File doesn't exist, nothing to clean
      }
    } catch (error) {
      console.error('Error cleaning up local metadata:', error);
    }
  }
}

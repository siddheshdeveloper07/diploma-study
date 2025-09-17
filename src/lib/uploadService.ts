import { Storage } from '@google-cloud/storage';
import { promises as fs } from 'fs';
import path from 'path';

// Google Cloud Storage is used for file storage

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  // In Cloud Run, we don't need keyFilename - it uses the default service account
  // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'diplomastudy-files';

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  url: string;
  gcsName?: string; // For Google Cloud Storage
}

export class UploadService {
  private static isGCSConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GCS_BUCKET_NAME
    );
  }

  static async uploadFile(file: File, customName?: string): Promise<FileMetadata> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .replace("Z", "");

    const originalName = file.name || "upload.pdf";
    const safeBaseName = path
      .basename(customName || originalName)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const finalName = safeBaseName.toLowerCase().endsWith(".pdf")
      ? safeBaseName
      : `${safeBaseName}.pdf`;

    const nameWithTimestamp = `${timestamp}_${finalName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (this.isGCSConfigured()) {
      // Upload to Google Cloud Storage
      return this.uploadToGCS(buffer, nameWithTimestamp, originalName);
    } else {
      // Fallback to local storage
      return this.uploadToLocal(buffer, nameWithTimestamp, originalName);
    }
  }

  private static async uploadToGCS(
    buffer: Buffer,
    fileName: string,
    originalName: string
  ): Promise<FileMetadata> {
    try {
      const bucket = storage.bucket(bucketName);
      const gcsFileName = `diploma-study/${fileName}`;
      const file = bucket.file(gcsFileName);

      await file.save(buffer, {
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Make the file publicly readable
      await file.makePublic();

      const [metadata] = await file.getMetadata();
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;

      return {
        id: gcsFileName,
        name: fileName,
        originalName,
        size: parseInt(String(metadata.size || '0')),
        uploadedAt: new Date().toISOString(),
        url: publicUrl,
        gcsName: gcsFileName,
      };
    } catch (error) {
      console.error('GCS upload error:', error);
      throw new Error('Failed to upload to Google Cloud Storage');
    }
  }

  private static async uploadToLocal(
    buffer: Buffer,
    fileName: string,
    originalName: string
  ): Promise<FileMetadata> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    return {
      id: fileName,
      name: fileName,
      originalName,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${encodeURIComponent(fileName)}`,
    };
  }

  static async getFilesList(): Promise<FileMetadata[]> {
    if (this.isGCSConfigured()) {
      return this.getGCSFiles();
    } else {
      return this.getLocalFiles();
    }
  }

  private static async getGCSFiles(): Promise<FileMetadata[]> {
    try {
      const bucket = storage.bucket(bucketName);
      const [files] = await bucket.getFiles({
        prefix: 'diploma-study/',
        maxResults: 100,
      });

      const fileMetadata: FileMetadata[] = [];

      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const [metadata] = await file.getMetadata();
          const fileName = file.name.split('/').pop() || 'unknown.pdf';
          const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;

          fileMetadata.push({
            id: file.name,
            name: fileName,
            originalName: fileName,
            size: parseInt(String(metadata.size || '0')),
            uploadedAt: metadata.timeCreated || new Date().toISOString(),
            url: publicUrl,
            gcsName: file.name,
          });
        }
      }

      return fileMetadata.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    } catch (error) {
      console.error('Error fetching GCS files:', error);
      return [];
    }
  }

  private static async getLocalFiles(): Promise<FileMetadata[]> {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const entries = await fs.readdir(uploadsDir);

      const pdfEntries = entries.filter((name) => name.toLowerCase().endsWith(".pdf"));

      const files = await Promise.all(
        pdfEntries.map(async (name) => {
          const fullPath = path.join(uploadsDir, name);
          const stat = await fs.stat(fullPath);
          return {
            id: name,
            name,
            originalName: name,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
            url: `/uploads/${encodeURIComponent(name)}`,
          };
        })
      );

      return files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    } catch (error) {
      console.error('Error fetching local files:', error);
      return [];
    }
  }

  static async renameFile(fileId: string, newName: string): Promise<boolean> {
    if (this.isGCSConfigured()) {
      return this.renameGCSFile(fileId, newName);
    } else {
      return this.renameLocalFile(fileId, newName);
    }
  }

  private static async renameGCSFile(gcsName: string, newName: string): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const safeName = newName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const finalName = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
      
      // Add timestamp to avoid conflicts
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");
      const nameWithTimestamp = `${timestamp}_${finalName}`;
      const newGcsName = `diploma-study/${nameWithTimestamp}`;

      const sourceFile = bucket.file(gcsName);
      const destinationFile = bucket.file(newGcsName);

      await sourceFile.copy(destinationFile);
      await sourceFile.delete();
      
      return true;
    } catch (error) {
      console.error('Error renaming GCS file:', error);
      return false;
    }
  }

  private static async renameLocalFile(oldName: string, newName: string): Promise<boolean> {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      const safeName = newName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const finalName = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
      
      // Add timestamp to avoid conflicts
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");
      const nameWithTimestamp = `${timestamp}_${finalName}`;

      const oldPath = path.join(uploadsDir, oldName);
      const newPath = path.join(uploadsDir, nameWithTimestamp);

      await fs.rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error('Error renaming local file:', error);
      return false;
    }
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    if (this.isGCSConfigured()) {
      return this.deleteGCSFile(fileId);
    } else {
      return this.deleteLocalFile(fileId);
    }
  }

  private static async deleteGCSFile(gcsName: string): Promise<boolean> {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(gcsName);
      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting GCS file:', error);
      return false;
    }
  }

  private static async deleteLocalFile(fileName: string): Promise<boolean> {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadsDir, fileName);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }
}

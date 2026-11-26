import { logger } from '@utils/logger';
import { config } from '@config';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface StorageConfig {
  provider: 'local' | 's3' | 'r2';
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
}

class StorageService {
  private config: StorageConfig;
  private s3Client: any = null;
  private initialized = false;

  constructor() {
    this.config = {
      provider: (process.env.STORAGE_PROVIDER as any) || 'local',
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      publicUrl: process.env.STORAGE_PUBLIC_URL,
    };

    this.initialize();
  }

  private async initialize() {
    if (this.config.provider !== 'local') {
      try {
        const { S3Client } = await import('@aws-sdk/client-s3');
        this.s3Client = new S3Client({
          region: this.config.region,
          endpoint: this.config.endpoint,
          credentials: {
            accessKeyId: this.config.accessKeyId!,
            secretAccessKey: this.config.secretAccessKey!,
          },
          forcePathStyle: this.config.provider === 'r2',
        });

        // Ensure bucket exists
        await this.ensureBucketExists();
      } catch (error) {
        logger.error('Failed to initialize S3 client', { error });
      }
    }

    this.initialized = true;
    logger.info('Storage service initialized', { provider: this.config.provider });
  }

  private async ensureBucketExists() {
    if (!this.s3Client || !this.config.bucket) return;

    try {
      const { HeadBucketCommand, CreateBucketCommand } = await import('@aws-sdk/client-s3');
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        try {
          const { CreateBucketCommand } = await import('@aws-sdk/client-s3');
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.config.bucket }));
          logger.info('Created storage bucket', { bucket: this.config.bucket });
        } catch (createError) {
          logger.error('Failed to create bucket', { error: createError });
        }
      }
    }
  }

  // Generate unique filename
  private generateFileName(originalName: string, folder: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = uuidv4().slice(0, 8);
    return `${folder}/${timestamp}-${random}-${baseName}${ext}`;
  }

  // Save file buffer
  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'uploads'
  ): Promise<string> {
    const fileName = this.generateFileName(originalName, folder);

    if (this.config.provider === 'local') {
      return this.saveLocal(buffer, fileName);
    } else {
      return this.saveToS3(buffer, fileName, mimeType);
    }
  }

  private async saveLocal(buffer: Buffer, fileName: string): Promise<string> {
    const dir = path.join(config.uploadDir, path.dirname(buffer.toString()));
    const fullPath = path.join(config.uploadDir, buffer.toString());

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);
    return fullPath;
  }

  private async saveToS3(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'private',
    }));

    return `${this.config.publicUrl || `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com`}/${key}`;
  }

  // Save original image with metadata
  async saveOriginal(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.saveFile(buffer, originalName, mimeType, 'originals');
  }

  // Save processed image
  async saveProcessed(buffer: Buffer, originalName: string, mimeType: string, suffix: string = 'processed'): Promise<string> {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const processedName = `${baseName}_${suffix}${ext}`;
    return this.saveFile(buffer, processedName, 'image/png', 'processed');
  }

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    if (this.config.provider === 'local') {
      const fullPath = path.join(config.uploadDir, filePath.replace(/^.*\/uploads\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } else {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const key = filePath.replace(`${this.config.publicUrl}/`, '').replace(`https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/`, '');
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    }
  }

  // Get signed upload URL
  async getSignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600
  ): Promise<string> {
    if (this.config.provider === 'local') {
      throw new Error('Signed URLs not supported for local storage');
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const key = this.generateFileName(fileName, folder);

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: mimeType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // Get signed download URL
  async getSignedDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 'local') {
      // For local, return direct path (in production, use a signed URL endpoint)
      return `/api/v1/upload/files/${path.basename(filePath)}/download`;
    }

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const key = filePath.replace(`${this.config.publicUrl}/`, '').replace(`https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/`, '');

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // Get file metadata
  async getFileMetadata(filePath: string): Promise<{ size: number; mimeType: string; lastModified: Date } | null> {
    if (this.config.provider === 'local') {
      const fullPath = path.join(config.uploadDir, filePath.replace(/^.*\/uploads\//, ''));
      if (!fs.existsSync(fullPath)) return null;

      const stats = fs.statSync(fullPath);
      return {
        size: stats.size,
        mimeType: this.getMimeType(filePath),
        lastModified: stats.mtime,
      };
    }

    // For S3, would use HeadObjectCommand
    return null;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.heif': 'image/heif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Copy file
  async copyFile(sourcePath: string, destinationPath: string): Promise<string> {
    if (this.config.provider === 'local') {
      const sourceFull = path.join(config.uploadDir, sourcePath.replace(/^.*\/uploads\//, ''));
      const destFull = path.join(config.uploadDir, destinationPath);

      const destDir = path.dirname(destFull);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(sourceFull, destFull);
      return destinationPath;
    } else {
      // S3 copy
      const { CopyObjectCommand } = await import('@aws-sdk/client-s3');
      const sourceKey = sourcePath.replace(`${this.config.publicUrl}/`, '');
      const destKey = destinationPath;

      await this.s3Client.send(new CopyObjectCommand({
        Bucket: this.config.bucket,
        CopySource: `${this.config.bucket}/${sourceKey}`,
        Key: destKey,
      }));

      return destinationPath;
    }
  }

  // List files in folder
  async listFiles(folder: string, prefix: string = '', maxKeys: number = 1000): Promise<string[]> {
    if (this.config.provider === 'local') {
      const fullPath = path.join(config.uploadDir, folder);
      if (!fs.existsSync(fullPath)) return [];

      const files = fs.readdirSync(fullPath, { recursive: true });
      return files.filter(f => !fs.statSync(path.join(fullPath, f)).isDirectory());
    }

    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const response = await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: `${folder}/${prefix}`,
      MaxKeys: maxKeys,
    }));

    return (response.Contents || []).map(obj => obj.Key!);
  }

  // Get file size
  async getFileSize(filePath: string): Promise<number> {
    if (this.config.provider === 'local') {
      const fullPath = path.join(config.uploadDir, filePath.replace(/^.*\/uploads\//, ''));
      if (!fs.existsSync(fullPath)) return 0;
      return fs.statSync(fullPath).size;
    }
    // For S3, would use HeadObjectCommand
    return 0;
  }
}

export const storageService = new StorageService();
export default storageService;
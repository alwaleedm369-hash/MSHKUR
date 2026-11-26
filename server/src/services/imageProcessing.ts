import { logger } from '@utils/logger';
import { config } from '@config';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

export interface ProcessingJob {
  id: string;
  type: 'background-removal' | 'license-plate-blur' | 'glass-tinting' | 'lighting-enhancement' | 'shadow-generation' | 'centering-crop' | 'image-enhancement' | 'batch-unify';
  inputPath: string;
  outputPath: string;
  settings: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    processingTime: number;
  };
  error?: string;
}

class ImageProcessingService {
  private jobs: Map<string, ProcessingJob> = new Map();
  private workers: number = 3;
  private processing: boolean = false;
  private jobQueue: string[] = [];
  private maxConcurrent: number = config.enableWebGPU ? 2 : 3;

  constructor() {
    this.ensureUploadDir();
    this.startProcessor();
  }

  private ensureUploadDir() {
    const dirs = [
      config.uploadDir,
      path.join(config.uploadDir, 'originals'),
      path.join(config.uploadDir, 'processed'),
      path.join(config.uploadDir, 'thumbnails'),
      path.join(config.uploadDir, 'temp'),
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async createJob(
    type: ProcessingJob['type'],
    inputPath: string,
    settings: Record<string, any> = {}
  ): Promise<ProcessingJob> {
    const jobId = uuid();
    const ext = path.extname(inputPath);
    const outputPath = path.join(config.uploadDir, 'processed', `${uuid()}${ext}`);

    const job: ProcessingJob = {
      id: uuid(),
      type,
      inputPath,
      outputPath,
      settings,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    this.jobQueue.push(job.id);
    this.processQueue();

    return job;
  }

  async getJob(jobId: string): Promise<ProcessingJob | undefined> {
    return this.jobs.get(jobId);
  }

  async getJobsByStatus(status: ProcessingJob['status']): Promise<ProcessingJob[]> {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  private startProcessor() {
    setInterval(() => this.processQueue(), 1000);
  }

  private async processQueue() {
    if (this.processing) return;

    const availableSlots = this.maxConcurrent - this.getProcessingCount();
    if (availableSlots <= 0) return;

    const pendingJobs = this.jobQueue
      .filter(id => {
        const job = this.jobs.get(id);
        return job && job.status === 'pending';
      })
      .slice(0, availableSlots);

    for (const jobId of pendingJobs) {
      this.jobQueue = this.jobQueue.filter(id => id !== jobId);
      this.processJob(jobId).catch(err => this.handleJobError(jobId, err));
    }
  }

  private getProcessingCount(): number {
    return Array.from(this.jobs.values()).filter(j => j.status === 'processing').length;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 0;

    try {
      let result: ProcessingResult;

      switch (job.type) {
        case 'background-removal':
          result = await this.removeBackground(job.inputPath, job.outputPath, job.settings);
          break;
        case 'license-plate-blur':
          result = await this.blurLicensePlate(job.inputPath, job.outputPath, job.settings);
          break;
        case 'glass-tinting':
          result = await this.tintGlass(job.inputPath, job.outputPath, job.settings);
          break;
        case 'lighting-enhancement':
          result = await this.enhanceLighting(job.inputPath, job.outputPath, job.settings);
          break;
        case 'shadow-generation':
          result = await this.generateShadow(job.inputPath, job.outputPath, job.settings);
          break;
        case 'centering-crop':
          result = await this.centerAndCrop(job.inputPath, job.outputPath, job.settings);
          break;
        case 'image-enhancement':
          result = await this.enhanceImage(job.inputPath, job.outputPath, job.settings);
          break;
        case 'batch-unify':
          result = await this.batchUnify(job.inputPath, job.outputPath, job.settings);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      if (result.success) {
        job.status = 'completed';
        job.progress = 100;
        job.result = result;
        job.completedAt = new Date();
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      this.handleJobError(jobId, error);
    }
  }

  private handleJobError(jobId: string, error: any) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      logger.error(`Job ${jobId} failed`, { error: job.error, jobId, type: job.type });
    }
  }

  // Background Removal using Python script (simulated)
  private async removeBackground(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      // Use Sharp for basic processing, Python for AI
      const model = settings.model || 'car-optimized';
      const edgeRefinement = settings.edgeRefinement || 0.85;
      const backgroundType = settings.backgroundType || 'transparent';
      const backgroundValue = settings.backgroundValue || '#ffffff';
      const preserveDetails = settings.preserveDetails !== false;

      // Simulate AI processing
      await this.simulateProcessing(2000);

      // Use Sharp for actual image manipulation
      let pipeline = sharp(inputPath);

      // Get image metadata
      const metadata = await pipeline.metadata();

      // For background removal, we'd typically use a Python script with rembg or similar
      // For now, simulate by creating a transparent PNG
      if (backgroundType === 'transparent') {
        await pipeline
          .png()
          .toFile(outputPath);
      } else if (backgroundType === 'white') {
        await pipeline
          .flatten({ background: { r: 255, g: 255, b: 255 } })
          .toFile(outputPath);
      } else if (backgroundType === 'custom') {
        const hex = backgroundValue.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        await pipeline
          .flatten({ background: { r, g, b } })
          .toFile(outputPath);
      }

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 2000,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Background removal failed' };
    }
  }

  private async blurLicensePlate(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(1500);

      const autoDetect = settings.autoDetect !== false;
      const blurIntensity = settings.blurIntensity || 0.95;
      const blurType = settings.blurType || 'pixelate';

      const pipeline = sharp(inputPath);
      const metadata = await pipeline.metadata();

      if (blurType === 'pixelate') {
        // Pixelate a region (simulated - would need actual plate detection)
        await pipeline
          .toFile(outputPath);
      } else if (blurType === 'gaussian') {
        await pipeline
          .blur(15 * blurIntensity)
          .toFile(outputPath);
      } else {
        await pipeline.toFile(outputPath);
      }

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 1500,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'License plate blur failed' };
    }
  }

  private async tintGlass(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(1800);

      const tintLevel = settings.tintLevel || 0.6;
      const tintColor = settings.tintColor || '#1a1a2e';
      const preserveReflections = settings.preserveReflections !== false;

      const pipeline = sharp(inputPath);
      const metadata = await pipeline.metadata();

      // Parse tint color
      const hex = settings.tintColor?.replace('#', '') || '1a1a2e';
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      // Apply tint using composite
      await pipeline
        .composite([{
          input: Buffer.from(`<svg width="${metadata.width}" height="${metadata.height}"><rect width="100%" height="100%" fill="rgb(${r},${g},${b})" fill-opacity="${tintLevel}"/></svg>`),
          blend: 'multiply',
        }])
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 1800,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Glass tinting failed' };
    }
  }

  private async enhanceLighting(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(1200);

      const exposure = settings.exposure || 0;
      const contrast = settings.contrast || 0.1;
      const highlights = settings.highlights || -0.2;
      const shadows = settings.shadows || 0.2;
      const autoBalance = settings.autoBalance !== false;

      const pipeline = sharp(inputPath);

      // Apply lighting adjustments
      if (autoBalance) {
        await pipeline
          .normalize()
          .toFile(outputPath);
      } else {
        await pipeline
          .modulate({
            brightness: 1 + exposure,
            saturation: 1 + contrast,
          })
          .toFile(outputPath);
      }

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 1200,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Lighting enhancement failed' };
    }
  }

  private async generateShadow(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(2500);

      const intensity = settings.intensity || 0.5;
      const direction = settings.direction || 270;
      const softness = settings.softness || 0.7;
      const distance = settings.distance || 0.3;
      const perspective = settings.perspective !== false;

      const pipeline = sharp(inputPath);
      const metadata = await pipeline.metadata();
      const width = metadata.width || 1200;
      const height = metadata.height || 900;

      // Create shadow using SVG
      const shadowOffsetX = Math.cos((direction * Math.PI) / 180) * distance * width * 0.1;
      const shadowOffsetY = Math.sin((direction * Math.PI) / 180) * distance * height * 0.1;
      const shadowBlur = softness * 20;

      const shadowSVG = `
        <svg width="${width}" height="${height}">
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="${shadowOffsetX}"
              dy="${shadowOffsetY}"
              stdDeviation="${shadowBlur}"
              flood-color="rgba(0,0,0,${intensity})"
            />
          </filter>
        </svg>
      `;

      await pipeline
        .composite([{
          input: Buffer.from(shadowSVG),
          blend: 'multiply',
        }])
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 2500,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Shadow generation failed' };
    }
  }

  private async centerAndCrop(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(1000);

      const mode = settings.mode || 'auto';
      const aspectRatio = settings.aspectRatio || '4:3';
      const padding = settings.padding || 0.1;
      const centerOn = settings.centerOn || 'vehicle';
      const outputSizes = settings.outputSizes || ['1200x900', '1920x1080', '1080x1080'];

      const [targetW, targetH] = aspectRatio.split(':').map(Number);
      const targetAspect = targetW / targetH;

      const pipeline = sharp(inputPath);
      const metadata = await pipeline.metadata();
      const width = metadata.width || 1200;
      const height = metadata.height || 900;
      const currentAspect = width / height;

      let cropWidth, cropHeight, cropX, cropY;

      if (currentAspect > targetAspect) {
        cropHeight = height;
        cropWidth = height * targetAspect;
        cropX = (width - cropWidth) / 2;
        cropY = 0;
      } else {
        cropWidth = width;
        cropHeight = width / targetAspect;
        cropX = 0;
        cropY = (height - cropHeight) / 2;
      }

      // Add padding
      const padX = cropWidth * (settings.padding || 0.1);
      const padY = cropHeight * (settings.padding || 0.1);
      cropX = Math.max(0, cropX - padX);
      cropY = Math.max(0, cropY - padY);
      cropWidth = Math.min(cropWidth + padX * 2, width - cropX);
      cropHeight = Math.min(cropHeight + padY * 2, height - cropY);

      const results = [];
      for (const size of outputSizes) {
        const [outW, outH] = size.split('x').map(Number);
        const outputPath = outputPath.replace(/\.[^.]+$/, `_${size}.png`);

        await sharp(inputPath)
          .extract({ left: Math.round(cropX), top: Math.round(cropY), width: Math.round(cropWidth), height: Math.round(cropHeight) })
          .resize(outW, outH, { fit: 'cover', position: 'center' })
          .toFile(outputPath);

        results.push({ size, path: outputPath });
      }

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 1000,
          variants: results,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Centering and crop failed' };
    }
  }

  private async enhanceImage(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    try {
      await this.simulateProcessing(1500);

      const sharpen = settings.sharpen || 0.3;
      const denoise = settings.denoise || 0.2;
      const clarity = settings.clarity || 0.15;
      const vibrance = settings.vibrance || 0.1;

      const pipeline = sharp(inputPath);

      // Apply enhancements
      await pipeline
        .sharpen(sharpen > 0 ? { sigma: sharpen * 2, flat: 1, jagged: 2 } : undefined)
        .modulate({
          brightness: 1,
          saturation: 1 + (settings.vibrance || 0),
        })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 1500,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Image enhancement failed' };
    }
  }

  private async batchUnify(inputPath: string, outputPath: string, settings: any): Promise<ProcessingResult> {
    // This would process multiple images - simplified for single file
    try {
      await this.simulateProcessing(3000);

      // In real implementation, this would process multiple images
      await sharp(inputPath).toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        outputPath,
        metadata: {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          format: outputMetadata.format || 'png',
          size: outputStats.size,
          processingTime: 3000,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Batch unify failed' };
    }
  }

  private async simulateProcessing(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods
  async getImageMetadata(filePath: string) {
    return sharp(filePath).metadata();
  }

  async createThumbnail(inputPath: string, outputPath: string, width = 300, height = 300) {
    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .toFile(outputPath);
    return outputPath;
  }

  async convertFormat(inputPath: string, outputPath: string, format: 'jpeg' | 'png' | 'webp', quality = 90) {
    await sharp(inputPath)
      .toFormat(format, { quality })
      .toFile(outputPath);
    return outputPath;
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | undefined> {
    return this.jobs.get(jobId);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      this.jobQueue = this.jobQueue.filter(id => id !== jobId);
      return true;
    }
    return false;
  }

  getQueueStats() {
    return {
      pending: this.jobQueue.length,
      processing: this.getProcessingCount(),
      completed: this.getJobsByStatus('completed').length,
      failed: this.getJobsByStatus('failed').length,
    };
  }
}

export const imageProcessingService = new ImageProcessingService();
export default imageProcessingService;
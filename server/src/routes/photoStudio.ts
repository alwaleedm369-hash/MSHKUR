import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { uploadRateLimiter } from '@middleware/rateLimiter';
import { logger } from '@utils/logger';
import { imageProcessingService } from '@services/imageProcessing';
import { storageService } from '@services/storage';
import multer from 'multer';

const router = Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, HEIC allowed.'), false);
    }
    cb(null, true);
  },
});

// Validation middleware
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Upload images
router.post('/images/upload',
  uploadRateLimiter,
  upload.array('images', 20),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const userId = (req as any).user.id;
    const uploadedImages = [];

    for (const file of req.files as Express.Multer.File[]) {
      // Save original file
      const originalPath = await storageService.saveOriginal(file.buffer, file.originalname, file.mimetype);

      // Create image record
      const image = await prisma.image.create({
        data: {
          userId,
          originalName: file.originalname,
          originalPath,
          mimeType: file.mimetype,
          size: file.size,
          status: 'UPLOADED',
        },
      });

      uploadedImages.push({
        id: image.id,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        status: 'UPLOADED',
      });
    }

    res.status(201).json({
      success: true,
      data: { images: uploadedImages },
    });
  })
);

// Get user's images
router.get('/images',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const where: any = { userId };
    if (status) where.status = status;

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          originalName: true,
          originalPath: true,
          processedPath: true,
          mimeType: true,
          size: true,
          status: true,
          width: true,
          height: true,
          createdAt: true,
          processedAt: true,
        },
      }),
      prisma.image.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get single image
router.get('/images/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const imageId = req.params.id;

    const image = await prisma.image.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
      include: {
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    res.json({
      success: true,
      data: { image },
    });
  })
);

// Delete image
router.delete('/images/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const imageId = req.params.id;

    const image = await prisma.image.findFirst({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Delete files
    await storageService.deleteFile(image.originalPath);
    if (image.processedPath) {
      await storageService.deleteFile(image.processedPath);
    }

    // Delete database record
    await prisma.image.delete({ where: { id: imageId } });

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  })
);

// Start processing job
router.post('/jobs',
  [
    body('imageId').isUUID().withMessage('Valid image ID required'),
    body('type').isIn([
      'background-removal',
      'license-plate-blur',
      'glass-tinting',
      'lighting-enhancement',
      'shadow-generation',
      'centering-crop',
      'image-enhancement',
      'batch-unify',
    ]).withMessage('Invalid job type'),
    body('settings').optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { imageId, type, settings } = req.body;

    // Verify image ownership
    const image = await prisma.image.findFirst({
      where: { id: req.body.imageId, userId: (req as any).user.id },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Create processing job
    const job = await prisma.processingJob.create({
      data: {
        userId,
        imageId: req.body.imageId,
        type: req.body.type,
        settings: req.body.settings || {},
        status: 'PENDING',
      },
    });

    // Start processing (async)
    imageProcessingService.createJob({
      id: `job-${Date.now()}`,
      type: req.body.type,
      inputPath: image.originalPath,
      outputPath: '', // Will be generated
      settings: req.body.settings || {},
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    }).catch(err => console.error('Processing error:', err));

    res.status(201).json({
      success: true,
      data: { job },
    });
  })
);

// Get processing jobs
router.get('/jobs',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const where: any = { userId };
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.processingJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          image: {
            select: { id: true, originalName: true, originalPath: true },
          },
        },
      }),
      prisma.processingJob.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(req.query.page as string) || 1,
          limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get job status
router.get('/jobs/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const jobId = req.params.id;

    const job = await prisma.processingJob.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
      include: {
        image: {
          select: { id: true, originalName: true, originalPath: true, processedPath: true },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    res.json({
      success: true,
      data: { job },
    });
  })
);

// Cancel job
router.post('/jobs/:id/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const jobId = req.params.id;

    const job = await prisma.processingJob.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'PENDING') {
      throw new Error('Can only cancel pending jobs');
    }

    await prisma.processingJob.update({
      where: { id: jobId },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Job cancelled',
    });
  })
);

// Download processed image
router.get('/images/:id/download',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const imageId = req.params.id;

    const image = await prisma.image.findFirst({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    const filePath = image.processedPath || image.originalPath;
    const fileName = image.processedPath ? `processed_${image.originalName}` : image.originalName;

    res.download(filePath, fileName);
  })
);

// Get processing queue stats
router.get('/queue/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = imageProcessingService.getQueueStats();
    res.json({
      success: true,
      data: stats,
    });
  })
);

export default router;
import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { uploadRateLimiter } from '@middleware/rateLimiter';
import { logger } from '@utils/logger';
import { storageService } from '@services/storage';
import multer from 'multer';

const router = Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File type not allowed'), false);
    }
    cb(null, true);
  },
});

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Upload single file
router.post('/single',
  uploadRateLimiter,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const userId = (req as any).user.id;
    const { folder = 'uploads' } = req.body;

    const filePath = await storageService.saveFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    const fileRecord = await prisma.file.create({
      data: {
        userId: (req as any).user.id,
        originalName: req.file.originalname,
        path: filePath,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folder,
      },
    });

    res.status(201).json({
      success: true,
      data: { file: fileRecord },
    });
  })
);

// Upload multiple files
router.post('/multiple',
  uploadRateLimiter,
  upload.array('files', 20),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const userId = (req as any).user.id;
    const { folder = 'uploads' } = req.body;

    const uploadedFiles = [];

    for (const file of req.files as Express.Multer.File[]) {
      const filePath = await storageService.saveFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'uploads'
      );

      const fileRecord = await prisma.file.create({
        data: {
          userId: (req as any).user.id,
          originalName: file.originalname,
          path: filePath,
          mimeType: file.mimetype,
          size: file.size,
          folder: 'uploads',
        },
      });

      uploadedFiles.push({
        id: fileRecord.id,
        originalName: file.originalname,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    res.status(201).json({
      success: true,
      data: { files: uploadedFiles },
    });
  })
);

// Get user's files
router.get('/files',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('folder').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const folder = req.query.folder as string;

    const where: any = { userId: (req as any).user.id };
    if (req.query.folder) where.folder = req.query.folder as string;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          originalName: true,
          path: true,
          mimeType: true,
          size: true,
          folder: true,
          createdAt: true,
        },
      }),
      prisma.file.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        files,
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

// Get file by ID
router.get('/files/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    res.json({
      success: true,
      data: { file },
    });
  })
);

// Download file
router.get('/files/:id/download',
  asyncHandler(async (req: Request, res: Response) => {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    res.download(file.path, file.originalName);
  })
);

// Delete file
router.delete('/files/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    await storageService.deleteFile(file.path);
    await prisma.file.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  })
);

// Get signed URL for direct upload (S3 compatible)
router.post('/signed-url',
  asyncHandler(async (req: Request, res: Response) => {
    const { fileName, mimeType, folder = 'uploads', expiresIn = 3600 } = req.body;

    const signedUrl = await storageService.getSignedUploadUrl(
      req.body.fileName,
      req.body.mimeType,
      req.body.folder || 'uploads',
      req.body.expiresIn || 3600
    );

    res.json({
      success: true,
      data: { signedUrl, expiresIn: req.body.expiresIn || 3600 },
    });
  })
);

// Get signed download URL
router.get('/files/:id/signed-url',
  asyncHandler(async (req: Request, res: Response) => {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    const expiresIn = parseInt(req.query.expiresIn as string) || 3600;
    const signedUrl = await storageService.getSignedDownloadUrl(file.path, expiresIn);

    res.json({
      success: true,
      data: { signedUrl, expiresIn },
    });
  })
);

// Create folder
router.post('/folders',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, parentId } = req.body;

    const folder = await prisma.folder.create({
      data: {
        name: req.body.name,
        userId: (req as any).user.id,
        parentId: req.body.parentId || null,
      },
    });

    res.status(201).json({
      success: true,
      data: { folder },
    });
  })
);

// List folders
router.get('/folders',
  asyncHandler(async (req: Request, res: Response) => {
    const folders = await prisma.folder.findMany({
      where: { userId: (req as any).user.id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { files: true, children: true } },
        children: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: { folders },
    });
  })
);

// Delete folder
router.delete('/folders/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.folder.delete({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    res.json({
      success: true,
      message: 'Folder deleted',
    });
  })
);

export default router;
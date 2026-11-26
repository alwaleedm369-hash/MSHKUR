import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import { geminiService } from '@services/gemini';
import { storageService } from '@services/storage';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Create ad
router.post('/ads',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { vehicleData, images, content, templateId, platform } = req.body;

    // Validate required fields
    if (!vehicleData?.make || !vehicleData?.model || !vehicleData?.year || !vehicleData?.price) {
      throw new Error('Vehicle data incomplete');
    }

    // Create ad record
    const ad = await prisma.ad.create({
      data: {
        userId,
        vehicleData,
        images: images || [],
        content: content || {},
        templateId: templateId || 'modern',
        platform: platform || 'web',
        status: 'DRAFT',
      },
    });

    res.status(201).json({
      success: true,
      data: { ad },
    });
  })
);

// Get user's ads
router.get('/ads',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const where: any = { userId };
    if (status) where.status = status;

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          status: true,
          platform: true,
          templateId: true,
          vehicleData: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
        },
      }),
      prisma.ad.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        ads,
        pagination: {
          page: parseInt(req.query.page as string) || 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get single ad
router.get('/ads/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const adId = req.params.id;

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId: (req as any).user.id },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    res.json({
      success: true,
      data: { ad },
    });
  })
);

// Update ad
router.patch('/ads/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const adId = req.params.id;

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: {
        vehicleData: req.body.vehicleData || ad.vehicleData,
        content: req.body.content || ad.content,
        templateId: req.body.templateId || ad.templateId,
        platform: req.body.platform || ad.platform,
        status: req.body.status || ad.status,
      },
    });

    res.json({
      success: true,
      data: { ad: updated },
    });
  })
);

// Delete ad
router.delete('/ads/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const adId = req.params.id;

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId: (req as any).user.id },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    await prisma.ad.delete({ where: { id: adId } });

    res.json({
      success: true,
      message: 'Ad deleted successfully',
    });
  })
);

// Generate ad content with AI
router.post('/generate-content',
  asyncHandler(async (req: Request, res: Response) => {
    const { vehicleData, options } = req.body;

    if (!vehicleData?.make || !vehicleData?.model || !vehicleData?.year || !vehicleData?.price) {
      throw new Error('Vehicle data incomplete');
    }

    const prompt = `
You are a professional car listing copywriter for the Saudi Arabian market.
Generate a compelling car advertisement based on this vehicle data:
${JSON.stringify(vehicleData, null, 2)}

Tone: ${options?.tone || 'professional'}
Language: ${options?.language || 'ar'}
Length: ${options?.length || 'medium'}

Return JSON with:
{
  "title": "Compelling title (max 80 chars)",
  "description": "Detailed description",
  "tags": ["tag1", "tag2"],
  "variants": [
    { "tone": "professional", "title": "...", "description": "..." },
    { "tone": "enthusiastic", "title": "...", "description": "..." }
  ]
}`;

    const result = await geminiService.generateStructuredOutput(prompt, {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tone: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: result,
    });
  })
);

// Get templates
router.get('/templates',
  asyncHandler(async (req: Request, res: Response) => {
    const templates = [
      { id: 'modern', name: 'Modern', nameAr: 'عصري', preview: '/templates/modern.png' },
      { id: 'classic', name: 'Classic', nameAr: 'كلاسيكي', preview: '/templates/classic.png' },
      { id: 'minimal', name: 'Minimal', nameAr: 'بسيط', preview: '/templates/minimal.png' },
      { id: 'bold', name: 'Bold', nameAr: 'جريء', preview: '/templates/bold.png' },
      { id: 'luxury', name: 'Luxury', nameAr: 'فاخر', preview: '/templates/luxury.png' },
      { id: 'sporty', name: 'Sporty', nameAr: 'رياضي', preview: '/templates/sporty.png' },
    ];

    res.json({
      success: true,
      data: { templates },
    });
  })
);

// Get platforms
router.get('/platforms',
  asyncHandler(async (req: Request, res: Response) => {
    const platforms = [
      { id: 'haraj', name: 'Haraj', nameAr: 'حراج', color: 'green', requiresAuth: true },
      { id: 'facebook', name: 'Facebook Marketplace', nameAr: 'فيسبوك ماركت بليس', color: 'blue', requiresAuth: true },
      { id: 'instagram', name: 'Instagram', nameAr: 'إنستغرام', color: 'pink', requiresAuth: true },
      { id: 'snapchat', name: 'Snapchat', nameAr: 'سناب شات', color: 'yellow', requiresAuth: true },
      { id: 'twitter', name: 'Twitter/X', nameAr: 'تويتر', color: 'blue', requiresAuth: true },
      { id: 'export-pdf', name: 'Export PDF', nameAr: 'تصدير PDF', color: 'red', requiresAuth: false },
      { id: 'export-html', name: 'Export HTML', nameAr: 'تصدير HTML', color: 'purple', requiresAuth: false },
      { id: 'share-link', name: 'Share Link', nameAr: 'مشاركة الرابط', color: 'indigo', requiresAuth: false },
    ];

    res.json({
      success: true,
      data: { platforms },
    });
  })
);

// Publish ad
router.post('/ads/:id/publish',
  asyncHandler(async (req: Request, res: Response) => {
    const adId = req.params.id;
    const { platforms } = req.body;

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId: (req as any).user.id },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    // In a real app, this would trigger publishing to each platform
    // For now, just update status
    const updated = await prisma.ad.update({
      where: { id: adId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedPlatforms: platforms || [],
      },
    });

    // TODO: Implement actual platform publishing
    // await publishToPlatforms(ad, platforms);

    res.json({
      success: true,
      data: { ad: updated },
    });
  })
);

// Export ad
router.get('/ads/:id/export',
  asyncHandler(async (req: Request, res: Response) => {
    const adId = req.params.id;
    const format = req.query.format as string || 'pdf';

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId: (req as any).user.id },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    // In a real app, generate PDF/HTML
    // For now, return the data
    res.json({
      success: true,
      data: {
        ad,
        format,
        downloadUrl: `/api/v1/ad-studio/ads/${adId}/download?format=${format}`,
      },
    });
  })
);

// Duplicate ad
router.post('/ads/:id/duplicate',
  asyncHandler(async (req: Request, res: Response) => {
    const adId = req.params.id;

    const ad = await prisma.ad.findFirst({
      where: { id: adId, userId: (req as any).user.id },
    });

    if (!ad) {
      throw new Error('Ad not found');
    }

    const duplicated = await prisma.ad.create({
      data: {
        userId: (req as any).user.id,
        vehicleData: ad.vehicleData,
        images: ad.images,
        content: ad.content,
        templateId: ad.templateId,
        platform: ad.platform,
        status: 'DRAFT',
      },
    });

    res.status(201).json({
      success: true,
      data: { ad: duplicated },
    });
  })
);

export default router;
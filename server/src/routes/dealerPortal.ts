import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Dashboard stats
router.get('/dashboard/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;

    const [vehiclesCount, adsCount, inquiriesCount, salesCount] = await Promise.all([
      prisma.vehicle.count({ where: { dealerId, status: 'AVAILABLE' } }),
      prisma.ad.count({ where: { dealerId, status: 'PUBLISHED' } }),
      prisma.inquiry.count({ where: { dealerId, status: 'NEW' } }),
      prisma.sale.count({ where: { dealerId, createdAt: { gte: new Date(new Date().setDate(1)) } } }),
    ]);

    const stats = [
      { label: 'Available Vehicles', labelAr: 'سيارات متاحة', value: vehiclesCount, change: '+3', trend: 'up', icon: 'Package', color: 'emerald' },
      { label: 'Active Ads', labelAr: 'إعلانات نشطة', value: adsCount, change: '+2', trend: 'up', icon: 'Megaphone', color: 'blue' },
      { label: 'New Inquiries', labelAr: 'استفسارات جديدة', value: inquiriesCount, change: '+5', trend: 'up', icon: 'MessageSquare', color: 'amber' },
      { label: 'Sales This Month', labelAr: 'مبيعات هذا الشهر', value: salesCount, change: '+4', trend: 'up', icon: 'DollarSign', color: 'purple' },
    ];

    res.json({ success: true, data: { stats } });
  })
);

// Recent inquiries
router.get('/inquiries/recent',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;

    const inquiries = await prisma.inquiry.findMany({
      where: { dealerId: (req as any).user.dealerId || (req as any).user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        vehicle: { select: { make: true, model: true, year: true } },
        customer: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { inquiries } });
  })
);

// Vehicles (Inventory)
router.get('/vehicles',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['AVAILABLE', 'PENDING', 'SOLD', 'DRAFT']),
    query('search').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = { dealerId: (req as any).user.dealerId || (req as any).user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { inquiries: true, ads: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    });
  })
);

// Get single vehicle
router.get('/vehicles/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, dealerId: (req as any).user.dealerId || (req as any).user.id },
      include: {
        images: true,
        ads: true,
        inquiries: { include: { customer: true } },
        sales: true,
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    res.json({ success: true, data: { vehicle } });
  })
);

// Create vehicle
router.post('/vehicles',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;

    const vehicle = await prisma.vehicle.create({
      data: {
        dealerId,
        ...req.body,
        images: req.body.images || [],
      },
    });

    res.status(201).json({ success: true, data: { vehicle } });
  })
);

// Update vehicle
router.patch('/vehicles/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id, dealerId: (req as any).user.dealerId || (req as any).user.id },
      data: req.body,
    });

    res.json({ success: true, data: { vehicle } });
  })
);

// Delete vehicle
router.delete('/vehicles/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.vehicle.delete({
      where: { id: req.params.id, dealerId: (req as any).user.dealerId || (req as any).user.id },
    });

    res.json({ success: true, message: 'Vehicle deleted' });
  })
);

// Customers
router.get('/customers',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: { dealerId: (req as any).user.dealerId || (req as any).user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
        include: {
          _count: { select: { inquiries: true } },
          inquiries: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.customer.count({ where: { dealerId: (req as any).user.dealerId || (req as any).user.id } }),
    ]);

    res.json({ success: true, data: { customers, pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
  })
);

// Marketing
router.get('/marketing/campaigns',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;

    const campaigns = await prisma.campaign.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { posts: true } } },
    });

    res.json({ success: true, data: { campaigns } });
  })
);

router.post('/marketing/campaigns',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;

    const campaign = await prisma.campaign.create({
      data: { dealerId, ...req.body },
    });

    res.status(201).json({ success: true, data: { campaign } });
  })
);

// Profile
router.get('/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const dealer = await prisma.dealer.findUnique({
      where: { id: (req as any).user.dealerId || (req as any).user.id },
      include: {
        _count: { select: { vehicles: true, customers: true, campaigns: true } },
      },
    });

    if (!dealer) {
      throw new Error('Dealer not found');
    }

    res.json({ success: true, data: { dealer } });
  })
);

router.patch('/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const dealer = await prisma.dealer.update({
      where: { id: (req as any).user.dealerId || (req as any).user.id },
      data: req.body,
    });

    res.json({ success: true, data: { dealer } });
  })
);

// QR Code for showroom
router.get('/profile/qr',
  asyncHandler(async (req: Request, res: Response) => {
    const dealerId = (req as any).user.dealerId || (req as any).user.id;
    const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });

    if (!dealer) throw new Error('Dealer not found');

    // Generate QR code URL
    const qrUrl = `${process.env.FRONTEND_URL}/dealer/${dealer.slug || dealerId}`;

    res.json({
      success: true,
      data: {
        qrUrl,
        dealerUrl: qrUrl,
        dealerName: dealer.name,
      },
    });
  })
);

export default router;
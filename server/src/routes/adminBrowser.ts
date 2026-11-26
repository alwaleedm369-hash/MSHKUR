import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import { requireAdmin } from '@middleware/auth';
import { githubService } from '@services/github';
import { queueService } from '@services/queue';
import { analyticsService } from '@services/analytics';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard overview
router.get('/dashboard',
  asyncHandler(async (req: Request, res: Response) => {
    const [
      usersCount,
      dealersCount,
      vehiclesCount,
      adsCount,
      inquiriesCount,
      sessionsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dealer.count(),
      prisma.vehicle.count(),
      prisma.ad.count(),
      prisma.inquiry.count(),
      prisma.chatSession.count(),
    ]);

    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const systemHealth = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.ad.count({ where: { status: 'PUBLISHED' } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          users: usersCount,
          dealers: dealersCount,
          vehicles: vehiclesCount,
          ads: adsCount,
          inquiries: inquiriesCount,
          sessions: sessionsCount,
        },
        recentActivity,
        systemHealth: {
          activeUsers: systemHealth[0],
          availableVehicles: systemHealth[1],
          publishedAds: systemHealth[2],
        },
      },
    });
  })
);

// System metrics
router.get('/metrics',
  asyncHandler(async (req: Request, res: Response) => {
    const metrics = await analyticsService.getSystemMetrics();
    res.json({ success: true, data: metrics });
  })
);

// User management
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('role').optional().isIn(['USER', 'DEALER', 'ADMIN']),
    query('search').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const role = req.query.role as string;
    const search = req.query.search as string;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          dealerId: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { vehicles: true, ads: true, sessions: true } },
        },
      }),
      prisma.user.count({ where }),
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    });
  })
);

// Toggle user status
router.patch('/users/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });

    res.json({ success: true, data: { user } });
  })
);

// GitHub integration
router.get('/github/repos',
  asyncHandler(async (req: Request, res: Response) => {
    const repos = await githubService.getRepositories();
    res.json({ success: true, data: { repos } });
  })
);

router.get('/github/repos/:owner/:repo',
  asyncHandler(async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const repoData = await githubService.getRepository(owner, repo);
    res.json({ success: true, data: { repo: repoData } });
  })
);

router.get('/github/repos/:owner/:repo/commits',
  asyncHandler(async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const commits = await githubService.getCommits(req.params.owner, req.params.repo);
    res.json({ success: true, data: { commits } });
  })
);

router.post('/github/repos/:owner/:repo/deploy',
  asyncHandler(async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const { branch = 'main', environment = 'staging' } = req.body;

    const deployment = await githubService.triggerDeployment(owner, repo, branch, environment);
    res.json({ success: true, data: { deployment } });
  })
);

// Task management
router.get('/tasks',
  [
    query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('assignee').optional().isUUID(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assignee = req.query.assignee as string;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignee) where.assigneeId = assignee;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    );

    res.json({ success: true, data: { tasks } });
  })
);

router.post('/tasks',
  [
    body('title').notEmpty().withMessage('Title required'),
    body('description').optional().isString(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('assigneeId').optional().isUUID(),
    body('tags').optional().isArray(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        createdById: (req as any).user.id,
      },
    });

    res.status(201).json({ success: true, data: { task } });
  })
);

router.patch('/tasks/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ success: true, data: { task } });
  })
);

router.delete('/tasks/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Task deleted' });
  })
);

// Queue management
router.get('/queue/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await queueService.getQueueStats();
    res.json({ success: true, data: stats });
  })
);

router.get('/queue/jobs',
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string;
    const jobs = await queueService.getJobs(status);
    res.json({ success: true, data: { jobs } });
  })
);

router.post('/queue/jobs/:id/retry',
  asyncHandler(async (req: Request, res: Response) => {
    await queueService.retryJob(req.params.id);
    res.json({ success: true, message: 'Job retried' });
  })
);

router.delete('/queue/jobs/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await queueService.removeJob(req.params.id);
    res.json({ success: true, message: 'Job removed' });
  })
);

// Logs
router.get('/logs',
  [
    query('level').optional().isIn(['error', 'warn', 'info', 'debug']),
    query('service').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // In a real implementation, this would query a log aggregation service
    // For now, return mock data
    res.json({
      success: true,
      data: {
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Server started', service: 'api' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'Database connected', service: 'db' },
          { timestamp: new Date().toISOString(), level: 'warn', message: 'High memory usage', service: 'monitor' },
        ],
      },
    });
  })
);

// System settings
router.get('/settings',
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await prisma.setting.findMany();
    res.json({ success: true, data: { settings } });
  })
);

router.patch('/settings',
  [
    body('key').notEmpty().withMessage('Key required'),
    body('value').notEmpty().withMessage('Value required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { key, value, description } = req.body;

    const setting = await prisma.setting.upsert({
      where: { key: req.body.key },
      create: { key: req.body.key, value: req.body.value, description: req.body.description },
      update: { value: req.body.value, description: req.body.description },
    });

    res.json({ success: true, data: { setting } });
  })
);

// Maintenance mode
router.post('/maintenance',
  [
    body('enabled').isBoolean(),
    body('message').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { enabled, message } = req.body;

    await prisma.setting.upsert({
      where: { key: 'maintenance_mode' },
      create: { key: 'maintenance_mode', value: JSON.stringify({ enabled, message }) },
      update: { value: JSON.stringify({ enabled, message }) },
    });

    res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
  })
);

// Backup management
router.post('/backup',
  asyncHandler(async (req: Request, res: Response) => {
    // Trigger backup
    const backup = await queueService.addJob('backup', { type: 'full' });
    res.json({ success: true, data: { backupId: backup.id } });
  })
);

router.get('/backups',
  asyncHandler(async (req: Request, res: Response) => {
    // List backups
    res.json({ success: true, data: { backups: [] } });
  })
);

router.post('/backups/:id/restore',
  asyncHandler(async (req: Request, res: Response) => {
    const backupId = req.params.id;
    const restore = await queueService.addJob('restore', { backupId });
    res.json({ success: true, data: { restoreId: restore.id } });
  })
);

// Clear cache
router.post('/cache/clear',
  asyncHandler(async (req: Request, res: Response) => {
    // Clear cache
    res.json({ success: true, message: 'Cache cleared' });
  })
);

export default router;
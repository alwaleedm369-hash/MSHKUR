import { Router, Request, Response } from 'express';
import { healthCheck } from '@services/initializer';
import { config } from '@config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: {
        ...health,
        version: '1.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
      },
    });
  }
});

router.get('/ready', async (req: Request, res: Response) => {
  try {
    const health = await healthCheck();
    const isReady = health.status !== 'unhealthy';

    res.status(isReady ? 200 : 503).json({
      success: isReady,
      data: {
        ready: isReady,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: { ready: false },
    });
  }
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      alive: true,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import crypto from 'crypto';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// GitHub webhook
router.post('/github',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);

    // Verify signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const event = req.headers['x-github-event'] as string;
    const deliveryId = req.headers['x-github-delivery'] as string;

    logger.info('GitHub webhook received', { event, deliveryId });

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        source: 'github',
        event,
        deliveryId,
        payload: req.body,
      },
    });

    // Process based on event type
    switch (req.headers['x-github-event']) {
      case 'push':
        // Handle push event
        await handlePushEvent(req.body);
        break;
      case 'pull_request':
        // Handle PR event
        await handlePullRequestEvent(req.body);
        break;
      case 'deployment':
        // Handle deployment event
        await handleDeploymentEvent(req.body);
        break;
      case 'workflow_run':
        // Handle workflow run
        await handleWorkflowRunEvent(req.body);
        break;
    }

    res.json({ success: true });
  })
);

// Stripe webhook (for future payments)
router.post('/stripe',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
      throw new Error('Webhook signature verification failed');
    }

    // Handle Stripe events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object);
        break;
    }

    res.json({ received: true });
  })
);

// WhatsApp webhook
router.post('/whatsapp',
  asyncHandler(async (req: Request, res: Response) => {
    // WhatsApp Business API webhook
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            if (messages) {
              for (const message of messages) {
                await handleWhatsAppMessage(message);
              }
            }
          }
        }
      }
    }

    res.status(200).send('OK');
  })
);

// Haraj webhook
router.post('/haraj',
  asyncHandler(async (req: Request, res: Response) => {
    // Haraj webhook for listing updates, messages, etc.
    logger.info('Haraj webhook received', { body: req.body });

    await prisma.webhookEvent.create({
      data: {
        source: 'haraj',
        event: req.body.event_type || 'unknown',
        deliveryId: req.headers['x-haraj-delivery'] as string || '',
        payload: req.body,
      },
    });

    res.json({ success: true });
  })
);

// Google Workspace webhook
router.post('/google-workspace',
  asyncHandler(async (req: Request, res: Response) => {
    // Google Workspace push notifications
    const channelId = req.headers['x-goog-channel-id'] as string;
    const resourceId = req.headers['x-goog-resource-id'] as string;
    const resourceState = req.headers['x-goog-resource-state'] as string;

    logger.info('Google Workspace webhook', { channelId, resourceId, resourceState });

    await prisma.webhookEvent.create({
      data: {
        source: 'google-workspace',
        event: resourceState,
        deliveryId: channelId,
        payload: req.body,
      },
    );

    res.status(200).send('OK');
  })
);

// Generic webhook endpoint for custom integrations
router.post('/custom/:integrationId',
  asyncHandler(async (req: Request, res: Response) => {
    const { integrationId } = req.params;

    await prisma.webhookEvent.create({
      data: {
        source: 'custom',
        event: `custom:${integrationId}`,
        deliveryId: req.headers['x-delivery-id'] as string || '',
        payload: req.body,
      },
    });

    res.json({ success: true });
  })
);

// List webhook events
router.get('/events',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const source = req.query.source as string;

    const where: any = {};
    if (req.query.source) where.source = req.query.source;

    const [events, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(req.query.page as string) - 1) * 50,
        take: 50,
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      },
    });
  })
);

// Webhook event handlers
async function handlePushEvent(payload: any) {
  // Handle GitHub push event
  // Trigger CI/CD, update deployment status, etc.
}

async function handlePullRequestEvent(payload: any) {
  // Handle PR opened, closed, merged, etc.
}

async function handleDeploymentEvent(payload: any) {
  // Handle deployment status updates
}

async function handleWorkflowRunEvent(payload: any) {
  // Handle GitHub Actions workflow runs
}

async function handleWhatsAppMessage(message: any) {
  // Process incoming WhatsApp message
  // Store in database, trigger auto-reply if configured
}

async function handlePaymentSuccess(paymentIntent: any) {
  // Handle successful payment
}

async function handlePaymentFailed(paymentIntent: any) {
  // Handle failed payment
}

async function handleInvoicePaid(invoice: any) {
  // Handle invoice payment
}

export default router;
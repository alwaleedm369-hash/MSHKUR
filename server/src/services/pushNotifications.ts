import { logger } from '@utils/logger';
import { config } from '@config';
import webpush from 'web-push';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

class PushNotificationService {
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;
  private initialized = false;

  constructor() {
    if (config.vapidPublicKey && config.vapidPrivateKey) {
      this.vapidKeys = {
        publicKey: config.vapidPublicKey,
        privateKey: config.vapidPrivateKey,
      };
      webpush.setVapidDetails(
        config.vapidSubject || 'mailto:admin@mshkur.ai',
        config.vapidPublicKey,
        config.vapidPrivateKey
      );
      this.initialized = true;
    } else {
      logger.warn('VAPID keys not configured, push notifications disabled');
    }
  }

  async subscribe(userId: string, subscription: PushSubscription): Promise<void> {
    // Store subscription in database
    // await prisma.pushSubscription.upsert({
    //   where: { userId_endpoint: { userId, endpoint: subscription.endpoint } },
    //   create: { userId, ...subscription },
    //   update: { ...subscription },
    // });
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    // await prisma.pushSubscription.delete({
    //   where: { userId_endpoint: { userId, endpoint } },
    // });
  }

  async getSubscriptions(userId: string): Promise<any[]> {
    // return prisma.pushSubscription.findMany({ where: { userId } });
    return [];
  }

  async sendNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    if (!this.initialized) {
      logger.warn('Push notifications not initialized');
      return { sent: 0, failed: 0 };
    }

    const subscriptions = await this.getSubscriptions(userId);
    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        failed++;
        logger.warn('Push notification failed', {
          userId,
          endpoint: sub.endpoint,
          error: error.message,
        });

        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          // await this.unsubscribe(userId, sub.endpoint);
        }
      }
    }

    return { sent, failed };
  }

  async sendToAll(payload: NotificationPayload): Promise<{ sent: number; failed: number }> {
    // Get all subscriptions
    // const subscriptions = await prisma.pushSubscription.findMany();
    // Implementation would iterate over all subscriptions
    return { sent: 0, failed: 0 };
  }

  async sendToSegment(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, payload);
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return { sent: totalSent, failed: totalFailed };
  }

  // Predefined notification templates
  static readonly TEMPLATES = {
    NEW_INQUIRY: (data: { carName: string; customerName: string }) => ({
      title: 'New Inquiry',
      body: `${data.customerName} is interested in ${data.carName}`,
      icon: '/icons/inquiry.png',
      tag: 'inquiry',
      data: { type: 'inquiry' },
    }),
    NEW_MESSAGE: (data: { senderName: string; preview: string }) => ({
      title: 'New Message',
      body: `${data.senderName}: ${data.preview}`,
      icon: '/icons/message.png',
      tag: 'message',
      data: { type: 'message' },
    }),
    TASK_REMINDER: (data: { title: string; time: string }) => ({
      title: 'Task Reminder',
      body: `${data.title} at ${data.time}`,
      icon: '/icons/calendar.png',
      tag: 'task',
      requireInteraction: true,
      data: { type: 'task' },
    }),
    VEHICLE_SOLD: (data: { carName: string; price: string }) => ({
      title: 'Vehicle Sold!',
      body: `${data.carName} sold for ${data.price}`,
      icon: '/icons/sale.png',
      tag: 'sale',
      data: { type: 'sale' },
    }),
    PRICE_DROP_ALERT: (data: { carName: string; oldPrice: string; newPrice: string }) => ({
      title: 'Price Drop Alert',
      body: `${data.carName} price dropped from ${data.oldPrice} to ${data.newPrice}`,
      icon: '/icons/price-drop.png',
      tag: 'price-alert',
      data: { type: 'price-alert' },
    }),
    MAINTENANCE_REMINDER: (data: { carName: string; service: string }) => ({
      title: 'Maintenance Due',
      body: `${data.carName} needs ${data.service}`,
      icon: '/icons/maintenance.png',
      tag: 'maintenance',
      data: { type: 'maintenance' },
    ),
  };

  // Generate notification from template
  generateFromTemplate(
    template: keyof typeof PushNotificationService.TEMPLATES,
    data: any
  ): NotificationPayload {
    const templateFn = this.TEMPLATES[template];
    if (!templateFn) {
      throw new Error(`Unknown template: ${template}`);
    }
    return templateFn(data);
  }

  // Schedule notification for later
  async scheduleNotification(
    userId: string,
    payload: NotificationPayload,
    sendAt: Date
  ): Promise<void> {
    const delay = sendAt.getTime() - Date.now();
    if (delay <= 0) {
      await this.sendNotification(userId, payload);
      return;
    }

    // In a real implementation, you'd use a job queue
    // await queueService.addDelayedJob('push-notifications', {
    //   type: 'send-notification',
    //   payload: { userId, payload },
    // }, sendAt.getTime() - Date.now());
  }

  // Send recurring notification
  async scheduleRecurringNotification(
    userId: string,
    payload: NotificationPayload,
    cronPattern: string
  ): Promise<void> {
    // In a real implementation, use a cron job
    // await queueService.addRecurringJob('push-notifications', {
    //   type: 'send-notification',
    //   payload: { userId, payload },
    // }, cronPattern);
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
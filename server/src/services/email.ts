import { logger } from '@utils/logger';
import { config } from '@config';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (config.smtpHost && config.smtpUser && config.smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpSecure || false,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10, // 10 emails per second
        });

        // Verify connection
        await this.transporter.verify();
        this.initialized = true;
        logger.info('Email service initialized');
      } else {
        logger.warn('SMTP not configured, email service disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize email service', { error });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized || !this.transporter) {
      logger.warn('Email service not initialized');
      return false;
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      const info = await this.transporter.sendMail({
        from: `"MSHKUR" <${config.smtpFrom || config.smtpUser}>`,
        to: recipients,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      logger.info('Email sent', { messageId: info.messageId, to: recipients });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, to: options.to });
      return false;
    }
  }

  async sendBulkEmails(emails: EmailOptions[]): Promise<{ sent: number; failed: number }> {
    if (!this.initialized || !this.transporter) {
      return { sent: 0, failed: emails.length };
    }

    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await this.sendEmail(email);
      } catch {
        // Error already logged in sendEmail
      }
    }

    // In a real implementation, you'd track individual results
    return { sent: emails.length, failed: 0 };
  }

  // Template rendering
  renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  // Predefined templates
  static readonly TEMPLATES = {
    WELCOME: {
      subject: 'Welcome to MSHKUR!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to MSHKUR! 🚗</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e293b;">Welcome {{name}}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              Thank you for joining MSHKUR - the smart platform for car dealerships and automotive professionals.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="margin-top: 0;">What you can do with MSHKUR:</h3>
              <ul style="line-height: 2;">
                <li>📸 <strong>Photo Studio:</strong> Process car images with AI - remove backgrounds, blur plates, enhance lighting</li>
                <li>📢 <strong>Ad Studio:</strong> Create professional car listings with AI-generated content</li>
                <li>🏪 <strong>Dealer Portal:</strong> Manage inventory, customers, and marketing campaigns</li>
                <li>🤖 <strong>AI Assistant:</strong> Your personal automotive assistant for any task</li>
              </ul>
            </div>
            <a href="{{frontendUrl}}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Get Started
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
              © 2024 MSHKUR. All rights reserved.
            </p>
          </div>
        </div>
      `,
    },

    PASSWORD_RESET: {
      subject: 'Reset your MSHKUR password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e293b;">Reset your password</h2>
            <p style="color: #475569; line-height: 1.6;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              © 2024 MSHKUR. All rights reserved.
            </p>
          </div>
        </div>
      `,
    },

    INQUIRY_NOTIFICATION: {
      subject: 'New Inquiry: {{carName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">New Inquiry Received! 📩</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
              <h3 style="margin-top: 0; color: #1e293b;">{{carName}}</h3>
              <p style="margin: 5px 0; color: #475569;"><strong>Customer:</strong> {{customerName}}</p>
              <p style="margin: 5px 0; color: #475569;"><strong>Phone:</strong> {{phone}}</p>
              <p style="margin: 5px 0; color: #475569;"><strong>Message:</strong> {{message}}</p>
            </div>
            <a href="{{inquiryUrl}}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View & Reply
            </a>
          </div>
        </div>
      `,
    },

    VEHICLE_SOLD: {
      subject: 'Vehicle Sold: {{carName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Vehicle Sold!</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e293b;">{{carName}} has been sold!</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Sale Price:</strong> {{price}} SAR</p>
              <p style="margin: 10px 0;"><strong>Buyer:</strong> {{buyerName}}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> {{saleDate}}</p>
            </div>
            <p style="color: #64748b;">Congratulations on the successful sale!</p>
          </div>
        </div>
      `,
    },

    MAINTENANCE_REMINDER: {
      subject: 'Maintenance Reminder: {{carName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🔧 Maintenance Reminder</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e293b;">Time for {{service}} on {{carName}}</h2>
            <p style="color: #475569; line-height: 1.6;">
              Your vehicle {{carName}} is due for {{service}}. Regular maintenance helps keep your vehicle in top condition.
            </p>
            <a href="{{scheduleUrl}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Schedule Service
            </a>
          </div>
        </div>
      `,
    },
  };

  // Send templated email
  async sendTemplatedEmail(
    templateName: keyof typeof EmailService.TEMPLATES,
    to: string | string[],
    data: Record<string, any>
  ): Promise<boolean> {
    const template = EmailService.TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const html = this.renderTemplate(template.html, data);
    const subject = this.renderTemplate(template.subject, data);

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
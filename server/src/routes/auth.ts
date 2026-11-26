import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '@services/prisma';
import { generateTokens, authRateLimiter } from '@middleware/auth';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  next();
};

// Register
router.post('/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
    body('role').optional().isIn(['USER', 'DEALER', 'ADMIN']).withMessage('Invalid role'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role = 'USER', phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        isActive: true,
        emailVerified: false,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entityType: 'User',
        entityId: user.id,
        newValues: { email: user.email, name: user.name, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
        tokens,
      },
    });
  })
);

// Login
router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    body('rememberMe').optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          entityType: 'User',
          entityId: user.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          severity: 'warning',
        },
      });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      dealerId: user.dealerId,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          dealerId: user.dealerId,
          avatar: user.avatar,
          preferences: user.preferences,
        },
        tokens,
      },
    });
  })
);

// Refresh token
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token required'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      const jwt = require('jsonwebtoken');
      const config = require('@config').config;

      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401, 'USER_INACTIVE');
      }

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        dealerId: user.dealerId,
      });

      res.json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  })
);

// Logout
router.post('/logout',
  asyncHandler(async (req: Request, res: Response) => {
    // In a real app, you'd blacklist the token
    // For now, just return success
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

// Get current user
router.get('/me',
  asyncHandler(async (req: any, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        dealerId: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Update profile
router.patch('/profile',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name too short'),
    body('phone').optional().isMobilePhone('ar-SA').withMessage('Invalid Saudi phone number'),
    body('preferences').optional().isObject(),
  ],
  validate,
  asyncHandler(async (req: any, res: Response) => {
    const { name, phone, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        preferences: preferences || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        preferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_PROFILE',
        entityType: 'User',
        entityId: req.user.id,
        newValues: { name, phone, preferences },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Change password
router.patch('/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  asyncHandler(async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password incorrect', 401, 'INVALID_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHANGE_PASSWORD',
        entityType: 'User',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'warning',
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

// Forgot password
router.post('/forgot-password',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });

    if (user) {
      // Generate reset token (in real app, send email)
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 12);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour
        },
      });

      // Send email with reset link
      // await emailService.sendPasswordReset(user.email, resetToken);

      logger.info('Password reset requested', { userId: user.id });
    }
  })
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // Find valid reset token
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    let validToken = null;
    for (const rt of resetTokens) {
      const isValid = await bcrypt.compare(token, rt.token);
      if (isValid) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: validToken.userId },
        data: { password: await bcrypt.hash(password, 12) },
      }),
      prisma.passwordResetToken.delete({ where: { id: validToken.id } }),
    ]);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  })
);

// Verify email
router.post('/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token required'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // In real app, verify email verification token
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  })
);

// Resend verification email
router.post('/resend-verification',
  authRateLimiter,
  asyncHandler(async (req: any, res: Response) => {
    // Send verification email
    res.json({
      success: true,
      message: 'Verification email sent',
    });
  })
);

// Google OAuth
router.get('/google', (req: Request, res: Response) => {
  // Redirect to Google OAuth
  res.redirect('/api/v1/auth/google/callback');
});

router.get('/google/callback', asyncHandler(async (req: Request, res: Response) => {
  // Handle Google OAuth callback
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
}));

export default router;
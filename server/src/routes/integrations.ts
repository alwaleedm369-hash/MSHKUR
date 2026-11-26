import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import { githubService } from '@services/github';
import { whatsappService } from '@services/whatsapp';
import { harajService } from '@services/haraj';
import { googleWorkspaceService } from '@services/googleWorkspace';
import { geminiService } from '@services/gemini';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// List available integrations
router.get('/',
  asyncHandler(async (req: Request, res: Response) => {
    const integrations = [
      {
        id: 'github',
        name: 'GitHub',
        nameAr: 'جيت هاب',
        description: 'Repository management, CI/CD, code review',
        category: 'development',
        authType: 'oauth2',
        isConfigured: !!process.env.GITHUB_CLIENT_ID,
        status: 'connected',
      },
      {
        id: 'google-workspace',
        name: 'Google Workspace',
        nameAr: 'جوجل وركسبيس',
        description: 'Drive, Photos, Calendar, Sheets, Gmail',
        category: 'productivity',
        authType: 'oauth2',
        isConfigured: !!process.env.GOOGLE_WORKSPACE_CLIENT_ID,
        status: 'pending',
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp Web',
        nameAr: 'واتساب ويب',
        description: 'Messaging without paid API',
        category: 'communication',
        authType: 'session',
        isConfigured: true,
        status: 'pending',
      },
      {
        id: 'haraj',
        name: 'Haraj',
        nameAr: 'حراج',
        description: 'Saudi Arabia vehicle marketplace',
        category: 'marketplace',
        authType: 'session',
        isConfigured: !!process.env.HARAJ_USERNAME,
        status: 'pending',
      },
      {
        id: 'gemini',
        name: 'Google Gemini AI',
        nameAr: 'جوجل جيميناي',
        description: 'AI content generation, image analysis, code assistance',
        category: 'ai',
        authType: 'api-key',
        isConfigured: !!process.env.GEMINI_API_KEY,
        status: 'connected',
      },
      {
        id: 'facebook',
        name: 'Facebook Marketplace',
        nameAr: 'فيسبوك ماركت بليس',
        description: 'Vehicle listings on Facebook',
        category: 'marketplace',
        authType: 'oauth2',
        isConfigured: false,
        status: 'disconnected',
      },
      {
        id: 'instagram',
        name: 'Instagram',
        nameAr: 'إنستغرام',
        description: 'Social media marketing',
        category: 'marketing',
        authType: 'oauth2',
        isConfigured: false,
        status: 'disconnected',
      },
      {
        id: 'snapchat',
        name: 'Snapchat',
        nameAr: 'سناب شات',
        description: 'Story and ad publishing',
        category: 'marketing',
        authType: 'oauth2',
        isConfigured: false,
        status: 'disconnected',
      },
      {
        id: 'sentry',
        name: 'Sentry',
        nameAr: 'سينتري',
        description: 'Error tracking and performance monitoring',
        category: 'analytics',
        authType: 'api-key',
        isConfigured: false,
        status: 'disconnected',
      },
      {
        id: 'aws-s3',
        name: 'AWS S3 / Cloudflare R2',
        nameAr: 'تخزين سحابي',
        description: 'File storage and CDN',
        category: 'storage',
        authType: 'api-key',
        isConfigured: false,
        status: 'disconnected',
      },
    ];

    res.json({ success: true, data: { integrations } });
  })
);

// Get integration status
router.get('/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    let status: any = { connected: false };

    switch (id) {
      case 'github':
        status = await githubService.getConnectionStatus(userId);
        break;
      case 'google-workspace':
        status = { connected: googleWorkspaceService.isConnected(userId) };
        break;
      case 'whatsapp':
        status = { connected: whatsappService.isClientReady() };
        break;
      case 'haraj':
        status = { connected: harajService.isLoggedIn };
        break;
      case 'gemini':
        status = { connected: !!process.env.GEMINI_API_KEY };
        break;
      default:
        status = { connected: false };
    }

    res.json({ success: true, data: status });
  })
);

// Connect integration
router.post('/:id/connect',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { credentials } = req.body;

    let result: any = { success: false };

    switch (id) {
      case 'github':
        // GitHub OAuth handled via frontend redirect
        res.json({ success: true, data: { authUrl: githubService.getAuthUrl(userId) } });
        return;
      case 'google-workspace':
        res.json({ success: true, data: { authUrl: googleWorkspaceService.getAuthUrl(userId) } });
        return;
      case 'whatsapp':
        await whatsappService.initialize();
        result = { success: true, message: 'WhatsApp initialization started' };
        break;
      case 'haraj':
        if (!req.body.username || !req.body.password) {
          throw new Error('Username and password required');
        }
        result = await harajService.login(req.body.username, req.body.password);
        break;
      case 'gemini':
        result = { success: true, message: 'Gemini configured via API key' };
        break;
      default:
        throw new Error('Unknown integration');
    }

    res.json({ success: true, data: result });
  })
);

// Disconnect integration
router.post('/:id/disconnect',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    switch (id) {
      case 'google-workspace':
        googleWorkspaceService.revokeTokens(userId);
        break;
      case 'whatsapp':
        await whatsappService.disconnect();
        break;
      case 'haraj':
        await harajService.logout();
        break;
      case 'github':
        // GitHub tokens would be revoked
        break;
    }

    res.json({ success: true, message: `${id} disconnected` });
  })
);

// GitHub routes
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

// Google Workspace routes
router.get('/google-workspace/auth-url',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const scopes = req.query.scopes as string[] | undefined;
    const authUrl = googleWorkspaceService.getAuthUrl(userId, scopes);
    res.json({ success: true, data: { authUrl } });
  })
);

router.post('/google-workspace/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { code } = req.body;

    const tokens = await googleWorkspaceService.exchangeCodeForTokens(code, userId);
    res.json({ success: true, data: { tokens } });
  })
);

// Google Drive
router.get('/google-workspace/drive/files',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const options = req.query;
    const files = await googleWorkspaceService.driveListFiles(userId, options);
    res.json({ success: true, data: files });
  })
);

router.post('/google-workspace/drive/upload',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, parents, mimeType, data } = req.body;
    const file = await googleWorkspaceService.driveUploadFile(userId, { name, parents, mimeType, data: Buffer.from(data, 'base64') });
    res.json({ success: true, data: { file } });
  })
);

router.post('/google-workspace/drive/folder',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, parents } = req.body;
    const folder = await googleWorkspaceService.driveCreateFolder(userId, name, parents);
    res.json({ success: true, data: { folder } });
  })
);

// Google Photos
router.get('/google-workspace/photos/albums',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const albums = await googleWorkspaceService.photosListAlbums(userId);
    res.json({ success: true, data: { albums } });
  })
);

router.post('/google-workspace/photos/upload',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { albumId, data, filename, description } = req.body;
    const mediaItem = await googleWorkspaceService.photosUploadMedia(userId, { albumId, data: Buffer.from(data, 'base64'), filename, description });
    res.json({ success: true, data: { mediaItem } });
  })
);

// Google Calendar
router.get('/google-workspace/calendar/events',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const options = req.query;
    const events = await googleWorkspaceService.calendarListEvents(userId, options);
    res.json({ success: true, data: { events } });
  })
);

router.post('/google-workspace/calendar/events',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const event = await googleWorkspaceService.calendarCreateEvent(userId, req.body);
    res.json({ success: true, data: { event } });
  })
);

// Google Sheets
router.get('/google-workspace/sheets/:spreadsheetId/values',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { spreadsheetId } = req.params;
    const { range } = req.query;
    const values = await googleWorkspaceService.sheetsGetValues(userId, spreadsheetId, range as string);
    res.json({ success: true, data: { values } });
  })
);

router.post('/google-workspace/sheets/:spreadsheetId/values',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { spreadsheetId } = req.params;
    const { range, values } = req.body;
    const result = await googleWorkspaceService.sheetsAppendValues(userId, spreadsheetId, range, values);
    res.json({ success: true, data: { result } });
  })
);

router.post('/google-workspace/sheets/create',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { title } = req.body;
    const spreadsheet = await googleWorkspaceService.sheetsCreateSpreadsheet(userId, title);
    res.json({ success: true, data: { spreadsheet } });
  })
);

// WhatsApp routes
router.get('/whatsapp/status',
  asyncHandler(async (req: Request, res: Response) => {
    const status = whatsappService.isClientReady();
    res.json({ success: true, data: { connected: status } });
  })
);

router.get('/whatsapp/qr',
  asyncHandler(async (req: Request, res: Response) => {
    const qr = await whatsappService.getQRCode();
    res.json({ success: true, data: { qrCode: qr } });
  })
);

router.get('/whatsapp/chats',
  asyncHandler(async (req: Request, res: Response) => {
    const chats = await whatsappService.getChats();
    res.json({ success: true, data: { chats } });
  })
);

router.get('/whatsapp/messages/:chatId',
  asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { limit } = req.query;
    const messages = await whatsappService.getMessages(chatId, parseInt(limit as string) || 50);
    res.json({ success: true, data: { messages } });
  })
);

router.post('/whatsapp/send',
  asyncHandler(async (req: Request, res: Response) => {
    const { to, body, media, location, contact } = req.body;

    let result;
    if (media) {
      result = await whatsappService.sendMedia(to, Buffer.from(media.data, 'base64'), {
        mimetype: media.mimetype,
        filename: media.filename,
        caption: media.caption,
      });
    } else if (location) {
      result = await whatsappService.sendLocation(to, location);
    } else if (contact) {
      result = await whatsappService.sendContact(to, contact);
    } else {
      result = await whatsappService.sendMessage(to, body);
    }

    res.json({ success: true, data: { message: result } });
  })
);

router.post('/whatsapp/reaction',
  asyncHandler(async (req: Request, res: Response) => {
    const { messageId, emoji } = req.body;
    await whatsappService.sendReaction(messageId, emoji);
    res.json({ success: true });
  })
);

// Haraj routes
router.post('/haraj/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const result = await harajService.login(username, password);
    res.json({ success: true, data: result });
  })
);

router.post('/haraj/logout',
  asyncHandler(async (req: Request, res: Response) => {
    await harajService.logout();
    res.json({ success: true });
  })
);

router.post('/haraj/listings',
  asyncHandler(async (req: Request, res: Response) => {
    const listing = await harajService.createListing(req.body);
    res.json({ success: true, data: { listing } });
  })
);

router.get('/haraj/listings',
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query;
    const result = await harajService.getMyListings(params);
    res.json({ success: true, data: result });
  })
);

router.get('/haraj/listings/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const listing = await harajService.getListing(req.params.id);
    res.json({ success: true, data: { listing } });
  })
);

router.patch('/haraj/listings/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const listing = await harajService.updateListing(req.params.id, req.body);
    res.json({ success: true, data: { listing } });
  })
);

router.post('/haraj/listings/:id/publish',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await harajService.publishListing(req.params.id);
    res.json({ success: true, data: result });
  })
);

router.post('/haraj/listings/:id/images',
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.body.files;
    const listingId = req.params.id;
    const images = await harajService.uploadImages(files, listingId);
    res.json({ success: true, data: { images } });
  })
);

router.get('/haraj/search',
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query;
    const result = await harajService.searchListings(params);
    res.json({ success: true, data: result });
  })
);

// Gemini AI routes
router.post('/gemini/generate',
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, options } = req.body;
    const result = await geminiService.generateText(prompt, options);
    res.json({ success: true, data: result });
  })
);

router.post('/gemini/generate-with-images',
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, images, options } = req.body;
    const result = await geminiService.generateWithImages(prompt, images, options);
    res.json({ success: true, data: result });
  })
);

router.post('/gemini/structured',
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, schema, options } = req.body;
    const result = await geminiService.generateStructuredOutput(prompt, schema, options);
    res.json({ success: true, data: result });
  })
);

router.post('/gemini/stream',
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, options } = req.body;

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await geminiService.streamGenerateText(prompt, options, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Stream failed' })}\n\n`);
      res.end();
    }
  })
);

export default router;
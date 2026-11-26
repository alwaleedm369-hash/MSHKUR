import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '@services/prisma';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import { geminiService } from '@services/gemini';
import { assistantManager } from '@services/assistants';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  next();
};

// Create new chat session
router.post('/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { title, initialMessage } = req.body;

    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Chat',
        messages: initialMessage ? [
          { role: 'user', content: initialMessage, timestamp: Date.now() },
        ] : [],
      },
    });

    res.status(201).json({
      success: true,
      data: { session },
    });
  })
);

// Get user's chat sessions
router.get('/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId: (req as any).user.id },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          topic: true,
          messageCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.chatSession.count({ where: { userId: (req as any).user.id } }),
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  })
);

// Get single session with messages
router.get('/sessions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    res.json({
      success: true,
      data: { session },
    });
  })
);

// Send message in session
router.post('/sessions/:id/messages',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const sessionId = req.params.id;
    const { content, attachments } = req.body;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments || [],
    };

    const updatedMessages = [...session.messages, userMessage];

    // Update session with user message
    const session_update = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: updatedMessages,
        updatedAt: new Date(),
        title: session.messages.length === 0 ? content.slice(0, 30) : session.title,
      },
    });

    // Process with AI Assistant
    const response = await processWithAssistant(content, (req as any).user);

    // Add assistant response
    const assistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      metadata: { actions: response.actions, confidence: response.confidence },
    };

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    });
  })
);

// Delete session
router.delete('/sessions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.chatSession.delete({
      where: { id: req.params.id, userId: (req as any).user.id },
    });

    res.json({ success: true, message: 'Session deleted' });
  })
);

// Get available assistants
router.get('/assistants',
  asyncHandler(async (req: Request, res: Response) => {
    const assistants = [
      { id: 'general', name: 'General Assistant', nameAr: 'المساعد العام', description: 'General purpose assistant', avatar: '🤖', capabilities: ['chat', 'search', 'write', 'plan', 'code', 'analyze'], priority: 10 },
      { id: 'photo', name: 'Photo Assistant', nameAr: 'مساعد الصور', description: 'Car image processing specialist', avatar: '📸', capabilities: ['background-removal', 'plate-blur', 'glass-tint', 'lighting', 'shadows', 'enhancement', 'batch'], priority: 100 },
      { id: 'ad', name: 'Ad Assistant', nameAr: 'مساعد الإعلان', description: 'Car listing creation specialist', avatar: '📢', capabilities: ['content-generation', 'templates', 'vehicle-data', 'publishing'], priority: 100 },
      { id: 'dealer', name: 'Dealer Assistant', nameAr: 'مساعد التاجر', description: 'Dealership management specialist', avatar: '🏪', capabilities: ['inventory', 'customers', 'marketing', 'reports'], priority: 100 },
      { id: 'search', name: 'Search Assistant', nameAr: 'مساعد البحث', description: 'Vehicle search and comparison', avatar: '🔍', capabilities: ['web-search', 'vehicle-search', 'price-comparison', 'specs-lookup'], priority: 80 },
      { id: 'coding', name: 'Coding Assistant', nameAr: 'مساعد البرمجة', description: 'Code generation and review', avatar: '💻', capabilities: ['code-generation', 'code-review', 'debugging', 'refactoring', 'testing'], priority: 80 },
      { id: 'analysis', name: 'Analysis Assistant', nameAr: 'مساعد التحليل', description: 'Data analysis and reporting', avatar: '📊', capabilities: ['data-analysis', 'reporting', 'visualization', 'insights', 'forecasting'], priority: 80 },
      { id: 'operations', name: 'Operations Assistant', nameAr: 'مساعد العمليات', description: 'Workflow and task automation', avatar: '⚙️', capabilities: ['task-management', 'workflow-automation', 'scheduling', 'monitoring'], priority: 70 },
      { id: 'content', name: 'Content Assistant', nameAr: 'مساعد المحتوى', description: 'Content creation and optimization', avatar: '✍️', capabilities: ['writing', 'editing', 'optimization', 'translation', 'formatting', 'seo'], priority: 70 },
    ];

    res.json({ success: true, data: { assistants } });
  })
);

// Switch active assistant
router.post('/sessions/:id/assistant',
  asyncHandler(async (req: Request, res: Response) => {
    const { assistantId } = req.body;

    const session = await prisma.chatSession.update({
      where: { id: req.params.id, userId: (req as any).user.id },
      data: { activeAssistantId: assistantId },
    });

    res.json({ success: true, data: { session } });
  })
);

// Quick actions
router.post('/quick-action',
  asyncHandler(async (req: Request, res: Response) => {
    const { action, data } = req.body;

    const prompts: Record<string, string> = {
      photo: 'I want to process a car image: remove background, blur license plate, enhance lighting',
      ad: 'Write a professional ad for Toyota Camry 2023, 30k km, 120k SAR',
      inventory: 'Add new car to inventory: Honda Accord 2024, Blue, Automatic, 150k SAR',
      search: 'Search for sedan cars under 100k SAR, 2022 or newer',
      marketing: 'Create weekly marketing plan for 20 car inventory',
      tasks: 'Remind me to follow up with client Ahmed tomorrow at 10 AM',
    };

    const prompt = prompts[action] || `Execute action: ${action} with data: ${JSON.stringify(data)}`;

    const response = await geminiService.generateText(prompt, {
      systemInstruction: 'You are MSHKUR AI Assistant. Help with automotive tasks.',
    });

    res.json({
      success: true,
      data: { response: response.text },
    });
  })
);

// Voice message endpoint (placeholder for future implementation)
router.post('/voice',
  asyncHandler(async (req: Request, res: Response) => {
    // Voice message processing would go here
    // For now, return a placeholder
    res.json({
      success: true,
      data: { message: 'Voice processing not yet implemented' },
    });
  })
);

// Get workflows
router.get('/workflows',
  asyncHandler(async (req: Request, res: Response) => {
    const workflows = {
      'photo-full-processing': {
        name: 'Full Photo Processing',
        nameAr: 'معالجة صور كاملة',
        description: 'Complete photo processing pipeline',
        steps: [
          { assistant: 'photo', skill: 'background-removal', params: { backgroundType: 'transparent' } },
          { assistant: 'photo', skill: 'license-plate-blur', params: { autoDetect: true } },
          { assistant: 'photo', skill: 'lighting-enhancement', params: { autoBalance: true } },
          { assistant: 'photo', skill: 'shadow-generation', params: { perspective: true } },
          { assistant: 'photo', skill: 'centering-crop', params: { mode: 'auto', aspectRatio: '4:3' } },
          { assistant: 'photo', skill: 'image-enhancement', params: { preserveNaturalLook: true } },
        ],
      },
      'ad-creation': {
        name: 'Ad Creation',
        nameAr: 'إنشاء إعلان',
        description: 'Create complete vehicle ad',
        steps: [
          { assistant: 'ad', skill: 'vehicle-data-extraction', params: { source: 'user-input' } },
          { assistant: 'ad', skill: 'ad-content-generation', params: { tone: 'professional', length: 'medium' } },
          { assistant: 'ad', skill: 'template-rendering', params: { platform: 'haraj', templateId: 'modern' } },
        ],
      },
      'dealer-new-vehicle': {
        name: 'New Vehicle Listing',
        nameAr: 'إدراج سيارة جديدة',
        description: 'Add new vehicle with ad and marketing',
        steps: [
          { assistant: 'dealer', skill: 'inventory-management', params: { action: 'create' } },
          { assistant: 'ad', skill: 'ad-content-generation', params: { tone: 'enthusiastic' } },
          { assistant: 'dealer', skill: 'marketing-automation', params: { action: 'schedule-post', platforms: ['instagram', 'facebook'] } },
        ],
      },
    };

    res.json({ success: true, data: { workflows } });
  })
);

// Execute workflow
router.post('/workflows/:id/execute',
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId } = req.params;
    const { initialInput } = req.body;

    // This would execute the workflow using the assistant manager
    // For now, return a placeholder
    res.json({
      success: true,
      data: { message: `Workflow ${workflowId} execution started`, workflowId },
    });
  })
);

export default router;
/**
 * MSHKUR Assistants System
 * نظام المساعدين - مساعدين متخصصون يعملون في الخلفية وينسقهم المساعد العام
 */

import { Assistant, AssistantResponse, AssistantAction, ProcessingContext } from '@engines/MSHKURCore';
import { skillRegistry, executeSkill } from '@skills';

export interface AssistantDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  avatar: string;
  capabilities: string[];
  systemPrompt: string;
  skills: string[]; // Skill IDs this assistant can use
  triggers: string[]; // Keywords that trigger this assistant
  priority: number; // Higher = more priority
  canHandoff: boolean; // Can handoff to other assistants
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  type: 'skill';
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
  error?: string;
}

export class AssistantManager {
  private assistants: Map<string, AssistantDefinition> = new Map();
  private conversationHistory: Map<string, AssistantMessage[]> = new Map();
  private activeAssistant: string | null = null;
  private core: any; // MSHKURCore instance

  constructor(core: any) {
    this.core = core;
    this.registerBuiltInAssistants();
  }

  private registerBuiltInAssistants(): void {
    const definitions: AssistantDefinition[] = [
      {
        id: 'general',
        name: 'General Assistant',
        nameAr: 'المساعد العام',
        description: 'نسختك. سكرتيرك. صديقك. مساعد عام لجميع المهام.',
        avatar: '🤖',
        capabilities: ['chat', 'search', 'write', 'plan', 'code', 'analyze', 'translate', 'summarize'],
        systemPrompt: `أنت مساعد مشكور العام. أنت تساعد المستخدم في أي مهمة يطلبها.
قدراتك: الدردشة، البحث، الكتابة، التخطيط، البرمجة، التحليل، الترجمة، التلخيص.
أنت تتحدث بالعربية بشكل طبيعي ومباشر. أنت مختصر، عملي، ومفيد.
إذا كانت المهمة تتطلب مهارة متخصصة، استدعي المهارة المناسبة.`,
        skills: ['search', 'summarize', 'translate', 'code-generation'],
        triggers: ['مرحبا', 'أهلاً', 'مساعدة', 'ساعدني', 'كيف', 'ما هو', 'اشرح'],
        priority: 10,
        canHandoff: true,
      },
      {
        id: 'photo',
        name: 'Photo Assistant',
        nameAr: 'مساعد الصور',
        description: 'متخصص في معالجة صور السيارات: إزالة خلفية، طمس لوحة، تضليل زجاج، إضاءة، ظلال، تحسين، توحيد دفعات.',
        avatar: '📸',
        capabilities: ['background-removal', 'plate-blur', 'glass-tint', 'lighting', 'shadows', 'enhancement', 'batch-unify', 'centering-crop'],
        systemPrompt: `أنت مساعد صور السيارات في مشكور. أنت متخصص في:
- إزالة الخلفية واستبدالها (استوديو، خارجية، بيضاء، مخصصة)
- طمس لوحة السيارة تلقائياً
- تضليل الزجاج بذكاء
- تحسين الإضاءة والتباين
- إضافة ظلال واقعية
- توسيط السيارة وقص ذكي
- تحسين الوضوح وتقليل التشويش
- توحيد دفعات صور متعددة
أنت تفهم سياق استوديو الصور وتستخدم المهارات المناسبة تلقائياً.`,
        skills: ['background-removal', 'license-plate-blur', 'glass-tinting', 'lighting-enhancement', 'shadow-generation', 'centering-crop', 'image-enhancement', 'batch-unify'],
        triggers: ['صورة', 'خلفية', 'لوحة', 'زجاج', 'إضاءة', 'ظل', 'تحسين', 'توحيد', 'قص', 'توسيط', 'طمس', 'تضليل'],
        priority: 100,
        canHandoff: true,
      },
      {
        id: 'ad',
        name: 'Ad Assistant',
        nameAr: 'مساعد الإعلان',
        description: 'متخصص في إنشاء إعلانات السيارات: بيانات، محتوى ذكي، قوالب، تصدير، نشر.',
        avatar: '📢',
        capabilities: ['content-generation', 'templates', 'vehicle-data', 'publishing', 'platform-optimization'],
        systemPrompt: `أنت مساعد إنشاء الإعلانات في مشكور. أنت متخصص في:
- استخراج بيانات السيارة من الصور/النصوص
- كتابة عنوان احترافي وجذاب
- كتابة وصف واضح ومقنع
- اختيار القالب المناسب للمنصة
- تحسين المحتوى لـ حراج، فيسبوك، إنستغرام، سناب شات
- تصدير الإعلان بجميع الصيغ
- النشر المباشر عند توفر التكامل
أنت تفهم سياق استوديو الإعلان وتنشئ إعلانات جاهزة للنشر.`,
        skills: ['vehicle-data-extraction', 'ad-content-generation', 'template-rendering'],
        triggers: ['إعلان', 'عنوان', 'وصف', 'قالب', 'نشر', 'حراج', 'فيسبوك', 'إنستغرام', 'تصدير'],
        priority: 100,
        canHandoff: true,
      },
      {
        id: 'dealer',
        name: 'Dealer Assistant',
        nameAr: 'مساعد التاجر',
        description: 'متخصص في إدارة المعارض والتجار: مخزون، عملاء، تسويق، تقارير، مساعد ذكي.',
        avatar: '🏪',
        capabilities: ['inventory-management', 'customer-management', 'marketing-automation', 'reports', 'analytics', 'dealer-profile'],
        systemPrompt: `أنت مساعد التاجر في مشكور. أنت متخصص في:
- إدارة مخزون السيارات (إضافة، تحديث، بحث، تنظيم)
- إدارة العملاء والاستفسارات والمتابعات
- إنشاء وجدولة الحملات التسويقية
- إنشاء المنشورات والقصص للمنصات
- تقارير المبيعات والأداء
- إدارة ملف المعرض والهوية البصرية
أنت تفهم سياق المعرض والتاجر وتدير العمليات بفعالية.`,
        skills: ['inventory-management', 'customer-management', 'marketing-automation'],
        triggers: ['مخزون', 'سيارة', 'عميل', 'استفسار', 'تسويق', 'حملة', 'منشور', 'تقرير', 'معرض', 'تاجر'],
        priority: 100,
        canHandoff: true,
      },
      {
        id: 'search',
        name: 'Search Assistant',
        nameAr: 'مساعد البحث',
        description: 'البحث الذكي: سيارات، أسعار، مواصفات، مقارنة، فرص، تحليل سوق.',
        avatar: '🔍',
        capabilities: ['web-search', 'vehicle-search', 'price-comparison', 'specs-lookup', 'market-analysis', 'opportunity-finder'],
        systemPrompt: `أنت مساعد البحث في مشكور. أنت متخصص في:
- البحث عن سيارات بمواصفات محددة
- مقارنة الأسعار والمواصفات
- تحليل السوق والاتجاهات
- إيجاد فرص شراء/بيع
- جمع معلومات عن الموديلات
- مراجعة المنافسين
تستخدم مصادر متعددة وتقدم نتائج منظمة وموثوقة.`,
        skills: ['search', 'analyze', 'compare'],
        triggers: ['ابحث', 'بحث', 'قارن', 'مقارنة', 'سعر', 'مواصفات', 'موديل', 'سوق', 'فرصة'],
        priority: 80,
        canHandoff: true,
      },
      {
        id: 'coding',
        name: 'Coding Assistant',
        nameAr: 'مساعد البرمجة',
        description: 'كتابة، مراجعة، تصحيح، إعادة هيكلة، اختبار الكود.',
        avatar: '💻',
        capabilities: ['code-generation', 'code-review', 'debugging', 'refactoring', 'testing', 'documentation', 'architecture'],
        systemPrompt: `أنت مساعد البرمجة في مشكور. أنت متخصص في:
- كتابة كود نظيف وقابل للصيانة
- مراجعة الكود واقتراح تحسينات
- تصحيح الأخطاء وحل المشاكل
- إعادة هيكلة وتحسين الأداء
- كتابة الاختبارات
- توثيق الكود
- تصميم المعمارية
تتبع أفضل الممارسات وتكتب كود جاهز للإنتاج.`,
        skills: ['code-generation', 'code-review', 'debug', 'test-generation'],
        triggers: ['كود', 'برمجة', 'function', 'component', 'bug', 'error', 'test', 'refactor', 'typescript', 'react'],
        priority: 80,
        canHandoff: true,
      },
      {
        id: 'analysis',
        name: 'Analysis Assistant',
        nameAr: 'مساعد التحليل',
        description: 'تحليل البيانات، تقارير، تصورات، رؤى، تنبؤات.',
        avatar: '📊',
        capabilities: ['data-analysis', 'reporting', 'visualization', 'insights', 'forecasting', 'statistics'],
        systemPrompt: `أنت مساعد التحليل في مشكور. أنت متخصص في:
- تحليل البيانات واستخراج الأنماط
- إنشاء تقارير مفصلة ومفهومة
- بناء التصورات البيانية المناسبة
- تقديم رؤى قابلة للتنفيذ
- التنبؤ بالاتجاهات المستقبلية
- الإحصاء المتقدم
تقدم تحليلات دقيقة وقرارات مستنيرة.`,
        skills: ['analyze', 'visualize', 'forecast', 'statistics'],
        triggers: ['تحليل', 'تقرير', 'إحصائيات', 'بيانات', 'رسم', 'مخطط', 'تنبؤ', 'اتجاه', 'نمط'],
        priority: 80,
        canHandoff: true,
      },
      {
        id: 'operations',
        name: 'Operations Assistant',
        nameAr: 'مساعد العمليات',
        description: 'إدارة المهام، سير العمل، الأتمتة، المتابعة، التنسيق.',
        avatar: '⚙️',
        capabilities: ['task-management', 'workflow-automation', 'scheduling', 'monitoring', 'coordination', 'notifications'],
        systemPrompt: `أنت مساعد العمليات في مشكور. أنت متخصص في:
- إدارة المهام والمشاريع
- أتمتة سير العمل المتكرر
- جدولة العمليات والمواعيد
- مراقبة الأداء والتنبيهات
- تنسيق الفرق والمهام
- إدارة الإشعارات والتذكيرات
تضمن سير العمليات بسلاسة وكفاءة.`,
        skills: ['task-management', 'workflow', 'schedule', 'monitor'],
        triggers: ['مهمة', 'مشروع', 'سير عمل', 'أتمتة', 'جدولة', 'متابعة', 'تنبيه', 'تذكير', 'عملية'],
        priority: 70,
        canHandoff: true,
      },
      {
        id: 'content',
        name: 'Content Assistant',
        nameAr: 'مساعد المحتوى',
        description: 'كتابة، تحرير، تحسين، ترجمة، تنسيق المحتوى.',
        avatar: '✍️',
        capabilities: ['writing', 'editing', 'optimization', 'translation', 'formatting', 'seo', 'copywriting'],
        systemPrompt: `أنت مساعد المحتوى في مشكور. أنت متخصص في:
- كتابة محتوى احترافي وجذاب
- تحرير وتحسين النصوص الموجودة
- تحسين محركات البحث (SEO)
- الترجمة بين العربية والإنجليزية
- تنسيق المحتوى للمنصات المختلفة
- كتابة نصوص تسويقية مقنعة
تنتج محتوى عالي الجودة ومحسّن للهدف.`,
        skills: ['write', 'edit', 'translate', 'seo', 'format'],
        triggers: ['اكتب', 'حرر', 'حسّن', 'ترجم', 'نسق', 'محتوى', 'نص', 'مقالة', 'بوست', 'مقال'],
        priority: 70,
        canHandoff: true,
      },
    ];

    definitions.forEach(def => this.assistants.set(def.id, def));
  }

  getAssistant(id: string): AssistantDefinition | undefined {
    return this.assistants.get(id);
  }

  getAllAssistants(): AssistantDefinition[] {
    return Array.from(this.assistants.values());
  }

  findBestAssistant(message: string, context: ProcessingContext): AssistantDefinition | null {
    let bestMatch: AssistantDefinition | null = null;
    let bestScore = 0;

    for (const assistant of this.assistants.values()) {
      let score = assistant.priority;

      // Check triggers
      for (const trigger of assistant.triggers) {
        if (message.includes(trigger)) {
          score += 50;
        }
      }

      // Check context app
      if (context.appId === 'photo-studio' && assistant.id === 'photo') score += 200;
      if (context.appId === 'ad-studio' && assistant.id === 'ad') score += 200;
      if (context.appId === 'dealer-portal' && assistant.id === 'dealer') score += 200;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = assistant;
      }
    }

    return bestMatch;
  }

  async processMessage(
    sessionId: string,
    message: string,
    context: ProcessingContext
  ): Promise<AssistantResponse> {
    // Get or create conversation history
    let history = this.conversationHistory.get(sessionId) || [];

    // Add user message
    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    history.push(userMessage);

    // Find best assistant
    const assistant = this.findBestAssistant(message, context) || this.assistants.get('general')!;
    this.activeAssistant = assistant.id;

    // Build context for assistant
    const fullContext = {
      ...context,
      assistantId: assistant.id,
      conversationHistory: history.slice(-10), // Last 10 messages
    };

    // Process with assistant
    const response = await this.executeAssistant(assistant, message, fullContext, history);

    // Add assistant response to history
    const assistantMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      metadata: { assistantId: assistant.id, actions: response.actions, confidence: response.confidence },
    };
    history.push(assistantMessage);

    // Save history
    this.conversationHistory.set(sessionId, history.slice(-50)); // Keep last 50

    return response;
  }

  private async executeAssistant(
    assistant: AssistantDefinition,
    message: string,
    context: ProcessingContext,
    history: AssistantMessage[]
  ): Promise<AssistantResponse> {
    const toolCalls: ToolCall[] = [];
    const toolResults: ToolResult[] = [];
    let finalContent = '';
    let confidence = 0.8;

    // Check if assistant should use a skill
    const skillToUse = this.determineSkill(assistant, message, context);

    if (skillToUse) {
      try {
        const toolCallId = `call-${Date.now()}`;
        toolCalls.push({
          id: toolCallId,
          type: 'skill',
          name: skillToUse,
          arguments: this.buildSkillArguments(skillToUse, message, context),
        });

        const result = await executeSkill(skillToUse, this.buildSkillArguments(skillToUse, message, context), context);

        toolResults.push({
          toolCallId,
          result,
        });

        // Generate response based on skill result
        finalContent = this.formatSkillResponse(assistant, skillToUse, result);
        confidence = 0.95;
      } catch (error) {
        finalContent = `عذراً، حدث خطأ أثناء تنفيذ المهارة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`;
        confidence = 0.3;
      }
    } else {
      // Generate conversational response
      finalContent = this.generateConversationalResponse(assistant, message, context, history);
      confidence = 0.85;
    }

    // Determine actions
    const actions: AssistantAction[] = [];
    if (skillToUse) {
      actions.push({ type: 'skill', payload: { skillId: skillToUse } });
    }

    // Check for handoff
    if (assistant.canHandoff) {
      const handoffAssistant = this.checkHandoff(message, context);
      if (handoffAssistant && handoffAssistant.id !== assistant.id) {
        actions.push({ type: 'navigation', payload: { target: handoffAssistant.id, reason: 'تخصص أفضل للمهمة' } });
      }
    }

    return {
      content: finalContent,
      actions: actions.length > 0 ? actions : undefined,
      metadata: { assistantId: assistant.id, toolCalls, toolResults },
      confidence,
    };
  }

  private determineSkill(assistant: AssistantDefinition, message: string, context: ProcessingContext): string | null {
    const skillKeywords: Record<string, string[]> = {
      'background-removal': ['أزل الخلفية', 'إزالة خلفية', 'بدل خلفية', 'خلفية جديدة'],
      'license-plate-blur': ['طمس اللوحة', 'اخف اللوحة', 'اللوحة', 'طمس اللوحة'],
      'glass-tinting': ['تضليل الزجاج', 'ظلل الزجاج', 'زجاج مظلم', 'تظليل'],
      'lighting-enhancement': ['حسّن الإضاءة', 'إضاءة أفضل', 'معادلة الإضاءة', 'تحسين الإضاءة'],
      'shadow-generation': ['أضف ظل', 'ظل واقعي', 'اربط بالأرض', 'ظل السيارة'],
      'centering-crop': ['وسّط السيارة', 'قص الصورة', 'أبعاد', 'مقاس'],
      'image-enhancement': ['حسّن الصورة', 'وضوح', 'تقليل تشويش', 'تحسين جودة'],
      'batch-unify': ['وحّد الصور', 'دفعة واحدة', 'توحيد خلفيات', 'مجموعة صور'],
      'ad-content-generation': ['اكتب إعلان', 'عنوان إعلان', 'وصف إعلان', 'محتوى إعلان'],
      'vehicle-data-extraction': ['استخرج بيانات', 'بيانات السيارة', 'اقرأ المواصفات'],
      'template-rendering': ['اعرض القالب', 'معاينة الإعلان', 'قالب حراج', 'قالب فيسبوك'],
      'inventory-management': ['أضف سيارة', 'حدّث مخزون', 'سيارات المعرض', 'مخزون'],
      'customer-management': ['أضف عميل', 'استفسار عميل', 'متابعة عميل', 'عملاء'],
      'marketing-automation': ['أنشئ حملة', 'جدول منشور', 'منشور تسويقي', 'حملة'],
    };

    for (const [skillId, keywords] of Object.entries(skillKeywords)) {
      if (assistant.skills.includes(skillId)) {
        for (const keyword of keywords) {
          if (message.includes(keyword)) {
            return skillId;
          }
        }
      }
    }

    return null;
  }

  private buildSkillArguments(skillId: string, message: string, context: ProcessingContext): Record<string, unknown> {
    // Build arguments based on skill and context
    const baseArgs: Record<string, unknown> = { context: message };

    switch (skillId) {
      case 'ad-content-generation':
        return {
          vehicleData: context.metadata?.vehicleData || {},
          options: { tone: 'professional', language: 'ar' },
        };
      case 'background-removal':
        return {
          imageData: context.metadata?.imageData || '',
          settings: { model: 'car-optimized', backgroundType: 'transparent' },
        };
      default:
        return baseArgs;
    }
  }

  private formatSkillResponse(assistant: AssistantDefinition, skillId: string, result: unknown): string {
    const responses: Record<string, (result: unknown) => string> = {
      'background-removal': () => 'تم إزالة الخلفية بنجاح. يمكنك الآن اختيار خلفية جديدة أو تصدير الصورة بخلفية شفافة.',
      'license-plate-blur': (r: any) => `تم طمس ${r.platesDetected || 1} لوحة بنجاح.`,
      'glass-tinting': () => 'تم تضليل الزجاج مع الحفاظ على الانعكاسات الطبيعية.',
      'lighting-enhancement': () => 'تم تحسين الإضاءة والتباين. الصورة الآن أكثر احترافية.',
      'shadow-generation': () => 'تم إضافة ظل واقعي يربط السيارة بالأرض بشكل طبيعي.',
      'centering-crop': () => 'تم توسيط السيارة وقص الصورة بالأبعاد المطلوبة.',
      'image-enhancement': () => 'تم تحسين جودة الصورة: وضوح أعلى، تشويش أقل، ألوان أفضل.',
      'batch-unify': (r: any) => `تم توحيد ${r.metadata?.count || 'الصور'} بنجاح: خلفيات، إضاءة، وأبعاد موحدة.`,
      'ad-content-generation': (r: any) => `تم إنشاء الإعلان:\n\n**العنوان:** ${r.title}\n\n**الوصف:** ${r.description}\n\n**الوسوم:** ${r.tags?.join(', ')}`,
      'vehicle-data-extraction': (r: any) => `تم استخراج البيانات: ${r.make} ${r.model} ${r.year}`,
      'template-rendering': () => 'تم عرض القالب. يمكنك معاينته وتصديره للمنصة المطلوبة.',
      'inventory-management': () => 'تم تحديث المخزون بنجاح.',
      'customer-management': () => 'تم إدارة بيانات العميل بنجاح.',
      'marketing-automation': (r: any) => `تم إنشاء الحملة: ${r.campaignId}. المنشورات مجدولة للنشر.`,
    };

    const formatter = responses[skillId];
    if (formatter) return formatter(result);

    return `تم تنفيذ ${skillId} بنجاح. النتيجة: ${JSON.stringify(result).slice(0, 200)}`;
  }

  private generateConversationalResponse(
    assistant: AssistantDefinition,
    message: string,
    context: ProcessingContext,
    history: AssistantMessage[]
  ): string {
    // Simple conversational responses based on assistant type
    const responses: Record<string, string[]> = {
      general: [
        'أهلاً بك! كيف يمكنني مساعدتك اليوم؟',
        'فهمت طلبك. دعني أساعدك في ذلك.',
        'بالتأكيد، يمكنني المساعدة في هذه المهمة.',
      ],
      photo: [
        'أنا جاهز لمساعدتك في معالجة الصور. ماذا تريد أن تفعل؟',
        'يمكنني إزالة الخلفية، طمس اللوحة، تحسين الإضاءة، والمزيد. ما تحتاجه؟',
        'ارفع الصورة وسأبدأ المعالجة فوراً.',
      ],
      ad: [
        'سأساعدك في إنشاء إعلان احترافي. ما بيانات السيارة؟',
        'أعطني تفاصيل السيارة وسأكتب عنوان ووصف جذاب.',
        'يمكنني أيضاً اختيار القالب المناسب وتصدير الإعلان جاهزاً للنشر.',
      ],
      dealer: [
        'كيف يمكنني مساعدتك في إدارة المعرض اليوم؟',
        'يمكنني إضافة سيارات، متابعة عملاء، إنشاء حملات، أو تقارير.',
        'ماذا تحتاج؟ مخزون، عملاء، تسويق، أم تقارير؟',
      ],
      search: [
        'ماذا تبحث عنه؟ سيارات، أسعار، مواصفات، أم مقارنة؟',
        'سأبحث لك في المصادر المتاحة وأقدم أفضل النتائج.',
        'حدّد المعايير وسأجد ما يناسبك.',
      ],
      coding: [
        'ما الكود الذي تحتاجه؟ مكون، دالة، اختبار، أم إصلاح؟',
        'أصف لي المشكلة وسأكتب الحل النظيف.',
        'يمكنني أيضاً مراجعة الكود الموجود واقتراح تحسينات.',
      ],
      analysis: [
        'ما البيانات التي تريد تحليلها؟ مبيعات، أداء، سوق، أم عملاء؟',
        'سأستخرج الأنماط وأقدم لك رؤى قابلة للتنفيذ.',
        'يمكنني إنشاء تقارير مرئية وتنبؤات مستقبلية.',
      ],
      operations: [
        'ما العملية التي تريد أتمتتها أو إدارتها؟',
        'يمكنني جدولة المهام، متابعة التقدم، وتنسيق الفريق.',
        'أخبرني بالتفاصيل وسأضع خطة تنفيذ.',
      ],
      content: [
        'ما المحتوى الذي تحتاجه؟ مقال، بوست، إعلان، أم ترجمة؟',
        'أعطني الموضوع والهدف وسأكتب محتوى محسّن وجذاب.',
        'يمكنني أيضاً تحسين المحتوى الموجود لـ SEO.',
      ],
    };

    const assistantResponses = responses[assistant.id] || responses.general;
    return assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
  }

  private checkHandoff(message: string, context: ProcessingContext): AssistantDefinition | null {
    // Check if another assistant is better suited
    for (const assistant of this.assistants.values()) {
      if (assistant.id === this.activeAssistant) continue;

      for (const trigger of assistant.triggers) {
        if (message.includes(trigger)) {
          return assistant;
        }
      }
    }
    return null;
  }

  getHistory(sessionId: string): AssistantMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  clearHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  setActiveAssistant(assistantId: string): boolean {
    if (this.assistants.has(assistantId)) {
      this.activeAssistant = assistantId;
      return true;
    }
    return false;
  }

  getActiveAssistant(): string | null {
    return this.activeAssistant;
  }
}

// Export singleton factory
export function createAssistantManager(core: any): AssistantManager {
  return new AssistantManager(core);
}

// Assistant workflows - predefined sequences for common tasks
export const assistantWorkflows = {
  'photo-full-processing': {
    name: 'Full Photo Processing',
    nameAr: 'معالجة صور كاملة',
    description: 'سلسلة كاملة لمعالجة صورة سيارة من البداية للنهاية',
    steps: [
      { assistant: 'photo', action: 'background-removal', params: { backgroundType: 'transparent' } },
      { assistant: 'photo', action: 'license-plate-blur', params: { autoDetect: true } },
      { assistant: 'photo', action: 'lighting-enhancement', params: { autoBalance: true } },
      { assistant: 'photo', action: 'shadow-generation', params: { perspective: true } },
      { assistant: 'photo', action: 'centering-crop', params: { mode: 'auto', aspectRatio: '4:3' } },
      { assistant: 'photo', action: 'image-enhancement', params: { preserveNaturalLook: true } },
    ],
  },
  'ad-creation': {
    name: 'Ad Creation',
    nameAr: 'إنشاء إعلان',
    description: 'إنشاء إعلان سيارة كامل من البيانات للمسودة النهائية',
    steps: [
      { assistant: 'ad', action: 'vehicle-data-extraction', params: { source: 'user-input' } },
      { assistant: 'ad', action: 'ad-content-generation', params: { tone: 'professional', length: 'medium' } },
      { assistant: 'ad', action: 'template-rendering', params: { platform: 'haraj', templateId: 'modern' } },
    ],
  },
  'dealer-new-vehicle': {
    name: 'New Vehicle Listing',
    nameAr: 'إدراج سيارة جديدة',
    description: 'إضافة سيارة جديدة للمخزون مع إعلان وتسويق',
    steps: [
      { assistant: 'dealer', action: 'inventory-management', params: { action: 'create' } },
      { assistant: 'ad', action: 'ad-content-generation', params: { tone: 'enthusiastic' } },
      { assistant: 'dealer', action: 'marketing-automation', params: { action: 'schedule-post', platforms: ['instagram', 'facebook'] } },
    ],
  },
};

// Utility to run workflow
export async function runAssistantWorkflow(
  workflowId: keyof typeof assistantWorkflows,
  initialInput: Record<string, unknown>,
  context: ProcessingContext,
  assistantManager: AssistantManager
): Promise<Record<string, unknown>> {
  const workflow = assistantWorkflows[workflowId];
  if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

  const results: Record<string, unknown> = { ...initialInput };

  for (const step of workflow.steps) {
    const assistant = assistantManager.getAssistant(step.assistant);
    if (!assistant) continue;

    // Build message for this step
    const message = `نفذ ${step.action} مع المعطيات: ${JSON.stringify({ ...results, ...step.params })}`;

    const response = await assistantManager.processMessage(
      context.sessionId,
      message,
      { ...context, appId: step.assistant as any }
    );

    results[`${step.assistant}-${step.action}`] = {
      content: response.content,
      actions: response.actions,
      confidence: response.confidence,
    };
  }

  return results;
}
import { useState, useEffect, useCallback } from 'react';

export type ContextAppTarget = 'photo-studio' | 'ad-studio' | 'dealer-portal' | 'ai-assistant' | 'admin-browser';

export interface ContextualSuggestion {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  targetApp: ContextAppTarget;
  suggestedPrompt: string;
  requiresApproval: boolean;
}

export interface ContextActionLogEntry {
  id: string;
  route: string;
  targetApp: ContextAppTarget;
  actionSummary: string;
  status: 'executed_local' | 'awaiting_approval' | 'rejected';
  timestamp: number;
}

const CONTEXT_LOG_KEY = 'mshkur-contextual-layer-v1';

export function getSuggestionsForRoute(route: string): ContextualSuggestion[] {
  if (route.startsWith('/photo-studio') || route === '/') {
    return [
      {
        id: 'ctx-photo-compare',
        titleEn: 'Inspect Cutout & Lineage',
        titleAr: 'فحص التفريغ وتسلسل النسخ',
        descriptionEn: 'Open Compare & Export inspection or run verified background removal.',
        descriptionAr: 'فتح المقارنة والتصدير أو تشغيل إزالة الخلفية المعتمدة.',
        targetApp: 'photo-studio',
        suggestedPrompt: 'Inspect current cutout and export options in Photo Studio',
        requiresApproval: false,
      },
      {
        id: 'ctx-photo-ad',
        titleEn: 'Draft Listing Copy from Vehicle',
        titleAr: 'صياغة نص إعلان للمركبة',
        descriptionEn: 'Send vehicle context to Ad Studio to draft localized listing copy.',
        descriptionAr: 'نقل سياق المركبة إلى استوديو الإعلانات لصياغة نص الإعلان.',
        targetApp: 'ad-studio',
        suggestedPrompt: 'Draft bilingual listing copy for showroom vehicle',
        requiresApproval: false,
      },
    ];
  }

  if (route.startsWith('/ad-studio')) {
    return [
      {
        id: 'ctx-ad-refine',
        titleEn: 'Refine Ad Copy & Pricing Pitch',
        titleAr: 'تحسين نص الإعلان وعرض السعر',
        descriptionEn: 'Open Assistant with current ad context to tighten headlines and specs.',
        descriptionAr: 'فتح المساعد مع سياق الإعلان الحالي لتحسين العناوين والمواصفات.',
        targetApp: 'ai-assistant',
        suggestedPrompt: 'Improve Arabic and English ad copy clarity and key vehicle specs',
        requiresApproval: false,
      },
      {
        id: 'ctx-ad-publish',
        titleEn: 'Request External Listing Publish (Gated)',
        titleAr: 'طلب نشر خارجي للإعلان (بوابة موافقة)',
        descriptionEn: 'Routes external publishing through explicit human approval in Task Runtime.',
        descriptionAr: 'يمرر النشر الخارجي عبر موافقة بشرية صريحة في محرك المهام.',
        targetApp: 'ai-assistant',
        suggestedPrompt: 'Publish external ad listing to Haraj channel',
        requiresApproval: true,
      },
    ];
  }

  if (route.startsWith('/dealer')) {
    return [
      {
        id: 'ctx-dealer-triage',
        titleEn: 'Triage Buyer Leads & Inventory',
        titleAr: 'فرز طلبات المشترين والمخزون',
        descriptionEn: 'Summarize active showroom stock and high-priority buyer leads.',
        descriptionAr: 'تلخيص مخزون المعرض النشط والطلبات ذات الأولوية.',
        targetApp: 'ai-assistant',
        suggestedPrompt: 'Summarize active dealer inventory and buyer lead follow-ups',
        requiresApproval: false,
      },
      {
        id: 'ctx-dealer-create-ad',
        titleEn: 'Prepare Showroom Ad Draft',
        titleAr: 'تجهيز مسودة إعلان للمعرض',
        descriptionEn: 'Jump to Ad Studio to turn a showroom vehicle into a structured ad.',
        descriptionAr: 'الانتقال إلى استوديو الإعلانات لتحويل مركبة المعرض إلى إعلان منظم.',
        targetApp: 'ad-studio',
        suggestedPrompt: 'Create showroom ad draft from current dealer stock',
        requiresApproval: false,
      },
    ];
  }

  if (route.startsWith('/admin')) {
    return [
      {
        id: 'ctx-admin-audit',
        titleEn: 'Audit Pending Approvals & Tasks',
        titleAr: 'مراجعة الموافقات المعلقة والمهام',
        descriptionEn: 'Inspect Task Runtime audit trail and pending human approval items.',
        descriptionAr: 'فحص سجل تدقيق محرك المهام والعناصر المنتظرة للموافقة البشرية.',
        targetApp: 'ai-assistant',
        suggestedPrompt: 'Audit pending approvals and recent task checkpoints',
        requiresApproval: false,
      },
    ];
  }

  return [
    {
      id: 'ctx-general-plan',
      titleEn: 'Plan Current Workspace Task',
      titleAr: 'تخطيط مهمة مساحة العمل الحالية',
      descriptionEn: 'Start a structured, auditable plan in the Personal Task Runtime.',
      descriptionAr: 'بدء خطة منظمة وقابلة للتدقيق في محرك المهام الشخصي.',
      targetApp: 'ai-assistant',
      suggestedPrompt: 'Help plan next steps for current MSHKUR workspace',
      requiresApproval: false,
    },
  ];
}

function readContextLog(): ContextActionLogEntry[] {
  try {
    const raw = localStorage.getItem(CONTEXT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useContextualLayer() {
  const [entries, setEntries] = useState<ContextActionLogEntry[]>(() => readContextLog());

  useEffect(() => {
    try {
      localStorage.setItem(CONTEXT_LOG_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage errors
    }
  }, [entries]);

  const recordContextAction = useCallback((entry: Omit<ContextActionLogEntry, 'id' | 'timestamp'>) => {
    const created: ContextActionLogEntry = {
      ...entry,
      id: `ctx-act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: Date.now(),
    };
    setEntries(prev => [created, ...prev.slice(0, 29)]);
    return created;
  }, []);

  return {
    entries,
    recordContextAction,
  };
}

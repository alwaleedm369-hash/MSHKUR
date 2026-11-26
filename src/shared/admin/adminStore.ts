import { useState, useEffect, useCallback } from 'react';

export interface ReaIntakeItem {
  id: string;
  sourceLabel: string;
  rawInput: string;
  sandboxVerdict: 'quarantined_clean' | 'flagged_external_action' | 'pending_review';
  extractedSummary: string;
  createdAt: number;
}

export interface AgentMonitorItem {
  agentId: string;
  nameEn: string;
  nameAr: string;
  role: string;
  status: 'active' | 'standby' | 'approval_gated';
  lastTaskSummary: string;
}

export interface WorkflowMonitorItem {
  id: string;
  nameEn: string;
  nameAr: string;
  stage: string;
  health: 'healthy' | 'awaiting_approval' | 'attention';
}

export interface MarketingCalendarItem {
  id: string;
  titleEn: string;
  titleAr: string;
  channel: string;
  scheduledDate: string;
  status: 'scheduled' | 'draft' | 'published';
}

export interface MapResearchNote {
  id: string;
  query: string;
  zone: string;
  notes: string;
  createdAt: number;
}

const ADMIN_STATE_KEY = 'mshkur-admin-browser-v1';

interface AdminPersistedState {
  reaItems: ReaIntakeItem[];
  agents: AgentMonitorItem[];
  workflows: WorkflowMonitorItem[];
  calendarItems: MarketingCalendarItem[];
  mapNotes: MapResearchNote[];
}

const DEFAULT_ADMIN_STATE: AdminPersistedState = {
  reaItems: [
    {
      id: 'rea-1',
      sourceLabel: 'Haraj Showroom Feed #01',
      rawInput: '2023 Toyota Camry GLE — Riyadh showroom batch (read-only intake)',
      sandboxVerdict: 'quarantined_clean',
      extractedSummary: 'Parsed vehicle year/make/model/price; zero unauthorized external side effects.',
      createdAt: Date.now() - 3600000 * 3,
    },
  ],
  agents: [
    {
      agentId: 'photo-studio-assistant',
      nameEn: 'Photo Studio Agent',
      nameAr: 'مساعد استوديو الصور',
      role: 'Verified background removal & lineage inspection',
      status: 'active',
      lastTaskSummary: 'removebackground contract verified & active',
    },
    {
      agentId: 'ad-studio-assistant',
      nameEn: 'Ad Studio Agent',
      nameAr: 'مساعد استوديو الإعلانات',
      role: 'Listing copy drafting & approval-gated publishing',
      status: 'approval_gated',
      lastTaskSummary: 'External publishing paused at human approval gate',
    },
    {
      agentId: 'dealer-workspace-assistant',
      nameEn: 'Dealer Workspace Agent',
      nameAr: 'مساعد المعرض والمخزون',
      role: 'Inventory & buyer inquiry triage',
      status: 'active',
      lastTaskSummary: 'Synced local inventory & CRM leads',
    },
    {
      agentId: 'personal-assistant',
      nameEn: 'Personal Task Runtime',
      nameAr: 'محرك مهام المساعد الشخصي',
      role: 'Task intake, planning, permission preflight & audit',
      status: 'active',
      lastTaskSummary: 'Checkpoint persistence & recovery enabled',
    },
  ],
  workflows: [
    {
      id: 'wf-1',
      nameEn: 'Photo Cutout -> Compare -> Export Pipeline',
      nameAr: 'مسار تفريغ الصور والمقارنة والتصدير',
      stage: 'Gate 4 Skill Runtime',
      health: 'healthy',
    },
    {
      id: 'wf-2',
      nameEn: 'Dealer Inventory -> Ad Draft -> External Publish',
      nameAr: 'مسار المخزون إلى مسودة الإعلان والنشر الخارجي',
      stage: 'Human Approval Gate',
      health: 'awaiting_approval',
    },
  ],
  calendarItems: [
    {
      id: 'cal-1',
      titleEn: 'Weekend Showroom Clearance Spotlight',
      titleAr: 'حملة عروض نهاية الأسبوع للمعرض',
      channel: 'Haraj & Instagram',
      scheduledDate: '2026-11-28',
      status: 'scheduled',
    },
    {
      id: 'cal-2',
      titleEn: 'Certified Hybrid Fleet Feature',
      titleAr: 'إبراز السيارات الهايبرد المعتمدة',
      channel: 'Facebook Marketplace',
      scheduledDate: '2026-12-01',
      status: 'draft',
    },
  ],
  mapNotes: [
    {
      id: 'map-1',
      query: 'Riyadh Al Nakheel & King Fahd Rd Showroom Corridor',
      zone: 'Riyadh North',
      notes: 'High-density auto showroom corridor; benchmark local listing pricing before publishing.',
      createdAt: Date.now() - 7200000,
    },
  ],
};

function readAdminState(): AdminPersistedState {
  try {
    const raw = localStorage.getItem(ADMIN_STATE_KEY);
    if (!raw) return DEFAULT_ADMIN_STATE;
    const parsed = JSON.parse(raw) as Partial<AdminPersistedState>;
    return {
      reaItems: Array.isArray(parsed.reaItems) ? parsed.reaItems : DEFAULT_ADMIN_STATE.reaItems,
      agents: Array.isArray(parsed.agents) ? parsed.agents : DEFAULT_ADMIN_STATE.agents,
      workflows: Array.isArray(parsed.workflows) ? parsed.workflows : DEFAULT_ADMIN_STATE.workflows,
      calendarItems: Array.isArray(parsed.calendarItems)
        ? parsed.calendarItems
        : DEFAULT_ADMIN_STATE.calendarItems,
      mapNotes: Array.isArray(parsed.mapNotes) ? parsed.mapNotes : DEFAULT_ADMIN_STATE.mapNotes,
    };
  } catch {
    return DEFAULT_ADMIN_STATE;
  }
}

export function useAdminWorkspace() {
  const [state, setState] = useState<AdminPersistedState>(() => readAdminState());

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const runReaSandbox = useCallback((sourceLabel: string, rawInput: string) => {
    const cleanSource = sourceLabel.trim() || 'Manual REA Sandbox Input';
    const cleanInput = rawInput.trim();
    if (!cleanInput) return null;

    const hasExternalRisk = /publish|post|send|delete|transfer|نشر|انشر|ارسال|حذف/i.test(cleanInput);
    const verdict: ReaIntakeItem['sandboxVerdict'] = hasExternalRisk
      ? 'flagged_external_action'
      : 'quarantined_clean';

    const item: ReaIntakeItem = {
      id: `rea-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sourceLabel: cleanSource,
      rawInput: cleanInput,
      sandboxVerdict: verdict,
      extractedSummary: hasExternalRisk
        ? 'Sandboxed: flagged external action; blocked from auto-executing without explicit human approval.'
        : 'Sandboxed: parsed safely in isolated intake buffer with zero side effects.',
      createdAt: Date.now(),
    };

    setState(prev => ({ ...prev, reaItems: [item, ...prev.reaItems] }));
    return item;
  }, []);

  const addCalendarItem = useCallback((item: Omit<MarketingCalendarItem, 'id'>) => {
    const created: MarketingCalendarItem = {
      ...item,
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setState(prev => ({ ...prev, calendarItems: [created, ...prev.calendarItems] }));
  }, []);

  const addMapNote = useCallback((query: string, zone: string, notes: string) => {
    if (!query.trim()) return;
    const entry: MapResearchNote = {
      id: `map-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      query: query.trim(),
      zone: zone.trim() || 'General Zone',
      notes: notes.trim() || 'Recorded showroom location research note.',
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, mapNotes: [entry, ...prev.mapNotes] }));
  }, []);

  return {
    ...state,
    runReaSandbox,
    addCalendarItem,
    addMapNote,
  };
}

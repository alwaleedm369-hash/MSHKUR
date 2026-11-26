/**
 * مشكور Micro-SaaS
 * القاعدة: كل ما يمكن تنفيذه صامتاً يعمل في الخلفية.
 * الواجهة تُظهر فقط ما يحتاج قراراً أو نتيجة مرئية.
 */

export type SurfaceKind = 'tool' | 'result' | 'approval' | 'admin' | 'silent';

/** ما يظهر للمستخدم يومياً */
export const VISIBLE_SURFACES: SurfaceKind[] = ['tool', 'result', 'approval'];

/** يعمل دون شاشة مخصصة */
export const SILENT_OPS = [
  'compress-before-process',
  'revoke-object-urls',
  'guest-daily-quota',
  'watermark-policy-read',
  'dealer-brand-load',
  'ad-copy-format',
  'wa-number-normalize',
  'autosave-draft-local',
  'usage-counter',
] as const;

export type SilentOp = (typeof SILENT_OPS)[number];

/** ما يحتاج موافقة صريحة قبل أي أثر خارجي */
export const APPROVAL_GATES = [
  'open-whatsapp-share',
  'publish-listing',
  'external-post',
] as const;

export function isSilentOp(id: string): boolean {
  return (SILENT_OPS as readonly string[]).includes(id);
}

export function requiresApproval(action: string): boolean {
  return (APPROVAL_GATES as readonly string[]).includes(action);
}

/**
 * طبقات المنتج (micro-SaaS):
 * 1) أداة فورية (ضيف/جوال)
 * 2) مساحة عمل السيارة (بعد حساب)
 * 3) إدارة صامتة (حدود، علامة، هوية)
 */
export const PRODUCT_TIERS = {
  freeTool: {
    dailyImages: 3,
    watermark: true,
    surfaces: ['tool', 'result'] as SurfaceKind[],
  },
  dealer: {
    dailyImages: 50,
    watermark: false,
    surfaces: ['tool', 'result', 'approval'] as SurfaceKind[],
  },
  admin: {
    surfaces: ['admin', 'approval'] as SurfaceKind[],
  },
} as const;

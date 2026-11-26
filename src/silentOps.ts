/**
 * عمليات صامتة — لا شاشات، تعمل عند الحاجة فقط
 */
import { compressImageFile } from './compressImage';
import { getDealershipBrand } from './dealershipBrand';
import { isFreeWatermarkEnabled } from './mshkurWatermark';
import { getSavedWaNumber, normalizeWaNumber } from './whatsappShare';
import { buildAdCopy, type AdCopyInput } from './adCopy';

const DRAFT_KEY = 'mshkur_silent_ad_draft';

export type SilentDraft = AdCopyInput & { updatedAt?: string };

/** ضغط الصورة قبل المحرك — خلفية */
export async function silentCompress(file: File): Promise<File> {
  try {
    return await compressImageFile(file, { maxEdge: 1600, quality: 0.85 });
  } catch {
    return file;
  }
}

/** قراءة هوية المعرض والواتساب دون UI */
export function silentLoadIdentity() {
  const brand = getDealershipBrand();
  return {
    dealerName: brand.name,
    logoDataUrl: brand.logoDataUrl,
    whatsapp: getSavedWaNumber(),
    watermarkOn: isFreeWatermarkEnabled(),
  };
}

/** تنسيق نص الإعلان صامتاً */
export function silentFormatAd(input: AdCopyInput): string {
  return buildAdCopy({
    ...input,
    dealerName: input.dealerName || silentLoadIdentity().dealerName,
    tone: input.tone || 'whatsapp',
  });
}

/** حفظ مسودة محلية تلقائياً */
export function silentAutosaveDraft(draft: SilentDraft): void {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
    );
  } catch {
    /* ignore quota */
  }
}

export function silentLoadDraft(): SilentDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SilentDraft;
  } catch {
    return null;
  }
}

/** عدّاد استخدام يومي صامت */
export function silentGuestUsage(timezone = 'Asia/Riyadh'): {
  used: number;
  remaining: number;
  key: string;
} {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const key = 'mshkur_guest_' + today;
  let used = 0;
  try {
    used = Number(localStorage.getItem(key) || 0);
  } catch {
    used = 0;
  }
  return { used, remaining: Math.max(0, 3 - used), key };
}

export function silentBumpGuestUsage(key: string): void {
  try {
    const used = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(used));
  } catch {
    /* ignore */
  }
}

export function silentNormalizePhone(raw: string): string {
  return normalizeWaNumber(raw);
}

/** تنظيف Object URLs — خلفية */
export function silentRevoke(...urls: (string | undefined | null)[]): void {
  for (const u of urls) {
    if (u && u.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* ignore */
      }
    }
  }
}

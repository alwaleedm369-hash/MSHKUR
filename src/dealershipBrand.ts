/**
 * هوية المعرض محلياً — شعار + اسم (بدون رفع سحابي إلزامي)
 */

export const DEALER_NAME_KEY = 'mshkur_dealer_name';
export const DEALER_LOGO_KEY = 'mshkur_dealer_logo_dataurl';

export type DealershipBrand = {
  name: string;
  logoDataUrl: string;
};

export function getDealershipBrand(): DealershipBrand {
  try {
    return {
      name: localStorage.getItem(DEALER_NAME_KEY) || '',
      logoDataUrl: localStorage.getItem(DEALER_LOGO_KEY) || '',
    };
  } catch {
    return { name: '', logoDataUrl: '' };
  }
}

export function saveDealerName(name: string): string {
  const v = String(name || '').trim().slice(0, 80);
  try {
    if (v) localStorage.setItem(DEALER_NAME_KEY, v);
    else localStorage.removeItem(DEALER_NAME_KEY);
  } catch {
    /* ignore */
  }
  return v;
}

/** حفظ شعار كـ Data URL بعد ضغط خفيف */
export async function saveDealerLogoFromFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('اختر ملف صورة للشعار');
  if (file.size > 4 * 1024 * 1024) throw new Error('الشعار أكبر من 4 ميجابايت');

  const bitmap = await createImageBitmap(file);
  const max = 512;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('تعذر معالجة الشعار');
  }
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/png');
  try {
    localStorage.setItem(DEALER_LOGO_KEY, dataUrl);
  } catch {
    throw new Error('تعذر حفظ الشعار محلياً (مساحة التخزين)');
  }
  return dataUrl;
}

export function clearDealerLogo(): void {
  try {
    localStorage.removeItem(DEALER_LOGO_KEY);
  } catch {
    /* ignore */
  }
}

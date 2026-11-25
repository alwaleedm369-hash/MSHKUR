export function resolveLocale(saved: string | null): 'en' | 'ar';
export function getDirection(locale: 'en' | 'ar'): 'rtl' | 'ltr';
export function translateText(value: string, locale: 'en' | 'ar', dictionary?: Record<string, string>): string;

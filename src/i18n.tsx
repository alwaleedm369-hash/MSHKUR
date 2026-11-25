import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getDirection as coreDirection, resolveLocale as coreResolveLocale, translateText as coreTranslateText } from './localeCore.mjs';

export type Locale = 'en' | 'ar';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const COPY: Record<Locale, Record<string, string>> = {
  en: {
    guestLogin: 'Sign in', guestKicker: 'Vehicle preparation studio · local processing',
    guestTitleA: 'Make every vehicle', guestTitleB: 'look showroom-ready.',
    guestCopy: 'Upload photos, remove backgrounds, protect plate details, and prepare a listing. Processing stays on your device.',
    before: 'Before', after: 'After', compare: 'Compare before and after',
    studioTemplates: 'Studio backgrounds', white: 'Studio white', warm: 'Warm', dark: 'Dark', silver: 'Silver', showroom: 'Showroom',
    startPreparing: 'Start preparing', directCapture: 'Take a photo',
    assistantName: 'MSHKUR Assistant', assistantCopy: 'Prepare a local workflow for background removal, plate privacy, and a listing draft.',
    start: 'Start', howItWorks: 'How MSHKUR works',
    stepUpload: 'Upload', stepUploadCopy: 'vehicle photos or take a new one.',
    stepChoose: 'Choose', stepChooseCopy: 'a background or keep the studio finish.',
    stepReview: 'Review and approve', stepReviewCopy: 'before anything is shared.',
    localTrust: 'Saved locally · photos are not uploaded without your approval',
    createWorkspace: 'Create showroom workspace', tryWithoutAccount: 'Try without an account',
    createWorkspaceTitle: 'Create your showroom workspace', loginTitle: 'Welcome back',
    name: 'Your name', workspaceName: 'Showroom name', email: 'Email', password: 'Password',
    create: 'Create workspace', login: 'Sign in', createFree: 'Start free',
    haveAccount: 'Already have an account?', needAccount: 'New to MSHKUR?', backToStudio: 'Back to studio',
    home: 'Home', studio: 'Studio', cars: 'Vehicles', reviews: 'Reviews', admin: 'Manage',
    logout: 'Sign out', menu: 'Open menu', assistant: 'Assistant',
  },
  ar: {
    guestLogin: 'دخول', guestKicker: 'استوديو تجهيز السيارات · معالجة محلية',
    guestTitleA: 'سيارتك،', guestTitleB: 'بصورة تليق بها.',
    guestCopy: 'ارفع الصور، أزل الخلفية، واحمِ تفاصيل اللوحة، وجهّز الإعلان. المعالجة محلية على جهازك.',
    before: 'قبل', after: 'بعد', compare: 'اسحب للمقارنة',
    studioTemplates: 'خلفيات الاستوديو', white: 'أبيض استوديو', warm: 'دافئ', dark: 'داكن', silver: 'رمادي', showroom: 'معرض',
    startPreparing: 'ابدأ التجهيز', directCapture: 'تصوير مباشر',
    assistantName: 'مساعد مشكور', assistantCopy: 'جهز إزالة الخلفية وحماية اللوحة ومسودة الإعلان محلياً.',
    start: 'ابدأ', howItWorks: 'كيف يعمل مشكور؟',
    stepUpload: 'ارفع', stepUploadCopy: 'صور السيارة أو التقطها.',
    stepChoose: 'اختر', stepChooseCopy: 'خلفية أو اترك النتيجة بيضاء.',
    stepReview: 'راجع ووافق', stepReviewCopy: 'قبل أي نشر.',
    localTrust: 'العمل محفوظ محلياً · لا نرفع صورك دون موافقتك',
    createWorkspace: 'إنشاء مساحة معرض', tryWithoutAccount: 'جرّب بدون تسجيل',
    createWorkspaceTitle: 'إنشاء مساحة معرض', loginTitle: 'مرحباً بعودتك',
    name: 'اسمك', workspaceName: 'اسم المعرض', email: 'البريد', password: 'كلمة المرور',
    create: 'إنشاء', login: 'دخول', createFree: 'ابدأ مجاناً',
    haveAccount: 'لديك حساب؟', needAccount: 'حساب جديد؟', backToStudio: 'العودة للأداة',
    home: 'الرئيسية', studio: 'الاستوديو', cars: 'السيارات', reviews: 'مراجعات', admin: 'إدارة',
    logout: 'خروج', menu: 'القائمة', assistant: 'المساعد',
  },
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function resolveLocale(saved: string | null): Locale {
  return coreResolveLocale(saved);
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return coreDirection(locale);
}

export function translateText(value: string, locale: Locale): string {
  return coreTranslateText(value, locale, GLOBAL_ENGLISH);
}

const GLOBAL_ENGLISH: Record<string, string> = {
  'الرئيسية': 'Home',
  'الاستوديو': 'Studio',
  'السيارات': 'Vehicles',
  'مراجعات': 'Reviews',
  'إدارة': 'Manage',
  'المساعد': 'Assistant',
  'خروج': 'Sign out',
  'القائمة': 'Menu',
  'إنشاء': 'Create',
  'دخول': 'Sign in',
  'حساب جديد': 'Create account',
  'لديك حساب؟ دخول': 'Already have an account? Sign in',
  'حساب جديد؟': 'New account?',
  'العودة للأداة': 'Back to studio',
  'سيارة جديدة': 'New vehicle',
  'ماذا تريد أن تفعل؟': 'What would you like to do?',
  'الأدوات الأساسية': 'Core tools',
  'إزالة الخلفية': 'Remove background',
  'طمس اللوحة': 'Blur plate',
  'تحسين الصورة': 'Enhance photo',
  'تجهيز الإعلان': 'Prepare listing',
  'عرض الكل': 'View all',
  'فتح الألبوم': 'Open album',
  'إضافة سيارة': 'Add vehicle',
  'أعمالي': 'My work',
  'ماذا تفعل؟': 'What would you like to do?',
  'مهام العمل': 'Work tasks',
  'المهارات': 'Skills',
  'الموافقات': 'Approvals',
  'النمو والمحادثة': 'Growth and chat',
  'مركز المالك': 'Owner center',
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveLocale(localStorage.getItem('mshkur.locale')));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    localStorage.setItem('mshkur.locale', locale);

    const originalText = new WeakMap<Text, string>();
    const originalAttributes = new WeakMap<Element, Record<string, string>>();
    const apply = () => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      const nodes: (Text | Element)[] = [];
      let node = walk.nextNode();
      while (node) {
        nodes.push(node as Text | Element);
        node = walk.nextNode();
      }
      for (const item of nodes) {
        if (item instanceof Text) {
          const original = originalText.get(item) ?? item.nodeValue ?? '';
          if (!originalText.has(item)) originalText.set(item, original);
          item.nodeValue = locale === 'en' ? translateText(original, 'en') : original;
          continue;
        }
        for (const attribute of ['placeholder', 'aria-label', 'title']) {
          const originalMap = originalAttributes.get(item) ?? {};
          const original = originalMap[attribute] ?? item.getAttribute(attribute);
          if (original == null) continue;
          if (!(attribute in originalMap)) originalMap[attribute] = original;
          originalAttributes.set(item, originalMap);
          item.setAttribute(attribute, locale === 'en' ? translateText(original, 'en') : original);
        }
      }
    };

    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key: string) => COPY[locale][key] || key,
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}

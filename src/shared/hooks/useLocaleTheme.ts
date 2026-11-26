import { useState, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'ar';
export type ThemeMode = 'light' | 'dark';

export function useLocaleTheme() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mshkur_locale') : null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mshkur_theme') : null;
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('mshkur_locale', locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('mshkur_theme', theme);
  }, [theme]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { locale, setLocale, theme, toggleTheme, isRTL: locale === 'ar', isDark: theme === 'dark' };
}

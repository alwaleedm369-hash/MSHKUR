import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera, Megaphone, Store, Bot, Sun, Moon, Shield } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';

const navigation = [
  { name: 'Photo Studio', nameAr: 'استوديو الصور', href: '/photo-studio', icon: Camera },
  { name: 'Ad Studio', nameAr: 'استوديو الإعلان', href: '/ad-studio', icon: Megaphone },
  { name: 'Dealer', nameAr: 'المعرض', href: '/dealer-portal', icon: Store },
  { name: 'Admin', nameAr: 'الإدارة', href: '/admin', icon: Shield },
];

export const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const { locale, setLocale, isDark, toggleTheme } = useLocaleTheme();

  const isActive = (href: string) =>
    href === '/photo-studio'
      ? location.pathname === '/' || location.pathname.startsWith('/photo-studio')
      : location.pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
      <nav className="container-mshkur" aria-label="Main navigation">
        <div className="flex h-14 items-center justify-between gap-2">
          {/* Compact three-line menu trigger (no brand masthead on mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop navigation tabs */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors min-h-[40px]',
                      active
                        ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-800'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{locale === 'ar' ? item.nameAr : item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compact Controls: Locale ('E' / 'ع') and Light/Dark toggle */}
          <div className="flex items-center gap-1.5 relative">
            <div className="relative">
              <button
                onClick={() => setIsLocaleOpen(!isLocaleOpen)}
                className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-body-sm text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700 rounded-lg"
                aria-label="Select language"
                aria-expanded={isLocaleOpen}
              >
                {locale === 'en' ? 'E' : 'ع'}
              </button>

              {isLocaleOpen && (
                <div
                  className="absolute end-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-lg py-1 z-50"
                  role="menu"
                >
                  <button
                    onClick={() => { setLocale('en'); setIsLocaleOpen(false); }}
                    className={cn(
                      'w-full px-3 py-2.5 text-start text-body-sm flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-800',
                      locale === 'en' && 'font-semibold text-brand-600'
                    )}
                    role="menuitem"
                  >
                    <span>English</span>
                    <span className="text-body-xs text-surface-400">LTR</span>
                  </button>
                  <button
                    onClick={() => { setLocale('ar'); setIsLocaleOpen(false); }}
                    className={cn(
                      'w-full px-3 py-2.5 text-start text-body-sm flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-800',
                      locale === 'ar' && 'font-semibold text-brand-600'
                    )}
                    role="menuitem"
                  >
                    <span>العربية</span>
                    <span className="text-body-xs text-surface-400">RTL</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center border border-surface-200 dark:border-surface-700 rounded-lg"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              to="/ai-assistant"
              className="hidden md:inline-flex btn btn-primary btn-sm gap-1.5 min-h-[40px]"
            >
              <Bot className="h-4 w-4" />
              <span>{locale === 'ar' ? 'المساعد' : 'iAI'}</span>
            </Link>
          </div>
        </div>

        {/* Compact Drawer Menu */}
        {isMenuOpen && (
          <div className="py-3 border-t border-surface-200 dark:border-surface-800">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-body-sm font-medium min-h-[44px]',
                      active
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                        : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{locale === 'ar' ? item.nameAr : item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

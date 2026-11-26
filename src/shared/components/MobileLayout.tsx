import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronUp, MoreHorizontal, Search, Settings, Home, MessageSquare, Bot, Store, Camera, Megaphone, Layers, Sparkles, Globe, Sun, Moon, Bell, User, LogOut, ArrowRight, Download, Upload, Share2, Heart, Star, Shield, Zap, TrendingUp, BarChart3, Package, Users, Calendar, Clock, DollarSign, CreditCard, Shield as ShieldIcon, Key, Lock, Unlock, Crown, Award, ThumbsUp, Flag, Bookmark, Print, Redo, Undo, ZoomIn, ZoomOut, RotateCcw, RotateCw, Crop, Scissors, PenTool, Type, Palette, Brush, Eraser, Eyedropper, Move, Hand, Minimize2, Maximize2, Fullscreen, Grid, List, Columns, Rows, Split, Merge, AlignLeft, AlignCenter, AlignRight, Justify, Indent, Outdent, Bold, Italic, Underline, Strikethrough, Code, Quote, Heading1, Heading2, Heading3, List as ListIcon, CheckSquare, XSquare, Radio, Circle, Square, Triangle, Hexagon, Octagon, Pentagon, Diamond, Gem, Sparkle, Zap as ZapIcon, Cloud, CloudRain, CloudSnow, CloudSun, CloudLightning, CloudFog, Wind, Droplets, Flame, Snowflake, Sun as SunIcon, Moon as MoonIcon, Star as StarIcon, Planet, Rocket, Satellite, Telescope, Microscope, Flask, TestTube, Beaker, Pill, Capsule, Bandage, Stethoscope, HeartPulse, Brain, Bone, Dna, Virus, Bacteria, Syringe, Thermometer, Weight, Ruler, Compass, Map, Navigation, Anchor, Ship, Plane, Car, Truck, Bus, Bike, Motorcycle, Train, Tram, Subway, Ferry, CableCar, Gondola, Chair, Sofa, Bed, Lamp, Lightbulb, Fan, Heater, AirConditioner, Humidifier, Purifier, Vacuum, Washer, Dryer, Fridge, Freezer, Oven, Microwave, Dishwasher, Blender, Toaster, Coffee, Kettle } from 'lucide-react';
import { cn } from '@utils/cn';
import { usePWA } from '@hooks/usePWA';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

const bottomNavItems = [
  { id: 'home', label: 'Home', labelAr: 'الرئيسية', icon: Home, href: '/' },
  { id: 'photo', label: 'Photo Studio', labelAr: 'استوديو الصور', icon: Camera, href: '/photo-studio' },
  { id: 'ad', label: 'Ad Studio', labelAr: 'استوديو الإعلان', icon: Megaphone, href: '/ad-studio' },
  { id: 'dealer', label: 'Dealer', labelAr: 'المعرض', icon: Store, href: '/dealer-portal' },
  { id: 'ai', label: 'Assistant', labelAr: 'المساعد', icon: Bot, href: '/ai-assistant' },
];

export const MobileLayout = ({ children, showBottomNav = true, currentTab = 'home', onTabChange }: MobileLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isInstallable, install } = usePWA();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId);
    if (typeof window !== 'undefined') {
      window.location.href = bottomNavItems.find(item => item.id === tabId)?.href || '/';
    }
  };

  const isRTL = document.dir === 'rtl';

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Top Bar */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 shadow-sm' : 'bg-transparent'
      )}>
        <div className="container-mshkur">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <a href="/" className="flex items-center gap-2" aria-label="MSHKUR - Home">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="hidden sm:block text-heading-md font-bold text-surface-900 dark:text-white">MSHKUR</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main navigation">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => { e.preventDefault(); handleTabChange(item.id); }}
                    className={cn(
                      'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-body-md font-medium transition-all duration-200',
                      active
                        ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-800'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn-icon relative"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" aria-hidden="true" />
              </button>

              {/* PWA Install */}
              {isInstallable && (
                <button
                  onClick={install}
                  className="btn-icon relative bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50"
                  aria-label="Install app"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}

              {/* AI Assistant Quick Access */}
              <a
                href="/ai-assistant"
                className={cn(
                  'btn relative overflow-hidden',
                  'bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:from-brand-600 hover:to-brand-800'
                )}
              >
                <Bot className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Assistant</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden btn-icon"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-surface-200 dark:border-surface-800"
              >
                <div className="flex flex-col gap-2">
                  {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentTab === item.id;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => { e.preventDefault(); handleTabChange(item.id); setIsMenuOpen(false); }}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-4 py-3 text-body-md font-medium transition-all',
                          active
                            ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                            : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-800'
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{item.labelAr || item.label}</span>
                      </a>
                    );
                  })}
                  <div className="pt-2 border-t border-surface-200 dark:border-surface-800" />
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-100 dark:bg-surface-800">
                    <button onClick={toggleTheme} className="flex items-center gap-2 text-body-md text-surface-700 dark:text-surface-300">
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20" id="main-content">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      {showBottomNav && (
        <AnimatePresence>
          <motion.nav
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 md:hidden safe-bottom"
            role="navigation"
            aria-label="Bottom navigation"
          >
            <div className="grid grid-cols-5 h-16">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                        'flex flex-col items-center justify-center gap-1 px-2 py-2 transition-all duration-200',
                        active
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
                    )}
                    aria-current={active ? 'page' : undefined}
                    aria-label={item.labelAr || item.label}
                  >
                    <Icon className={cn('h-6 w-6 transition-all', active && 'scale-110')} aria-hidden="true" />
                    <span className={cn('text-[10px] font-medium', active && 'text-brand-600 dark:text-brand-400')}>
                      {item.labelAr || item.label}
                    </span>
                    {active && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 bg-brand-500 rounded-b-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        </AnimatePresence>
      )}

      {/* AI Assistant Floating Trigger */}
      <AIAssistantFab />
    </div>
  );
};

const AIAssistantFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const visited = localStorage.getItem('ai-assistant-visited');
    if (!visited) {
      const timer = setTimeout(() => setHasInteracted(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) localStorage.setItem('ai-assistant-visited', 'true');
  };

  const quickActions = [
    { label: 'New Chat', labelAr: 'دردشة جديدة', href: '/ai-assistant?new=true', icon: <MessageSquare className="h-5 w-5" />, description: 'Start conversation with your assistant' },
    { label: 'Analyze Image', labelAr: 'تحليل صورة', href: '/photo-studio?assist=true', icon: <Zap className="h-5 w-5" />, description: 'Request image analysis or processing' },
    { label: 'Create Ad', labelAr: 'إنشاء إعلان', href: '/ad-studio?assist=true', icon: <Sparkles className="h-5 w-5" />, description: 'Write professional car listing' },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={cn(
          'fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 btn rounded-2xl shadow-xl',
          'bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white',
          'hover:from-brand-600 hover:via-brand-700 hover:to-brand-800',
          'ring-4 ring-brand-500/20',
          isOpen && 'rotate-45'
        )}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        aria-controls="ai-assistant-panel"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Bot className="h-6 w-6 transition-transform duration-200" aria-hidden="true" />
        <span className="sr-only">AI Assistant</span>
      </motion.button>

      {/* Notification Badge */}
      <AnimatePresence>
        {hasInteracted && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            className="fixed bottom-28 right-4 md:bottom-20 md:right-6 z-40"
          >
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg border border-surface-200 p-3 min-w-[200px] max-w-[280px]">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-brand-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-surface-900 dark:text-white">Your Assistant is Ready</p>
                    <p className="text-body-xs text-surface-500 mt-0.5">Tap to chat with your AI assistant</p>
                  </div>
                  <button onClick={() => setHasInteracted(false)} className="text-surface-400 hover:text-surface-600" aria-label="Dismiss">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 right-6 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-surface-200" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="ai-assistant-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-28 right-4 md:bottom-20 md:right-6 z-50 w-72"
            role="dialog"
            aria-label="AI Assistant quick actions"
          >
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/20 border-b border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">AI Assistant</h3>
                    <p className="text-body-xs text-surface-500">Your Copy. Your Secretary. Your Friend.</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="btn-icon p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-200 dark:hover:bg-surface-800" aria-label="Close panel">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-2">
                {quickActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3',
                      'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800',
                      'transition-all duration-200 group'
                    )}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/50 group-hover:scale-105 transition-all">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-start">
                      <p className="text-body-sm font-medium truncate">{action.labelAr || action.label}</p>
                      <p className="text-body-xs text-surface-500 truncate">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-400 group-hover:text-brand-600 transition-colors" />
                  </a>
                ))}
              </div>

              <div className="border-t border-surface-200 dark:border-surface-800 mx-2" />

              <div className="p-2 grid grid-cols-2 gap-1">
                <a href="/ai-assistant" onClick={() => setIsOpen(false)} className="btn btn-sm justify-center gap-1.5 text-body-sm">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
                <a href="/docs/ai-assistant" onClick={() => setIsOpen(false)} className="btn btn-sm btn-ghost justify-center gap-1.5 text-body-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 45 }}
              className="absolute bottom-0 right-6 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-surface-900 border-r border-b border-surface-200 dark:border-surface-800 rotate-45"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

import { HelpCircle, ChevronRight, Settings, MessageSquare, Zap, Sparkles, Bot, Download, Sun, Moon, X, Menu, ChevronDown, Upload, Share2, Heart, Star, Shield, TrendingUp, BarChart3, Package, Users, Calendar, Clock, DollarSign, CreditCard, Shield as ShieldIcon, Key, Lock, Unlock, Crown, Award, ThumbsUp, Flag, Bookmark, Print, Redo, Undo, ZoomIn, ZoomOut, RotateCcw, RotateCw, Crop, Scissors, PenTool, Type, Palette, Brush, Eraser, Eyedropper, Move, Hand, Minimize2, Maximize2, Fullscreen, Grid, List, Columns, Rows, Split, Merge, AlignLeft, AlignCenter, AlignRight, Justify, Indent, Outdent, Bold, Italic, Underline, Strikethrough, Code, Quote, Heading1, Heading2, Heading3, List as ListIcon, CheckSquare, XSquare, Radio, Circle, Square, Triangle, Hexagon, Octagon, Pentagon, Diamond, Gem, Sparkle, Zap as ZapIcon, Cloud, CloudRain, CloudSnow, CloudSun, CloudLightning, CloudFog, Wind, Droplets, Flame, Snowflake, Sun as SunIcon, Moon as MoonIcon, Star as StarIcon, Planet, Rocket, Satellite, Telescope, Microscope, Flask, TestTube, Beaker, Pill, Capsule, Bandage, Stethoscope, HeartPulse, Brain, Bone, Dna, Virus, Bacteria, Syringe, Thermometer, Weight, Ruler, Compass, Map, Navigation, Anchor, Ship, Plane, Car, Truck, Bus, Bike, Motorcycle, Train, Tram, Subway, Ferry, CableCar, Gondola, Chair, Sofa, Bed, Lamp, Lightbulb, Fan, Heater, AirConditioner, Humidifier, Purifier, Vacuum, Washer, Dryer, Fridge, Freezer, Oven, Microwave, Dishwasher, Blender, Toaster, Coffee, Kettle, Camera, Megaphone, Store, Sparkles as SparklesIcon, Globe, Smartphone, Bell, User, LogOut, ArrowRight } from 'lucide-react';
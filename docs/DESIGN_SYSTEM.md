# MSHKUR Design System Specification
## نظام التصميم الموحد لمشكور

---

## 1. المبادئ التأسيسية (Design Principles)

### 1.1 Mobile-First Approach
- **الشاشة المحمولة أولاً**: جميع التصاميم تبدأ من 375px (iPhone SE) وتتمدد للأكبر
- **Touch Targets**: الحد الأدنى 44x44px لكل العناصر التفاعلية
- **Gestures**: دعم swipe, pinch, pull-to-refresh, long-press
- **Progressive Enhancement**: الميزات المتقدمة تضاف للشاشات الأكبر

### 1.2 RTL/LRT Bidirectional Support
- **العربية افتراضياً (RTL)**: `dir="rtl"` مع `lang="ar"`
- **الإنجليزية (LTR)**: `dir="ltr"` مع `lang="en"`
- **Logical Properties فقط**: `margin-inline-start`, `padding-inline-end`, `text-align: start`
- **Icon Mirroring**: الأيقونات الاتجاهية تنعكس تلقائياً

### 1.3 Light Mode First
- **Light Mode افتراضي**: الألوان الفاتحة هي الأساس
- **Dark Mode كطبقة**: `prefers-color-scheme` + toggle يدوي
- **لا hardcoded colors**: فقط CSS Custom Properties

### 1.4 Brand Identity - "أنت تطلب. مشكور يساعدك."
- **Minimal Text**: تقليل النصوص، التركيز على الأيقونات والنتائج
- **Task-Oriented**: الواجهة تبدأ من المهمة، لا من القائمة
- **Zero Friction**: دخول مباشر للأدوات بدون تسجيل إجباري

---

## 2. Color System (نظام الألوان)

### 2.1 Brand Colors (ألوان العلامة التجارية)
```css
/* Primary Brand - Azure/Sky */
--brand-50:  #f0f9ff;
--brand-100: #e0f2fe;
--brand-200: #bae6fd;
--brand-300: #7dd3fc;
--brand-400: #38bdf8;
--brand-500: #0ea5e9;  /* Primary */
--brand-600: #0284c7;
--brand-700: #0369a1;
--brand-800: #075985;
--brand-900: #0c4a6e;
--brand-950: #082f49;

/* Secondary - Emerald/Teal for Success/Processing */
--success-50:  #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Accent - Amber/Orange for Actions */
--accent-50:  #fffbeb;
--accent-500: #f59e0b;
--accent-600: #d97706;
```

### 2.2 Surface Colors (أسطح الواجهة)
```css
/* Light Mode Surfaces */
--surface-0:   #ffffff;
--surface-50:  #fafafa;
--surface-100: #f5f5f5;
--surface-200: #e5e5e5;
--surface-300: #d4d4d4;
--surface-400: #a3a3a3;
--surface-500: #737373;
--surface-600: #525252;
--surface-700: #404040;
--surface-800: #262626;
--surface-900: #171717;
--surface-950: #0a0a0a;

/* Dark Mode Surfaces (via [data-theme="dark"]) */
[data-theme="dark"] {
  --surface-0:   #0a0a0a;
  --surface-50:  #171717;
  --surface-100: #262626;
  --surface-200: #404040;
  --surface-300: #525252;
  --surface-400: #737373;
  --surface-500: #a3a3a3;
  --surface-600: #d4d4d4;
  --surface-700: #e5e5e5;
  --surface-800: #f5f5f5;
  --surface-900: #fafafa;
  --surface-950: #ffffff;
}
```

### 2.3 Semantic Colors (ألوان دلالية)
```css
/* Error - Red */
--error-50:  #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Warning - Amber */
--warning-50:  #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Info - Blue */
--info-50:  #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
```

### 2.4 Space/Robotics Theme Colors (لثيم الفضاء والروبوتات)
```css
/* Space Dark Theme */
--space-bg:       #050814;
--space-surface:  #0a1128;
--space-elevated: #111a3a;
--space-border:   #1e2d5e;
--space-glow:     #00d4ff;
--space-neon:     #7c3aed;
--space-cyber:    #06ffa5;
--space-warning:  #ff6b35;
--space-text:     #e8ecf4;
--space-text-dim: #8b95b3;

/* Robotics Theme */
--robot-primary:  #00d4ff;
--robot-secondary: #7c3aed;
--robot-accent:   #06ffa5;
--robot-dark:     #0a0f1a;
--robot-panel:    #141c2e;
--robot-border:   #233155;
```

---

## 3. Typography System (نظام الطباعة)

### 3.1 Font Families
```css
/* Arabic Font - IBM Plex Sans Arabic */
--font-arabic: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', system-ui, sans-serif;

/* Latin Font - IBM Plex Sans */
--font-latin: 'IBM Plex Sans', 'Inter', system-ui, sans-serif;

/* Mono - IBM Plex Mono */
--font-mono: 'IBM Plex Mono', 'JetBrains Mono', monospace;

/* Display - For Hero/Marketing */
--font-display: 'Space Grotesk', 'IBM Plex Sans', sans-serif;
```

### 3.2 Font Sizes & Line Heights (Responsive Clamp)
```css
/* Display - Marketing/Hero */
--text-display-xl: clamp(2.5rem, 5vw + 1rem, 4rem);      /* 40-64px */
--text-display-lg: clamp(2rem, 4vw + 0.5rem, 3rem);       /* 32-48px */
--text-display-md: clamp(1.5rem, 3vw + 0.25rem, 2.25rem); /* 24-36px */
--text-display-sm: clamp(1.25rem, 2vw + 0.5rem, 1.75rem); /* 20-28px */

/* Headings */
--text-h1: 1.5rem;    /* 24px */
--text-h2: 1.25rem;   /* 20px */
--text-h3: 1.125rem;  /* 18px */
--text-h4: 1rem;      /* 16px */

/* Body */
--text-body-lg: 1.125rem;  /* 18px */
--text-body-md: 1rem;      /* 16px */
--text-body-sm: 0.875rem;  /* 14px */
--text-body-xs: 0.75rem;   /* 12px */

/* Caption */
--text-caption: 0.75rem;   /* 12px */
```

### 3.3 Font Weights
```css
--font-light:    300;
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### 3.4 RTL/LTR Typography Rules
```css
/* Arabic text needs slightly larger size for same visual weight */
[dir="rtl"] {
  --text-body-md: 1.0625rem;  /* 17px vs 16px */
  --text-body-sm: 0.9375rem;  /* 15px vs 14px */
}

/* Ligatures for Arabic */
[dir="rtl"] * {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11", "liga", "clig", "calt";
}

/* Latin ligatures */
[dir="ltr"] * {
  font-feature-settings: "liga", "clig", "calt", "kern";
}
```

---

## 4. Spacing System (نظام المسافات)

### 4.1 Base Unit: 4px (0.25rem)
```css
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

### 4.2 Logical Spacing (RTL/LTR Safe)
```css
/* Use logical properties exclusively */
.mt-4    { margin-top: var(--space-4); }
.mb-4    { margin-bottom: var(--space-4); }
.ms-4    { margin-inline-start: var(--space-4); }
.me-4    { margin-inline-end: var(--space-4); }
.ps-4    { padding-inline-start: var(--space-4); }
.pe-4    { padding-inline-end: var(--space-4); }
.pt-4    { padding-top: var(--space-4); }
.pb-4    { padding-bottom: var(--space-4); }
.px-4    { padding-inline: var(--space-4); }
.py-4    { padding-block: var(--space-4); }
```

---

## 5. Border Radius & Shadows

### 5.1 Border Radius
```css
--radius-none: 0;
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.5rem;   /* 8px */
--radius-lg:   0.75rem;  /* 12px */
--radius-xl:   1rem;     /* 16px */
--radius-2xl:  1.5rem;   /* 24px */
--radius-3xl:  2rem;     /* 32px */
--radius-full: 9999px;
```

### 5.2 Shadows (Layered Depth)
```css
/* Elevation 1 - Subtle */
--shadow-xs:   0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:   0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Elevation 2 - Card */
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06);

/* Elevation 3 - Dropdown/Modal */
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Elevation 4 - Modal/Sheet */
--shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Brand Shadows */
--shadow-brand:      0 4px 14px 0 rgb(14 165 233 / 0.3);
--shadow-brand-lg:   0 10px 40px 0 rgb(14 165 233 / 0.25);

/* Space/Robot Glow Shadows */
--shadow-glow:       0 0 20px rgb(0 212 255 / 0.3);
--shadow-glow-lg:    0 0 40px rgb(124 58 237 / 0.4);
--shadow-neon:       0 0 30px rgb(6 255 165 / 0.4);
```

---

## 6. Animation & Motion

### 6.1 Timing Functions
```css
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 6.2 Durations
```css
--duration-instant: 0ms;
--duration-fast:    100ms;
--duration-normal:  200ms;
--duration-slow:    300ms;
--duration-slower:  500ms;
--duration-slowest: 700ms;
```

### 6.3 Keyframe Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgb(0 212 255 / 0.3); }
  50% { box-shadow: 0 0 40px rgb(0 212 255 / 0.5); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes rotateSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orbit {
  from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
}
```

### 6.4 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Component Specifications (مواصفات المكونات)

### 7.1 Buttons (الأزرار)
```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  padding: 0.625rem 1rem;      /* 10px 16px */
  font-size: var(--text-body-md);
  font-weight: var(--font-medium);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
  border: none;
  outline: none;
  white-space: nowrap;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.4);
}

.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
  color: white;
  box-shadow: var(--shadow-brand);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--brand-600), var(--brand-700));
  box-shadow: var(--shadow-brand-lg);
}

.btn-secondary {
  background: var(--surface-100);
  color: var(--surface-900);
  border: 1px solid var(--surface-200);
}
.btn-secondary:hover {
  background: var(--surface-200);
}

.btn-ghost {
  background: transparent;
  color: var(--surface-700);
}
.btn-ghost:hover {
  background: var(--surface-100);
}

.btn-outline {
  background: transparent;
  color: var(--brand-600);
  border: 2px solid var(--brand-600);
}
.btn-outline:hover {
  background: var(--brand-50);
}

.btn-danger {
  background: var(--error-500);
  color: white;
}

/* Sizes */
.btn-sm   { padding: 0.375rem 0.75rem; font-size: var(--text-body-sm); gap: 0.375rem; }
.btn-lg   { padding: 0.75rem 1.5rem; font-size: var(--text-body-lg); gap: 0.625rem; }
.btn-xl   { padding: 1rem 2rem; font-size: var(--text-h4); gap: 0.75rem; }
.btn-icon { padding: 0.5rem; aspect-ratio: 1; }

/* Space/Robot Theme Buttons */
.btn-space {
  background: linear-gradient(135deg, var(--space-glow), var(--space-neon));
  color: var(--space-dark);
  box-shadow: var(--shadow-glow);
}
.btn-space:hover { box-shadow: var(--shadow-glow-lg); }

.btn-robot {
  background: linear-gradient(135deg, var(--robot-primary), var(--robot-secondary));
  color: white;
}
```

### 7.2 Cards (البطاقات)
```css
.card {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--surface-300);
}

.card-interactive {
  cursor: pointer;
}
.card-interactive:active { transform: scale(0.99); }

/* Space Theme Card */
.card-space {
  background: var(--space-panel);
  border: 1px solid var(--space-border);
  box-shadow: var(--shadow-glow);
}
.card-space:hover {
  box-shadow: var(--shadow-glow-lg);
  border-color: var(--space-glow);
}

/* Robot Theme Card */
.card-robot {
  background: var(--robot-panel);
  border: 1px solid var(--robot-border);
}
.card-robot:hover {
  border-color: var(--robot-primary);
  box-shadow: 0 0 20px rgb(0 212 255 / 0.2);
}
```

### 7.3 Inputs & Forms (الحقول والنماذج)
```css
.input {
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-300);
  background: var(--surface-0);
  padding: 0.625rem 1rem;
  font-size: var(--text-body-md);
  color: var(--surface-900);
  transition: all var(--duration-fast) var(--ease-out);
}

.input::placeholder { color: var(--surface-400); }

.input:focus {
  outline: none;
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.15);
}

.input-error {
  border-color: var(--error-500);
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
}

.label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: var(--text-body-sm);
  font-weight: var(--font-medium);
  color: var(--surface-700);
}

.form-group { margin-bottom: 1rem; }
.form-error { font-size: var(--text-body-sm); color: var(--error-500); margin-top: 0.25rem; }
.form-hint  { font-size: var(--text-body-sm); color: var(--surface-500); margin-top: 0.25rem; }
```

### 7.4 Badges & Chips (الشارات)
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: var(--text-body-xs);
  font-weight: var(--font-medium);
}

.badge-primary   { background: var(--brand-100); color: var(--brand-700); }
.badge-success   { background: var(--success-50); color: var(--success-600); }
.badge-warning   { background: var(--warning-50); color: var(--warning-600); }
.badge-error     { background: var(--error-50); color: var(--error-600); }
.badge-neutral   { background: var(--surface-100); color: var(--surface-600); }
.badge-space     { background: rgba(0, 212, 255, 0.15); color: var(--space-glow); border: 1px solid var(--space-glow); }
.badge-robot     { background: rgba(124, 58, 237, 0.15); color: var(--robot-primary); border: 1px solid var(--robot-primary); }
```

### 7.5 Modal/Dialog (المودال)
```css
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.modal-content {
  position: fixed; left: 50%; top: 50%; z-index: 510;
  transform: translate(-50%, -50%);
  width: 90%; max-width: 32rem;
  background: var(--surface-0);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: 1.5rem;
  animation: scaleIn var(--duration-normal) var(--ease-spring);
}

.modal-content-sm  { max-width: 24rem; }
.modal-content-lg  { max-width: 48rem; }
.modal-content-xl  { max-width: 64rem; }
```

### 7.6 Sheet/Bottom Drawer (القائمة السفلية)
```css
.sheet-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.sheet-content {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 510;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: var(--surface-0);
  box-shadow: var(--shadow-2xl);
  padding: 1.5rem;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

---

## 8. Home Screen Design (تصميم الشاشة الرئيسية)

### 8.1 Layout Structure
```
┌─────────────────────────────────────────┐
│ Header (Logo + Navigation)               │
├─────────────────────────────────────────┤
│ Hero Section                             │
│  ├── Brand Badge                         │
│  ├── Headline: "أنت تطلب. مشكور يساعدك." │
│  ├── Subtitle                            │
│  ├── Primary CTA (Photo Studio)          │
│  ├── Secondary CTA (AI Assistant)        │
│  └── Trust Indicators (4 items)          │
├─────────────────────────────────────────┤
│ Apps Grid (3 Cards)                      │
│  ├── Card 1: Photo Studio 📸             │
│  ├── Card 2: Ad Studio 📢                │
│  └── Card 3: Dealer Portal 🏪            │
├─────────────────────────────────────────┤
│ AI Assistant Card (Integrated)           │
├─────────────────────────────────────────┤
│ Features Deep Dive (8 cards)             │
├─────────────────────────────────────────┤
│ How It Works (3 steps)                   │
├─────────────────────────────────────────┤
│ CTA Section (Gradient)                   │
├─────────────────────────────────────────┤
│ Footer                                   │
└─────────────────────────────────────────┘
```

### 8.2 App Card Design (مستوحى من carflowai.com & spyne.ai)

#### Card Structure:
```
┌─────────────────────────────────────┐
│ ┌─────┐  Badge (Optional)            │
│ │ Icon│                              │
│ └─────┘                              │
├─────────────────────────────────────┤
│ Title (App Name)                     │
│ Description (2 lines max)            │
├─────────────────────────────────────┤
│ Features List (4 items with ✓)       │
│  ✓ Feature 1                         │
│  ✓ Feature 2                         │
│  ✓ Feature 3                         │
│  ✓ Feature 4                         │
│  +N more...                          │
├─────────────────────────────────────┤
│ Stats Row (3 items)                  │
│  [Icon] 50K+     [Icon] 200+     [Icon] 99.2% │
├─────────────────────────────────────┤
│ CTA Button: "ابدأ الآن →"            │
└─────────────────────────────────────┘
```

#### Visual Details:
- **Gradient Top Border**: 2px gradient matching app color
- **Icon Container**: 56x56px rounded-2xl with gradient background
- **Hover State**: Lift (-4px), enhanced shadow, border glows
- **Staggered Animation**: Cards animate in sequence (100ms delay each)

#### App Colors:
| App | Gradient | Accent | Icon |
|-----|----------|--------|------|
| Photo Studio | emerald → teal → cyan | emerald | 📸 Camera |
| Ad Studio | amber → orange → red | amber | 📢 Megaphone |
| Dealer Portal | violet → purple → indigo | violet | 🏪 Store |

### 8.3 AI Assistant Card
- **Full Width Card** with brand gradient (blue → cyan)
- **Badge**: "مدمج في كل التطبيقات"
- **Icon**: Sparkles ✨ in brand gradient circle
- **Features**: 8 items in 2-column grid

### 8.4 Background Decorations (Space/Robot Theme)
```css
/* Hero Background */
.hero-bg {
  position: absolute; inset: 0; z-index: -1;
  overflow: hidden;
}

/* Floating Orbs */
.orb-1 { top: 0; right: 0; width: 400px; height: 400px; 
  background: radial-gradient(circle, var(--brand-500/10), transparent); 
  border-radius: 50%; filter: blur(80px); animation: float 8s ease-in-out infinite; }

.orb-2 { bottom: 0; left: 0; width: 400px; height: 400px;
  background: radial-gradient(circle, var(--success-500/10), transparent);
  border-radius: 50%; filter: blur(80px); animation: float 10s ease-in-out infinite reverse; }

/* Grid Pattern */
.grid-pattern {
  position: absolute; inset: 0;
  background-image: 
    linear-gradient(var(--surface-200/50) 1px, transparent 1px),
    linear-gradient(90deg, var(--surface-200/50) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.5;
}

/* Floating Robots (for Space Theme) */
.robot-fleet {
  position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 1rem;
}
.robot-unit {
  width: 60px; height: 80px;
  background: linear-gradient(180deg, var(--space-panel), var(--robot-panel));
  border: 1px solid var(--space-border);
  border-radius: 12px 12px 4px 4px;
  animation: float 4s ease-in-out infinite;
}
.robot-unit:nth-child(2) { animation-delay: 0.5s; height: 100px; }
.robot-unit:nth-child(3) { animation-delay: 1s; height: 70px; }
.robot-unit::before {
  content: ''; display: block; width: 100%; height: 20px;
  background: var(--space-glow); border-radius: 8px 8px 0 0;
  opacity: 0.5; animation: pulseGlow 2s ease-in-out infinite;
}
```

---

## 9. Photo Studio Design (استوديو الصور)

### 9.1 Layout (Mobile First)
```
┌─────────────────────────────────┐
│ Header (Title + Actions)         │
├─────────────────────────────────┤
│ Toolbar (Select All, Delete,     │
│         Compare, View Mode)      │
├─────────────────────────────────┤
│ ┌──────────┐ ┌────────────────┐  │
│ │ Sidebar  │ │   Main Area    │  │
│ │ (Tools)  │ │ (Grid/List/    │  │
│ │          │ │  Compare)      │  │
│ │          │ │                │  │
│ └──────────┘ └────────────────┘  │
├─────────────────────────────────┤
│ Batch Panel (Bottom Sheet)       │
└─────────────────────────────────┘
```

### 9.2 Tool Panel (Sidebar)
- **Categories**: Background, Enhancement, Correction, Composition, Batch
- **Expandable Sections** with Chevron
- **Active Tool Highlight**: Brand gradient border + checkmark
- **Quick Settings** inline when tool selected
- **Process Button**: Full width, primary, shows selected count

### 9.3 Image Grid
- **Aspect Ratio**: 4:3 (car photos)
- **Thumbnail**: 280px min, auto-fill
- **Selection**: Checkbox top-right
- **Processing Overlay**: Spinner + progress %
- **Status Badges**: "معالجة", "3 عمليات", etc.
- **Hover Actions**: Compare, Delete, More

### 9.4 Compare Viewer (مستوحى من spyne.ai)
```
┌────────────────────────────────────────┐
│ Header: Title + Mode Toggle + Actions  │
├────────────────────────────────────────┤
│ ┌──────────────────┬────────────────┐  │
│ │   Original       │   Processed    │  │ (Side-by-Side)
│ │                  │                │  │
│ └──────────────────┴────────────────┘  │
│        Slider Handle (50%)             │
├────────────────────────────────────────┤
│ Footer: Labels + Copy + Download       │
└────────────────────────────────────────┘
```

**Slider Mode**: Single image with clip-path reveal
- Draggable handle with percentage
- Labels "الأصل" / "معالجة" at bottom corners

### 9.5 KeepOriginal Principle Visual
- **Original Badge**: Green checkmark badge on original
- **Version Tabs**: Horizontal scroll at bottom of viewer
- **Non-destructive**: Original never replaced, new versions appended

---

## 10. AI Assistant Design (المساعد الذكي)

### 10.1 Floating Trigger Button
```
┌─────────────────────┐
│      🤖 Bot         │  (Fixed bottom-right, 56px)
│   Rotates 45° on    │  Brand gradient, ring glow
│   open              │
└─────────────────────┘
```

### 10.2 Quick Actions Panel (Popover)
```
┌────────────────────────────┐
│ Header: Bot + Title + Close │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ 📸  معالجة صورة       │ │
│ │    إزالة خلفية...     │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 📢  كتابة إعلان       │ │
│ │    عنوان، وصف...      │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 📦  إدارة مخزون       │ │
│ │    إضافة، تحديث...    │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Footer: Settings | Help    │
└────────────────────────────┘
```

### 10.3 Chat Interface
- **Full Screen** on mobile, **Sidebar** on desktop
- **Messages**: User right (brand), Assistant left (white + bot avatar)
- **Streaming**: Typing animation with 3 bouncing dots
- **Attachments**: Image preview chips
- **Input**: Textarea + Mic + Attach + Send (brand)

---

## 11. Admin Browser Design (متصفح الإدارة)

### 11.1 Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Top Bar: Menu | Views | URL Bar | Nav | Refresh | New | Dev │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────────────────────────────────┐  │
│ │  Sidebar   │ │         Viewport (iframe/terminal)      │  │
│ │ (Tabs)     │ │                                        │  │
│ │  📑 Tabs   │ │  Device: [Desktop] [Tablet] [Mobile]   │  │
│ │  🐙 GitHub │ │                                        │  │
│ │  ✅ Tasks  │ │                                        │  │
│ │  💻 Console│ │                                        │  │
│ │  📊 Analytics│                                        │  │
│ └────────────┘ └────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ DevTools (Collapsible): Elements | Console | Network | ...  │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Theme: Dark Developer Theme
- **Background**: `#0a0f1a` (space dark)
- **Panels**: `#141c2e` with `#233155` borders
- **Accent**: `#00d4ff` (cyan glow)
- **Syntax Highlighting**: VS Code Dark+ theme

---

## 12. Space/Robotics Visual Assets (مواد بصرية للفضاء والروبوتات)

### 12.1 Background Sources
| Source | URL | Usage |
|--------|-----|-------|
| NASA Images | https://images.nasa.gov/ | Hero backgrounds, textures |
| ESA Hubble | https://esahubble.org/images/ | Deep space backgrounds |
| Unsplash Space | https://unsplash.com/s/photos/space | Free high-res space photos |
| Three.js Examples | https://threejs.org/examples/ | WebGL shaders, post-processing |
| Shadertoy | https://www.shadertoy.com/ | GLSL shaders for effects |
| Kenney Assets | https://kenney.nl/assets | Robot sprites, UI elements |

### 12.2 Recommended Libraries for Effects
```json
{
  "three": "^0.160.0",           // 3D scenes, robots, particles
  "@react-three/fiber": "^8.15.0", // React Three.js
  "@react-three/drei": "^9.90.0",  // Helpers
  "canvas-confetti": "^1.9.0",     // Celebration effects
  "framer-motion": "^11.0.0",      // Animations
  "gsap": "^3.12.0",               // Advanced animations
  "lottie-react": "^2.4.0"         // Lottie animations
}
```

### 12.3 Robot/Spaceship SVG Assets
```svg
<!-- Simple Robot Icon -->
<svg viewBox="0 0 32 32" fill="none">
  <rect x="8" y="4" width="16" height="20" rx="4" stroke="currentColor" stroke-width="2"/>
  <circle cx="12" cy="10" r="2" fill="currentColor"/>
  <circle cx="20" cy="10" r="2" fill="currentColor"/>
  <rect x="4" y="10" width="4" height="8" rx="1" fill="currentColor"/>
  <rect x="24" y="10" width="4" height="8" rx="1" fill="currentColor"/>
  <rect x="10" y="24" width="4" height="6" rx="1" fill="currentColor"/>
  <rect x="18" y="24" width="4" height="6" rx="1" fill="currentColor"/>
</svg>

<!-- Rocket Icon -->
<svg viewBox="0 0 32 32" fill="none">
  <path d="M16 2 L12 22 L20 22 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/>
  <path d="M10 20 L12 24 L20 24 L22 20" stroke="currentColor" stroke-width="2"/>
  <circle cx="16" cy="14" r="3" stroke="currentColor" stroke-width="1.5"/>
</svg>

<!-- Satellite Icon -->
<svg viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="2"/>
  <rect x="14" y="4" width="4" height="10" rx="1" fill="currentColor"/>
  <rect x="14" y="18" width="4" height="10" rx="1" fill="currentColor"/>
  <rect x="4" y="14" width="10" height="4" rx="1" fill="currentColor"/>
  <rect x="18" y="14" width="10" height="4" rx="1" fill="currentColor"/>
</svg>
```

### 12.4 Particle/Star Field Background (CSS/Canvas)
```javascript
// Star Field Generator
function createStarField(canvas, count = 200) {
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.5 + 0.1
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}
```

---

## 13. Integration Specifications (مواصفات التكامل)

### 13.1 Google Gemini Integration
```typescript
// Google AI SDK Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Models available:
// - gemini-1.5-pro (multimodal, 2M context)
// - gemini-1.5-flash (fast, 1M context)
// - gemini-1.0-pro-vision (image understanding)
// - text-embedding-004 (embeddings)

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Use cases in MSHKUR:
// 1. Ad content generation from vehicle data
// 2. Image analysis for vehicle detection
// 3. Code generation for custom workflows
// 4. Translation (AR ↔ EN)
// 5. Summarization of customer inquiries
```

### 13.2 Google Cloud Vertex AI
```typescript
// For enterprise: Vertex AI
// - Custom model training (car-specific)
// - AutoML Vision for vehicle classification
// - Batch prediction for bulk processing
// - Model Garden (pre-trained models)
```

### 13.3 Google Workspace APIs
```typescript
// OAuth2 Scopes needed:
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];
```

---

## 14. Mobile-First Breakpoints
```css
/* Breakpoints */
--bp-xs: 375px;   /* iPhone SE / Small phones */
--bp-sm: 640px;   /* Large phones / Small tablets */
--bp-md: 768px;   /* Tablets */
--bp-lg: 1024px;  /* Small laptops */
--bp-xl: 1280px;  /* Desktops */
--bp-2xl: 1536px; /* Large desktops */
--bp-3xl: 1920px; /* Ultra-wide */

/* Container Max Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1400px;
```

---

## 15. Accessibility (إمكانية الوصول)

### 15.1 WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 normal text, 3:1 large text
- **Focus Indicators**: Visible on all interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML, ARIA labels
- **Reduced Motion**: Respects `prefers-reduced-motion`

### 15.2 RTL Accessibility
- **Logical Properties**: No physical left/right
- **Icon Mirroring**: Directional icons flip
- **Text Alignment**: `text-align: start/end`
- **Flex/Grid Direction**: Automatic RTL handling

---

## 16. Performance Budgets

### 16.1 Metrics
| Metric | Budget |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| Bundle Size (gzipped) | < 150KB |
| Image Optimization | WebP/AVIF, responsive |

### 16.2 Optimization Strategies
- **Code Splitting**: Route-based + component-based
- **Lazy Loading**: Images, routes, heavy components
- **Preloading**: Critical fonts, hero images
- **Caching**: Service Worker + HTTP cache headers
- **Compression**: Brotli/Gzip for all text assets

---

## 17. Implementation Checklist

### Phase 1: Foundation ✅
- [x] Design tokens (colors, spacing, typography)
- [x] Base components (Button, Card, Input, Modal, etc.)
- [x] Layout components (Header, Footer, Layout, Container)
- [x] Theme system (Light/Dark, RTL/LTR)
- [x] Animation system (Framer Motion presets)

### Phase 2: Home Screen ✅
- [x] Hero section with brand messaging
- [x] 3 App cards (Photo, Ad, Dealer)
- [x] AI Assistant card
- [x] Features deep dive
- [x] How it works (3 steps)
- [x] CTA section
- [x] Footer
- [x] Space/Robot background decorations

### Phase 3: Photo Studio 🔄
- [x] Tool panel with categories
- [x] Image grid (grid/list/compare)
- [x] Compare viewer (side-by-side + slider)
- [x] Batch processing panel
- [x] Export modal
- [ ] Real image processing engine integration
- [ ] WebGPU/WASM background removal
- [ ] KeepOriginal workflow enforcement

### Phase 4: Ad Studio 🔄
- [x] Multi-step wizard (Data → Images → Content → Preview → Publish)
- [x] Vehicle data form
- [x] Image upload with preview
- [x] AI content generation
- [x] Template selection
- [x] Preview with mock data
- [x] Publish options
- [ ] Real template rendering engine
- [ ] Platform-specific exports (Haraj, FB, Insta)

### Phase 5: Dealer Portal 🔄
- [x] Dashboard with stats
- [x] Inventory table
- [x] Customers list
- [x] Marketing tools grid
- [x] Profile management
- [x] Add/Edit vehicle modal
- [ ] Real data persistence
- [ ] Role-based access control

### Phase 6: AI Assistant 🔄
- [x] Floating trigger
- [x] Quick actions panel
- [x] Full chat interface
- [x] Streaming responses
- [x] Attachments support
- [x] Voice input button
- [ ] Real LLM integration (Gemini)
- [ ] Skill execution
- [ ] Assistant handoff

### Phase 7: Admin Browser 🔄
- [x] Tabbed browser interface
- [x] Sidebar with views (Tabs, GitHub, Tasks, Console, Analytics)
- [x] Terminal emulator
- [x] Code editor view
- [x] GitHub integration UI
- [x] Task board (Kanban)
- [x] DevTools panel
- [ ] Real iframe navigation
- [ ] WebSocket terminal
- [ ] GitHub API integration

### Phase 8: Integrations & Polish
- [ ] Google Gemini API integration
- [ ] Google Workspace OAuth
- [ ] Haraj publishing automation
- [ ] WhatsApp Web bridge
- [ ] PWA manifest + Service Worker
- [ ] Performance optimization
- [ ] E2E tests (Playwright)
- [ ] Storybook documentation
- [ ] Deployment pipeline

---

## 18. Decision Required (للاعتماد)

يرجى مراجعة والموافقة على:

1. **نظام الألوان**: العلامة التجارية (أزرق/سماوي) + ثيم الفضاء (سماوي/بنفسجي/أخضر نيون)
2. **الخطوط**: IBM Plex Sans Arabic + IBM Plex Sans + Space Grotesk للـ Display
3. **الشاشة الرئيسية**: 3 بطاقات تطبيقات + بطاقة مساعد ذكي + مميزات + خطوات
4. **استوديو الصور**: لوحة أدوات جانبية + شبكة صور + مشاهد مقارنة (side-by-side + slider)
5. **المساعد الذكي**: زر عائم + لوحة إجراءات سريعة + واجهة دردشة كاملة
6. **متصفح الإدارة**: تبويبات + شريط جانبي (GitHub, Tasks, Console, Analytics) + DevTools
7. **Thيم الفضاء/الروبوتات**: خلفيات متحركة، روبوتات عائمة، توهجات نيون
8. **التكاملات**: Gemini API، Google Workspace، Haraj، WhatsApp Web
9. **Mobile-First**: جميع المكونات مصممة للجوال أولاً، RTL عربية افتراضياً

**الموافقة على المتابعة مع التنفيذ؟**
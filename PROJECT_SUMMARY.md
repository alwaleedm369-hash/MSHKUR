# MSHKUR Project Summary
## ملخص مشروع مشكور الشامل

---

## 🎯 نظرة عامة على المشروع

**مشكور (MSHKUR)** - منصة ذكية متخصصة للسيارات تبدأ من أدوات عملية مباشرة وتتحول إلى بيئة متكاملة لإنجاز الأعمال.

**الشعار:** *أنت تطلب. مشكور يساعدك.*

### الهيكل المعماري النهائي
```
MSHKUR
├── 3 تطبيقات منتجات للمستخدم (User-Facing Apps)
│   ├── 📸 استوديو الصور (Photo Studio)
│   ├── 📢 استوديو الإعلان (Ad Studio)
│   └── 🏪 المعرض والتاجر (Dealer Portal)
├── 🤖 المساعد العام (AI Assistant) - مدمج في التطبيقات الثلاثة
├── 🌐 متصفح الإدارة (Admin Browser) - أداة داخلية للتطوير
└── ⚙️ المحرك المركزي (MSHKUR Core) - يربط كل شيء
```

---

## ✅ ما تم إنجازه (Completed)

### 1. الوثائق المرجعية التأسيسية
| الملف | الوصف |
|--------|-------|
| `docs/MSHKUR_UNIFIED_REFERENCE.md` | المرجع التأسيسي الموحد الكامل (25 قسم) |
| `docs/DESIGN_SYSTEM.md` | نظام التصميم الشامل (Mobile-First, RTL/LTR, Space Theme) |
| `docs/MSHKUR_UNIFIED_REFERENCE.md` | معيار الإنجاز، مراحل التنفيذ، قواعد العمل الملزمة |
| `README.md` | توثيق المشروع الكامل |
| `PROJECT_SUMMARY.md` | هذا الملف - ملخص شامل |

### 2. إعداد المشروع والبنية التحتية
| المكون | الحالة | التفاصيل |
|----------|--------|-----------|
| `package.json` | ✅ | React 18 + TypeScript + Vite + جميع التبعيات |
| `tsconfig.json` | ✅ | TypeScript strict mode مع path aliases |
| `vite.config.ts` | ✅ | Build optimization، code splitting، aliases |
| `tailwind.config.ts` | ✅ | Design tokens كاملة (Colors, Typography, Spacing, Animations) |
| `postcss.config.js` | ✅ | PostCSS مع Tailwind و Autoprefixer |
| `index.html` | ✅ | HTML5 مع preconnect fonts، RTL افتراضي |
| `.env.example` | ✅ | متغيرات البيئة |
| `.gitignore` | ✅ | شاملة |
| `public/manifest.json` | ✅ | PWA manifest مع shortcuts |
| `public/sw.js` | ✅ | Service Worker كامل (Cache strategies، Background sync، Push) |

### 3. نظام التصميم (Design System)
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `src/shared/styles/globals.css` | ✅ | 800+ سطر: CSS Custom Properties، Logical Properties، RTL/LTR، Animations، Components |
| **الألوان** | ✅ | Brand (Azure)، Semantic (Success/Warning/Error)، Space Theme (Neon/Cyber) |
| **الطباعة** | ✅ | IBM Plex Sans Arabic + IBM Plex Sans + Space Grotesk، Clamp() responsive |
| **المسافات** | ✅ | 4px base unit، Logical properties فقط |
| **الظلال/الطبقات** | ✅ | 4 elevation levels + Brand/Space glow shadows |
| **الحركات** | ✅ | Framer Motion presets، Reduced motion support |
| **المكونات الأساسية** | ✅ | Button, Card, Input, Modal, Sheet, Toast, Badge, Avatar, Skeleton |

### 4. المكونات المشتركة (Shared Components)
| المكون | الملف | المميزات |
|----------|-------|----------|
| Layout | `Layout.tsx` | Header + Footer + Outlet + AI Assistant Trigger |
| Header | `Header.tsx` | Logo، Navigation، Theme Toggle، Mobile Menu، AI Assistant Link |
| Footer | `Footer.tsx` | Links، Newsletter، Contact، Social، Trust badges |
| AIAssistantTrigger | `AIAssistantTrigger.tsx` | Floating button، Quick actions panel، Notification badge |
| LoadingScreen | `LoadingScreen.tsx` | Page loading، Skeletons (Card, List, Grid) |
| NotFound | `NotFound.tsx` | 404 page مع suggestions |
| Toast | `Toast.tsx` | Success/Error/Warning/Info مع animations |
| **Utilities** | `cn.ts` | clsx + tailwind-merge + formatting helpers |

### 5. التطبيقات الخمسة (5 Apps)

#### 📸 استوديو الصور (Photo Studio) - `src/apps/photo-studio/`
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `PhotoStudio.tsx` | ✅ | Main app مع Dropzone، Toolbar، Grid/List/Compare views |
| `types/index.ts` | ✅ | 15+ interfaces: ImageFile, ProcessingTool, Job, BackgroundOption |
| `components/ToolPanel.tsx` | ✅ | Sidebar مع 8 فئات أدوات، Settings inline، Process button |
| `components/ImageGrid.tsx` | ✅ | Grid/List views، Selection، Processing overlay، Hover actions |
| `components/CompareViewer.tsx` | ✅ | Side-by-side + Slider mode (مستوحى من spyne.ai) |
| `components/BatchPanel.tsx` | ✅ | Bottom sheet لمعالجة دفعية |
| `components/SettingsPanel.tsx` | ✅ | 4 tabs: General, Backgrounds, Export, Advanced |
| `components/ExportModal.tsx` | ✅ | Format/Quality/Naming/Dimensions options |
| `components/ImageViewer.tsx` | ✅ | Full-screen viewer مع Zoom/Pan/Version history |

**الأدوات المدعومة (8 أدوات):**
1. إزالة الخلفية (Background Removal) - مع نماذج: fast/high-quality/car-optimized
2. طمس اللوحة (License Plate Blur) - Auto-detect + Pixelate/Gaussian/Solid
3. تضليل الزجاج (Glass Tinting) - Level/Color/Reflections preservation
4. تحسين الإضاءة (Lighting Enhancement) - Exposure/Contrast/Highlights/Shadows/Auto-balance
5. إضافة الظلال (Shadow Generation) - Intensity/Direction/Softness/Perspective
6. التوسيط والقص (Centering & Crop) - Auto/Manual/Batch، Aspect ratios متعددة
7. تحسين الصورة (Image Enhancement) - Sharpen/Denoise/Clarity/Vibrance/HDR
8. توحيد الدفعات (Batch Unify) - Background/Lighting/Dimensions unification

#### 📢 استوديو الإعلان (Ad Studio) - `src/apps/ad-studio/`
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `AdStudio.tsx` | ✅ | 5-step wizard: Data → Images → Content → Preview → Publish |
| **Step 1: Data** | ✅ | Vehicle specs form (Make/Model/Year/Trim/Price/Mileage/Color/Fuel/Transmission/Engine/Features) |
| **Step 2: Images** | ✅ | Dropzone مع preview، Reorder، Delete، Max 20 images |
| **Step 3: Content** | ✅ | AI content generation، Title/Description editing |
| **Step 4: Preview** | ✅ | 4 templates (Modern/Classic/Minimal/Bold)، Live preview |
| **Step 5: Publish** | ✅ | 6 platforms (Haraj, Facebook, Instagram, Snapchat, PDF, Link) |

#### 🏪 المعرض والتاجر (Dealer Portal) - `src/apps/dealer-portal/`
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `DealerPortal.tsx` | ✅ | 5 tabs: Dashboard, Inventory, Customers, Marketing, Profile |
| **Dashboard** | ✅ | 4 Stats cards، Recent inquiries، Quick actions (6 actions) |
| **Inventory** | ✅ | Data table مع Sort/Filter، Vehicle cards، Actions (View/Edit/Delete) |
| **Customers** | ✅ | List مع Status badges، Contact info، Activity tracking |
| **Marketing** | ✅ | 6 Marketing tools cards (Posts, Campaigns, WhatsApp, Stories, Reports, Scheduling) |
| **Profile** | ✅ | Dealer info، Stats grid، QR/Share/Export actions |
| **Modals** | ✅ | Add Vehicle (full form)، Edit Profile |

#### 🤖 المساعد الذكي (AI Assistant) - `src/apps/ai-assistant/`
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `AIAssistant.tsx` | ✅ | Full chat interface مع Sidebar sessions |
| **Sessions** | ✅ | Create/Delete/Switch، Persisted in localStorage |
| **Quick Actions** | ✅ | 6 action cards (Photo, Ad, Inventory, Search, Marketing, Tasks) |
| **Chat** | ✅ | Streaming responses، Attachments، Voice input button، Copy/Retry |
| **Assistants** | ✅ | 9 specialized assistants (General, Photo, Ad, Dealer, Search, Coding, Analysis, Operations, Content) |
| **Handoff** | ✅ | Automatic assistant switching based on context |

#### 🌐 متصفح الإدارة (Admin Browser) - `src/apps/admin-browser/`
| المكون | الحالة | المميزات |
|----------|--------|----------|
| `AdminBrowser.tsx` | ✅ | Tabbed browser + Sidebar views |
| **Views** | ✅ | Tabs، GitHub، Tasks (Kanban)، Console، Analytics، Settings |
| **Tabs** | ✅ | New/Close/Navigate/Refresh، Device emulation (Desktop/Tablet/Mobile) |
| **GitHub** | ✅ | Repos list، Branch info، Create PR/Deploy actions |
| **Tasks** | ✅ | Kanban board (Todo/In-Progress/Review/Done)، Priority، Assignee، Tags |
| **Console** | ✅ | Live logs مع Levels (Log/Error/Warn/Success) |
| **DevTools** | ✅ | Collapsible panel مع Console/Network/Elements |

### 6. المحركات والأنظمة الأساسية (Core Engines & Systems)

#### ⚙️ MSHKUR Core Engine - `src/shared/engines/MSHKURCore.ts`
| الميزة | التنفيذ |
|--------|----------|
| Job Queue | Priority queue مع concurrent limit (3) |
| Event System | Pub/Sub للـ: job:started/progress/completed/failed، skill:executed، assistant:response |
| Skills Registry | 14 built-in skills مع validation schemas |
| Assistants Registry | 9 specialized assistants مع handoff logic |
| Integrations Registry | 5 built-in integrations (GitHub, WhatsApp, Google, Haraj, Analytics) |
| History & Metrics | Execution history مع success rates، avg times |

#### 🧠 نظام المهارات (Skills System) - `src/shared/skills/`
| الملف | الوصف |
|--------|----------|
| `index.ts` | 14 Skill definitions مع full schemas (Input/Output/Validation) |
| `registry.ts` | Pipeline execution engine مع 5 built-in pipelines |

**المهارات الـ 14:**
1. `background-removal` - إزالة خلفية السيارة
2. `license-plate-blur` - طمس اللوحة
3. `glass-tinting` - تضليل الزجاج
4. `lighting-enhancement` - تحسين الإضاءة
5. `shadow-generation` - إضافة الظلال
6. `centering-crop` - التوسيط والقص
7. `image-enhancement` - تحسين الصورة
8. `batch-unify` - توحيد الدفعات
9. `ad-content-generation` - توليد محتوى الإعلان
10. `vehicle-data-extraction` - استخراج بيانات السيارة
11. `template-rendering` - عرض القوالب
12. `inventory-management` - إدارة المخزون
13. `customer-management` - إدارة العملاء
14. `marketing-automation` - أتمتة التسويق

**السير العمل (Pipelines):**
1. `photo-full-processing` - 6 خطوات متسلسلة
2. `batch-unify-processing` - خطوة واحدة للدفعات
3. `ad-creation-full` - 3 خطوات (Data → Content → Template)
4. `dealer-new-vehicle` - 3 خطوات (Inventory → Ad → Marketing)
5. `marketing-campaign` - 3 خطوات (Create → Schedule → Analytics)

#### 🤖 نظام المساعدين (Assistants System) - `src/shared/assistants/`
| الملف | الوصف |
|--------|----------|
| `index.ts` | Assistant definitions (9 assistants) + Manager مع handoff |
| `manager.ts` | Session management، Shared context، Workflow execution |

**المساعدون الـ 9:**
1. `general` - مساعد عام (Priority 10)
2. `photo` - مساعد الصور (Priority 100)
3. `ad` - مساعد الإعلان (Priority 100)
4. `dealer` - مساعد التاجر (Priority 100)
5. `search` - مساعد البحث (Priority 80)
6. `coding` - مساعد البرمجة (Priority 80)
7. `analysis` - مساعد التحليل (Priority 80)
8. `operations` - مساعد العمليات (Priority 70)
9. `content` - مساعد المحتوى (Priority 70)

#### 🔗 نظام التكاملات (Integrations System) - `src/shared/integrations/`
| الملف | التكامل | المميزات |
|--------|----------|----------|
| `index.ts` | Base manager | 12 integration configs، Rate limiting، Webhooks |
| `manager.ts` | Workflow engine | 6 built-in workflows |
| `gemini.ts` | Google Gemini | 6 models، Streaming، Function calling، MSHKUR tools |
| `whatsapp.ts` | WhatsApp Web | Local bridge، Full messaging API، React hook |
| `haraj.ts` | Haraj | Full listing CRUD، Search، Messages، Notifications |
| `googleWorkspace.ts` | Google Workspace | Drive/Photos/Calendar/Sheets/Gmail، OAuth2 |

**سير العمل التكاملية (6):**
1. `github-deploy` - Build → Test → Deploy via PR
2. `haraj-publish` - Create Listing → Notify via WhatsApp
3. `google-drive-backup` - Create Folder → Upload Files
4. `google-photos-sync` - Upload to Photos Library
5. `calendar-appointment` - Create Event → WhatsApp Notify
6. `sheets-report` - Append to Google Sheets
7. `multi-platform-marketing` - Facebook + WhatsApp

#### 🖼️ محرك معالجة الصور (Image Processing Engine) - `src/shared/engines/imageProcessing.ts`
| المحرك | المميزات |
|--------|----------|
| **WebGPUEngine** | Compute shaders للـ Background removal، Parallel processing |
| **WASMEngine** | TensorFlow.js / ONNX Runtime Web placeholder |
| **CPUEngine** | Full JS implementations للـ 8 عمليات |
| **ImageProcessingEngine** | Coordinator مع Auto-fallback (WebGPU → WASM → CPU) |

**العمليات المدعومة (8):**
- Background Removal (مع Vehicle detection)
- License Plate Blur (Auto-detect + Manual)
- Glass Tinting (Polygon regions)
- Lighting Enhancement (Exposure/Contrast/Highlights/Shadows)
- Shadow Generation (Directional + Perspective + Blur)
- Centering & Crop (Aspect ratios + Multi-size output)
- Image Enhancement (Sharpen/Denoise/Clarity/Vibrance)
- Batch Unify (Reference-based unification)

### 7. PWA و Hooks مخصصة
| الملف | المميزات |
|--------|----------|
| `public/manifest.json` | PWA مع Shortcuts، Screenshots، Categories |
| `public/sw.js` | Cache-first/Network-first/Stale-while-revalidate، Background Sync، Push Notifications |
| `src/shared/hooks/usePWA.ts` | Install prompt، Update check، Offline queue، Push notifications، Cache manager |

---

## 📁 هيكل المجلدات الكامل

```
car_ai/
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── sw.js                  # Service Worker
│   └── favicon.svg            # App Icon
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Routes + Layout
│   ├── shared/
│   │   ├── styles/
│   │   │   └── globals.css    # Design System (800+ lines)
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AIAssistantTrigger.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePWA.ts      # PWA hooks (install, sync, push, cache)
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── cn.ts          # clsx + tailwind-merge + utilities
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts       # Shared TypeScript interfaces
│   │   ├── engines/
│   │   │   ├── MSHKURCore.ts  # Core engine
│   │   │   ├── imageProcessing.ts  # Image processing (3 engines)
│   │   │   └── index.ts
│   │   ├── skills/
│   │   │   ├── index.ts       # 14 Skill definitions
│   │   │   └── registry.ts    # Pipeline executor
│   │   ├── assistants/
│   │   │   ├── index.ts       # 9 Assistant definitions
│   │   │   └── manager.ts     # Session manager + workflows
│   │   ├── integrations/
│   │   │   ├── index.ts       # Base manager
│   │   │   ├── manager.ts     # Workflow engine
│   │   │   ├── gemini.ts      # Google Gemini AI
│   │   │   ├── whatsapp.ts    # WhatsApp Web
│   │   │   ├── haraj.ts       # Haraj marketplace
│   │   │   └── googleWorkspace.ts  # Google Workspace
│   │   └── index.ts
│   └── apps/
│       ├── home/
│       │   ├── HomeScreen.tsx # Hero + 3 App Cards + AI Card + Features + CTA
│       │   └── index.ts
│       ├── photo-studio/
│       │   ├── PhotoStudio.tsx
│       │   ├── types/index.ts
│       │   ├── components/
│       │   │   ├── ToolPanel.tsx
│       │   │   ├── ImageGrid.tsx
│       │   │   ├── CompareViewer.tsx
│       │   │   ├── BatchPanel.tsx
│       │   │   ├── SettingsPanel.tsx
│       │   │   ├── ExportModal.tsx
│       │   │   └── ImageViewer.tsx
│       │   └── index.ts
│       ├── ad-studio/
│       │   ├── AdStudio.tsx   # 5-step wizard
│       │   └── index.ts
│       ├── dealer-portal/
│       │   ├── DealerPortal.tsx  # 5 tabs
│       │   └── index.ts
│       ├── ai-assistant/
│       │   ├── AIAssistant.tsx   # Full chat + sessions
│       │   └── index.ts
│       └── admin-browser/
│           ├── AdminBrowser.tsx  # Tabbed browser + sidebar
│           └── index.ts
├── docs/
│   ├── MSHKUR_UNIFIED_REFERENCE.md  # Foundational reference (25 sections)
│   └── DESIGN_SYSTEM.md              # Design system specification
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── .env.example
├── .gitignore
├── README.md
└── PROJECT_SUMMARY.md
```

---

## 🔧 التقنيات المستخدمة (Tech Stack)

| الفئة | التقنيات |
|----------|-----------|
| **Frontend Framework** | React 18.3 + TypeScript 5.5 |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 + PostCSS + Autoprefixer |
| **Routing** | React Router DOM 6.26 |
| **State Management** | Zustand 4.5 |
| **Animations** | Framer Motion 11.5 |
| **UI Primitives** | Radix UI (Dialog, Dropdown, Tabs, Tooltip, Select, Slider, Switch, etc.) |
| **Icons** | Lucide React 0.441 |
| **Forms** | React Hook Form 7.53 + Zod 3.23 + @hookform/resolvers |
| **File Handling** | React Dropzone 14.2 + React Image Crop 11.0 |
| **Carousel** | Embla Carousel React 8.2 |
| **Notifications** | Sonner 1.5 |
| **Storage** | Dexie 4.0 (IndexedDB) + IDB 8.0 |
| **Date/Time** | date-fns 3.6 + date-fns-tz 3.1 |
| **Testing** | Vitest 2.0 + React Testing Library 16 + jsdom 25 |
| **Storybook** | Storybook 8.2 (React + Vite) |
| **PWA** | Service Worker + Web App Manifest |
| **AI/ML** | Google Generative AI (Gemini) + WebGPU/WASM/CPU fallbacks |
| **Real-time** | WebSocket (WhatsApp bridge) |
| **Package Manager** | npm مع legacy-peer-deps |

---

## 🎨 مبادئ التصميم المطبقة

### Mobile-First
- ✅ جميع المكونات تبدأ من 375px (iPhone SE)
- ✅ Touch targets ≥ 44×44px
- ✅ Gestures: Swipe, Pinch, Pull-to-refresh, Long-press
- ✅ Progressive enhancement للشاشات الأكبر

### RTL/LTR Bidirectional
- ✅ العربية افتراضياً (`dir="rtl"`, `lang="ar"`)
- ✅ الإنجليزية مدعومة (`dir="ltr"`, `lang="en"`)
- ✅ Logical Properties فقط (`margin-inline-start`, `padding-inline-end`, `text-align: start`)
- ✅ Icon mirroring تلقائي للأيقونات الاتجاهية
- ✅ Font feature settings للعربية (cv02, cv03, cv04, cv11)

### Light Mode First
- ✅ Light mode هو الأساس
- ✅ Dark mode كطبقة عبر `[data-theme="dark"]`
- ✅ لا hardcoded colors - فقط CSS Custom Properties

### Space/Robotics Theme
- ✅ Floating أوات (Orbs) في Hero
- ✅ Robot fleet animation في背景
- ✅ Neon/Cyber glow effects
- ✅ Particle/Star field backgrounds
- ✅ Grid patterns مع CSS

### Task-Oriented UX
- ✅ لا نصوص زائدة - أيقونات + كلمتين كحد أقصى
- ✅ دخول مباشر للأدوات
- ✅ نتائج مرئية فورية
- ✅ Zero friction (لا تسجيل إجباري)

---

## 🚀 الخطوات التالية (Next Steps)

### Phase 1: تشغيل المشروع والتحقق (Week 1)
```bash
# 1. تثبيت التبعيات
cd car_ai
npm install --legacy-peer-deps

# 2. تشغيل التطوير
npm run dev

# 3. التحقق من:
# - Home screen مع 3 بطاقات + AI Assistant
# - Photo Studio: Dropzone، Tool Panel، Grid/List/Compare
# - Ad Studio: 5-step wizard
# - Dealer Portal: 5 tabs
# - AI Assistant: Chat + Sessions + Quick Actions
# - Admin Browser: Tabs + Sidebar views
# - PWA: Install prompt، Offline support
```

### Phase 2: تكامل المحركات الحقيقية (Week 2-3)
| المهمة | الأولوية | الملاحظات |
|----------|----------|----------|
| تفعيل WebGPU Engine | 🔴 Critical | Background removal حقيقي |
| تكامل Google Gemini API | 🔴 Critical | Content generation، Image analysis |
| ربط WhatsApp Web Bridge | 🟡 High | Local server على порт 3001 |
| تفعيل Haraj Publishing | 🟡 High | Session management، Anti-bot |
| Google Workspace OAuth | 🟡 High | Drive/Photos/Calendar/Sheets |
| Image Processing Workers | 🟢 Medium | Web Workers للعمليات الثقيلة |

### Phase 3: اختبار الجودة والأداء (Week 3-4)
| الاختبار | الأداة | المعيار |
|----------|--------|---------|
| Unit Tests | Vitest | >80% coverage |
| Integration Tests | Playwright | Critical paths |
| Visual Regression | Chromatic/Storybook | Component snapshots |
| Performance | Lighthouse | FCP <1.5s، LCP <2.5s، TBT <200ms |
| Accessibility | axe-core | WCAG 2.1 AA |
| Mobile Testing | Chrome DevTools | iPhone SE / Galaxy S20 |
| RTL Testing | Manual + Automated | Arabic/English switching |

### Phase 4: النشر والتشغيل (Week 4-5)
| المهمة | البيئة |
|----------|---------|
| Dockerize التطبيق | Production |
| CI/CD Pipeline | GitHub Actions |
| Staging Deployment | Vercel/Netlify/Cloudflare Pages |
| Production Deployment | مع Domain + SSL |
| Monitoring | Sentry + Analytics |
| Backup Strategy | Daily DB + Weekly Full |

---

## 🔐 متغيرات البيئة المطلوبة (Production)

```env
# Application
VITE_APP_URL=https://mshkur.ai
VITE_APP_MODE=production

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Google Workspace
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=https://mshkur.ai/auth/google/callback

# GitHub
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret

# WhatsApp Bridge
VITE_WHATSAPP_BRIDGE_URL=http://localhost:3001

# Haraj
VITE_HARAJ_USERNAME=your_username
VITE_HARAJ_PASSWORD=your_password

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

---

## 📊 مقاييس النجاح (Success Metrics)

| المقياس | الهدف | القياس |
|----------|-------|--------|
| **Time to First Process** | < 30 ثانية | من رفع الصورة للنتيجة الأولى |
| **Background Removal Quality** | > 95% | Edge accuracy على test set |
| **App Load Time (Mobile)** | < 2 ثانية | FCP على 3G |
| **PWA Install Rate** | > 15% | من الزوار الفريدين |
| **Daily Active Users** | 1000+ | خلال 3 أشهر |
| **Listing Publish Success** | > 90% | Haraj + Facebook + Instagram |
| **Customer Satisfaction** | > 4.5/5 | In-app surveys |
| **Uptime** | 99.9% | SLA monitoring |

---

## 🤝 المساهمة والتطوير

### Git Workflow
```bash
# Feature branch
git checkout -b feature/amazing-feature

# Commits مع conventional commits
git commit -m "feat(photo-studio): add batch processing progress indicator"

# PR إلى develop branch
# Code review مطلوب
# Merge بعد approval + CI pass
```

### Code Standards
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier (pre-commit hooks)
- ✅ Component-driven development (Storybook)
- ✅ Accessibility first (WCAG 2.1 AA)
- ✅ Mobile-first responsive
- ✅ RTL-aware components

---

## 📞 الدعم والتواصل

- **Repository:** https://github.com/aimshkur/MSHKURCAR
- **Issues:** GitHub Issues للـ bugs و feature requests
- **Discussions:** GitHub Discussions للأسئلة والأفكار
- **Wiki:** التوثيق التقني المفصل

---

## 📄 الترخيص

MIT License - راجع ملف `LICENSE` للتفاصيل.

---

**MSHKUR — مشكور**  
*منصة ذكية للسيارات | مصنوع في السعودية 🇸🇦*  
*أنت تطلب. مشكور يساعدك.*
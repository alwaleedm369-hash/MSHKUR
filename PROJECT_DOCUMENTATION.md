# MSHKUR - Comprehensive Project Documentation
## منصة مشكور للسيارات - توثيق المشروع الشامل

---

## 📋 Table of Contents / فهرس المحتويات

1. [Project Overview / نظرة عامة على المشروع](#project-overview)
2. [Architecture Overview / نظرة عامة على المعمارية](#architecture-overview)
3. [Technology Stack / التقنيات المستخدمة](#technology-stack)
4. [Project Structure / هيكل المشروع](#project-structure)
5. [Applications Overview / نظرة عامة على التطبيقات](#applications-overview)
5. [Core Systems / الأنظمة الأساسية](#core-systems)
6. [Database Schema / مخطط قاعدة البيانات](#database-schema)
7. [API Documentation / توثيق واجهات البرمجة](#api-documentation)
8. [Development Workflow / سير عمل التطوير](#development-workflow)
9. [Deployment Guide / دليل النشر](#deployment-guide)
10. [Testing Strategy / استراتيجية الاختبار](#testing-strategy)
11. [Security Considerations / اعتبارات الأمان](#security-considerations)
12. [Performance Optimization / تحسين الأداء](#performance-optimization)
12. [References & Resources / المراجع والموارد](#references--resources)

---

## 1. Project Overview / نظرة عامة على المشروع {#project-overview}

### 1.1 Project Vision / رؤية المشروع

**MSHKUR (مشكور)** - منصة ذكية متخصصة للسيارات تبدأ من أدوات عملية مباشرة وتتحول إلى بيئة متكاملة لإنجاز الأعمال.

**الشعار:** *أنت تطلب. مشكور يساعدك.*

### 1.2 Core Philosophy / الفلسفة الأساسية

| Principle | Description |
|-----------|-------------|
| **Mobile-First** | تجربة الجوال أولاً، ثم سطح المكتب |
| **RTL/LTR Support** | العربية افتراضياً، دعم كامل للغات LTR |
| **Task-Oriented** | الواجهة تبدأ من المهمة، لا من القائمة |
| **Zero Friction** | دخول مباشر للأدوات بدون تسجيل إجباري |
| **Tool-First** | كل أداة مستقلة وتعمل فوراً |
| **KeepOriginal** | الأصل لا يُستبدل، كل معالجة تنتج نسخة جديدة |

### 1.3 Target Audience / الجمهور المستهدف

| Segment | Description |
|---------|-------------|
| **Car Dealerships** | معارض السيارات - إدارة المخزون، الإعلانات، العملاء |
| **Individual Sellers** | بائعون أفراد - معالجة صور، إنشاء إعلانات |
| **Photographers** | مصورون محترفون - معالجة دفعات، جودة عالية |
| **Car Buyers** | مشترون - بحث، مقارنة، تواصل |

---

## 2. Architecture Overview / نظرة عامة على المعمارية {#architecture-overview}

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MSHKUR Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Photo   │  │   Ad     │  │  Dealer  │  │   AI     │        │
│  │  Studio  │  │  Studio  │  │  Portal  │  │Assistant │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │              │
│       └─────────────┼─────────────┼─────────────┘              │
│                     ▼             ▼                            │
│          ┌─────────────────────────────────┐                   │
│          │      MSHKUR Core Engine         │                   │
│          │  • Job Queue    • Event Bus     │                   │
│          │  • Skills Reg.  • Assistants    │                   │
│          │  • Integrations • Context Mgmt  │                   │
│          └──────────────┬──────────────────┘                   │
│                        ▼                                      │
│         ┌─────────────────────────────────┐                   │
│         │      External Integrations      │                   │
│         │  Gemini • Google • WhatsApp     │                   │
│         │  Haraj • GitHub • Email         │                   │
│         └─────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | كل تطبيق مستقل وظيفياً |
| **Loose Coupling** | التواصل عبر Event Bus و Context |
| **High Cohesion** | المهارات مجمعة حسب المجال |
| **Fail Fast** | Validation مبكر، أخطاء واضحة |
| **Observability** | Logging, Metrics, Tracing مدمجة |

---

## 3. Technology Stack / التقنيات المستخدمة {#technology-stack}

### 3.1 Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 18.3.1 | UI Library |
| **Language** | TypeScript | 5.5.4 | Type Safety |
| **Build Tool** | Vite | 5.4.2 | Fast Build & HMR |
| **Styling** | Tailwind CSS | 3.4.10 | Utility-first CSS |
| **Animations** | Framer Motion | 11.5.4 | Smooth Animations |
| **UI Primitives** | Radix UI | Latest | Accessible Components |
| **Icons** | Lucide React | 0.441.0 | Consistent Icons |
| **Forms** | React Hook Form + Zod | 7.53 / 3.23 | Form Validation |
| **Routing** | React Router DOM | 6.26 | Client-side Routing |
| **State** | Zustand | 4.5.5 | Lightweight State |
| **File Upload** | React Dropzone | 14.2.3 | Drag & Drop Upload |
| **Image Crop** | React Image Crop | 11.0.5 | Image Cropping |
| **Carousel** | Embla Carousel | 8.2.0 | Touch-friendly Carousel |
| **Notifications** | Sonner | 1.5.0 | Toast Notifications |
| **Date/Time** | date-fns + date-fns-tz | 3.6 / 3.1 | Date Manipulation |
| **Storage** | Dexie + IDB | 4.0 / 8.0 | IndexedDB Wrapper |
| **Testing** | Vitest + RTL | 2.0 / 16.0 | Unit & Integration Tests |
| **Storybook** | Storybook | 8.2.9 | Component Documentation |

### 3.2 Backend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 20.x | JavaScript Runtime |
| **Framework** | Express.js | 4.18.x | Web Framework |
| **Language** | TypeScript | 5.5.x | Type Safety |
| **ORM** | Prisma | 5.7.x | Database ORM |
| **Database** | PostgreSQL | 16.x | Primary Database |
| **Cache/Queue** | Redis | 7.x | Cache + BullMQ |
| **Queue** | BullMQ | 5.x | Job Processing |
| **Real-time** | Socket.IO | 4.7.x | WebSocket |
| **Auth** | JWT + bcrypt | 9.x / 2.4.x | Authentication |
| **Validation** | Zod + express-validator | 3.23 / 7.0 | Input Validation |
| **File Upload** | Multer + Sharp | 1.4 / 0.33 | File Processing |
| **Email** | Nodemailer | 6.9.x | Email Sending |
| **AI/ML** | Google Generative AI | 0.2.x | Gemini Integration |
| **WhatsApp** | whatsapp-web.js | 1.23.x | WhatsApp Web Bridge |
| **GitHub** | Octokit | 4.x | GitHub API |
| **Logging** | Winston | 3.11 | Structured Logging |
| **Monitoring** | Prometheus + Grafana | Latest | Metrics & Dashboards |
| **Testing** | Vitest | 2.0 | Unit/Integration Tests |

### 3.3 Infrastructure & DevOps

| Category | Technology | Purpose |
|----------|------------|---------|
| **Containerization** | Docker + Docker Compose | Containerization |
| **Reverse Proxy** | Nginx | SSL, Rate Limiting, Load Balancing |
| **CI/CD** | GitHub Actions | CI/CD Pipeline |
| **SSL/TLS** | Let's Encrypt / Custom | HTTPS |
| **Monitoring** | Prometheus + Grafana | Metrics & Visualization |
| **Logging** | Winston + Loki | Centralized Logging |
| **Error Tracking** | Sentry | Error Monitoring |
| **Package Registry** | GHCR / npm | Package Distribution |

---

## 4. Project Structure / هيكل المشروع {#project-structure}

```
car_ai/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD Pipeline
├── docs/
│   ├── MSHKUR_UNIFIED_REFERENCE.md    # المرجع التأسيسي الموحد
│   ├── DESIGN_SYSTEM.md               # نظام التصميم (800+ سطر)
│   ├── PROJECT_SUMMARY.md             # ملخص المشروع
│   └── FINAL_PROJECT_SUMMARY.md       # ملخص نهائي شامل
├── nginx/
│   ├── nginx.conf              # Nginx Configuration
│   └── proxy_params            # Proxy Parameters
├── public/
│   ├── favicon.svg
│   ├── manifest.json           # PWA Manifest
│   └── sw.js                   # Service Worker
├── scripts/                    # Utility Scripts
├── server/                     # Backend Application
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema (50+ models)
│   │   └── seed.ts             # Seed Data
│   ├── src/
│   │   ├── config/             # Configuration
│   │   ├── controllers/        # Request Handlers
│   │   ├── middleware/         # Auth, Rate Limit, Error Handler
│   │   ├── routes/             # API Routes (10 modules)
│   │   ├── services/           # Business Logic (15+ services)
│   │   ├── utils/              # Helpers (Logger, JWT, etc.)
│   │   └── index.ts            # Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── src/                        # Frontend Application
│   ├── apps/                   # Applications (6 apps)
│   │   ├── home/               # Home Screen
│   │   ├── photo-studio/       # Photo Studio (8 tools)
│   │   ├── ad-studio/          # Ad Studio (5-step wizard)
│   │   ├── dealer-portal/      # Dealer Portal (5 tabs)
│   │   ├── ai-assistant/       # AI Assistant (9 assistants)
│   │   └── admin-browser/      # Admin Browser (7 views)
│   ├── shared/                 # Shared Code
│   │   ├── components/         # Layout, Header, Footer, etc.
│   │   ├── hooks/              # Custom Hooks (usePWA, etc.)
│   │   ├── utils/              # Utilities (cn, formatting)
│   │   ├── styles/             # Global CSS (Design System)
│   │   ├── engines/            # MSHKUR Core Engine
│   │   ├── skills/             # Skills System + Pipelines
│   │   ├── assistants/         # Assistant Manager
│   │   ├── integrations/       # External Integrations
│   │   └── types/              # Shared TypeScript Types
│   ├── App.tsx                 # Routes + Layout
│   ├── main.tsx                # Entry Point
│   └── vite-env.d.ts
├── tests/                      # Test Files
├── .env.example                # Environment Template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── Dockerfile                  # Multi-stage Docker Build
├── docker-compose.yml          # 8 Services Orchestration
├── docker-compose.staging.yml  # Staging Overrides
├── README.md
├── PROJECT_SUMMARY.md
├── PROJECT_DOCUMENTATION.md    # This File
└── FINAL_PROJECT_SUMMARY.md
```

---

## 5. Applications Overview / نظرة عامة على التطبيقات {#applications-overview}

### 5.1 Home Screen (`/apps/home`)

**Route:** `/` | **Component:** `HomeScreen.tsx`

| Feature | Description |
|---------|-------------|
| **Hero Section** | Brand badge, headline "أنت تطلب. مشكور يساعدك", CTAs |
| **App Cards (3)** | Photo Studio, Ad Studio, Dealer Portal |
| **AI Assistant Card** | Integrated assistant access |
| **Features Grid** | 8 capability cards with icons |
| **How It Works** | 3-step process visualization |
| **Trust Indicators** | Security, Speed, Mobile, RTL/LTR |
| **Final CTA** | Gradient section with dual CTAs |

**Design Inspiration:** carflowai.com (thumbnail), spyne.ai (before/after comparison)

### 5.2 Photo Studio (`/apps/photo-studio`)

**Route:** `/photo-studio` | **Component:** `PhotoStudio.tsx` + `MobilePhotoStudio.tsx`

| Tool | Description | Key Settings |
|------|-------------|--------------|
| **Background Removal** | Remove/replace car backgrounds | Model (fast/high-quality/car-optimized), Edge refinement, Background type |
| **License Plate Blur** | Auto-detect & blur plates | Auto-detect, Intensity, Type (pixelate/gaussian/solid) |
| **Glass Tinting** | Smart window tinting | Level (0-1), Color, Preserve reflections |
| **Lighting Enhancement** | Exposure/contrast/shadows | Exposure, Contrast, Highlights, Shadows, Auto-balance |
| **Shadow Generation** | Realistic ground shadows | Intensity, Direction, Softness, Distance, Perspective |
| **Centering & Crop** | Smart framing | Aspect ratios (4:3, 16:9, 1:1, 3:4), Padding, Multi-size output |
| **Image Enhancement** | Sharpen/denoise/clarity | Sharpen, Denoise, Clarity, Vibrance, HDR |
| **Batch Unify** | Multi-image consistency | Background/Lighting/Dimensions unification |

**UI Components:**
- `ToolPanel.tsx` - Sidebar with categorized tools
- `ImageGrid.tsx` - Grid/List/Compare views
- `CompareViewer.tsx` - Side-by-side + Slider comparison (like spyne.ai)
- `BatchPanel.tsx` - Bottom sheet for batch processing
- `SettingsPanel.tsx` - 4 tabs (General, Backgrounds, Export, Advanced)
- `ExportModal.tsx` - Format/Quality/Naming/Dimensions
- `ImageViewer.tsx` - Full-screen viewer with zoom/pan/version history

### 5.3 Ad Studio (`/apps/ad-studio`)

**Route:** `/ad-studio` | **Component:** `AdStudio.tsx` + `MobileAdStudio.tsx`

**5-Step Wizard:**

| Step | Purpose | Key Features |
|------|---------|--------------|
| **1. Data** | Vehicle specs | Make/Model/Year/Trim/Price/Mileage/Color/Fuel/Transmission/Engine/Features |
| **2. Images** | Photo upload | Drag & drop, preview, reorder, max 20 |
| **3. Content** | AI generation | Title/Description generation with tone/length options |
| **4. Preview** | Template selection | 4 templates (Modern/Classic/Minimal/Bold) + Live preview |
| **5. Publish** | Platform export | 6 platforms (Haraj, FB, Instagram, Snapchat, PDF, Link) |

### 5.4 Dealer Portal (`/apps/dealer-portal`)

**Route:** `/dealer-portal` | **Component:** `DealerPortal.tsx` + `MobileDealerPortal.tsx`

**5 Tabs:**

| Tab | Features |
|-----|----------|
| **Dashboard** | Stats cards, Recent inquiries, Quick actions |
| **Inventory** | Data table with sort/filter, Vehicle cards, CRUD actions |
| **Customers** | List with status badges, Contact info, Activity tracking |
| **Marketing** | 6 tools (Posts, Campaigns, WhatsApp, Stories, Reports, Scheduling) |
| **Profile** | Dealer info, Stats grid, QR/Share/Export actions |

### 5.5 AI Assistant (`/apps/ai-assistant`)

**Route:** `/ai-assistant` | **Component:** `AIAssistant.tsx` + `MobileAIAssistant.tsx`

**Features:**
- **Session Management** - Create/Delete/Switch sessions, Persisted in localStorage
- **Quick Actions** - 6 action cards (Photo, Ad, Inventory, Search, Marketing, Tasks)
- **Chat Interface** - Streaming responses, Attachments, Voice input, Copy/Retry
- **9 Specialized Assistants** with automatic handoff
- **Session Persistence** - localStorage + message history

**9 Specialized Assistants:**

| Assistant | Priority | Capabilities |
|-----------|----------|--------------|
| General | 10 | Chat, search, write, plan, code, analyze |
| Photo | 100 | Background removal, plate blur, glass tint, lighting, shadows, enhancement, batch |
| Ad | 100 | Content generation, templates, vehicle data, publishing |
| Dealer | 100 | Inventory, customers, marketing, reports |
| Search | 80 | Web search, vehicle search, price comparison, specs |
| Coding | 80 | Code generation, review, debugging, refactoring, testing |
| Analysis | 80 | Data analysis, reporting, visualization, insights, forecasting |
| Operations | 70 | Task management, workflow automation, scheduling, monitoring |
| Content | 70 | Writing, editing, optimization, translation, formatting, SEO |

### 5.6 Admin Browser (`/apps/admin-browser`)

**Route:** `/admin/*` | **Component:** `AdminBrowser.tsx` + `MobileAdminBrowser.tsx`

**Views (Sidebar):**

| View | Features |
|------|----------|
| **Tabs** | Browser tabs with navigation, device emulation |
| **GitHub** | Repos list, branches, commits, PRs, deployments |
| **Tasks** | Kanban board (Todo/In-Progress/Review/Done) with priority |
| **Console** | Live logs (Log/Error/Warn/Success/Info) |
| **Analytics** | Metrics cards + Charts (Requests, Response time, Errors, Users) |
| **Settings** | API Keys, Environment toggles, Feature flags |

---

## 6. Core Systems / الأنظمة الأساسية {#core-systems}

### 6.1 MSHKUR Core Engine (`src/shared/engines/MSHKURCore.ts`)

**Responsibilities:**
- Job Queue Management (Priority queue, concurrent limit)
- Event System (Pub/Sub for job:started/progress/completed/failed)
- Skills Registry (14 skills with validation schemas)
- Assistants Registry (9 assistants with handoff logic)
- Integrations Registry (5 integrations)
- History & Metrics (Execution history, success rates, avg times)

**Key Classes:**
- `MSHKURCore` - Singleton engine
- `ProcessingContext` - User, session, app, permissions
- `Job` - Queue job with status tracking
- `Skill` / `Assistant` / `Integration` interfaces

### 6.2 Skills System (`src/shared/skills/`)

**14 Built-in Skills:**

| Skill ID | Name | Category | Description |
|----------|------|----------|-------------|
| `background-removal` | Background Removal | image-processing | إزالة خلفية السيارة |
| `license-plate-blur` | License Plate Blur | image-processing | طمس اللوحة تلقائياً |
| `glass-tinting` | Glass Tinting | image-processing | تضليل الزجاج بذكاء |
| `lighting-enhancement` | Lighting Enhancement | image-processing | تحسين الإضاءة والتباين |
| `shadow-generation` | Shadow Generation | image-processing | إضافة ظلال واقعية |
| `centering-crop` | Centering & Crop | image-processing | التوسيط والقص الذكي |
| `image-enhancement` | Image Enhancement | image-processing | تحسين الوضوح والجودة |
| `batch-unify` | Batch Unify | image-processing | توحيد الخلفيات والإضاءة |
| `ad-content-generation` | Ad Content Generation | content-generation | توليد محتوى الإعلان |
| `vehicle-data-extraction` | Vehicle Data Extraction | data-extraction | استخراج بيانات السيارة |
| `template-rendering` | Template Rendering | rendering | عرض القوالب |
| `inventory-management` | Inventory Management | dealer-operations | إدارة المخزون |
| `customer-management` | Customer Management | dealer-operations | إدارة العملاء |
| `marketing-automation` | Marketing Automation | marketing | أتمتة التسويق |

**5 Built-in Pipelines:**
1. `photo-full-processing` - 6 sequential steps
2. `batch-unify-processing` - Single step for batches
3. `ad-creation-full` - 3 steps (Data → Content → Template)
4. `dealer-new-vehicle` - 3 steps (Inventory → Ad → Marketing)
5. `marketing-campaign` - 3 steps (Create → Schedule → Analytics)

### 6.3 Assistants System (`src/shared/assistants/`)

**9 Specialized Assistants** with automatic handoff:

| Assistant | ID | Priority | Capabilities |
|-----------|-----|----------|--------------|
| General | `general` | 10 | chat, search, write, plan, code, analyze |
| Photo | `photo` | 100 | background-removal, plate-blur, glass-tint, lighting, shadows, enhancement, batch |
| Ad | `ad` | 100 | content-generation, templates, vehicle-data, publishing |
| Dealer | `dealer` | 100 | inventory, customers, marketing, reports |
| Search | `search` | 80 | web-search, vehicle-search, price-comparison, specs-lookup |
| Coding | `coding` | 80 | code-generation, code-review, debugging, refactoring, testing |
| Analysis | `analysis` | 80 | data-analysis, reporting, visualization, insights, forecasting |
| Operations | `operations` | 70 | task-management, workflow-automation, scheduling, monitoring |
| Content | `content` | 70 | writing, editing, optimization, translation, formatting, seo |

**Assistant Manager** handles:
- Session management
- Shared context across assistants
- Automatic handoff based on context
- Workflow execution

### 6.4 Integrations System (`src/shared/integrations/`)

**5 Built-in Integrations:**

| Integration | Auth Type | Key Capabilities |
|-------------|-----------|------------------|
| Google Gemini AI | API Key | 6 models, streaming, function calling, structured output |
| Google Workspace | OAuth2 | Drive, Photos, Calendar, Sheets, Gmail |
| WhatsApp Web | Local Bridge | Full messaging, media, groups, business |
| Haraj | Session | Listing CRUD, Search, Messages, Notifications |
| GitHub | OAuth2 | Repos, Issues, PRs, Actions, Deployments |

**7 Built-in Workflows:**
1. `github-deploy` - Build → Test → Deploy via PR
2. `haraj-publish` - Create Listing → Notify via WhatsApp
3. `google-drive-backup` - Create Folder → Upload Files
4. `google-photos-sync` - Upload to Photos
5. `calendar-appointment` - Create Event → WhatsApp Notify
5. `sheets-report` - Append to Google Sheets
6. `multi-platform-marketing` - Facebook + WhatsApp

### 6.5 Image Processing Engine (`src/shared/engines/imageProcessing.ts`)

**3 Engine Tiers (Auto-fallback):**

| Engine | Technology | Use Case |
|--------|------------|----------|
| **WebGPUEngine** | Compute Shaders | High-performance GPU processing |
| **WASMEngine** | TensorFlow.js / ONNX | WebAssembly fallback |
| **CPUEngine** | Pure JavaScript | Universal fallback |

**8 Processing Operations:**

| Operation | CPU Implementation | Key Features |
|-----------|-------------------|--------------|
| Background Removal | Sharp + Alpha masking | Vehicle detection, edge refinement |
| License Plate Blur | Box/Gaussian blur | Auto-detect, intensity control |
| Glass Tinting | SVG composite + multiply | Polygon regions, reflection preservation |
| Lighting Enhancement | Modulate + normalize | Exposure/Contrast/Highlights/Shadows |
| Shadow Generation | SVG filter + composite | Directional + Perspective + Blur |
| Centering & Crop | Extract + Resize | Aspect ratios + Multi-size output |
| Image Enhancement | Sharpen/Denoise/Clarity/Vibrance | Unsharp mask + Local contrast |
| Batch Unify | Sequential processing | Reference-based unification |

---

## 7. Database Schema / مخطط قاعدة البيانات {#database-schema}

### 7.1 Core Models (50+ Models)

| Category | Models |
|----------|--------|
| **Users & Auth** | User, Role, Session, PushSubscription |
| **Dealers** | Dealer, DealerProfile, Subscription, Settings |
| **Vehicles** | Vehicle, VehicleImage, VehicleView, Favorite |
| **Ads** | Ad, AdTemplate |
| **Inquiries** | Inquiry, Customer |
| **Sales** | Sale, Invoice, Payment |
| **Marketing** | Campaign, CampaignPost |
| **Chat & AI** | ChatSession, Message, Assistant |
| **Processing** | ProcessingJob, QueueJob |
| **Tasks** | Task |
| **Files** | File, Folder |
| **Subscriptions** | Subscription, Payment, Invoice |
| **Analytics** | Metric, Event, PageView, Conversion |
| **Notifications** | Notification, PushSubscription |
| **Audit** | AuditLog, WebhookEvent, Setting |
| **Integrations** | GitHubRepo, GitHubCommit, HarajAccount, HarajListing, HarajMessage, AIModel, AIPrompt |

### 7.2 Key Relationships

```
User (1) ──────< Vehicle
User (1) ──────< Ad
User (1) ──────< ChatSession
User (1) ──────< File
Dealer (1) ──────< Vehicle
Dealer (1) ──────< Ad
Dealer (1) ──────< Customer
Vehicle (1) ──────< VehicleImage
Vehicle (1) ──────< Ad
Vehicle (1) ──────< Inquiry
Vehicle (1) ──────< Favorite
Ad (1) ──────< Inquiry
Campaign (1) ──────< CampaignPost
ChatSession (1) ──────< Message
User (1) ──────< ChatSession
User (1) ──────< Message
```

### 7.3 Key Enums

```typescript
enum UserRole { USER, DEALER, ADMIN }
enum VehicleStatus { DRAFT, AVAILABLE, PENDING, SOLD, ARCHIVED }
enum AdStatus { DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, EXPIRED }
enum InquiryStatus { NEW, PENDING, REPLIED, CLOSED }
enum ProcessingJobType { BACKGROUND_REMOVAL, LICENSE_PLATE_BLUR, ... }
enum TaskStatus { TODO, IN_PROGRESS, REVIEW, DONE }
enum TaskPriority { LOW, MEDIUM, HIGH, CRITICAL }
```

---

## 8. API Documentation / توثيق واجهات البرمجة {#api-documentation}

### 8.1 Base Configuration

```
Base URL: /api/v1
Auth: Bearer Token (JWT)
Rate Limits: 100 req/15min (general), 10/15min (auth), 50/hr (upload)
```

### 8.2 Route Modules (10 Modules)

| Module | Prefix | Key Endpoints |
|--------|--------|---------------|
| **Auth** | `/auth` | `POST /register`, `POST /login`, `POST /refresh`, `POST /forgot-password`, `POST /reset-password` |
| **Users** | `/users` | `GET /me`, `PATCH /profile`, `PATCH /password` |
| **Photo Studio** | `/photo-studio` | `POST /images/upload`, `GET /images`, `POST /jobs`, `GET /jobs`, `GET /jobs/:id`, `POST /jobs/:id/cancel`, `GET /images/:id/download` |
| **Ad Studio** | `/ad-studio` | `POST /ads`, `GET /ads`, `GET /ads/:id`, `PATCH /ads/:id`, `DELETE /ads/:id`, `POST /generate-content`, `GET /templates`, `GET /platforms`, `POST /ads/:id/publish`, `GET /ads/:id/export`, `POST /ads/:id/duplicate` |
| **Dealer Portal** | `/dealer-portal` | `GET /dashboard/stats`, `GET /inquiries/recent`, `GET/POST/PATCH/DELETE /vehicles`, `GET /customers`, `GET/POST /marketing/campaigns`, `GET/PATCH /profile`, `GET /profile/qr` |
| **AI Assistant** | `/ai-assistant` | `POST /sessions`, `GET /sessions`, `GET /sessions/:id`, `POST /sessions/:id/messages`, `DELETE /sessions/:id`, `GET /assistants`, `POST /sessions/:id/assistant`, `POST /quick-action`, `GET /workflows`, `POST /workflows/:id/execute` |
| **Admin Browser** | `/admin-browser` | `GET /dashboard`, `GET /metrics`, `GET/POST/PATCH /users`, `GET/POST /github/*`, `GET/POST/PATCH/DELETE /tasks`, `GET /queue/*`, `GET /logs`, `GET/PATCH /settings`, `POST /maintenance`, `POST/GET/POST /backups` |
| **Integrations** | `/integrations` | `GET /`, `GET /:id/status`, `POST /:id/connect`, `POST /:id/disconnect`, `/github/*`, `/google-workspace/*`, `/whatsapp/*`, `/haraj/*`, `/gemini/*` |
| **Upload** | `/upload` | `POST /single`, `POST /multiple`, `GET /files`, `GET/DELETE /files/:id`, `GET /files/:id/download`, `POST /signed-url`, `GET /files/:id/signed-url`, `POST/GET/DELETE /folders` |
| **Webhooks** | `/webhooks` | `POST /github`, `POST /stripe`, `POST /whatsapp`, `POST /haraj`, `POST /google-workspace`, `POST /custom/:integrationId`, `GET /events` |

---

## 9. Development Workflow / سير عمل التطوير {#development-workflow}

### 9.1 Git Workflow

```bash
# Feature Branch
git checkout -b feature/amazing-feature

# Conventional Commits
git commit -m "feat(photo-studio): add batch processing progress indicator"
git commit -m "fix(ad-studio): fix template rendering on mobile"
git commit -m "docs: update API documentation"
git commit -m "refactor(ai-assistant): improve handoff logic"

# PR to develop branch
# Code review required
# Merge after approval + CI pass
```

### 9.2 Branch Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production releases | Protected, require PR + CI |
| `develop` | Integration branch | Protected, auto-deploy to staging |
| `feature/*` | Feature development | Short-lived |
| `fix/*` | Bug fixes | Short-lived |
| `release/*` | Release preparation | Merge to main |

### 9.3 Code Standards

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier (pre-commit hooks via Husky)
- ✅ Component-driven development (Storybook)
- ✅ Accessibility first (WCAG 2.1 AA)
- ✅ Mobile-first responsive
- ✅ RTL-aware components
- ✅ Conventional Commits
- ✅ Component-driven development

### 9.4 Development Commands

```bash
# Frontend
cd car_ai
npm install --legacy-peer-deps
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run test             # Vitest unit tests
npm run test:ui          # Vitest UI
npm run storybook        # Storybook (port 6006)

# Backend
cd server
npm install --legacy-peer-deps
npm run dev              # Development with tsx watch
npm run build            # TypeScript compile
npm run db:migrate       # Prisma migrations
npm run db:generate      # Prisma client generation
npm run db:studio        # Prisma Studio (port 5555)
npm run test             # Vitest

# Database
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
npx prisma db seed       # Seed data
```

---

## 10. Deployment Guide / دليل النشر {#deployment-guide}

### 10.1 Environment Variables

```env
# .env.production
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/mshkur

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://api.mshkur.ai/api/v1/auth/google/callback

# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://api.mshkur.ai/api/v1/auth/github/callback

# Google Workspace
GOOGLE_WORKSPACE_CLIENT_ID=your_id
GOOGLE_WORKSPACE_CLIENT_SECRET=your_secret
GOOGLE_WORKSPACE_REDIRECT_URI=https://api.mshkur.ai/api/v1/auth/google-workspace/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# WhatsApp
WHATSAPP_BRIDGE_URL=http://localhost:3002

# Haraj
HARAJ_USERNAME=your_username
HARAJ_PASSWORD=your_password

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=52428800

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@mshkur.ai

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info

# Frontend
VITE_API_URL=https://api.mshkur.ai
VITE_APP_URL=https://mshkur.ai
```

### 10.2 Docker Deployment

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Scale services
docker-compose up -d --scale api=3
```

### 10.3 Production Checklist

- [ ] SSL certificates configured (Let's Encrypt)
- [ ] Domain DNS configured (mshkur.ai, admin.mshkur.ai, api.mshkur.ai)
- [ ] Environment variables set
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] SSL certificates in `/etc/nginx/ssl/`
- [ ] Nginx config deployed
- [ ] Monitoring alerts configured (Prometheus rules)
- [ ] Backup strategy implemented
- [ ] Load testing completed (k6/Artillery)
- [ ] Security audit passed (OWASP ZAP)

---

## 11. Testing Strategy / استراتيجية الاختبار {#testing-strategy}

### 11.1 Test Pyramid

```
         /\
        /  \     E2E Tests (Playwright) - Few, Critical paths
       /____\
      /      \   Integration Tests (Vitest) - Some, API + Components
     /________\
    /          \ Unit Tests (Vitest) - Many, Pure functions, Utils
   /____________\
```

### 11.2 Test Commands

```bash
# Frontend
npm run test              # Unit tests
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report

# Backend
cd server
npm run test              # Unit/Integration tests
npm run test:coverage     # Coverage report

# E2E
npx playwright test       # E2E tests
npx playwright show-report # HTML report
```

### 11.3 Coverage Targets

| Layer | Target | Current |
|-------|--------|---------|
| Unit Tests | >80% | TBD |
| Integration | >70% | TBD |
| E2E | Critical paths | TBD |

### 11.4 Test Categories

| Test Type | Tool | Location |
|-----------|------|----------|
| Unit | Vitest | `src/**/*.test.ts`, `server/src/**/*.test.ts` |
| Component | Vitest + RTL | `src/**/*.test.tsx` |
| Integration | Vitest | `server/src/**/*.integration.test.ts` |
| E2E | Playwright | `tests/e2e/**/*.spec.ts` |
| Visual | Chromatic/Storybook | `.storybook/` |
| Performance | k6/Artillery | `tests/performance/` |

---

## 12. Security Considerations / اعتبارات الأمان {#security-considerations}

### 12.1 Authentication & Authorization

| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | bcryptjs (12 rounds) |
| **JWT Tokens** | RS256 / HS256, short expiry (15min access, 7d refresh) |
| **Refresh Tokens** | HttpOnly cookies, rotation, revocation |
| **Rate Limiting** | 100req/15min (API), 10/15min (auth), 50/hr (upload) |
| **CORS** | Configured origins only, credentials allowed |
| **Helmet** | CSP, HSTS, X-Frame-Options, XSS Protection |

### 12.2 Data Protection

| Measure | Implementation |
|---------|----------------|
| **Encryption at Rest** | PostgreSQL TDE / Volume encryption |
| **Encryption in Transit** | TLS 1.2+ everywhere |
| **PII Handling** | Minimal collection, encryption, retention policies |
| **File Upload** | Type validation, size limits, virus scanning (ClamAV) |
| **SQL Injection** | Prisma ORM (parameterized queries) |
| **XSS Prevention** | React auto-escaping, CSP headers |

### 12.3 API Security

| Measure | Implementation |
|---------|----------------|
| **Input Validation** | Zod schemas on all endpoints |
| **Output Encoding** | Automatic via React/JSON |
| **Rate Limiting** | Redis-backed, per-IP + per-user |
| **Audit Logging** | All mutating operations logged |
| **Webhook Verification** | HMAC signatures (GitHub, Stripe, WhatsApp) |

### 12.4 Infrastructure Security

| Measure | Implementation |
|---------|----------------|
| **Network** | Private VPC, security groups, no public DB |
| **Secrets** | Environment variables, Docker secrets, Vault (future) |
| **Container** | Non-root user, read-only rootfs, minimal base image |
| **Updates** | Automated dependency updates (Dependabot), Trivy scans |

---

## 13. Performance Optimization / تحسين الأداء {#performance-optimization}

### 13.1 Frontend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Code Splitting** | Route-based + Component-based (React.lazy) |
| **Lazy Loading** | Images (IntersectionObserver), Routes, Heavy components |
| **Bundle Analysis** | `npm run build && npx vite-bundle-analyzer` |
| **Tree Shaking** | ES modules, sideEffects: false in package.json |
| **Compression** | Brotli + Gzip (Nginx) |
| **Caching** | Service Worker (Workbox), HTTP Cache headers |
| **Preloading** | Critical fonts, Hero images, Route prefetch |
| **Image Optimization** | WebP/AVIF, Responsive images, Sharp processing |

### 13.2 Backend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Connection Pooling** | Prisma connection pool (10-20 connections) |
| **Query Optimization** | Selective fields, indexes, batch queries |
| **Caching** | Redis (L2), In-memory (L1), HTTP Cache-Control |
| **Background Jobs** | BullMQ (3 workers), Priority queues |
| **Streaming** | Large responses (SSE, WebSocket) |
| **Compression** | Brotli + Gzip (Express + Nginx) |

### 13.3 Database Optimization

| Technique | Implementation |
|-----------|----------------|
| **Indexes** | Composite indexes on query patterns |
| **Partitioning** | Large tables (audit_logs, events, page_views) |
| **Read Replicas** | For analytics queries (future) |
| **Connection Pooling** | PgBouncer (future) |
| **Archiving** | Old data to cold storage (yearly) |

### 13.4 Performance Budgets

| Metric | Budget | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | TBD |
| **Largest Contentful Paint** | < 2.5s | TBD |
| **Total Blocking Time** | < 200ms | TBD |
| **Cumulative Layout Shift** | < 0.1 | TBD |
| **Time to Interactive** | < 3.5s | TBD |
| **Bundle Size (gzipped)** | < 150KB | TBD |
| **API Response (p95)** | < 500ms | TBD |

---

## 14. References & Resources / المراجع والموارد {#references--resources}

### 14.1 Internal Documentation

| Document | Path | Description |
|----------|------|-------------|
| **Unified Reference** | `docs/MSHKUR_UNIFIED_REFERENCE.md` | Foundational reference (25 sections) |
| **Design System** | `docs/DESIGN_SYSTEM.md` | Complete design spec (800+ lines) |
| **Project Summary** | `PROJECT_SUMMARY.md` | Technical overview |
| **Final Summary** | `FINAL_PROJECT_SUMMARY.md` | Complete project overview |
| **This Document** | `PROJECT_DOCUMENTATION.md` | This file |

### 14.2 External References

#### Design Inspiration
| Source | Aspect | URL |
|--------|--------|-----|
| **carflowai.com** | Vehicle thumbnail, before/after comparison | https://carflowai.com |
| **spyne.ai** | Before/after slider, image processing UI | https://spyne.ai |
| **iLovePDF** | Tool-first UX, mobile-first | https://ilovepdf.com |

#### Technical References
| Topic | Resource |
|---------|----------|
| **React 18** | https://react.dev |
| **TypeScript** | https://www.typescriptlang.org |
| **Tailwind CSS** | https://tailwindcss.com |
| **Radix UI** | https://www.radix-ui.com |
| **Framer Motion** | https://www.framer.com/motion |
| **Prisma ORM** | https://www.prisma.io/docs |
| **BullMQ** | https://docs.bullmq.io |
| **Socket.IO** | https://socket.io/docs/v4 |
| **Google Gemini** | https://ai.google.dev/docs |
| **WhatsApp Web.js** | https://github.com/pedroslopez/whatsapp-web.js |
| **Prisma** | https://www.prisma.io/docs |
| **Vite** | https://vitejs.dev |
| **Vitest** | https://vitest.dev |

#### Design Resources
| Resource | Purpose |
|----------|---------|
| **IBM Plex Sans Arabic** | Arabic typography |
| **Space Grotesk** | Display typography |
| **Lucide Icons** | Consistent iconography |
| **Unsplash/NASA** | Space/robotics backgrounds |
| **Shadertoy** | GLSL shaders for effects |

### 14.3 Internal References

#### Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/shared/styles/globals.css` | Design system (800+ lines) |
| `src/shared/engines/MSHKURCore.ts` | Core engine |
| `src/shared/skills/index.ts` | 14 Skills + Pipelines |
| `src/shared/assistants/index.ts` | 9 Assistants + Manager |
| `src/shared/integrations/index.ts` | 5 Integrations + Workflows |
| `src/shared/engines/imageProcessing.ts` | Image processing (3 engines) |
| `src/apps/photo-studio/types/index.ts` | Photo Studio types |
| `server/prisma/schema.prisma` | Database schema (50+ models) |
| `server/src/routes/*.ts` | API route modules |
| `server/src/services/*.ts` | Business logic services |

#### Design Tokens Quick Reference

```css
/* Colors */
--brand-500: #0ea5e9;    /* Primary */
--success-500: #22c55e;  /* Success */
--warning-500: #f59e0b;  /* Warning */
--error-500: #ef4444;    /* Error */

/* Spacing (4px base) */
--space-4: 1rem;    /* 16px */
--space-6: 1.5rem;  /* 24px */
--space-8: 2rem;    /* 32px */

/* Typography */
--font-arabic: 'IBM Plex Sans Arabic', sans-serif;
--font-latin: 'IBM Plex Sans', sans-serif;
--font-display: 'Space Grotesk', sans-serif;

/* Border Radius */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */

/* Shadows */
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-brand: 0 4px 14px 0 rgb(14 165 233 / 0.3);
```

---

## 15. Compression & Delivery / الضغط والتسليم

### 15.1 Project Archive Contents

The complete project is available as a compressed archive containing:

```
mshkur-car-ai.zip
├── src/                    # Frontend source (6 apps, shared)
├── server/                 # Backend (Express + Prisma)
├── public/                 # Static assets + PWA
├── nginx/                  # Nginx configuration
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD pipelines
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # 8 services
├── docker-compose.staging.yml
├── package.json            # Frontend dependencies
├── server/package.json     # Backend dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.ts      # Tailwind config
├── README.md
├── .env.example
├── .gitignore
└── PROJECT_DOCUMENTATION.md (this file)
```

### 15.2 Archive Creation

```bash
# Create compressed archive (excluding node_modules, .git, dist, builds)
cd /Users/wamoh/OneDrive/Desktop/mshkur
zip -r mshkur-car-ai.zip car_ai \
  -x "car_ai/node_modules/*" \
  -x "car_ai/server/node_modules/*" \
  -x "car_ai/.git/*" \
  -x "car_ai/dist/*" \
  -x "car_ai/build/*" \
  -x "car_ai/.vite/*" \
  -x "car_ai/.turbo/*" \
  -x "car_ai/coverage/*" \
  -x "car_ai/.vercel/*" \
  -x "car_ai/.netlify/*" \
  -x "*.log" \
  -x "*.tmp" \
  -x "*.temp"

# Verify archive
unzip -l mshkur-car-ai.zip | head -50
```

### 15.3 Archive Verification

```bash
# Check archive integrity
unzip -t mshkur-car-ai.zip

# List contents
unzip -l mshkur-car-ai.zip | wc -l

# Extract to verify
mkdir -p /tmp/verify && unzip -q mshkur-car-ai.zip -d /tmp/verify
ls -la /tmp/verify/car_ai/
```

---

## 📋 Summary / ملخص

| Metric | Value |
|--------|-------|
| **Total Files** | 200+ |
| **TypeScript Files** | 150+ |
| **React Components** | 80+ |
| **API Endpoints** | 60+ |
| **Database Models** | 50+ |
| **Services** | 15+ |
| **Applications** | 6 |
| **Integrations** | 5 |
| **Skills** | 14 |
| **Assistants** | 9 |
| **Pipelines** | 5 |
| **Workflows** | 7 |

---

## 🎯 Final Status

| Component | Status |
|-----------|--------|
| **Frontend** | ✅ Complete |
| **Backend** | ✅ Complete |
| **Database** | ✅ Complete |
| **Integrations** | ✅ Complete |
| **AI/ML** | ✅ Complete |
| **DevOps** | ✅ Complete |
| **Documentation** | ✅ Complete |
| **Testing** | 🔄 In Progress |
| **Security Audit** | ⏳ Pending |
| **Load Testing** | ⏳ Pending |
| **Production Deploy** | ⏳ Pending |

---

**MSHKUR — مشكور**  
*منصة ذكية للسيارات | مصنوع في السعودية 🇸🇦*  
*أنت تطلب. مشكور يساعدك.*

---

**Document Version:** 1.0  
**Last Updated:** 2024-11-24  
**Author:** MSHKUR Development Team  
**Classification:** Internal - Complete Project Documentation
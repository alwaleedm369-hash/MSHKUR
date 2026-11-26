/**
 * MSHKUR Shared Types - Exports
 */

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'dealer' | 'user' | 'guest';
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
}

export interface Vehicle extends BaseEntity {
  make: string;
  model: string;
  year: number;
  trim?: string;
  mileage: number;
  price: number;
  color: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plug-in-hybrid';
  transmission: 'automatic' | 'manual' | 'cvt' | 'dual-clutch';
  engine?: string;
  vin?: string;
  description?: string;
  features: string[];
  images: VehicleImage[];
  status: 'available' | 'pending' | 'sold' | 'draft';
  dealerId: string;
  views: number;
  inquiries: number;
}

export interface VehicleImage extends BaseEntity {
  vehicleId: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  order: number;
  processedVersions: ProcessedImageVersion[];
}

export interface ProcessedImageVersion {
  toolId: string;
  toolName: string;
  url: string;
  settings: Record<string, unknown>;
  createdAt: number;
}

export interface Ad extends BaseEntity {
  vehicleId: string;
  title: string;
  description: string;
  templateId: string;
  platform: 'haraj' | 'facebook' | 'instagram' | 'snapchat' | 'web' | 'print';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: number;
  exportedFormats: ExportedFormat[];
  dealerId: string;
}

export interface ExportedFormat {
  format: 'png' | 'jpg' | 'webp' | 'pdf' | 'html';
  url: string;
  size: number;
  dimensions: { width: number; height: number };
}

export interface Dealer extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  socialLinks: SocialLinks;
  qrCode?: string;
  subscription: Subscription;
  settings: DealerSettings;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  snapchat?: string;
  tiktok?: string;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  expiresAt?: number;
  vehiclesLimit: number;
  adsLimit: number;
  features: string[];
}

export interface DealerSettings {
  autoPublish: boolean;
  defaultTemplate: string;
  watermark: boolean;
  contactInfoVisibility: 'public' | 'registered' | 'private';
  language: 'ar' | 'en';
}

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  dealerId: string;
  inquiries: Inquiry[];
  notes: CustomerNote[];
  tags: string[];
  status: 'new' | 'active' | 'converted' | 'lost';
  source: 'haraj' | 'facebook' | 'instagram' | 'website' | 'referral' | 'walk-in' | 'other';
}

export interface Inquiry extends BaseEntity {
  customerId: string;
  vehicleId: string;
  dealerId: string;
  message: string;
  status: 'new' | 'pending' | 'replied' | 'closed';
  respondedAt?: number;
  response?: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
}

export interface Campaign extends BaseEntity {
  dealerId: string;
  name: string;
  description: string;
  type: 'social-media' | 'email' | 'sms' | 'whatsapp' | 'mixed';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  platforms: string[];
  posts: CampaignPost[];
  schedule: CampaignSchedule;
  budget?: number;
  metrics: CampaignMetrics;
}

export interface CampaignPost {
  id: string;
  content: string;
  mediaUrls: string[];
  platform: string;
  scheduledAt: number;
  publishedAt?: number;
  status: 'scheduled' | 'published' | 'failed';
  metrics: PostMetrics;
}

export interface PostMetrics {
  impressions: number;
  clicks: number;
  engagements: number;
  shares: number;
  comments: number;
}

export interface CampaignSchedule {
  startDate: number;
  endDate?: number;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  timezone: string;
}

export interface CampaignMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalEngagements: number;
  totalLeads: number;
  costPerLead?: number;
  roi?: number;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'contact' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface Conversation extends BaseEntity {
  participantIds: string[];
  participantTypes: ('user' | 'dealer' | 'assistant')[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  tags: string[];
}

export interface Notification extends BaseEntity {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'inquiry' | 'message' | 'task' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Task extends BaseEntity {
  assigneeId: string;
  creatorId: string;
  dealerId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: number;
  completedAt?: number;
  tags: string[];
  relatedEntity?: { type: 'vehicle' | 'customer' | 'ad' | 'campaign'; id: string };
}

export interface Report extends BaseEntity {
  dealerId: string;
  type: 'sales' | 'inventory' | 'customers' | 'marketing' | 'performance' | 'custom';
  title: string;
  period: { start: number; end: number };
  data: Record<string, unknown>;
  charts: ReportChart[];
  format: 'json' | 'pdf' | 'excel' | 'csv';
  generatedBy: string;
}

export interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  data: Record<string, unknown>;
  options: Record<string, unknown>;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: number;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta & { page: number; limit: number; total: number; totalPages: number };
}

// WebSocket types
export interface WSMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
}

export interface WSEvent {
  event: string;
  data: unknown;
  timestamp: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  labelAr: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'time' | 'datetime' | 'file' | 'image' | 'color' | 'range' | 'switch' | 'hidden';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  placeholderAr?: string;
  helpText?: string;
  helpTextAr?: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
  dependsOn?: { field: string; value: unknown };
  defaultValue?: unknown;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'phone' | 'custom';
  value?: unknown;
  message: string;
  messageAr: string;
}

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  labelAr?: string;
  disabled?: boolean;
  icon?: string;
}

// Theme types
export interface ThemeTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  transitions: TransitionTokens;
  zIndex: ZIndexTokens;
  breakpoints: BreakpointTokens;
}

export interface ColorTokens {
  brand: Record<string, string>;
  surface: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  text: Record<string, string>;
  border: Record<string, string>;
  background: Record<string, string>;
}

export interface SpacingTokens {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  64: string;
  80: string;
  96: string;
}

export interface TypographyTokens {
  fontFamilies: Record<string, string>;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, string>;
  letterSpacings: Record<string, string>;
}

export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ShadowTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  focus: string;
}

export interface TransitionTokens {
  fast: string;
  normal: string;
  slow: string;
}

export interface ZIndexTokens {
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}
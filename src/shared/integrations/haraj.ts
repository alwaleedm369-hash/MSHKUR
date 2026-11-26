/**
 * MSHKUR Haraj Publishing Integration
 * Saudi Arabia's largest vehicle marketplace integration
 * Supports automated listing creation, management, and publishing with approval workflows
 */

export interface HarajConfig {
  // Authentication
  username?: string;
  password?: string;
  sessionCookies?: string; // Serialized cookies
  userAgent?: string;

  // Behavior
  baseUrl?: string; // Default: https://haraj.com.sa
  apiVersion?: string; // Default: v1
  timeout?: number; // Request timeout ms
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };

  // Automation
  autoLogin?: boolean;
  persistSession?: boolean;
  sessionPath?: string;
}

export interface HarajListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: 'SAR';
  category: HarajCategory;
  subcategory?: string;
  location: HarajLocation;
  images: HarajImage[];
  vehicleSpecs: HarajVehicleSpecs;
  contactInfo: HarajContactInfo;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'expired' | 'sold';
  featured: boolean;
  urgent: boolean;
  views?: number;
  favorites?: number;
  createdAt?: number;
  updatedAt?: number;
  publishedAt?: number;
  expiresAt?: number;
}

export interface HarajCategory {
  id: string;
  name: string;
  nameAr: string;
  parentId?: string;
}

export interface HarajLocation {
  cityId: string;
  cityName: string;
  cityNameAr: string;
  districtId?: string;
  districtName?: string;
  districtNameAr?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface HarajImage {
  id?: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  order: number;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
}

export interface HarajVehicleSpecs {
  make: string;
  model: string;
  year: number;
  trim?: string;
  mileage: number;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plug-in-hybrid';
  transmission: 'automatic' | 'manual' | 'cvt' | 'dual-clutch';
  engineSize?: string;
  cylinders?: number;
  color: string;
  interiorColor?: string;
  bodyType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'pickup' | 'van' | 'truck';
  doors?: number;
  seats?: number;
  driveType: 'fwd' | 'rwd' | 'awd' | '4wd';
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  warranty?: boolean;
  warrantyDetails?: string;
  serviceHistory?: boolean;
  accidents?: number;
  ownershipCount?: number;
  registrationExpiry?: number;
  inspectionExpiry?: number;
  features: string[];
  options: string[];
  vin?: string;
  licensePlate?: string; // Will be blurred
}

export interface HarajContactInfo {
  name: string;
  phone: string;
  phoneVerified: boolean;
  whatsapp?: string;
  email?: string;
  showPhone: boolean;
  showWhatsapp: boolean;
  preferredContactTime?: {
    from: string; // HH:MM
    to: string;   // HH:MM
  };
}

export interface HarajSearchParams {
  query?: string;
  category?: string;
  subcategory?: string;
  cityId?: string;
  districtId?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  condition?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'mileage_asc' | 'mileage_desc' | 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
  urgentOnly?: boolean;
}

export interface HarajSearchResult {
  listings: HarajListing[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    categories: { id: string; name: string; count: number }[];
    cities: { id: string; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    years: { year: number; count: number }[];
  };
}

export interface HarajUser {
  id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  isBusiness: boolean;
  businessName?: string;
  commercialRegister?: string;
  rating: number;
  reviewsCount: number;
  joinedAt: number;
  listingsCount: number;
  activeListingsCount: number;
  soldListingsCount: number;
}

export interface HarajMessage {
  id: string;
  listingId: string;
  listingTitle: string;
  fromUser: HarajUser;
  toUser: HarajUser;
  subject: string;
  body: string;
  isRead: boolean;
  isFromMe: boolean;
  createdAt: number;
  attachments?: HarajImage[];
}

export interface HarajNotification {
  id: string;
  type: 'message' | 'offer' | 'view' | 'favorite' | 'system' | 'expiry' | 'approval';
  title: string;
  body: string;
  listingId?: string;
  listingTitle?: string;
  isRead: boolean;
  createdAt: number;
  actionUrl?: string;
}

export class HarajClient {
  private config: HarajConfig;
  private baseUrl: string;
  private sessionCookies: Map<string, string> = new Map();
  private csrfToken: string | null = null;
  private userAgent: string;
  private rateLimiter: RateLimiter;
  private requestId = 0;

  constructor(config: HarajConfig = {}) {
    this.config = {
      baseUrl: 'https://haraj.com.sa',
      apiVersion: 'v1',
      timeout: 30000,
      rateLimit: { requestsPerMinute: 30, requestsPerHour: 500 },
      autoLogin: true,
      persistSession: true,
      ...config,
    };
    this.baseUrl = this.config.baseUrl!;
    this.userAgent = this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.rateLimiter = new RateLimiter(this.config.rateLimit!.requestsPerMinute, this.config.rateLimit!.requestsPerHour);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options: {
      requiresAuth?: boolean;
      multipart?: boolean;
      customHeaders?: Record<string, string>;
    } = {}
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ar,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.customHeaders,
    };

    // Add CSRF token if available
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    // Add cookies
    const cookieString = Array.from(this.sessionCookies.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data && !options.multipart) {
      headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(data);
    } else if (data && options.multipart) {
      // For FormData, don't set Content-Type (browser sets it with boundary)
      requestOptions.body = data as FormData;
    }

    // Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Update cookies from response
      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader) {
        this.parseCookies(setCookieHeader);
      }

      // Update CSRF token
      const csrfHeader = response.headers.get('X-CSRF-Token');
      if (csrfHeader) {
        this.csrfToken = csrfHeader;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Haraj API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private parseCookies(cookieString: string): void {
    const cookies = cookieString.split(',');
    for (const cookie of cookies) {
      const [keyValue] = cookie.split(';');
      const [key, value] = keyValue.trim().split('=');
      if (key && value) {
        this.sessionCookies.set(key.trim(), value.trim());
      }
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<{ success: boolean; user?: any }> {
    try {
      // First, get login page to obtain CSRF token
      await this.request('GET', '/login');

      // Perform login
      const response = await this.request<{ success: boolean; user?: any; redirect?: string }>(
        'POST',
        '/api/auth/login',
        { username, password },
        { requiresAuth: false }
      );

      if (response.success) {
        // Get user profile after login
        const user = await this.getCurrentUser();
        return { success: true, user };
      }

      throw new Error('Login failed: Invalid credentials');
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    await this.request('POST', '/api/auth/logout');
    this.sessionCookies.clear();
    this.csrfToken = null;
  }

  async getCurrentUser(): Promise<any> {
    return this.request('GET', '/api/user/profile');
  }

  async checkAuth(): Promise<boolean> {
    try {
      await this.request('GET', '/api/user/profile');
      return true;
    } catch {
      return false;
    }
  }

  // Listings Management
  async createListing(listing: Omit<HarajListing, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<HarajListing> {
    const formData = this.buildListingFormData(listing);
    return this.request<HarajListing>('POST', '/api/listings', formData, { multipart: true });
  }

  async updateListing(listingId: string, updates: Partial<HarajListing>): Promise<HarajListing> {
    const formData = this.buildListingFormData(updates as any);
    return this.request<HarajListing>('PUT', `/api/listings/${listingId}`, formData, { multipart: true });
  }

  async deleteListing(listingId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/listings/${listingId}`);
  }

  async getListing(listingId: string): Promise<HarajListing> {
    return this.request<HarajListing>(`GET`, `/api/listings/${listingId}`);
  }

  async getMyListings(params?: {
    status?: HarajListing['status'];
    page?: number;
    limit?: number;
  }): Promise<{ listings: HarajListing[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request('GET', `/api/listings/my?${query.toString()}`);
  }

  async publishListing(listingId: string): Promise<{ success: boolean; listing: HarajListing }> {
    return this.request('POST', `/api/listings/${listingId}/publish`);
  }

  async unpublishListing(listingId: string): Promise<{ success: boolean; listing: HarajListing }> {
    return this.request('POST', `/api/listings/${listingId}/unpublish`);
  }

  async featureListing(listingId: string, featured: boolean = true): Promise<HarajListing> {
    return this.request('POST', `/api/listings/${listingId}/feature`, { featured });
  }

  async setUrgent(listingId: string, urgent: boolean = true): Promise<HarajListing> {
    return this.request('POST', `/api/listings/${listingId}/urgent`, { urgent });
  }

  async renewListing(listingId: string): Promise<HarajListing> {
    return this.request('POST', `/api/listings/${listingId}/renew`);
  }

  // Image Upload
  async uploadImages(files: File[], listingId?: string): Promise<HarajImage[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    if (listingId) {
      formData.append('listing_id', listingId);
    }

    return this.request<HarajImage[]>('POST', '/api/images/upload', formData, { multipart: true });
  }

  async deleteImage(imageId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/images/${imageId}`);
  }

  async setPrimaryImage(listingId: string, imageId: string): Promise<HarajListing> {
    return this.request('POST', `/api/listings/${listingId}/images/${imageId}/primary`);
  }

  async reorderImages(listingId: string, imageIds: string[]): Promise<HarajListing> {
    return this.request('POST', `/api/listings/${listingId}/images/reorder`, { imageIds });
  }

  // Search
  async searchListings(params: HarajSearchParams): Promise<HarajSearchResult> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => query.append(key, v.toString()));
        } else {
          query.append(key, value.toString());
        }
      }
    });

    return this.request<HarajSearchResult>('GET', `/api/search?${query.toString()}`);
  }

  async getCategories(): Promise<HarajCategory[]> {
    return this.request<HarajCategory[]>('GET', '/api/categories');
  }

  async getCities(): Promise<{ id: string; name: string; nameAr: string }[]> {
    return this.request('GET', '/api/locations/cities');
  }

  async getDistricts(cityId: string): Promise<{ id: string; name: string; nameAr: string }[]> {
    return this.request('GET', `/api/locations/cities/${cityId}/districts`);
  }

  // Messages
  async getMessages(params?: {
    listingId?: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{ messages: HarajMessage[]; total: number; unreadCount: number }> {
    const query = new URLSearchParams();
    if (params?.listingId) query.append('listing_id', params.listingId);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.unreadOnly) query.append('unread_only', 'true');

    return this.request('GET', `/api/messages?${query.toString()}`);
  }

  async sendMessage(message: {
    listingId: string;
    recipientId: string;
    subject: string;
    body: string;
  }): Promise<HarajMessage> {
    return this.request('POST', '/api/messages', message);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.request('POST', `/api/messages/${messageId}/read`);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.request('DELETE', `/api/messages/${messageId}`);
  }

  // Notifications
  async getNotifications(params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<HarajNotification[]> {
    const query = new URLSearchParams();
    if (params?.unreadOnly) query.append('unread_only', 'true');
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request('GET', `/api/notifications?${query.toString()}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.request('POST', `/api/notifications/${notificationId}/read`);
  }

  // User Profile
  async getProfile(): Promise<any> {
    return this.request('GET', '/api/user/profile');
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    email?: string;
    avatar?: File;
  }): Promise<any> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.avatar) formData.append('avatar', data.avatar);

    return this.request('PUT', '/api/user/profile', formData, { multipart: true });
  }

  // Saved Searches
  async createSavedSearch(name: string, params: HarajSearchParams): Promise<{ id: string }> {
    return this.request('POST', '/api/saved-searches', { name, params });
  }

  async getSavedSearches(): Promise<{ id: string; name: string; params: HarajSearchParams; createdAt: number }[]> {
    return this.request('GET', '/api/saved-searches');
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await this.request('DELETE', `/api/saved-searches/${id}`);
  }

  // Build FormData for listings
  private buildListingFormData(listing: Partial<HarajListing>): FormData {
    const formData = new FormData();

    // Basic fields
    if (listing.title) formData.append('title', listing.title);
    if (listing.description) formData.append('description', listing.description);
    if (listing.price) formData.append('price', listing.price.toString());
    if (listing.category) formData.append('category_id', listing.category.id);
    if (listing.subcategory) formData.append('subcategory_id', listing.subcategory);
    if (listing.featured !== undefined) formData.append('featured', listing.featured.toString());
    if (listing.urgent !== undefined) formData.append('urgent', listing.urgent.toString());

    // Location
    if (listing.location) {
      formData.append('city_id', listing.location.cityId);
      if (listing.location.districtId) formData.append('district_id', listing.location.districtId);
    }

    // Vehicle specs
    if (listing.vehicleSpecs) {
      const specs = listing.vehicleSpecs;
      formData.append('make', specs.make);
      formData.append('model', specs.model);
      formData.append('year', specs.year.toString());
      if (specs.trim) formData.append('trim', specs.trim);
      formData.append('mileage', specs.mileage.toString());
      formData.append('fuel_type', specs.fuelType);
      formData.append('transmission', specs.transmission);
      if (specs.engineSize) formData.append('engine_size', specs.engineSize);
      if (specs.cylinders) formData.append('cylinders', specs.cylinders.toString());
      formData.append('color', specs.color);
      if (specs.interiorColor) formData.append('interior_color', specs.interiorColor);
      formData.append('body_type', specs.bodyType);
      if (specs.doors) formData.append('doors', specs.doors.toString());
      if (specs.seats) formData.append('seats', specs.seats.toString());
      formData.append('drive_type', specs.driveType);
      formData.append('condition', specs.condition);
      if (specs.warranty !== undefined) formData.append('warranty', specs.warranty.toString());
      if (specs.warrantyDetails) formData.append('warranty_details', specs.warrantyDetails);
      if (specs.serviceHistory !== undefined) formData.append('service_history', specs.serviceHistory.toString());
      if (specs.accidents !== undefined) formData.append('accidents', specs.accidents.toString());
      if (specs.ownershipCount) formData.append('ownership_count', specs.ownershipCount.toString());
      if (specs.registrationExpiry) formData.append('registration_expiry', specs.registrationExpiry.toString());
      if (specs.inspectionExpiry) formData.append('inspection_expiry', specs.inspectionExpiry.toString());
      if (specs.vin) formData.append('vin', specs.vin);
      if (specs.licensePlate) formData.append('license_plate', specs.licensePlate);
      if (specs.features) formData.append('features', JSON.stringify(specs.features));
      if (specs.options) formData.append('options', JSON.stringify(specs.options));
    }

    // Contact info
    if (listing.contactInfo) {
      const contact = listing.contactInfo;
      formData.append('contact_name', contact.name);
      formData.append('contact_phone', contact.phone);
      formData.append('show_phone', contact.showPhone.toString());
      formData.append('show_whatsapp', contact.showWhatsapp.toString());
      if (contact.whatsapp) formData.append('whatsapp', contact.whatsapp);
      if (contact.email) formData.append('email', contact.email);
      if (contact.preferredContactTime) {
        formData.append('contact_time_from', contact.preferredContactTime.from);
        formData.append('contact_time_to', contact.preferredContactTime.to);
      }
    }

    return formData;
  }

  // Utility: Convert listing to MSHKUR format
  static toMSHKURFormat(listing: HarajListing): any {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      category: listing.category.nameAr,
      location: `${listing.location.cityNameAr}${listing.location.districtNameAr ? ` - ${listing.location.districtNameAr}` : ''}`,
      images: listing.images.map(img => img.url),
      vehicle: {
        make: listing.vehicleSpecs.make,
        model: listing.vehicleSpecs.model,
        year: listing.vehicleSpecs.year,
        trim: listing.vehicleSpecs.trim,
        mileage: listing.vehicleSpecs.mileage,
        fuelType: listing.vehicleSpecs.fuelType,
        transmission: listing.vehicleSpecs.transmission,
        color: listing.vehicleSpecs.color,
        bodyType: listing.vehicleSpecs.bodyType,
        condition: listing.vehicleSpecs.condition,
        features: listing.vehicleSpecs.features,
      },
      contact: {
        name: listing.contactInfo.name,
        phone: listing.contactInfo.phone,
        whatsapp: listing.contactInfo.whatsapp,
        email: listing.contactInfo.email,
      },
      status: listing.status,
      featured: listing.featured,
      urgent: listing.urgent,
      views: listing.views,
      favorites: listing.favorites,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
      expiresAt: listing.expiresAt,
      harajUrl: `https://haraj.com.sa/listing/${listing.id}`,
    };
  }
}

// Rate Limiter
class RateLimiter {
  private requestsPerMinute: number;
  private requestsPerHour: number;
  private minuteRequests: number[] = [];
  private hourRequests: number[] = [];

  constructor(requestsPerMinute: number, requestsPerHour: number) {
    this.requestsPerMinute = requestsPerMinute;
    this.requestsPerHour = requestsPerHour;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Clean old entries
    this.minuteRequests = this.minuteRequests.filter(t => now - t < 60000);
    this.hourRequests = this.hourRequests.filter(t => now - t < 3600000);

    // Check limits
    if (this.minuteRequests.length >= 30) {
      const oldest = this.minuteRequests[0];
      await new Promise(resolve => setTimeout(resolve, 60000 - (Date.now() - oldest) + 100));
      return this.waitForSlot();
    }

    if (this.hourRequests.length >= 500) {
      const oldest = this.hourRequests[0];
      await new Promise(resolve => setTimeout(resolve, 3600000 - (Date.now() - oldest) + 100));
      return this.waitForSlot();
    }

    // Add current request
    this.minuteRequests.push(now);
    this.hourRequests.push(now);
  }
}

// React Hook for Haraj
export function useHaraj(config?: any) {
  const [client] = useState(() => new HarajClient(config));
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.login(username, password);
      if (result.success) {
        setAuthenticated(true);
        setUser(result.user);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const logout = useCallback(async () => {
    await client.logout();
    setAuthenticated(false);
    setUser(null);
  }, [client]);

  const createListing = useCallback(async (listing: any) => {
    setLoading(true);
    try {
      return await client.createListing(listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const getMyListings = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const result = await client.getMyListings(params);
      setListings(result.listings);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const searchListings = useCallback(async (params: any) => {
    setLoading(true);
    try {
      return await client.searchListings(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const uploadImages = useCallback(async (files: File[], listingId?: string) => {
    setLoading(true);
    try {
      return await client.uploadImages(files, listingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Check auth on mount
  useEffect(() => {
    client.checkAuth().then(setAuthenticated);
  }, [client]);

  return {
    client,
    authenticated,
    user,
    listings,
    loading,
    error,
    login,
    logout,
    createListing,
    getMyListings,
    searchListings,
    uploadImages,
  };
}

import { useState, useCallback, useEffect } from 'react';
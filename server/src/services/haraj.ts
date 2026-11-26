import { logger } from '@utils/logger';
import { config } from '@config';

interface HarajListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: 'SAR';
  category: string;
  subcategory?: string;
  location: {
    cityId: string;
    cityName: string;
    districtId?: string;
    districtName?: string;
  };
  images: Array<{ url: string; isPrimary: boolean }>;
  vehicleSpecs: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    mileage: number;
    fuelType: string;
    transmission: string;
    engineSize?: string;
    cylinders?: number;
    color: string;
    interiorColor?: string;
    bodyType: string;
    doors?: number;
    seats?: number;
    driveType: string;
    condition: string;
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
    licensePlate?: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    phoneVerified: boolean;
    whatsapp?: string;
    email?: string;
    showPhone: boolean;
    showWhatsapp: boolean;
    preferredContactTime?: { from: string; to: string };
  };
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'expired' | 'sold';
  featured: boolean;
  urgent: boolean;
}

interface HarajSearchParams {
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
  sortBy?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
  urgentOnly?: boolean;
}

interface HarajSearchResult {
  listings: HarajListing[];
  total: number;
  page: number;
  totalPages: number;
}

interface HarajUser {
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

class HarajService {
  private baseUrl = config.harajBaseUrl || 'https://haraj.com.sa';
  private apiVersion = config.harajApiVersion || 'v1';
  private sessionCookies: Map<string, string> = new Map();
  private csrfToken: string | null = null;
  private userAgent = config.harajUserAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private rateLimit: { requests: number[]; windowMs: number } = { requests: [], windowMs: 60000 };
  private isLoggedIn = false;

  async login(username: string, password: string): Promise<{ success: boolean; user?: any }> {
    try {
      logger.info('Logging into Haraj...');

      // Get login page to obtain CSRF token
      await this.request('GET', '/login');

      // Perform login
      const response = await this.request<{ success: boolean; user?: any; redirect?: string }>(
        'POST',
        '/api/auth/login',
        { username, password },
        { requiresAuth: false }
      );

      if (response.success) {
        this.isLoggedIn = true;
        const user = await this.getCurrentUser();
        logger.info('Haraj login successful', { userId: user?.id });
        return { success: true, user };
      }

      throw new Error('Login failed: Invalid credentials');
    } catch (error) {
      logger.error('Haraj login failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.request('POST', '/api/auth/logout');
    this.sessionCookies.clear();
    this.csrfToken = null;
    this.isLoggedIn = false;
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
    return this.request<HarajListing>('GET', `/api/listings/${listingId}`);
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
  async uploadImages(files: File[], listingId?: string): Promise<any[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    if (listingId) {
      formData.append('listing_id', listingId);
    }

    return this.request<any[]>('POST', '/api/images/upload', formData, { multipart: true });
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
  async searchListings(params: any): Promise<any> {
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

    return this.request('GET', `/api/search?${query.toString()}`);
  }

  async getCategories(): Promise<any[]> {
    return this.request('GET', '/api/categories');
  }

  async getCities(): Promise<any[]> {
    return this.request('GET', '/api/locations/cities');
  }

  async getDistricts(cityId: string): Promise<any[]> {
    return this.request('GET', `/api/locations/cities/${cityId}/districts`);
  }

  // Messages
  async getMessages(params?: {
    listingId?: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<any> {
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
  }): Promise<any> {
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
  }): Promise<any[]> {
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
  async createSavedSearch(name: string, params: any): Promise<{ id: string }> {
    return this.request('POST', '/api/saved-searches', { name, params });
  }

  async getSavedSearches(): Promise<any[]> {
    return this.request('GET', '/api/saved-searches');
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await this.request('DELETE', `/api/saved-searches/${id}`);
  }

  // Internal HTTP Request
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: { requiresAuth?: boolean; multipart?: boolean } = {}
  ): Promise<T> {
    await this.waitForRateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ar,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

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
      requestOptions.body = data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader) {
        this.parseCookies(setCookieHeader);
      }

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

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    this.rateLimit.requests = this.rateLimit.requests.filter(t => now - t < this.rateLimit.windowMs);

    if (this.rateLimit.requests.length >= 30) {
      const oldest = this.rateLimit.requests[0];
      await new Promise(resolve => setTimeout(resolve, 60000 - (now - oldest) + 100));
      return this.waitForRateLimit();
    }

    this.rateLimit.requests.push(now);
  }

  private buildListingFormData(listing: Partial<HarajListing>): FormData {
    const formData = new FormData();

    if (listing.title) formData.append('title', listing.title);
    if (listing.description) formData.append('description', listing.description);
    if (listing.price) formData.append('price', listing.price.toString());
    if (listing.category) formData.append('category_id', listing.category);
    if (listing.subcategory) formData.append('subcategory_id', listing.subcategory);
    if (listing.featured !== undefined) formData.append('featured', listing.featured.toString());
    if (listing.urgent !== undefined) formData.append('urgent', listing.urgent.toString());

    if (listing.location) {
      formData.append('city_id', listing.location.cityId);
      if (listing.location.districtId) formData.append('district_id', listing.location.districtId);
    }

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
}

export const harajService = new HarajService();
export default harajService;
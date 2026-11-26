/**
 * MSHKUR Google Workspace Integration
 * Comprehensive integration with Google Drive, Photos, Calendar, Sheets, and Gmail
 * Uses OAuth2 for authentication with granular scopes
 */

export interface GoogleWorkspaceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  apiKey?: string; // For public API access
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
  scope: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  verifiedEmail: boolean;
  locale: string;
}

// ============================================
// GOOGLE DRIVE
// ============================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
  viewedByMeTime: string;
  trashed: boolean;
  starred: boolean;
  description?: string;
  thumbnailLink?: string;
  webViewLink: string;
  webContentLink?: string;
  owners: Array<{ email: string; displayName: string }>;
  lastModifyingUser: { email: string; displayName: string };
  capabilities: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  imageMediaMetadata?: {
    width: number;
    height: number;
    rotation: number;
    location?: { latitude: number; longitude: number; altitude: number };
    time?: string;
    cameraMake?: string;
    cameraModel?: string;
    exposureTime?: number;
    aperture?: number;
    isoSpeed?: number;
    focalLength?: number;
  };
}

export interface DriveFolder extends DriveFile {
  mimeType: 'application/vnd.google-apps.folder';
}

export interface DriveUploadOptions {
  name: string;
  parents?: string[];
  description?: string;
  mimeType?: string;
  data: Blob | ArrayBuffer | ReadableStream;
  resumable?: boolean;
}

export interface DriveListOptions {
  pageSize?: number;
  pageToken?: string;
  q?: string; // Search query
  orderBy?: 'createdTime' | 'modifiedTime' | 'name' | 'size' | 'starred' | 'folder';
  fields?: string;
  corpora?: 'user' | 'domain' | 'drive' | 'allDrives';
  includeItemsFromAllDrives?: boolean;
  supportsAllDrives?: boolean;
  driveId?: string;
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
  incompleteSearch: boolean;
}

// ============================================
// GOOGLE PHOTOS
// ============================================

export interface PhotosMediaItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  filename: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake: string;
      cameraModel: string;
      focalLength: number;
      apertureFNumber: number;
      isoEquivalent: number;
      exposureTime: string;
    };
    video?: {
      cameraMake: string;
      cameraModel: string;
      fps: number;
      status: string;
    };
  };
  contributorInfo?: {
    profilePictureBaseUrl: string;
    displayName: string;
  };
}

export interface PhotosAlbum {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
  isWriteable: boolean;
  shareInfo?: {
    sharedAlbumOptions: {
      isCollaborative: boolean;
      isCommentable: boolean;
    };
  };
}

export interface PhotosUploadOptions {
  albumId?: string;
  data: Blob | ArrayBuffer;
  filename: string;
  description?: string;
}

export interface PhotosSearchOptions {
  pageSize?: number;
  pageToken?: string;
  albumId?: string;
  filters?: {
    dateFilter?: {
      dates?: Array<{ year: number; month: number; day: number }>;
      ranges?: Array<{ startDate: { year: number; month: number; day: number }; endDate: { year: number; month: number; day: number } }>;
    };
    contentFilter?: {
      includedContentCategories?: string[];
      excludedContentCategories?: string[];
    };
    mediaTypeFilter?: {
      mediaTypes?: ('PHOTO' | 'VIDEO')[];
    };
    featureFilter?: {
      includedFeatures?: ('FAVORITES' | 'NONE')[];
    };
  };
}

// ============================================
// GOOGLE CALENDAR
// ============================================

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  recurrence?: string[];
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    organizer: boolean;
    self: boolean;
    resource: boolean;
  }>;
  reminders: {
    useDefault: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'default' | 'public' | 'private' | 'confidential';
  transparency: 'opaque' | 'transparent';
  colorId?: string;
  attachments?: Array<{
    fileUrl: string;
    title: string;
    mimeType: string;
    iconLink: string;
  }>;
  conferenceData?: {
    createRequest: { requestId: string; conferenceSolutionKey: { type: string } };
    entryPoints: Array<{ entryPointType: string; uri: string; label: string }>;
  };
  htmlLink: string;
  created: string;
  updated: string;
  creator: { email: string; displayName: string; self: boolean };
  organizer: { email: string; displayName: string; self: boolean };
  sequence: number;
  iCalUID: string;
}

export interface CalendarListOptions {
  timeMin?: string;
  timeMax?: string;
  pageToken?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: 'startTime' | 'updated';
  timeZone?: string;
  showDeleted?: boolean;
  syncToken?: string;
}

export interface CalendarListResponse {
  items: CalendarEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface CalendarCreateOptions {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: Array<{ email: string; displayName?: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  conferenceData?: {
    createRequest: { requestId: string; conferenceSolutionKey: { type: 'hangoutsMeet' } };
  };
  sendUpdates?: 'all' | 'externalOnly' | 'none';
}

// ============================================
// GOOGLE SHEETS
// ============================================

export interface SheetsValueRange {
  range: string;
  majorDimension: 'ROWS' | 'COLUMNS';
  values: unknown[][];
}

export interface SheetsAppendOptions {
  valueInputOption: 'RAW' | 'USER_ENTERED';
  insertDataOption: 'OVERWRITE' | 'INSERT_ROWS';
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

export interface SheetsUpdateOptions {
  valueInputOption: 'RAW' | 'USER_ENTERED';
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

export interface SheetsBatchUpdateOptions {
  valueInputOption: 'RAW' | 'USER_ENTERED';
  data: Array<{ range: string; majorDimension: 'ROWS' | 'COLUMNS'; values: unknown[][] }>;
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

export interface SheetsGetOptions {
  majorDimension?: 'ROWS' | 'COLUMNS';
  valueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  dateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

// ============================================
// GMAIL
// ============================================

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: Array<{ name: string; value: string }>;
    body: { attachmentId?: string; size: number; data?: string };
    parts?: GmailMessagePart[];
  };
  sizeEstimate: number;
  raw?: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: Array<{ name: string; value: string }>;
  body: { attachmentId?: string; size: number; data?: string };
  parts?: GmailMessagePart[];
}

export interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesTotal: number;
  messagesUnread: number;
  threadsTotal: number;
  threadsUnread: number;
  color?: { textColor: string; backgroundColor: string };
}

export interface GmailListOptions {
  q?: string; // Search query
  pageToken?: string;
  maxResults?: number;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface GmailSendOptions {
  raw: string; // Base64url encoded RFC 2822 message
  threadId?: string;
}

export interface GmailDraft {
  id: string;
  message: GmailMessage;
}

// ============================================
// GOOGLE WORKSPACE CLIENT
// ============================================

export class GoogleWorkspaceClient {
  private config: GoogleWorkspaceConfig;
  private tokens: GoogleTokens | null = null;
  private user: GoogleUser | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  constructor(config: GoogleWorkspaceConfig) {
    this.config = config;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeTokens(data);
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeTokens({ ...data, refresh_token: refreshToken });
  }

  private normalizeTokens(data: any): GoogleTokens {
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      tokenType: data.token_type || 'Bearer',
      scope: data.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  // Token management
  setTokens(tokens: GoogleTokens): void {
    this.tokens = tokens;
    this.scheduleTokenRefresh();
  }

  getTokens(): GoogleTokens | null {
    return this.tokens;
  }

  getAccessToken(): string | null {
    if (!this.tokens) return null;
    if (Date.now() >= this.tokens.expiresAt - 60000) { // 1 min buffer
      return null; // Needs refresh
    }
    return this.tokens.accessToken;
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.tokens) return;

    const refreshTime = this.tokens.expiresAt - Date.now() - 5 * 60 * 1000; // 5 min before expiry
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshTokens().catch(console.error);
      }, refreshTime);
    }
  }

  async refreshTokens(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await this.refreshAccessToken(this.tokens.refreshToken);
    this.tokens = newTokens;
    this.scheduleTokenRefresh();
  }

  // ============================================
  // HTTP REQUEST HELPER
  // ============================================

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options: {
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    const fullUrl = new URL(url);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        fullUrl.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(fullUrl.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try refresh
        await this.refreshTokens();
        return this.request(method, url, data, options);
      }
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${error}`);
    }

    return response.json();
  }

  private async getValidAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;

    if (Date.now() >= this.tokens.expiresAt - 60000) {
      await this.refreshTokens();
    }

    return this.tokens?.accessToken || null;
  }

  // ============================================
  // DRIVE API
  // ============================================

  async driveListFiles(options: DriveListOptions = {}): Promise<DriveListResponse> {
    const params = new URLSearchParams();
    if (options.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.q) params.append('q', options.q);
    if (options.orderBy) params.append('orderBy', options.orderBy);
    if (options.fields) params.append('fields', options.fields);
    if (options.corpora) params.append('corpora', options.corpora);
    if (options.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (options.supportsAllDrives) params.append('supportsAllDrives', 'true');
    if (options.driveId) params.append('driveId', options.driveId);

    return this.request<DriveListResponse>('GET', `https://www.googleapis.com/drive/v3/files?${params.toString()}`);
  }

  async driveGetFile(fileId: string, fields?: string): Promise<DriveFile> {
    const params = fields ? `?fields=${fields}` : '';
    return this.request<DriveFile>('GET', `https://www.googleapis.com/drive/v3/files/${fileId}${params}`);
  }

  async driveCreateFolder(name: string, parents?: string[]): Promise<DriveFolder> {
    return this.request<DriveFolder>('POST', 'https://www.googleapis.com/drive/v3/files', {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents,
    });
  }

  async driveUploadFile(options: DriveUploadOptions): Promise<DriveFile> {
    // For small files (< 5MB), use simple upload
    // For larger files, use resumable upload

    const metadata = {
      name: options.name,
      parents: options.parents,
      description: options.description,
      mimeType: options.mimeType,
    };

    // Simple upload for demo - in production, implement resumable upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', options.data instanceof Blob ? options.data : new Blob([options.data]));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await this.getValidAccessToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async driveDeleteFile(fileId: string): Promise<void> {
    await this.request('DELETE', `https://www.googleapis.com/drive/v3/files/${fileId}`);
  }

  async driveCopyFile(fileId: string, name: string, parents?: string[]): Promise<DriveFile> {
    return this.request<DriveFile>('POST', `https://www.googleapis.com/drive/v3/files/${fileId}/copy`, { name, parents });
  }

  async driveCreatePermission(fileId: string, role: 'reader' | 'writer' | 'commenter', type: 'user' | 'group' | 'domain' | 'anyone', emailAddress?: string): Promise<any> {
    return this.request('POST', `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      role,
      type,
      emailAddress,
    });
  }

  async driveSearchFiles(query: string, options: DriveListOptions = {}): Promise<DriveListResponse> {
    return this.driveListFiles({ ...options, q: query });
  }

  // ============================================
  // PHOTOS API
  // ============================================

  async photosListMediaItems(options: PhotosSearchOptions = {}): Promise<{ mediaItems: PhotosMediaItem[]; nextPageToken?: string }> {
    const params = new URLSearchParams();
    if (options.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.albumId) params.append('albumId', options.albumId);

    // Filters would be sent in body for POST
    return this.request('GET', `https://photoslibrary.googleapis.com/v1/mediaItems?${params.toString()}`);
  }

  async photosGetMediaItem(mediaItemId: string): Promise<PhotosMediaItem> {
    return this.request('GET', `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}`);
  }

  async photosUploadMedia(options: PhotosUploadOptions): Promise<PhotosMediaItem> {
    // 1. Upload bytes to get upload token
    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await this.getValidAccessToken()}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-Protocol': 'raw',
        'X-Goog-Upload-File-Name': options.filename,
      },
      body: options.data,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const uploadToken = await uploadResponse.text();

    // 2. Create media item with upload token
    return this.request<PhotosMediaItem>('POST', 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      newMediaItems: [{
        description: options.description || '',
        simpleMediaItem: { uploadToken, fileName: options.filename },
      }],
      albumId: options.albumId,
    });
  }

  async photosCreateAlbum(title: string): Promise<PhotosAlbum> {
    return this.request<PhotosAlbum>('POST', 'https://photoslibrary.googleapis.com/v1/albums', { album: { title } });
  }

  async photosListAlbums(pageSize = 50, pageToken?: string): Promise<{ albums: PhotosAlbum[]; nextPageToken?: string }> {
    const params = new URLSearchParams({ pageSize: pageSize.toString() });
    if (pageToken) params.append('pageToken', pageToken);
    return this.request('GET', `https://photoslibrary.googleapis.com/v1/albums?${params.toString()}`);
  }

  async photosAddMediaToAlbum(albumId: string, mediaItemIds: string[]): Promise<void> {
    await this.request('POST', `https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`, { mediaItemIds });
  }

  // ============================================
  // CALENDAR API
  // ============================================

  async calendarListEvents(calendarId = 'primary', options: CalendarListOptions = {}): Promise<CalendarListResponse> {
    const params = new URLSearchParams();
    if (options.timeMin) params.append('timeMin', options.timeMin);
    if (options.timeMax) params.append('timeMax', options.timeMax);
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.singleEvents) params.append('singleEvents', 'true');
    if (options.orderBy) params.append('orderBy', options.orderBy);
    if (options.timeZone) params.append('timeZone', options.timeZone);
    if (options.showDeleted) params.append('showDeleted', 'true');
    if (options.syncToken) params.append('syncToken', options.syncToken);

    return this.request<CalendarListResponse>('GET', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`);
  }

  async calendarGetEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('GET', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`);
  }

  async calendarCreateEvent(calendarId = 'primary', options: CalendarCreateOptions): Promise<CalendarEvent> {
    const params = new URLSearchParams();
    if (options.sendUpdates) params.append('sendUpdates', options.sendUpdates);
    if (options.conferenceData) params.append('conferenceDataVersion', '1');

    return this.request<CalendarEvent>('POST', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, options);
  }

  async calendarUpdateEvent(calendarId: string, eventId: string, options: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('PUT', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, options);
  }

  async calendarDeleteEvent(calendarId: string, eventId: string, sendUpdates = 'all'): Promise<void> {
    await this.request('DELETE', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=${sendUpdates}`);
  }

  async calendarListCalendars(): Promise<any[]> {
    return this.request('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList');
  }

  // ============================================
  // SHEETS API
  // ============================================

  async sheetsGetValues(spreadsheetId: string, range: string, options: SheetsGetOptions = {}): Promise<SheetsValueRange> {
    const params = new URLSearchParams();
    if (options.majorDimension) params.append('majorDimension', options.majorDimension);
    if (options.valueRenderOption) params.append('valueRenderOption', options.valueRenderOption);
    if (options.dateTimeRenderOption) params.append('dateTimeRenderOption', options.dateTimeRenderOption);

    return this.request<SheetsValueRange>('GET', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?${params.toString()}`);
  }

  async sheetsUpdateValues(spreadsheetId: string, range: string, values: unknown[][], options: SheetsUpdateOptions = {}): Promise<any> {
    const params = new URLSearchParams({ valueInputOption: options.valueInputOption });
    if (options.includeValuesInResponse) params.append('includeValuesInResponse', 'true');
    if (options.responseValueRenderOption) params.append('responseValueRenderOption', options.responseValueRenderOption);
    if (options.responseDateTimeRenderOption) params.append('responseDateTimeRenderOption', options.responseDateTimeRenderOption);

    return this.request('PUT', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?${params.toString()}`, {
      range,
      majorDimension: 'ROWS',
      values,
    });
  }

  async sheetsAppendValues(spreadsheetId: string, range: string, values: unknown[][], options: SheetsAppendOptions = {}): Promise<any> {
    const params = new URLSearchParams({ valueInputOption: options.valueInputOption, insertDataOption: options.insertDataOption });
    if (options.includeValuesInResponse) params.append('includeValuesInResponse', 'true');
    if (options.responseValueRenderOption) params.append('responseValueRenderOption', options.responseValueRenderOption);
    if (options.responseDateTimeRenderOption) params.append('responseDateTimeRenderOption', options.responseDateTimeRenderOption);

    return this.request('POST', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?${params.toString()}`, {
      range,
      majorDimension: 'ROWS',
      values,
    });
  }

  async sheetsBatchUpdate(spreadsheetId: string, options: SheetsBatchUpdateOptions): Promise<any> {
    return this.request('POST', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, options);
  }

  async sheetsCreateSpreadsheet(title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    return this.request('POST', 'https://sheets.googleapis.com/v4/spreadsheets', { properties: { title } });
  }

  // ============================================
  // GMAIL API
  // ============================================

  async gmailListMessages(options: GmailListOptions = {}): Promise<GmailListResponse> {
    const params = new URLSearchParams();
    if (options.q) params.append('q', options.q);
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.labelIds) options.labelIds.forEach(id => params.append('labelIds', id));
    if (options.includeSpamTrash) params.append('includeSpamTrash', 'true');

    return this.request<GmailListResponse>('GET', `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`);
  }

  async gmailGetMessage(messageId: string): Promise<GmailMessage> {
    return this.request<GmailMessage>('GET', `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`);
  }

  async gmailGetThread(threadId: string): Promise<GmailThread> {
    return this.request<GmailThread>('GET', `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`);
  }

  async gmailSendMessage(options: GmailSendOptions): Promise<{ id: string; threadId: string }> {
    return this.request('POST', 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', options);
  }

  async gmailCreateDraft(message: GmailSendOptions): Promise<GmailDraft> {
    return this.request<GmailDraft>('POST', 'https://gmail.googleapis.com/gmail/v1/users/me/drafts', { message });
  }

  async gmailListLabels(): Promise<GmailLabel[]> {
    const response = await this.request<{ labels: GmailLabel[] }>('GET', 'https://gmail.googleapis.com/gmail/v1/users/me/labels');
    return response.labels;
  }

  async gmailModifyLabels(messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<GmailMessage> {
    return this.request('POST', `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, { addLabelIds, removeLabelIds });
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  private tokens: GoogleTokens | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  private async request<T>(method: string, url: string, data?: unknown, options: { params?: Record<string, string>; headers?: Record<string, string> } = {}): Promise<T> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) throw new Error('No valid access token');

    const fullUrl = new URL(url);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => fullUrl.searchParams.append(key, value));
    }

    const response = await fetch(fullUrl.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try refresh once
        await this.refreshTokens();
        return this.request(method, url, data, options);
      }
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${error}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  private tokensStore: GoogleTokens | null = null;

  setTokens(tokens: GoogleTokens): void {
    this.tokensStore = tokens;
    this.scheduleTokenRefresh();
  }

  getTokens(): GoogleTokens | null {
    return this.tokensStore;
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.tokensStore) return null;
    if (Date.now() >= this.tokensStore.expiresAt - 60000) {
      await this.refreshTokens();
    }
    return this.tokensStore?.accessToken || null;
  }

  private async refreshTokens(): Promise<void> {
    if (!this.tokensStore?.refreshToken) throw new Error('No refresh token');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.tokensStore.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    this.tokensStore = {
      accessToken: data.access_token,
      refreshToken: this.tokensStore.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type || 'Bearer',
      scope: data.scope,
    };
    this.scheduleTokenRefresh();
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) clearTimeout(this.tokenRefreshTimer);
    if (!this.tokensStore) return;

    const refreshTime = this.tokensStore.expiresAt - Date.now() - 5 * 60 * 1000;
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => this.refreshTokens().catch(console.error), refreshTime);
    }
  }

  private config: GoogleWorkspaceConfig;

  constructor(config: GoogleWorkspaceConfig) {
    this.config = config;
  }
}

// React Hook for Google Workspace
export function useGoogleWorkspace(config: GoogleWorkspaceConfig) {
  const [client] = useState(() => new GoogleWorkspaceClient(config));
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    const authUrl = client.getAuthUrl();
    window.location.href = authUrl;
  }, [client]);

  const handleCallback = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const tokens = await client.exchangeCodeForTokens(code);
      client.setTokens(tokens);
      const userInfo = await client.getUserInfo(tokens.accessToken);
      setUser(userInfo);
      setAuthenticated(true);
      return { tokens, user: userInfo };
    } catch (error) {
      console.error('Auth failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const signOut = useCallback(() => {
    // Clear tokens
    // client.tokensStore = null;
    setAuthenticated(false);
    setUser(null);
  }, []);

  // Check for auth code in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (code) {
      handleCallback(code).catch(console.error);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('Auth error:', error);
    } else {
      // Check if already authenticated
      const tokens = client.getTokens();
      if (tokens) {
        client.getUserInfo(tokens.accessToken).then(setUser).catch(() => {});
        setAuthenticated(true);
      }
    }
  }, [client]);

  return {
    client,
    authenticated,
    user,
    loading,
    signIn,
    signOut,
    handleCallback,
  };
}

import { useState, useCallback, useEffect } from 'react';
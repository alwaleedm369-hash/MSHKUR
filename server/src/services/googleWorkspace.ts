import { logger } from '@utils/logger';
import { config } from '@config';
import { google, drive_v3, calendar_v3, sheets_v4, gmail_v1, photoslibrary_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone: string };
  end: { dateTime?: string; date?: string; timeZone: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus: string }>;
  reminders?: { useDefault: boolean; overrides?: Array<{ method: string; minutes: number }> };
  conferenceData?: any;
  htmlLink: string;
}

interface SheetsValueRange {
  range: string;
  majorDimension: 'ROWS' | 'COLUMNS';
  values: unknown[][];
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: { data?: string };
    parts?: any[];
  };
}

class GoogleWorkspaceService {
  private oauth2Client: OAuth2Client;
  private tokens: Map<string, GoogleTokens> = new Map();
  private drive: drive_v3.Drive | null = null;
  private calendar: calendar_v3.Calendar | null = null;
  private sheets: sheets_v4.Sheets | null = null;
  private gmail: gmail_v1.Gmail | null = null;
  private photos: photoslibrary_v1.Photoslibrary | null = null;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.googleWorkspaceClientId,
      config.googleWorkspaceClientSecret,
      config.googleWorkspaceRedirectUri
    );
  }

  getAuthUrl(userId: string, scopes?: string[]): string {
    const defaultScopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes || defaultScopes,
      state: userId,
      prompt: 'consent',
      include_granted_scopes: true,
    });
  }

  async exchangeCodeForTokens(code: string, userId: string): Promise<GoogleTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      const googleTokens: GoogleTokens = {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: Date.now() + (tokens.expiry_date! - Date.now()),
        scope: tokens.scope || '',
      };

      this.tokens.set(userId, googleTokens);
      await this.saveTokensToDB(userId, googleTokens);

      return googleTokens;
    } catch (error) {
      logger.error('Failed to exchange code for tokens', { error, userId });
      throw error;
    }
  }

  async refreshAccessToken(userId: string): Promise<GoogleTokens | null> {
    const storedTokens = this.tokens.get(userId);
    if (!storedTokens?.refreshToken) {
      logger.warn('No refresh token available', { userId });
      return null;
    }

    try {
      this.oauth2Client.setCredentials({
        refresh_token: storedTokens.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      const newTokens: GoogleTokens = {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || storedTokens.refreshToken,
        expiresAt: Date.now() + (credentials.expiry_date! - Date.now()),
        scope: credentials.scope || storedTokens.scope,
      };

      this.tokens.set(userId, newTokens);
      await this.saveTokensToDB(userId, newTokens);

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh access token', { error, userId });
      return null;
    }
  }

  async getValidAccessToken(userId: string): Promise<string | null> {
    let tokens = this.tokens.get(userId);

    if (!tokens) {
      tokens = await this.loadTokensFromDB(userId);
      if (!tokens) return null;
    }

    if (Date.now() >= tokens.expiresAt - 5 * 60 * 1000) {
      const refreshed = await this.refreshAccessToken(userId);
      if (!refreshed) return null;
      tokens = refreshed;
    }

    return tokens.accessToken;
  }

  setTokens(userId: string, tokens: GoogleTokens): void {
    this.tokens.set(userId, tokens);
    this.saveTokensToDB(userId, tokens);
  }

  private async saveTokensToDB(userId: string, tokens: GoogleTokens): Promise<void> {
    // Save to database - implement based on your Prisma schema
    // await prisma.googleTokens.upsert({ where: { userId }, create: { userId, ...tokens }, update: { ...tokens } });
  }

  private async loadTokensFromDB(userId: string): Promise<GoogleTokens | null> {
    // Load from database
    // const record = await prisma.googleTokens.findUnique({ where: { userId } });
    // return record ? { ...record } : null;
    return null;
  }

  private async getAuthenticatedClient(userId: string) {
    const accessToken = await this.getValidAccessToken(userId);
    if (!accessToken) throw new Error('No valid access token');

    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });
    return client;
  }

  private async getDriveClient(userId: string) {
    if (!this.drive) {
      const client = await this.getAuthenticatedClient(userId);
      this.drive = google.drive({ version: 'v3', auth: client });
    }
    return this.drive;
  }

  private async getCalendarClient(userId: string) {
    if (!this.calendar) {
      const client = await this.getAuthenticatedClient(userId);
      this.calendar = google.calendar({ version: 'v3', auth: client });
    }
    return this.calendar;
  }

  private async getSheetsClient(userId: string) {
    if (!this.sheets) {
      const client = await this.getAuthenticatedClient(userId);
      this.sheets = google.sheets({ version: 'v4', auth: client });
    }
    return this.sheets;
  }

  private async getGmailClient(userId: string) {
    if (!this.gmail) {
      const client = await this.getAuthenticatedClient(userId);
      this.gmail = google.gmail({ version: 'v1', auth: client });
    }
    return this.gmail;
  }

  private async getPhotosClient(userId: string) {
    if (!this.photos) {
      const client = await this.getAuthenticatedClient(userId);
      this.photos = google.photoslibrary({ version: 'v1', auth: client });
    }
    return this.photos;
  }

  // ==================== DRIVE METHODS ====================

  async driveListFiles(userId: string, options: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
    orderBy?: string;
    fields?: string;
  } = {}): Promise<any> {
    const drive = await this.getDriveClient(userId);
    return drive.files.list({
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
      q: options.q,
      orderBy: options.orderBy,
      fields: options.fields || 'files(id,name,mimeType,size,parents,createdTime,modifiedTime,webViewLink,thumbnailLink)',
    });
  }

  async driveGetFile(userId: string, fileId: string): Promise<any> {
    const drive = await this.getDriveClient(userId);
    return drive.files.get({ fileId, fields: '*' });
  }

  async driveCreateFolder(userId: string, name: string, parents?: string[]): Promise<any> {
    const drive = await this.getDriveClient(userId);
    return drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents,
      },
      fields: 'id,name,webViewLink',
    });
  }

  async driveUploadFile(userId: string, options: {
    name: string;
    parents?: string[];
    mimeType?: string;
    data: Buffer | Readable;
  }): Promise<any> {
    const drive = await this.getDriveClient(userId);
    const { Readable } = require('stream');

    const media = {
      mimeType: options.mimeType || 'application/octet-stream',
      body: options.data instanceof Buffer
        ? Readable.from(options.data)
        : options.data,
    };

    return drive.files.create({
      requestBody: {
        name: options.name,
        parents: options.parents,
      },
      media,
      fields: 'id,name,webViewLink,webContentLink',
    });
  }

  async driveDeleteFile(userId: string, fileId: string): Promise<void> {
    const drive = await this.getDriveClient(userId);
    await drive.files.delete({ fileId });
  }

  async driveCopyFile(userId: string, fileId: string, name: string, parents?: string[]): Promise<any> {
    const drive = await this.getDriveClient(userId);
    return drive.files.copy({
      fileId,
      requestBody: { name, parents },
    });
  }

  async driveCreatePermission(userId: string, fileId: string, options: {
    role: 'reader' | 'writer' | 'commenter';
    type: 'user' | 'group' | 'domain' | 'anyone';
    emailAddress?: string;
  }): Promise<any> {
    const drive = await this.getDriveClient(userId);
    return drive.permissions.create({
      fileId,
      requestBody: options,
      fields: 'id',
    });
  }

  async driveSearchFiles(userId: string, query: string, options: any = {}): Promise<any> {
    return this.driveListFiles(userId, { ...options, q: query });
  }

  // ==================== PHOTOS METHODS ====================

  async photosListMediaItems(userId: string, options: {
    pageSize?: number;
    pageToken?: string;
    albumId?: string;
    filters?: any;
  } = {}): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client });

    const params: any = { pageSize: options.pageSize || 100 };
    if (options.pageToken) params.pageToken = options.pageToken;
    if (options.albumId) params.albumId = options.albumId;
    if (options.filters) params.filters = options.filters;

    return photos.mediaItems.list(params);
  }

  async photosGetMediaItem(userId: string, mediaItemId: string): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client });
    return photos.mediaItems.get({ mediaItemId });
  }

  async photosUploadMedia(userId: string, options: {
    albumId?: string;
    data: Buffer;
    filename: string;
    description?: string;
  }): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);

    // 1. Upload bytes to get upload token
    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await this.getValidAccessToken(userId)}`,
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

    // 2. Create media item
    const client2 = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client2 });

    return photos.mediaItems.batchCreate({
      requestBody: {
        newMediaItems: [{
          description: options.description || '',
          simpleMediaItem: { uploadToken, fileName: options.filename },
        }],
        albumId: options.albumId,
      });
  }

  async photosCreateAlbum(userId: string, title: string): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client });
    return photos.albums.create({ requestBody: { album: { title } } });
  }

  async photosListAlbums(userId: string, pageSize = 50): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client });
    return photos.albums.list({ pageSize });
  }

  async photosAddMediaToAlbum(userId: string, albumId: string, mediaItemIds: string[]): Promise<void> {
    const client = await this.getAuthenticatedClient(userId);
    const photos = google.photoslibrary({ version: 'v1', auth: client });
    await photos.albums.batchAddMediaItems({ albumId, mediaItemIds });
  }

  // ==================== CALENDAR METHODS ====================

  async calendarListEvents(userId: string, options: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  } = {}): Promise<any> {
    const calendar = await this.getCalendarClient(userId);
    return calendar.events.list({
      calendarId: options.calendarId || 'primary',
      timeMin: options.timeMin,
      timeMax: options.timeMax,
      maxResults: options.maxResults || 250,
      singleEvents: options.singleEvents ?? true,
      orderBy: options.orderBy || 'startTime',
    });
  }

  async calendarGetEvent(userId: string, calendarId: string, eventId: string): Promise<any> {
    const calendar = await this.getCalendarClient(userId);
    return calendar.events.get({ calendarId, eventId });
  }

  async calendarCreateEvent(userId: string, options: {
    calendarId?: string;
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ email: string; displayName?: string }>;
    reminders?: { useDefault: boolean; overrides?: Array<{ method: string; minutes: number }> };
    conferenceData?: { createRequest: { requestId: string; conferenceSolutionKey: { type: string } } };
    sendUpdates?: 'all' | 'externalOnly' | 'none';
  }): Promise<any> {
    const calendar = await this.getCalendarClient(userId);
    return calendar.events.insert({
      calendarId: options.calendarId || 'primary',
      sendUpdates: options.sendUpdates || 'all',
      conferenceDataVersion: options.conferenceData ? 1 : 0,
      requestBody: options,
    });
  }

  async calendarUpdateEvent(userId: string, calendarId: string, eventId: string, options: any): Promise<any> {
    const calendar = await this.getCalendarClient(userId);
    return calendar.events.update({ calendarId, eventId, requestBody: options });
  }

  async calendarDeleteEvent(userId: string, calendarId: string, eventId: string, sendUpdates = 'all'): Promise<void> {
    const calendar = await this.getCalendarClient(userId);
    await calendar.events.delete({ calendarId, eventId, sendUpdates });
  }

  async calendarListCalendars(userId: string): Promise<any> {
    const calendar = await this.getCalendarClient(userId);
    return calendar.calendarList.list();
  }

  // ==================== SHEETS METHODS ====================

  async sheetsGetValues(userId: string, spreadsheetId: string, range: string): Promise<any> {
    const sheets = await this.getSheetsClient(userId);
    return sheets.spreadsheets.values.get({ spreadsheetId, range });
  }

  async sheetsUpdateValues(userId: string, spreadsheetId: string, range: string, values: unknown[][]): Promise<any> {
    const sheets = await this.getSheetsClient(userId);
    return sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { range, majorDimension: 'ROWS', values },
    });
  }

  async sheetsAppendValues(userId: string, spreadsheetId: string, range: string, values: unknown[][]): Promise<any> {
    const sheets = await this.getSheetsClient(userId);
    return sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { range, majorDimension: 'ROWS', values },
    });
  }

  async sheetsBatchUpdate(userId: string, spreadsheetId: string, data: Array<{ range: string; values: unknown[][] }>): Promise<any> {
    const sheets = await this.getSheetsClient(userId);
    return sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data: data.map(d => ({ range: d.range, majorDimension: 'ROWS', values: d.values })) },
    });
  }

  async sheetsCreateSpreadsheet(userId: string, title: string): Promise<any> {
    const sheets = await this.getSheetsClient(userId);
    return sheets.spreadsheets.create({ requestBody: { properties: { title } } });
  }

  private async getSheetsClient(userId: string) {
    const client = await this.getAuthenticatedClient(userId);
    return google.sheets({ version: 'v4', auth: client });
  }

  private async getCalendarClient(userId: string) {
    const client = await this.getAuthenticatedClient(userId);
    return google.calendar({ version: 'v3', auth: client });
  }

  // ==================== GMAIL METHODS ====================

  async gmailListMessages(userId: string, options: {
    q?: string;
    maxResults?: number;
    labelIds?: string[];
  } = {}): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    return gmail.users.messages.list({
      userId: 'me',
      q: options.q,
      maxResults: options.maxResults || 100,
      labelIds: options.labelIds,
    });
  }

  async gmailGetMessage(userId: string, messageId: string): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    return gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  }

  async gmailSendMessage(userId: string, options: {
    to: string;
    subject: string;
    body: string;
    htmlBody?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{ filename: string; content: Buffer; mimeType: string }>;
  }): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    const { MimeMessage } = require('node-mime-message'); // or use a proper MIME library

    const message = {
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.htmlBody,
      cc: options.cc,
      bcc: options.bcc,
    };

    // Create MIME message
    const email = [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      options.htmlBody || options.body,
    ].join('\r\n');

    const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const gmail = await this.getGmailClient(userId);
    return gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
  }

  async gmailCreateDraft(userId: string, options: any): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    return gmail.users.drafts.create({ userId: 'me', requestBody: { message: options } });
  }

  async gmailListLabels(userId: string): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    const response = await gmail.users.labels.list({ userId: 'me' });
    return response.data.labels;
  }

  async gmailModifyLabels(userId: string, messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<any> {
    const gmail = await this.getGmailClient(userId);
    return gmail.users.messages.modify({ userId: 'me', id: messageId, addLabelIds, removeLabelIds });
  }

  private async getGmailClient(userId: string) {
    const client = await this.getAuthenticatedClient(userId);
    return google.gmail({ version: 'v1', auth: client });
  }

  private async getAuthenticatedClient(userId: string) {
    const accessToken = await this.getValidAccessToken(userId);
    if (!accessToken) throw new Error('No valid access token');

    const client = new google.auth.OAuth2();
    client.setCredentials({ access_token: accessToken });
    return client;
  }

  // ==================== UTILITY METHODS ====================

  async getUserInfo(userId: string): Promise<any> {
    const client = await this.getAuthenticatedClient(userId);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    return oauth2.userinfo.get();
  }

  revokeTokens(userId: string): void {
    this.tokens.delete(userId);
    // Also delete from DB
  }

  isConnected(userId: string): boolean {
    const tokens = this.tokens.get(userId);
    return !!tokens?.accessToken;
  }
}

export const googleWorkspaceService = new GoogleWorkspaceService();
export default googleWorkspaceService;
import { logger } from '@utils/logger';
import { config } from '@config';

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact';
  timestamp: number;
  isFromMe: boolean;
  isForwarded: boolean;
  media?: {
    mimetype: string;
    filename?: string;
    url: string;
    size: number;
  };
}

interface WhatsAppContact {
  id: string;
  name: string;
  pushname?: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  isUser: boolean;
  isGroup: boolean;
  profilePicUrl?: string;
  status?: string;
}

interface WhatsAppChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage?: WhatsAppMessage;
  participants?: WhatsAppContact[];
}

class WhatsAppService {
  private client: any = null;
  private isReady = false;
  private qrCode: string | null = null;
  private sessionPath: string;
  private messageHandlers: Map<string, (message: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor() {
    this.sessionPath = config.whatsappSessionPath;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing WhatsApp service...');

      // Dynamic import to avoid issues if not installed
      const { Client, LocalAuth } = await import('whatsapp-web.js');
      const qrcode = await import('qrcode-terminal');

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'mshkhur',
          dataPath: this.sessionPath,
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
          ],
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
      });

      this.client.on('qr', (qr: string) => {
        this.qrCode = qr;
        qrcode.generate(qr, { small: true });
        logger.info('QR Code received - scan with WhatsApp');
        this.emit('qr', qr);
      });

      this.client.on('ready', () => {
        this.isReady = true;
        this.reconnectAttempts = 0;
        logger.info('WhatsApp client ready');
        this.emit('ready', { phoneNumber: this.client.info?.wid?.user });
      });

      this.client.on('authenticated', () => {
        logger.info('WhatsApp authenticated');
        this.emit('authenticated');
      });

      this.client.on('auth_failure', (msg: string) => {
        logger.error('WhatsApp authentication failure', { message: msg });
        this.emit('auth_failure', msg);
      });

      this.client.on('disconnected', (reason: string) => {
        this.isReady = false;
        logger.warn('WhatsApp disconnected', { reason });
        this.emit('disconnected', reason);
        this.scheduleReconnect();
      });

      this.client.on('message', (msg: any) => {
        this.handleMessage(msg);
      });

      this.client.on('message_create', (msg: any) => {
        this.handleMessage(msg);
      });

      this.client.on('message_revoke', (msg: any) => {
        this.emit('message_revoke', { id: msg.id._serialized });
      });

      await this.client.initialize();
      logger.info('WhatsApp service initialized');
    } catch (error) {
      logger.error('Failed to initialize WhatsApp service', { error });
      throw error;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(5000 * Math.pow(1.5, this.reconnectAttempts - 1), 60000);

    logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.client.initialize();
      } catch (error) {
        logger.error('Reconnect failed', { error });
      }
    }, delay);
  }

  private handleMessage(msg: any) {
    const formatted = this.formatMessage(msg);
    this.emit('message', formatted);

    // Call registered handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(formatted);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });
  }

  private formatMessage(msg: any): WhatsAppMessage {
    return {
      id: msg.id._serialized,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      type: msg.type,
      timestamp: msg.timestamp * 1000,
      isFromMe: msg.fromMe,
      isForwarded: msg.isForwarded,
      hasMedia: msg.hasMedia,
      media: msg.hasMedia ? {
        mimetype: msg._data.mimetype,
        filename: msg._data.filename,
        size: msg._data.size,
      } : undefined,
    };
  }

  // Event emitter functionality
  private eventHandlers: Map<string, Function[]> = new Map();

  on(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  // Public methods
  async sendMessage(to: string, body: string, options?: { quotedMessageId?: string; linkPreview?: boolean }): Promise<any> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    return this.client.sendMessage(to, body, options);
  }

  async sendMedia(to: string, media: Buffer, options: { mimetype: string; filename?: string; caption?: string }): Promise<any> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const { MessageMedia } = await import('whatsapp-web.js');
    const mediaObj = new MessageMedia(options.mimetype, media.toString('base64'), options.filename);
    return this.client.sendMessage(to, mediaObj, { caption: options.caption });
  }

  async sendLocation(to: string, location: { latitude: number; longitude: number; name?: string; address?: string }): Promise<any> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const { Location } = await import('whatsapp-web.js');
    const loc = new Location(location.latitude, location.longitude, location.name || '');
    return this.client.sendMessage(to, loc);
  }

  async sendContact(to: string, contact: { name: string; phoneNumber: string; organization?: string }): Promise<any> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const { Contact } = await import('whatsapp-web.js');
    const contactObj = new Contact(contact.name, contact.phoneNumber, contact.organization);
    return this.client.sendMessage(to, contactObj);
  }

  async getChats(): Promise<WhatsAppChat[]> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chats = await this.client.getChats();
    return chats.map((chat: any) => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage ? this.formatMessage(chat.lastMessage) : undefined,
      participants: chat.participants?.map((p: any) => ({
        id: p.id._serialized,
        name: p.name || p.pushname,
        isBusiness: p.isBusiness,
      })),
    }));
  }

  async getContacts(): Promise<WhatsAppContact[]> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const contacts = await this.client.getContacts();
    return contacts.map((contact: any) => ({
      id: contact.id._serialized,
      name: contact.name || contact.pushname,
      pushname: contact.pushname,
      isBusiness: contact.isBusiness,
      isEnterprise: contact.isEnterprise,
      isUser: contact.isUser,
      isGroup: contact.isGroup,
      profilePicUrl: contact.profilePicUrl,
      status: contact.status,
    }));
  }

  async getMessages(chatId: string, limit = 50): Promise<WhatsAppMessage[]> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });
    return messages.map((msg: any) => this.formatMessage(msg));
  }

  async sendReaction(messageId: string, emoji: string): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    await this.client.sendReaction(messageId, emoji);
  }

  async markAsRead(chatId: string): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(chatId);
    await chat.sendSeen();
  }

  async archiveChat(chatId: string, archive = true): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(chatId);
    if (archive) await chat.archive(); else await chat.unarchive();
  }

  async muteChat(chatId: string, duration = 8 * 60 * 60 * 1000): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(chatId);
    await chat.mute(duration);
  }

  async blockContact(contactId: string, block = true): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    if (block) await this.client.blockContact(contactId);
    else await this.client.unblockContact(contactId);
  }

  async deleteMessage(messageId: string, forEveryone = false): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const msg = await this.client.getMessageById(messageId);
    if (forEveryone) await msg.delete(true); else await msg.delete(false);
  }

  async createGroup(name: string, participants: string[]): Promise<WhatsAppChat> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const group = await this.client.createGroup(name, participants);
    return {
      id: group.id._serialized,
      name: group.name,
      isGroup: true,
      unreadCount: 0,
      participants: group.participants.map((p: any) => ({
        id: p.id._serialized,
        name: p.name || p.pushname,
      })),
    };
  }

  async leaveGroup(groupId: string): Promise<void> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(groupId);
    await chat.leave();
  }

  async getGroupInviteLink(groupId: string): Promise<string> {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(groupId);
    return await chat.getInviteLink();
  }

  async getQRCode(): Promise<string | null> {
    return this.qrCode;
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
    }
  }

  // Register message handler
  registerMessageHandler(key: string, handler: (message: WhatsAppMessage) => void) {
    this.messageHandlers.set(key, handler);
  }

  unregisterMessageHandler(key: string) {
    this.messageHandlers.delete(key);
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
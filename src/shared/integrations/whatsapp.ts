/**
 * MSHKUR WhatsApp Web Integration
 * Local WhatsApp Web bridge for messaging without paid API
 * Uses browser automation or local server approach
 */

export interface WhatsAppConfig {
  // Connection
  bridgeUrl?: string; // Local bridge server URL (default: http://localhost:3001)
  autoConnect?: boolean;
  reconnectInterval?: number; // ms
  maxRetries?: number;

  // Session
  sessionPath?: string; // Path to store session data
  multiDevice?: boolean; // Use multi-device beta

  // Behavior
  headless?: boolean; // Run browser headless
  timeout?: number; // Operation timeout ms
  qrTimeout?: number; // QR code timeout ms
}

export interface WhatsAppContact {
  id: string;
  name: string;
  pushname?: string;
  shortName?: string;
  verifiedName?: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  isUser: boolean;
  isGroup: boolean;
  isWAContact: boolean;
  isMyContact: boolean;
  isBlocked: boolean;
  profilePicUrl?: string;
  status?: string;
  labels: string[];
}

export interface WhatsAppChat {
  id: string;
  name: string;
  isGroup: boolean;
  isReadOnly: boolean;
  unreadCount: number;
  lastMessage?: WhatsAppMessage;
  participants?: WhatsAppContact[];
  groupMetadata?: {
    owner: string;
    creation: number;
    description: string;
    participants: WhatsAppContact[];
  };
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'poll' | 'reaction';
  timestamp: number;
  isFromMe: boolean;
  isForwarded: boolean;
  isStatus: boolean;
  quotedMessage?: WhatsAppMessage;
  media?: {
    mimetype: string;
    filename?: string;
    url: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  reaction?: {
    emoji: string;
    sender: string;
    timestamp: number;
  };
  poll?: {
    name: string;
    options: string[];
    allowMultipleAnswers: boolean;
  };
}

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string;
  platform?: string;
  battery?: number;
  waVersion?: string;
  osVersion?: string;
  deviceManufacturer?: string;
  deviceModel?: string;
}

export interface QRCodeData {
  code: string;
  base64: string;
  expiresAt: number;
  ref: string;
}

export class WhatsAppWebClient {
  private config: WhatsAppConfig;
  private bridgeUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageId = 0;
  private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private isConnected = false;
  private sessionId: string | null = null;

  constructor(config: WhatsAppConfig = {}) {
    this.config = {
      bridgeUrl: 'http://localhost:3001',
      autoConnect: true,
      reconnectInterval: 5000,
      maxRetries: 10,
      headless: true,
      timeout: 30000,
      qrTimeout: 60000,
      ...config,
    };
    this.bridgeUrl = this.config.bridgeUrl!;

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  // Connection Management
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.bridgeUrl.replace('http', 'ws')}/whatsapp`);

        this.ws.onopen = () => {
          console.log('[WhatsApp] Connected to bridge');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', {});
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('[WhatsApp] Disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.emit('disconnected', { code: event.code, reason: event.reason });
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WhatsApp] WebSocket error:', error);
          this.emit('error', error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.pendingRequests.clear();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxRetries ?? 10)) {
      this.emit('max_retries_reached', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts - 1), 60000);

    console.log(`[WhatsApp] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle response to pending request
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject, timeout } = this.pendingRequests.get(message.id)!;
        clearTimeout(timeout);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
        return;
      }

      // Handle events
      this.emit(message.event || 'message', message.data);
    } catch (error) {
      console.error('[WhatsApp] Failed to parse message:', error);
    }
  }

  private sendRequest(action: string, data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }

      const id = `req-${++this.messageId}-${Date.now()}`;
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.ws!.send(JSON.stringify({ id, action, data }));
    });
  }

  // Event System
  on(event: string, handler: Function): () => void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
    return () => this.off(event, handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  // WhatsApp Actions

  // Get QR code for pairing
  async getQRCode(): Promise<QRCodeData> {
    return this.sendRequest('get_qr', {}) as Promise<QRCodeData>;
  }

  // Pair with phone (for multi-device)
  async pairWithPhone(phoneNumber: string): Promise<{ code: string; expiresAt: number }> {
    return this.sendRequest('pair_phone', { phoneNumber }) as Promise<{ code: string; expiresAt: number }>;
  }

  // Get connection status
  async getStatus(): Promise<WhatsAppStatus> {
    return this.sendRequest('get_status', {}) as Promise<WhatsAppStatus>;
  }

  // Get all chats
  async getChats(): Promise<WhatsAppChat[]> {
    return this.sendRequest('get_chats', {}) as Promise<WhatsAppChat[]>;
  }

  // Get chat by ID
  async getChat(chatId: string): Promise<WhatsAppChat> {
    return this.sendRequest('get_chat', { chatId }) as Promise<WhatsAppChat>;
  }

  // Get contacts
  async getContacts(): Promise<WhatsAppContact[]> {
    return this.sendRequest('get_contacts', {}) as Promise<WhatsAppContact[]>;
  }

  // Get contact by ID
  async getContact(contactId: string): Promise<WhatsAppContact> {
    return this.sendRequest('get_contact', { contactId }) as Promise<WhatsAppContact>;
  }

  // Send text message
  async sendMessage(to: string, body: string, options?: {
    quotedMessageId?: string;
    linkPreview?: boolean;
    mentions?: string[];
  }): Promise<WhatsAppMessage> {
    return this.sendRequest('send_message', { to, body, ...options }) as Promise<WhatsAppMessage>;
  }

  // Send media message
  async sendMedia(to: string, media: {
    mimetype: string;
    data: string; // base64
    filename?: string;
    caption?: string;
  }, options?: {
    quotedMessageId?: string;
  }): Promise<WhatsAppMessage> {
    return this.sendRequest('send_media', { to, media, ...options }) as Promise<WhatsAppMessage>;
  }

  // Send location
  async sendLocation(to: string, location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  }): Promise<WhatsAppMessage> {
    return this.sendRequest('send_location', { to, location }) as Promise<WhatsAppMessage>;
  }

  // Send contact
  async sendContact(to: string, contact: {
    name: string;
    phoneNumber: string;
    organization?: string;
    email?: string;
    url?: string;
  }): Promise<WhatsAppMessage> {
    return this.sendRequest('send_contact', { to, contact }) as Promise<WhatsAppMessage>;
  }

  // Send reaction
  async sendReaction(messageId: string, emoji: string): Promise<void> {
    return this.sendRequest('send_reaction', { messageId, emoji }) as Promise<void>;
  }

  // Get messages from chat
  async getMessages(chatId: string, options?: {
    limit?: number;
    before?: string; // message ID
    after?: string; // message ID
  }): Promise<WhatsAppMessage[]> {
    return this.sendRequest('get_messages', { chatId, ...options }) as Promise<WhatsAppMessage[]>;
  }

  // Mark messages as read
  async markAsRead(chatId: string, messageIds?: string[]): Promise<void> {
    return this.sendRequest('mark_read', { chatId, messageIds }) as Promise<void>;
  }

  // Archive chat
  async archiveChat(chatId: string, archive: boolean = true): Promise<void> {
    return this.sendRequest('archive_chat', { chatId, archive }) as Promise<void>;
  }

  // Pin chat
  async pinChat(chatId: string, pin: boolean = true): Promise<void> {
    return this.sendRequest('pin_chat', { chatId, pin }) as Promise<void>;
  }

  // Mute chat
  async muteChat(chatId: string, duration: number = 8 * 60 * 60 * 1000): Promise<void> { // 8 hours default
    return this.sendRequest('mute_chat', { chatId, duration }) as Promise<void>;
  }

  // Block/Unblock contact
  async blockContact(contactId: string, block: boolean = true): Promise<void> {
    return this.sendRequest('block_contact', { contactId, block }) as Promise<void>;
  }

  // Delete message
  async deleteMessage(messageId: string, forEveryone: boolean = false): Promise<void> {
    return this.sendRequest('delete_message', { messageId, forEveryone }) as Promise<void>;
  }

  // Create group
  async createGroup(name: string, participants: string[]): Promise<WhatsAppChat> {
    return this.sendRequest('create_group', { name, participants }) as Promise<WhatsAppChat>;
  }

  // Leave group
  async leaveGroup(groupId: string): Promise<void> {
    return this.sendRequest('leave_group', { groupId }) as Promise<void>;
  }

  // Get group invite link
  async getGroupInviteLink(groupId: string): Promise<string> {
    return this.sendRequest('get_group_invite', { groupId }) as Promise<string>;
  }

  // Set profile picture
  async setProfilePicture(imageData: string): Promise<void> { // base64
    return this.sendRequest('set_profile_picture', { imageData }) as Promise<void>;
  }

  // Set status
  async setStatus(status: string): Promise<void> {
    return this.sendRequest('set_status', { status }) as Promise<void>;
  }

  // Get profile picture
  async getProfilePicture(contactId: string): Promise<string> { // base64
    return this.sendRequest('get_profile_picture', { contactId }) as Promise<string>;
  }

  // Search messages
  async searchMessages(query: string, options?: {
    chatId?: string;
    limit?: number;
  }): Promise<WhatsAppMessage[]> {
    return this.sendRequest('search_messages', { query, ...options }) as Promise<WhatsAppMessage[]>;
  }

  // Get message by ID
  async getMessage(messageId: string): Promise<WhatsAppMessage> {
    return this.sendRequest('get_message', { messageId }) as Promise<WhatsAppMessage>;
  }

  // Forward message
  async forwardMessage(messageId: string, to: string): Promise<WhatsAppMessage> {
    return this.sendRequest('forward_message', { messageId, to }) as Promise<WhatsAppMessage>;
  }

  // Star/Unstar message
  async starMessage(messageId: string, star: boolean = true): Promise<void> {
    return this.sendRequest('star_message', { messageId, star }) as Promise<void>;
  }

  // Get starred messages
  async getStarredMessages(): Promise<WhatsAppMessage[]> {
    return this.sendRequest('get_starred_messages', {}) as Promise<WhatsAppMessage[]>;
  }

  // Business API methods
  async setBusinessProfile(profile: {
    description?: string;
    email?: string;
    address?: string;
    website?: string;
    vertical?: string;
    category?: string;
  }): Promise<void> {
    return this.sendRequest('set_business_profile', { profile }) as Promise<void>;
  }

  async getBusinessProfile(): Promise<WhatsAppContact> {
    return this.sendRequest('get_business_profile', {}) as Promise<WhatsAppContact>;
  }

  // Labels
  async createLabel(name: string, color: number): Promise<{ id: string; name: string; color: number }> {
    return this.sendRequest('create_label', { name, color }) as Promise<{ id: string; name: string; color: number }>;
  }

  async getLabels(): Promise<{ id: string; name: string; color: number }[]> {
    return this.sendRequest('get_labels', {}) as Promise<{ id: string; name: string; color: number }[]>;
  }

  async addLabelToChat(chatId: string, labelId: string): Promise<void> {
    return this.sendRequest('add_label_to_chat', { chatId, labelId }) as Promise<void>;
  }

  async removeLabelFromChat(chatId: string, labelId: string): Promise<void> {
    return this.sendRequest('remove_label_from_chat', { chatId, labelId }) as Promise<void>;
  }

  // Catalog (Business)
  async createProduct(product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[]; // base64
    retailerId: string;
    url?: string;
  }): Promise<{ id: string }> {
    return this.sendRequest('create_product', { product }) as Promise<{ id: string }>;
  }

  async getProducts(): Promise<any[]> {
    return this.sendRequest('get_products', {}) as Promise<any[]>;
  }

  // Utility
  isReady(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

// Local Bridge Server (Node.js) - for reference
/*
// whatsapp-bridge/server.js
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WebSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'mshkhur' }),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  broadcast({ event: 'qr', data: { code: qr, base64: await qrToBase64(qr), expiresAt: Date.now() + 60000, ref: 'qr-' + Date.now() } });
});

client.on('ready', () => {
  console.log('WhatsApp Client Ready');
  broadcast({ event: 'ready', data: { phoneNumber: client.info.wid.user } });
});

client.on('authenticated', () => console.log('Authenticated'));
client.on('auth_failure', (msg) => console.error('Auth failure:', msg));
client.on('disconnected', (reason) => {
  console.log('Disconnected:', reason);
  broadcast({ event: 'disconnected', data: { reason } });
});

client.on('message', (msg) => {
  broadcast({ event: 'message', data: formatMessage(msg) });
});

client.on('message_create', (msg) => broadcast({ event: 'message_create', data: formatMessage(msg) }));
client.on('message_revoke', (msg) => broadcast({ event: 'message_revoke', data: { id: msg.id._serialized } }));

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

async function qrToBase64(qr) {
  const QRCode = require('qrcode');
  return QRCode.toDataURL(qr);
}

function formatMessage(msg) {
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
    // ... more fields
  };
}

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const { id, action, data: payload } = JSON.parse(data);
    try {
      let result;
      switch (action) {
        case 'get_qr': result = await getQR(); break;
        case 'send_message': result = await client.sendMessage(payload.to, payload.body); break;
        // ... more actions
      }
      ws.send(JSON.stringify({ id, result }));
    } catch (error) {
      ws.send(JSON.stringify({ id, error: error.message }));
    }
  });
});

server.listen(3001, () => console.log('WhatsApp Bridge running on port 3001'));
*/

// React Hook for WhatsApp
export function useWhatsApp(config?: WhatsAppConfig) {
  const [client, setClient] = useState<WhatsAppWebClient | null>(null);
  const [status, setStatus] = useState<WhatsAppStatus>({ connected: false });
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [messages, setMessages] = useState<Map<string, WhatsAppMessage[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const waClient = new WhatsAppWebClient(config);
    setClient(waClient);

    // Event handlers
    const unsubscribeConnected = waClient.on('connected', () => {
      setStatus(prev => ({ ...prev, connected: true }));
      setError(null);
      waClient.getStatus().then(setStatus);
      waClient.getChats().then(setChats);
    });

    const unsubscribeDisconnected = waClient.on('disconnected', (data) => {
      setStatus(prev => ({ ...prev, connected: false }));
      setError(`Disconnected: ${data.reason}`);
    });

    const unsubscribeError = waClient.on('error', (err) => {
      setError(err.message);
    });

    const unsubscribeQR = waClient.on('qr', (data: QRCodeData) => {
      setQrCode(data);
    });

    const unsubscribeMessage = waClient.on('message', (msg: WhatsAppMessage) => {
      setMessages(prev => {
        const newMap = new Map(prev);
        const chatMessages = newMap.get(msg.to) || [];
        newMap.set(msg.to, [...chatMessages, msg]);
        return newMap;
      });
    });

    // Connect
    waClient.connect().catch(err => setError(err.message));

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      unsubscribeQR();
      unsubscribeMessage();
      waClient.disconnect();
    };
  }, [config]);

  const sendMessage = useCallback(async (to: string, body: string) => {
    if (!client) throw new Error('Client not initialized');
    return client.sendMessage(to, body);
  }, [client]);

  const getChats = useCallback(async () => {
    if (!client) throw new Error('Client not initialized');
    const fetchedChats = await client.getChats();
    setChats(fetchedChats);
    return fetchedChats;
  }, [client]);

  const getMessages = useCallback(async (chatId: string) => {
    if (!client) throw new Error('Client not initialized');
    const fetchedMessages = await client.getMessages(chatId);
    setMessages(prev => {
      const newMap = new Map(prev);
      newMap.set(chatId, fetchedMessages);
      return newMap;
    });
    return fetchedMessages;
  }, [client]);

  return {
    client,
    status,
    qrCode,
    chats,
    messages,
    loading,
    error,
    sendMessage,
    getChats,
    getMessages,
    connect: client?.connect.bind(client),
    disconnect: client?.disconnect.bind(client),
  };
}

import { useState, useEffect, useCallback } from 'react';
import { WhatsAppStatus, QRCodeData, WhatsAppChat, WhatsAppMessage } from './index';
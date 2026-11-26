import { logger } from '@utils/logger';
import { config } from '@config';
import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType | null = null;
  private connected = false;
  private localCache: Map<string, { value: any; expiry: number }> = new Map();
  private useRedis = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (config.redisUrl) {
        this.client = createClient({ url: config.redisUrl });
        this.client.on('error', (err) => logger.error('Redis cache error', { error: err }));
        await this.client.connect();
        this.connected = true;
        this.useRedis = true;
        logger.info('Redis cache connected');
      } else {
        logger.warn('Redis URL not configured, using in-memory cache');
      }
    } catch (error) {
      logger.warn('Redis connection failed, falling back to in-memory cache', { error });
      this.useRedis = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      }

      // Fallback to local cache
      const cached = this.localCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
      if (cached) {
        this.localCache.delete(key);
      }
      return null;
    } catch (error) {
      logger.warn('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (this.useRedis && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      }

      // Also store in local cache as backup
      this.localCache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000,
      });

      // Cleanup old entries periodically
      if (this.localCache.size > 10000) {
        this.cleanupLocalCache();
      }
    } catch (error) {
      logger.warn('Cache set error', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.del(key);
      }
      this.localCache.delete(key);
    } catch (error) {
      logger.warn('Cache delete error', { key, error });
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    let count = 0;
    try {
      if (this.useRedis && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          count = keys.length;
        }
      }

      // Also clear from local cache
      for (const key of this.localCache.keys()) {
        if (this.matchPattern(key, pattern)) {
          this.localCache.delete(key);
          count++;
        }
      }
      return count;
    } catch (error) {
      logger.warn('Cache delete pattern error', { pattern, error });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.exists(key) === 1;
      }
      const cached = this.localCache.get(key);
      return !!cached && cached.expiry > Date.now();
    } catch (error) {
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.ttl(key);
      }
      const cached = this.localCache.get(key);
      if (!cached) return -2;
      if (cached.expiry < Date.now()) return -2;
      return Math.ceil((cached.expiry - Date.now()) / 1000);
    } catch (error) {
      return -2;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.incr(key);
      }
      const current = (await this.get<number>(key)) || 0;
      const newValue = current + 1;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      logger.warn('Cache incr error', { key, error });
      return 0;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.decr(key);
      }
      const current = (await this.get<number>(key)) || 0;
      const newValue = current - 1;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      logger.warn('Cache decr error', { key, error });
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.expire(key, seconds) === 1;
      }
      const cached = this.localCache.get(key);
      if (cached) {
        cached.expiry = Date.now() + seconds * 1000;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.hSet(key, field, JSON.stringify(value));
      }
      // Local hash implementation
      const hash = this.localCache.get(key) || { value: {}, expiry: Date.now() + 3600000 };
      if (typeof hash.value !== 'object') hash.value = {};
      hash.value[field] = value;
      this.localCache.set(key, hash);
      return 1;
    } catch (error) {
      return 0;
    }
  }

  async hget(key: string, field: string): Promise<any> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.hGet(key, field);
        return value ? JSON.parse(value) : null;
      }
      const hash = this.localCache.get(key);
      if (hash && typeof hash.value === 'object') {
        return hash.value[field] || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    try {
      if (this.useRedis && this.client) {
        const result = await this.client.hGetAll(key);
        const parsed: Record<string, any> = {};
        for (const [k, v] of Object.entries(result)) {
          parsed[k] = JSON.parse(v);
        }
        return parsed;
      }
      const hash = this.localCache.get(key);
      if (hash && typeof hash.value === 'object') {
        return hash.value;
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.hDel(key, field);
      }
      const hash = this.localCache.get(key);
      if (hash && typeof hash.value === 'object' && field in hash.value) {
        delete hash.value[field];
        return 1;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.sAdd(key, members);
      }
      const set = this.localCache.get(key) || { value: new Set(), expiry: Date.now() + 3600000 };
      if (!(set.value instanceof Set)) set.value = new Set();
      let added = 0;
      for (const member of members) {
        if (!set.value.has(member)) {
          set.value.add(member);
          added++;
        }
      }
      this.localCache.set(key, set);
      return added;
    } catch (error) {
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.sMembers(key);
      }
      const set = this.localCache.get(key);
      if (set && set.value instanceof Set) {
        return Array.from(set.value);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.sIsMember(key, member);
      }
      const set = this.localCache.get(key);
      if (set && set.value instanceof Set) {
        return set.value.has(member);
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.sRem(key, members);
      }
      const set = this.localCache.get(key);
      if (set && set.value instanceof Set) {
        let removed = 0;
        for (const member of members) {
          if (set.value.delete(member)) removed++;
        }
        return removed;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.lPush(key, values.map(v => JSON.stringify(v)));
      }
      const list = this.localCache.get(key) || { value: [], expiry: Date.now() + 3600000 };
      if (!Array.isArray(list.value)) list.value = [];
      list.value.unshift(...values.map(v => JSON.stringify(v)));
      this.localCache.set(key, list);
      return list.value.length;
    } catch (error) {
      return 0;
    }
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.rPush(key, values.map(v => JSON.stringify(v)));
      }
      const list = this.localCache.get(key) || { value: [], expiry: Date.now() + 3600000 };
      if (!Array.isArray(list.value)) list.value = [];
      list.value.push(...values.map(v => JSON.stringify(v)));
      this.localCache.set(key, list);
      return list.value.length;
    } catch (error) {
      return 0;
    }
  }

  async lpop(key: string): Promise<any> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.lPop(key);
        return value ? JSON.parse(value) : null;
      }
      const list = this.localCache.get(key);
      if (Array.isArray(list?.value) && list.value.length > 0) {
        const value = list.value.shift();
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async rpop(key: string): Promise<any> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.rPop(key);
        return value ? JSON.parse(value) : null;
      }
      const list = this.localCache.get(key);
      if (Array.isArray(list?.value) && list.value.length > 0) {
        const value = list.value.pop();
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      if (this.useRedis && this.client) {
        const values = await this.client.lRange(key, start, stop);
        return values.map(v => JSON.parse(v));
      }
      const list = this.localCache.get(key);
      if (Array.isArray(list?.value)) {
        const end = stop === -1 ? list.value.length : stop + 1;
        return list.value.slice(start, end).map(v => JSON.parse(v));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Cleanup expired entries from local cache
  private cleanupLocalCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.localCache.entries()) {
      if (cached.expiry < now) {
        this.localCache.delete(key);
      }
    }
    // If still too large, remove oldest entries
    if (this.localCache.size > 8000) {
      const entries = Array.from(this.localCache.entries());
      entries.sort((a, b) => a[1].expiry - b[1].expiry);
      const toRemove = entries.slice(0, entries.length - 5000);
      for (const [key] of toRemove) {
        this.localCache.delete(key);
      }
    }
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(key);
  }

  // Session management
  async setSession(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}`);
  }

  async extendSession(sessionId: string, ttlSeconds: number = 86400): Promise<void> {
    await this.expire(`session:${sessionId}`, ttlSeconds);
  }

  // Rate limiting helpers
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key_rl = `ratelimit:${key}`;
    const current = await this.incr(key_rl);

    if (current === 1) {
      await this.expire(key_rl, windowSeconds);
    }

    const ttl = await this.ttl(key_rl);
    const resetAt = Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000;

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt,
    };
  }

  // Lock mechanism
  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<boolean> {
    const lockKey = `lock:${lockKey}`;
    const acquired = await this.set(lockKey, '1', ttlSeconds);
    return acquired;
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.delete(`lock:${lockKey}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latency?: number }> {
    const start = Date.now();
    try {
      await this.set('healthcheck', 'ok', 10);
      const value = await this.get('healthcheck');
      const latency = Date.now() - start;

      if (value === 'ok') {
        return { status: 'healthy', latency };
      }
      return { status: 'degraded', latency };
    } catch (error) {
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      this.useRedis = false;
    }
    this.localCache.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
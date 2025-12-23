import Redis from 'ioredis';
import { envConfig } from './env.config.js';
import logger from './logger.config.js';

class RedisClient {
  private static instance: RedisClient;
  public client: Redis | null = null;
  public isConnected: boolean = false;
  private isEnabled: boolean = false;

  private constructor() {
    // Don't create client in constructor - wait for initialize()
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async initialize(): Promise<void> {
    if (this.client) {
      logger.warn('Redis client already initialized');
      return;
    }

    this.isEnabled = true;
    this.client = new Redis({
      host: envConfig.redis.host,
      port: envConfig.redis.port,
      password: envConfig.redis.password,
      db: envConfig.redis.db,
      retryStrategy(times) {
        // Stop retrying after 3 attempts
        if (times > 3) {
          logger.warn('Redis connection failed after 3 attempts. Running without Redis.');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('✅ Redis client connected successfully');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      // Only log warning instead of error for connection issues
      if (err.message.includes('ECONNREFUSED')) {
        logger.warn('⚠️  Redis not available. Running without cache.');
      } else {
        logger.error('Redis client error:', err);
      }
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.debug('Redis client reconnecting...');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis client connection ended');
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.client || !this.isEnabled) {
      logger.debug('Redis not initialized, skipping disconnect');
      return;
    }

    try {
      await this.client.quit();
      logger.info('Redis client disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect Redis client:', error);
      throw error;
    }
  }

  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call initialize() first or enable Redis.');
    }
    return this.client;
  }

  // Utility methods
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client || !this.isEnabled) return;
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.client || !this.isEnabled) return null;
    return await this.client.get(key);
  }

  public async del(key: string): Promise<void> {
    if (!this.client || !this.isEnabled) return;
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isEnabled) return false;
    const result = await this.client.exists(key);
    return result === 1;
  }

  public async expire(key: string, seconds: number): Promise<void> {
    if (!this.client || !this.isEnabled) return;
    await this.client.expire(key, seconds);
  }

  // JSON methods
  public async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client || !this.isEnabled) return;
    const jsonString = JSON.stringify(value);
    await this.set(key, jsonString, ttl);
  }

  public async getJSON<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isEnabled) return null;
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  // Sorted Set methods (for leaderboards)
  public async zadd(key: string, score: number, member: string): Promise<void> {
    if (!this.client || !this.isEnabled) return;
    await this.client.zadd(key, score, member);
  }

  public async zrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.client || !this.isEnabled) return [];
    return await this.client.zrange(key, start, stop);
  }

  public async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.client || !this.isEnabled) return [];
    return await this.client.zrevrange(key, start, stop);
  }

  public async zrank(key: string, member: string): Promise<number | null> {
    if (!this.client || !this.isEnabled) return null;
    return await this.client.zrank(key, member);
  }

  public async zscore(key: string, member: string): Promise<string | null> {
    if (!this.client || !this.isEnabled) return null;
    return await this.client.zscore(key, member);
  }
}

export const redis = RedisClient.getInstance();
export default redis;

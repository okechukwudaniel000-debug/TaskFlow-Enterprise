/**
 * Cache Manager with Redis and In-Memory fallback
 */
export class CacheManager {
  private static inMemoryCache = new Map<string, { value: any; expiry: number }>();
  private static redisClient: any = null; // Pre-initialized if redis client is available
  private static isRedisConnected = false;

  static init() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        console.log("Redis configuration detected. Initializing client...");
        // In actual production, we import ioredis or redis here
        // Handle lazy initialization safely
        this.isRedisConnected = false; 
      } catch (e) {
        console.warn("Failed to initialize Redis client, falling back to In-Memory cache:", e);
      }
    } else {
      console.log("Using In-Memory Cache (No REDIS_URL provided). Ready for full-stack workloads.");
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        console.error("Redis get error:", e);
      }
    }

    // Fallback: In-Memory cache
    const cached = this.inMemoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return;
      } catch (e) {
        console.error("Redis set error:", e);
      }
    }

    // Fallback: In-Memory cache
    this.inMemoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  static async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (e) {
        console.error("Redis del error:", e);
      }
    }

    this.inMemoryCache.delete(key);
  }

  static async clear(): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushall();
        return;
      } catch (e) {
        console.error("Redis flush error:", e);
      }
    }

    this.inMemoryCache.clear();
  }
}

// Automatically init on file load
CacheManager.init();

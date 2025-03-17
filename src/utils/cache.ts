// import Redis from 'ioredis';
// import config from '../config';
// import {logger} from "@/config/logger";
//
// class CacheUtil {
//   private client: Redis;
//
//   constructor() {
//     this.client = new Redis({
//       host: config.redis.host,
//       port: config.redis.port,
//       password: config.redis.password,
//       keyPrefix: 'taskapi:',
//       retryStrategy: (times) => {
//         const delay = Math.min(times * 50, 2000);
//         return delay;
//       }
//     });
//
//     this.client.on('error', (err) => {
//       logger.error('Redis cache error', { error: err.message });
//     });
//
//     this.client.on('connect', () => {
//       logger.info('Connected to Redis cache');
//     });
//   }
//
//   /**
//    * Get a value from cache
//    * @param key - Cache key
//    */
//   async get(key: string): Promise<string | null> {
//     try {
//       return await this.client.get(key);
//     } catch (error) {
//       logger.error('Error getting cache value', { key, error });
//       return null;
//     }
//   }
//
//   /**
//    * Set a value in cache
//    * @param key - Cache key
//    * @param value - Value to store
//    * @param mode - Redis command mode (EX for seconds, PX for milliseconds)
//    * @param duration - Time to live
//    */
//   async set(key: string, value: string, mode: string = 'EX', duration: number = 300): Promise<string | null> {
//     try {
//       return await this.client.set(key, value, mode, duration);
//     } catch (error) {
//       logger.error('Error setting cache value', { key, error });
//       return null;
//     }
//   }
//
//   /**
//    * Delete a key from cache
//    * @param pattern - Key or pattern to delete
//    */
//   async del(pattern: string): Promise<number> {
//     try {
//       if (pattern.includes('*')) {
//         // Use scan to delete keys matching pattern
//         let cursor = '0';
//         let keys: string[] = [];
//
//         do {
//           const result = await this.client.scan(
//             cursor,
//             'MATCH',
//             this.client.options.keyPrefix + pattern,
//             'COUNT',
//             100
//           );
//
//           cursor = result[0];
//           keys = keys.concat(result[1]);
//
//           if (keys.length >= 100) {
//             // Delete in batches to avoid blocking Redis
//             const keysToDelete = keys.slice(0, 100);
//             keys = keys.slice(100);
//
//             if (keysToDelete.length > 0) {
//               await this.client.del(...keysToDelete);
//             }
//           }
//         } while (cursor !== '0');
//
//         // Delete any remaining keys
//         if (keys.length > 0) {
//           return await this.client.del(...keys);
//         }
//         return 0;
//       } else {
//         return await this.client.del(pattern);
//       }
//     } catch (error) {
//       logger.error('Error deleting cache keys', { pattern, error });
//       return 0;
//     }
//   }
//
//   /**
//    * Clear all cache entries with the keyPrefix
//    */
//   async flushAll(): Promise<string> {
//     try {
//       // Only flush keys with our prefix to avoid affecting other applications
//       let cursor = '0';
//       let deletedCount = 0;
//
//       do {
//         const result = await this.client.scan(
//           cursor,
//           'MATCH',
//           this.client.options.keyPrefix + '*',
//           'COUNT',
//           100
//         );
//
//         cursor = result[0];
//         const keys = result[1];
//
//         if (keys.length > 0) {
//           const deleted = await this.client.del(...keys);
//           deletedCount += deleted;
//         }
//       } while (cursor !== '0');
//
//       return `Flushed ${deletedCount} keys`;
//     } catch (error) {
//       logger.error('Error flushing cache', { error });
//       return 'Error flushing cache';
//     }
//   }
// }
//
// export const cache = new CacheUtil();

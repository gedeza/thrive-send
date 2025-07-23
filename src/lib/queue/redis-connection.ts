import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis configuration for queue system
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLazyConnectTimeout: 0,
  // BullMQ requires maxRetriesPerRequest to be null for blocking operations
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  // For production, consider using cluster mode
  family: 4, // 4 (IPv4) or 6 (IPv6)
};

// Create Redis connection for queues
export const createRedisConnection = (): Redis => {
  const redis = new Redis(redisConfig);

  redis.on('connect', () => {
    logger.info('Redis connected for queue system');
  });

  redis.on('ready', () => {
    logger.info('Redis ready for queue operations');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error', error, {
      component: 'redis_queue_connection'
    });
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });

  return redis;
};

// Singleton Redis connection for queue operations
export const queueRedisConnection = createRedisConnection();
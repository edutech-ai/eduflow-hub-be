import { ConnectionOptions } from 'bullmq';
import { envConfig } from './env.config.js';

export const bullmqConnection: ConnectionOptions = {
  host: envConfig.redis.host,
  port: envConfig.redis.port,
  password: envConfig.redis.password,
  db: envConfig.redis.db,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const defaultJobOptions = {
  attempts: envConfig.bullmq.attempts,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: {
    count: 100,
    age: 24 * 3600, // 24 hours
  },
  removeOnFail: {
    count: 1000,
    age: 7 * 24 * 3600, // 7 days
  },
};

export const QUEUE_NAMES = {
  AI_GENERATION: 'ai-generation',
  PDF_GENERATION: 'pdf-generation',
  EMAIL: 'email',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  APP_NAME: z.string().default('EduFlow Hub'),

  // Client & Server URLs
  CLIENT_URL: z.string().url(),
  SERVER_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string(),

  // Database
  MONGODB_URI: z.string().min(1),
  MONGODB_URI_TEST: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // AI Services
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Email Service
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@eduflow-hub.com'),
  EMAIL_FROM_NAME: z.string().default('EduFlow Hub'),

  // Mailtrap (Development)
  MAILTRAP_HOST: z.string().default('sandbox.smtp.mailtrap.io'),
  MAILTRAP_PORT: z.string().default('2525'),
  MAILTRAP_USER: z.string().optional(),
  MAILTRAP_PASS: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  AI_RATE_LIMIT_MAX: z.string().default('5'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug']).default('info'),
  LOG_TO_FILE: z.string().default('true'),

  // Socket.io
  SOCKET_CORS_ORIGIN: z.string(),

  // BullMQ
  BULLMQ_CONCURRENCY: z.string().default('5'),
  BULLMQ_ATTEMPTS: z.string().default('3'),

  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760'),
  ALLOWED_FILE_TYPES: z.string(),

  // Session
  SESSION_SECRET: z.string().min(32),

  // Security
  BCRYPT_ROUNDS: z.string().default('10'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

export const envConfig = {
  // Application
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  appName: env.APP_NAME,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // URLs
  clientUrl: env.CLIENT_URL,
  serverUrl: env.SERVER_URL,
  allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),

  // Database
  mongodbUri: env.MONGODB_URI,
  mongodbUriTest: env.MONGODB_URI_TEST,

  // Redis
  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD,
    db: parseInt(env.REDIS_DB, 10),
  },

  // JWT
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  // AI Services
  ai: {
    geminiApiKey: env.GEMINI_API_KEY,
    openaiApiKey: env.OPENAI_API_KEY,
  },

  // Cloudflare R2
  r2: {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    publicUrl: env.R2_PUBLIC_URL,
  },

  // Email
  email: {
    brevoApiKey: env.BREVO_API_KEY,
    from: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
    mailtrapHost: env.MAILTRAP_HOST,
    mailtrapPort: parseInt(env.MAILTRAP_PORT, 10),
    mailtrapUser: env.MAILTRAP_USER,
    mailtrapPass: env.MAILTRAP_PASS,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    aiMaxRequests: parseInt(env.AI_RATE_LIMIT_MAX, 10),
  },

  // Logging
  log: {
    level: env.LOG_LEVEL,
    toFile: env.LOG_TO_FILE === 'true',
  },

  // Socket.io
  socket: {
    corsOrigin: env.SOCKET_CORS_ORIGIN,
  },

  // BullMQ
  bullmq: {
    concurrency: parseInt(env.BULLMQ_CONCURRENCY, 10),
    attempts: parseInt(env.BULLMQ_ATTEMPTS, 10),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim()),
  },

  // Session
  sessionSecret: env.SESSION_SECRET,

  // Security
  bcryptRounds: parseInt(env.BCRYPT_ROUNDS, 10),
} as const;

export default envConfig;

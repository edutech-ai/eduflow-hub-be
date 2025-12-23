// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/eduflow-hub-test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.SERVER_URL = 'http://localhost:5001';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.SOCKET_CORS_ORIGIN = 'http://localhost:3000';
process.env.SESSION_SECRET = 'test-session-secret-key-at-least-32-characters-long';
process.env.ALLOWED_FILE_TYPES = 'image/jpeg,image/png,application/pdf';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

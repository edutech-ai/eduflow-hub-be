import http from 'http';
import app from './app.js';
import { envConfig } from './configs/env.config.js';
import logger from './configs/logger.config.js';
import database from './configs/database.config.js';
import redis from './configs/redis.config.js';
import { socketServer } from './configs/socket.config.js';
import { ClassroomSocketHandler } from './sockets/handlers/classroom.handler.js';
import { AIGenerationWorker } from './jobs/workers/ai-generation.worker.js';

// Feature flags (can be moved to env later)
const ENABLE_REDIS = false; // Set to true when needed
const ENABLE_SOCKET = false; // Set to true when needed
const ENABLE_WORKERS = false; // Set to true when needed

// Create HTTP server
const server = http.createServer(app);

// Optional: Initialize Socket.io (can be initialized synchronously)
let io: any = null;
if (ENABLE_SOCKET) {
  io = socketServer.initialize(server);
  io.on('connection', (socket: any) => {
    ClassroomSocketHandler.register(socket);
  });
  logger.info('✅ Socket.io enabled');
} else {
  logger.info('⏭️  Socket.io disabled (enable in server.ts when needed)');
}

// Worker instance (will be initialized in startServer if enabled)
let aiWorker: AIGenerationWorker | null = null;

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close workers (only if initialized)
    if (aiWorker) {
      await aiWorker.close();
    }

    // Close database connections
    await database.disconnect();
    await redis.disconnect(); // Safe to call even if not initialized

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    logger.info('Database connected');

    // Initialize Redis (only if enabled)
    if (ENABLE_REDIS) {
      await redis.initialize();
      await redis.getClient().ping();
      logger.info('✅ Redis connected');
    } else {
      logger.info('⏭️  Redis disabled (enable ENABLE_REDIS in server.ts when needed)');
    }

    // Initialize workers (only if enabled)
    if (ENABLE_WORKERS) {
      aiWorker = new AIGenerationWorker();
      logger.info('✅ Background workers enabled');
    } else {
      logger.info('⏭️  Background workers disabled (enable ENABLE_WORKERS in server.ts when needed)');
    }

    // Start HTTP server
    server.listen(envConfig.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 EduFlow Hub Server Started Successfully!            ║
║                                                           ║
║   Environment: ${envConfig.nodeEnv.toUpperCase().padEnd(43)}║
║   Port: ${String(envConfig.port).padEnd(50)}║
║   API URL: ${envConfig.serverUrl.padEnd(47)}║
║   Docs: ${(envConfig.serverUrl + '/api-docs').padEnd(50)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

import mongoose from 'mongoose';
import { envConfig } from './env.config.js';
import logger from './logger.config.js';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = envConfig.isTest ? envConfig.mongodbUriTest : envConfig.mongodbUri;

      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined');
      }

      // Mongoose connection options
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Use IPv4
      };

      // Connect to MongoDB
      await mongoose.connect(mongoUri, options);

      logger.info('MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from MongoDB');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      // Enable query logging in development
      if (envConfig.isDevelopment) {
        mongoose.set('debug', (collectionName, method, query, doc) => {
          logger.debug(`Mongoose: ${collectionName}.${method}`, {
            query,
            doc,
          });
        });
      }
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): typeof mongoose {
    return mongoose;
  }
}

export const database = Database.getInstance();
export default database;

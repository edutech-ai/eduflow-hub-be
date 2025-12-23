import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { envConfig } from './env.config.js';
import logger from './logger.config.js';

class SocketServer {
  private static instance: SocketServer;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }

  public initialize(httpServer: HTTPServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: envConfig.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupConnectionHandler();

    logger.info('Socket.io server initialized');
    return this.io;
  }

  private setupConnectionHandler(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error: ${socket.id}`, error);
      });
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call initialize() first.');
    }
    return this.io;
  }

  public emitToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToAll(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

export const socketServer = SocketServer.getInstance();
export default socketServer;

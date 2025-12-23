import { Queue } from 'bullmq';
import { bullmqConnection, defaultJobOptions, QUEUE_NAMES } from '@/configs/bullmq.config.js';
import logger from '@/configs/logger.config.js';

class QueueManager {
  private static instance: QueueManager;
  private queues: Map<string, Queue>;

  private constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private initializeQueues(): void {
    Object.values(QUEUE_NAMES).forEach((queueName) => {
      const queue = new Queue(queueName, {
        connection: bullmqConnection,
        defaultJobOptions,
      });

      queue.on('error', (err) => {
        logger.error(`Queue ${queueName} error:`, err);
      });

      this.queues.set(queueName, queue);
      logger.info(`Queue ${queueName} initialized`);
    });
  }

  public getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  public async addJob(queueName: string, jobName: string, data: any, options?: any): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(jobName, data, options);
    logger.info(`Job ${jobName} added to queue ${queueName}`);
  }

  public async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) => queue.close());
    await Promise.all(closePromises);
    logger.info('All queues closed');
  }
}

export const queueManager = QueueManager.getInstance();
export default queueManager;

import { Worker, Job } from 'bullmq';
import { bullmqConnection } from '@/configs/bullmq.config.js';
import { envConfig } from '@/configs/env.config.js';
import logger from '@/configs/logger.config.js';

export abstract class BaseWorker<T = any> {
  protected worker: Worker;
  protected queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
    this.worker = new Worker(queueName, this.process.bind(this), {
      connection: bullmqConnection,
      concurrency: envConfig.bullmq.concurrency,
      limiter: {
        max: 10,
        duration: 1000,
      },
    });

    this.setupEventListeners();
  }

  protected abstract process(job: Job<T>): Promise<any>;

  private setupEventListeners(): void {
    this.worker.on('completed', (job) => {
      logger.info(`Job ${job.id} in queue ${this.queueName} completed`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} in queue ${this.queueName} failed:`, err);
    });

    this.worker.on('error', (err) => {
      logger.error(`Worker ${this.queueName} error:`, err);
    });

    this.worker.on('active', (job) => {
      logger.debug(`Job ${job.id} in queue ${this.queueName} started`);
    });
  }

  public async close(): Promise<void> {
    await this.worker.close();
    logger.info(`Worker ${this.queueName} closed`);
  }
}

export default BaseWorker;

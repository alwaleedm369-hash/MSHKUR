import { logger } from '@utils/logger';
import { config } from '@config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { createClient } from 'redis';

interface JobData {
  type: string;
  payload: any;
  priority?: number;
  attempts?: number;
  delay?: number;
  repeat?: { pattern: string; tz?: string };
}

interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
}

class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private redisClient: any = null;
  private processors: Map<string, (job: Job) => Promise<any>> = new Map();

  constructor() {
    this.initializeRedis();
    this.setupDefaultQueues();
  }

  private async initializeRedis() {
    try {
      this.redisClient = createClient({ url: config.redisUrl });
      this.redisClient.on('error', (err: Error) => logger.error('Redis error', { error: err }));
      await this.redisClient.connect();
      logger.info('Redis connected for queue service');
    } catch (error) {
      logger.warn('Redis not available, using in-memory queue fallback', { error });
    }
  }

  private setupDefaultQueues() {
    const defaultQueues = [
      'image-processing',
      'email',
      'push-notifications',
      'webhooks',
      'analytics',
      'backup',
      'cleanup',
      'sync',
      'ai-processing',
      'integrations',
      'deployments',
      'reports',
      'default',
    ];

    defaultQueues.forEach(name => this.getQueue(name));
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.redisClient,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      queue.on('error', (err) => logger.error(`Queue ${name} error`, { error: err }));
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async addJob<T = any>(
    queueName: string,
    jobData: JobData,
    options: {
      priority?: number;
      delay?: number;
      attempts?: number;
      repeat?: { pattern: string; tz?: string };
      jobId?: string;
    } = {}
  ): Promise<Job> {
    const queue = this.getQueue(queueName);

    const job = await queue.add(queueName, jobData.payload, {
      priority: jobData.priority || options.priority || 0,
      delay: jobData.delay || options.delay,
      attempts: jobData.attempts || options.attempts || 3,
      jobId: options.jobId,
      repeat: jobData.repeat || options.repeat,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    logger.debug(`Job added to ${queueName}`, { jobId: job.id, type: jobData.type });
    return job;
  }

  async addJobBulk<T = any>(
    queueName: string,
    jobsData: Array<JobData & { jobId?: string }>
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    const jobs = jobsData.map(j => ({
      name: queueName,
      data: j.payload,
      opts: {
        priority: j.priority || 0,
        delay: j.delay,
        attempts: j.attempts || 3,
        jobId: j.jobId,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }));

    const jobs_result = await this.getQueue(queueName).addBulk(jobs);
    logger.info(`Bulk added ${jobs_result.length} jobs to ${queueName}`);
    return jobs_result;
  }

  // Register processor for a queue
  registerProcessor(queueName: string, processor: (job: Job) => Promise<any>): void {
    this.processors.set(queueName, processor);

    const queue = this.getQueue(queueName);
    const worker = new Worker(queueName, async (job) => {
      const processor = this.processors.get(queueName);
      if (!processor) {
        throw new Error(`No processor registered for ${queueName}`);
      }
      return processor(job);
    }, {
      connection: this.redisClient,
      concurrency: 5,
    });

    worker.on('completed', (job) => {
      logger.debug(`Job completed`, { queue: queueName, jobId: job.id });
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job failed`, { queue: queueName, jobId: job?.id, error: err.message });
    });

    worker.on('error', (err) => {
      logger.error(`Worker error`, { queue: queueName, error: err });
    });

    this.workers.set(queueName, worker);
    logger.info(`Processor registered for ${queueName}`);
  }

  // Get job status
  async getJob(queueName: string, jobId: string): Promise<any> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress,
      state,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      returnValue: job.returnvalue,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  // Get jobs by status
  async getJobs(queueName: string, status?: string, limit = 100): Promise<any[]> {
    const queue = this.getQueue(queueName);
    const statuses = status ? [status] : ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'];
    const jobs: any[] = [];

    for (const status of statuses) {
      const jobs_list = await queue.getJobs([status], 0, 100, true);
      jobs.push(...jobs_list);
    }

    return jobs.slice(0, limit).map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      state: job.status,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
    }));
  }

  // Retry failed job
  async retryJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
      logger.info(`Job retried`, { queue: queueName, jobId });
    }
  }

  // Remove job
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`Job removed`, { queue: queueName, jobId });
    }
  }

  // Clean completed/failed jobs
  async cleanQueue(queueName: string, grace = 24 * 60 * 60 * 1000, limit = 100): Promise<number> {
    const queue = this.getQueue(queueName);
    const cleaned = await queue.clean(grace, limit, 'completed');
    logger.info(`Cleaned ${cleaned.length} completed jobs from ${queueName}`);
    return cleaned.length;
  }

  // Pause queue
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    logger.info(`Queue paused: ${queueName}`);
  }

  // Resume queue
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    logger.info(`Queue resumed: ${queueName}`);
  }

  // Get queue stats
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      name: queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  // Get all queues stats
  async getAllQueuesStats(): Promise<any[]> {
    const stats = [];
    for (const [name] of this.queues) {
      stats.push(await this.getQueueStats(name));
    }
    return stats;
  }

  // Add delayed job
  async addDelayedJob(
    queueName: string,
    jobData: JobData,
    delayMs: number
  ): Promise<any> {
    return this.addJob(queueName, jobData, { delay: jobData.delay || delayMs });
  }

  // Add recurring job
  async addRecurringJob(
    queueName: string,
    jobData: JobData,
    pattern: string, // cron pattern
    tz?: string
  ): Promise<any> {
    return this.addJob(queueName, jobData, { repeat: { pattern, tz } });
  }

  // Pause job
  async pauseJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.pause();
    }
  }

  // Resume job
  async resumeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.resume();
    }
  }

  // Get job logs
  async getJobLogs(queueName: string, jobId: string): Promise<string[]> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return [];

    // In a real implementation, you'd fetch logs from a log storage
    return [];
  }

  // Drain queue
  async drainQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.drain();
  }

  // Close queue
  async closeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.close();
      this.queues.delete(queueName);
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Shutting down queue service...');

    for (const [name, worker] of this.workers) {
      await worker.close();
      logger.info(`Worker closed: ${name}`);
    }

    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue closed: ${name}`);
    }

    if (this.redisClient) {
      await this.redisClient.quit();
    }

    logger.info('Queue service shut down complete');
  }
}

export const queueService = new QueueService();
export default queueService;
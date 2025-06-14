import { Queue, Worker, Job, JobsOptions, QueueOptions, WorkerOptions, ConnectionOptions, QueueEvents } from "bullmq";
import { IQueueService, BaseJobData } from "@/lib/queue/queue.interface";

const parseRedisUrlForBullMQ = (url: string): ConnectionOptions => {
  // Early return with dummy values if URL is empty/invalid
  if (!url || url.trim() === "") {
    console.warn("Empty Redis URL provided, using dummy connection config");
    return {
      port: 6379,
      host: "localhost",
      password: "",
    };
  }

  try {
    const redisUrl = new URL(url);
    const isTls = url.startsWith("rediss://");
    return {
      port: parseInt(redisUrl.port) || 6379,
      host: redisUrl.hostname,
      password: redisUrl.password,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
    };
  } catch (_error) {
    console.warn("Invalid Redis URL format, using dummy connection config");
    return {
      port: 6379,
      host: "localhost",
      password: "",
    };
  }
};

export class UpstashQueueService implements IQueueService {
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private connectionOptions: ConnectionOptions;

  constructor(redisUrl: string) {
    this.connectionOptions = parseRedisUrlForBullMQ(redisUrl);
    this.queues = new Map();
    this.workers = new Map();
  }

  private getQueueName(queueName: string): string {
    return `${process.env.NEXT_PUBLIC_APP_ENV}-${queueName}`.toLowerCase();
  }

  getQueue(queueName: string): Queue {
    const fullQueueName = this.getQueueName(queueName);
    if (!this.queues.has(fullQueueName)) {
      const queueOptions: QueueOptions = {
        connection: this.connectionOptions,
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 500,
        },
      };
      const queue = new Queue(fullQueueName, queueOptions);

      const queueEvents = new QueueEvents(fullQueueName, {
        connection: this.connectionOptions,
      });

      queueEvents.on("completed", ({ jobId }) => {
        console.info({ message: `Job ${jobId} completed` });
      });

      queueEvents.on("failed", ({ jobId }, error) => {
        console.error({ message: `Job ${jobId} failed: ${error}` });
      });

      queueEvents.on("active", ({ jobId }) => {
        console.info({ message: `Job ${jobId} is active` });
      });

      queueEvents.on("error", async (error) => {
        console.error({
          message: "Queue error",
          context: {
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });
      });

      queueEvents.on("waiting", ({ jobId }) => {
        console.info({ message: `Job ${jobId} is waiting` });
      });

      queueEvents.on("delayed", ({ jobId }) => {
        console.info({ message: `Job ${jobId} is delayed` });
      });
      
      console.info({ message: `Queue "${fullQueueName}" is ready!` });

      this.queues.set(fullQueueName, queue);
    }
    return this.queues.get(fullQueueName)!;
  }

  async addJob<TData extends BaseJobData>(
    queueName: string,
    job: { name: string; data: TData; options?: JobsOptions }
  ): Promise<string> {
    const queue = this.getQueue(queueName);
    const result = await queue.add(job.name, job.data, {
      ...job.options,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    });
    return result.id!;
  }

  async processJob<TData extends BaseJobData>(
    queueName: string,
    handler: (job: { id?: string; data: TData; log: (message: string) => Promise<void> }) => Promise<unknown>,
    concurrency = 5
  ): Promise<void> {
    const fullQueueName = this.getQueueName(queueName);
    if (this.workers.has(fullQueueName)) {
      console.info({ message: `Handler already registered for queue: ${fullQueueName}` });
      return;
    }

    const workerOptions: WorkerOptions = {
      connection: this.connectionOptions,
      concurrency,
      lockDuration: 30000,
      maxStalledCount: 1,
    };

    const worker = new Worker<TData>(
      fullQueueName,
      async (job: Job<TData>) => {
        try {
          await handler({
            id: job.id,
            data: job.data,
            log: async (message: string) => {
              await job.log(message);
            },
          });
        } catch (error) {
          console.error({
            message: `Error processing job ${job.id}:`,
            context: { error },
          });
          throw error;
        }
      },
      workerOptions
    );

    const gracefulShutdown = async (signal: string) => {
      console.info({ message: `Received ${signal}, shutting down worker...` });
      await worker.close();
      process.exit(0);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    worker.on("error", (error: Error) => {
      if (error.message && error.message.includes("max daily request limit exceeded")) {
        console.warn(`Worker for ${fullQueueName}: Upstash Redis daily limit exceeded.`);
      } else {
        console.error(`Worker for ${fullQueueName} error:`, error);
      }
    });
    
    worker.on("completed", (job) => {
      console.info({ message: `Job ${job.name} completed in queue ${fullQueueName}` });
    });

    worker.on("failed", (job, error) => {
      console.error({
        message: `Job ${job?.name} failed in queue ${fullQueueName}`,
        context: { error }
      });
    });

    this.workers.set(fullQueueName, worker);
    console.log(`Worker started for queue: ${fullQueueName}`);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = (await queue.getJob(jobId)) as Job | undefined;
    if (job) {
      await job.remove();
    } else {
      console.warn(`Job ${jobId} not found in queue ${this.getQueueName(queueName)} for removal.`);
    }
  }

  async close(): Promise<void> {
    await Promise.all(Array.from(this.workers.values()).map((worker) => worker.close()));
    await Promise.all(Array.from(this.queues.values()).map((queue) => queue.close()));
    console.log("BullMQ queues, workers, and Redis connection closed.");
  }
}

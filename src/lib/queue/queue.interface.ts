export interface BaseJobData {
  type: string;
  [key: string]: unknown;
}

export interface QueueJob<TData extends BaseJobData = BaseJobData> {
  id?: string;
  data: TData;
  options?: {
    delay?: number;
    cron?: string;
    timezone?: string;
  };
}

export interface IQueueService {
  addJob<TData extends BaseJobData>(queueName: string, job: QueueJob<TData>): Promise<string>;
  processJob<TData extends BaseJobData>(
    queueName: string,
    handler: (job: { id?: string; data: TData; log: (message: string) => Promise<void> }) => Promise<unknown>,
    concurrency?: number
  ): Promise<void>;
  removeJob(queueName: string, jobId: string): Promise<void>;
  close(): Promise<void>;
}
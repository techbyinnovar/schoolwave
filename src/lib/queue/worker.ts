import { UpstashQueueService } from "./providers/upstash-queue.service";
import * as tasks from './tasks';
import { BaseJobData } from "./queue.interface";

const QUEUE_NAME = "default"; // Or get from env

const service = new UpstashQueueService(process.env.REDIS_URL || "redis://localhost:6379");

const taskHandlers = {
    [tasks.REMINDER_TASK_NAME]: tasks.reminderTask,
    [tasks.SEND_SCHEDULED_MESSAGE_TASK_NAME]: tasks.sendScheduledMessageTask,
};

type TaskName = keyof typeof taskHandlers;

const main = async () => {
    console.log("Starting worker...");

    await service.processJob(QUEUE_NAME, async (job) => {
        const jobData = job.data as BaseJobData & { type: TaskName };
        const handler = taskHandlers[jobData.type];

        if (handler) {
            await job.log(`Processing job ${job.id} of type ${jobData.type}`);
            await handler(job as any); // The `job` shape from processJob matches what tasks expect
            await job.log(`Finished job ${job.id}`);
        } else {
            throw new Error(`No handler found for task type: ${jobData.type}`);
        }
    });

    console.log(`Worker listening to queue: ${QUEUE_NAME}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
}); 
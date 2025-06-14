import { UpstashQueueService } from "./providers/upstash-queue.service";
import { REMINDER_TASK_NAME, ReminderJobData } from "./tasks/reminder";
import { SEND_SCHEDULED_MESSAGE_TASK_NAME, SendScheduledMessageJobData } from "./tasks/send-scheduled-message";

const QUEUE_NAME = "default";

const addTestTasks = async () => {
    console.log("Adding test tasks to the queue...");
    const queueService = new UpstashQueueService(process.env.REDIS_URL || "redis://localhost:6379");

    // --- Add Reminder Task ---
    const reminderData: ReminderJobData = {
        type: REMINDER_TASK_NAME,
        userId: "user-123",
        message: "Don't forget to buy milk!",
        reminderTime: new Date(Date.now() + 2000), // 2 seconds from now
    };

    const reminderJobId = await queueService.addJob(QUEUE_NAME, {
        name: REMINDER_TASK_NAME,
        data: reminderData,
        options: {
            delay: 2000, // 2 seconds
        }
    });
    console.log(`Added reminder job with ID: ${reminderJobId}`);

    // --- Add Send Scheduled Message Task ---
    const scheduledMessageData: SendScheduledMessageJobData = {
        type: SEND_SCHEDULED_MESSAGE_TASK_NAME,
        channelId: "channel-abc",
        message: "This is a scheduled message.",
        sendAt: new Date(Date.now() + 5000), // 5 seconds from now
    };

    const scheduledMessageJobId = await queueService.addJob(QUEUE_NAME, {
        name: SEND_SCHEDULED_MESSAGE_TASK_NAME,
        data: scheduledMessageData,
        options: {
            delay: 5000, // 5 seconds
        }
    });
    console.log(`Added scheduled message job with ID: ${scheduledMessageJobId}`);

    // We need to close the connection for the script to exit.
    await queueService.close();
};

addTestTasks().then(() => {
    console.log("Test tasks added successfully.");
}).catch(console.error); 
import { BaseJobData } from "../queue.interface";

export const SEND_SCHEDULED_MESSAGE_TASK_NAME = "message.scheduled.send";

export interface SendScheduledMessageJobData extends BaseJobData {
  type: typeof SEND_SCHEDULED_MESSAGE_TASK_NAME;
  channelId: string;
  message: string;
  phoneNumber?: string;
  email?: string;
  sendAt: Date;
}

export const sendScheduledMessageTask = async (job: {
  data: SendScheduledMessageJobData;
  log: (message: string) => Promise<void>;
}) => {
  const { channelId, message, sendAt, phoneNumber, email } = job.data;
  await job.log(`Sending scheduled message to channel ${channelId}: "${message}" at ${sendAt} ${phoneNumber ? `and phone number ${phoneNumber}` : ""} ${email ? `and email ${email}` : ""}`);

  // Add message sending service here, but for now we will just log the message

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work

  await job.log("Scheduled message sent successfully.");
};

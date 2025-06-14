import { BaseJobData } from "../queue.interface";

export const REMINDER_TASK_NAME = "user.reminder";

export interface ReminderJobData extends BaseJobData {
  type: typeof REMINDER_TASK_NAME;
  userId: string;
  phoneNumber?: string;
  email?: string;
  message: string;
  reminderTime: Date;
}

export const reminderTask = async (job: { data: ReminderJobData; log: (message: string) => Promise<void> }) => {
  const { userId, message, reminderTime, phoneNumber, email } = job.data;
  await job.log(`Sending reminder to user ${userId}: "${message}" at ${reminderTime} ${phoneNumber ? `and phone number ${phoneNumber}` : ""} ${email ? `and email ${email}` : ""}`);

  //Add main function here for now we will just log the reminder

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work

  await job.log("Reminder sent successfully.");
};

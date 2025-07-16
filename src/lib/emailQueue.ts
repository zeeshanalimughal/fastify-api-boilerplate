import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { EmailService } from "./email";
import { env } from "../config/env";
import type { EmailTemplateKey } from "../constants/emails";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const emailQueue = new Queue("email", { connection });

export async function queueEmail(data: {
  to: string;
  template: EmailTemplateKey;
  variables: Record<string, unknown>;
}) {
  await emailQueue.add("send", data);
}

export const emailWorker = new Worker(
  "email",
  async (
    job: Job<{
      to: string;
      template: EmailTemplateKey;
      variables: Record<string, unknown>;
    }>,
  ) => {
    const { to, template, variables } = job.data;
    const emailService = new EmailService();
    await emailService.sendEmail({ to, template, variables });
    return { sent: true };
  },
  { connection },
);

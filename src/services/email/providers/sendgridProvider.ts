import sgMail from "@sendgrid/mail";
import { z } from "zod";

const sendgridEnvSchema = z.object({
  SENDGRID_API_KEY: z.string(),
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class SendGridProvider {
  constructor(env: NodeJS.ProcessEnv) {
    const cfg = sendgridEnvSchema.parse(env);
    sgMail.setApiKey(cfg.SENDGRID_API_KEY);
  }

  async sendMail(opts: SendMailOptions) {
    await sgMail.send({
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}

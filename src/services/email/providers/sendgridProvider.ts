import sgMail from "@sendgrid/mail";
import { z } from "zod";
import { env } from "../../../config/env";

const sendgridEnvSchema = z.object({
  SENDGRID_API_KEY: z.string(),
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class SendGridProvider {
  constructor(processEnv: NodeJS.ProcessEnv) {
    const cfg = sendgridEnvSchema.parse(processEnv);
    sgMail.setApiKey(cfg.SENDGRID_API_KEY);
  }

  async sendMail(opts: SendMailOptions) {
    const fromEmail = env.EMAIL_FROM || "no-reply@yourapp.com";

    await sgMail.send({
      from: fromEmail,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}

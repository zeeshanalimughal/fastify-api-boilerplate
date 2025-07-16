import nodemailer, { Transporter } from "nodemailer";
import { z } from "zod";
import { env } from "../../../config/env";

const smtpEnvSchema = z.object({
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
});

export type SMTPEnv = z.infer<typeof smtpEnvSchema>;

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class SMTPProvider {
  private transporter: Transporter;

  constructor(processEnv: NodeJS.ProcessEnv) {
    const cfg = smtpEnvSchema.parse(processEnv);
    this.transporter = nodemailer.createTransport({
      host: cfg.SMTP_HOST,
      port: cfg.SMTP_PORT,
      secure: cfg.SMTP_PORT === 465,
      auth: {
        user: cfg.SMTP_USER,
        pass: cfg.SMTP_PASS,
      },
    });
  }

  async sendMail(opts: SendMailOptions) {
    const fromEmail = env.EMAIL_FROM || `"Your App Name" <noreply@yourapp.com>`;

    await this.transporter.sendMail({
      from: fromEmail,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}

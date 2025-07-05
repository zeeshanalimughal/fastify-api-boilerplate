import nodemailer, { Transporter } from "nodemailer";
import { z } from "zod";

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

  constructor(env: NodeJS.ProcessEnv) {
    const cfg = smtpEnvSchema.parse(env);
    this.transporter = nodemailer.createTransport({
      host: cfg.SMTP_HOST,
      port: cfg.SMTP_PORT,
      secure: cfg.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: cfg.SMTP_USER,
        pass: cfg.SMTP_PASS,
      },
    });
  }

  async sendMail(opts: SendMailOptions) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || `"No Reply" <noreply@${process.env.DOMAIN || "example.com"}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}

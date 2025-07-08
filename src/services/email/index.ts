import path from "path";
import ejs from "ejs";
import fs from "fs";
import { z } from "zod";
import { EmailSubjects, EmailTemplates, EmailTemplateKey } from "../../constants/emails";
import { SMTPProvider } from "./providers/smtpProvider";
import { SendGridProvider } from "./providers/sendgridProvider";
import { env } from "../../config/env";

interface SendEmailInput {
  to: string;
  template: EmailTemplateKey;
  variables: Record<string, any>;
}

const providerSchema = z.enum(["smtp", "sendgrid"]);

type ProviderType = z.infer<typeof providerSchema>;

export class EmailService {
  private provider: SMTPProvider | SendGridProvider;
  private rootDir: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      this.rootDir = path.join(__dirname, "..", "..", "views", "templates");
    } else {
      this.rootDir = path.join(__dirname, "..", "..", "views", "templates");
    }

    if (!fs.existsSync(this.rootDir)) {
      throw new Error(`Email templates directory not found: ${this.rootDir}`);
    }

    console.log(`Using email templates from: ${this.rootDir}`);

    const provider = providerSchema.parse(env.EMAIL_PROVIDER) as ProviderType;
    if (provider === "sendgrid") {
      this.provider = new SendGridProvider(process.env);
    } else {
      this.provider = new SMTPProvider(process.env);
    }
  }

  private async renderTemplate(template: EmailTemplateKey, variables: Record<string, any>) {
    const filePath = path.join(this.rootDir, EmailTemplates[template]);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Email template not found: ${filePath}`);
    }

    return await ejs.renderFile(filePath, variables, { async: false });
  }

  async sendEmail({ to, template, variables }: SendEmailInput) {
    try {
      const html = await this.renderTemplate(template, variables);
      const subjectKey = template as keyof typeof EmailSubjects;
      const subject = EmailSubjects[subjectKey];
      await this.provider.sendMail({ to, subject, html });
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

import path from "path";
import ejs from "ejs";
import { z } from "zod";
import { EmailSubjects, EmailTemplates, EmailTemplateKey } from "../../constants/emails";
import { SMTPProvider } from "./providers/smtpProvider";
import { SendGridProvider } from "./providers/sendgridProvider";

interface SendEmailInput {
  to: string;
  template: EmailTemplateKey;
  variables: Record<string, any>;
}

const providerSchema = z.enum(["smtp", "sendgrid"]);

type ProviderType = z.infer<typeof providerSchema>;

export class EmailService {
  private provider: SMTPProvider | SendGridProvider;

  constructor(private rootDir = path.join(process.cwd(), "src", "emails", "templates")) {
    const provider = providerSchema.parse(process.env.EMAIL_PROVIDER || "smtp") as ProviderType;
    if (provider === "sendgrid") {
      this.provider = new SendGridProvider(process.env);
    } else {
      this.provider = new SMTPProvider(process.env);
    }
  }

  private async renderTemplate(template: EmailTemplateKey, variables: Record<string, any>) {
    const filePath = path.join(this.rootDir, EmailTemplates[template]);
    return ejs.renderFile(filePath, variables, { async: true });
  }

  async sendEmail({ to, template, variables }: SendEmailInput) {
    const html = await this.renderTemplate(template, variables);
    const subjectKey = template as keyof typeof EmailSubjects;
    const subject = EmailSubjects[subjectKey];
    await this.provider.sendMail({ to, subject, html });
  }
}

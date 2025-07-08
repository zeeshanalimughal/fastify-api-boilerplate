export const EmailSubjects = {
  WELCOME: "Welcome to Our App!",
  VERIFY_EMAIL: "Verify Your Email Address",
  FORGOT_PASSWORD: "Reset Your Password",
  RESET_PASSWORD: "Your Password Has Been Reset",
  PASSWORD_CHANGED: "Your Password Was Changed",
  EMAIL_VERIFIED: "Email Verified Successfully",
} as const;

export type EmailSubjectKey = keyof typeof EmailSubjects;

export const EmailTemplates = {
  WELCOME: "welcome.ejs",
  VERIFY_EMAIL: "verify-email.ejs",
  FORGOT_PASSWORD: "forgot-password.ejs",
  RESET_PASSWORD: "reset-password.ejs",
  PASSWORD_CHANGED: "password-changed.ejs",
  EMAIL_VERIFIED: "email-verified.ejs",
} as const;

export type EmailTemplateKey = keyof typeof EmailTemplates;

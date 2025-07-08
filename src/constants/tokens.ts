export const TokenTypes = {
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_RESET: "password_reset",
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export const TokenExpirations = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
} as const;

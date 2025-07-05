export const TokenTypes = {
  EMAIL_VERIFICATION: "emailVerification",
  PASSWORD_RESET: "passwordReset",
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

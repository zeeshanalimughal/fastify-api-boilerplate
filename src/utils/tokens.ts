import crypto from "crypto";
import { TokenType, TokenExpirations, TokenTypes } from "../constants/tokens";

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateVerificationToken(): string {
  return generateSecureToken();
}

export function generatePasswordResetToken(): string {
  return generateSecureToken();
}

export function getTokenExpiration(type: TokenType): Date {
  const expiration =
    type === TokenTypes.EMAIL_VERIFICATION
      ? TokenExpirations.EMAIL_VERIFICATION
      : TokenExpirations.PASSWORD_RESET;
  return new Date(Date.now() + expiration);
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

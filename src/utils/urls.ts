import { env } from "../config/env";

export function getBaseUrl(): string {
  return env.BASE_URL || `http://localhost:${env.PORT}`;
}

export function generateVerificationUrl(token: string): string {
  return `${getBaseUrl()}/auth/verify-email/${token}`;
}

export function generatePasswordResetUrl(token: string): string {
  return `${getBaseUrl()}/auth/reset-password/${token}`;
}

export function generateFrontendUrl(path: string): string {
  const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}${path}`;
}

export function generateFrontendVerificationUrl(token: string): string {
  return generateFrontendUrl(`/verify-email?token=${token}`);
}

export function generateFrontendPasswordResetUrl(token: string): string {
  return generateFrontendUrl(`/reset-password?token=${token}`);
}

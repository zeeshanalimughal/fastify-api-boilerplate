import jwt from "jsonwebtoken";
import { env } from "../config/env";

const accessSecret = env.JWT_ACCESS_SECRET;
const refreshSecret = env.JWT_REFRESH_SECRET;

export function generateAccessToken(payload: object) {
  // `expiresIn` expects a specific template-literal string (e.g. "15m", "7d") or a number. Since
  // our value comes from an environment variable and TypeScript cannot verify its literal shape
  // at compile-time, we cast it to the accepted type to satisfy the overload resolution.
  return jwt.sign(payload, accessSecret, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken<T>(token: string): T {
  return jwt.verify(token, accessSecret) as T;
}

export function verifyRefreshToken<T>(token: string): T {
  return jwt.verify(token, refreshSecret) as T;
}

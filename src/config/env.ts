import { z } from "zod";
import dotenv from "dotenv";
import { join } from "path";

const NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config({ path: join(process.cwd(), `.env.${NODE_ENV}`) });

dotenv.config();

const envSchema = z.object({
  APP_NAME: z.string().default("Your App Name"),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url(),

  // Base URLs
  BASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),

  // Email configuration
  EMAIL_PROVIDER: z.enum(["smtp", "sendgrid"]).default("smtp"),
  EMAIL_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  REDIS_URL: z.string().url(),

  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
});

export const env = envSchema.parse(process.env);

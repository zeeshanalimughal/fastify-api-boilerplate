import { z } from "zod";
import dotenv from "dotenv";
import { join } from "path";

const NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config({ path: join(process.cwd(), `.env.${NODE_ENV}`) });

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

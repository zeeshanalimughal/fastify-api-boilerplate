import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./src/api/entities/**/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
};

export default config;

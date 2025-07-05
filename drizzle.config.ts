import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./src/entities/**/*.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string,
  },
};

export default config;

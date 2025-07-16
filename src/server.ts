import { createApp } from "./app";
import { logger } from "./lib/logger";
import colors from "colors/safe";
import { pool } from "./db/connection";
import { emailQueue, emailWorker } from "./lib/emailQueue";

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

let shuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    await pool.end();
    logger.info("Database pool closed.");
    await emailQueue.close();
    await emailWorker.close();
    logger.info("Email queue and worker closed.");
  } catch (err) {
    logger.error("Error during graceful shutdown:", err);
  } finally {
    process.exit(0);
  }
}
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

(async () => {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  try {
    await app.listen({ port, host });
    const addressInfo = app.server.address();
    let displayHost = host;
    let displayPort = port;
    if (addressInfo && typeof addressInfo === "object") {
      displayHost = addressInfo.address === "::" ? "localhost" : addressInfo.address;
      displayPort = addressInfo.port;
    }
    const apiUrl = `http://${displayHost}:${displayPort}/api/v1`;
    const docsUrl = `http://${displayHost}:${displayPort}/docs`;
    const healthUrl = `http://${displayHost}:${displayPort}/health`;
    const env = process.env.NODE_ENV || "development";

    const plainLines = [
      " Server started successfully! ",
      "",
      " API:           " + apiUrl,
      " Swagger Docs:  " + docsUrl,
      " Health Check:  " + healthUrl,
      "",
      " Environment:   " + env,
    ];
    const maxLength = Math.max(...plainLines.map((line) => line.length));
    const horizontal = "-".repeat(maxLength + 2);
    const top = `+${horizontal}+`;
    const bottom = `+${horizontal}+`;

    const coloredLines = [
      colors.bold(colors.green(plainLines[0].padEnd(maxLength))),
      "".padEnd(maxLength),
      colors.yellow(" API:           ") +
        colors.cyan(apiUrl.padEnd(maxLength - " API:           ".length)),
      colors.yellow(" Swagger Docs:  ") +
        colors.cyan(docsUrl.padEnd(maxLength - " Swagger Docs:  ".length)),
      colors.yellow(" Health Check:  ") +
        colors.cyan(healthUrl.padEnd(maxLength - " Health Check:  ".length)),
      "".padEnd(maxLength),
      colors.yellow(" Environment:   ") +
        colors.magenta(env.padEnd(maxLength - " Environment:   ".length)),
    ];

    const box = [top, ...coloredLines.map((line) => `| ${line} |`), bottom].join("\n");
    logger.info("\n" + box);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();

import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors, json } = format;

const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "currentPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
];

function redactSensitive(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(redactSensitive);
  if (obj && typeof obj === "object") {
    const clone = { ...(obj as Record<string, unknown>) };
    for (const key of Object.keys(clone)) {
      if (SENSITIVE_FIELDS.includes(key)) {
        clone[key] = "[REDACTED]";
      } else if (typeof clone[key] === "object") {
        clone[key] = redactSensitive(clone[key]);
      }
    }
    return clone;
  }
  return obj;
}

const env = process.env.NODE_ENV || "development";

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ..._meta }) => {
    let msg = message;
    if (typeof msg === "object") {
      msg = JSON.stringify(redactSensitive(msg));
    }
    return `${timestamp} [${level}]: ${stack || msg}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
  format((info) => {
    if (typeof info.message === "object") {
      info.message = redactSensitive(info.message);
    }
    return info;
  })(),
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || (env === "production" ? "info" : "debug"),
  format: env === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

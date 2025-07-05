import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyCors from "@fastify/cors";

export const buildServer = () => {
  const server = Fastify({
    logger: true,
  });

  server.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: "object",
      required: ["PORT", "DATABASE_URL"],
      properties: {
        PORT: {
          type: "string",
          default: "3000",
        },
        DATABASE_URL: {
          type: "string",
        },
      },
    },
  });

  server.register(fastifyCors, { origin: true });
  return server;
};

import Fastify from "fastify";
import fastifyEnv from "@fastify/env";

export const buildServer = () => {
  const server = Fastify({
    logger: false,
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

  return server;
};

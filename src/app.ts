import { buildServer } from "./config/index";
import fastifySwagger from "@fastify/swagger";
import { userRoutes } from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import jwt from "@fastify/jwt";
import { env } from "./config/env";

export const createApp = async () => {
  const server = buildServer();

  // JWT plugin
  await server.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Docs",
        version: "1.0.0",
      },
    },
    hideUntagged: true,
  });

  await server.register(userRoutes, { prefix: "/api" });
  await server.register(authRoutes, { prefix: "/auth" });

  server.get("/", async () => ({ message: "Welcome to API" }));

  server.get("/health", async () => ({ status: "ok" }));
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({ message: error.message || "Internal Server Error" });
  });

  return server;
};

import { buildServer } from "./config/index";
import fastifySwagger from "@fastify/swagger";
import { userRoutes } from "./routes/userRoutes";

export const createApp = async () => {
  const server = buildServer();

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

  server.get("/", async () => ({ message: "Welcome to API" }));

  server.get("/health", async () => ({ status: "ok" }));
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({ message: error.message || "Internal Server Error" });
  });

  return server;
};

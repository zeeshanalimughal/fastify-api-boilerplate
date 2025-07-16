import { buildServer } from "./config/index";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { userRoutes } from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";
import jwt from "@fastify/jwt";
import { env } from "./config/env";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { errorHandler } from "./middleware/errorMiddleware";

export const createApp = async () => {
  const server = buildServer();

  // Security middleware
  await server.register(fastifyHelmet);
  await server.register(fastifyCors, { origin: true });
  await server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // JWT plugin
  await server.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  // Swagger documentation
  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Backend API Documentation",
        description: "Fastify + Drizzle + PostgreSQL backend following Clean Architecture",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "support@example.com",
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT || 3000}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    hideUntagged: true,
    transform: ({ schema, url }) => {
      return {
        schema: {
          ...schema,
          tags: schema.tags || [],
        },
        url,
      };
    },
  });

  // Swagger UI
  await server.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  await server.register(userRoutes, { prefix: "/api/v1/users" });
  await server.register(authRoutes, { prefix: "/api/v1/auth" });

  // Health check endpoint
  server.get(
    "/",
    {
      schema: {
        tags: ["Health"],
        summary: "API Welcome",
        description: "Welcome message for the API",
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({ message: "Welcome to Backend API" }),
  );

  // Health check endpoint
  server.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health Check",
        description: "Check if the API is running",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  );
  server.setErrorHandler(errorHandler);

  return server;
};

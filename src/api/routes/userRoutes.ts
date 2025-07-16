import { FastifyInstance } from "fastify";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { createUserSchema, updateUserSchema } from "../validators/userSchema";
import { zodToSwaggerSchema, commonResponses, userResponseSchema } from "../../utils/swagger";
import { requireAuth, requireRole } from "../../middleware/authMiddleware";

export async function userRoutes(server: FastifyInstance) {
  // Create user (Admin only)
  server.post(
    "/users",
    {
      preHandler: [requireRole("admin")],
      schema: {
        tags: ["Users"],
        summary: "Create a new user",
        description: "Create a new user with name, email, and password (Admin only)",
        security: [{ BearerAuth: [] }],
        body: zodToSwaggerSchema(createUserSchema),
        response: {
          201: userResponseSchema,
          400: commonResponses[400],
          401: commonResponses[401],
          403: {
            description: "Forbidden - Admin access required",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: commonResponses[500],
        },
      },
    },
    createUser,
  );

  // Get all users (Admin only)
  server.get(
    "/users",
    {
      preHandler: [requireRole("admin")],
      schema: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Retrieve a list of all users (Admin only)",
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: userResponseSchema,
          },
          401: commonResponses[401],
          403: {
            description: "Forbidden - Admin access required",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: commonResponses[500],
        },
      },
    },
    getUsers,
  );

  // Get current user profile
  server.get(
    "/users/me",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Users"],
        summary: "Get current user profile",
        description: "Get the authenticated user's profile information",
        security: [{ BearerAuth: [] }],
        response: {
          200: userResponseSchema,
          401: commonResponses[401],
          500: commonResponses[500],
        },
      },
    },
    async (request, reply) => {
      const user = (request as unknown as { user: { id: number } }).user;
      return getUserById({ ...request, params: { id: user.id.toString() } }, reply);
    },
  );

  // Get user by ID (Admin only)
  server.get(
    "/users/:id",
    {
      preHandler: [requireRole("admin")],
      schema: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Retrieve a specific user by their ID (Admin only)",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID" },
          },
          required: ["id"],
        },
        response: {
          200: userResponseSchema,
          401: commonResponses[401],
          403: {
            description: "Forbidden - Admin access required",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return getUserById({ ...request, params: { id } }, reply);
    },
  );

  // Update current user profile
  server.put(
    "/users/me",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Users"],
        summary: "Update current user profile",
        description: "Update the authenticated user's profile information",
        security: [{ BearerAuth: [] }],
        body: zodToSwaggerSchema(updateUserSchema),
        response: {
          200: userResponseSchema,
          400: commonResponses[400],
          401: commonResponses[401],
          500: commonResponses[500],
        },
      },
    },
    async (request, reply) => {
      const user = (request as unknown as { user: { id: number } }).user;
      return updateUser({ ...request, params: { id: user.id.toString() } }, reply);
    },
  );

  // Update user (Admin only)
  server.put(
    "/users/:id",
    {
      preHandler: [requireRole("admin")],
      schema: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update a user's information (Admin only)",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID" },
          },
          required: ["id"],
        },
        body: zodToSwaggerSchema(updateUserSchema),
        response: {
          200: userResponseSchema,
          400: commonResponses[400],
          401: commonResponses[401],
          403: {
            description: "Forbidden - Admin access required",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return updateUser({ ...request, params: { id } }, reply);
    },
  );

  // Delete user (Admin only)
  server.delete(
    "/users/:id",
    {
      preHandler: [requireRole("admin")],
      schema: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user by their ID (Admin only)",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID" },
          },
          required: ["id"],
        },
        response: {
          204: {
            description: "User deleted successfully",
            type: "null",
          },
          401: commonResponses[401],
          403: {
            description: "Forbidden - Admin access required",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    async (request, reply) => {
      // Forward the correct params shape to deleteUser
      const { id } = request.params as { id: string };
      return deleteUser({ ...request, params: { id } }, reply);
    },
  );
}

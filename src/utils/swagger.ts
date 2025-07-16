import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Convert Zod schema to JSON schema for Swagger/OpenAPI
 */
export function zodToSwaggerSchema(schema: z.ZodType<unknown, z.ZodTypeDef, unknown>) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: "openApi3",
    definitions: {},
    errorMessages: false,
  });

  const cleanSchema = JSON.parse(JSON.stringify(jsonSchema));
  delete cleanSchema.$schema;

  function cleanRefs(obj: unknown): unknown {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(cleanRefs);
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "$ref") continue;
      result[key] = cleanRefs(value);
    }
    return result;
  }

  return cleanRefs(cleanSchema);
}

/**
 * Common response schemas for API documentation
 */
export const commonResponses = {
  400: {
    description: "Bad Request",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
  401: {
    description: "Unauthorized",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
  403: {
    description: "Forbidden",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
  404: {
    description: "Not Found",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
  500: {
    description: "Internal Server Error",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
};

/**
 * User response schema
 */
export const userResponseSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    role: { type: "string" },
    emailVerified: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

/**
 * Auth response schema
 */
export const authResponseSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    refreshToken: { type: "string" },
    expiresIn: { type: "number", description: "Token expiration time in seconds" },
    user: userResponseSchema,
  },
};

/**
 * Success message schema
 */
export const successMessageSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
};

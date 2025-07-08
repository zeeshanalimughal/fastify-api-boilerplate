import { FastifyInstance } from "fastify";
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/authSchema";
import {
  zodToSwaggerSchema,
  commonResponses,
  authResponseSchema,
  successMessageSchema,
} from "../utils/swagger";

export default async function authRoutes(server: FastifyInstance) {
  // Register
  server.post(
    "/register",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: "Create a new user account with email verification",
        body: zodToSwaggerSchema(registerSchema),
        response: {
          201: successMessageSchema,
          400: commonResponses[400],
          500: commonResponses[500],
        },
      },
    },
    register,
  );

  // Login
  server.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticate user and return access token",
        body: zodToSwaggerSchema(loginSchema),
        response: {
          200: authResponseSchema,
          400: commonResponses[400],
          401: commonResponses[401],
          500: commonResponses[500],
        },
      },
    },
    login,
  );

  // Logout
  server.post(
    "/logout",
    {
      schema: {
        tags: ["Authentication"],
        summary: "User logout",
        description: "Logout user and invalidate refresh token",
        security: [{ BearerAuth: [] }],
        response: {
          200: successMessageSchema,
          401: commonResponses[401],
          500: commonResponses[500],
        },
      },
    },
    logout,
  );

  // Refresh token
  server.post(
    "/refresh",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description: "Get a new access token using refresh token",
        body: zodToSwaggerSchema(refreshTokenSchema),
        response: {
          200: {
            type: "object",
            properties: {
              accessToken: { type: "string" },
            },
          },
          400: commonResponses[400],
          401: commonResponses[401],
          500: commonResponses[500],
        },
      },
    },
    refresh,
  );

  // Email verification
  server.get(
    "/verify-email/:token",
    {
      schema: {
        tags: ["Email Verification"],
        summary: "Verify email address",
        description: "Verify user's email address using verification token",
        params: {
          type: "object",
          properties: {
            token: { type: "string", description: "Email verification token" },
          },
          required: ["token"],
        },
        response: {
          200: successMessageSchema,
          400: commonResponses[400],
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    verifyEmail,
  );

  // Resend verification email
  server.post(
    "/verify-email",
    {
      schema: {
        tags: ["Email Verification"],
        summary: "Resend verification email",
        description: "Resend email verification link to user's email",
        body: zodToSwaggerSchema(verifyEmailSchema),
        response: {
          200: successMessageSchema,
          400: commonResponses[400],
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    resendVerificationEmail,
  );

  // Forgot password
  server.post(
    "/forgot-password",
    {
      schema: {
        tags: ["Password Reset"],
        summary: "Request password reset",
        description: "Send password reset email to user",
        body: zodToSwaggerSchema(forgotPasswordSchema),
        response: {
          200: successMessageSchema,
          400: commonResponses[400],
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    forgotPassword,
  );

  // Reset password
  server.post(
    "/reset-password/:token",
    {
      schema: {
        tags: ["Password Reset"],
        summary: "Reset password",
        description: "Reset user's password using reset token",
        params: {
          type: "object",
          properties: {
            token: { type: "string", description: "Password reset token" },
          },
          required: ["token"],
        },
        body: zodToSwaggerSchema(resetPasswordSchema),
        response: {
          200: successMessageSchema,
          400: commonResponses[400],
          404: commonResponses[404],
          500: commonResponses[500],
        },
      },
    },
    resetPassword,
  );
}

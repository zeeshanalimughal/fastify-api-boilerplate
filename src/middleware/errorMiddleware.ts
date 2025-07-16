import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { HttpException } from "../exceptions/HttpException";
import { ForbiddenException } from "../exceptions/ForbiddenException";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (
    (error as unknown as { code: number }).code === 11000 ||
    ((error as unknown as { name: string }).name === "MongoServerError" &&
      (error as unknown as { message: string }).message?.includes("duplicate key"))
  ) {
    reply.status(409).send({
      success: false,
      statusCode: 409,
      error: "Conflict",
      message: "Duplicate key error: a record with this value already exists.",
      details: (error as unknown as { keyValue: Record<string, unknown> }).keyValue || undefined,
    });
  } else if (error instanceof ForbiddenException) {
    reply.status(403).send({
      success: false,
      statusCode: 403,
      error: error.name,
      message: error.response,
    });
  } else if (error instanceof HttpException) {
    reply.status(error.status).send({
      success: false,
      statusCode: error.status,
      error: error.name,
      message: error.response,
    });
  } else if ((error as unknown as { validation: unknown }).validation) {
    reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
      details: (error as unknown as { validation: unknown }).validation,
    });
  } else {
    reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
      message: error.message || "Something went wrong",
    });
  }
}

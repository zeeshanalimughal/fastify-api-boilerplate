import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/authSchema";
import { Errors } from "../constants/errors";

const service = new AuthService();

export async function register(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await service.register(input);
    reply.code(201).send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function login(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = loginSchema.parse(req.body);
    const tokens = await service.login(input);
    reply.send(tokens);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await service.refresh(refreshToken);
    reply.send(tokens);
  } catch (e: any) {
    req.log.error(e);
    reply.code(401).send({ message: e.message || Errors.TOKEN_INVALID });
  }
}

export async function verifyEmail(
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) {
  try {
    const { token } = req.params;
    const result = await service.verifyEmail(token);
    reply.send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.VERIFICATION_TOKEN_INVALID });
  }
}

export async function resendVerificationEmail(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = verifyEmailSchema.parse(req.body);
    const result = await service.resendVerificationEmail(input);
    reply.send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function forgotPassword(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(input);
    reply.send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function resetPassword(
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) {
  try {
    const { token } = req.params;
    const input = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(token, input);
    reply.send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || Errors.RESET_TOKEN_INVALID });
  }
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await service.logout(refreshToken);
    reply.send(result);
  } catch (e: any) {
    req.log.error(e);
    reply.code(400).send({ message: e.message || "Logout failed" });
  }
}

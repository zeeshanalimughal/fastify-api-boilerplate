import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validators/authSchema";
import { Errors } from "../../constants/errors";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { UnauthorizedException } from "../../exceptions/UnauthorizedException";

const service = new AuthService();

export async function register(req: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await service.register(input);
    reply.code(201).send(result);
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || Errors.UNAUTHORIZED);
  }
}

export async function login(req: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
  try {
    const input = loginSchema.parse(req.body);
    const tokens = await service.login(input);
    reply.send(tokens);
  } catch (e: unknown) {
    req.log.error(e);
    throw new UnauthorizedException((e as Error).message || Errors.UNAUTHORIZED);
  }
}

export async function refresh(
  req: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply,
) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await service.refresh(refreshToken);
    reply.send(tokens);
  } catch (e: unknown) {
    req.log.error(e);
    throw new UnauthorizedException((e as Error).message || Errors.TOKEN_INVALID);
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
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || Errors.VERIFICATION_TOKEN_INVALID);
  }
}

export async function resendVerificationEmail(
  req: FastifyRequest<{ Body: VerifyEmailInput }>,
  reply: FastifyReply,
) {
  try {
    const input = verifyEmailSchema.parse(req.body);
    const result = await service.resendVerificationEmail(input);
    reply.send(result);
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || Errors.UNAUTHORIZED);
  }
}

export async function forgotPassword(
  req: FastifyRequest<{ Body: ForgotPasswordInput }>,
  reply: FastifyReply,
) {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(input);
    reply.send(result);
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || Errors.UNAUTHORIZED);
  }
}

export async function resetPassword(
  req: FastifyRequest<{ Params: { token: string }; Body: ResetPasswordInput }>,
  reply: FastifyReply,
) {
  try {
    const { token } = req.params;
    const input = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(token, input);
    reply.send(result);
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || Errors.RESET_TOKEN_INVALID);
  }
}

export async function logout(
  req: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply,
) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await service.logout(refreshToken);
    reply.send(result);
  } catch (e: unknown) {
    req.log.error(e);
    throw new BadRequestException((e as Error).message || "Logout failed");
  }
}

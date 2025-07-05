import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService";
import { registerSchema, loginSchema } from "../validators/authSchema";
import { Errors } from "../constants/errors";

const service = new AuthService();

export async function register(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = registerSchema.parse(req.body);
    const tokens = await service.register(input);
    reply.code(201).send(tokens);
  } catch (e: any) {
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function login(req: FastifyRequest, reply: FastifyReply) {
  try {
    const input = loginSchema.parse(req.body);
    const tokens = await service.login(input);
    reply.send(tokens);
  } catch (e: any) {
    reply.code(400).send({ message: e.message || Errors.UNAUTHORIZED });
  }
}

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { refreshToken } = req.body as any;
    const tokens = await service.refresh(refreshToken);
    reply.send(tokens);
  } catch (e: any) {
    reply.code(401).send({ message: e.message || Errors.TOKEN_INVALID });
  }
}

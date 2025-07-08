import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { Errors } from "../constants/errors";
import { UserRepository } from "../repositories/userRepository";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.code(401).send({ message: Errors.UNAUTHORIZED });
    }

    const token = auth.split(" ")[1];
    const payload = verifyAccessToken<{ sub: number; role: string }>(token);

    (req as any).user = { id: payload.sub, role: payload.role };
  } catch (error) {
    req.log.error("Authentication error:", error);
    return reply.code(401).send({ message: Errors.UNAUTHORIZED });
  }
}

export function requireRole(role: string) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    await requireAuth(req, reply);

    if (reply.sent) return;

    const user = (req as any).user;
    if (!user || user.role !== role) {
      return reply.code(403).send({ message: Errors.FORBIDDEN });
    }
  };
}

export async function requireEmailVerification(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply);

  if (reply.sent) return;

  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return reply.code(401).send({ message: Errors.UNAUTHORIZED });
    }

    const userRepository = new UserRepository();
    const dbUser = await userRepository.findById(user.id);

    if (!dbUser) {
      return reply.code(401).send({ message: Errors.USER_NOT_FOUND });
    }

    if (!dbUser.emailVerified) {
      return reply.code(403).send({ message: Errors.EMAIL_NOT_VERIFIED });
    }
  } catch (error) {
    req.log.error("Email verification check error:", error);
    return reply.code(500).send({ message: "Internal server error" });
  }
}

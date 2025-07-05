import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { Errors } from "../constants/errors";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) throw new Error();
    const token = auth.split(" ")[1];
    const payload = verifyAccessToken<{ sub: number; role: string }>(token);
    (req as any).user = { id: payload.sub, role: payload.role };
  } catch {
    reply.code(401).send({ message: Errors.UNAUTHORIZED });
  }
}

export function requireRole(role: string) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    await requireAuth(req, reply);
    if ((req as any).user?.role !== role) {
      reply.code(403).send({ message: Errors.FORBIDDEN });
    }
  };
}

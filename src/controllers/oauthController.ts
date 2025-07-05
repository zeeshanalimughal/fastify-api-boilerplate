import { FastifyReply, FastifyRequest } from "fastify";

export async function oauthCallback(req: FastifyRequest, reply: FastifyReply) {
  const tokens = (req.user || {}) as any;
  if (!tokens || !tokens.accessToken) {
    return reply.code(400).send({ message: "OAuth flow failed" });
  }
  return reply.send(tokens);
}

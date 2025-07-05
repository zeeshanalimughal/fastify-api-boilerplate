import { FastifyInstance } from "fastify";
import { register, login, refresh } from "../controllers/authController";

export default async function authRoutes(server: FastifyInstance) {
  server.post("/register", register);
  server.post("/login", login);
  server.post("/refresh", refresh);
}

import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { oauthCallback } from "../controllers/oauthController";

export default async function oauthRoutes(server: FastifyInstance) {
  server.get("/oauth/google", { preValidation: fastifyPassport.authenticate("google", { scope: ["email", "profile"] }) }, async () => {});

  server.get("/oauth/github", { preValidation: fastifyPassport.authenticate("github", { scope: ["user:email"] }) }, async () => {});

  server.get(
    "/oauth/:provider/callback",
    {
      preValidation: fastifyPassport.authenticate(["google", "github"], { session: false }),
    },
    oauthCallback,
  );
}

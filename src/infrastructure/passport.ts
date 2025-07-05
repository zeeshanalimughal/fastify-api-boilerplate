import fp from "fastify-plugin";
import fastifyPassport from "@fastify/passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import { OAuthService } from "../services/oauthService";
import { FastifyInstance } from "fastify";
import { env } from "../config/env";

export default fp(async function (server: FastifyInstance) {
  const oauthService = new OAuthService();

  await server.register(fastifyPassport.initialize());

  fastifyPassport.registerUserSerializer(async (user: any, _request) => user);
  fastifyPassport.registerUserDeserializer(async (user: any, _request) => user);

  // Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    fastifyPassport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/oauth/google/callback",
        },
        async function (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) {
          try {
            const tokens = await oauthService.loginOrRegister("google", profile.id, {
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
            });
            return done(null, tokens);
          } catch (e) {
            done(e as any);
          }
        },
      ),
    );
  }

  // GitHub
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    fastifyPassport.use(
      "github",
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "/auth/oauth/github/callback",
        },
        async function (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) {
          try {
            const email = (profile.emails && profile.emails[0]?.value) || undefined;
            const tokens = await oauthService.loginOrRegister("github", profile.id, {
              email,
              name: profile.displayName || profile.username,
            });
            return done(null, tokens);
          } catch (e) {
            done(e as any);
          }
        },
      ),
    );
  }
});

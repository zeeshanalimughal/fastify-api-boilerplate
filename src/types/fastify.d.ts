import "fastify";

// Augment the FastifyInstance type so that TypeScript is aware of the
// `config` object that @fastify/env decorates onto the Fastify instance.
// Keep this file in a path that is picked up by the TypeScript compiler
// (anything inside the `include` array of tsconfig.json).

declare module "fastify" {
  interface FastifyInstance {
    /**
     * Environment variables loaded by the `@fastify/env` plugin.
     */
    config: {
      PORT: string;
      DATABASE_URL: string;
      // Add any additional env variables here as you grow the schema
    };
  }
}

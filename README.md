# Fastify + Drizzle ORM Boilerplate

A clean-architecture backend starter built with **Fastify**, **PostgreSQL**, and **Drizzle ORM**.  
It ships with linting / formatting, Docker-first workflows, migrations, health checks, Swagger docs, and a modular folder layout that scales.

---


## Project Structure

```
src/
  app.ts             Fastify plugin registration & routes
  server.ts          Entrypoint
  config/            env loader & server builder
  entities/          DB schemas (Drizzle)
  repositories/      Data access layer
  services/          Business logic
  controllers/       HTTP handlers
  routes/            Route definitions
  validators/        Zod schemas
  infrastructure/    External integrations (DB)
```

---

## Getting Started (without Docker)

1. **Install deps**

   ```bash
   yarn install
   ```

2. **Create env file** – copy `.env.example` (or create `.env.development`) and adjust:

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/app_db
   PORT=3000
   ```

3. **Run migrations & start dev server**

   ```bash
   # one-off
   yarn migrate

   # start with reload
   yarn dev
   ```

4. Open `http://localhost:3000/health` or Swagger docs at `http://localhost:3000/documentation` (if enabled).

---

## Docker

```bash
# Build & start db + backend
docker compose up --build
```
The compose file spins up PostgreSQL and the API container, automatically waiting for the DB before boot.

---

## Scripts

| Script          | Description                                  |
| --------------- | -------------------------------------------- |
| `yarn dev`      | Run dev server with hot reload & migrations  |
| `yarn build`    | Compile TypeScript → `dist/`                 |
| `yarn start`    | Start compiled server                        |
| `yarn migrate`  | Apply migrations via drizzle-kit             |
| `yarn lint`     | ESLint all `.ts` files                       |
| `yarn format`   | Prettier write in `src/**/*.ts`              |

---
# Node.js Fastify Api Boilerplate

A clean and modern REST API boilerplate built with **Fastify**, **Drizzle ORM**, and **PostgreSQL**.

## ✨ Features

- 🔐 **JWT Authentication** with refresh tokens
- 📧 **Email verification** and password reset
- 🛡️ **Protected routes** with role-based access
- 📖 **Swagger API documentation**
- 🎨 **Professional email templates**
- 📝 **TypeScript** with Zod validation
- 🛠️ **Development tools**: Prettier, ESLint, Husky
- 📦 **Modular structure** following Clean Architecture
- 🐳 **Docker support**

## 🚀 Quick Start

1. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and email settings
   ```

2. **Install and run**
   ```bash
   yarn install
   yarn dev
   ```

3. **Access the app**
   - API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/docs`
   - Health Check: `http://localhost:3000/health`


## 🛠️ Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn migrate` - Run database migrations
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## 🔧 Git Hooks (Husky)

This project uses Husky for Git hooks to ensure code quality:

- **Pre-commit**: Runs linting (`yarn lint`) and formatting (`yarn format`)
- **Pre-push**: Runs build (`yarn build`) to ensure code compiles

Git hooks are automatically installed when you run `yarn install`.

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user

### Email Verification
- `GET /auth/verify-email/:token` - Verify email
- `POST /auth/verify-email` - Resend verification

### Password Reset
- `POST /auth/forgot-password` - Request reset
- `POST /auth/reset-password/:token` - Reset password

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🏗️ Project Structure

```
src/
├── config/          # Environment & server config
├── controllers/     # Route handlers
├── entities/        # Database schemas
├── middleware/      # Auth & validation middleware
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
├── validators/      # Input validation
└── views/           # Email templates
```

## 🐳 Docker

```bash
docker-compose up -d
```
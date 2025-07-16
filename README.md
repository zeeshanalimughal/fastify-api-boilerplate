# Node.js Fastify API Boilerplate

A robust, production-ready REST API boilerplate built with **Fastify**, **Drizzle ORM**, and **PostgreSQL**. Designed for scalability, type safety, and modern best practices.

## ✨ Features

- 🔐 **JWT Authentication** with refresh tokens
- 📧 **Email verification** and password reset
- 🛡️ **Protected routes** with role-based access
- 📖 **Swagger API documentation**
- 🎨 **Professional email templates** (EJS)
- 📝 **TypeScript** with centralized types & DTOs
- 🛠️ **Development tools**: Prettier, ESLint, Husky
- 📦 **Modular, clean architecture**
- 🐳 **Docker support**
- 🛡️ **Security best practices**: Rate limiting, Helmet, CORS
- 🚦 **API versioning** (`/api/v1/`)
- 📂 **S3 file upload utility**
- 📬 **Email queueing** (BullMQ)
- 🧑‍💻 **Winston logging** (colorized/dev & JSON/prod)
- 🧩 **Extensible & easy to customize**

## 🚀 Quick Start

1. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database, S3, and email settings
   ```

2. **Install and run**
   ```bash
   yarn install
   yarn dev
   ```

3. **Access the app**
   - API: `http://localhost:3000/api/v1`
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

## 📚 API Endpoints (v1)

All endpoints are prefixed with `/api/v1/`.

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout user

### Email Verification
- `GET /api/v1/auth/verify-email/:token` - Verify email
- `POST /api/v1/auth/verify-email` - Resend verification

### Password Reset
- `POST /api/v1/auth/forgot-password` - Request reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Users (Protected)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🏗️ Project Structure

```
src/
├── api/
│   ├── controllers/   # Route handlers
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── validators/    # Input validation
│   ├── entities/      # Database schemas
│   └── repositories/  # Data access layer
├── config/            # Environment & server config
├── constants/         # Constants (errors, tokens, etc.)
├── db/                # Database connection
├── exceptions/        # Custom error classes (HttpException, etc.)
├── lib/               # Utilities (logger, S3, email queue, email providers)
│   ├── email/
│   │   └── providers/ # Email providers (SMTP, SendGrid)
│   ├── s3.ts          # S3Service for file uploads
│   └── emailQueue.ts  # Email queueing with BullMQ
├── middleware/        # Auth & validation middleware
├── types/             # Centralized TypeScript types & DTOs
├── utils/             # Helper functions (JWT, hashing, URLs, Swagger)
└── views/
    └── templates/     # Email templates (EJS)
        └── partials/  # Shared template parts
```

## 🛡️ Security & Best Practices

- **Rate Limiting**: Prevents abuse (100 requests/minute per IP by default)
- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Centralized Error Handling**: Custom exceptions (NestJS-style) and consistent error responses
- **Input Validation**: All endpoints validate input using Zod schemas
- **Winston Logging**: Colorized logs in development, JSON logs in production

## ☁️ File Uploads (S3 & Local)

- Use the `S3Service` in `src/lib/s3.ts` for uploading, downloading, deleting, and generating signed URLs for files.
- Supports both S3 and local storage (configurable).

## 📬 Email Queueing

- Email sending is handled via a queue (`src/lib/emailQueue.ts`) for reliability and scalability.
- Pluggable providers: SMTP and SendGrid (`src/lib/email/providers/`).

## 🏁 Feature Flags

- Easily toggle features at runtime using the feature flags utility (see `src/lib/featureFlags.ts`).

## 🧩 Extending the Boilerplate

- Add new routes/controllers/services under `src/api/`
- Add new utilities in `src/lib/`
- Define new types and DTOs in `src/types/`
- Add new error types in `src/exceptions/`
- Add new email templates in `src/views/templates/`

## 🐳 Docker

```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

**Professional, scalable, and ready for production.**
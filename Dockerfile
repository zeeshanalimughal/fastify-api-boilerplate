# ======== STAGE 1: Builder ========
FROM node:20-alpine AS builder

# No need to install yarn – it's already available in node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy application code
COPY . .

# Build the application (e.g., for TypeScript)
RUN yarn build


# ======== STAGE 2: Production ========
FROM node:20-alpine

# Again, no need to install yarn
WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy built output and environment variables
COPY --from=builder /app/dist ./dist
COPY .env .env
COPY wait-for-postgres.sh /usr/local/bin/wait-for-postgres.sh
RUN chmod +x /usr/local/bin/wait-for-postgres.sh

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start the server
ENTRYPOINT ["wait-for-postgres.sh", "db"]
CMD ["node", "dist/server.js"]

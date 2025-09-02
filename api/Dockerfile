FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build the app
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY prisma ./prisma/
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

USER nodejs

EXPOSE 4000

ENV PORT 4000

# Initialize database and start server
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm start"]

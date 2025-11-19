# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install required system dependencies untuk Prisma
RUN apk add --no-cache openssl make g++ python3

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies dengan rebuild Prisma
RUN npm ci

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install required runtime dependencies
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package*.json ./

# Install production dependencies only (tanpa dev deps)
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built application dari builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client di production
RUN npx prisma generate

# Create non-root user untuk security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]

# Start application
CMD ["node", "dist/server.js"]

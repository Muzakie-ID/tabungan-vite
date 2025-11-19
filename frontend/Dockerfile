# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Output stage - hanya copy dist ke volume/output
FROM node:20-alpine

WORKDIR /app

# Copy built dist dari builder
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Serve with Node.js (untuk development)
# atau gunakan nginx di reverse proxy Anda sendiri
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]

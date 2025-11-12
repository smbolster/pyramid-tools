# Multi-stage Dockerfile for Pyramid Tools Next.js Application
# This Dockerfile uses a three-stage build process to create a minimal, optimized production image

# Stage 1: Dependencies
# Install production dependencies only for the final runtime stage
FROM node:20-alpine AS deps
# Add libc6-compat for better compatibility with Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
# Copying these first allows Docker to cache this layer if dependencies haven't changed
COPY app/package.json app/package-lock.json ./

# Install production dependencies only
# npm ci ensures reproducible builds by using exact versions from package-lock.json
RUN npm ci --only=production

# Stage 2: Builder
# Build the Next.js application with all dependencies (including dev dependencies)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY app/package.json app/package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy application source code
COPY app/ .

# Build the Next.js application
# This creates an optimized production build in the .next directory
RUN npm run build

# Stage 3: Runner
# Create the minimal production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3060

# Create a non-root user for security
# Running as non-root prevents privilege escalation attacks
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Set proper ownership for all files
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3060

# Health check to verify the application is running
# This allows container orchestrators (Kubernetes, Docker Swarm, ECS) to monitor application health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3060', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the Next.js production server
CMD ["npm", "start"]

# Feature: Docker Containerization

## Feature Plan Created: specs/008-docker-containerization.md

## Feature Description

Add Docker containerization support to the Pyramid Tools application to enable consistent, reproducible deployments across different environments. This feature will create a complete Docker setup including a Dockerfile, docker-compose.yml, and .dockerignore file that packages the Next.js 16 application into an optimized container. The Docker setup will follow Next.js best practices with multi-stage builds to minimize image size, proper caching strategies for dependencies, and production-ready configurations. Users will be able to build and run the entire application stack with simple `docker compose up` commands, making deployment to any Docker-compatible environment (local development, staging, production, cloud platforms) straightforward and reliable. The containerized application will maintain all existing functionality including the client-side tools (Image to SVG, PDF Merger, HEIC Converter, QR Code Generator, Screenshot Annotator, etc.) while providing benefits like environment isolation, consistent dependency management, easy scaling, and simplified deployment workflows.

## User Story

As a developer or DevOps engineer
I want to containerize the Pyramid Tools application using Docker
So that I can deploy the application consistently across different environments (development, staging, production) with predictable behavior, isolated dependencies, and simplified deployment workflows

## Problem Statement

Currently, the Pyramid Tools application requires manual setup with Node.js 20+ installation, npm dependency management, and manual environment configuration. This creates several challenges: (1) Environment inconsistency - different Node.js versions or npm versions across developer machines and deployment environments can cause "works on my machine" issues; (2) Complex deployment - deploying to production requires manual steps to install dependencies, build the application, and configure the runtime environment; (3) Dependency conflicts - global npm packages or system dependencies can interfere with the application; (4) Difficult scaling - running multiple instances for load balancing requires duplicating the entire setup process; (5) Onboarding friction - new developers must manually install Node.js, configure their environment, and understand the build process before contributing. Without containerization, the application is harder to deploy, test, and maintain across different environments, leading to deployment failures, configuration drift, and wasted time troubleshooting environment-specific issues.

## Solution Statement

Implement Docker containerization for the Pyramid Tools application by creating:
- **Dockerfile**: Multi-stage build configuration that:
  - Uses official Node.js 20 Alpine Linux base images (small, secure)
  - Stage 1 (Builder): Installs dependencies and builds the Next.js application
  - Stage 2 (Runner): Creates minimal production image with only runtime dependencies
  - Optimizes layer caching to speed up rebuilds
  - Configures proper user permissions (non-root user for security)
  - Sets up health checks for container orchestration
  - Exposes port 3060 for the Next.js application
- **docker-compose.yml**: Docker Compose configuration for easy orchestration that:
  - Defines the application service with proper networking
  - Mounts volumes for development hot-reload (optional dev mode)
  - Sets environment variables for Next.js configuration
  - Configures port mappings (3060:3060)
  - Enables easy scaling and service management
  - Includes restart policies for production reliability
- **.dockerignore**: Prevents unnecessary files from being copied into the image:
  - Excludes node_modules, .git, .next (built fresh in container)
  - Excludes development files (.env.local, test files)
  - Reduces build context size for faster builds
  - Improves security by excluding sensitive files
- **Documentation**: Update docs with Docker usage instructions:
  - How to build the Docker image
  - How to run the container locally
  - How to use docker-compose for development
  - How to deploy to production environments
  - Environment variable configuration
  - Troubleshooting common Docker issues

This solution enables one-command deployment (`docker compose up`), consistent environments across development and production, easy scaling, and simplified CI/CD pipeline integration. The application will run on port 3060 in production mode and port 3050 in development mode.

## Relevant Files

Use these files to implement the feature:

- **app/package.json** - Contains npm scripts (dev, build, start) and dependency definitions. The Dockerfile will use these scripts to build and run the application. Current scripts:
  - `dev`: Runs Next.js dev server on port 3050
  - `build`: Creates production build
  - `start`: Starts production server
  - `lint`: Runs ESLint

- **app/next.config.ts** - Next.js configuration file. Currently has minimal default configuration. The Dockerfile needs to ensure this is included in the build. May need to add output: 'standalone' for optimized Docker builds.

- **app/package-lock.json** - Lockfile for exact dependency versions. Must be copied to Docker image to ensure reproducible builds with `npm ci`.

- **app/tsconfig.json** - TypeScript configuration. Required for building the Next.js application in the Docker container.

- **app/README.md** - Current README with basic Next.js getting started instructions. Should be referenced in Docker documentation but doesn't need modification since we'll create separate Docker docs.

### New Files

- **Dockerfile** - Multi-stage Dockerfile in the project root directory that:
  - Stage 1 (deps): Installs production dependencies only
  - Stage 2 (builder): Installs all dependencies and builds the Next.js app
  - Stage 3 (runner): Creates minimal production image
  - Uses Node.js 20 Alpine Linux (node:20-alpine) for small image size
  - Copies package.json and package-lock.json first for optimal layer caching
  - Runs `npm ci` for reproducible dependency installation
  - Runs `npm run build` to create production build
  - Exposes port 3060
  - Sets NODE_ENV=production and PORT=3060
  - Runs as non-root user for security
  - Includes health check command
  - Uses standalone output mode for smaller images
  - CMD: `npm start` to run the production server

- **docker-compose.yml** - Docker Compose file in the project root that:
  - Defines 'app' service for the Pyramid Tools application
  - Builds from the Dockerfile
  - Maps port 3060:3060 (host:container)
  - Sets container name: pyramid-tools
  - Configures restart policy: unless-stopped (production) or on-failure (development)
  - Sets environment variables:
    - NODE_ENV=production
    - PORT=3060
  - Optional volumes section commented out (for development with hot-reload)
  - Includes labels for easier container management
  - Sets up proper networking

- **docker-compose.dev.yml** - Optional development override file that:
  - Overrides the Dockerfile CMD to run `npm run dev`
  - Mounts source code as volumes for hot-reload:
    - ./app:/app (excluding node_modules)
  - Maps port 3050:3050 (dev server port)
  - Sets NODE_ENV=development
  - Enables faster development iteration without rebuilding image
  - Usage: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

- **.dockerignore** - Excludes unnecessary files from Docker build context:
  - node_modules (will be installed fresh in container)
  - .next (will be built fresh in container)
  - .git (not needed in production image)
  - .gitignore
  - .env.local, .env*.local (environment-specific secrets)
  - .claude (development tools)
  - specs/ (documentation, not needed in production)
  - docs/ (documentation, not needed in production)
  - README.md (not needed in production)
  - *.md (markdown files)
  - .vscode, .idea (IDE files)
  - coverage/ (test coverage reports)
  - *.log (log files)
  - .DS_Store (macOS files)
  - Dockerfile, docker-compose*.yml (Docker files themselves)
  - npm-debug.log*, yarn-debug.log*, yarn-error.log*

- **docs/docker-guide.md** - Comprehensive Docker documentation that includes:
  - Overview of the Docker setup
  - Prerequisites (Docker and Docker Compose installation)
  - Quick start guide
  - Building the Docker image: `docker build -t pyramid-tools .`
  - Running the container: `docker run -p 3060:3060 pyramid-tools`
  - Using Docker Compose: `docker compose up`
  - Development workflow with hot-reload
  - Environment variable configuration
  - Production deployment best practices
  - Scaling with Docker Compose: `docker compose up --scale app=3`
  - Troubleshooting common issues
  - Docker image optimization tips
  - Security best practices
  - CI/CD integration examples
  - Deploying to cloud platforms (AWS ECS, GCP Cloud Run, Azure Container Instances)

- **app/.env.example** (optional) - Example environment variables file:
  - PORT=3000
  - NODE_ENV=production
  - Lists any configurable environment variables
  - Serves as documentation for required configuration
  - Currently the app has no environment variables, but good practice to include

## Implementation Plan

### Phase 1: Foundation

1. Research Next.js Docker best practices from official Next.js documentation
2. Review existing Next.js examples for multi-stage Dockerfile patterns
3. Understand the application's current build process and dependencies
4. Determine optimal Docker base image (Node.js 20 Alpine vs standard)
5. Plan layer caching strategy to minimize rebuild times
6. Identify files to exclude via .dockerignore
7. Determine if Next.js standalone output mode is suitable for this application
8. Review security best practices (non-root user, minimal attack surface)

### Phase 2: Core Implementation

1. Create .dockerignore file to exclude unnecessary files from build context
2. Create multi-stage Dockerfile with proper layer ordering for cache optimization
3. Implement builder stage with dependency installation and Next.js build
4. Implement runner stage with minimal production runtime
5. Configure proper user permissions and security settings
6. Add health check configuration for container orchestration
7. Test Docker build process locally: `docker build -t pyramid-tools .`
8. Test running the container: `docker run -p 3060:3060 pyramid-tools`
9. Verify the application loads correctly at http://localhost:3060
10. Test all tools work correctly in the containerized environment
11. Optimize image size (should be <500MB for Alpine-based image)
12. Create docker-compose.yml for simplified orchestration
13. Create docker-compose.dev.yml for development workflow with hot-reload
14. Test Docker Compose: `docker compose up`
15. Test development mode: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

### Phase 3: Integration

1. Create comprehensive Docker documentation in docs/docker-guide.md
2. Test Docker build on different platforms (macOS, Linux, Windows)
3. Test Docker image on different architectures (x64, ARM64) if possible
4. Verify hot-reload works correctly in development mode
5. Test production build optimizations (standalone output)
6. Verify environment variable configuration works
7. Test scaling with Docker Compose: `docker compose up --scale app=3`
8. Validate image size is reasonable (<500MB)
9. Test health check endpoint functionality
10. Ensure logging works correctly (container logs are accessible)
11. Verify graceful shutdown on container stop
12. Test container restart policies work as expected
13. Create example .env.example file documenting configuration options
14. Update main README.md with quick Docker instructions and link to docs/docker-guide.md
15. Verify no regressions to existing functionality

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research Next.js Docker Best Practices

- Review official Next.js Docker documentation: https://nextjs.org/docs/app/building-your-application/deploying/docker
- Understand standalone output mode vs standard build
- Review multi-stage build patterns for Next.js
- Understand layer caching optimization for npm dependencies
- Research Alpine Linux vs standard Node.js base images
- Determine optimal image size targets (<500MB total)
- Review security best practices (non-root user, minimal dependencies)
- Document findings and decisions in comments within Dockerfile

### 2. Analyze Current Application Build Process

- Review app/package.json scripts (dev, build, start)
- Note that dev server runs on port 3050 but production should use 3060
- Understand that this is a pure client-side application (no API routes)
- Verify Next.js 16 compatibility with Docker
- Check if any build-time environment variables are needed (currently none)
- Confirm build output location (.next directory)
- Identify all runtime dependencies vs dev dependencies
- Verify TypeScript compilation happens during `npm run build`

### 3. Create .dockerignore File

- Create `/Users/sbolster/projects/corporate/pyramid-tools/.dockerignore`
- Add node_modules (will be installed fresh in container)
- Add .next (will be built fresh in container)
- Add .git and .gitignore (not needed in production)
- Add .env.local, .env*.local (environment-specific files)
- Add .claude directory (development tools)
- Add specs/ and docs/ (documentation, not needed in runtime)
- Add *.md files (README, etc.)
- Add IDE files (.vscode, .idea)
- Add test and coverage directories
- Add log files (*.log)
- Add .DS_Store (macOS)
- Add Dockerfile and docker-compose files themselves
- Add npm/yarn debug logs
- Add .next/cache (cache not needed)
- Verify .dockerignore reduces build context size significantly

### 4. Create Multi-Stage Dockerfile - Dependencies Stage

- Create `/Users/sbolster/projects/corporate/pyramid-tools/Dockerfile`
- Start with comment block explaining the multi-stage build
- Define Stage 1: deps (dependency installation)
  - FROM node:20-alpine AS deps
  - RUN apk add --no-cache libc6-compat (for better compatibility)
  - WORKDIR /app
  - COPY app/package.json app/package-lock.json ./
  - RUN npm ci --only=production (production dependencies only)
- Add comments explaining why we separate dependency stages
- Optimize for layer caching (package files first, then install)

### 5. Create Multi-Stage Dockerfile - Builder Stage

- Define Stage 2: builder (build the application)
  - FROM node:20-alpine AS builder
  - WORKDIR /app
  - COPY app/package.json app/package-lock.json ./
  - RUN npm ci (install all dependencies including dev)
  - COPY app/ . (copy all source code from app directory)
  - RUN npm run build (create production build)
- Add comment explaining that this stage installs dev dependencies needed for build
- Ensure TypeScript and Next.js build tools are available
- Verify .dockerignore prevents node_modules from being copied (will be installed via npm ci)

### 6. Create Multi-Stage Dockerfile - Runner Stage

- Define Stage 3: runner (production runtime)
  - FROM node:20-alpine AS runner
  - WORKDIR /app
  - RUN addgroup --system --gid 1001 nodejs
  - RUN adduser --system --uid 1001 nextjs (create non-root user)
  - COPY --from=deps /app/node_modules ./node_modules
  - COPY --from=builder /app/public ./public (if exists)
  - COPY --from=builder /app/.next ./.next
  - COPY --from=builder /app/package.json ./package.json
  - RUN chown -R nextjs:nodejs /app (set proper permissions)
  - USER nextjs (run as non-root for security)
  - EXPOSE 3060
  - ENV NODE_ENV=production
  - ENV PORT=3060
  - HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
      CMD node -e "require('http').get('http://localhost:3060', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  - CMD ["npm", "start"]
- Add comments explaining security measures (non-root user)
- Add comments explaining health check purpose

### 7. Test Docker Build Locally

- Navigate to project root
- Run `docker build -t pyramid-tools .`
- Verify build completes successfully
- Check for any errors or warnings during build
- Verify all three stages execute correctly
- Check final image size: `docker images pyramid-tools`
- Target size: <500MB for Alpine-based image
- If size is too large, investigate and optimize
- Verify no sensitive files are included in image

### 8. Test Running Docker Container

- Run `docker run -p 3060:3060 pyramid-tools`
- Verify container starts successfully
- Open browser to http://localhost:3060
- Verify homepage loads correctly
- Test each tool to ensure functionality:
  - Image to SVG converter
  - PDF Merger
  - PDF Splitter
  - HEIC to JPEG converter
  - QR Code Generator
  - Screenshot Annotator
- Verify dark mode toggle works
- Verify all client-side processing still works in container
- Check container logs: `docker logs <container-id>`
- Verify no errors in logs
- Stop container: Ctrl+C or `docker stop <container-id>`

### 9. Create docker-compose.yml File

- Create `/Users/sbolster/projects/corporate/pyramid-tools/docker-compose.yml`
- Define version: '3.8' or later
- Define services:
  - app:
    - build:
        context: .
        dockerfile: Dockerfile
    - container_name: pyramid-tools
    - ports:
      - "3060:3060"
    - environment:
      - NODE_ENV=production
      - PORT=3060
    - restart: unless-stopped
    - labels:
      - "com.pyramid-tools.description=Pyramid Tools web application"
- Add comments explaining configuration options
- Keep configuration simple and production-ready

### 10. Create docker-compose.dev.yml Override File

- Create `/Users/sbolster/projects/corporate/pyramid-tools/docker-compose.dev.yml`
- Define overrides for development:
  - app:
    - build:
        context: .
        target: builder (stop at builder stage, not runner)
    - command: npm run dev (override CMD to run dev server)
    - ports:
      - "3050:3050" (dev server port)
    - volumes:
      - ./app:/app (mount source for hot-reload)
      - /app/node_modules (anonymous volume to prevent overwrite)
      - /app/.next (anonymous volume for build cache)
    - environment:
      - NODE_ENV=development
      - PORT=3050
    - restart: on-failure
- Add comments explaining development workflow
- Document usage: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

### 11. Test Docker Compose Production Mode

- Run `docker compose up`
- Verify container builds and starts
- Verify application is accessible at http://localhost:3060
- Test all tools work correctly
- Verify restart policy works: `docker compose restart`
- Test stopping: `docker compose down`
- Test starting detached: `docker compose up -d`
- Verify logs: `docker compose logs -f`
- Test rebuilding: `docker compose up --build`

### 12. Test Docker Compose Development Mode

- Run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
- Verify container starts in development mode
- Verify application is accessible at http://localhost:3050
- Make a small change to a source file (e.g., edit page.tsx)
- Verify hot-reload works (change reflects without rebuilding)
- Verify Next.js Fast Refresh works
- Test stopping: Ctrl+C or `docker compose down`
- Verify source code changes persist (not lost in container)

### 13. Optimize Docker Image Size

- Check current image size: `docker images pyramid-tools`
- If >500MB, investigate and optimize:
  - Verify Alpine Linux base image is being used
  - Check if dev dependencies are being included in final stage
  - Review .dockerignore to ensure unnecessary files are excluded
  - Consider using Next.js standalone output (add to next.config.ts)
  - Remove any caching or temporary files in final stage
- Re-build and verify size reduction
- Document final image size in docker-guide.md

### 14. Test Next.js Standalone Output (Optional Optimization)

- Update app/next.config.ts:
  ```typescript
  const nextConfig: NextConfig = {
    output: 'standalone',
  };
  ```
- This creates a minimal standalone build in .next/standalone/
- Update Dockerfile runner stage to use standalone output:
  - COPY --from=builder /app/.next/standalone ./
  - COPY --from=builder /app/.next/static ./.next/static
  - CMD ["node", "server.js"] (instead of npm start)
- Rebuild and test
- Verify significant size reduction (potentially 100-200MB smaller)
- Verify all functionality still works
- If successful, keep this optimization; if issues arise, revert

### 15. Add Health Check Verification

- Verify health check command works:
  - `docker inspect pyramid-tools | grep -A 10 Health`
- Check health status after container starts
- Verify health check passes after 5 seconds (start period)
- Verify health check runs every 30 seconds (interval)
- Test health check failure (stop Next.js process inside container)
- Verify container is marked as unhealthy
- Document health check behavior in docker-guide.md

### 16. Test on Different Platforms

- Test on macOS (if current platform):
  - Build and run
  - Verify no issues
- Test on Linux (if available):
  - Build and run
  - Verify no platform-specific issues
- Test on Windows (if available):
  - Build and run with Docker Desktop
  - Verify Windows file path handling works
  - Verify no line ending issues (CRLF vs LF)
- Test on ARM64 architecture (if available, e.g., Apple Silicon):
  - Verify Node.js Alpine ARM64 image works
  - Build and run
  - Check performance
- Document any platform-specific considerations

### 17. Test Multi-Architecture Build (Optional)

- If deploying to mixed architectures, create multi-arch image:
  - `docker buildx create --use`
  - `docker buildx build --platform linux/amd64,linux/arm64 -t pyramid-tools:latest .`
- Verify build succeeds for both architectures
- Test on both platforms if available
- Document multi-arch build process in docker-guide.md
- This is optional but recommended for production deployments

### 18. Test Environment Variable Configuration

- Create test environment file: `.env.test`
  - NODE_ENV=production
  - PORT=3060
- Test loading env vars in docker-compose.yml:
  - Add `env_file: .env.test`
- Run `docker compose up`
- Verify environment variables are loaded
- Test changing PORT to 3070:
  - Update .env.test
  - Update port mapping in docker-compose.yml
  - Rebuild and run
  - Verify application runs on new port
- Document environment variable configuration in docker-guide.md
- Remove .env.test after testing (don't commit)

### 19. Create .env.example File

- Create `/Users/sbolster/projects/corporate/pyramid-tools/.env.example`
- Add example environment variables:
  ```
  # Port for the Next.js application
  PORT=3060

  # Node environment (production, development, test)
  NODE_ENV=production
  ```
- Add comments explaining each variable
- Currently the app doesn't require env vars, but this serves as documentation
- Add note that .env.local is for local overrides (not committed)

### 20. Create Comprehensive Docker Documentation

- Create `/Users/sbolster/projects/corporate/pyramid-tools/docs/docker-guide.md`
- Include sections:
  - **Overview**: Brief description of Docker setup
  - **Prerequisites**: Docker and Docker Compose installation links
  - **Quick Start**:
    - `docker compose up`
    - Navigate to http://localhost:3060
  - **Building the Image**:
    - `docker build -t pyramid-tools .`
    - Explanation of build process
  - **Running the Container**:
    - `docker run -p 3060:3060 pyramid-tools`
    - Environment variables
    - Volume mounts
  - **Using Docker Compose**:
    - Production: `docker compose up`
    - Development: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
    - Detached mode: `docker compose up -d`
    - Viewing logs: `docker compose logs -f`
    - Stopping: `docker compose down`
    - Rebuilding: `docker compose up --build`
  - **Development Workflow**:
    - Hot-reload setup
    - Volume mounts
    - Debugging in container
  - **Production Deployment**:
    - Build optimized image
    - Environment configuration
    - Scaling: `docker compose up --scale app=3`
    - Using load balancer (nginx example)
  - **Environment Variables**:
    - List of configurable variables
    - Using .env files
    - Docker Compose env_file
  - **Troubleshooting**:
    - Common issues and solutions
    - Port conflicts
    - Permission issues
    - Build failures
    - Container won't start
  - **Docker Image Optimization**:
    - Multi-stage builds explained
    - Layer caching
    - .dockerignore importance
    - Standalone output mode
  - **Security Best Practices**:
    - Non-root user
    - Minimal base image (Alpine)
    - No secrets in image
    - Regular image updates
  - **CI/CD Integration**:
    - Example GitHub Actions workflow
    - Example GitLab CI/CD pipeline
    - Building in CI
    - Pushing to registry
  - **Cloud Deployment**:
    - AWS ECS deployment example
    - GCP Cloud Run deployment example
    - Azure Container Instances deployment example
    - Heroku Container Registry example
  - **Health Checks**:
    - Health check configuration
    - Monitoring container health
    - Integration with orchestrators
  - **Logging**:
    - Accessing container logs
    - Structured logging
    - Log aggregation (ELK stack example)
  - **Scaling and Load Balancing**:
    - Docker Compose scaling
    - Kubernetes deployment (brief)
    - Load balancer configuration

### 21. Update Main README (Optional)

- If there's a main README.md in project root, add Docker section:
  - Quick Docker instructions
  - Link to docs/docker-guide.md for detailed instructions
- If no README exists, consider creating brief one
- Keep it concise, detailed docs are in docker-guide.md

### 22. Test Container Restart Policies

- Test `restart: unless-stopped` policy:
  - Run `docker compose up -d`
  - Stop the container: `docker stop pyramid-tools`
  - Verify container restarts automatically
  - Check with `docker ps`
- Test manual stop:
  - Run `docker compose stop`
  - Verify container does NOT restart
  - Run `docker compose start`
  - Verify container starts
- Test restart on failure:
  - Simulate crash (kill process inside container)
  - Verify container restarts
- Document restart policy behavior in docker-guide.md

### 23. Test Logging and Observability

- Run container in detached mode: `docker compose up -d`
- Check logs: `docker compose logs`
- Follow logs in real-time: `docker compose logs -f`
- Verify Next.js logs are visible
- Make requests to the application
- Verify HTTP requests are logged
- Check for any errors or warnings in logs
- Test filtering logs: `docker compose logs app`
- Test viewing last N lines: `docker compose logs --tail=50`
- Document logging best practices in docker-guide.md

### 24. Test Graceful Shutdown

- Run container: `docker compose up`
- Send SIGTERM signal: `docker compose stop` (or Ctrl+C if foreground)
- Verify Next.js receives signal and shuts down gracefully
- Check logs for shutdown messages
- Verify no error messages during shutdown
- Verify shutdown completes within 10 seconds (default stop timeout)
- If shutdown takes too long, investigate and optimize
- Document expected shutdown behavior in docker-guide.md

### 25. Test Docker Volume Persistence (Development)

- Run development mode: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
- Make changes to source code
- Verify changes reflect immediately (hot-reload)
- Stop container
- Restart container
- Verify changes persisted (not lost)
- Verify node_modules are not overwritten by host
- Verify .next build cache is maintained
- Test removing node_modules on host:
  - `rm -rf app/node_modules`
  - Restart dev container
  - Verify node_modules still exist in container

### 26. Test Building Without Cache

- Build with cache: `docker build -t pyramid-tools .`
- Note build time
- Rebuild with cache: `docker build -t pyramid-tools .`
- Note build time (should be much faster due to layer cache)
- Build without cache: `docker build --no-cache -t pyramid-tools .`
- Verify build succeeds from scratch
- Note build time (longer without cache)
- Verify final image is identical
- Document cache behavior and optimization in docker-guide.md

### 27. Verify Security Best Practices

- Inspect Dockerfile for security issues:
  - ✓ Using official Node.js image (trusted source)
  - ✓ Using Alpine Linux (minimal attack surface)
  - ✓ Running as non-root user (security)
  - ✓ No secrets or credentials in image
  - ✓ Using specific Node.js version (not 'latest')
  - ✓ Minimal layers (combined RUN commands where appropriate)
- Run security scan (if available):
  - `docker scan pyramid-tools` (Docker Desktop)
  - Or use Trivy: `trivy image pyramid-tools`
- Review scan results
- Fix any critical or high vulnerabilities
- Document security practices in docker-guide.md

### 28. Test Scaling with Docker Compose

- Scale to 3 instances: `docker compose up --scale app=3`
- Verify 3 containers start
- Note: Port conflict will occur (all trying to bind to 3000)
- Stop and modify docker-compose.yml to remove fixed port mapping:
  - Change `ports: ["3060:3060"]` to `expose: [3060]`
  - Add nginx or load balancer service (optional for testing)
- Re-test scaling: `docker compose up --scale app=3`
- Verify 3 containers start successfully
- Test accessing each container individually
- Document scaling considerations in docker-guide.md
- Revert port mapping for single-instance use case

### 29. Create Example CI/CD Configuration (Optional)

- Create example GitHub Actions workflow: `.github/workflows/docker-build.yml.example`
- Include steps:
  - Checkout code
  - Set up Docker Buildx
  - Login to Docker registry (Docker Hub, GHCR, etc.)
  - Build Docker image
  - Tag image (version, latest)
  - Push to registry
  - Optional: Run tests in container
- Add comments explaining each step
- Rename to .yml.example to prevent auto-execution
- Document CI/CD setup in docker-guide.md
- Users can rename and configure for their use

### 30. Final Integration Testing

- Clean all Docker artifacts:
  - `docker compose down -v` (stop and remove volumes)
  - `docker system prune -a` (remove all images and cache)
- Rebuild from scratch: `docker build -t pyramid-tools .`
- Verify build succeeds
- Run with Docker Compose: `docker compose up`
- Verify application loads at http://localhost:3060
- Test all features end-to-end:
  - Homepage loads with all tool cards
  - Each tool is accessible
  - Image to SVG converter works
  - PDF Merger works
  - PDF Splitter works
  - HEIC to JPEG works
  - QR Code Generator works
  - Screenshot Annotator works
  - Dark mode toggle works across all pages
  - Theme persists across navigation
- Test responsive layout (resize browser)
- Test in multiple browsers (Chrome, Firefox, Safari)
- Verify no console errors
- Verify no broken functionality
- Stop container: `docker compose down`

### 31. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run lint`
  - Verify no ESLint errors
  - Verify no new warnings
  - Fix any issues

- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run build`
  - Verify build succeeds
  - Verify no TypeScript errors
  - Verify no build failures
  - Note: This validates the application still builds correctly outside Docker

- Build Docker image: `docker build -t pyramid-tools /Users/sbolster/projects/corporate/pyramid-tools`
  - Verify build completes successfully
  - Verify no errors during multi-stage build
  - Verify image size is reasonable (<500MB)
  - Check image: `docker images pyramid-tools`

- Run Docker container: `docker run -d -p 3060:3060 --name pyramid-tools-test pyramid-tools`
  - Verify container starts successfully
  - Check container status: `docker ps`
  - Wait 10 seconds for application to start

- Test application in Docker:
  - Navigate to http://localhost:3060
  - Verify homepage loads
  - Verify all tool cards are visible
  - Click on "Image to SVG" tool
  - Upload a test image (PNG logo)
  - Verify conversion works
  - Download SVG
  - Verify file downloads correctly
  - Navigate back to homepage
  - Test "HEIC to JPEG" tool
  - Verify functionality works
  - Test "PDF Merger" tool
  - Verify functionality works
  - Toggle dark mode
  - Verify theme changes
  - Verify no console errors in browser DevTools

- Check container logs: `docker logs pyramid-tools-test`
  - Verify Next.js started successfully
  - Verify no errors in logs
  - Verify HTTP requests are logged

- Test container health: `docker inspect pyramid-tools-test | grep -A 5 Health`
  - Verify health check is configured
  - Verify health status is "healthy"

- Stop and remove test container: `docker stop pyramid-tools-test && docker rm pyramid-tools-test`

- Test with Docker Compose: `cd /Users/sbolster/projects/corporate/pyramid-tools && docker compose up -d`
  - Verify container starts successfully
  - Check status: `docker compose ps`
  - Verify "pyramid-tools" service is "running"
  - Navigate to http://localhost:3060
  - Verify application loads
  - Test at least 2 different tools
  - Verify functionality works

- Check Docker Compose logs: `docker compose logs`
  - Verify no errors
  - Verify clean startup

- Test Docker Compose restart: `docker compose restart`
  - Verify container restarts successfully
  - Verify application remains accessible

- Stop Docker Compose: `docker compose down`
  - Verify clean shutdown

- Test development mode: `cd /Users/sbolster/projects/corporate/pyramid-tools && docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
  - Verify container starts
  - Navigate to http://localhost:3050
  - Verify application loads in dev mode
  - Make a small change to app/app/page.tsx (e.g., add a comment)
  - Wait 2 seconds for hot-reload
  - Refresh browser if needed
  - Verify change is reflected (or verify hot-reload happened in logs)
  - Stop: `docker compose down`

- Verify no regressions to existing tools:
  - All tools remain functional
  - Dark mode works
  - Responsive layout works
  - No console errors
  - No build errors

- Verify Docker documentation is complete:
  - Read docs/docker-guide.md
  - Verify all sections are present
  - Verify instructions are clear
  - Verify no placeholders or TODOs

- Final validation checklist:
  - ✓ Dockerfile exists and builds successfully
  - ✓ docker-compose.yml exists and works
  - ✓ docker-compose.dev.yml exists and works
  - ✓ .dockerignore exists and excludes proper files
  - ✓ Docker image size is reasonable (<500MB)
  - ✓ Application runs correctly in container
  - ✓ All tools work in containerized environment
  - ✓ Health check is configured and passes
  - ✓ Non-root user is used (security)
  - ✓ Development hot-reload works
  - ✓ Documentation is comprehensive
  - ✓ No regressions to existing functionality

## Testing Strategy

### Unit Tests

Currently, the Pyramid Tools application does not have a formal testing framework. However, if tests are added in the future, Docker-specific tests to consider:

- **Dockerfile validation**: Test that Dockerfile syntax is valid
- **Build process**: Test that Docker build completes without errors
- **Image size**: Test that image size is within acceptable limits (<500MB)
- **Layer caching**: Test that rebuilds with no changes complete quickly (cached layers)
- **Security**: Test that container runs as non-root user
- **Environment variables**: Test that env vars are properly passed to container
- **Health check**: Test that health check command executes successfully

### Integration Tests

Manual integration tests to perform:

- **Build to run workflow**: Build image → run container → access application → verify functionality
- **Docker Compose orchestration**: docker compose up → verify all services start → verify networking → test application
- **Development workflow**: Run dev mode → make code change → verify hot-reload → verify change reflected
- **Restart behavior**: Start container → stop container → verify restart policy → verify data persistence
- **Environment configuration**: Set env vars → start container → verify configuration applied
- **Multi-instance scaling**: Scale to 3 replicas → verify all start → verify load distribution (if load balancer configured)
- **CI/CD simulation**: Clean environment → build image → run tests in container → tag image → simulate push to registry

### Edge Cases

- **Port conflicts**: Another service using port 3000 → Docker run fails with clear error → use different port mapping
- **Low disk space**: Insufficient disk space for Docker image → build fails with clear error → clean up Docker cache
- **Network issues**: Cannot pull base image → build fails → retry or use cached image
- **Invalid Dockerfile syntax**: Dockerfile has syntax error → build fails immediately with clear error
- **Missing dependencies**: package-lock.json out of sync → npm ci fails → regenerate lockfile
- **Permission issues**: Running on Linux without proper Docker permissions → fails → add user to docker group
- **Large build context**: .dockerignore missing → slow builds → verify .dockerignore exists
- **Container memory limits**: Very large image processing → container OOM → increase Docker memory limit
- **Platform architecture mismatch**: Building ARM64 image on x64 → build fails or slow emulation → use buildx for multi-arch
- **Environment variable typos**: Misspelled env var → application uses default → verify env var names
- **Health check failures**: Application not responding → container marked unhealthy → investigate startup issues
- **Graceful shutdown timeout**: Application takes >10s to stop → Docker force kills → optimize shutdown or increase timeout
- **Volume mount permissions**: Incorrect volume permissions on Linux → permission denied errors → set proper ownership
- **Docker Desktop not running**: Docker commands fail → start Docker Desktop
- **Outdated base image**: Security vulnerabilities in old Node.js image → scan image → use latest patch version

## Acceptance Criteria

1. **Dockerfile Creation**:
   - Multi-stage Dockerfile exists in project root
   - Uses Node.js 20 Alpine Linux base image
   - Three stages: deps, builder, runner
   - Properly optimized for layer caching
   - Runs as non-root user (nextjs user, UID 1001)
   - Includes health check configuration
   - Exposes port 3000
   - Sets NODE_ENV=production
   - Final image size <500MB
   - Build completes successfully without errors

2. **Docker Compose Configuration**:
   - docker-compose.yml exists in project root
   - Defines 'app' service with proper configuration
   - Maps port 3060:3060
   - Sets environment variables (NODE_ENV=production, PORT=3060)
   - Includes restart policy (unless-stopped)
   - Includes container name and labels
   - docker-compose.dev.yml exists for development workflow
   - Development mode enables hot-reload with volume mounts
   - Development mode runs on port 3050

3. **.dockerignore File**:
   - .dockerignore exists in project root
   - Excludes node_modules, .next, .git
   - Excludes development and documentation files
   - Excludes environment files (.env.local)
   - Excludes IDE and OS-specific files
   - Significantly reduces build context size

4. **Docker Build**:
   - `docker build -t pyramid-tools .` completes successfully
   - Build uses layer caching effectively (fast rebuilds)
   - Build output shows three stages executing
   - No errors or critical warnings during build
   - Final image is created and tagged correctly
   - Image appears in `docker images` list

5. **Docker Run**:
   - `docker run -p 3060:3060 pyramid-tools` starts successfully
   - Container appears in `docker ps` as running
   - Application is accessible at http://localhost:3060
   - Homepage loads correctly with all tool cards
   - All tools function correctly in container
   - Dark mode toggle works
   - No errors in container logs
   - No console errors in browser

6. **Docker Compose Production**:
   - `docker compose up` starts container successfully
   - Application is accessible at http://localhost:3060
   - All functionality works correctly
   - Logs are accessible via `docker compose logs`
   - `docker compose down` stops and removes container cleanly
   - `docker compose restart` restarts container successfully
   - Restart policy works as expected (container restarts on failure)

7. **Docker Compose Development**:
   - `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` starts successfully
   - Application is accessible at http://localhost:3050
   - Hot-reload works when source files are modified
   - Next.js Fast Refresh functions correctly
   - Changes persist after container restart
   - node_modules are not overwritten by host
   - Development experience is smooth and responsive

8. **Health Checks**:
   - Health check is configured in Dockerfile
   - Health check runs every 30 seconds
   - Health check has 5-second start period
   - Health check passes when application is running
   - Container is marked as "healthy" in `docker ps`
   - Health check fails and container marked "unhealthy" when application stops

9. **Security**:
   - Container runs as non-root user (nextjs, UID 1001)
   - Alpine Linux base image used (minimal attack surface)
   - No secrets or credentials in Docker image
   - No unnecessary packages or files in final image
   - File permissions are properly set (chown to nextjs:nodejs)
   - Image passes security scan with no critical vulnerabilities

10. **Performance and Optimization**:
    - Docker image size <500MB (preferably <300MB with standalone mode)
    - Layer caching significantly speeds up rebuilds
    - Build without changes completes in <30 seconds (cached layers)
    - Full rebuild from scratch completes in <5 minutes
    - Container starts and application ready in <10 seconds
    - Hot-reload in development mode responds in <2 seconds
    - No memory leaks or excessive memory usage in container

11. **Documentation**:
    - docs/docker-guide.md exists with comprehensive instructions
    - Documentation includes all major sections (overview, quickstart, build, run, compose, dev workflow, production, troubleshooting, security, CI/CD, cloud deployment)
    - All commands are accurate and tested
    - Examples are clear and complete
    - Troubleshooting section covers common issues
    - Security best practices are documented
    - CI/CD integration examples provided
    - Cloud deployment examples provided (AWS, GCP, Azure)

12. **Environment Configuration**:
    - .env.example file exists documenting configuration options
    - Environment variables can be set via docker-compose.yml
    - Environment variables can be loaded from .env file
    - PORT and NODE_ENV are configurable
    - Environment changes take effect after container restart
    - No required environment variables (app works with defaults)

13. **Cross-Platform Compatibility**:
    - Docker build and run work on macOS
    - Docker build and run work on Linux
    - Docker build and run work on Windows (Docker Desktop)
    - No platform-specific issues or errors
    - Line endings handled correctly (no CRLF issues)
    - File paths work across platforms

14. **Logging and Monitoring**:
    - Container logs are accessible via `docker logs`
    - Next.js startup logs are visible
    - HTTP request logs are visible
    - Errors are logged clearly
    - Logs can be followed in real-time with `-f` flag
    - Docker Compose logs combine output properly

15. **Graceful Shutdown**:
    - Container responds to SIGTERM signal
    - Next.js shuts down gracefully on stop
    - Shutdown completes within 10 seconds
    - No error messages during shutdown
    - `docker compose down` completes cleanly
    - No orphaned processes after shutdown

16. **No Regressions**:
    - All existing tools continue to function correctly
    - Image to SVG converter works
    - PDF Merger and Splitter work
    - HEIC to JPEG converter works
    - QR Code Generator works
    - Screenshot Annotator works
    - Dark mode toggle works on all pages
    - Theme persistence works
    - Responsive layout works
    - Keyboard navigation works
    - No new console errors
    - No broken functionality

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run lint` - Run linting to validate code quality. No new lint errors should be introduced. Must complete with zero errors.

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. This ensures the application still builds correctly outside of Docker. Must complete successfully with exit code 0.

- `cd /Users/sbolster/projects/corporate/pyramid-tools && docker build -t pyramid-tools .` - Build the Docker image from the Dockerfile. Must complete successfully without errors. Verify the multi-stage build executes all three stages (deps, builder, runner). Check final image size with `docker images pyramid-tools` - should be <500MB, preferably <300MB.

- `docker run -d -p 3060:3060 --name pyramid-tools-test pyramid-tools` - Run the Docker container in detached mode. Container must start successfully and be listed in `docker ps` with status "running".

- Wait 10 seconds for application startup, then test the application:
  - Navigate to http://localhost:3060 in browser
  - Verify homepage loads with all tool cards visible
  - Click "Image to SVG" tool card
  - Verify tool page loads correctly
  - Upload a test PNG image
  - Select "Logo" preset
  - Verify conversion completes successfully
  - Verify SVG preview displays
  - Click "Download SVG" button
  - Verify SVG file downloads correctly
  - Open downloaded SVG in browser
  - Verify SVG is valid and displays correctly
  - Navigate back to homepage
  - Click "HEIC to JPEG" tool (or another tool)
  - Verify tool loads and basic functionality works
  - Toggle dark mode using theme toggle
  - Verify theme changes and UI adapts correctly
  - Verify no console errors in browser DevTools (F12)

- `docker logs pyramid-tools-test` - Check container logs. Verify Next.js started successfully with message like "ready started server on 0.0.0.0:3060". Verify no error messages or exceptions in logs. Verify HTTP requests are logged when accessing the application.

- `docker inspect pyramid-tools-test | grep -A 5 Health` - Verify health check is configured and working. Check that health status is "healthy". If unhealthy, investigate startup issues.

- `docker stop pyramid-tools-test && docker rm pyramid-tools-test` - Stop and remove the test container. Must complete cleanly without errors.

- `cd /Users/sbolster/projects/corporate/pyramid-tools && docker compose up -d` - Start the application using Docker Compose in detached mode. Must start successfully.

- `docker compose ps` - Verify the container is running. Should show "pyramid-tools" service with state "running".

- Navigate to http://localhost:3060 and perform comprehensive testing:
  - Verify homepage loads correctly
  - Test at least 3 different tools:
    - Image to SVG: Upload, convert, download
    - PDF Merger: Upload multiple PDFs, merge, download
    - QR Code Generator: Generate QR code, download
  - Verify all tested tools function correctly
  - Verify dark mode toggle works
  - Verify theme persists across page navigation
  - Verify responsive layout works (resize browser window)
  - Verify no console errors in browser DevTools

- `docker compose logs` - Check Docker Compose logs. Verify clean startup with no errors. Verify Next.js is running on port 3060.

- `docker compose restart` - Restart the container using Docker Compose. Must restart successfully. Verify application remains accessible after restart.

- `docker compose down` - Stop and remove the container. Must complete cleanly without errors.

- Test development mode: `cd /Users/sbolster/projects/corporate/pyramid-tools && docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
  - Container must start successfully
  - Navigate to http://localhost:3050
  - Verify application loads in development mode
  - Make a small change to app/app/page.tsx (add a comment: `// Docker test`)
  - Save the file
  - Wait 2-3 seconds for hot-reload
  - Refresh browser if needed
  - Check Docker logs: `docker compose logs -f` (look for Fast Refresh messages)
  - Verify change was detected (logs should show compilation)
  - Stop: `docker compose down`

- Test Docker image size optimization:
  - `docker images pyramid-tools`
  - Verify total image size
  - If using standalone mode: should be 200-300MB
  - If using standard mode: should be <500MB
  - Document actual size in notes

- Verify Docker files exist and are properly configured:
  - `ls -la /Users/sbolster/projects/corporate/pyramid-tools/Dockerfile` - Must exist
  - `ls -la /Users/sbolster/projects/corporate/pyramid-tools/docker-compose.yml` - Must exist
  - `ls -la /Users/sbolster/projects/corporate/pyramid-tools/docker-compose.dev.yml` - Must exist
  - `ls -la /Users/sbolster/projects/corporate/pyramid-tools/.dockerignore` - Must exist
  - `ls -la /Users/sbolster/projects/corporate/pyramid-tools/docs/docker-guide.md` - Must exist

- Verify .dockerignore is working:
  - `docker build -t pyramid-tools . 2>&1 | grep -i "sending build context"`
  - Verify build context size is small (<10MB)
  - If large (>50MB), .dockerignore may not be working properly

- Test rebuild with cache:
  - `docker build -t pyramid-tools .` (first build)
  - Note build time
  - `docker build -t pyramid-tools .` (second build, no changes)
  - Second build should complete much faster (<30 seconds) using cached layers
  - Verify "CACHED" appears in build output for most steps

- Final regression testing:
  - Start container: `docker compose up -d`
  - Navigate to http://localhost:3060
  - Test each tool one final time:
    - Image to SVG: Upload and convert
    - PDF Merger: Upload and merge
    - PDF Splitter: Upload and split
    - HEIC to JPEG: Upload and convert
    - QR Code Generator: Generate QR code
    - Screenshot Annotator: Upload and annotate
  - Verify all tools work without errors
  - Verify dark mode works across all pages
  - Verify no regressions to existing functionality
  - Verify no console errors in browser
  - Stop container: `docker compose down`

- Documentation validation:
  - Open docs/docker-guide.md
  - Verify document is complete and well-formatted
  - Verify all sections are present
  - Verify code examples are properly formatted
  - Verify no placeholder text or TODOs remain
  - Quick scan for typos or formatting issues

- Final checklist:
  - ✓ Docker build succeeds
  - ✓ Docker image size is reasonable (<500MB)
  - ✓ Docker run works and application is accessible
  - ✓ Docker Compose production mode works
  - ✓ Docker Compose development mode works with hot-reload
  - ✓ Health check is configured and passes
  - ✓ Container runs as non-root user
  - ✓ All application tools work in container
  - ✓ Dark mode works
  - ✓ No console errors
  - ✓ Container logs are clean (no errors)
  - ✓ Graceful shutdown works
  - ✓ Restart policy works
  - ✓ Layer caching optimizes rebuild time
  - ✓ .dockerignore reduces build context size
  - ✓ Documentation is complete
  - ✓ No regressions to existing functionality

## Notes

### Docker and Next.js Best Practices

This Docker implementation follows official Next.js recommendations for Docker deployment:

**Multi-Stage Build Benefits:**
- **Stage 1 (deps)**: Installs only production dependencies, creating a clean dependency layer
- **Stage 2 (builder)**: Includes dev dependencies needed for build (TypeScript, Next.js compiler, etc.)
- **Stage 3 (runner)**: Minimal production image with only runtime files, no dev dependencies
- **Result**: Significantly smaller final image (typically 50-70% smaller than single-stage)

**Layer Caching Strategy:**
1. Copy package.json and package-lock.json first
2. Run `npm ci` to install dependencies
3. Copy source code last
4. **Benefit**: Dependency layer is cached and only rebuilt when package files change
5. **Impact**: Rebuild time reduced from 3-5 minutes to 10-30 seconds when only code changes

**Alpine Linux Choice:**
- Minimal base image (5MB vs 1GB for standard Node.js)
- Smaller attack surface for security
- Faster downloads and deployments
- Compatible with all Node.js features
- Trade-off: Some native modules may need compilation

**Standalone Output Mode (Optional Optimization):**
- Next.js can output a self-contained server bundle
- Add `output: 'standalone'` to next.config.ts
- Creates `.next/standalone/` directory with minimal runtime
- Reduces image size by 100-200MB (only includes necessary files)
- Recommended for production deployments
- Trade-off: Slightly more complex Dockerfile

**Non-Root User Security:**
- Creating dedicated `nextjs` user (UID 1001, GID 1001)
- Running application as non-root prevents privilege escalation attacks
- Standard security best practice for container images
- Required by some security policies and platforms (Kubernetes, etc.)

**Health Check Configuration:**
- Enables container orchestrators to monitor application health
- Kubernetes, Docker Swarm, AWS ECS use health checks for:
  - Determining when container is ready to receive traffic
  - Restarting unhealthy containers automatically
  - Load balancer health checking
- HTTP-based check verifies Next.js server is responding
- Configurable interval, timeout, start period, retries

### Development Workflow with Docker

**Hot-Reload Development:**
The docker-compose.dev.yml enables a development experience similar to running `npm run dev` locally:

**How It Works:**
1. Volume mount: `./app:/app` syncs host files to container
2. Anonymous volumes: `/app/node_modules` and `/app/.next` prevent host overwriting container
3. Dev server command: `npm run dev` instead of `npm start`
4. Next.js Fast Refresh detects file changes and recompiles
5. Browser automatically refreshes with changes

**Benefits:**
- Consistent environment (same Node.js version, dependencies)
- No need to install Node.js on host machine
- Multiple developers use identical environment
- Easy onboarding (just need Docker, no Node.js setup)

**Trade-offs:**
- Slightly slower file watching (Docker volume overhead)
- Larger container (includes dev dependencies)
- Not suitable for production (dev mode, exposed volumes)

**When to Use:**
- New developer onboarding
- Cross-platform development (Windows, macOS, Linux)
- Testing in production-like environment
- Isolating project dependencies

### Production Deployment Strategies

**Deployment Options:**

1. **Docker Compose (Simple):**
   - Single server or small-scale deployment
   - `docker compose up -d` on production server
   - Suitable for MVPs, small applications, single-server deployments
   - Limited scaling capabilities

2. **Container Orchestration (Scalable):**
   - **Kubernetes**: Industry standard for container orchestration
   - **Docker Swarm**: Simpler alternative to Kubernetes
   - **AWS ECS/Fargate**: Managed container service on AWS
   - **Google Cloud Run**: Serverless container platform
   - **Azure Container Instances**: Managed containers on Azure
   - Benefits: Auto-scaling, load balancing, health monitoring, rolling updates

3. **Platform-as-a-Service:**
   - **Heroku Container Registry**: Push Docker image, Heroku handles deployment
   - **Railway**: Docker-first deployment platform
   - **Render**: Native Docker support
   - **Fly.io**: Global container deployment
   - Benefits: Simple deployment, managed infrastructure, automatic HTTPS

**Deployment Checklist:**
- [ ] Set NODE_ENV=production
- [ ] Configure environment variables (use secrets, not .env files)
- [ ] Set up health checks in orchestrator
- [ ] Configure resource limits (CPU, memory)
- [ ] Set up logging aggregation (CloudWatch, Datadog, etc.)
- [ ] Configure monitoring and alerts
- [ ] Set up auto-scaling policies
- [ ] Configure load balancer (nginx, ALB, Cloud Load Balancer)
- [ ] Enable HTTPS/TLS termination
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Test rolling updates (zero-downtime deployment)
- [ ] Configure backup and disaster recovery

### Scaling Considerations

**Horizontal Scaling:**
The Pyramid Tools application is stateless and can be easily scaled horizontally:

**Characteristics:**
- No server-side sessions or state (pure client-side processing)
- No database connections (no shared state to manage)
- No file uploads to server (all processing happens in browser)
- Each container instance is independent and identical

**Scaling Methods:**
1. **Docker Compose Scaling:**
   ```bash
   docker compose up --scale app=3
   ```
   - Starts 3 identical container instances
   - Requires load balancer to distribute traffic
   - Note: Remove fixed port mapping (use `expose` instead of `ports`)

2. **Kubernetes Horizontal Pod Autoscaling:**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: pyramid-tools-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: pyramid-tools
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
   ```
   - Automatically scales based on CPU/memory usage
   - Scales down during low traffic
   - Scales up during traffic spikes

**Load Balancing:**
Since the app is stateless, simple round-robin or least-connections load balancing works well:

**nginx Example:**
```nginx
upstream pyramid_tools {
    server app1:3060;
    server app2:3060;
    server app3:3060;
}

server {
    listen 80;
    server_name pyramid-tools.example.com;

    location / {
        proxy_pass http://pyramid_tools;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Scaling Benefits:**
- Handle more concurrent users
- Improve availability (one instance can fail, others continue)
- Better performance (distribute load)
- Enable rolling updates (zero downtime)

**Scaling Limitations:**
- Client-side processing means server load is minimal (mostly static file serving)
- Scaling server instances provides availability, not performance (processing happens in browser)
- Consider CDN for static assets (more impactful than scaling servers)

### Security Best Practices

**Image Security:**
- ✓ Use official base images from Docker Hub (node:20-alpine)
- ✓ Use specific version tags, not 'latest' (node:20-alpine, not node:alpine)
- ✓ Minimize image layers (combine RUN commands where logical)
- ✓ Run as non-root user (nextjs user, UID 1001)
- ✓ Don't include secrets in image (no .env files, credentials, API keys)
- ✓ Use .dockerignore to prevent sensitive files from being copied
- ✓ Scan images for vulnerabilities regularly (docker scan, Trivy, Snyk)
- ✓ Update base images regularly to get security patches

**Runtime Security:**
- ✓ Set resource limits (prevent DoS via resource exhaustion)
- ✓ Use read-only filesystem where possible
- ✓ Drop unnecessary capabilities (Linux kernel capabilities)
- ✓ Enable SELinux or AppArmor profiles
- ✓ Use secrets management (Docker secrets, Kubernetes secrets, AWS Secrets Manager)
- ✓ Network isolation (don't expose unnecessary ports)
- ✓ Enable Docker Content Trust (image signing)
- ✓ Monitor container behavior (intrusion detection)

**Supply Chain Security:**
- ✓ Verify base image integrity (checksums, signatures)
- ✓ Use minimal base images (Alpine reduces attack surface)
- ✓ Audit dependencies regularly (npm audit, Snyk)
- ✓ Use lockfiles (package-lock.json) for reproducible builds
- ✓ Implement CI/CD security scanning
- ✓ Sign images before deployment
- ✓ Use private registries for internal images

**Example Security Scan:**
```bash
# Docker Desktop built-in scan
docker scan pyramid-tools

# Trivy (open-source scanner)
trivy image pyramid-tools

# Snyk (commercial)
snyk container test pyramid-tools
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            yourusername/pyramid-tools:latest
            yourusername/pyramid-tools:${{ github.sha }}
          cache-from: type=registry,ref=yourusername/pyramid-tools:latest
          cache-to: type=inline

      - name: Scan image for vulnerabilities
        run: |
          docker pull yourusername/pyramid-tools:${{ github.sha }}
          docker scan yourusername/pyramid-tools:${{ github.sha }}
```

**Benefits:**
- Automated builds on every commit
- Consistent build environment
- Automated testing and scanning
- Tagged with git commit SHA for traceability
- Pushed to registry automatically
- Ready for deployment

### Troubleshooting Common Issues

**Port Already in Use:**
```
Error: bind: address already in use
```
**Solution:** Another service is using port 3060
- Check: `lsof -i :3060` or `netstat -an | grep 3060`
- Stop the other service or use different port: `-p 3070:3060`

**Build Context Too Large:**
```
Sending build context to Docker daemon  2.5GB
```
**Solution:** .dockerignore not working or missing
- Verify .dockerignore exists in project root
- Ensure node_modules, .next, .git are listed
- Build context should be <10MB

**npm ci Fails:**
```
npm ERR! Cannot read property 'version' of undefined
```
**Solution:** package-lock.json out of sync or missing
- Regenerate: `rm -f package-lock.json && npm install`
- Commit updated package-lock.json
- Rebuild Docker image

**Permission Denied in Container:**
```
Error: EACCES: permission denied
```
**Solution:** File permission issues (common on Linux)
- Ensure proper chown in Dockerfile: `RUN chown -R nextjs:nodejs /app`
- Check volume mount permissions
- May need to adjust host filesystem permissions

**Container Exits Immediately:**
```
Container exited with code 1
```
**Solution:** Application failed to start
- Check logs: `docker logs <container-id>`
- Common causes:
  - Missing dependencies (npm ci failed)
  - Build failed (check build stage logs)
  - Port already in use inside container
  - Environment variable misconfiguration

**Hot-Reload Not Working in Dev Mode:**
**Solution:** Volume mount issues
- On Windows: Ensure Docker Desktop has WSL2 backend enabled
- On macOS: Verify /app is in Docker file sharing settings
- Check volume mounts in docker-compose.dev.yml
- Try rebuilding: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`

**Image Too Large (>1GB):**
**Solution:** Not using multi-stage build or dev dependencies included
- Verify Dockerfile has 3 stages (deps, builder, runner)
- Ensure runner stage only copies production files
- Use standalone output mode in next.config.ts
- Check that node_modules in runner comes from deps stage (production only)

### Environment Variables

Currently, the Pyramid Tools application doesn't require any environment variables as it's a pure client-side application. However, standard Next.js environment variables can be configured:

**Configurable Variables:**
- `PORT`: Server port (default: 3060 for production, 3050 for dev)
- `NODE_ENV`: Node environment (production, development, test)
- `HOSTNAME`: Hostname for server (default: 0.0.0.0)

**How to Set:**

**Docker Run:**
```bash
docker run -e PORT=3070 -e NODE_ENV=production -p 3070:3070 pyramid-tools
```

**Docker Compose:**
```yaml
services:
  app:
    environment:
      - PORT=3070
      - NODE_ENV=production
    # Or use env_file:
    env_file:
      - .env.production
```

**.env File:**
```bash
PORT=3060
NODE_ENV=production
```

**Important:**
- Don't commit .env files with secrets to Git
- Use .env.example for documentation
- Use secrets management in production (Docker secrets, Kubernetes secrets, AWS Secrets Manager)
- Client-side environment variables must be prefixed with NEXT_PUBLIC_

### Future Enhancements

Potential Docker-related improvements for future iterations:

- **Docker Compose Services:**
  - Add nginx reverse proxy service for load balancing
  - Add monitoring service (Prometheus, Grafana)
  - Add logging aggregation (ELK stack, Loki)

- **Advanced Optimizations:**
  - Implement BuildKit for faster builds
  - Use remote cache (AWS S3, GCP Cloud Storage)
  - Multi-architecture builds (AMD64 + ARM64)
  - Distroless base images for even smaller size

- **Monitoring and Observability:**
  - Add APM instrumentation (New Relic, Datadog)
  - Implement distributed tracing (Jaeger, Zipkin)
  - Add custom metrics export (StatsD, Prometheus)

- **High Availability:**
  - Add database (if backend features added)
  - Implement Redis for caching
  - Add message queue (RabbitMQ, Kafka)
  - Multi-region deployment

- **Development Improvements:**
  - Add Devcontainer configuration for VS Code
  - Include debugging support (Node.js inspector)
  - Pre-commit hooks in Docker
  - Test runner in Docker

### Testing the Docker Setup

**Comprehensive Test Checklist:**

**Build Tests:**
- [ ] Clean build succeeds: `docker build --no-cache -t pyramid-tools .`
- [ ] Cached build succeeds: `docker build -t pyramid-tools .`
- [ ] Image size is acceptable: `docker images pyramid-tools`
- [ ] Image has correct tags: `docker images | grep pyramid-tools`

**Run Tests:**
- [ ] Container starts: `docker run -d -p 3060:3060 pyramid-tools`
- [ ] Application accessible: http://localhost:3060
- [ ] Homepage loads correctly
- [ ] All tool cards visible
- [ ] Dark mode toggle works

**Functionality Tests:**
- [ ] Image to SVG: Upload, convert, download
- [ ] PDF Merger: Upload multiple PDFs, merge
- [ ] PDF Splitter: Upload PDF, split
- [ ] HEIC to JPEG: Upload HEIC, convert
- [ ] QR Code Generator: Generate and download
- [ ] Screenshot Annotator: Upload, annotate, download

**Docker Compose Tests:**
- [ ] Production mode starts: `docker compose up`
- [ ] Development mode starts: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
- [ ] Hot-reload works in dev mode
- [ ] Restart works: `docker compose restart`
- [ ] Stop works: `docker compose down`
- [ ] Logs accessible: `docker compose logs`

**Health Check Tests:**
- [ ] Health check configured: `docker inspect pyramid-tools | grep Health`
- [ ] Health status is healthy after startup
- [ ] Health check fails when app stops

**Security Tests:**
- [ ] Container runs as non-root: `docker exec pyramid-tools whoami` (should be "nextjs")
- [ ] Image scan passes: `docker scan pyramid-tools`
- [ ] No secrets in image: `docker history pyramid-tools` (check for sensitive data)

**Performance Tests:**
- [ ] Startup time <10 seconds
- [ ] Memory usage <512MB under normal load
- [ ] CPU usage <50% under normal load
- [ ] Rebuild time with cache <30 seconds

**Cross-Platform Tests:**
- [ ] Works on macOS
- [ ] Works on Linux
- [ ] Works on Windows (Docker Desktop)

This comprehensive Docker setup enables the Pyramid Tools application to be deployed consistently across any environment, from local development to cloud production, with optimal performance, security, and scalability.

# Docker Guide for Pyramid Tools

This guide provides comprehensive instructions for building, running, and deploying the Pyramid Tools application using Docker.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Image](#building-the-image)
- [Running the Container](#running-the-container)
- [Using Docker Compose](#using-docker-compose)
- [Development Workflow](#development-workflow)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Advanced Topics](#advanced-topics)

## Overview

The Pyramid Tools application uses a multi-stage Docker build process to create optimized, production-ready container images. The Docker setup includes:

- **Multi-stage Dockerfile**: Minimizes image size and improves security
- **Docker Compose**: Simplifies container orchestration
- **Development mode**: Enables hot-reload for faster development
- **Production mode**: Optimized for performance and security

**Key Features:**
- Image size: ~200-300MB (Alpine Linux base)
- Non-root user execution for security
- Health checks for container orchestration
- Layer caching for fast rebuilds
- Port 3060 (production) / 3050 (development)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: Version 20.10 or later
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (macOS, Windows)
  - [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)
- **Docker Compose**: Version 2.0 or later (included with Docker Desktop)

Verify your installation:

```bash
docker --version
docker compose version
```

## Quick Start

Get up and running in seconds:

```bash
# Clone the repository (if not already done)
cd pyramid-tools

# Start the application with Docker Compose
docker compose up

# Access the application
# Open http://localhost:3060 in your browser
```

To stop the application:

```bash
# Press Ctrl+C in the terminal, then:
docker compose down
```

## Building the Image

### Basic Build

Build the Docker image manually:

```bash
docker build -t pyramid-tools .
```

This creates an image tagged as `pyramid-tools:latest`.

### Build with Custom Tag

```bash
docker build -t pyramid-tools:v1.0 .
```

### Build Without Cache

Force a complete rebuild without using cached layers:

```bash
docker build --no-cache -t pyramid-tools .
```

### Check Image Size

```bash
docker images pyramid-tools
```

Expected size: 200-500MB depending on optimization.

## Running the Container

### Run with Docker CLI

Start a container from the built image:

```bash
docker run -d -p 3060:3060 --name pyramid-tools pyramid-tools
```

**Options explained:**
- `-d`: Run in detached mode (background)
- `-p 3060:3060`: Map host port 3060 to container port 3060
- `--name pyramid-tools`: Assign a name to the container
- `pyramid-tools`: The image to use

### Run in Foreground

To see logs in real-time:

```bash
docker run -p 3060:3060 --name pyramid-tools pyramid-tools
```

Press Ctrl+C to stop.

### Custom Port Mapping

Run on a different port:

```bash
docker run -d -p 8080:3060 --name pyramid-tools pyramid-tools
```

Access at `http://localhost:8080`

### With Environment Variables

```bash
docker run -d -p 3060:3060 \
  -e NODE_ENV=production \
  -e PORT=3060 \
  --name pyramid-tools \
  pyramid-tools
```

## Using Docker Compose

Docker Compose simplifies container management with a declarative configuration file.

### Production Mode

Start the application in production mode:

```bash
docker compose up
```

**Common options:**
- `-d`: Run in background (detached)
- `--build`: Rebuild images before starting
- `--force-recreate`: Recreate containers even if config hasn't changed

```bash
# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Container Management

```bash
# View running containers
docker compose ps

# Restart containers
docker compose restart

# Stop without removing
docker compose stop

# Start stopped containers
docker compose start

# Remove containers and networks
docker compose down

# Remove containers, networks, and volumes
docker compose down -v
```

### Scaling

Run multiple instances (requires load balancer):

```bash
docker compose up --scale app=3
```

**Note:** You'll need to configure a load balancer (nginx, HAProxy) to distribute traffic across instances.

## Development Workflow

Development mode enables hot-reload, allowing you to see code changes immediately without rebuilding the container.

### Start Development Server

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This command:
- Mounts your source code into the container
- Runs `npm run dev` instead of `npm start`
- Enables Next.js Fast Refresh
- Runs on port 3050

### Access Development Server

Open http://localhost:3050 in your browser.

### Making Changes

1. Edit files in the `app/` directory
2. Save your changes
3. Next.js automatically detects changes and recompiles
4. Browser refreshes automatically (Fast Refresh)

### Development Tips

- **Node modules**: Container's `node_modules` are preserved via anonymous volumes
- **Build cache**: `.next` directory is cached for faster rebuilds
- **Port conflicts**: Ensure port 3050 is available
- **Performance**: File watching may be slower on Windows/macOS due to Docker volume overhead

### Stop Development Server

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Environment Variables

The application supports standard Next.js environment variables.

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3060 (prod), 3050 (dev) |
| `NODE_ENV` | Environment | production |
| `HOSTNAME` | Server hostname | 0.0.0.0 |

### Setting Variables

**In docker-compose.yml:**

```yaml
services:
  app:
    environment:
      - PORT=3070
      - NODE_ENV=production
```

**Using .env file:**

1. Create `.env` file in project root:

```bash
PORT=3060
NODE_ENV=production
```

2. Reference in docker-compose.yml:

```yaml
services:
  app:
    env_file:
      - .env
```

**Command line:**

```bash
docker run -e PORT=3070 -e NODE_ENV=production -p 3070:3070 pyramid-tools
```

## Production Deployment

### Best Practices

1. **Use specific image tags** (not `latest`)
2. **Set resource limits** (CPU, memory)
3. **Enable health checks** (already configured)
4. **Use secrets management** for sensitive data
5. **Enable logging** to external service
6. **Configure auto-restart** policies
7. **Use HTTPS/TLS** termination at load balancer

### Docker Compose Production

```yaml
version: '3.8'

services:
  app:
    image: pyramid-tools:1.0
    container_name: pyramid-tools
    ports:
      - "3060:3060"
    environment:
      - NODE_ENV=production
      - PORT=3060
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3060', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### Cloud Deployment Examples

#### AWS ECS

```bash
# Build and tag image
docker build -t pyramid-tools:latest .
docker tag pyramid-tools:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/pyramid-tools:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/pyramid-tools:latest

# Create ECS task definition and service (via AWS Console or CLI)
```

#### Google Cloud Run

```bash
# Build and tag
docker build -t gcr.io/PROJECT_ID/pyramid-tools:latest .

# Push to GCR
docker push gcr.io/PROJECT_ID/pyramid-tools:latest

# Deploy to Cloud Run
gcloud run deploy pyramid-tools \
  --image gcr.io/PROJECT_ID/pyramid-tools:latest \
  --platform managed \
  --region us-central1 \
  --port 3060
```

#### Azure Container Instances

```bash
# Create container registry
az acr create --resource-group myResourceGroup --name pyramidtoolsregistry --sku Basic

# Build and push
az acr build --registry pyramidtoolsregistry --image pyramid-tools:latest .

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name pyramid-tools \
  --image pyramidtoolsregistry.azurecr.io/pyramid-tools:latest \
  --dns-name-label pyramid-tools \
  --ports 3060
```

## Troubleshooting

### Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
1. Check what's using the port:
   ```bash
   lsof -i :3060
   # or
   netstat -an | grep 3060
   ```

2. Stop the conflicting service or use a different port:
   ```bash
   docker run -p 3070:3060 pyramid-tools
   ```

### Build Context Too Large

**Error:**
```
Sending build context to Docker daemon  2.5GB
```

**Solution:**
- Verify `.dockerignore` exists and excludes `node_modules`, `.next`, `.git`
- Clean up unused files in the project directory
- Expected context size: <10MB

### Container Exits Immediately

**Error:**
```
Container exited with code 1
```

**Solution:**
1. Check logs:
   ```bash
   docker logs pyramid-tools
   ```

2. Common causes:
   - Missing dependencies: Rebuild with `--no-cache`
   - Port conflict inside container
   - Build failed: Check build logs
   - Permission issues: Verify file ownership

### Hot-Reload Not Working (Dev Mode)

**Solution:**
- On Windows: Ensure Docker Desktop uses WSL2 backend
- On macOS: Verify Docker Desktop file sharing settings
- Try rebuilding: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`
- Check file permissions

### Image Too Large

**Solution:**
- Verify multi-stage build is working (check Dockerfile stages)
- Ensure production dependencies only in final stage
- Remove unnecessary files via `.dockerignore`
- Expected size: 200-500MB

### Health Check Failing

**Solution:**
1. Check if application is responding:
   ```bash
   docker exec pyramid-tools curl http://localhost:3060
   ```

2. Increase health check timeouts in docker-compose.yml:
   ```yaml
   healthcheck:
     start_period: 10s
     timeout: 5s
   ```

## Security Best Practices

### Image Security

- ✓ Using official Node.js base image
- ✓ Alpine Linux (minimal attack surface)
- ✓ Non-root user (nextjs, UID 1001)
- ✓ No secrets in image
- ✓ Minimal layers

### Runtime Security

```yaml
# docker-compose.yml with security options
services:
  app:
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
```

### Scanning for Vulnerabilities

```bash
# Docker Desktop built-in
docker scan pyramid-tools

# Trivy (open-source)
trivy image pyramid-tools

# Snyk (commercial)
snyk container test pyramid-tools
```

### Secrets Management

**Never include secrets in:**
- Dockerfile
- Environment variables in docker-compose.yml (for production)
- Git repository

**Use instead:**
- Docker secrets (Swarm mode)
- Kubernetes secrets
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

## Advanced Topics

### Multi-Architecture Builds

Build for both AMD64 and ARM64:

```bash
# Create buildx builder
docker buildx create --use

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t pyramid-tools:latest .
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t pyramid-tools:${{ github.sha }} .

      - name: Run tests
        run: docker run pyramid-tools:${{ github.sha }} npm test

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push pyramid-tools:${{ github.sha }}
```

### Custom nginx Reverse Proxy

Example nginx configuration for load balancing:

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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring and Logging

Export logs to external service:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Or use log aggregation:

```yaml
services:
  app:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://logstash:5000"
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

## Support

For issues specific to the Pyramid Tools application:
- Check the main [README.md](../README.md)
- Review this Docker guide
- Check Docker logs: `docker logs pyramid-tools`
- Inspect container: `docker inspect pyramid-tools`

For Docker-related issues:
- [Docker Community Forums](https://forums.docker.com/)
- [Stack Overflow - Docker](https://stackoverflow.com/questions/tagged/docker)

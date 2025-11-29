# Docker Deployment Guide

## Prerequisites

- Docker installed
- Docker Compose installed

Check with:
```bash
docker --version
docker-compose --version
```

---

## Quick Start with Docker

### 1. Build and Start All Services

```bash
cd /home/harry/Downloads/microservices/env-monitor
docker-compose up --build
```

This will:
- Build both backend and frontend containers
- Start the backend on port 3000
- Start the frontend on port 4200
- Create a shared network for inter-service communication
- Set up volume mounts for hot-reloading

### 2. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## Docker Commands

### Start Services (Detached Mode)
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose up --build backend

# Rebuild all services
docker-compose up --build
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Running Containers
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh

# Run npm commands
docker-compose exec backend npm install
```

---

## Docker Compose Configuration

### Services:

#### Backend (`env-monitor-backend`)
- **Port**: 3000
- **Technology**: Node.js + Express + TypeScript + SQLite
- **Hot Reload**: Enabled via volume mount
- **Health Check**: Checks `/health` endpoint every 30s
- **Database**: SQLite persisted in `./env-monitor-backend/data` volume

#### Frontend (`env-monitor-frontend`)
- **Port**: 4200
- **Technology**: Angular
- **Hot Reload**: Enabled via volume mount
- **Depends On**: Backend (waits for backend health check)

#### Network
- **Name**: `env-monitor-network`
- **Type**: Bridge network
- Services can communicate using service names (e.g., `http://backend:3000`)

---

## Viewing Database in Docker

### Option 1: Use Node.js in Container
```bash
docker-compose exec backend node -e "const db = require('better-sqlite3')('data/environments.db'); console.table(db.prepare('SELECT * FROM environments').all())"
```

### Option 2: Access via API
```bash
curl http://localhost:3000/api/environments
```

### Option 3: Copy Database Out and View Locally
```bash
docker cp env-monitor-backend:/app/data/environments.db ./environments.db
# Then use sqlite3 if installed locally
```

### Option 4: Execute Shell in Container
```bash
docker-compose exec backend sh
cd data
ls -la
# If sqlite3 was installed in container, you could use it here
```

---

## Testing the Dockerized Application

### Test Backend API
```bash
# Health check
curl http://localhost:3000/health

# Get all environments
curl http://localhost:3000/api/environments

# Create new environment
curl -X POST http://localhost:3000/api/environments \
  -H "Content-Type: application/json" \
  -d '{"url":"http://docker-test.com","status":"working","name":"Docker Test"}'
```

### Test Frontend
Open browser to http://localhost:4200

### Run API Test Script
```bash
# From host machine (backend must be accessible on localhost:3000)
./test-api.sh
```

---

## Volume Mounts

### Backend Volumes:
- `./env-monitor-backend/src:/app/src` - Source code hot reload
- `./env-monitor-backend/data:/app/data` - SQLite database persistence

### Frontend Volumes:
- `./env-monitor-frontend/src:/app/src` - Source code hot reload
- `/app/node_modules` - Prevents host node_modules from overriding container

**Benefits:**
- Code changes on host automatically trigger rebuild
- Database persists even after containers are stopped
- No need to rebuild for code changes

---

## Production Build (Optional)

For production deployment, you'd want to:

### Backend Production Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Frontend Production Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/env-monitor /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 4200
lsof -ti:4200 | xargs kill -9

# Then restart docker-compose
docker-compose up
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Remove containers and rebuild
docker-compose down
docker-compose up --build
```

### Database Issues
```bash
# Remove database and let it reinitialize
rm -rf env-monitor-backend/data/environments.db*
docker-compose restart backend
```

### Permission Issues
```bash
# Fix ownership of data directory
sudo chown -R $USER:$USER env-monitor-backend/data
```

### Clean Everything and Start Fresh
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build
```

### Frontend Can't Connect to Backend
- Verify backend is healthy: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Test backend from host: `curl http://localhost:3000/health`
- Frontend should use `http://localhost:3000/api` (not the container name)

---

## Development Workflow

1. **Start containers**: `docker-compose up`
2. **Make code changes** in your IDE on the host
3. **Watch automatic reload** in the docker logs
4. **Test changes** in browser
5. **View logs**: `docker-compose logs -f`
6. **Stop when done**: `Ctrl+C` or `docker-compose down`

---

## Monitoring

### Watch All Logs
```bash
docker-compose logs -f
```

### Watch Resource Usage
```bash
docker stats
```

### Inspect Network
```bash
docker network inspect env-monitor_env-monitor-network
```

### Inspect Containers
```bash
docker inspect env-monitor-backend
docker inspect env-monitor-frontend
```

---

## Environment Variables

You can create a `.env` file in the root directory:

```env
# Backend
BACKEND_PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_PORT=4200
```

Then update docker-compose.yaml to use `${BACKEND_PORT}` etc.

---

## Next Steps

- Add environment-specific configurations
- Set up production builds
- Add nginx reverse proxy
- Implement CI/CD pipeline
- Add monitoring and logging services
- Scale services with replicas

# Environment Monitor - Microservices Application

A full-stack microservices application for monitoring environment statuses with real-time updates.

## 🏗️ Architecture

- **Frontend**: Angular 19 (port 4200)
- **Backend**: Express.js + TypeScript (port 3000)
- **Database**: SQLite (persisted in volume)
- **Deployment**: Docker Compose

## 🚀 Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Start the Application

```bash
# Option 1: Using the start script
./docker-start.sh

# Option 2: Using docker-compose directly
docker-compose up --build

# Option 3: Detached mode (background)
docker-compose up -d --build
```

### Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/environments
- **Health Check**: http://localhost:3000/health

## 📋 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### View Running Containers
```bash
docker-compose ps
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### View Database
```bash
# Using Node.js in container
docker-compose exec backend node -e "const db = require('better-sqlite3')('data/environments.db'); console.table(db.prepare('SELECT * FROM environments').all())"

# Via API
curl http://localhost:3000/api/environments
```

## 🧪 Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Get all environments
curl http://localhost:3000/api/environments

# Create environment
curl -X POST http://localhost:3000/api/environments \
  -H "Content-Type: application/json" \
  -d '{"url":"http://test.com","status":"working","name":"Test Server"}'

# Update environment
curl -X PUT http://localhost:3000/api/environments/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"degraded"}'

# Delete environment
curl -X DELETE http://localhost:3000/api/environments/1
```

### Run Automated Tests
```bash
./test-api.sh
```

## 📂 Project Structure

```
env-monitor/
├── env-monitor-backend/       # Express API backend
│   ├── src/
│   │   ├── db/                # Database layer (SQLite)
│   │   ├── models/            # TypeScript models
│   │   ├── routes/            # API routes
│   │   └── index.ts           # Server entry point
│   ├── data/                  # SQLite database (persisted)
│   ├── Dockerfile             # Backend container
│   └── package.json
│
├── env-monitor-frontend/      # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services & models
│   │   │   └── features/      # Feature modules
│   │   └── environments/      # Environment configs
│   ├── Dockerfile             # Frontend container
│   └── package.json
│
├── docker-compose.yaml        # Docker orchestration
├── docker-start.sh            # Quick start script
├── test-api.sh                # API test script
│
└── Documentation:
    ├── README.md              # This file
    ├── QUICKSTART.md          # Quick start guide
    ├── DOCKER_GUIDE.md        # Docker documentation
    └── TESTING_GUIDE.md       # Testing instructions
```

## 🔧 Development Without Docker

### Backend
```bash
cd env-monitor-backend
npm install
npm run dev
```

### Frontend
```bash
cd env-monitor-frontend
npm install
npm start
```

## 🐳 Docker Details

### Services

#### Backend
- Built from `env-monitor-backend/Dockerfile`
- Runs on port 3000
- Hot reload enabled
- Health check monitors `/health` endpoint
- SQLite database persisted in volume

#### Frontend
- Built from `env-monitor-frontend/Dockerfile`
- Runs on port 4200
- Hot reload enabled
- Waits for backend health check before starting
- Connects to backend at `http://localhost:3000`

### Volumes
- `./env-monitor-backend/src:/app/src` - Backend hot reload
- `./env-monitor-backend/data:/app/data` - Database persistence
- `./env-monitor-frontend/src:/app/src` - Frontend hot reload

### Network
- Bridge network: `env-monitor_env-monitor-network`
- Containers can communicate using service names

## 📊 Features

- ✅ Real-time environment status monitoring
- ✅ CRUD operations for environments
- ✅ SQLite database with persistence
- ✅ Hot reload for development
- ✅ Health checks
- ✅ Containerized deployment
- ✅ RESTful API
- ✅ Responsive UI

## 🔍 API Endpoints

| Method | Endpoint                    | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/health`                  | Health check             |
| GET    | `/api/environments`        | Get all environments     |
| GET    | `/api/environments/:id`    | Get single environment   |
| POST   | `/api/environments`        | Create environment       |
| PUT    | `/api/environments/:id`    | Update environment       |
| DELETE | `/api/environments/:id`    | Delete environment       |

## 📚 Documentation

- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Comprehensive Docker documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start without Docker
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing instructions

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:4200 | xargs kill -9
```

### Rebuild Containers
```bash
docker-compose down
docker-compose up --build
```

### Reset Database
```bash
rm -rf env-monitor-backend/data/environments.db*
docker-compose restart backend
```

### View Container Logs
```bash
docker-compose logs -f
```

## 📝 License

MIT

## 👥 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

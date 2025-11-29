# Quick Start Guide

## 🚀 Start Your Application

### Terminal 1: Start Backend
```bash
cd /home/harry/Downloads/microservices/env-monitor/env-monitor-backend
npm run dev
```

You should see:
```
🚀 Environment Monitor Backend
✅ Server running on port 3000
✅ Database initialized with mock data
```

### Terminal 2: Start Frontend
```bash
cd /home/harry/Downloads/microservices/env-monitor/env-monitor-frontend
npm start
```

Frontend will be available at: http://localhost:4200

---

## 🧪 Test the API

### Terminal 3: Run automated tests
```bash
cd /home/harry/Downloads/microservices/env-monitor
./test-api.sh
```

This will test all CRUD operations and show you if everything is working.

### Manual API tests:
```bash
# Get all environments
curl http://localhost:3000/api/environments

# Create a new environment
curl -X POST http://localhost:3000/api/environments \
  -H "Content-Type: application/json" \
  -d '{"url":"192.168.1.50","status":"working","name":"My Server"}'
```

---

## 🔍 Monitor the SQL Database

### Terminal 4: Watch database in real-time
```bash
cd /home/harry/Downloads/microservices/env-monitor/env-monitor-backend
./monitor-db.sh
```

This shows the database contents and refreshes every 2 seconds.

### Or use sqlite3 directly:
```bash
cd /home/harry/Downloads/microservices/env-monitor/env-monitor-backend
sqlite3 data/environments.db

# Inside sqlite3:
.mode column
.headers on
SELECT * FROM environments;
.quit
```

---

## 📊 See Data Flow

1. **Start the database monitor** (Terminal 4)
2. **Watch backend logs** (Terminal 1) - shows all HTTP requests
3. **Make a change in the frontend** (http://localhost:4200)
4. **Watch the sequence:**
   - Frontend makes HTTP request (check browser DevTools → Network tab)
   - Backend logs the request (Terminal 1)
   - Database updates (Terminal 4 shows new data)

---

## 🎯 Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 4200
- [ ] Health check works: `curl http://localhost:3000/health`
- [ ] API returns data: `curl http://localhost:3000/api/environments`
- [ ] Frontend loads in browser
- [ ] Can see mock data (4 environments)
- [ ] Database monitor shows data
- [ ] Can create/update/delete via API
- [ ] Changes reflect in database monitor

---

## 📝 Useful Commands

```bash
# View backend logs with requests
cd env-monitor-backend && npm run dev

# Run API tests
./test-api.sh

# Check database directly
sqlite3 env-monitor-backend/data/environments.db "SELECT * FROM environments"

# Count records
sqlite3 env-monitor-backend/data/environments.db "SELECT COUNT(*) FROM environments"

# Watch for changes
watch -n 2 'sqlite3 env-monitor-backend/data/environments.db "SELECT * FROM environments ORDER BY last_updated DESC"'
```

---

## ❓ Troubleshooting

**Port already in use:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

**Database locked:**
- Close all sqlite3 connections
- Restart the backend server

**CORS errors:**
- Make sure backend is running
- Check that backend is on port 3000

For more details, see [TESTING_GUIDE.md](TESTING_GUIDE.md)

# Environment Monitor - Testing Guide

## Quick Start Testing

### 1. Start the Backend Server

```bash
cd env-monitor-backend
npm run dev
```

Expected output:
```
🚀 Environment Monitor Backend
================================
✅ Server running on port 3000
✅ Health check: http://localhost:3000/health
✅ API endpoint: http://localhost:3000/api/environments
✅ Database initialized with mock data
```

### 2. Start the Frontend

In a new terminal:
```bash
cd env-monitor-frontend
npm start
```

Expected output:
```
** Angular Live Development Server is listening on localhost:4200
```

### 3. Access the Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

---

## Testing the API with curl

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{"status":"ok","timestamp":"2025-11-29T..."}
```

### Test 2: Get All Environments
```bash
curl http://localhost:3000/api/environments
```
Expected: List of 4 mock environments

### Test 3: Get Single Environment
```bash
curl http://localhost:3000/api/environments/1
```

### Test 4: Create New Environment
```bash
curl -X POST http://localhost:3000/api/environments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staging Server",
    "url": "https://staging.example.com",
    "version": "v1.0.0",
    "status": "working",
    "notes": "Test environment"
  }'
```

### Test 5: Update Environment
```bash
curl -X PUT http://localhost:3000/api/environments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "degraded",
    "notes": "Server experiencing high load"
  }'
```

### Test 6: Delete Environment
```bash
curl -X DELETE http://localhost:3000/api/environments/1
```

---

## Monitoring SQL Database Activity

### Option 1: Using sqlite3 CLI (Recommended)

Install SQLite CLI if not already installed:
```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS
brew install sqlite3
```

Connect to the database:
```bash
cd env-monitor-backend
sqlite3 data/environments.db
```

Inside sqlite3 shell:
```sql
-- View all records
SELECT * FROM environments;

-- View with formatting
.mode column
.headers on
SELECT * FROM environments;

-- Watch for changes (re-run this query to see updates)
SELECT id, name, status, last_updated FROM environments ORDER BY last_updated DESC;

-- Count records
SELECT COUNT(*) FROM environments;

-- Exit
.quit
```

### Option 2: Watch Database Changes in Real-Time

Create a simple script to monitor database:
```bash
cd env-monitor-backend
watch -n 2 'sqlite3 data/environments.db "SELECT id, name, url, status, last_updated FROM environments ORDER BY last_updated DESC" -header -column'
```

This refreshes every 2 seconds showing the latest data.

### Option 3: Add SQL Logging to Backend

The backend already logs all HTTP requests. To see SQL queries, you can add logging to the database operations in `src/db/database.ts`.

---

## Testing Workflow Example

### Complete End-to-End Test

1. **Start both servers** (backend on :3000, frontend on :4200)

2. **Open the database monitor** in one terminal:
```bash
cd env-monitor-backend
watch -n 2 'sqlite3 data/environments.db "SELECT * FROM environments" -header -column'
```

3. **Check backend logs** in another terminal (shows HTTP requests)

4. **Test via Frontend**:
   - Open http://localhost:4200 in browser
   - Create a new environment via the UI
   - Watch the database monitor update
   - Check backend logs for the POST request

5. **Test via API**:
```bash
# Create
curl -X POST http://localhost:3000/api/environments \
  -H "Content-Type: application/json" \
  -d '{"url":"192.168.1.50","status":"working","name":"Test Server"}'

# Verify in database monitor - you should see the new entry
# Verify in frontend - refresh the page to see the new entry
```

---

## Verifying Data Flow

### Backend → Database
Watch backend console for:
```
2025-11-29T... - POST /api/environments
```

Then check database:
```bash
sqlite3 env-monitor-backend/data/environments.db "SELECT * FROM environments ORDER BY last_updated DESC LIMIT 1"
```

### Frontend → Backend → Database
1. Open browser developer tools (F12)
2. Go to Network tab
3. Make changes in the UI
4. Watch for XHR/Fetch requests to `http://localhost:3000/api/environments`
5. Check backend console for logged requests
6. Verify in database

---

## Database Direct Queries

### Useful SQL Queries

```sql
-- View recent changes
SELECT id, name, status, last_updated
FROM environments
ORDER BY last_updated DESC
LIMIT 5;

-- Count by status
SELECT status, COUNT(*) as count
FROM environments
GROUP BY status;

-- Find specific environment
SELECT * FROM environments WHERE url LIKE '%example%';

-- View table schema
.schema environments

-- Database file info
.dbinfo
```

---

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use: `lsof -i :3000`
- Install dependencies: `cd env-monitor-backend && npm install`

### Frontend won't start
- Check if port 4200 is already in use: `lsof -i :4200`
- Install dependencies: `cd env-monitor-frontend && npm install`

### Database locked error
- Close any open sqlite3 connections
- WAL mode is enabled to prevent most lock issues

### CORS errors in browser
- Ensure backend is running
- Check that CORS is enabled in backend (it is by default)

### Data not showing in frontend
- Check browser console for errors
- Verify backend is running: `curl http://localhost:3000/health`
- Check API response: `curl http://localhost:3000/api/environments`

# Database Enhancement Examples

## 🚀 Optional Improvements for Your Database

These are **optional enhancements** you can add when needed. Your current setup is fine!

---

## 1. Add Performance Indexes

Add these lines after table creation in `src/db/database.ts`:

```typescript
// After the CREATE TABLE statement (around line 22)

// Create indexes for better query performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_status ON environments(status);
  CREATE INDEX IF NOT EXISTS idx_last_updated ON environments(last_updated);
  CREATE INDEX IF NOT EXISTS idx_url ON environments(url);
`);
```

**Benefits:**
- 10-100x faster queries when filtering by status
- 5-50x faster when sorting by last_updated
- Faster searches by URL

---

## 2. Add Database Statistics Endpoint

### Add to `src/db/database.ts`:

```typescript
import fs from 'fs';

// Add at the end of the file, before export default db;

export const dbStats = {
  getSize(): number {
    const stats = fs.statSync(dbPath);
    return stats.size; // bytes
  },

  getRowCount(): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM environments').get() as { count: number };
    return result.count;
  },

  getStatusBreakdown() {
    const rows = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM environments
      GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    return rows;
  },

  getSummary() {
    const sizeBytes = this.getSize();
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    const rowCount = this.getRowCount();
    const statusBreakdown = this.getStatusBreakdown();

    return {
      database: {
        sizeBytes,
        sizeKB: `${sizeKB} KB`,
        sizeMB: `${sizeMB} MB`,
        path: dbPath,
      },
      environments: {
        total: rowCount,
        byStatus: statusBreakdown,
        avgBytesPerRow: rowCount > 0 ? Math.round(sizeBytes / rowCount) : 0,
      },
    };
  },

  optimize() {
    console.log('🔧 Optimizing database...');
    db.exec('ANALYZE');
    console.log('✅ Database analyzed');
  },

  vacuum() {
    console.log('🔧 Running VACUUM (this may take a while)...');
    db.exec('VACUUM');
    console.log('✅ Database vacuumed and optimized');
  },
};
```

### Add Route in `src/routes/environments.routes.ts`:

```typescript
import { dbStats } from '../db/database';

// Add this route at the end, before export default router;

// GET /api/environments/stats - Get database statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = dbStats.getSummary();
    res.json(stats);
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Usage:**
```bash
curl http://localhost:3000/api/environments/stats
```

**Response:**
```json
{
  "database": {
    "sizeBytes": 16384,
    "sizeKB": "16.00 KB",
    "sizeMB": "0.02 MB",
    "path": "/app/data/environments.db"
  },
  "environments": {
    "total": 5,
    "byStatus": [
      { "status": "working", "count": 2 },
      { "status": "degraded", "count": 2 },
      { "status": "down", "count": 1 }
    ],
    "avgBytesPerRow": 3277
  }
}
```

---

## 3. Create Backup Script

Create `env-monitor-backend/backup-db.sh`:

```bash
#!/bin/bash
# SQLite Database Backup Script

DB_PATH="data/environments.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database..."

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at $DB_PATH"
    exit 1
fi

# Copy database file (SQLite supports this even while running)
cp "$DB_PATH" "$BACKUP_DIR/environments_$TIMESTAMP.db"

# Compress backup
gzip "$BACKUP_DIR/environments_$TIMESTAMP.db"

echo "✅ Backup created: $BACKUP_DIR/environments_$TIMESTAMP.db.gz"

# Show backup size
du -h "$BACKUP_DIR/environments_$TIMESTAMP.db.gz"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "environments_*.db.gz" -mtime +30 -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "environments_*.db.gz" | wc -l)
echo "📊 Total backups: $BACKUP_COUNT"
```

Make it executable:
```bash
chmod +x env-monitor-backend/backup-db.sh
```

Run backup:
```bash
cd env-monitor-backend
./backup-db.sh
```

Restore from backup:
```bash
# Stop the application first
docker-compose down

# Restore
gunzip -c backups/environments_20250129_120000.db.gz > data/environments.db

# Restart
docker-compose up -d
```

---

## 4. Add Maintenance Endpoints (Admin Only)

Add maintenance routes in `src/routes/environments.routes.ts`:

```typescript
// POST /api/environments/maintenance/optimize - Optimize database
router.post('/maintenance/optimize', (req: Request, res: Response) => {
  try {
    dbStats.optimize();
    res.json({ success: true, message: 'Database optimized' });
  } catch (error) {
    console.error('Error optimizing database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/environments/maintenance/vacuum - Vacuum database
router.post('/maintenance/vacuum', (req: Request, res: Response) => {
  try {
    const sizeBefore = dbStats.getSize();
    dbStats.vacuum();
    const sizeAfter = dbStats.getSize();
    const saved = sizeBefore - sizeAfter;

    res.json({
      success: true,
      message: 'Database vacuumed',
      spaceReclaimed: `${(saved / 1024).toFixed(2)} KB`,
    });
  } catch (error) {
    console.error('Error vacuuming database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Usage:**
```bash
# Optimize (analyze query planner)
curl -X POST http://localhost:3000/api/environments/maintenance/optimize

# Vacuum (reclaim space)
curl -X POST http://localhost:3000/api/environments/maintenance/vacuum
```

---

## 5. Monitoring Script

Create `env-monitor-backend/monitor-stats.sh`:

```bash
#!/bin/bash
# Database monitoring script

echo "📊 Environment Monitor - Database Statistics"
echo "==========================================="
echo ""

# Database file size
DB_SIZE=$(du -h data/environments.db | cut -f1)
echo "💾 Database Size: $DB_SIZE"

# Row count
ROW_COUNT=$(docker-compose exec -T backend node -e "const db = require('better-sqlite3')('data/environments.db'); console.log(db.prepare('SELECT COUNT(*) as c FROM environments').get().c)" 2>/dev/null)
echo "📝 Total Environments: $ROW_COUNT"

# Status breakdown
echo ""
echo "Status Breakdown:"
docker-compose exec -T backend node -e "
const db = require('better-sqlite3')('data/environments.db');
const rows = db.prepare('SELECT status, COUNT(*) as count FROM environments GROUP BY status').all();
rows.forEach(r => console.log('  ' + r.status + ': ' + r.count));
" 2>/dev/null

echo ""
echo "Last 5 Updates:"
docker-compose exec -T backend node -e "
const db = require('better-sqlite3')('data/environments.db');
const rows = db.prepare('SELECT id, url, status, last_updated FROM environments ORDER BY last_updated DESC LIMIT 5').all();
rows.forEach(r => console.log('  ' + r.url + ' - ' + r.status + ' (' + r.last_updated + ')'));
" 2>/dev/null
```

---

## When to Apply These Enhancements

### Apply Now:
- ✅ **Indexes** - No downside, only benefits

### Apply Later (When Needed):
- Stats endpoint - When you want to monitor database size
- Backup script - When data becomes important
- Maintenance endpoints - When database needs optimization
- Monitoring script - For operational visibility

### Don't Need:
- Vacuuming - Unless you delete many records
- Complex monitoring - Database will stay small

---

## Summary

Your current database setup is **excellent** for the use case! These enhancements are:
- **Optional** - Not required
- **Future-proof** - For when you scale
- **Low-cost** - Easy to add when needed

**Current status:** ✅ Production-ready as-is!

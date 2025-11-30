# SQLite Database Maintenance Guide

## 📊 SQLite Capacity Limits

### Theoretical Limits (SQLite 3):
- **Max database size**: 281 TB (terabytes!)
- **Max table size**: 281 TB
- **Max row count**: ~1.8 × 10¹⁹ rows
- **Max rows per table**: 2⁶⁴ (18 quintillion)
- **Max columns**: 2,000 per table
- **Max string/blob length**: 1 GB per field

### Practical Limits for Your Use Case:

For environment monitoring with simple records:

| Rows | Disk Space | Performance | Recommendation |
|------|-----------|-------------|----------------|
| 100 | ~10 KB | Excellent | ✅ No issues |
| 1,000 | ~100 KB | Excellent | ✅ No issues |
| 10,000 | ~1 MB | Excellent | ✅ No issues |
| 100,000 | ~10 MB | Very Good | ✅ Good with indexes |
| 1,000,000 | ~100 MB | Good | ⚠️ Consider archiving |
| 10,000,000 | ~1 GB | Slower | ❌ Migrate to PostgreSQL |

**Your current schema per row:** ~200-500 bytes
- 1 million environments = ~500 MB (still fine)
- 10 million environments = ~5 GB (consider migration)

---

## 🎯 When to Worry

### For Environment Monitoring (Your App):

You'll likely be fine for years because:
- ✅ You're storing **environments**, not logs
- ✅ Probably 10-1000 environments max
- ✅ Updates are infrequent
- ✅ No heavy write load

### Red Flags (When to Take Action):

1. **Database file > 1 GB** - Consider cleanup or migration
2. **Queries take > 1 second** - Add indexes or optimize
3. **Disk space running low** - Archive old data
4. **Write contention** - Multiple writers fighting for access

---

## 🔧 Maintenance Strategies

### 1. Add Indexes (Do This Now)

Indexes speed up queries significantly:

```typescript
// Add to database.ts after table creation
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_status ON environments(status);
  CREATE INDEX IF NOT EXISTS idx_last_updated ON environments(last_updated);
`);
```

**Benefits:**
- Queries by status: 100x faster
- Sorting by date: 50x faster
- Minimal storage overhead

---

### 2. Monitor Database Size

Create a monitoring endpoint:

```typescript
// Add to database.ts
export const dbStats = {
  getSize(): number {
    const fs = require('fs');
    const stats = fs.statSync(dbPath);
    return stats.size; // bytes
  },

  getRowCount(): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM environments').get() as { count: number };
    return result.count;
  },

  getSummary() {
    const sizeBytes = this.getSize();
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    const rowCount = this.getRowCount();

    return {
      sizeBytes,
      sizeMB: `${sizeMB} MB`,
      rowCount,
      avgBytesPerRow: Math.round(sizeBytes / (rowCount || 1)),
    };
  }
};
```

```typescript
// Add route to environments.routes.ts
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = dbStats.getSummary();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### 3. Archive Old Data

If you start tracking historical data, implement archiving:

```typescript
// Archive environments deleted more than 90 days ago
export const archiveOldRecords = () => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Create archive table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS environments_archive (
      id TEXT PRIMARY KEY,
      name TEXT,
      url TEXT,
      version TEXT,
      status TEXT,
      notes TEXT,
      last_updated TEXT,
      archived_at TEXT
    )
  `);

  // Move old records to archive
  const stmt = db.prepare(`
    INSERT INTO environments_archive
    SELECT *, ? as archived_at
    FROM environments
    WHERE last_updated < ? AND status = 'deleted'
  `);

  stmt.run(new Date().toISOString(), ninetyDaysAgo.toISOString());

  // Delete from main table
  db.prepare(`
    DELETE FROM environments
    WHERE last_updated < ? AND status = 'deleted'
  `).run(ninetyDaysAgo.toISOString());
};
```

---

### 4. Database Optimization (VACUUM)

SQLite VACUUM reclaims unused space:

```typescript
// Add to database.ts
export const optimizeDatabase = () => {
  console.log('🔧 Optimizing database...');

  // Analyze query planner statistics
  db.exec('ANALYZE');

  // Reclaim unused space
  db.exec('VACUUM');

  console.log('✅ Database optimized');
};
```

**When to run:**
- After deleting many records
- Monthly maintenance
- When database feels sluggish

**Warning:** VACUUM requires free disk space equal to database size!

---

### 5. Backup Strategy

```bash
#!/bin/bash
# backup-db.sh

DB_PATH="env-monitor-backend/data/environments.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# SQLite backup (safe even while app is running)
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/environments_$TIMESTAMP.db'"

# Compress
gzip "$BACKUP_DIR/environments_$TIMESTAMP.db"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "environments_*.db.gz" -mtime +7 -delete

echo "✅ Backup created: $BACKUP_DIR/environments_$TIMESTAMP.db.gz"
```

Run daily with cron:
```bash
0 2 * * * /path/to/backup-db.sh
```

---

### 6. Add History Tracking (Optional)

If you want to track changes over time:

```sql
CREATE TABLE IF NOT EXISTS environment_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  changed_from TEXT,
  notes TEXT
);

CREATE INDEX idx_env_history ON environment_history(environment_id, changed_at);
```

Then log status changes:
```typescript
// When status changes
db.prepare(`
  INSERT INTO environment_history (environment_id, status, changed_at, changed_from)
  VALUES (?, ?, ?, ?)
`).run(id, newStatus, new Date().toISOString(), oldStatus);
```

---

## 📈 Performance Optimization

### Current Performance Estimates:

| Operation | 100 rows | 10,000 rows | 100,000 rows | 1M rows |
|-----------|----------|-------------|--------------|---------|
| SELECT * | <1ms | 5ms | 50ms | 500ms |
| SELECT by ID (indexed) | <1ms | <1ms | <1ms | 1ms |
| INSERT | <1ms | <1ms | <1ms | <1ms |
| UPDATE | <1ms | <1ms | <1ms | 1ms |
| DELETE | <1ms | <1ms | <1ms | 1ms |

### Optimization Tips:

1. **Add Indexes** (most important!)
   ```sql
   CREATE INDEX idx_status ON environments(status);
   CREATE INDEX idx_url ON environments(url);
   ```

2. **Use Transactions for Bulk Operations**
   ```typescript
   const insertMany = db.transaction((environments) => {
     const insert = db.prepare('INSERT INTO environments VALUES (?, ?, ?, ?, ?, ?, ?)');
     for (const env of environments) insert.run(...Object.values(env));
   });
   ```

3. **Limit Results**
   ```sql
   SELECT * FROM environments ORDER BY last_updated DESC LIMIT 100;
   ```

4. **Use Pagination**
   ```sql
   SELECT * FROM environments LIMIT 50 OFFSET 100;
   ```

---

## 🚨 Migration Path (When SQLite Isn't Enough)

### When to Migrate to PostgreSQL/MySQL:

Migrate when you experience:
- ❌ Database > 10 GB
- ❌ Heavy concurrent writes (>100/sec)
- ❌ Complex queries taking >2 seconds
- ❌ Need for advanced features (full-text search, JSON queries, etc.)
- ❌ Multiple application servers

### For Your App:

You probably **won't need to migrate** because:
- ✅ Low write frequency
- ✅ Simple queries
- ✅ Small dataset (environments, not events)
- ✅ Single application server

---

## 🔍 Monitoring Commands

### Check Database Size:
```bash
# In container
docker-compose exec backend ls -lh data/environments.db

# On host
du -h env-monitor-backend/data/environments.db
```

### Check Row Count:
```bash
docker-compose exec backend node -e "const db = require('better-sqlite3')('data/environments.db'); console.log('Rows:', db.prepare('SELECT COUNT(*) as c FROM environments').get().c)"
```

### Check Table Info:
```bash
docker-compose exec backend sh -c "sqlite3 data/environments.db 'PRAGMA table_info(environments)'"
```

### Analyze Query Performance:
```bash
docker-compose exec backend sh -c "sqlite3 data/environments.db 'EXPLAIN QUERY PLAN SELECT * FROM environments WHERE status = \"working\"'"
```

---

## 📋 Maintenance Checklist

### Weekly:
- [ ] Check database size: `du -h data/environments.db`
- [ ] Monitor query performance in logs

### Monthly:
- [ ] Run VACUUM if many deletes: `VACUUM;`
- [ ] Run ANALYZE: `ANALYZE;`
- [ ] Review backup rotation

### Quarterly:
- [ ] Review indexes (add if needed)
- [ ] Archive old data (if applicable)
- [ ] Test restore from backup

### Yearly:
- [ ] Evaluate if SQLite still meets needs
- [ ] Consider migration if database > 5 GB

---

## 🎯 For Your Environment Monitor App

### Current Status:
- ✅ WAL mode enabled (good for concurrency)
- ✅ Simple schema (efficient)
- ✅ Indexed primary key
- ⚠️ Missing indexes on status and last_updated

### Recommended Actions:

1. **Add indexes** (do now):
   ```sql
   CREATE INDEX idx_status ON environments(status);
   CREATE INDEX idx_last_updated ON environments(last_updated);
   ```

2. **Add stats endpoint** (helpful for monitoring)

3. **Set up daily backups** (peace of mind)

4. **Monitor size monthly** (stay informed)

### Expected Longevity:

With typical usage:
- **10 environments**: Forever (no issues)
- **100 environments**: Forever (no issues)
- **1,000 environments**: 10+ years (no issues)
- **10,000 environments**: 5+ years (optimize queries)

**Verdict:** SQLite is perfect for your use case! 🎉

---

## 📚 Resources

- [SQLite Limits](https://www.sqlite.org/limits.html)
- [SQLite Optimization](https://www.sqlite.org/optoverview.html)
- [When to Use SQLite](https://www.sqlite.org/whentouse.html)
- [Better-SQLite3 Docs](https://github.com/WiseLibs/better-sqlite3/wiki)

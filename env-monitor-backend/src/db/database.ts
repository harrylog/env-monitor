import Database from 'better-sqlite3';
import path from 'path';
import { Environment, CreateEnvironmentDto, UpdateEnvironmentDto } from '../models/environment.model';

const dbPath = path.join(__dirname, '../../data/environments.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    name TEXT,
    url TEXT NOT NULL,
    version TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    last_updated TEXT NOT NULL
  )
`);

// Insert initial mock data if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM environments').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO environments (id, name, url, version, status, notes, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const mockData = [
    {
      id: '1',
      name: 'Production API',
      url: '126.0.202.9',
      version: 'v2.3.1',
      status: 'working',
      notes: null,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: null,
      url: '148.88.88.87',
      version: 'v2.4.0-rc1',
      status: 'degraded',
      notes: 'Database connection pool exhausted - investigating high load',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      name: null,
      url: '192.168.1.100',
      version: null,
      status: 'working',
      notes: 'Recently updated to latest build',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'QA Environment',
      url: 'https://qa.example.com',
      version: 'v2.3.1',
      status: 'down',
      notes: 'Server maintenance in progress - Expected downtime: 2 hours',
      lastUpdated: new Date().toISOString(),
    },
  ];

  mockData.forEach((env) => {
    insert.run(env.id, env.name, env.url, env.version, env.status, env.notes, env.lastUpdated);
  });

  console.log('✅ Database initialized with mock data');
}

// Database operations
export const environmentDb = {
  // Get all environments
  getAll(): Environment[] {
    const stmt = db.prepare('SELECT * FROM environments ORDER BY last_updated DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name || undefined,
      url: row.url,
      version: row.version || undefined,
      status: row.status,
      notes: row.notes || undefined,
      lastUpdated: row.last_updated,
    }));
  },

  // Get by ID
  getById(id: string): Environment | undefined {
    const stmt = db.prepare('SELECT * FROM environments WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name || undefined,
      url: row.url,
      version: row.version || undefined,
      status: row.status,
      notes: row.notes || undefined,
      lastUpdated: row.last_updated,
    };
  },

  // Create
  create(data: CreateEnvironmentDto): Environment {
    const id = 'env-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const lastUpdated = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO environments (id, name, url, version, status, notes, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name || null,
      data.url,
      data.version || null,
      data.status,
      data.notes || null,
      lastUpdated
    );

    return {
      id,
      name: data.name,
      url: data.url,
      version: data.version,
      status: data.status,
      notes: data.notes,
      lastUpdated,
    };
  },

  // Update
  update(id: string, data: UpdateEnvironmentDto): Environment | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const lastUpdated = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE environments
      SET name = ?, url = ?, version = ?, status = ?, notes = ?, last_updated = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name !== undefined ? data.name || null : existing.name || null,
      data.url !== undefined ? data.url : existing.url,
      data.version !== undefined ? data.version || null : existing.version || null,
      data.status !== undefined ? data.status : existing.status,
      data.notes !== undefined ? data.notes || null : existing.notes || null,
      lastUpdated,
      id
    );

    return this.getById(id);
  },

  // Delete
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM environments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

export default db;

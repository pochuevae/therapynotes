const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let db, runQuery, getQuery, allQuery;

if (isProduction) {
  // Use PostgreSQL in production
  const postgres = require('./postgres');
  db = postgres.pool;
  runQuery = postgres.runQuery;
  getQuery = postgres.getQuery;
  allQuery = postgres.allQuery;
} else {
  // Use SQLite in development
  const dbPath = process.env.DATABASE_PATH || './data/therapy_journal.db';
  db = new sqlite3.Database(dbPath);
}

async function initDatabase() {
  if (isProduction) {
    // In production, run migrations
    const { runMigrations } = require('./migrate');
    await runMigrations();
    console.log('✅ PostgreSQL database initialized successfully');
  } else {
    // In development, use SQLite
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Create journal_entries table
        db.run(`
          CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            title TEXT,
            summary TEXT,
            transcript TEXT,
            content TEXT,
            tags TEXT,
            raw_llm_json TEXT,
            source TEXT DEFAULT 'manual',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create images table
        db.run(`
          CREATE TABLE IF NOT EXISTS entry_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE
          )
        `);

        // Create users table for tracking
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_user_id TEXT UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create indexes for better performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_entries_user_date ON journal_entries(telegram_user_id, date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_entries_source ON journal_entries(source)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_images_entry ON entry_images(entry_id)`);

        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Database initialization error:', err);
            reject(err);
          } else {
            console.log('✅ SQLite database initialized successfully');
            resolve();
          }
        });
      });
    });
  }
}

// Database helper functions
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  runQuery,
  getQuery,
  allQuery
};

const { runQuery } = require('./postgres');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // Create journal_entries table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        telegram_user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        title TEXT,
        summary TEXT,
        transcript TEXT,
        content TEXT,
        tags TEXT,
        raw_llm_json TEXT,
        source TEXT DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create entry_images table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS entry_images (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE
      )
    `);

    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_user_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_entries_user_date ON journal_entries(telegram_user_id, date)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_entries_source ON journal_entries(source)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_images_entry ON entry_images(entry_id)`);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };

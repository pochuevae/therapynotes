const { Pool } = require('pg');

// Get database URL from environment (Railway provides this)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Helper functions
async function runQuery(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
}

async function getQuery(sql, params = []) {
  const result = await runQuery(sql, params);
  return result.rows[0] || null;
}

async function allQuery(sql, params = []) {
  const result = await runQuery(sql, params);
  return result.rows;
}

module.exports = {
  pool,
  runQuery,
  getQuery,
  allQuery
};

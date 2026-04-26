const { Pool } = require('pg');

// Render PostgreSQL requires SSL in production
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW() as now');
    console.log(`PostgreSQL connected — server time: ${rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };

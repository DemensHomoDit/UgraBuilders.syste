require('dotenv').config();
const { readFileSync } = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createTables() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf8');
  await pool.query(schemaSql);
  console.log('Schema applied successfully');
}

createTables()
  .catch((error) => {
    console.error('Failed to apply schema:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

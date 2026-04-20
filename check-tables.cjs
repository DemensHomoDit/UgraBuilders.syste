require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkTables() {
  const tables = ['users', 'user_profiles', 'telegram_link_tokens', 'user_telegram_accounts'];
  for (const table of tables) {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [table],
    );
    console.log(`\n${table}:`);
    console.log(result.rows.map((row) => row.column_name));
  }
}

checkTables()
  .catch((error) => {
    console.error('Failed to inspect tables:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

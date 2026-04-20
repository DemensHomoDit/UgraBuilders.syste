require('dotenv').config();
const { Pool } = require('pg');

const TEST_USER_UUID = '00000000-0000-4000-a000-000000000000';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function fixUserProfile() {
  await pool.query(
    `INSERT INTO user_profiles (id, username, role, work_stages, work_tasks, folders, project_stats, schedule)
     VALUES ($1, 'test_user', 'client', ARRAY[]::text[], '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '[]'::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    [TEST_USER_UUID],
  );

  const profile = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [TEST_USER_UUID]);
  const accounts = await pool.query('SELECT * FROM user_telegram_accounts WHERE user_id = $1', [TEST_USER_UUID]);
  const tokens = await pool.query('SELECT * FROM telegram_link_tokens WHERE user_id = $1', [TEST_USER_UUID]);

  console.log('Profile:', profile.rows[0] || null);
  console.log('Telegram accounts:', accounts.rows.length);
  console.log('Link tokens:', tokens.rows.length);
}

fixUserProfile()
  .catch((error) => {
    console.error('Failed to fix test profile:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

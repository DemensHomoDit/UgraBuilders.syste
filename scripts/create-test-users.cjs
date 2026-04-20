require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const TEST_PASSWORD = process.env.TEST_USERS_PASSWORD || "Test12345";

const TEST_USERS = [
  { email: "test.admin@ugra.local", username: "test_admin", role: "admin" },
  { email: "test.editor@ugra.local", username: "test_editor", role: "editor" },
  { email: "test.manager@ugra.local", username: "test_manager", role: "manager" },
  { email: "test.client@ugra.local", username: "test_client", role: "client" },
];

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function upsertTestUsers() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  for (const user of TEST_USERS) {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      user.email,
    ]);

    const userId = existing.rows[0]?.id || uuidv4();

    await pool.query(
      `INSERT INTO users (id, email, password_hash, username, role, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         username = EXCLUDED.username,
         role = EXCLUDED.role,
         updated_at = NOW()`,
      [userId, user.email, passwordHash, user.username, user.role],
    );

    await pool.query(
      `INSERT INTO user_profiles (id, username, role, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         role = EXCLUDED.role,
         updated_at = NOW()`,
      [userId, user.username, user.role],
    );
  }

  const result = await pool.query(
    "SELECT email, username, role FROM users WHERE email LIKE $1 ORDER BY role, email",
    ["test.%@ugra.local"],
  );

  console.log(
    JSON.stringify(
      {
        users: result.rows,
        password: TEST_PASSWORD,
      },
      null,
      2,
    ),
  );
}

upsertTestUsers()
  .catch((error) => {
    console.error("Failed to create test users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

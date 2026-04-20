require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

(async () => {
  const r = await pool.query(
    "SELECT email, role, password_hash FROM users WHERE email LIKE $1",
    ["test.%@ugra.local"]
  );

  for (const row of r.rows) {
    const match = await bcrypt.compare("Test12345", row.password_hash);
    console.log(`${row.email} | ${row.role} | password_valid=${match} | hash=${row.password_hash.substring(0, 15)}...`);
  }

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
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
    "SELECT email, role, password_hash FROM users WHERE email = $1",
    ["test.client@ugra.local"]
  );

  const user = r.rows[0];
  if (!user) { console.log("USER NOT FOUND"); await pool.end(); return; }

  console.log("email:", user.email);
  console.log("role:", user.role);
  console.log("hash:", user.password_hash);

  const passwords = ["Test12345", "Test12345!", "test12345", "Test1234"];
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, user.password_hash);
    console.log(`password="${pw}" => match=${match}`);
  }

  // Also create a fresh hash and compare
  const freshHash = await bcrypt.hash("Test12345", 10);
  console.log("\nfresh_hash:", freshHash);
  const freshMatch = await bcrypt.compare("Test12345", freshHash);
  console.log("fresh_match:", freshMatch);

  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
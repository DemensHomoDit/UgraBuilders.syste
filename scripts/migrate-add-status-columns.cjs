const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addColumn(client, table, name, sql) {
  const cols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
    [table, name]
  );
  if (cols.rows.length === 0) {
    await client.query(sql);
    console.log(`Added '${name}' to ${table}`);
  } else {
    console.log(`'${name}' already exists in ${table}`);
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await addColumn(client, "blog_posts", "status",
      "ALTER TABLE blog_posts ADD COLUMN status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected'))"
    );
    await addColumn(client, "blog_posts", "rejection_reason",
      "ALTER TABLE blog_posts ADD COLUMN rejection_reason TEXT"
    );
    await addColumn(client, "blog_posts", "created_by",
      "ALTER TABLE blog_posts ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL"
    );
    await addColumn(client, "reviews", "status",
      "ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected'))"
    );
    await addColumn(client, "reviews", "rejection_reason",
      "ALTER TABLE reviews ADD COLUMN rejection_reason TEXT"
    );

    await client.query("COMMIT");
    console.log("Migration completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
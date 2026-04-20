const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const projectCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'"
    );
    const cols = projectCols.rows.map((r) => r.column_name);

    if (!cols.includes("status")) {
      await client.query(
        "ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected'))"
      );
      console.log("Added 'status' column to projects");
    } else {
      console.log("'status' column already exists in projects");
    }

    if (!cols.includes("rejection_reason")) {
      await client.query(
        "ALTER TABLE projects ADD COLUMN rejection_reason TEXT"
      );
      console.log("Added 'rejection_reason' column to projects");
    } else {
      console.log("'rejection_reason' column already exists in projects");
    }

    const heroCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'hero_carousel'"
    );
    const hCols = heroCols.rows.map((r) => r.column_name);

    if (!hCols.includes("status")) {
      await client.query(
        "ALTER TABLE hero_carousel ADD COLUMN status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'rejected'))"
      );
      console.log("Added 'status' column to hero_carousel");
    } else {
      console.log("'status' column already exists in hero_carousel");
    }

    if (!hCols.includes("rejection_reason")) {
      await client.query(
        "ALTER TABLE hero_carousel ADD COLUMN rejection_reason TEXT"
      );
      console.log("Added 'rejection_reason' column to hero_carousel");
    } else {
      console.log("'rejection_reason' column already exists in hero_carousel");
    }

    if (!hCols.includes("created_by")) {
      await client.query(
        "ALTER TABLE hero_carousel ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL"
      );
      console.log("Added 'created_by' column to hero_carousel");
    } else {
      console.log("'created_by' column already exists in hero_carousel");
    }

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
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const heroCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'hero_carousel'"
    );
    const cols = heroCols.rows.map((r) => r.column_name);

    if (!cols.includes("updated_at")) {
      await client.query(
        "ALTER TABLE hero_carousel ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()"
      );
      console.log("Added 'updated_at' column to hero_carousel");
    } else {
      console.log("'updated_at' column already exists in hero_carousel");
    }

    // Also check image_type for project_images if missing
    const piCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'project_images'"
    );
    const piColumnNames = piCols.rows.map((r) => r.column_name);

    // Add any other known missing columns across tables
    const galleryCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'gallery_items'"
    );
    const gCols = galleryCols.rows.map((r) => r.column_name);

    const checks = [
      { table: "gallery_items", col: "updated_at", sql: "ALTER TABLE gallery_items ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()" },
    ];

    for (const check of checks) {
      const existing = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
        [check.table, check.col]
      );
      if (existing.rows.length === 0) {
        await client.query(check.sql);
        console.log(`Added '${check.col}' to ${check.table}`);
      }
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
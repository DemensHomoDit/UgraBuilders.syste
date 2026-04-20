"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const cron = require("node-cron");
const { Pool } = require("pg");
require("dotenv").config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3001", 10);
const JWT_SECRET = process.env.JWT_SECRET || "";
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL || "";
const SYNC_SCHEDULE = process.env.SYNC_SCHEDULE || "0 */4 * * *";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "";

const requiredDbEnv = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missingDbEnv = requiredDbEnv.filter((name) => !process.env[name]);
if (missingDbEnv.length) {
  console.error(`[Server] Missing DB env vars: ${missingDbEnv.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  console.error("[Server] JWT_SECRET is required in production");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !CORS_ORIGIN) {
  console.error("[Server] CORS_ORIGIN is required in production");
  process.exit(1);
}

// ─── DB Pool ─────────────────────────────────────────────────────────────────

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ─── Allowed tables ───────────────────────────────────────────────────────────

const ALLOWED_TABLES = [
  "users",
  "user_profiles",
  "projects",
  "project_images",
  "categories",
  "blog_posts",
  "blog_images",
  "comments",
  "reviews",
  "review_images",
  "gallery_items",
  "hero_carousel",
  "news",
  "project_orders",
  "site_visits",
  "system_settings",
  "tasks",
  "form_submissions",
  "bitrix_leads",
  "project_form_links",
  "client_photos",
  "client_files",
  "telegram_link_tokens",
  "user_telegram_accounts",
  "client_feed",
  "guest_access_links",
  "client_documents",
];

const tableColumnsCache = new Map();
const apiResponseCache = new Map();

function getCachedResponse(key) {
  const entry = apiResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    apiResponseCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedResponse(key, value, ttlMs = 30000) {
  apiResponseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function invalidateCacheByPrefix(prefix) {
  for (const key of apiResponseCache.keys()) {
    if (key.startsWith(prefix)) {
      apiResponseCache.delete(key);
    }
  }
}

async function getTableColumns(tableName) {
  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
    [tableName],
  );
  const cols = new Set((r.rows || []).map((x) => x.column_name));
  tableColumnsCache.set(tableName, cols);
  return cols;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildWhereClause(filters = [], startIndex = 1) {
  if (!filters || !filters.length)
    return { where: "", params: [], nextIndex: startIndex };
  const conditions = [];
  const params = [];
  let idx = startIndex;
  for (const f of filters) {
    const { op, field, value } = f;
    if (!field) continue;
    const safeField = field.replace(/[^a-zA-Z0-9_]/g, "");
    switch (op) {
      case "eq":
        conditions.push(`${safeField} = $${idx++}`);
        params.push(value);
        break;
      case "neq":
        conditions.push(`${safeField} != $${idx++}`);
        params.push(value);
        break;
      case "gt":
        conditions.push(`${safeField} > $${idx++}`);
        params.push(value);
        break;
      case "gte":
        conditions.push(`${safeField} >= $${idx++}`);
        params.push(value);
        break;
      case "lt":
        conditions.push(`${safeField} < $${idx++}`);
        params.push(value);
        break;
      case "lte":
        conditions.push(`${safeField} <= $${idx++}`);
        params.push(value);
        break;
      case "like":
        conditions.push(`${safeField} LIKE $${idx++}`);
        params.push(value);
        break;
      case "ilike":
        conditions.push(`${safeField} ILIKE $${idx++}`);
        params.push(value);
        break;
      case "in": {
        const vals = Array.isArray(value) ? value : [value];
        conditions.push(`${safeField} = ANY($${idx++})`);
        params.push(vals);
        break;
      }
      case "is":
        if (value === null || value === "null") {
          conditions.push(`${safeField} IS NULL`);
        } else {
          conditions.push(`${safeField} = $${idx++}`);
          params.push(value);
        }
        break;
      default:
        break;
    }
  }
  return {
    where: conditions.length ? "WHERE " + conditions.join(" AND ") : "",
    params,
    nextIndex: idx,
  };
}

function parseJsonParam(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return { decoded: jwt.verify(token, JWT_SECRET), error: null };
  } catch (e) {
    return { decoded: null, error: e };
  }
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const optionalAuth = async (req, _res, next) => {
  try {
    const h = req.headers.authorization;
    if (h && h.startsWith("Bearer ")) {
      const { decoded } = verifyToken(h.replace("Bearer ", "").trim());
      if (decoded) {
        const r = await pool.query(
          "SELECT id, email, username, role, phone, avatar FROM users WHERE id = $1",
          [decoded.userId],
        );
        if (r.rows[0]) req.user = r.rows[0];
      }
    }
  } catch (_) {}
  next();
};

const authMiddleware = (roles) => async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Требуется авторизация" });
    }
    const { decoded, error } = verifyToken(h.replace("Bearer ", "").trim());
    if (error || !decoded) {
      return res.status(401).json({ error: "Неверный токен" });
    }
    const r = await pool.query(
      "SELECT id, email, username, role, phone, avatar FROM users WHERE id = $1",
      [decoded.userId],
    );
    if (!r.rows[0])
      return res.status(401).json({ error: "Пользователь не найден" });
    if (roles && roles.length && !roles.includes(r.rows[0].role)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }
    req.user = r.rows[0];
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

function ensureBucketDir(bucket) {
  const dir = path.join(__dirname, "uploads", bucket);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Создаём нужные папки при старте
[
  "client-photos",
  "client-files",
  "project-images-new",
  "hero-carousel",
].forEach((b) => {
  const dir = path.join(__dirname, "uploads", b);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storageEngine = multer.diskStorage({
  destination: (req, _file, cb) => {
    const bucket = req.params.bucket || "default";
    const dir = ensureBucketDir(bucket);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .slice(0, 64);
    cb(null, `${Date.now()}_${uuidv4().slice(0, 8)}_${base}${ext}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();

const allowedOrigins = CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (
        process.env.NODE_ENV !== "production" &&
        (origin.includes("localhost") || origin.includes("127.0.0.1"))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin denied"));
    },
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, options } = req.body;
    const cleanSignupEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanSignupPassword = typeof password === "string" ? password : "";
    const username =
      (options && options.data && options.data.username) || cleanSignupEmail.split("@")[0];
    if (!cleanSignupEmail || !cleanSignupPassword) {
      return res
        .status(400)
        .json({ data: null, error: { message: "Email и пароль обязательны" } });
    }
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      cleanSignupEmail,
    ]);
    if (exists.rows[0]) {
      return res.status(400).json({
        data: null,
        error: { message: "Пользователь уже существует" },
      });
    }
    const passwordHash = await bcrypt.hash(cleanSignupPassword, 10);
    const userId = uuidv4();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        "INSERT INTO users (id, email, password_hash, username, role) VALUES ($1, $2, $3, $4, $5)",
        [userId, cleanSignupEmail, passwordHash, username, "client"],
      );
      await client.query(
        "INSERT INTO user_profiles (id, username, role) VALUES ($1, $2, $3)",
        [userId, username, "client"],
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    const user = { id: userId, email: cleanSignupEmail, username, role: "client" };
    const token = signToken({ userId, email: cleanSignupEmail, role: "client" });
    return res.json({
      data: { user, session: { access_token: token, user } },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";
    if (!cleanEmail || !cleanPassword) {
      return res
        .status(400)
        .json({ data: null, error: { message: "Email и пароль обязательны" } });
    }
    const r = await pool.query(
      "SELECT id, email, username, role, password_hash, client_stage FROM users WHERE email = $1",
      [cleanEmail],
    );
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(cleanPassword, user.password_hash))) {
      return res
        .status(401)
        .json({ data: null, error: { message: "Неверный email или пароль" } });
    }
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: null,
      avatar: null,
      clientStage: user.client_stage || null,
    };
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return res.json({
      data: {
        user: safeUser,
        session: { access_token: token, user: safeUser },
      },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (_req, res) => res.json({}));

// GET /api/auth/session
app.get("/api/auth/session", async (req, res) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer ")) {
      return res.json({ data: { session: null }, error: null });
    }
    const { decoded, error } = verifyToken(h.replace("Bearer ", "").trim());
    if (error || !decoded)
      return res.json({ data: { session: null }, error: null });
    const r = await pool.query(
      "SELECT id, email, username, role, phone, avatar FROM users WHERE id = $1",
      [decoded.userId],
    );
    if (!r.rows[0]) return res.json({ data: { session: null }, error: null });
    const user = r.rows[0];
    const token = h.replace("Bearer ", "").trim();
    return res.json({
      data: { session: { access_token: token, user } },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// GET /api/auth/user
app.get("/api/auth/user", async (req, res) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer ")) {
      return res.status(401).json({
        data: { user: null },
        error: { message: "Требуется авторизация" },
      });
    }
    const { decoded, error } = verifyToken(h.replace("Bearer ", "").trim());
    if (error || !decoded) {
      return res
        .status(401)
        .json({ data: { user: null }, error: { message: "Неверный токен" } });
    }
    const r = await pool.query(
      "SELECT id, email, username, role, phone, avatar FROM users WHERE id = $1",
      [decoded.userId],
    );
    if (!r.rows[0]) {
      return res
        .status(404)
        .json({ data: { user: null }, error: { message: "Не найден" } });
    }
    return res.json({ data: { user: r.rows[0] }, error: null });
  } catch (err) {
    console.error("[GET /api/auth/user]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

// GET /api/db/:collection
app.get("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_TABLES.includes(collection)) {
      return res
        .status(404)
        .json({ data: null, error: { message: "Table not found" }, count: 0 });
    }

    const filters = parseJsonParam(req.query.filters, []);
    const orderParam = parseJsonParam(req.query.order, null);
    const limitN = req.query.limit ? parseInt(req.query.limit) : null;
    const isHead = req.query.head === "true";
    const isSingle = req.query.single === "true";
    const selectCols =
      req.query.select && req.query.select !== "*" ? req.query.select : "*";

    const { where, params } = buildWhereClause(filters);

    if (isHead) {
      const r = await pool.query(
        `SELECT COUNT(*) FROM ${collection} ${where}`,
        params,
      );
      return res.json({
        data: null,
        error: null,
        count: parseInt(r.rows[0].count),
      });
    }

    let sql = `SELECT ${selectCols} FROM ${collection} ${where}`;
    if (orderParam && orderParam.field) {
      const dir = orderParam.ascending === false ? "DESC" : "ASC";
      sql += ` ORDER BY ${orderParam.field.replace(/[^a-zA-Z0-9_]/g, "")} ${dir}`;
    }
    if (limitN) sql += ` LIMIT ${limitN}`;

    const r = await pool.query(sql, params);
    const rows = r.rows.map((row) => {
      const r2 = Object.assign({}, row);
      delete r2.password_hash;
      return r2;
    });

    if (isSingle) return res.json({ data: rows[0] || null, error: null });
    return res.json({ data: rows, error: null, count: rows.length });
  } catch (err) {
    console.error(`[GET /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message }, count: 0 });
  }
});

// POST /api/db/:collection  (insert / upsert)
app.post("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_TABLES.includes(collection)) {
      return res
        .status(404)
        .json({ data: null, error: { message: "Table not found" } });
    }

    const { data, operation = "insert" } = req.body;
    if (!data)
      return res
        .status(400)
        .json({ data: null, error: { message: "data is required" } });

    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];
    const results = [];
    const tableColumns = await getTableColumns(collection);
    const hasCreatedAt = tableColumns.has("created_at");
    const hasUpdatedAt = tableColumns.has("updated_at");

    for (const item of items) {
      if (!item.id) item.id = uuidv4();
      if (hasCreatedAt && !item.created_at)
        item.created_at = new Date().toISOString();
      if (hasUpdatedAt) item.updated_at = new Date().toISOString();

      // Сериализуем plain-object поля (JSONB)
      const processedItem = {};
      for (const [k, v] of Object.entries(item)) {
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          processedItem[k] = JSON.stringify(v);
        } else {
          processedItem[k] = v;
        }
      }

      const keys = Object.keys(processedItem);
      const vals = Object.values(processedItem);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const colNames = keys.join(", ");

      if (operation === "upsert") {
        const nonIdKeys = keys.filter((k) => k !== "id");
        const updateSet = nonIdKeys
          .map((k, i) => `${k} = $${i + 2}`)
          .join(", ");
        const upsertVals = [
          processedItem.id,
          ...nonIdKeys.map((k) => processedItem[k]),
        ];
        const r = await pool.query(
          `INSERT INTO ${collection} (${colNames}) VALUES (${placeholders})
           ON CONFLICT (id) DO UPDATE SET ${updateSet}
           RETURNING *`,
          upsertVals,
        );
        const row = Object.assign({}, r.rows[0]);
        delete row.password_hash;
        results.push(row);
      } else {
        const r = await pool.query(
          `INSERT INTO ${collection} (${colNames}) VALUES (${placeholders}) RETURNING *`,
          vals,
        );
        const row = Object.assign({}, r.rows[0]);
        delete row.password_hash;
        results.push(row);
      }
    }

    if (collection === "form_submissions") invalidateCacheByPrefix("forms:");
    if (collection === "projects") invalidateCacheByPrefix("projects:");
    if (collection === "users" || collection === "user_profiles")
      invalidateCacheByPrefix("users:");

    return res.json({ data: isArray ? results : results[0], error: null });
  } catch (err) {
    console.error(`[POST /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// PATCH /api/db/:collection
app.patch("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_TABLES.includes(collection)) {
      return res
        .status(404)
        .json({ data: null, error: { message: "Table not found" } });
    }

    const { data, filters } = req.body;
    if (!data)
      return res
        .status(400)
        .json({ data: null, error: { message: "data is required" } });

    const tableColumns = await getTableColumns(collection);
    if (tableColumns.has("updated_at")) {
      data.updated_at = new Date().toISOString();
    }

    // Сериализуем plain-object поля (JSONB)
    const processedData = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        processedData[k] = JSON.stringify(v);
      } else {
        processedData[k] = v;
      }
    }

    const keys = Object.keys(processedData);
    const vals = Object.values(processedData);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

    const { where, params: wParams } = buildWhereClause(
      filters,
      keys.length + 1,
    );

    const r = await pool.query(
      `UPDATE ${collection} SET ${setClause} ${where} RETURNING *`,
      [...vals, ...wParams],
    );

    if (!r.rows[0])
      return res.json({ data: null, error: { message: "Not found" } });
    const row = Object.assign({}, r.rows[0]);
    delete row.password_hash;
    if (collection === "form_submissions") invalidateCacheByPrefix("forms:");
    if (collection === "projects") invalidateCacheByPrefix("projects:");
    if (collection === "users" || collection === "user_profiles")
      invalidateCacheByPrefix("users:");
    return res.json({ data: row, error: null });
  } catch (err) {
    console.error(`[PATCH /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/db/:collection
app.delete("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_TABLES.includes(collection)) {
      return res
        .status(404)
        .json({ data: null, error: { message: "Table not found" } });
    }

    const { filters } = req.body || {};
    if (!filters || !filters.length) {
      return res
        .status(400)
        .json({ data: null, error: { message: "Filters are required" } });
    }

    const { where, params } = buildWhereClause(filters);
    const r = await pool.query(
      `DELETE FROM ${collection} ${where} RETURNING id`,
      params,
    );
    if (collection === "form_submissions") invalidateCacheByPrefix("forms:");
    if (collection === "projects") invalidateCacheByPrefix("projects:");
    if (collection === "users" || collection === "user_profiles")
      invalidateCacheByPrefix("users:");
    return res.json({ data: { deletedCount: r.rowCount }, error: null });
  } catch (err) {
    console.error(`[DELETE /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Storage / File Upload ────────────────────────────────────────────────────

// GET /api/storage/buckets
app.get("/api/storage/buckets", (_req, res) => {
  try {
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ data: [], error: null });
    }
    const buckets = fs
      .readdirSync(uploadsDir)
      .filter((name) => fs.statSync(path.join(uploadsDir, name)).isDirectory())
      .map((name) => ({ name }));
    return res.json({ data: buckets, error: null });
  } catch (err) {
    console.error("[GET /api/storage/buckets]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/storage/:bucket/upload
app.post("/api/storage/:bucket/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ data: null, error: { message: "No file uploaded" } });
    }
    return res.json({ data: { path: req.file.filename }, error: null });
  } catch (err) {
    console.error("[POST /api/storage/:bucket/upload]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// GET /api/storage/:bucket/public-url/:filepath
app.get("/api/storage/:bucket/public-url/:filepath", (req, res) => {
  const { bucket, filepath } = req.params;
  const host = req.get("host") || `localhost:${PORT}`;
  const protocol = req.protocol || "http";
  const publicUrl = `${protocol}://${host}/uploads/${bucket}/${filepath}`;
  return res.json({ publicUrl, error: null });
});

// DELETE /api/storage/:bucket/remove
app.delete("/api/storage/:bucket/remove", (req, res) => {
  try {
    const { bucket } = req.params;
    const { paths } = req.body;
    if (!paths || !Array.isArray(paths)) {
      return res
        .status(400)
        .json({ data: null, error: { message: "paths array is required" } });
    }
    for (const filePath of paths) {
      const fullPath = path.join(
        __dirname,
        "uploads",
        bucket,
        path.basename(filePath),
      );
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    return res.json({ data: true, error: null });
  } catch (err) {
    console.error("[DELETE /api/storage/:bucket/remove]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Client Files API ─────────────────────────────────────────────────────────

// GET /api/client-files/:clientId/:folderType
app.get(
  "/api/client-files/:clientId/:folderType",
  optionalAuth,
  async (req, res) => {
    try {
      const { clientId, folderType } = req.params;
      const r = await pool.query(
        "SELECT * FROM client_files WHERE client_id = $1 AND folder_type = $2 ORDER BY created_at DESC",
        [clientId, folderType],
      );
      return res.json({ data: r.rows, error: null });
    } catch (err) {
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// POST /api/client-files/:clientId/upload
app.post(
  "/api/client-files/:clientId/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ data: null, error: { message: "No file" } });
      const { clientId } = req.params;
      const {
        folder_type = "documents",
        uploaded_by,
        uploaded_by_name,
      } = req.body;
      const fileUrl = `/uploads/client-files/${req.file.filename}`;
      const r = await pool.query(
        `INSERT INTO client_files (id, client_id, name, mime_type, url, folder_type, uploaded_by, uploaded_by_name, file_size, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
        [
          uuidv4(),
          clientId,
          req.file.originalname,
          req.file.mimetype,
          fileUrl,
          folder_type,
          uploaded_by || null,
          uploaded_by_name || null,
          req.file.size,
        ],
      );
      return res.json({ data: r.rows[0], error: null });
    } catch (err) {
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// DELETE /api/client-files/:fileId
app.delete("/api/client-files/:fileId", optionalAuth, async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM client_files WHERE id = $1 RETURNING url",
      [req.params.fileId],
    );
    if (r.rows[0]) {
      try {
        const fp = path.join(__dirname, r.rows[0].url);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (_) {}
    }
    return res.json({ data: { deleted: true }, error: null });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Client Photos API ────────────────────────────────────────────────────────

// GET /api/client-photos/:clientId
app.get("/api/client-photos/:clientId", optionalAuth, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM client_photos WHERE client_id = $1 ORDER BY created_at DESC",
      [req.params.clientId],
    );
    return res.json({ data: r.rows, error: null });
  } catch (err) {
    console.error("[GET /api/client-photos/:clientId]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/client-photos/:clientId/upload
app.post(
  "/api/client-photos/:clientId/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ data: null, error: { message: "No file" } });
      const { clientId } = req.params;
      const { caption, category, date, uploaded_by, uploaded_by_name } =
        req.body;
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/client-photos/${req.file.filename}`;
      const id = uuidv4();
      const r = await pool.query(
        `INSERT INTO client_photos
         (id, client_id, url, caption, category, date, uploaded_by, uploaded_by_name, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       RETURNING *`,
        [
          id,
          clientId,
          fileUrl,
          caption || req.file.originalname,
          category || "Прочее",
          date ? new Date(date) : new Date(),
          uploaded_by || null,
          uploaded_by_name || null,
        ],
      );
      return res.json({ data: r.rows[0], error: null });
    } catch (err) {
      console.error("[POST /api/client-photos/:clientId/upload]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// PATCH /api/client-photos/photo/:photoId
app.patch(
  "/api/client-photos/photo/:photoId",
  optionalAuth,
  async (req, res) => {
    try {
      const { caption, category, date } = req.body;
      const sets = [];
      const vals = [];
      if (caption !== undefined) {
        sets.push(`caption  = $${vals.length + 1}`);
        vals.push(caption);
      }
      if (category !== undefined) {
        sets.push(`category = $${vals.length + 1}`);
        vals.push(category);
      }
      if (date !== undefined) {
        sets.push(`date     = $${vals.length + 1}`);
        vals.push(new Date(date));
      }
      if (!sets.length)
        return res.json({
          data: null,
          error: { message: "Nothing to update" },
        });
      vals.push(req.params.photoId);
      const r = await pool.query(
        `UPDATE client_photos SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
        vals,
      );
      return res.json({ data: r.rows[0] || null, error: null });
    } catch (err) {
      console.error("[PATCH /api/client-photos/photo/:photoId]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// DELETE /api/client-photos/photo/:photoId
app.delete(
  "/api/client-photos/photo/:photoId",
  optionalAuth,
  async (req, res) => {
    try {
      const r = await pool.query(
        "DELETE FROM client_photos WHERE id = $1 RETURNING url",
        [req.params.photoId],
      );
      if (r.rows[0]) {
        try {
          const fp = path.join(
            __dirname,
            "uploads",
            "client-photos",
            path.basename(r.rows[0].url),
          );
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        } catch (_) {}
      }
      return res.json({ data: { deleted: true }, error: null });
    } catch (err) {
      console.error("[DELETE /api/client-photos/photo/:photoId]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// ─── RPC ──────────────────────────────────────────────────────────────────────

app.post("/api/rpc/:fn", optionalAuth, async (req, res) => {
  try {
    const { fn } = req.params;
    switch (fn) {
      case "ensure_bucket_exists":
      case "create_project_images_bucket": {
        const bucket =
          req.body && req.body.bucket_name
            ? req.body.bucket_name
            : "project-images-new";
        ensureBucketDir(bucket);
        return res.json({ data: { name: bucket }, error: null });
      }
      case "admin_delete_user": {
        const uid = req.body && req.body.user_id;
        if (!uid)
          return res
            .status(400)
            .json({ data: null, error: { message: "user_id required" } });
        await pool.query("DELETE FROM user_profiles WHERE id = $1", [uid]);
        await pool.query("DELETE FROM users WHERE id = $1", [uid]);
        return res.json({ data: { deleted: true }, error: null });
      }
      case "delete_project_transaction": {
        const pid = req.body && req.body.project_id;
        if (!pid)
          return res
            .status(400)
            .json({ data: null, error: { message: "project_id required" } });
        await pool.query("DELETE FROM project_images WHERE project_id = $1", [
          pid,
        ]);
        await pool.query("DELETE FROM projects WHERE id = $1", [pid]);
        return res.json({ data: { deleted: true }, error: null });
      }
      default:
        return res.json({ data: true, error: null });
    }
  } catch (err) {
    console.error(`[POST /api/rpc/${req.params.fn}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Forms ────────────────────────────────────────────────────────────────────

// POST /api/forms/submit
app.post("/api/forms/submit", async (req, res) => {
  try {
    const {
      form_type,
      topic,
      custom_topic,
      source,
      data: fData,
      status = "new",
    } = req.body;
    if (!form_type)
      return res
        .status(400)
        .json({ success: false, error: "form_type required" });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO form_submissions
         (id, form_type, topic, custom_topic, source, data, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
      [
        id,
        form_type,
        topic,
        custom_topic,
        source,
        JSON.stringify(fData || {}),
        status,
      ],
    );
    return res.json({
      success: true,
      message: "Форма отправлена",
      data: { id },
    });
  } catch (err) {
    console.error("[POST /api/forms/submit]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bitrix/lead
app.post("/api/bitrix/lead", async (req, res) => {
  try {
    if (!BITRIX_WEBHOOK_URL) {
      return res.status(503).json({
        success: false,
        error: "BITRIX_WEBHOOK_URL is not configured",
      });
    }

    const payload = req.body || {};
    const endpoint = `${BITRIX_WEBHOOK_URL.replace(/\/$/, "")}/crm.lead.add`;
    const response = await axios.post(endpoint, payload, {
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("[POST /api/bitrix/lead]", err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message,
    });
  }
});

// POST /api/bitrix/method
app.post("/api/bitrix/method", async (req, res) => {
  try {
    if (!BITRIX_WEBHOOK_URL) {
      return res.status(503).json({
        success: false,
        error: "BITRIX_WEBHOOK_URL is not configured",
      });
    }

    const { method, payload = {} } = req.body || {};
    if (!method || typeof method !== "string") {
      return res.status(400).json({
        success: false,
        error: "method is required",
      });
    }

    const endpoint = `${BITRIX_WEBHOOK_URL.replace(/\/$/, "")}/${method.replace(/^\//, "")}`;
    const response = await axios.post(endpoint, payload, {
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("[POST /api/bitrix/method]", err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message,
    });
  }
});

// GET /api/forms
app.get(
  "/api/forms",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const r = await pool.query(
        "SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT $1",
        [limit],
      );
      return res.json({ success: true, data: r.rows, count: r.rows.length });
    } catch (err) {
      console.error("[GET /api/forms]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// PATCH /api/forms/:id/status
app.patch(
  "/api/forms/:id/status",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const r = await pool.query(
        "UPDATE form_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [req.body.status, req.params.id],
      );
      invalidateCacheByPrefix("forms:");
      return res.json({ success: true, data: r.rows[0] });
    } catch (err) {
      console.error("[PATCH /api/forms/:id/status]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// ─── Admin users ──────────────────────────────────────────────────────────────

// GET /api/admin/users
app.get("/api/admin/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC",
    );
    return res.json({ success: true, data: r.rows });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/users/list?page=&limit=&search=&role=
app.get(
  "/api/admin/users/list",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "20", 10), 1),
        100,
      );
      const search = String(req.query.search || "").trim();
      const role = String(req.query.role || "all").trim();
      const offset = (page - 1) * limit;

      const cacheKey = `users:list:${page}:${limit}:${search}:${role}`;
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const whereParts = [];
      const params = [];
      let idx = 1;

      if (search) {
        whereParts.push(
          `(u.email ILIKE $${idx} OR COALESCE(up.username,'') ILIKE $${idx})`,
        );
        params.push(`%${search}%`);
        idx += 1;
      }

      if (role && role !== "all") {
        whereParts.push(`COALESCE(up.role, u.role) = $${idx}`);
        params.push(role);
        idx += 1;
      }

      const whereClause = whereParts.length
        ? `WHERE ${whereParts.join(" AND ")}`
        : "";

      const countRes = await pool.query(
        `
          SELECT COUNT(*)::int AS total
          FROM users u
          LEFT JOIN user_profiles up ON up.id = u.id
          ${whereClause}
        `,
        params,
      );

      const rowsRes = await pool.query(
        `
          SELECT
            u.id,
            u.email,
            COALESCE(up.username, u.username, '') AS username,
            COALESCE(up.role, u.role, 'client') AS role,
            u.created_at
          FROM users u
          LEFT JOIN user_profiles up ON up.id = u.id
          ${whereClause}
          ORDER BY u.created_at DESC
          LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
        `,
        params,
      );

      const statsRes = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE role = 'admin')::int AS admin_count,
          COUNT(*) FILTER (WHERE role = 'editor')::int AS editor_count,
          COUNT(*) FILTER (WHERE role = 'manager')::int AS manager_count,
          COUNT(*) FILTER (WHERE role = 'client')::int AS client_count
        FROM (
          SELECT COALESCE(up.role, u.role, 'client') AS role
          FROM users u
          LEFT JOIN user_profiles up ON up.id = u.id
        ) r
      `);

      const total = countRes.rows[0]?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const payload = {
        success: true,
        data: rowsRes.rows || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        stats: statsRes.rows[0] || {
          total: 0,
          admin_count: 0,
          editor_count: 0,
          manager_count: 0,
          client_count: 0,
        },
      };

      setCachedResponse(cacheKey, payload, 20000);
      return res.json(payload);
    } catch (err) {
      console.error("[GET /api/admin/users/list]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// PATCH /api/admin/users/:userId/role
app.patch(
  "/api/admin/users/:userId/role",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body || {};
      const allowedRoles = ["admin", "editor", "manager", "client"];

      if (!allowedRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, error: "Недопустимая роль" });
      }

      await pool.query("UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2", [
        role,
        userId,
      ]);
      await pool.query(
        `
          INSERT INTO user_profiles (id, role, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (id)
          DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()
        `,
        [userId, role],
      );

      invalidateCacheByPrefix("users:");

      return res.json({ success: true, data: { id: userId, role } });
    } catch (err) {
      console.error("[PATCH /api/admin/users/:userId/role]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// GET /api/admin/forms/list?page=&limit=&status=&formType=&search=&pinnedOnly=
app.get(
  "/api/admin/forms/list",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10", 10), 1),
        100,
      );
      const status = String(req.query.status || "all").trim();
      const formType = String(req.query.formType || "all").trim();
      const search = String(req.query.search || "").trim();
      const pinnedOnly =
        String(req.query.pinnedOnly || "false").toLowerCase() === "true";
      const offset = (page - 1) * limit;

      const cacheKey = `forms:list:${page}:${limit}:${status}:${formType}:${search}:${pinnedOnly}`;
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const whereParts = [];
      const params = [];
      let idx = 1;

      if (status && status !== "all") {
        whereParts.push(`status = $${idx++}`);
        params.push(status);
      }

      if (formType && formType !== "all") {
        whereParts.push(`form_type = $${idx++}`);
        params.push(formType);
      }

      if (pinnedOnly) {
        whereParts.push("is_pinned = true");
      }

      if (search) {
        whereParts.push(
          `(
            COALESCE(topic,'') ILIKE $${idx}
            OR COALESCE(data->>'name','') ILIKE $${idx}
            OR COALESCE(data->>'email','') ILIKE $${idx}
            OR COALESCE(data->>'phone','') ILIKE $${idx}
          )`,
        );
        params.push(`%${search}%`);
        idx += 1;
      }

      const whereClause = whereParts.length
        ? `WHERE ${whereParts.join(" AND ")}`
        : "";

      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS total FROM form_submissions ${whereClause}`,
        params,
      );

      const dataRes = await pool.query(
        `
          SELECT *
          FROM form_submissions
          ${whereClause}
          ORDER BY is_pinned DESC, created_at DESC
          LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
        `,
        params,
      );

      const pinnedRes = await pool.query(
        `
          SELECT * FROM form_submissions
          WHERE is_pinned = true
          ORDER BY pinned_at DESC NULLS LAST, created_at DESC
          LIMIT 20
        `,
      );

      const total = countRes.rows[0]?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const payload = {
        success: true,
        data: dataRes.rows || [],
        pinned: pinnedRes.rows || [],
        pagination: { page, limit, total, totalPages },
      };

      setCachedResponse(cacheKey, payload, 15000);
      return res.json(payload);
    } catch (err) {
      console.error("[GET /api/admin/forms/list]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// GET /api/admin/forms/summary
app.get(
  "/api/admin/forms/summary",
  authMiddleware(["admin", "manager"]),
  async (_req, res) => {
    try {
      const cacheKey = "forms:summary";
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const r = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
          COUNT(*) FILTER (WHERE status IN ('in_progress', 'processing'))::int AS in_progress_count,
          COUNT(*) FILTER (WHERE is_pinned = true)::int AS pinned_count,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::int AS today_count
        FROM form_submissions
      `);

      const payload = { success: true, data: r.rows[0] || {} };
      setCachedResponse(cacheKey, payload, 10000);
      return res.json(payload);
    } catch (err) {
      console.error("[GET /api/admin/forms/summary]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// GET /api/admin/projects/overview
app.get(
  "/api/admin/projects/overview",
  authMiddleware(["admin", "editor", "manager"]),
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || "300", 10), 1000);

      const [projectsRes, categoriesRes] = await Promise.all([
        pool.query(
          "SELECT * FROM projects ORDER BY created_at DESC LIMIT $1",
          [limit],
        ),
        pool.query(
          "SELECT id, name, description, type, created_at, updated_at FROM categories WHERE type = 'project' ORDER BY name ASC",
        ),
      ]);

      return res.json({
        success: true,
        data: {
          projects: projectsRes.rows || [],
          categories: categoriesRes.rows || [],
        },
      });
    } catch (err) {
      console.error("[GET /api/admin/projects/overview]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/admin/projects/bulk-action
app.post(
  "/api/admin/projects/bulk-action",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const { action, ids } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "Список IDs обязателен" });
      }

      const validActions = ["publish", "draft", "delete"];
      if (!validActions.includes(action)) {
        return res
          .status(400)
          .json({ success: false, error: "Недопустимое действие" });
      }

      const cleanIds = ids
        .map((x) => String(x || "").trim())
        .filter((x) => /^[0-9a-fA-F-]{36}$/.test(x));

      if (cleanIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "Нет валидных IDs" });
      }

      let sql = "";
      if (action === "delete") {
        sql = "DELETE FROM projects WHERE id = ANY($1::uuid[])";
      } else if (action === "publish") {
        sql =
          "UPDATE projects SET is_published = true, status = 'published', updated_at = NOW() WHERE id = ANY($1::uuid[])";
      } else {
        sql =
          "UPDATE projects SET is_published = false, status = 'draft', updated_at = NOW() WHERE id = ANY($1::uuid[])";
      }

      const result = await pool.query(sql, [cleanIds]);

      invalidateCacheByPrefix("projects:");
      invalidateCacheByPrefix("forms:");

      return res.json({
        success: true,
        data: {
          action,
          affected: result.rowCount || 0,
          ids: cleanIds,
        },
      });
    } catch (err) {
      console.error("[POST /api/admin/projects/bulk-action]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// GET /api/admin/dashboard/summary
app.get(
  "/api/admin/dashboard/summary",
  authMiddleware(["admin", "manager"]),
  async (_req, res) => {
    try {
      const summaryQuery = `
        WITH
          today AS (
            SELECT date_trunc('day', NOW()) AS v
          ),
          yesterday AS (
            SELECT date_trunc('day', NOW()) - interval '1 day' AS v
          ),
          last7d AS (
            SELECT date_trunc('day', NOW()) - interval '7 day' AS v
          ),
          projects_agg AS (
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE is_published = true)::int AS published,
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_moderation
            FROM projects
          ),
          forms_agg AS (
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
              COUNT(*) FILTER (WHERE status IN ('in_progress', 'processing'))::int AS in_progress_count,
              COUNT(*) FILTER (
                WHERE created_at >= (SELECT v FROM today)
              )::int AS today_count
            FROM form_submissions
          ),
          tasks_agg AS (
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
              COUNT(*) FILTER (
                WHERE status != 'completed' AND due_date IS NOT NULL AND due_date < NOW()
              )::int AS overdue
            FROM tasks
          ),
          users_agg AS (
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE created_at >= NOW() - interval '30 day')::int AS new_30d
            FROM users
          ),
          visits_agg AS (
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (
                WHERE visit_date >= (SELECT v FROM today)
              )::int AS today_count,
              COUNT(*) FILTER (
                WHERE visit_date >= (SELECT v FROM yesterday)
                  AND visit_date < (SELECT v FROM today)
              )::int AS yesterday_count,
              COUNT(*) FILTER (
                WHERE visit_date >= (SELECT v FROM last7d)
              )::int AS last_7d
            FROM site_visits
          )
        SELECT
          p.total AS projects_total,
          p.published AS projects_published,
          (p.total - p.published)::int AS projects_drafts,
          p.pending_moderation,
          f.total AS forms_total,
          f.new_count,
          f.in_progress_count,
          f.today_count AS forms_today,
          t.total AS tasks_total,
          t.completed AS tasks_completed,
          t.overdue AS tasks_overdue,
          u.total AS users_total,
          u.new_30d,
          v.total AS visits_total,
          v.today_count AS visits_today,
          v.yesterday_count AS visits_yesterday,
          v.last_7d
        FROM projects_agg p
        CROSS JOIN forms_agg f
        CROSS JOIN tasks_agg t
        CROSS JOIN users_agg u
        CROSS JOIN visits_agg v
      `;

      const byCategoryQuery = `
        SELECT c.name, COUNT(p.id)::int AS value
        FROM categories c
        JOIN projects p ON p.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY value DESC
      `;

      const attentionFormsQuery = `
        SELECT id, topic, status, created_at, data
        FROM form_submissions
        WHERE status = 'new'
        ORDER BY created_at DESC
        LIMIT 5
      `;

      const attentionTasksQuery = `
        SELECT id, title, priority, due_date, status
        FROM tasks
        WHERE status != 'completed'
          AND due_date IS NOT NULL
          AND due_date < NOW()
        ORDER BY due_date ASC
        LIMIT 5
      `;

      const [summaryRes, byCategoryRes, formsRes, tasksRes] = await Promise.all([
        pool.query(summaryQuery),
        pool.query(byCategoryQuery),
        pool.query(attentionFormsQuery),
        pool.query(attentionTasksQuery),
      ]);

      const s = summaryRes.rows[0] || {};

      return res.json({
        success: true,
        data: {
          visits: {
            total: s.visits_total || 0,
            today: s.visits_today || 0,
            yesterday: s.visits_yesterday || 0,
            last7d: s.last_7d || 0,
          },
          projects: {
            total: s.projects_total || 0,
            published: s.projects_published || 0,
            drafts: s.projects_drafts || 0,
            pendingModeration: s.pending_moderation || 0,
            byCategory: byCategoryRes.rows || [],
          },
          tasks: {
            total: s.tasks_total || 0,
            completed: s.tasks_completed || 0,
            overdue: s.tasks_overdue || 0,
          },
          forms: {
            total: s.forms_total || 0,
            new: s.new_count || 0,
            inProgress: s.in_progress_count || 0,
            today: s.forms_today || 0,
          },
          users: {
            total: s.users_total || 0,
            new30d: s.new_30d || 0,
          },
          attention: {
            forms: formsRes.rows || [],
            overdueTasks: tasksRes.rows || [],
          },
        },
      });
    } catch (err) {
      console.error("[GET /api/admin/dashboard/summary]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// DELETE /api/admin/users/:userId
app.delete(
  "/api/admin/users/:userId",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM user_profiles WHERE id = $1", [
        req.params.userId,
      ]);
      await pool.query("DELETE FROM users WHERE id = $1", [req.params.userId]);
      invalidateCacheByPrefix("users:");
      return res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      console.error("[DELETE /api/admin/users/:userId]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// ─── GoodWood-style Client API ──────────────────────────────────────────────

// GET /api/client/:clientId/feed
app.get("/api/client/:clientId/feed", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const r = await pool.query(
      `SELECT * FROM client_feed WHERE client_id = $1 ORDER BY created_at ASC`,
      [clientId],
    );
    return res.json({ data: r.rows || [], error: null });
  } catch (err) {
    console.error(`[GET /api/client/${req.params.clientId}/feed]`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// POST /api/client/:clientId/feed
app.post("/api/client/:clientId/feed", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { type, content, author, attachments, metadata } = req.body;
    const r = await pool.query(
      `INSERT INTO client_feed (id, client_id, type, content, author, attachments, metadata, created_at, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), false) RETURNING *`,
      [uuidv4(), clientId, type, content, JSON.stringify(author), JSON.stringify(attachments || []), JSON.stringify(metadata || {})],
    );
    return res.json({ data: r.rows[0], error: null });
  } catch (err) {
    console.error(`[POST /api/client/${req.params.clientId}/feed]`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// GET /api/client/:clientId/documents
app.get("/api/client/:clientId/documents", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const r = await pool.query(
      `SELECT * FROM client_documents WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId],
    );
    return res.json({ data: r.rows || [], error: null });
  } catch (err) {
    console.error(`[GET /api/client/${req.params.clientId}/documents]`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// GET /api/client/:clientId/guest-links
app.get("/api/client/:clientId/guest-links", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const r = await pool.query(
      `SELECT * FROM guest_access_links WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId],
    );
    return res.json({ data: r.rows || [], error: null });
  } catch (err) {
    console.error(`[GET /api/client/${req.params.clientId}/guest-links]`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// POST /api/client/:clientId/guest-links
app.post("/api/client/:clientId/guest-links", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, access_level, expires_at } = req.body;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const r = await pool.query(
      `INSERT INTO guest_access_links (id, client_id, token, name, access_level, is_active, expires_at, visits_count, created_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, 0, NOW()) RETURNING *`,
      [uuidv4(), clientId, token, name, access_level, expires_at || null],
    );
    return res.json({ data: r.rows[0], error: null });
  } catch (err) {
    console.error(`[POST /api/client/${req.params.clientId}/guest-links]`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// GET /api/guest/:token - Validate guest token
app.get("/api/guest/:token/validate", async (req, res) => {
  try {
    const { token } = req.params;
    const r = await pool.query(
      `SELECT * FROM guest_access_links WHERE token = $1 AND is_active = true`,
      [token],
    );
    if (!r.rows[0]) {
      return res.status(404).json({ valid: false, error: "Invalid or expired token" });
    }
    const link = r.rows[0];
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(404).json({ valid: false, error: "Token expired" });
    }
    // Update visit count
    await pool.query(
      `UPDATE guest_access_links SET visits_count = visits_count + 1, last_visit_at = NOW() WHERE id = $1`,
      [link.id],
    );
    return res.json({ valid: true, data: link });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// ─── Telegram & Notifications (soft require) ──────────────────────────────────

try {
  const telegramApi = require("./api/telegram.cjs");
  app.use("/api/telegram", telegramApi);
} catch (_) {}

try {
  const notifApi = require("./api/notifications.cjs");
  app.use("/api/notifications", notifApi);
} catch (_) {}

// ─── SPA fallback (production) ────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/"))
      return res.status(404).json({ error: "Not found" });
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

if (
  cron.validate(SYNC_SCHEDULE) &&
  BITRIX_WEBHOOK_URL &&
  !BITRIX_WEBHOOK_URL.includes("yourdomain")
) {
  cron.schedule(SYNC_SCHEDULE, () => {
    console.log(
      "[Cron] Bitrix sync scheduled (configure BITRIX_WEBHOOK_URL to enable)",
    );
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(
    `[Server] DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  );
  if (process.env.NODE_ENV === "production") {
    console.log("[Server] Serving frontend from ./dist");
  }
});

module.exports = app;

"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const cron = require("node-cron");

// ─── App & Config ────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ugrabuilders";
const JWT_SECRET = process.env.JWT_SECRET || "ugra-secret-2024";
const BITRIX_WEBHOOK_URL =
  process.env.BITRIX_WEBHOOK_URL ||
  "https://yourdomain.bitrix24.ru/rest/1/your_webhook_key";
const SYNC_SCHEDULE = process.env.SYNC_SCHEDULE || "0 */4 * * *";
const SYNC_LIMIT = parseInt(process.env.SYNC_LIMIT || "50", 10);
const SYNC_RETRY_ATTEMPTS = parseInt(
  process.env.SYNC_RETRY_ATTEMPTS || "3",
  10,
);
const SYNC_RETRY_DELAY = parseInt(process.env.SYNC_RETRY_DELAY || "60000", 10);

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── MongoDB Connection ───────────────────────────────────────────────────────

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("[MongoDB] Connected to", MONGODB_URI))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

// ─── Mongoose Schemas & Models ────────────────────────────────────────────────

const baseOptions = { timestamps: false, versionKey: false };

// Helper: add string id field + toJSON transform
function makeSchema(fields, options = {}) {
  const schema = new mongoose.Schema(
    { id: { type: String, default: () => uuidv4(), index: true }, ...fields },
    { ...baseOptions, ...options },
  );
  schema.set("toJSON", {
    virtuals: false,
    transform: (_doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
  return schema;
}

// Users
const UserSchema = makeSchema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  username: { type: String },
  role: {
    type: String,
    enum: ["admin", "editor", "foreman", "manager", "client"],
    default: "client",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const User = mongoose.model("users", UserSchema);

// User Profiles
const UserProfileSchema = makeSchema({
  username: { type: String },
  role: { type: String },
  schedule: { type: mongoose.Schema.Types.Mixed, default: null },
  work_tasks: { type: mongoose.Schema.Types.Mixed, default: [] },
  folders: { type: mongoose.Schema.Types.Mixed, default: [] },
  project_stats: { type: mongoose.Schema.Types.Mixed, default: null },
  work_stages: { type: mongoose.Schema.Types.Mixed, default: [] },
  current_stage: { type: mongoose.Schema.Types.Mixed, default: null },
  client_stage: { type: mongoose.Schema.Types.Mixed, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const UserProfile = mongoose.model("user_profiles", UserProfileSchema);

// Projects
const ProjectSchema = makeSchema({
  areavalue: { type: Number },
  bathrooms: { type: Number },
  bedrooms: { type: Number },
  category_id: { type: String },
  content: { type: String },
  cover_image: { type: String },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String },
  description: { type: String },
  designer_first_name: { type: String },
  designer_last_name: { type: String },
  dimensions: { type: mongoose.Schema.Types.Mixed },
  hasgarage: { type: Boolean, default: false },
  hasterrace: { type: Boolean, default: false },
  is_published: { type: Boolean, default: false },
  material: { type: String },
  pricevalue: { type: Number },
  stories: { type: Number },
  style: { type: String },
  tags: { type: [String], default: [] },
  title: { type: String },
  type: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const Project = mongoose.model("projects", ProjectSchema);

// Project Images
const ProjectImageSchema = makeSchema({
  project_id: { type: String },
  image_url: { type: String },
  description: { type: String },
  display_order: { type: Number, default: 0 },
  image_type: { type: String },
  created_at: { type: Date, default: Date.now },
});
const ProjectImage = mongoose.model("project_images", ProjectImageSchema);

// Categories
const CategorySchema = makeSchema({
  name: { type: String },
  description: { type: String },
  type: { type: String, enum: ["project", "blog", "news"] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const Category = mongoose.model("categories", CategorySchema);

// Blog Posts
const BlogPostSchema = makeSchema({
  category_id: { type: String },
  content: { type: String },
  cover_image: { type: String },
  created_at: { type: Date, default: Date.now },
  is_published: { type: Boolean, default: false },
  summary: { type: String },
  tags: { type: [String], default: [] },
  title: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const BlogPost = mongoose.model("blog_posts", BlogPostSchema);

// Blog Images
const BlogImageSchema = makeSchema({
  blog_id: { type: String },
  image_url: { type: String },
  description: { type: String },
  display_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});
const BlogImage = mongoose.model("blog_images", BlogImageSchema);

// Comments
const CommentSchema = makeSchema({
  author_email: { type: String },
  author_name: { type: String },
  blog_id: { type: String },
  content: { type: String },
  created_at: { type: Date, default: Date.now },
  is_approved: { type: Boolean, default: false },
  parent_id: { type: String, default: null },
  updated_at: { type: Date, default: Date.now },
});
const Comment = mongoose.model("comments", CommentSchema);

// Reviews
const ReviewSchema = makeSchema({
  approved_by: { type: String },
  author_email: { type: String },
  author_name: { type: String },
  content: { type: String },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String },
  image_url: { type: String },
  is_published: { type: Boolean, default: false },
  project_id: { type: String },
  rating: { type: Number },
  title: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const Review = mongoose.model("reviews", ReviewSchema);

// Review Images
const ReviewImageSchema = makeSchema({
  review_id: { type: String },
  image_url: { type: String },
  description: { type: String },
  display_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});
const ReviewImage = mongoose.model("review_images", ReviewImageSchema);

// Finances
const FinanceSchema = makeSchema({
  amount: { type: Number },
  category: { type: String },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String },
  description: { type: String },
  transaction_date: { type: Date },
  type: { type: String },
});
const Finance = mongoose.model("finances", FinanceSchema);

// Gallery Items
const GalleryItemSchema = makeSchema({
  city: { type: String },
  construction_year: { type: Number },
  created_at: { type: Date, default: Date.now },
  description: { type: String },
  image_url: { type: String },
  title: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const GalleryItem = mongoose.model("gallery_items", GalleryItemSchema);

// Hero Carousel
const HeroCarouselSchema = makeSchema({
  created_at: { type: Date, default: Date.now },
  description: { type: String },
  display_order: { type: Number, default: 0 },
  image_url: { type: String },
  link_url: { type: String },
  title: { type: String },
});
const HeroCarousel = mongoose.model("hero_carousel", HeroCarouselSchema);

// News
const NewsSchema = makeSchema({
  category_id: { type: String },
  content: { type: String },
  cover_image: { type: String },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String },
  is_published: { type: Boolean, default: false },
  slug: { type: String },
  summary: { type: String },
  tags: { type: [String], default: [] },
  title: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const News = mongoose.model("news", NewsSchema);

// Project Orders
const ProjectOrderSchema = makeSchema({
  created_at: { type: Date, default: Date.now },
  notes: { type: String },
  project_id: { type: String },
  status: { type: String, default: "pending" },
  updated_at: { type: Date, default: Date.now },
  user_email: { type: String },
  user_phone: { type: String },
});
const ProjectOrder = mongoose.model("project_orders", ProjectOrderSchema);

// Site Visits
const SiteVisitSchema = makeSchema({
  ip_address: { type: String },
  page_path: { type: String },
  user_agent: { type: String },
  user_id: { type: String },
  visit_date: { type: Date, default: Date.now },
});
const SiteVisit = mongoose.model("site_visits", SiteVisitSchema);

// System Settings
const SystemSettingsSchema = makeSchema({
  cache_enabled: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  max_concurrent_requests: { type: Number, default: 10 },
  preload_assets: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now },
});
const SystemSettings = mongoose.model("system_settings", SystemSettingsSchema);

// Tasks
const TaskSchema = makeSchema({
  assigned_to: { type: String },
  completed_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String },
  description: { type: String },
  due_date: { type: Date },
  priority: { type: String, default: "medium" },
  status: { type: String, default: "pending" },
  title: { type: String },
  updated_at: { type: Date, default: Date.now },
});
const Task = mongoose.model("tasks", TaskSchema);

// Form Submissions
const FormSubmissionSchema = makeSchema({
  form_type: { type: String },
  topic: { type: String },
  custom_topic: { type: String },
  source: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: "new" },
  processed: { type: Boolean, default: false },
  processed_at: { type: Date },
  external_id: { type: String },
  external_data: { type: mongoose.Schema.Types.Mixed },
  is_pinned: { type: Boolean, default: false },
  pinned_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const FormSubmission = mongoose.model("form_submissions", FormSubmissionSchema);

// Bitrix Leads
const BitrixLeadSchema = makeSchema({
  lead_id: { type: Number },
  title: { type: String },
  name: { type: String },
  last_name: { type: String },
  email: { type: String },
  phone: { type: String },
  status_id: { type: String },
  source_id: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
  raw_data: { type: mongoose.Schema.Types.Mixed },
  last_sync: { type: Date, default: Date.now },
});
const BitrixLead = mongoose.model("bitrix_leads", BitrixLeadSchema);

// Project Form Links
const ProjectFormLinkSchema = makeSchema({
  project_id: { type: String },
  form_submission_id: { type: String },
  created_at: { type: Date, default: Date.now },
});
const ProjectFormLink = mongoose.model(
  "project_form_links",
  ProjectFormLinkSchema,
);

// Client Photos
const ClientPhotoSchema = makeSchema({
  client_id: { type: String, required: true, index: true },
  url: { type: String, required: true },
  caption: { type: String },
  category: { type: String, default: "Прочее" },
  date: { type: Date, default: Date.now },
  uploaded_by: { type: String }, // manager/admin user id
  uploaded_by_name: { type: String },
  created_at: { type: Date, default: Date.now },
});
const ClientPhoto = mongoose.model("client_photos", ClientPhotoSchema);

// ─── Model Registry ───────────────────────────────────────────────────────────

const MODELS = {
  users: User,
  user_profiles: UserProfile,
  projects: Project,
  project_images: ProjectImage,
  categories: Category,
  blog_posts: BlogPost,
  blog_images: BlogImage,
  comments: Comment,
  reviews: Review,
  review_images: ReviewImage,
  finances: Finance,
  gallery_items: GalleryItem,
  hero_carousel: HeroCarousel,
  news: News,
  project_orders: ProjectOrder,
  site_visits: SiteVisit,
  system_settings: SystemSettings,
  tasks: Task,
  form_submissions: FormSubmission,
  bitrix_leads: BitrixLead,
  project_form_links: ProjectFormLink,
  client_photos: ClientPhoto,
};

// ─── JWT Helpers ──────────────────────────────────────────────────────────────

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return { decoded: jwt.verify(token, JWT_SECRET), error: null };
  } catch (err) {
    return { decoded: null, error: err.message };
  }
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const authMiddleware = (allowedRoles) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const { decoded, error: tokenError } = verifyToken(token);
  if (tokenError || !decoded) {
    return res.status(401).json({ error: "Неверный токен авторизации" });
  }
  try {
    const user = await User.findOne({ id: decoded.userId }).lean();
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      return res
        .status(403)
        .json({ error: "Недостаточно прав для выполнения операции" });
    }
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    req.user = safeUser;
    req.token = token;
    next();
  } catch (err) {
    console.error("[authMiddleware] Error:", err);
    res.status(500).json({ error: "Ошибка сервера при проверке авторизации" });
  }
};

// Optional auth — attaches user if token present but does not block
const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { decoded } = verifyToken(token);
    if (decoded) {
      try {
        const user = await User.findOne({ id: decoded.userId }).lean();
        if (user) {
          const safeUser = { ...user };
          delete safeUser.passwordHash;
          req.user = safeUser;
          req.token = token;
        }
      } catch (_err) {
        /* ignore */
      }
    }
  }
  next();
};

// ─── Format user for response ─────────────────────────────────────────────────

function formatUser(user) {
  if (!user) return null;
  const u = typeof user.toJSON === "function" ? user.toJSON() : { ...user };
  delete u.passwordHash;
  delete u._id;
  delete u.__v;
  return u;
}

function makeSession(user, token) {
  return { access_token: token, user: formatUser(user) };
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, options } = req.body;
    const username =
      options && options.data && options.data.username
        ? options.data.username
        : email.split("@")[0];

    if (!email || !password) {
      return res
        .status(400)
        .json({ data: null, error: { message: "Email и пароль обязательны" } });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({
        data: null,
        error: { message: "Пользователь с таким email уже существует" },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user = await User.create({
      id: userId,
      email,
      passwordHash,
      username,
      role: "client",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create profile
    await UserProfile.create({
      id: userId,
      username,
      role: "client",
      created_at: new Date(),
      updated_at: new Date(),
    });

    const token = signToken({ userId, email, role: user.role });
    return res.json({
      data: { user: formatUser(user), session: makeSession(user, token) },
      error: null,
    });
  } catch (err) {
    console.error("[signup]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ data: null, error: { message: "Email и пароль обязательны" } });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ data: null, error: { message: "Неверный email или пароль" } });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res
        .status(401)
        .json({ data: null, error: { message: "Неверный email или пароль" } });
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return res.json({
      data: { user: formatUser(user), session: makeSession(user, token) },
      error: null,
    });
  } catch (err) {
    console.error("[login]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (_req, res) => {
  // Stateless JWT — nothing to invalidate server-side
  return res.json({});
});

// GET /api/auth/session
app.get("/api/auth/session", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ data: { session: null }, error: null });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const { decoded, error: tokenError } = verifyToken(token);
    if (tokenError || !decoded) {
      return res.json({ data: { session: null }, error: null });
    }
    const user = await User.findOne({ id: decoded.userId });
    if (!user) {
      return res.json({ data: { session: null }, error: null });
    }
    return res.json({
      data: { session: makeSession(user, token) },
      error: null,
    });
  } catch (err) {
    console.error("[session]", err);
    return res
      .status(500)
      .json({ data: { session: null }, error: { message: err.message } });
  }
});

// GET /api/auth/user
app.get("/api/auth/user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        data: { user: null },
        error: { message: "Требуется авторизация" },
      });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const { decoded, error: tokenError } = verifyToken(token);
    if (tokenError || !decoded) {
      return res
        .status(401)
        .json({ data: { user: null }, error: { message: "Неверный токен" } });
    }
    const user = await User.findOne({ id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        data: { user: null },
        error: { message: "Пользователь не найден" },
      });
    }
    return res.json({ data: { user: formatUser(user) }, error: null });
  } catch (err) {
    console.error("[auth/user]", err);
    return res
      .status(500)
      .json({ data: { user: null }, error: { message: err.message } });
  }
});

// ─── Filter Builder ───────────────────────────────────────────────────────────

function applyFilters(query, filters) {
  if (!filters || !Array.isArray(filters)) return query;
  for (const f of filters) {
    const { op, field, value } = f;
    if (!field || op === undefined) continue;
    switch (op) {
      case "eq":
        query = query.where(field).equals(value);
        break;
      case "neq":
        query = query.where(field).ne(value);
        break;
      case "gt":
        query = query.where(field).gt(value);
        break;
      case "gte":
        query = query.where(field).gte(value);
        break;
      case "lt":
        query = query.where(field).lt(value);
        break;
      case "lte":
        query = query.where(field).lte(value);
        break;
      case "like":
        query = query
          .where(field)
          .regex(new RegExp(value.replace(/%/g, ".*"), ""));
        break;
      case "ilike":
        query = query
          .where(field)
          .regex(new RegExp(value.replace(/%/g, ".*"), "i"));
        break;
      case "in":
        query = query.where(field).in(Array.isArray(value) ? value : [value]);
        break;
      case "is":
        if (value === null || value === "null") {
          query = query.where(field).equals(null);
        } else {
          query = query.where(field).equals(value);
        }
        break;
      default:
        break;
    }
  }
  return query;
}

function buildMongoFilter(filters) {
  if (!filters || !Array.isArray(filters)) return {};
  const mongoFilter = {};
  for (const f of filters) {
    const { op, field, value } = f;
    if (!field || op === undefined) continue;
    switch (op) {
      case "eq":
        mongoFilter[field] = value;
        break;
      case "neq":
        mongoFilter[field] = { $ne: value };
        break;
      case "gt":
        mongoFilter[field] = { $gt: value };
        break;
      case "gte":
        mongoFilter[field] = { $gte: value };
        break;
      case "lt":
        mongoFilter[field] = { $lt: value };
        break;
      case "lte":
        mongoFilter[field] = { $lte: value };
        break;
      case "like":
        mongoFilter[field] = { $regex: value.replace(/%/g, ".*") };
        break;
      case "ilike":
        mongoFilter[field] = {
          $regex: value.replace(/%/g, ".*"),
          $options: "i",
        };
        break;
      case "in":
        mongoFilter[field] = { $in: Array.isArray(value) ? value : [value] };
        break;
      case "is":
        mongoFilter[field] = value === null || value === "null" ? null : value;
        break;
      default:
        break;
    }
  }
  return mongoFilter;
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

// ─── Generic DB Routes ────────────────────────────────────────────────────────

// GET /api/db/:collection
app.get("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];
    if (!Model) {
      return res.status(404).json({
        data: null,
        error: { message: `Collection '${collection}' not found` },
        count: 0,
      });
    }

    const selectParam = req.query.select || "*";
    const filtersParam = parseJsonParam(req.query.filters, []);
    const orderParam = parseJsonParam(req.query.order, null);
    const limitParam = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const headParam = req.query.head === "true" || req.query.head === true;
    const singleParam =
      req.query.single === "true" || req.query.single === true;

    const mongoFilter = buildMongoFilter(filtersParam);

    if (headParam) {
      const count = await Model.countDocuments(mongoFilter);
      return res.json({ data: null, error: null, count });
    }

    // Build projection
    let projection = null;
    if (selectParam && selectParam !== "*") {
      projection = {};
      selectParam
        .split(",")
        .map((s) => s.trim())
        .forEach((f) => {
          projection[f] = 1;
        });
      // Always include id
      projection["id"] = 1;
      projection["_id"] = 0;
    } else {
      projection = { _id: 0 };
    }

    let query = Model.find(mongoFilter, projection);

    if (orderParam) {
      const sortField = orderParam.field;
      const sortDir = orderParam.ascending === false ? -1 : 1;
      if (sortField) query = query.sort({ [sortField]: sortDir });
    }

    if (limitParam && limitParam > 0) query = query.limit(limitParam);

    const docs = await query.lean();
    // Clean _id from lean results
    const cleaned = docs.map((d) => {
      const r = { ...d };
      delete r._id;
      delete r.__v;
      return r;
    });
    const count = cleaned.length;

    if (singleParam) {
      return res.json({ data: cleaned[0] || null, error: null, count });
    }
    return res.json({ data: cleaned, error: null, count });
  } catch (err) {
    console.error(`[GET /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message }, count: 0 });
  }
});

// POST /api/db/:collection — insert or upsert
app.post("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];
    if (!Model) {
      return res.status(404).json({
        data: null,
        error: { message: `Collection '${collection}' not found` },
      });
    }

    const { data, operation = "insert", upsert_on } = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ data: null, error: { message: "data is required" } });
    }

    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];

    const results = [];

    for (const item of items) {
      // Ensure id field
      if (!item.id) item.id = uuidv4();
      // Set timestamps if not provided
      if (!item.created_at) item.created_at = new Date();
      if (item.updated_at !== undefined || Model.schema.paths.updated_at) {
        item.updated_at = new Date();
      }

      if (operation === "upsert" && upsert_on) {
        const filterKey = upsert_on;
        const filterValue = item[filterKey];
        if (filterValue !== undefined) {
          const updated = await Model.findOneAndUpdate(
            { [filterKey]: filterValue },
            { $set: item },
            { upsert: true, new: true, lean: true },
          );
          const r = { ...updated };
          delete r._id;
          delete r.__v;
          results.push(r);
        } else {
          const created = await Model.create(item);
          results.push(created.toJSON());
        }
      } else {
        const created = await Model.create(item);
        results.push(created.toJSON());
      }
    }

    return res.json({ data: isArray ? results : results[0], error: null });
  } catch (err) {
    console.error(`[POST /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// PATCH /api/db/:collection — update by filters
app.patch("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];
    if (!Model) {
      return res.status(404).json({
        data: null,
        error: { message: `Collection '${collection}' not found` },
      });
    }

    const { data, filters } = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ data: null, error: { message: "data is required" } });
    }

    const mongoFilter = buildMongoFilter(filters);
    const updateData = { ...data };
    delete updateData._id;
    delete updateData.__v;
    if (Model.schema.paths.updated_at) {
      updateData.updated_at = new Date();
    }

    const updated = await Model.findOneAndUpdate(
      mongoFilter,
      { $set: updateData },
      { new: true, lean: true },
    );

    if (!updated) {
      return res.json({ data: null, error: { message: "Document not found" } });
    }

    const r = { ...updated };
    delete r._id;
    delete r.__v;
    return res.json({ data: r, error: null });
  } catch (err) {
    console.error(`[PATCH /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/db/:collection — delete by filters
app.delete("/api/db/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];
    if (!Model) {
      return res.status(404).json({
        data: null,
        error: { message: `Collection '${collection}' not found` },
      });
    }

    const { filters } = req.body || {};
    const mongoFilter = buildMongoFilter(filters);

    if (Object.keys(mongoFilter).length === 0) {
      return res.status(400).json({
        data: null,
        error: { message: "Filters are required for delete" },
      });
    }

    const result = await Model.deleteMany(mongoFilter);
    return res.json({
      data: { deletedCount: result.deletedCount },
      error: null,
    });
  } catch (err) {
    console.error(`[DELETE /api/db/${req.params.collection}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Storage / File Upload ────────────────────────────────────────────────────

function ensureBucketDir(bucket) {
  const dir = path.join(__dirname, "uploads", bucket);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storageEngine = multer.diskStorage({
  destination: (req, _file, cb) => {
    const bucket = req.params.bucket || "default";
    const dir = ensureBucketDir(bucket);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const requestedPath = req.query.path;
    if (requestedPath) {
      cb(null, path.basename(requestedPath));
    } else {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    }
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ─── Client Photos API ────────────────────────────────────────────────────────

// GET /api/client-photos/:clientId — get all photos for a client
app.get("/api/client-photos/:clientId", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const photos = await ClientPhoto.find({ client_id: clientId })
      .sort({ created_at: -1 })
      .lean();
    const cleaned = photos.map((p) => {
      const r = { ...p };
      delete r._id;
      delete r.__v;
      return r;
    });
    return res.json({ data: cleaned, error: null });
  } catch (err) {
    console.error("[GET /api/client-photos]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// POST /api/client-photos/:clientId/upload — upload photo and save to DB
app.post(
  "/api/client-photos/:clientId/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ data: null, error: { message: "No file uploaded" } });
      }
      const { clientId } = req.params;
      const { caption, category, date, uploaded_by, uploaded_by_name } =
        req.body;

      const fileUrl = `http://localhost:${PORT}/uploads/client-photos/${req.file.filename}`;

      const photo = await ClientPhoto.create({
        id: uuidv4(),
        client_id: clientId,
        url: fileUrl,
        caption: caption || req.file.originalname.replace(/\.[^.]+$/, ""),
        category: category || "Прочее",
        date: date ? new Date(date) : new Date(),
        uploaded_by: uploaded_by || null,
        uploaded_by_name: uploaded_by_name || null,
        created_at: new Date(),
      });

      const result = photo.toJSON();
      return res.json({ data: result, error: null });
    } catch (err) {
      console.error("[POST /api/client-photos/upload]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// PATCH /api/client-photos/:photoId — update caption/category
app.patch(
  "/api/client-photos/photo/:photoId",
  optionalAuth,
  async (req, res) => {
    try {
      const { photoId } = req.params;
      const { caption, category, date } = req.body;
      const update = {};
      if (caption !== undefined) update.caption = caption;
      if (category !== undefined) update.category = category;
      if (date !== undefined) update.date = new Date(date);

      const updated = await ClientPhoto.findOneAndUpdate(
        { id: photoId },
        { $set: update },
        { new: true, lean: true },
      );
      if (!updated) {
        return res
          .status(404)
          .json({ data: null, error: { message: "Photo not found" } });
      }
      const r = { ...updated };
      delete r._id;
      delete r.__v;
      return res.json({ data: r, error: null });
    } catch (err) {
      console.error("[PATCH /api/client-photos/photo]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// DELETE /api/client-photos/photo/:photoId — delete one photo
app.delete(
  "/api/client-photos/photo/:photoId",
  optionalAuth,
  async (req, res) => {
    try {
      const { photoId } = req.params;
      const photo = await ClientPhoto.findOne({ id: photoId }).lean();
      if (!photo) {
        return res
          .status(404)
          .json({ data: null, error: { message: "Photo not found" } });
      }
      // Remove file from disk
      try {
        const filename = path.basename(photo.url);
        const filePath = path.join(
          __dirname,
          "uploads",
          "client-photos",
          filename,
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {
        /* ignore file deletion errors */
      }

      await ClientPhoto.deleteOne({ id: photoId });
      return res.json({ data: { deleted: true }, error: null });
    } catch (err) {
      console.error("[DELETE /api/client-photos/photo]", err);
      return res
        .status(500)
        .json({ data: null, error: { message: err.message } });
    }
  },
);

// DELETE /api/client-photos/:clientId — delete ALL photos for a client
app.delete("/api/client-photos/:clientId", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const photos = await ClientPhoto.find({ client_id: clientId }).lean();
    for (const photo of photos) {
      try {
        const filename = path.basename(photo.url);
        const filePath = path.join(
          __dirname,
          "uploads",
          "client-photos",
          filename,
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {
        /* ignore */
      }
    }
    await ClientPhoto.deleteMany({ client_id: clientId });
    return res.json({ data: { deleted: photos.length }, error: null });
  } catch (err) {
    console.error("[DELETE /api/client-photos/:clientId]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

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
    console.error("[POST /api/storage/upload]", err);
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
    console.error("[DELETE /api/storage/remove]", err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── RPC ──────────────────────────────────────────────────────────────────────

app.post("/api/rpc/:fn", optionalAuth, async (req, res) => {
  const { fn } = req.params;

  try {
    switch (fn) {
      case "ensure_bucket_exists":
      case "create_project_images_bucket": {
        const bucketName =
          req.body && req.body.bucket_name
            ? req.body.bucket_name
            : "project-images-new";
        ensureBucketDir(bucketName);
        return res.json({ data: { name: bucketName }, error: null });
      }

      case "admin_delete_user": {
        const userId = req.body && req.body.user_id;
        if (!userId) {
          return res
            .status(400)
            .json({ data: null, error: { message: "user_id is required" } });
        }
        await User.deleteOne({ id: userId });
        await UserProfile.deleteOne({ id: userId });
        return res.json({ data: { deleted: true }, error: null });
      }

      case "delete_project_transaction": {
        const projectId = req.body && req.body.project_id;
        if (!projectId) {
          return res
            .status(400)
            .json({ data: null, error: { message: "project_id is required" } });
        }
        await Project.deleteOne({ id: projectId });
        await ProjectImage.deleteMany({ project_id: projectId });
        await Review.deleteMany({ project_id: projectId });
        await ProjectOrder.deleteMany({ project_id: projectId });
        return res.json({ data: { deleted: true }, error: null });
      }

      default:
        console.warn(`[RPC] Unknown function: ${fn}`);
        return res.json({ data: null, error: null });
    }
  } catch (err) {
    console.error(`[RPC/${fn}]`, err);
    return res
      .status(500)
      .json({ data: null, error: { message: err.message } });
  }
});

// ─── Forms / CRM Routes ───────────────────────────────────────────────────────

app.post("/api/forms/submit", async (req, res) => {
  try {
    const formData = req.body;
    if (!formData || !formData.form_type) {
      return res
        .status(400)
        .json({ success: false, error: "form_type is required" });
    }

    const {
      form_type,
      topic,
      custom_topic,
      source,
      data: fData,
      status = "new",
    } = formData;
    const submissionId = uuidv4();
    const submission = await FormSubmission.create({
      id: submissionId,
      form_type,
      topic,
      custom_topic,
      source,
      data: fData || {},
      status,
      processed: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Try to send to Bitrix24
    try {
      const bitrixId = await sendToBitrix24({
        name: fData && fData.name,
        email: fData && fData.email,
        phone: fData && fData.phone,
        message: fData && fData.message,
        source,
        topic,
      });
      if (bitrixId) {
        await FormSubmission.findOneAndUpdate(
          { id: submissionId },
          {
            $set: {
              external_id: String(bitrixId),
              external_data: { bitrix_id: bitrixId },
              updated_at: new Date(),
            },
          },
        );
      }
    } catch (bitrixErr) {
      console.warn(
        "[forms/submit] Bitrix24 error (non-fatal):",
        bitrixErr.message,
      );
    }

    return res.json({
      success: true,
      message: "Форма успешно отправлена",
      data: { id: submission.id },
    });
  } catch (err) {
    console.error("[forms/submit]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get(
  "/api/forms",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      let query = FormSubmission.find({}).lean();
      query = query.sort({ created_at: -1 });
      if (req.query.limit) query = query.limit(parseInt(req.query.limit, 10));
      const forms = await query;
      const cleaned = forms.map((d) => {
        const r = { ...d };
        delete r._id;
        delete r.__v;
        return r;
      });
      return res.json({ success: true, data: cleaned, count: cleaned.length });
    } catch (err) {
      console.error("[GET /api/forms]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.get(
  "/api/forms/:id",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const form = await FormSubmission.findOne({ id: req.params.id }).lean();
      if (!form)
        return res.status(404).json({ success: false, error: "Not found" });
      const r = { ...form };
      delete r._id;
      delete r.__v;
      return res.json({ success: true, data: r });
    } catch (err) {
      console.error("[GET /api/forms/:id]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.patch(
  "/api/forms/:id/status",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await FormSubmission.findOneAndUpdate(
        { id: req.params.id },
        { $set: { status, updated_at: new Date() } },
        { new: true, lean: true },
      );
      if (!updated)
        return res.status(404).json({ success: false, error: "Not found" });
      const r = { ...updated };
      delete r._id;
      delete r.__v;
      return res.json({ success: true, data: r });
    } catch (err) {
      console.error("[PATCH /api/forms/:id/status]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.patch(
  "/api/forms/:id/process",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const formDoc = await FormSubmission.findOne({ id }).lean();
      if (!formDoc)
        return res.status(404).json({ success: false, error: "Not found" });

      const { status: newStatus } = req.body;

      // Sync status to Bitrix24 if external_id exists
      if (
        formDoc.external_id &&
        BITRIX_WEBHOOK_URL &&
        !BITRIX_WEBHOOK_URL.includes("yourdomain")
      ) {
        try {
          let bitrixStatus = "IN_PROCESS";
          if (newStatus === "completed") bitrixStatus = "CONVERTED";
          else if (newStatus === "cancelled") bitrixStatus = "JUNK";

          await axios.post(`${BITRIX_WEBHOOK_URL}/crm.lead.update.json`, {
            id: formDoc.external_id,
            fields: { STATUS_ID: bitrixStatus },
          });
        } catch (bErr) {
          console.warn("[process] Bitrix update error:", bErr.message);
        }
      }

      const updated = await FormSubmission.findOneAndUpdate(
        { id },
        {
          $set: {
            status: newStatus || "processed",
            processed: true,
            processed_at: new Date(),
            updated_at: new Date(),
          },
        },
        { new: true, lean: true },
      );
      const r = { ...updated };
      delete r._id;
      delete r.__v;
      return res.json({ success: true, message: "Форма обработана", data: r });
    } catch (err) {
      console.error("[PATCH /api/forms/:id/process]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.patch(
  "/api/forms/:id/pin",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const { is_pinned } = req.body;
      const updated = await FormSubmission.findOneAndUpdate(
        { id: req.params.id },
        {
          $set: {
            is_pinned: !!is_pinned,
            pinned_at: is_pinned ? new Date() : null,
            updated_at: new Date(),
          },
        },
        { new: true, lean: true },
      );
      if (!updated)
        return res.status(404).json({ success: false, error: "Not found" });
      const r = { ...updated };
      delete r._id;
      delete r.__v;
      return res.json({
        success: true,
        message: is_pinned ? "Форма закреплена" : "Форма откреплена",
        data: r,
      });
    } catch (err) {
      console.error("[PATCH /api/forms/:id/pin]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// ─── Bitrix24 Integration ─────────────────────────────────────────────────────

async function sendToBitrix24({ name, email, phone, message, source, topic }) {
  if (!BITRIX_WEBHOOK_URL || BITRIX_WEBHOOK_URL.includes("yourdomain")) {
    console.warn("[Bitrix24] Webhook URL not configured, skipping");
    return null;
  }
  const bitrixLeadData = {
    TITLE: `Заявка: ${topic || "Сайт"}`,
    NAME: name || "Не указано",
    EMAIL: [{ VALUE: email || "", VALUE_TYPE: "WORK" }],
    PHONE: [{ VALUE: phone || "", VALUE_TYPE: "WORK" }],
    COMMENTS: message || "",
    SOURCE_ID: source || "WEB",
    SOURCE_DESCRIPTION: `Источник: ${source || "сайт"}`,
  };

  const response = await axios.post(`${BITRIX_WEBHOOK_URL}/crm.lead.add.json`, {
    fields: bitrixLeadData,
    params: { REGISTER_SONET_EVENT: "Y" },
  });

  const id = response.data && response.data.result;
  return id || null;
}

// ─── Bitrix Sync ──────────────────────────────────────────────────────────────

const syncStatus = {
  lastSync: null,
  lastSyncStatus: null,
  inProgress: false,
  totalSynced: 0,
  totalConverted: 0,
  errors: [],
  lastError: null,
  syncHistory: [],
};

async function syncBitrixDataWithRetry() {
  if (syncStatus.inProgress) {
    return { success: false, error: "Синхронизация уже выполняется" };
  }
  syncStatus.inProgress = true;
  let attempt = 0;
  let result = null;

  while (attempt < SYNC_RETRY_ATTEMPTS) {
    attempt++;
    try {
      result = await doSyncBitrix();
      break;
    } catch (err) {
      console.error(`[Bitrix Sync] Attempt ${attempt} failed:`, err.message);
      syncStatus.lastError = err.message;
      if (attempt < SYNC_RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, SYNC_RETRY_DELAY));
      } else {
        result = {
          success: false,
          error: err.message,
          attempts: attempt,
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  syncStatus.inProgress = false;
  if (result && result.success) {
    syncStatus.lastSync = new Date().toISOString();
    syncStatus.lastSyncStatus = "success";
    syncStatus.totalSynced += result.synced || 0;
    syncStatus.totalConverted += result.converted || 0;
    syncStatus.syncHistory.push({
      ...result,
      timestamp: new Date().toISOString(),
    });
    if (syncStatus.syncHistory.length > 20) syncStatus.syncHistory.shift();
  } else if (result) {
    syncStatus.lastSyncStatus = "error";
    syncStatus.errors.push({
      message: result.error,
      timestamp: new Date().toISOString(),
    });
    if (syncStatus.errors.length > 50) syncStatus.errors.shift();
  }
  return result;
}

async function doSyncBitrix() {
  if (!BITRIX_WEBHOOK_URL || BITRIX_WEBHOOK_URL.includes("yourdomain")) {
    return { success: false, error: "Bitrix24 webhook not configured" };
  }

  const lastSyncDate = syncStatus.lastSync
    ? new Date(syncStatus.lastSync).toISOString().split("T")[0]
    : "2020-01-01";

  const response = await axios.post(
    `${BITRIX_WEBHOOK_URL}/crm.lead.list.json`,
    {
      order: { DATE_CREATE: "DESC" },
      filter: { ">DATE_CREATE": lastSyncDate },
      select: [
        "ID",
        "TITLE",
        "NAME",
        "LAST_NAME",
        "EMAIL",
        "PHONE",
        "STATUS_ID",
        "SOURCE_ID",
        "DATE_CREATE",
        "DATE_MODIFY",
      ],
      start: 0,
    },
  );

  const leads =
    response.data && response.data.result ? response.data.result : [];
  let syncedCount = 0;
  let convertedCount = 0;

  for (const lead of leads.slice(0, SYNC_LIMIT)) {
    const leadId = parseInt(lead.ID, 10);
    const email = lead.EMAIL && lead.EMAIL[0] ? lead.EMAIL[0].VALUE : "";
    const phone = lead.PHONE && lead.PHONE[0] ? lead.PHONE[0].VALUE : "";

    const existing = await BitrixLead.findOne({ lead_id: leadId });
    const updateData = {
      lead_id: leadId,
      title: lead.TITLE,
      name: lead.NAME,
      last_name: lead.LAST_NAME,
      email,
      phone,
      status_id: lead.STATUS_ID,
      source_id: lead.SOURCE_ID,
      updated_at: new Date(lead.DATE_MODIFY || Date.now()),
      raw_data: lead,
      last_sync: new Date(),
    };

    if (existing) {
      await BitrixLead.findOneAndUpdate(
        { lead_id: leadId },
        { $set: updateData },
      );
    } else {
      await BitrixLead.create({
        id: uuidv4(),
        ...updateData,
        created_at: new Date(lead.DATE_CREATE || Date.now()),
      });
      syncedCount++;
    }

    // Try to create / match form submission
    const existingForm = await FormSubmission.findOne({
      external_id: String(leadId),
    });
    if (!existingForm) {
      let formType = "contact";
      if (lead.SOURCE_ID === "CALL") formType = "callback";
      else if (lead.SOURCE_ID === "WEB") formType = "contact";

      await FormSubmission.create({
        id: uuidv4(),
        form_type: formType,
        topic: lead.TITLE,
        source: lead.SOURCE_ID,
        data: {
          name: `${lead.NAME || ""} ${lead.LAST_NAME || ""}`.trim(),
          email,
          phone,
        },
        status: lead.STATUS_ID === "CONVERTED" ? "completed" : "new",
        external_id: String(leadId),
        external_data: lead,
        created_at: new Date(lead.DATE_CREATE || Date.now()),
        updated_at: new Date(),
      });
      convertedCount++;
    }
  }

  return { success: true, synced: syncedCount, converted: convertedCount };
}

function getNextScheduledSync() {
  try {
    return cron.validate(SYNC_SCHEDULE) ? SYNC_SCHEDULE : null;
  } catch (_) {
    return null;
  }
}

// Bitrix sync routes
app.get(
  "/api/bitrix/status",
  authMiddleware(["admin", "manager"]),
  (_req, res) => {
    return res.json({
      success: true,
      data: { ...syncStatus, nextScheduledSync: getNextScheduledSync() },
    });
  },
);

app.post(
  "/api/bitrix/sync",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const syncPromise = syncBitrixDataWithRetry();
      return res.json({
        success: true,
        message: "Синхронизация запущена",
        status: { inProgress: true, nextScheduledSync: getNextScheduledSync() },
      });
      // Fire and forget — result is tracked in syncStatus
      syncPromise.catch((e) => console.error("[sync route]", e));
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.get(
  "/api/bitrix/leads",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || "50", 10);
      const leads = await BitrixLead.find({})
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();
      const cleaned = leads.map((d) => {
        const r = { ...d };
        delete r._id;
        delete r.__v;
        return r;
      });
      return res.json({ success: true, data: cleaned, count: cleaned.length });
    } catch (err) {
      console.error("[GET /api/bitrix/leads]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.post(
  "/api/bitrix/convert",
  authMiddleware(["admin", "manager"]),
  async (req, res) => {
    try {
      const leads = await BitrixLead.find({}).lean();
      const existing = await FormSubmission.find({}).distinct("external_id");
      const existingSet = new Set(existing.map(String));
      let convertedCount = 0;

      for (const lead of leads) {
        if (existingSet.has(String(lead.lead_id))) continue;
        let formType = "contact";
        if (lead.source_id === "CALL") formType = "callback";
        let status = "new";
        if (lead.status_id === "CONVERTED") status = "completed";
        else if (lead.status_id === "JUNK") status = "cancelled";

        await FormSubmission.create({
          id: uuidv4(),
          form_type: formType,
          topic: lead.title,
          source: lead.source_id,
          data: {
            name: `${lead.name || ""} ${lead.last_name || ""}`.trim(),
            email: lead.email,
            phone: lead.phone,
          },
          status,
          external_id: String(lead.lead_id),
          external_data: lead.raw_data,
          created_at: lead.created_at || new Date(),
          updated_at: new Date(),
        });
        convertedCount++;
      }

      return res.json({
        success: true,
        message: "Конвертация завершена",
        count: convertedCount,
        total: leads.length,
      });
    } catch (err) {
      console.error("[POST /api/bitrix/convert]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// ─── Telegram & Notification APIs ────────────────────────────────────────────

try {
  const telegramApi = require("./api/telegram.cjs");
  app.use("/api/telegram", telegramApi);
  console.log("[Server] Telegram API loaded");
} catch (err) {
  console.warn("[Server] telegram.cjs not loaded:", err.message);
}

try {
  const notificationService = require("./api/notifications.cjs");
  app.use("/api/notifications", notificationService);
  console.log("[Server] Notifications API loaded");
} catch (err) {
  console.warn("[Server] notifications.cjs not loaded:", err.message);
}

// ─── User Profile RPC-style endpoints ────────────────────────────────────────

app.post("/api/user/update-stage", optionalAuth, async (req, res) => {
  try {
    const { userId, stage } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, error: "userId required" });
    const result = await UserProfile.findOneAndUpdate(
      { id: userId },
      { $set: { current_stage: stage, updated_at: new Date() } },
      { new: true, lean: true },
    );
    const r = result ? { ...result } : null;
    if (r) {
      delete r._id;
      delete r.__v;
    }
    return res.json({ success: true, data: r });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/update-client-stage", optionalAuth, async (req, res) => {
  try {
    const { userId, stage } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, error: "userId required" });
    const result = await UserProfile.findOneAndUpdate(
      { id: userId },
      { $set: { client_stage: stage, updated_at: new Date() } },
      { new: true, lean: true },
    );
    const r = result ? { ...result } : null;
    if (r) {
      delete r._id;
      delete r.__v;
    }
    return res.json({ success: true, data: r });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/add-task", optionalAuth, async (req, res) => {
  try {
    const { userId, task } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, error: "userId required" });
    const result = await UserProfile.findOneAndUpdate(
      { id: userId },
      { $push: { work_tasks: task }, $set: { updated_at: new Date() } },
      { new: true, lean: true },
    );
    const r = result ? { ...result } : null;
    if (r) {
      delete r._id;
      delete r.__v;
    }
    return res.json({ success: true, data: r });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/add-folder", optionalAuth, async (req, res) => {
  try {
    const { userId, fileName, fileType } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, error: "userId required" });
    const folderEntry = {
      id: uuidv4(),
      name: fileName,
      type: fileType,
      created_at: new Date(),
    };
    const result = await UserProfile.findOneAndUpdate(
      { id: userId },
      { $push: { folders: folderEntry }, $set: { updated_at: new Date() } },
      { new: true, lean: true },
    );
    const r = result ? { ...result } : null;
    if (r) {
      delete r._id;
      delete r.__v;
    }
    return res.json({ success: true, data: r });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/send-notification", optionalAuth, async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, error: "userId required" });
    // Stub — real push notifications would use FCM / APNs
    console.log(`[Notification] To: ${userId}, Title: ${title}, Body: ${body}`);
    return res.json({ success: true, data: { sent: true } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/send-message", optionalAuth, async (req, res) => {
  try {
    const { message, userId } = req.body;
    console.log(`[Message] From: ${userId}, Message: ${message}`);
    return res.json({ success: true, data: { sent: true } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Admin helpers ────────────────────────────────────────────────────────────

app.get("/api/admin/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).lean();
    const cleaned = users.map((d) => {
      const r = { ...d };
      delete r._id;
      delete r.__v;
      return r;
    });
    return res.json({ success: true, data: cleaned, count: cleaned.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(
  "/api/admin/users/:userId",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      await User.deleteOne({ id: userId });
      await UserProfile.deleteOne({ id: userId });
      return res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  return res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── Cron — Bitrix sync ───────────────────────────────────────────────────────

if (cron.validate(SYNC_SCHEDULE)) {
  cron.schedule(SYNC_SCHEDULE, async () => {
    console.log("[Cron] Starting scheduled Bitrix sync...");
    const result = await syncBitrixDataWithRetry();
    console.log("[Cron] Sync result:", result);
  });
  console.log(`[Cron] Bitrix sync scheduled: ${SYNC_SCHEDULE}`);
}

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    data: null,
    error: { message: err.message || "Internal server error" },
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Server] MongoDB Express server running on port ${PORT}`);
  console.log(`[Server] MongoDB URI: ${MONGODB_URI}`);
});

module.exports = app;

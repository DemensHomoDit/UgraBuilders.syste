-- Схема базы данных для SQLite3 (миграция с Supabase)

PRAGMA foreign_keys = ON;

-- Таблица пользователей/профилей
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT,
    role TEXT,
    schedule TEXT,
    work_tasks TEXT,
    folders TEXT,
    project_stats TEXT,
    work_stages TEXT,
    current_stage TEXT,
    client_stage TEXT
);

-- Категории (для проектов, блога и т.д.)
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Проекты
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    cover_image TEXT,
    category_id TEXT,
    pricevalue REAL,
    areavalue REAL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    stories INTEGER,
    material TEXT,
    style TEXT,
    type TEXT,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT,
    is_published INTEGER,
    created_by TEXT,
    designer_first_name TEXT,
    designer_last_name TEXT,
    dimensions TEXT,
    hasgarage INTEGER,
    hasterrace INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Изображения проектов
CREATE TABLE project_images (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER,
    image_type TEXT,
    created_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Заявки на проекты
CREATE TABLE project_orders (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    user_email TEXT,
    user_phone TEXT,
    notes TEXT,
    status TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Блог: посты
CREATE TABLE blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    category_id TEXT,
    is_published INTEGER,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Блог: изображения
CREATE TABLE blog_images (
    id TEXT PRIMARY KEY,
    blog_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER,
    created_at TEXT,
    FOREIGN KEY (blog_id) REFERENCES blog_posts(id)
);

-- Комментарии к блогу
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    blog_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    parent_id TEXT,
    is_approved INTEGER,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (blog_id) REFERENCES blog_posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Отзывы
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    rating INTEGER,
    title TEXT,
    image_url TEXT,
    is_published INTEGER,
    approved_by TEXT,
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Изображения к отзывам
CREATE TABLE review_images (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER,
    created_at TEXT,
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);

-- Задачи
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    priority TEXT,
    assigned_to TEXT,
    due_date TEXT,
    completed_date TEXT,
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Слайды главной страницы
CREATE TABLE hero_carousel (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link_url TEXT,
    display_order INTEGER,
    created_at TEXT
);

-- Галерея объектов
CREATE TABLE gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    city TEXT,
    construction_year INTEGER,
    created_at TEXT,
    updated_at TEXT
);

-- Финансы
CREATE TABLE finances (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    transaction_date TEXT,
    created_by TEXT,
    created_at TEXT
);

-- Новости
CREATE TABLE news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    category_id TEXT,
    is_published INTEGER,
    tags TEXT,
    slug TEXT,
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Визиты сайта
CREATE TABLE site_visits (
    id TEXT PRIMARY KEY,
    ip_address TEXT NOT NULL,
    page_path TEXT NOT NULL,
    user_agent TEXT,
    user_id TEXT,
    visit_date TEXT
);

-- Системные настройки
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_enabled INTEGER,
    max_concurrent_requests INTEGER,
    preload_assets INTEGER,
    created_at TEXT,
    updated_at TEXT
); 
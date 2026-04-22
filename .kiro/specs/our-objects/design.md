# Design Document — «Наши объекты» (Our Objects)

## Overview

Раздел «Наши объекты» — публичная витрина завершённых строительных проектов компании. Он заменяет текущую страницу галереи (`/projects/gallery`) и предоставляет каждому объекту собственную детальную страницу с фотогалереей, отзывом клиента и полной информацией.

Функционально раздел делится на две части:

- **Публичная сторона** — страница списка объектов (`/objects`) и страница отдельного объекта (`/objects/:id`).
- **Административная сторона** — CMS-интерфейс в личном кабинете (`/account/objects`) для создания, редактирования и публикации объектов.

Реализация полностью вписывается в существующий стек: React/TypeScript + Vite на фронтенде, Express + PostgreSQL на бэкенде, generic CRUD API `/api/db/:collection`, загрузка файлов через `/api/storage/:bucket/upload`.

---

## Architecture

### Общая схема

```
Browser (HashRouter)
  ├── /objects                  → OurObjectsPage (public list)
  ├── /objects/:id              → OurObjectDetailPage (public detail)
  └── /account/objects/*        → AdminObjects (admin CMS)
        ├── /account/objects              → AdminObjectsList
        ├── /account/objects/new          → AdminObjectForm (create)
        └── /account/objects/edit/:id     → AdminObjectForm (edit)
              ├── Tab: Основное           → ObjectMainForm
              ├── Tab: Фотографии         → ObjectGalleryManager
              └── Tab: Отзыв клиента      → ObjectReviewForm

Frontend DB Client (src/integrations/mongodb/client.ts)
  └── QueryBuilder → /api/db/:collection (GET/POST/PATCH/DELETE)

Express server (server.cjs)
  ├── ALLOWED_TABLES += [our_objects, our_object_images, our_object_reviews]
  ├── /api/db/:collection       → generic CRUD
  └── /api/storage/:bucket/upload → multer file upload

PostgreSQL
  ├── our_objects
  ├── our_object_images
  └── our_object_reviews
```

### Маршрутизация

Используется существующий `HashRouter`. Новые маршруты добавляются в `src/App.tsx`:

| Маршрут | Компонент | Описание |
|---|---|---|
| `/objects` | `OurObjectsPage` | Публичный список объектов |
| `/objects/:id` | `OurObjectDetailPage` | Публичная страница объекта |
| `/projects/gallery` | `Navigate to="/objects"` | Редирект со старой галереи |

В `src/pages/Account.tsx` добавляются маршруты:

| Маршрут | Компонент | Роли |
|---|---|---|
| `/account/objects` | `AdminObjectsList` | admin, editor, manager |
| `/account/objects/new` | `AdminObjectForm` | admin, editor, manager |
| `/account/objects/edit/:id` | `AdminObjectForm` | admin, editor, manager |

### Навигация в AdminLayout

В массив `NAV_ITEMS` в `src/components/admin/AdminLayout.tsx` добавляется пункт:

```ts
{ to: "/account/objects", icon: Building2, label: "Наши объекты", roles: ["admin", "editor", "manager"] }
```

---

## Components and Interfaces

### Публичные компоненты

#### `OurObjectsPage` (`src/pages/OurObjectsPage.tsx`)

Страница списка объектов. Загружает опубликованные объекты из `our_objects`, отображает карточки, скелетон при загрузке, пустое состояние.

```ts
// Состояние
const [objects, setObjects] = useState<OurObject[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

Запрос:
```ts
db.from("our_objects")
  .select("id, title, subtitle, excerpt, city, cover_image, display_order, created_at")
  .eq("is_published", true)
  .order("display_order", { ascending: true })
```

Сортировка при равных `display_order` выполняется на клиенте по `created_at` DESC.

#### `OurObjectCard` (`src/components/objects/OurObjectCard.tsx`)

Карточка объекта в списке. Отображает `cover_image`, `title`, `excerpt`, `city`. При клике — навигация на `/objects/:id`.

#### `OurObjectDetailPage` (`src/pages/OurObjectDetailPage.tsx`)

Страница объекта. Загружает объект, его изображения и отзыв. Устанавливает `document.title` и мета-тег `description`.

```ts
// Загрузка данных
const object = await db.from("our_objects").select("*").eq("id", id).single();
const images = await db.from("our_object_images").select("*").eq("object_id", id).order("display_order");
const review = await db.from("our_object_reviews").select("*").eq("object_id", id).eq("is_published", true).maybeSingle();
```

Поддержка slug: если `id` не является UUID, выполняется запрос по полю `slug`.

#### `ObjectGallery` (`src/components/objects/ObjectGallery.tsx`)

Сетка фотографий объекта. При клике открывает `ImageViewer` (существующий компонент).

#### `ObjectReviewBlock` (`src/components/objects/ObjectReviewBlock.tsx`)

Блок отзыва клиента: аватар, имя, должность, звёзды рейтинга, заголовок, текст.

### Административные компоненты

#### `AdminObjectsList` (`src/components/admin/objects/AdminObjectsList.tsx`)

Таблица всех объектов (опубликованных и черновиков). Колонки: заголовок, город, статус, дата создания. Кнопки: «Создать», «Редактировать», «Удалить».

#### `AdminObjectForm` (`src/components/admin/objects/AdminObjectForm.tsx`)

Форма создания/редактирования объекта с тремя вкладками:
- **Основное** — все текстовые поля + Cover_Image + slug + display_order + is_published
- **Фотографии** — `ObjectGalleryManager`
- **Отзыв клиента** — `ObjectReviewForm`

#### `ObjectGalleryManager` (`src/components/admin/objects/ObjectGalleryManager.tsx`)

Управление фотогалереей объекта: загрузка через `ImageUploader`, drag-and-drop сортировка, редактирование caption, удаление, назначение обложки.

#### `ObjectReviewForm` (`src/components/admin/objects/ObjectReviewForm.tsx`)

Форма отзыва: поля `author_name`, `author_title`, `author_image`, `rating` (1–5), `title`, `content`, `is_published`. Если отзыв уже существует — форма редактирования, иначе — создания.

### Утилиты

#### `generateSlug` (`src/utils/slug.ts`)

Чистая функция транслитерации и нормализации строки в slug:

```ts
export function generateSlug(title: string): string {
  // транслитерация кириллицы → латиница
  // toLowerCase, замена пробелов и спецсимволов на '-'
  // удаление повторяющихся дефисов, trim('-')
}
```

---

## Data Models

### Таблица `our_objects`

```sql
CREATE TABLE IF NOT EXISTS our_objects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  subtitle          VARCHAR(255),
  excerpt           TEXT,
  description       TEXT,
  city              VARCHAR(100),
  construction_year INTEGER,
  area              NUMERIC,
  material          VARCHAR(255),
  stories           INTEGER,
  cover_image       TEXT,
  slug              VARCHAR(255) UNIQUE,
  display_order     INTEGER DEFAULT 0,
  is_published      BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_our_objects_published ON our_objects(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_our_objects_slug ON our_objects(slug);
```

### Таблица `our_object_images`

```sql
CREATE TABLE IF NOT EXISTS our_object_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id     UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  caption       TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_our_object_images_object ON our_object_images(object_id, display_order);
```

### Таблица `our_object_reviews`

```sql
CREATE TABLE IF NOT EXISTS our_object_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id    UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  author_name  VARCHAR(255) NOT NULL,
  author_title VARCHAR(255),
  author_image TEXT,
  rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
  title        VARCHAR(255),
  content      TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_our_object_reviews_object ON our_object_reviews(object_id);
```

### TypeScript-интерфейсы

```ts
// src/types/ourObjects.ts

export interface OurObject {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  description?: string;
  city?: string;
  construction_year?: number;
  area?: number;
  material?: string;
  stories?: number;
  cover_image?: string;
  slug?: string;
  display_order: number;
  is_published: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OurObjectImage {
  id: string;
  object_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface OurObjectReview {
  id: string;
  object_id: string;
  author_name: string;
  author_title?: string;
  author_image?: string;
  rating?: number;
  title?: string;
  content?: string;
  is_published: boolean;
  created_at: string;
}
```

### Изменения в `server.cjs`

В массив `ALLOWED_TABLES` добавляются три новые таблицы:

```js
"our_objects",
"our_object_images",
"our_object_reviews",
```

### Изменения в `db/schema.sql`

Добавляются DDL-определения трёх новых таблиц и их индексов (см. выше).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Фильтрация опубликованных объектов

*For any* массива объектов с произвольным сочетанием значений `is_published`, функция фильтрации должна возвращать только те объекты, у которых `is_published === true`.

**Validates: Requirements 1.2**

---

### Property 2: Сортировка объектов

*For any* массива объектов с произвольными значениями `display_order` и `created_at`, функция сортировки должна возвращать список, упорядоченный по `display_order` по возрастанию, а при равных значениях — по `created_at` по убыванию.

**Validates: Requirements 1.4**

---

### Property 3: Рендеринг карточки объекта содержит все обязательные поля

*For any* объекта с заполненными полями `title`, `excerpt`, `city` и `cover_image`, отрендеренная карточка `OurObjectCard` должна содержать все эти значения в своём выводе.

**Validates: Requirements 1.3**

---

### Property 4: Рендеринг страницы объекта содержит все обязательные поля

*For any* объекта с заполненными полями `title`, `subtitle`, `description`, `city`, `construction_year`, `area`, `material`, `stories`, отрендеренная страница `OurObjectDetailPage` должна содержать все эти значения.

**Validates: Requirements 2.2**

---

### Property 5: Сортировка галереи изображений

*For any* массива изображений с произвольными значениями `display_order`, компонент `ObjectGallery` должен отображать их в порядке возрастания `display_order`.

**Validates: Requirements 2.3**

---

### Property 6: Рендеринг строки списка в AdminObjectsList содержит все обязательные поля

*For any* объекта с заполненными полями `title`, `city`, `is_published`, `created_at`, строка в таблице `AdminObjectsList` должна содержать все эти значения.

**Validates: Requirements 3.2**

---

### Property 7: Сохранение объекта — round trip

*For any* валидного набора данных объекта (с непустым `title`), после вставки в `our_objects` и последующего SELECT по `id` должны вернуться эквивалентные данные.

**Validates: Requirements 3.5**

---

### Property 8: Каскадное удаление объекта

*For any* объекта с привязанными изображениями и отзывом, после удаления объекта из `our_objects` запросы к `our_object_images` и `our_object_reviews` по `object_id` должны возвращать пустые результаты.

**Validates: Requirements 3.8**

---

### Property 9: Сохранение изображения — round trip

*For any* загруженного изображения с корректным `object_id` и `image_url`, после создания записи в `our_object_images` и SELECT по `id` должны вернуться эквивалентные данные, включая правильный `object_id`.

**Validates: Requirements 4.2**

---

### Property 10: Сохранение порядка изображений

*For any* перестановки изображений объекта, после сохранения новых значений `display_order` и последующего SELECT, отсортированного по `display_order`, порядок должен соответствовать сохранённой перестановке.

**Validates: Requirements 4.3**

---

### Property 11: Сохранение отзыва — round trip

*For any* валидного набора данных отзыва (с непустым `author_name`), после вставки в `our_object_reviews` и последующего SELECT по `id` должны вернуться эквивалентные данные с правильным `object_id`.

**Validates: Requirements 5.3**

---

### Property 12: Независимость публикации отзыва от объекта

*For any* пары объект + отзыв, изменение поля `is_published` в `our_object_reviews` не должно изменять поле `is_published` в `our_objects`.

**Validates: Requirements 5.4**

---

### Property 13: Генерация slug из заголовка

*For any* непустой строки `title`, функция `generateSlug` должна возвращать непустую строку, содержащую только строчные латинские буквы, цифры и дефисы, и не начинающуюся и не заканчивающуюся дефисом.

**Validates: Requirements 7.2**

---

### Property 14: Формат title страницы объекта

*For any* объекта с непустым `title`, тег `<title>` страницы `OurObjectDetailPage` должен иметь значение `${title} — Наши объекты`.

**Validates: Requirements 7.3**

---

### Property 15: Мета-тег description из excerpt

*For any* объекта с непустым `excerpt`, мета-тег `<meta name="description">` страницы `OurObjectDetailPage` должен иметь значение, равное `excerpt`.

**Validates: Requirements 7.4**

---

### Property 16: Двойная маршрутизация по id и slug

*For any* объекта с заполненным `slug`, запрос к API по UUID (`/api/db/our_objects?filters=[{op:"eq",field:"id",...}]`) и запрос по slug (`filters=[{op:"eq",field:"slug",...}]`) должны возвращать один и тот же объект.

**Validates: Requirements 7.5**

---

## Error Handling

### Публичная сторона

| Ситуация | Поведение |
|---|---|
| Ошибка загрузки списка объектов | `toast.error` с описанием ошибки; список не отображается |
| Объект не найден (404) | Компонент `NotFoundState` с кнопкой «Вернуться к списку» |
| Объект не опубликован | Аналогично 404 — страница не доступна публично |
| Ошибка загрузки изображений | Изображения не отображаются; остальной контент страницы доступен |
| Ошибка загрузки отзыва | Блок отзыва не отображается; остальной контент доступен |

### Административная сторона

| Ситуация | Поведение |
|---|---|
| Пустое поле `title` при сохранении | Inline-ошибка под полем; форма не отправляется |
| Ошибка сохранения объекта | `toast.error` с описанием; данные формы сохраняются |
| Ошибка загрузки изображения | `toast.error`; остальные изображения не затронуты |
| Ошибка удаления объекта | `toast.error`; объект остаётся в списке |
| Конфликт slug (уже занят) | Inline-ошибка под полем slug |

### Валидация на клиенте

- `title` — обязательное поле, не может быть пустым или состоять только из пробелов
- `slug` — если заполнен, должен соответствовать паттерну `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- `rating` — целое число от 1 до 5
- `construction_year` — целое число, 4 цифры, разумный диапазон (1900–2100)
- `area` — положительное число
- `stories` — положительное целое число

---

## Testing Strategy

### Подход

Используется двойная стратегия тестирования:
- **Unit-тесты** — конкретные примеры, граничные случаи, обработка ошибок
- **Property-based тесты** — универсальные свойства, проверяемые на большом количестве сгенерированных входных данных

### Библиотеки

- **Property-based testing**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript, активно поддерживается)
- **Unit/component testing**: Vitest + React Testing Library (уже используется в проекте)

### Конфигурация property-тестов

Каждый property-тест запускается минимум **100 итераций**. Каждый тест помечается комментарием:

```ts
// Feature: our-objects, Property N: <property_text>
```

### Покрытие unit-тестами

**Чистые функции:**
- `generateSlug(title)` — корректная транслитерация, граничные случаи (пустая строка, только спецсимволы, уже латинский текст)
- Функция сортировки объектов — равные `display_order`, одинаковые `created_at`
- Функция фильтрации по `is_published`

**Компоненты (React Testing Library):**
- `OurObjectCard` — рендеринг всех полей, клик → навигация
- `OurObjectsPage` — скелетон при загрузке, пустое состояние, список карточек
- `OurObjectDetailPage` — 404 при отсутствии объекта, блок отзыва (есть/нет), CTA-кнопка
- `ObjectReviewBlock` — рендеринг звёзд рейтинга, опциональные поля
- `AdminObjectsList` — рендеринг таблицы, диалог подтверждения удаления
- `AdminObjectForm` — валидация пустого title, переключение вкладок
- `ObjectReviewForm` — режим создания vs. редактирования

**Интеграционные тесты (с реальной БД или тестовой схемой):**
- Каскадное удаление: удаление объекта удаляет связанные изображения и отзыв
- Уникальность slug: попытка создать два объекта с одинаковым slug возвращает ошибку
- Двойная маршрутизация: объект доступен по UUID и по slug

### Property-тесты (fast-check)

Каждое свойство из раздела «Correctness Properties» реализуется одним property-тестом:

```ts
// Feature: our-objects, Property 1: Фильтрация опубликованных объектов
it("filters only published objects", () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ id: fc.uuid(), is_published: fc.boolean(), title: fc.string() })),
      (objects) => {
        const result = filterPublished(objects);
        return result.every((o) => o.is_published === true);
      }
    ),
    { numRuns: 100 }
  );
});
```

```ts
// Feature: our-objects, Property 13: Генерация slug из заголовка
it("generateSlug produces valid slug for any non-empty title", () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }),
      (title) => {
        const slug = generateSlug(title);
        return (
          slug.length > 0 &&
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
        );
      }
    ),
    { numRuns: 100 }
  );
});
```

### Что не покрывается автотестами

- Визуальное соответствие дизайн-системе (Plus Jakarta Sans, rounded-3xl, цвета) — ручная проверка
- Drag-and-drop UX — ручная проверка
- Полноэкранный просмотрщик изображений — ручная проверка
- SEO-индексация — ручная проверка через Google Search Console

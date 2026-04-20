# Requirements Document

## Introduction

Полный переход веб-приложения (React/TypeScript + Express) на PostgreSQL в качестве единственной базы данных. Приложение ранее использовало MongoDB (server-mongo.cjs), и уже частично перенесено на PostgreSQL (server.cjs + pg). Цель — выявить все нерабочие части, устранить несоответствия между схемой БД и кодом сервера, обеспечить стабильную работу всего стека: Express API, фронтенд-клиент, Telegram-интеграция, файловое хранилище и скрипты миграции.

## Glossary

- **Server**: Express-сервер (`server.cjs`), основная точка входа приложения
- **DB**: PostgreSQL база данных, подключаемая через пул `pg.Pool`
- **Schema**: Файл `db/schema.sql` — эталонная схема всех таблиц
- **DB_Client**: Фронтенд-клиент (`src/integrations/mongodb/client.ts`), реализующий Supabase-подобный API поверх Express
- **ALLOWED_TABLES**: Список таблиц в `server.cjs`, разрешённых для обращения через `/api/db/:collection`
- **Migration**: SQL-файлы в папке `db/` и скрипты в `scripts/` для обновления схемы БД
- **Telegram_Module**: Файлы `api/telegram.cjs` и `api/notifications.cjs`, реализующие интеграцию с Telegram
- **Storage**: Файловое хранилище на диске (`uploads/`), доступное через `/api/storage/:bucket`
- **QueryBuilder**: Класс в `DB_Client`, строящий запросы к `/api/db/:collection`
- **Auth_Middleware**: Middleware в `server.cjs` для проверки JWT-токенов
- **Admin_Dashboard**: Эндпоинт `/api/admin/dashboard/summary`, используемый фронтендом

## Requirements

### Requirement 1: Единственный активный сервер на PostgreSQL

**User Story:** As a разработчик, I want все запросы приложения обрабатывались только через `server.cjs` с PostgreSQL, so that MongoDB-зависимости не влияли на работу системы.

#### Acceptance Criteria

1. THE Server SHALL использовать только `pg.Pool` для всех операций с базой данных и не содержать импортов `mongoose` или `mongodb`.
2. WHEN приложение запускается командой `npm start`, THE Server SHALL успешно подключиться к PostgreSQL и вывести подтверждение соединения в лог.
3. IF переменные окружения `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` или `DB_PASSWORD` отсутствуют, THEN THE Server SHALL завершить процесс с кодом выхода 1 и сообщением об ошибке.
4. THE Server SHALL содержать все таблицы из Schema в списке ALLOWED_TABLES, чтобы фронтенд мог обращаться к любой таблице через `/api/db/:collection`.

---

### Requirement 2: Полнота и корректность схемы базы данных

**User Story:** As a разработчик, I want схема PostgreSQL содержала все необходимые таблицы и колонки, so that сервер и фронтенд не получали ошибки об отсутствующих объектах БД.

#### Acceptance Criteria

1. THE Schema SHALL содержать таблицы: `users`, `user_profiles`, `projects`, `project_images`, `categories`, `blog_posts`, `comments`, `reviews`, `news`, `form_submissions`, `site_visits`, `tasks`, `client_photos`, `client_files`, `telegram_link_tokens`, `user_telegram_accounts`, `client_feed`, `guest_access_links`, `client_documents`, `project_form_links`, `gallery_items`, `hero_carousel`, `system_settings`, `bitrix_leads`, `project_orders`.
2. WHEN Migration-скрипты выполняются на чистой базе, THE DB SHALL содержать все таблицы из Schema без ошибок.
3. THE Schema SHALL содержать колонку `client_stage` в таблице `users`, так как `server.cjs` обращается к ней при логине.
4. THE Schema SHALL содержать таблицы `gallery_items`, `hero_carousel`, `system_settings`, `bitrix_leads`, `project_orders`, `blog_images`, `review_images`, которые присутствуют в ALLOWED_TABLES сервера, но отсутствуют в `db/schema.sql`.
5. WHEN выполняется `db/schema.sql` повторно, THE DB SHALL не возвращать ошибок благодаря использованию `CREATE TABLE IF NOT EXISTS` и `CREATE INDEX IF NOT EXISTS`.

---

### Requirement 3: Корректная работа Generic CRUD API

**User Story:** As a фронтенд-разработчик, I want `/api/db/:collection` корректно обрабатывал все CRUD-операции, so that QueryBuilder мог читать, создавать, обновлять и удалять записи без ошибок.

#### Acceptance Criteria

1. WHEN GET-запрос к `/api/db/:collection` содержит параметр `filters`, THE Server SHALL применить все фильтры через параметризованные SQL-запросы без SQL-инъекций.
2. WHEN POST-запрос к `/api/db/:collection` содержит `operation: "upsert"`, THE Server SHALL выполнить `INSERT ... ON CONFLICT (id) DO UPDATE` и вернуть обновлённую запись.
3. WHEN PATCH-запрос к `/api/db/:collection` содержит поля типа `object` (JSONB), THE Server SHALL сериализовать их в JSON-строку перед записью в PostgreSQL.
4. WHEN DELETE-запрос к `/api/db/:collection` не содержит `filters`, THE Server SHALL вернуть статус 400 с сообщением об ошибке.
5. THE Server SHALL удалять поле `password_hash` из всех ответов, содержащих данные таблицы `users`.
6. WHEN GET-запрос содержит параметр `head=true`, THE Server SHALL вернуть только `count` без данных строк.

---

### Requirement 4: Корректная аутентификация и авторизация

**User Story:** As a пользователь, I want регистрация, вход и проверка сессии работали стабильно, so that я мог получить доступ к своему личному кабинету.

#### Acceptance Criteria

1. WHEN POST `/api/auth/signup` получает валидные `email` и `password`, THE Server SHALL создать запись в `users` и `user_profiles`, вернуть JWT-токен и данные пользователя.
2. WHEN POST `/api/auth/login` получает корректные учётные данные, THE Server SHALL вернуть JWT-токен, данные пользователя включая поле `clientStage` из колонки `client_stage` таблицы `users`.
3. IF POST `/api/auth/login` получает неверный пароль или несуществующий email, THEN THE Server SHALL вернуть статус 401 с сообщением "Неверный email или пароль".
4. WHEN GET `/api/auth/session` получает валидный Bearer-токен, THE Server SHALL вернуть актуальные данные сессии из PostgreSQL.
5. THE Auth_Middleware SHALL проверять JWT-токен и роль пользователя перед выполнением защищённых операций.

---

### Requirement 5: Корректная работа Telegram-интеграции

**User Story:** As a клиент, I want получать уведомления в Telegram о статусе проекта, so that я был в курсе хода строительства.

#### Acceptance Criteria

1. THE Telegram_Module SHALL использовать собственный `pg.Pool` с теми же переменными окружения, что и Server, для работы с таблицами `telegram_link_tokens` и `user_telegram_accounts`.
2. WHEN POST `/api/telegram/generate-token` получает `userId`, THE Telegram_Module SHALL создать запись в `telegram_link_tokens` и вернуть ссылку для привязки.
3. WHEN POST `/api/telegram/bot-link` получает валидный токен и `telegram_user_id`, THE Telegram_Module SHALL привязать Telegram-аккаунт к пользователю через `INSERT ... ON CONFLICT DO UPDATE`.
4. IF токен в `telegram_link_tokens` старше 10 минут или уже использован, THEN THE Telegram_Module SHALL вернуть статус 400 с сообщением об ошибке.
5. WHEN `sendTelegramNotification` вызывается с `userId`, THE Telegram_Module SHALL получить все активные Telegram-аккаунты пользователя из `user_telegram_accounts` и отправить сообщение каждому.

---

### Requirement 6: Корректная работа файлового хранилища

**User Story:** As a менеджер, I want загружать фотографии и документы клиентов, so that они были доступны в личном кабинете.

#### Acceptance Criteria

1. WHEN POST `/api/storage/:bucket/upload` получает файл, THE Storage SHALL сохранить файл в директории `uploads/:bucket/` и вернуть путь к файлу.
2. WHEN POST `/api/client-photos/:clientId/upload` получает файл, THE Server SHALL сохранить запись в таблице `client_photos` и вернуть полный URL файла.
3. WHEN POST `/api/client-files/:clientId/upload` получает файл с параметром `folder_type`, THE Server SHALL сохранить запись в таблице `client_files` с корректным `folder_type`.
4. IF файл для удаления не существует на диске, THEN THE Server SHALL завершить операцию успешно без ошибки.
5. THE Server SHALL создавать директории `uploads/client-photos`, `uploads/client-files`, `uploads/project-images-new`, `uploads/hero-carousel` при старте, если они не существуют.

---

### Requirement 7: Корректная работа Admin Dashboard

**User Story:** As a администратор, I want видеть сводную статистику в дашборде, so that я мог контролировать состояние системы.

#### Acceptance Criteria

1. WHEN GET `/api/admin/dashboard/summary` получает запрос с валидным токеном администратора, THE Server SHALL вернуть агрегированные данные: количество посещений, проектов, задач, форм и пользователей.
2. THE Server SHALL реализовать эндпоинт `/api/admin/dashboard/summary`, так как фронтенд (`useDashboardData.ts`) обращается к нему, но он может отсутствовать в `server.cjs`.
3. WHEN GET `/api/admin/dashboard/summary` вызывается, THE Server SHALL выполнить все SQL-запросы к PostgreSQL параллельно для минимизации времени ответа.

---

### Requirement 8: Корректность скриптов миграции

**User Story:** As a DevOps-инженер, I want скрипты миграции корректно обновляли схему БД, so that развёртывание новых версий не требовало ручного вмешательства.

#### Acceptance Criteria

1. THE Migration-скрипты в `scripts/` SHALL использовать переменные окружения `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (а не только `DATABASE_URL`), так как `.env.example` не содержит `DATABASE_URL`.
2. WHEN Migration-скрипт выполняется повторно на уже обновлённой базе, THE DB SHALL не возвращать ошибок (идемпотентность).
3. THE Schema-файл `db/schema.sql` SHALL быть единственным эталонным источником схемы, содержащим все таблицы, необходимые для работы Server.

---

### Requirement 9: Корректность фронтенд-клиента (DB_Client)

**User Story:** As a фронтенд-разработчик, I want DB_Client корректно транслировал все операции в HTTP-запросы к Server, so that компоненты React работали без изменений.

#### Acceptance Criteria

1. THE DB_Client SHALL корректно обрабатывать метод `maybeSingle()`, возвращая `null` если записей нет, без ошибки.
2. WHEN DB_Client выполняет `upsert`, THE DB_Client SHALL передавать `operation: "upsert"` в теле POST-запроса к Server.
3. THE DB_Client SHALL сохранять JWT-токен в `localStorage` после успешного входа и передавать его в заголовке `Authorization` всех последующих запросов.
4. WHEN DB_Client получает ответ с `error`, THE DB_Client SHALL вернуть объект `{ data: null, error }` без выброса исключения.
5. THE DB_Client SHALL поддерживать метод `select("*", { count: "exact", head: true })` для получения количества записей без загрузки данных.

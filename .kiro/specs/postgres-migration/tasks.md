# Implementation Plan: postgres-migration

## Overview

Fix all remaining gaps in the PostgreSQL migration: patch the broken `buildWhereClause` SQL placeholder bug, add missing tables and columns to `db/schema.sql`, fix the trigger dollar-quoting issue, remove the stale `mongoose` dependency, and verify every subsystem (Express API, frontend DB client, Telegram module, file storage) works correctly against PostgreSQL.

## Tasks

- [x] 1. Fix `db/schema.sql` — add missing columns and tables
  - [x] 1.1 Add `client_stage` column to `users` table
    - Add `client_stage VARCHAR(100)` to the `CREATE TABLE users` definition in `db/schema.sql`
    - Use `ALTER TABLE users ADD COLUMN IF NOT EXISTS client_stage VARCHAR(100);` as a fallback migration statement at the bottom of the file for existing databases
    - _Requirements: 2.3_

  - [x] 1.2 Add missing columns to `form_submissions` table
    - Add `topic VARCHAR(255)`, `custom_topic VARCHAR(255)`, `source VARCHAR(100)`, `is_pinned BOOLEAN DEFAULT false`, `pinned_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ DEFAULT NOW()` to the `CREATE TABLE form_submissions` definition
    - Add corresponding `ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS ...` statements for each column for existing databases
    - _Requirements: 2.1, 2.2_

  - [x] 1.3 Add seven missing tables to `db/schema.sql`
    - Add `CREATE TABLE IF NOT EXISTS gallery_items`, `hero_carousel`, `system_settings`, `bitrix_leads`, `project_orders`, `blog_images`, `review_images` using the exact DDL from the design document
    - Each table must use `CREATE TABLE IF NOT EXISTS` for idempotency
    - _Requirements: 2.4, 1.4_

  - [x] 1.4 Fix trigger dollar-quoting in `db/schema.sql`
    - Replace the broken single-character delimiter in `CREATE OR REPLACE FUNCTION update_updated_at_column()` with proper `$$` dollar-quoting so the PL/pgSQL function body is valid PostgreSQL
    - Verify the `DROP TRIGGER IF EXISTS` / `CREATE TRIGGER` blocks for `client_feed` and `client_documents` are also correct
    - _Requirements: 2.5, 8.2_

  - [ ]* 1.5 Write smoke tests for schema completeness
    - Write a Node.js test script (`scripts/test-schema.cjs`) that connects to the DB, runs `db/schema.sql`, then queries `information_schema.tables` to assert all 25+ required tables exist
    - Assert `client_stage` column exists in `users`
    - Run the script twice to verify idempotency (no errors on second run)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Fix `buildWhereClause` SQL placeholder bug in `server.cjs`
  - [x] 2.1 Prepend `$` to every placeholder in `buildWhereClause`
    - In `server.cjs`, locate `buildWhereClause` and change every `conditions.push(\`${safeField} = ${idx++}\`)` (and similar for `!=`, `>`, `>=`, `<`, `<=`, `LIKE`, `ILIKE`, `ANY`) to use `$${idx++}` so the generated SQL reads `field = $1` instead of `field = 1`
    - Also fix the upsert placeholder generation in `POST /api/db/:collection`: change `\`${i + 1}\`` to `\`$${i + 1}\`` in `placeholders` and `\`${i + 2}\`` to `\`$${i + 2}\`` in `updateSet`
    - Fix the `setClause` in `PATCH /api/db/:collection`: change `\`${k} = ${i + 1}\`` to `\`${k} = $${i + 1}\``
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 2.2 Write property test for `buildWhereClause` — Property 3: SQL filter parameterization
    - **Property 3: SQL filter parameterization**
    - **Validates: Requirements 3.1**
    - Install `fast-check` as a dev dependency: `npm install --save-dev fast-check`
    - Create `scripts/test-buildWhereClause.cjs` that extracts `buildWhereClause` and uses `fast-check` to assert: for any array of filter objects, every condition in the generated `where` string uses a `$N` placeholder, and the corresponding value appears in `params` at the correct index
    - Tag: `// Feature: postgres-migration, Property 3: filter parameterization`
    - Run minimum 100 iterations

  - [ ]* 2.3 Write unit tests for `buildWhereClause` edge cases
    - Test empty filters → empty `where` string, empty `params`
    - Test `is: null` filter → generates `IS NULL` with no placeholder added to `params`
    - Test `in` operator → generates `= ANY($N)` with array value in `params`
    - _Requirements: 3.1_

- [x] 3. Fix LIMIT/OFFSET parameterization in admin list endpoints
  - [x] 3.1 Fix `/api/admin/users/list` and `/api/admin/forms/list` LIMIT/OFFSET
    - In `server.cjs`, locate the paginated admin list queries that append `LIMIT ${idx} OFFSET ${idx + 1}` with wrong index arithmetic
    - Refactor to append LIMIT and OFFSET as literal integers in the SQL string (since they are already validated as integers from `req.query`) rather than as parameterized placeholders, or fix the index arithmetic so `$N` placeholders are consistent with the `params` array
    - _Requirements: 3.1_

- [x] 4. Checkpoint — verify CRUD API correctness
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Fix auth endpoints — ensure `clientStage` is returned on login
  - [x] 5.1 Verify `POST /api/auth/login` returns `clientStage`
    - Confirm `server.cjs` queries `client_stage` from `users` and maps it to `clientStage` in the response (already implemented — verify it works after schema fix in task 1.1)
    - Confirm `POST /api/auth/signup` creates both `users` and `user_profiles` rows in a single transaction or sequential inserts
    - _Requirements: 4.1, 4.2_

  - [ ]* 5.2 Write property test for login — Property 8: Login returns clientStage
    - **Property 8: Login returns clientStage**
    - **Validates: Requirements 4.2**
    - Create `scripts/test-auth.cjs` using `fast-check` with a test PostgreSQL instance: for any registered user, POST `/api/auth/login` with correct credentials returns a response containing a `clientStage` field (value may be `null`)
    - Tag: `// Feature: postgres-migration, Property 8: login returns clientStage`

  - [ ]* 5.3 Write property test for invalid credentials — Property 9: Invalid credentials return 401
    - **Property 9: Invalid credentials return 401**
    - **Validates: Requirements 4.3**
    - For any email/password pair where the email does not exist or the password is wrong, POST `/api/auth/login` returns HTTP 401
    - Tag: `// Feature: postgres-migration, Property 9: invalid credentials return 401`

  - [ ]* 5.4 Write property test for password_hash — Property 6: password_hash never exposed
    - **Property 6: password_hash never exposed**
    - **Validates: Requirements 3.5**
    - For any GET `/api/db/users` response, assert no row in `data` contains a `password_hash` field
    - Tag: `// Feature: postgres-migration, Property 6: password_hash never exposed`

- [x] 6. Fix `POST /api/auth/signup` — wrap user + profile creation
  - [x] 6.1 Wrap `users` and `user_profiles` inserts in a transaction
    - In `server.cjs`, modify `POST /api/auth/signup` to use `pool.connect()` and execute both `INSERT INTO users` and `INSERT INTO user_profiles` inside a `BEGIN` / `COMMIT` block with `ROLLBACK` on error, ensuring atomicity
    - _Requirements: 4.1_

  - [ ]* 6.2 Write property test for signup atomicity — Property 7: Signup creates user and profile
    - **Property 7: Signup creates user and profile**
    - **Validates: Requirements 4.1**
    - For any valid email/password pair not already registered, POST `/api/auth/signup` creates exactly one row in `users` and one row in `user_profiles` with the same `id`, and returns a JWT token
    - Tag: `// Feature: postgres-migration, Property 7: signup creates user and profile`

- [x] 7. Verify and fix DB_Client (`src/integrations/mongodb/client.ts`)
  - [x] 7.1 Fix `maybeSingle()` to not rely on `this.then()`
    - In `src/integrations/mongodb/client.ts`, rewrite `maybeSingle()` to call `this._execute()` directly instead of `this.then(...)`, returning `{ data: arr[0] ?? null, error: null }` when no error, and `{ data: null, error }` when there is an error
    - _Requirements: 9.1_

  - [x] 7.2 Verify `select("*", { count: "exact", head: true })` sends `head=true`
    - Confirm the `select()` method sets `this._isHead = true` when `opts.head` is truthy, and that `_execute()` appends `head=true` to the query params
    - Add the `count` param to the URL when `this._countMode` is set
    - _Requirements: 9.5_

  - [ ]* 7.3 Write property test for DB_Client error passthrough — Property 13
    - **Property 13: DB_Client error passthrough**
    - **Validates: Requirements 9.4**
    - Create `src/integrations/mongodb/client.test.ts` using `fast-check` with a mocked `fetch`: for any error object `{ message: string }` returned by the server, the `QueryBuilder` returns `{ data: null, error }` without throwing
    - Tag: `// Feature: postgres-migration, Property 13: DB_Client error passthrough`

  - [ ]* 7.4 Write property test for token propagation — Property 14
    - **Property 14: DB_Client token propagation**
    - **Validates: Requirements 9.3**
    - After a successful `auth.signInWithPassword`, all subsequent `QueryBuilder` requests include `Authorization: Bearer <token>` matching the token from login
    - Tag: `// Feature: postgres-migration, Property 14: DB_Client token propagation`

- [x] 8. Checkpoint — verify auth and DB_Client
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Remove stale `mongoose` dependency
  - [x] 9.1 Remove `mongoose` from `package.json`
    - Delete the `"mongoose"` entry from the `dependencies` section of `package.json`
    - Run `npm install` to update `package-lock.json`
    - Verify `server.cjs` contains no `require('mongoose')` or `require('mongodb')` calls
    - _Requirements: 1.1_

- [x] 10. Verify Telegram module uses correct env vars
  - [x] 10.1 Confirm `api/telegram.cjs` uses `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
    - Inspect `api/telegram.cjs` — the `pg.Pool` constructor already uses these env vars (confirmed in design); add a startup check that logs a warning if any are missing
    - _Requirements: 5.1, 8.1_

  - [ ]* 10.2 Write smoke test for Telegram token generation — Property 11
    - **Property 11: Telegram token generation creates DB record**
    - **Validates: Requirements 5.2**
    - For any valid `userId`, POST `/api/telegram/generate-token` inserts exactly one row into `telegram_link_tokens` and returns a URL containing that token
    - Tag: `// Feature: postgres-migration, Property 11: telegram token generation creates DB record`

- [x] 11. Verify file storage and upload directories
  - [x] 11.1 Confirm upload directories are created at server startup
    - Verify `server.cjs` creates `uploads/client-photos`, `uploads/client-files`, `uploads/project-images-new`, `uploads/hero-carousel` at startup (already implemented — confirm the `forEach` block runs before any route handler)
    - _Requirements: 6.5_

  - [ ]* 11.2 Write smoke test for file upload round-trip — Property 12
    - **Property 12: File upload round-trip**
    - **Validates: Requirements 6.1**
    - For any file uploaded via POST `/api/storage/:bucket/upload`, the returned `path` corresponds to a file that exists on disk under `uploads/:bucket/`
    - Tag: `// Feature: postgres-migration, Property 12: file upload round-trip`

- [x] 12. Verify Admin Dashboard endpoint
  - [x] 12.1 Confirm `/api/admin/dashboard/summary` exists and runs queries in parallel
    - Locate the `/api/admin/dashboard/summary` handler in `server.cjs` and confirm it uses `Promise.all` to run all aggregate SQL queries concurrently
    - If the endpoint is missing, implement it: run `COUNT(*)` queries on `site_visits`, `projects`, `tasks`, `form_submissions`, and `users` in parallel and return the aggregated result
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Update `.env.example` and verify environment variable documentation
  - [x] 13.1 Ensure `.env.example` documents all required variables
    - Open `.env.example` and confirm it contains `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN`, and `TELEGRAM_BOT_TOKEN` with placeholder values
    - Remove any reference to `DATABASE_URL` if present, since the server uses individual DB env vars
    - _Requirements: 8.1_

- [x] 14. Final checkpoint — full stack verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The most critical fixes are tasks 1 (schema) and 2 (`buildWhereClause`) — without these, all CRUD operations and the schema itself are broken
- Tasks build incrementally: schema fixes first, then server logic fixes, then client fixes, then cleanup
- Property tests use `fast-check` and run a minimum of 100 iterations each
- All SQL in `db/schema.sql` must use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` for idempotency

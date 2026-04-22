# Implementation Plan: Наши объекты (Our Objects)

## Overview

Реализация раздела «Наши объекты» — публичной витрины завершённых строительных проектов с CMS-интерфейсом в личном кабинете. Работа ведётся в существующем стеке: React/TypeScript + Vite (фронтенд), Express + PostgreSQL (бэкенд), generic CRUD API `/api/db/:collection`.

## Tasks

- [x] 1. Подготовка базы данных и серверной части
  - [x] 1.1 Добавить DDL трёх новых таблиц в `db/schema.sql`
    - Добавить определения таблиц `our_objects`, `our_object_images`, `our_object_reviews` с индексами (см. раздел Data Models в design.md)
    - _Requirements: 3.5, 3.8, 4.2, 5.3_

  - [x] 1.2 Зарегистрировать новые таблицы в `server.cjs`
    - Добавить `"our_objects"`, `"our_object_images"`, `"our_object_reviews"` в массив `ALLOWED_TABLES`
    - _Requirements: 3.5, 4.2, 5.3_

  - [ ]* 1.3 Написать property-тест: сохранение объекта — round trip (Property 7)
    - **Property 7: Сохранение объекта — round trip**
    - **Validates: Requirements 3.5**

  - [ ]* 1.4 Написать property-тест: каскадное удаление объекта (Property 8)
    - **Property 8: Каскадное удаление объекта**
    - **Validates: Requirements 3.8**

  - [ ]* 1.5 Написать property-тест: сохранение изображения — round trip (Property 9)
    - **Property 9: Сохранение изображения — round trip**
    - **Validates: Requirements 4.2**

  - [ ]* 1.6 Написать property-тест: сохранение порядка изображений (Property 10)
    - **Property 10: Сохранение порядка изображений**
    - **Validates: Requirements 4.3**

  - [ ]* 1.7 Написать property-тест: сохранение отзыва — round trip (Property 11)
    - **Property 11: Сохранение отзыва — round trip**
    - **Validates: Requirements 5.3**

  - [ ]* 1.8 Написать property-тест: независимость публикации отзыва от объекта (Property 12)
    - **Property 12: Независимость публикации отзыва от объекта**
    - **Validates: Requirements 5.4**

- [x] 2. TypeScript-типы и утилиты
  - [x] 2.1 Создать файл `src/types/ourObjects.ts` с интерфейсами
    - Определить интерфейсы `OurObject`, `OurObjectImage`, `OurObjectReview` согласно design.md
    - _Requirements: 3.4, 4.2, 5.2_

  - [x] 2.2 Создать утилиту `src/utils/slug.ts` с функцией `generateSlug`
    - Реализовать транслитерацию кириллицы → латиница, нормализацию в slug (строчные буквы, цифры, дефисы)
    - _Requirements: 7.1, 7.2_

  - [ ]* 2.3 Написать unit-тесты для `generateSlug`
    - Тест корректной транслитерации, граничные случаи: пустая строка, только спецсимволы, уже латинский текст
    - _Requirements: 7.2_

  - [ ]* 2.4 Написать property-тест: генерация slug из заголовка (Property 13)
    - **Property 13: Генерация slug из заголовка**
    - **Validates: Requirements 7.2**

- [x] 3. Чистые функции фильтрации и сортировки
  - [x] 3.1 Реализовать функции `filterPublished` и `sortObjects` в `src/utils/ourObjects.ts`
    - `filterPublished(objects)` — возвращает только объекты с `is_published === true`
    - `sortObjects(objects)` — сортировка по `display_order` ASC, при равных — по `created_at` DESC
    - _Requirements: 1.2, 1.4_

  - [ ]* 3.2 Написать property-тест: фильтрация опубликованных объектов (Property 1)
    - **Property 1: Фильтрация опубликованных объектов**
    - **Validates: Requirements 1.2**

  - [ ]* 3.3 Написать property-тест: сортировка объектов (Property 2)
    - **Property 2: Сортировка объектов**
    - **Validates: Requirements 1.4**

- [x] 4. Checkpoint — Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, задать вопросы пользователю при необходимости.

- [x] 5. Публичные компоненты — карточка и список объектов
  - [x] 5.1 Создать компонент `src/components/objects/OurObjectCard.tsx`
    - Отображать `cover_image`, `title`, `excerpt`, `city`; при клике — навигация на `/objects/:id`
    - _Requirements: 1.3, 1.5_

  - [ ]* 5.2 Написать property-тест: рендеринг карточки содержит все обязательные поля (Property 3)
    - **Property 3: Рендеринг карточки объекта содержит все обязательные поля**
    - **Validates: Requirements 1.3**

  - [x] 5.3 Создать страницу `src/pages/OurObjectsPage.tsx`
    - Загружать опубликованные объекты через `db.from("our_objects")`, применять `filterPublished` и `sortObjects`
    - Отображать скелетон при загрузке, пустое состояние «Объекты скоро появятся», список карточек `OurObjectCard`
    - _Requirements: 1.1, 1.2, 1.4, 1.6, 1.7_

  - [ ]* 5.4 Написать unit-тесты для `OurObjectsPage`
    - Тест скелетона при загрузке, пустого состояния, списка карточек
    - _Requirements: 1.6, 1.7_

- [x] 6. Публичные компоненты — страница объекта
  - [x] 6.1 Создать компонент `src/components/objects/ObjectGallery.tsx`
    - Сетка фотографий, отсортированных по `display_order`; при клике — открытие `ImageViewer`
    - _Requirements: 2.3, 2.4_

  - [ ]* 6.2 Написать property-тест: сортировка галереи изображений (Property 5)
    - **Property 5: Сортировка галереи изображений**
    - **Validates: Requirements 2.3**

  - [x] 6.3 Создать компонент `src/components/objects/ObjectReviewBlock.tsx`
    - Отображать аватар, имя, должность, звёзды рейтинга, заголовок, текст отзыва
    - _Requirements: 2.5_

  - [ ]* 6.4 Написать unit-тесты для `ObjectReviewBlock`
    - Тест рендеринга звёзд рейтинга, опциональных полей (фото автора, заголовок)
    - _Requirements: 2.5_

  - [x] 6.5 Создать страницу `src/pages/OurObjectDetailPage.tsx`
    - Загружать объект, изображения и отзыв; устанавливать `document.title` и мета-тег `description`
    - Поддержка slug: если `id` не UUID — запрос по полю `slug`
    - Отображать 404 (`NotFoundState`) если объект не найден или не опубликован
    - Кнопка «Обсудить похожий проект» → `/contacts`
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 7.3, 7.4, 7.5_

  - [ ]* 6.6 Написать property-тест: рендеринг страницы объекта содержит все обязательные поля (Property 4)
    - **Property 4: Рендеринг страницы объекта содержит все обязательные поля**
    - **Validates: Requirements 2.2**

  - [ ]* 6.7 Написать property-тест: формат title страницы объекта (Property 14)
    - **Property 14: Формат title страницы объекта**
    - **Validates: Requirements 7.3**

  - [ ]* 6.8 Написать property-тест: мета-тег description из excerpt (Property 15)
    - **Property 15: Мета-тег description из excerpt**
    - **Validates: Requirements 7.4**

  - [ ]* 6.9 Написать property-тест: двойная маршрутизация по id и slug (Property 16)
    - **Property 16: Двойная маршрутизация по id и slug**
    - **Validates: Requirements 7.5**

- [x] 7. Checkpoint — Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, задать вопросы пользователю при необходимости.

- [x] 8. Маршрутизация и навигация
  - [x] 8.1 Добавить публичные маршруты в `src/App.tsx`
    - Добавить маршруты `/objects` → `OurObjectsPage`, `/objects/:id` → `OurObjectDetailPage`
    - Добавить `<Navigate>` с `/projects/gallery` на `/objects` (редирект)
    - _Requirements: 1.1, 2.1, 6.1_

  - [x] 8.2 Добавить пункт «Наши объекты» в `src/components/admin/AdminLayout.tsx`
    - Добавить `{ to: "/account/objects", icon: Building2, label: "Наши объекты", roles: ["admin", "editor", "manager"] }` в `NAV_ITEMS`
    - _Requirements: 3.1_

- [x] 9. Административные компоненты — список и форма объектов
  - [x] 9.1 Создать компонент `src/components/admin/objects/AdminObjectsList.tsx`
    - Таблица всех объектов (опубликованных и черновиков): заголовок, город, статус, дата создания
    - Кнопки «Создать», «Редактировать», «Удалить» с диалогом подтверждения удаления
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_

  - [ ]* 9.2 Написать property-тест: рендеринг строки списка содержит все обязательные поля (Property 6)
    - **Property 6: Рендеринг строки списка в AdminObjectsList содержит все обязательные поля**
    - **Validates: Requirements 3.2**

  - [ ]* 9.3 Написать unit-тесты для `AdminObjectsList`
    - Тест рендеринга таблицы, диалога подтверждения удаления
    - _Requirements: 3.2, 3.7_

  - [x] 9.4 Создать компонент `src/components/admin/objects/ObjectMainForm.tsx`
    - Поля: `title` (обязательное), `subtitle`, `excerpt`, `description`, `city`, `construction_year`, `area`, `material`, `stories`, `cover_image`, `slug`, `display_order`, `is_published`
    - Валидация: `title` не пустой, `slug` по паттерну `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, `rating` 1–5, `construction_year` 1900–2100, `area` > 0, `stories` > 0
    - Автогенерация `slug` из `title` при создании нового объекта (вызов `generateSlug`)
    - _Requirements: 3.4, 3.6, 7.1, 7.2_

  - [ ]* 9.5 Написать unit-тесты для `ObjectMainForm`
    - Тест валидации пустого `title`, автогенерации slug, inline-ошибок
    - _Requirements: 3.6, 7.2_

- [x] 10. Административные компоненты — галерея и отзыв
  - [x] 10.1 Создать компонент `src/components/admin/objects/ObjectGalleryManager.tsx`
    - Загрузка изображений через `ImageUploader` → `/api/storage/:bucket/upload`
    - Drag-and-drop сортировка, редактирование `caption`, удаление, назначение `cover_image`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 10.2 Создать компонент `src/components/admin/objects/ObjectReviewForm.tsx`
    - Поля: `author_name`, `author_title`, `author_image`, `rating` (1–5), `title`, `content`, `is_published`
    - Режим создания vs. редактирования (если отзыв уже существует — форма редактирования)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 10.3 Написать unit-тесты для `ObjectReviewForm`
    - Тест режима создания vs. редактирования, валидации `rating`
    - _Requirements: 5.5_

  - [x] 10.4 Создать компонент `src/components/admin/objects/AdminObjectForm.tsx`
    - Форма с тремя вкладками: «Основное» (`ObjectMainForm`), «Фотографии» (`ObjectGalleryManager`), «Отзыв клиента» (`ObjectReviewForm`)
    - Сохранение объекта в `our_objects`, `toast.success` при успехе, `toast.error` при ошибке
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 4.1, 5.1_

  - [ ]* 10.5 Написать unit-тесты для `AdminObjectForm`
    - Тест переключения вкладок, валидации пустого `title`
    - _Requirements: 3.6_

- [x] 11. Подключение административных маршрутов в `src/pages/Account.tsx`
  - Добавить маршруты `/objects`, `/objects/new`, `/objects/edit/:id` внутри `<Routes>` в `Account.tsx`
  - Обернуть в `<ProtectedRoute>` с `allowedRoles={["admin", "editor", "manager"]}`
  - _Requirements: 3.1_

- [x] 12. Checkpoint — Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, задать вопросы пользователю при необходимости.

- [x] 13. Интеграция и финальное связывание
  - [x] 13.1 Проверить и настроить обработку ошибок на публичной стороне
    - `toast.error` при ошибке загрузки списка; `NotFoundState` при 404 или неопубликованном объекте
    - Graceful degradation: ошибка загрузки изображений/отзыва не блокирует остальной контент страницы
    - _Requirements: 2.6_

  - [x] 13.2 Проверить и настроить обработку ошибок на административной стороне
    - Inline-ошибка при пустом `title`, `toast.error` при ошибке сохранения/загрузки/удаления
    - Inline-ошибка при конфликте slug
    - _Requirements: 3.6_

- [x] 14. Финальный checkpoint — Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, задать вопросы пользователю при необходимости.

## Notes

- Задачи, помеченные `*`, являются опциональными и могут быть пропущены для более быстрого MVP
- Каждая задача ссылается на конкретные требования для обеспечения трассируемости
- Checkpoint-задачи обеспечивают инкрементальную валидацию
- Property-тесты используют библиотеку `fast-check` (минимум 100 итераций), unit-тесты — Vitest + React Testing Library
- Каждый property-тест помечается комментарием `// Feature: our-objects, Property N: <property_text>`

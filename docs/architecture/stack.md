# Технологический стек

## Backend
- **Язык:** Kotlin
- **Фреймворк:** Spring Boot
- **БД:** PostgreSQL
- **ORM:** jOOQ (типобезопасный SQL, генерация из схемы БД)
- **API:** TODO (REST / GraphQL)
- **Аутентификация:** TODO

## Frontend
- **Фреймворк:** Next.js
- **Язык:** TypeScript
- **UI-библиотека:** TODO
- **State management:** TODO

## Инфраструктура
- **Деплой:** TODO
- **CI/CD:** TODO
- **Контейнеризация:** TODO

## Обоснование выбора

| Решение | Почему |
|---------|--------|
| Kotlin + Spring MVC | Типобезопасность, зрелая экосистема, простота blocking-модели |
| jOOQ | Типобезопасный SQL, генерация из схемы — тот же API-first подход что и OpenAPI |
| Liquibase (SQL) | Миграции в чистом SQL, rollback из коробки |
| PostgreSQL | Надёжность, JSON-поддержка, расширяемость |
| Next.js | SSR для SEO (маркетплейс), быстрый старт, большое комьюнити |

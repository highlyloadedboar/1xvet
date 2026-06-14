# Технологический стек

## Backend

- **Язык:** Kotlin 2.0
- **Фреймворк:** Spring Boot 3.4
- **БД:** PostgreSQL (через Yandex Managed PostgreSQL в проде)
- **ORM:** Spring Data JPA (Hibernate под капотом)
- **Миграции:** Liquibase (формат SQL)
- **API:** REST через OpenAPI 3.1 — спека в `api/specs/`, контроллер-интерфейсы генерируются
- **Аутентификация:** Spring Security + JWT (jjwt 0.12), своя реализация
- **Документация API:** SpringDoc (swagger-ui в дев-режиме)
- **Observability:** Spring Boot Actuator + Micrometer + Prometheus registry
- **Логирование:** SLF4J + Logback (стандарт Spring Boot), kotlin-logging для удобства
- **Тесты:** JUnit 5 + Spring MockMvc, Zonky embedded PostgreSQL (без Docker)
- **Линтеры:** detekt (статанализ) + ktlint (форматирование), оба на CI

## Frontend

- **Фреймворк:** Next.js 16 (App Router) + React 19
- **Язык:** TypeScript
- **Стили:** Tailwind CSS 4 + кастомные CSS-переменные (Forest-тема, см. редизайн PR #25)
- **Шрифты:** Manrope (заголовки) + DM Sans (body) через `next/font/google`
- **State:** локальный (useState/useEffect), без redux/zustand — приложение пока маленькое
- **Polling для чата:** `setInterval` + `fetch` (3 сек)

## Инфраструктура

- **Облако:** Yandex Cloud
- **VM:** Compute Instance, Ubuntu, 2 vCPU / 4 GB
- **БД:** Yandex Managed PostgreSQL
- **Container Registry:** Yandex Container Registry
- **Контейнеризация:** Docker — оба сервиса и observability-стек как контейнеры на одной VM
- **CI/CD:** GitHub Actions (workflow `Deploy`, триггер вручную)
- **Reverse proxy:** nginx (с доменом xvet.ru, см. PR #28)
- **TLS:** Let's Encrypt через certbot (после покупки домена)
- **Мониторинг:** Prometheus + Grafana + Loki + Promtail (`monitoring/docker-compose.yml`)

## Обоснование выбора

| Решение | Почему |
|---------|--------|
| Kotlin + Spring Boot | Типобезопасность, зрелая экосистема, простота blocking-модели MVC |
| Spring Data JPA вместо jOOQ | Меньше кода для типичных CRUD-операций, JPA-репозиторий сам генерирует методы по сигнатуре. До PR #13 пробовали jOOQ — оверкилл для текущих запросов |
| PostgreSQL | Надёжность, JSON-поддержка, расширения, managed-вариант в Yandex Cloud |
| Liquibase (SQL) | Миграции в чистом SQL, rollback из коробки, читаемая история изменений |
| OpenAPI 3.1 | Контракты как код, генерация интерфейсов и DTO, исключает дрейф между бэком и фронтом |
| Next.js | SSR/SSG для SEO лендинга, App Router, простая роутинг-модель |
| Tailwind | Утилитарные классы + CSS-токены — без CSS-in-JS, без библиотек компонентов |
| JWT (без refresh) | Простота на старте; добавим refresh, когда понадобится более короткий TTL access-токена |
| docker run + docker compose | Один сервер, два контейнера + observability-стек — Kubernetes избыточен |
| nginx + Let's Encrypt | Стандарт де-факто для VM-деплоя, certbot держит сертификаты в актуальном состоянии |
| Prometheus + Grafana + Loki | Open-source, лёгкий в установке (~250 МБ RAM на всё), один UI для метрик и логов |

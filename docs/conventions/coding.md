# Конвенции кода

## Структура backend (Kotlin + Spring Boot)

**Package by feature** с элементами DDD для сложных доменов.

```
com.xvet/
├── pet/
│   ├── PetController.kt       ← тонкий, только маршрутизация
│   ├── PetService.kt          ← бизнес-логика
│   ├── PetRepository.kt       ← доступ к данным
│   ├── Pet.kt                 ← Entity (БД)
│   └── PetDto.kt              ← DTO (API вход/выход)
├── vet/
├── chat/
├── booking/
├── auth/
└── common/                    ← общие утилиты, exceptions, config
```

**Принципы:**
- Каждая фича — самодостаточный пакет
- Controller тонкий: валидация входа → вызов сервиса → маппинг ответа
- Service содержит бизнес-логику, не знает про HTTP
- Entity ≠ DTO — всегда разделяем (маппинг через extension-функции Kotlin)
- Если домен становится сложным — выделяем в DDD-стиле (domain/port/adapter)

## API-first (OpenAPI)

**Подход:** описываем все эндпоинты и модели в YAML (OpenAPI 3.1), генерируем код.

**Спеки живут в:**
```
api/specs/
├── openapi.yaml       ← главный файл, импортит остальные
├── pet.yaml           ← эндпоинты + модели питомцев
├── vet.yaml           ← ветеринары
├── booking.yaml       ← запись
├── chat.yaml          ← чат (REST часть)
└── auth.yaml          ← авторизация
```

**Что генерируется:**
- **Backend (Kotlin):** интерфейсы контроллеров + data classes DTO → реализуем интерфейсы в `*ServiceImpl.kt`
- **Frontend (TypeScript):** типы + fetch-клиент → используем напрямую в компонентах

**Инструменты:**
- `openapi-generator` Gradle плагин (backend)
- `openapi-typescript-codegen` или `orval` (frontend)

**Правила:**
- YAML — единый источник правды для API
- Сгенерённый код в `.gitignore` (генерится на билде)
- Контроллер НЕ пишем руками — реализуем сгенерённый интерфейс
- DTO НЕ пишем руками — берём из генерации
- Entity (БД) остаётся отдельной от DTO — маппинг в сервисе

## Работа с данными

**ORM:** jOOQ
- Типобезопасные SQL-запросы через Kotlin DSL
- Классы таблиц генерируются из схемы БД (Gradle плагин)
- Полный контроль над SQL, никакой магии
- Entity (jOOQ Record) → DTO (сгенерённый из OpenAPI) — маппинг в сервисе

**Миграции:** Liquibase (SQL-формат, поддержка rollback)

**Подход:**
- Пишем SQL-миграцию → Liquibase применяет → jOOQ генерит классы таблиц → используем в коде
- Сложные запросы — нормально, jOOQ для этого и создан
- Транзакции через `@Transactional` Spring

## Тесты

**Подход:** прагматичный — тестируем то, что больно сломать.

| Что | Как | Обязательно |
|-----|-----|-------------|
| Сервисный слой | Unit-тесты (JUnit 5 + MockK) | Да |
| API-эндпоинты | Integration-тесты (Spring MockMvc) | Да |
| БД | Zonky embedded PostgreSQL (реальный PG, без Docker) | Да |
| Фронтенд | Добавим когда стабилизируется | Нет (пока) |

**Тестовая БД:** Zonky поднимает встроенный PostgreSQL, Liquibase накатывает миграции — тесты работают на реальной схеме без Docker.

**Не тестируем:** сгенерённые контроллеры, тривиальный маппинг, конфиги.

### Стандарты тестов

**Базовый класс:** все интеграционные тесты наследуют `BaseIntegrationTest`:
```kotlin
class MyFeatureTest : BaseIntegrationTest() {
```
Базовый класс содержит:
- Все аннотации (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`, `@AutoConfigureEmbeddedDatabase`, `@Transactional`)
- `mockMvc`, `objectMapper`
- Хелперы: `registerUser()`, `loginUser()`, `registerAndGetToken()`, `randomEmail()`

**Изоляция:** `@Transactional` на базовом классе — каждый тест работает в своей транзакции и откатывается. Тесты не влияют друг на друга.

**Случайные данные:** используем `randomEmail()` (UUID-based) вместо хардкода email — тесты не ломаются при изменении порядка запуска.

**Группировка:** `@Nested` для логических групп внутри тестового класса:
```kotlin
@Nested
inner class Register {
    @Test
    fun `should return 201 with token`() { ... }
}

@Nested
inner class Login {
    @Test
    fun `should return 401 when password is wrong`() { ... }
}
```

**Именование тестов:** `should <действие> when <условие>`:
- `should return 201 with token and user info`
- `should return 401 when password is wrong`
- `should be accessible without token`

**Проверка ответов:** `jsonPath` на конкретные поля (не сравнение целого JSON — устойчивее к изменениям схемы).

## Kotlin-стиль

**Spring MVC (blocking)** — классический подход, один запрос = один поток.
- Проще писать и дебажить
- Чат через WebSocket работает и без WebFlux
- Пересмотрим при 5000+ одновременных пользователей

## Линтер и форматтер

**detekt** — статический анализ, жёсткая конфигурация:
- complexity rules (длинные методы, вложенность, цикломатическая сложность)
- style rules (naming, formatting, magic numbers)
- potential-bugs (пустые блоки catch, неиспользуемые параметры)
- Запускается на CI — не прошёл = не мержится

**ktlint** — форматирование (поверх detekt):
- Единый стиль кода, автоформат через `./gradlew ktlintFormat`
- Подключен как Gradle-плагин

Оба инструмента запускаются через pre-commit hook и на CI.

## Git и ветвление

**Подход:** GitHub Flow — простая модель для небольшой команды.

**Принцип:** `main` всегда рабочий и готов к деплою. Вся работа идёт в коротких feature-ветках.

**Процесс:**
1. Создаём ветку от `main`
2. Работаем, коммитим
3. Открываем PR → CI проверяет (тесты, линтеры)
4. Merge в `main` (squash merge — одна фича = один коммит в истории)
5. Ветку удаляем

**Именование веток:**

| Тип | Формат | Пример |
|-----|--------|--------|
| Фича | `feature/<name>` | `feature/vet-profile` |
| Баг | `fix/<name>` | `fix/chat-scroll` |
| Документация | `docs/<name>` | `docs/api-specs` |
| Рефакторинг | `refactor/<name>` | `refactor/auth-module` |

Имена в kebab-case, на английском.

**Коммиты:** conventional commits — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

**Правила:**
- PR обязателен даже при работе в одиночку (CI должен пройти)
- Squash merge в `main` — чистая линейная история
- Ветку удаляем после merge
- Не коммитим напрямую в `main`

**Почему не Git Flow:** избыточен для старта (develop, release, hotfix ветки — лишние церемонии без пользы при 1–2 разработчиках). Пересмотрим при росте команды.

## CI/CD

**Платформа:** GitHub Actions — код на GitHub, нулевая интеграция, 2000 бесплатных минут/месяц.

**Пайплайны:**

| Триггер | Что делает |
|---------|-----------|
| PR в `main` | CI: сборка + тесты + detekt + ktlint |
| Кнопка (workflow_dispatch) | Деплой на testing |
| Approval (environment protection) | Деплой на production |

**CI (автоматический):**
- Запускается на каждый PR в `main`
- Шаги: checkout → Java 21 → Gradle build (компиляция + OpenAPI генерация + тесты + линтеры)
- PR не мержится если CI красный

**CD (ручной):**
- Нажимаем кнопку "Run workflow" в GitHub → деплой на testing
- После проверки на testing — подтверждаем (approval) → деплой на production
- Используем GitHub Environments с protection rules для approval-шага

**Деплой:**
- Docker-образ собирается на CI
- Пушится в container registry
- Деплоится на Yandex Cloud

**Почему ручной деплой, а не автоматический:**
- Полный контроль — деплоим когда готовы
- Можно смержить несколько PR и задеплоить разом
- Безопасно — случайный merge docs не триггерит деплой

## Логирование

- SLF4J + Logback (стандарт Spring Boot)
- Structured logging (JSON в проде)
- Уровни: ERROR (сломалось), WARN (подозрительно), INFO (бизнес-события), DEBUG (только локально)

# Конвенции кода

## Структура backend (Kotlin + Spring Boot)

**Package by feature** с тонкими контроллерами поверх сгенерированных из OpenAPI интерфейсов.

```
com.xvet/
├── auth/                ← JWT, регистрация, логин
├── pet/                 ← питомцы
├── vet/                 ← профиль вета, публичный поиск
├── schedule/            ← слоты + appointments (booking)
├── chat/                ← беседы + сообщения (REST)
└── common/              ← SecurityConfig, GlobalExceptionHandler, CORS
```

Внутри модуля:

```
schedule/
├── VetSlotEntity.kt           ← JPA-сущность
├── VetSlotRepository.kt       ← Spring Data JPA
├── VetSlotService.kt          ← бизнес-логика
├── BookingService.kt          ← booking-логика
├── BookingController.kt       ← реализация BookingApi (сгенерирована)
└── AppointmentEntity.kt
```

**Принципы:**
- Каждая фича — самодостаточный пакет.
- Controller тонкий: реализует сгенерированный интерфейс и пробрасывает вызов в сервис. HTTP-маппинг и валидация спускаются из OpenAPI.
- Service содержит бизнес-логику, не знает про HTTP.
- JPA-сущности (`*Entity.kt`) и сгенерированные из OpenAPI DTO (`*Response.kt`, `*Request.kt`) — разные типы. Маппинг в сервисе через приватные extension-функции.
- Если домен сильно растёт — отделяем в DDD-стиле (domain/port/adapter). Пока не понадобилось.

## API-first (OpenAPI)

**Подход:** описываем все эндпоинты и модели в YAML (OpenAPI 3.1), генерируем код.

**Спеки живут в:**
```
api/specs/
├── openapi.yaml       ← главный файл, импортит остальные
├── auth.yaml
├── pet.yaml
├── vet.yaml           ← профиль вета + slots endpoints
├── booking.yaml       ← appointments
├── chat.yaml
└── common.yaml        ← ErrorResponse и т.п.
```

**Что генерируется:**
- **Backend (Kotlin):** интерфейсы контроллеров + data classes DTO → реализуем интерфейсы в `*Controller.kt`. Лежит в `build/generated/openapi/`.
- **Frontend (TypeScript):** типы дублируем вручную в `frontend/src/lib/api.ts`. Кодгенерация фронта не настроена — эндпоинтов пока мало, церемония бы перевесила пользу.

**Правила:**
- YAML — единый источник правды для контрактов API.
- Сгенерированный код не коммитим (в gitignore), генерится на каждом билде.
- Контроллер НЕ пишем руками — реализуем сгенерированный интерфейс.
- DTO НЕ пишем руками — берём `*Response` / `*Request` из генерации.
- JPA Entity отделена от DTO — маппинг в сервисе.

## Работа с данными

**ORM:** Spring Data JPA (Hibernate под капотом).

- JPA-сущность с аннотациями `@Entity` / `@Table` / `@Column`.
- Репозиторий — интерфейс `JpaRepository<TEntity, Long>`, методы по сигнатуре (`findByOwnerIdOrderByCreatedAtDesc`).
- Сложные запросы — через `@Query("...")` или JPA Specifications.
- Транзакции — `@Transactional` Spring.

**Миграции:** Liquibase (SQL-формат, поддержка rollback).

**Подход:**
- Сначала пишем SQL-миграцию → Liquibase применяет → создаём/обновляем JPA Entity под эту схему.
- Никаких `ddl-auto: update` в проде — схема меняется только через миграции.

> Раньше пробовали jOOQ (PR #12). Для текущих CRUD-запросов он давал больше boilerplate, чем сэкономленных багов, поэтому в PR #13 перешли на JPA.

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
| PR в `main` (`ci.yml`) | Сборка бэка через `./gradlew build` — компиляция + OpenAPI генерация + тесты + detekt + ktlint |
| Кнопка `workflow_dispatch` (`deploy.yml`) | Билд + push образов в Yandex Container Registry + SSH-деплой на VM + поднятие monitoring-стека |

**CI (автоматический):**
- Запускается на каждый PR в `main`.
- Не прошёл — PR не мержится.

**CD (ручной):**
- Открываем Actions → `Deploy` → Run workflow с веткой `main`.
- Один стейдж — `production`. До PR #26 был ещё `testing`-стейдж на той же VM, убрали как лишний слой.
- Секреты в GitHub Environment `production`: `YC_SA_KEY`, `VM_SSH_KEY`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `GRAFANA_ADMIN_PASSWORD`.

**Почему ручной деплой, а не автоматический:**
- Полный контроль — деплоим когда готовы.
- Можно смержить несколько PR и задеплоить одним прогоном.
- Случайный merge docs или test-only PR не триггерит деплой.

## Логирование

- SLF4J + Logback (стандарт Spring Boot)
- Structured logging (JSON в проде)
- Уровни: ERROR (сломалось), WARN (подозрительно), INFO (бизнес-события), DEBUG (только локально)

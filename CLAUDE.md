# 1xVet — PetTech SaaS Platform

Онлайн-платформа ветеринарной помощи. Владельцы питомцев получают консультации проверенных ветеринаров в чате — без
очередей, без стресса для животного, в любое время суток.

## Статус

Проектирование. Код ещё не написан — прорабатываем фичи, архитектуру, стек.

## Стек

| Слой           | Технология                             |
|----------------|----------------------------------------|
| Backend        | Kotlin + Spring Boot                   |
| Frontend       | Next.js (React, TypeScript)            |
| БД             | PostgreSQL                             |
| API            | REST (рассматриваем GraphQL для чатов) |
| Реалтайм       | WebSocket (чат)                        |
| Аутентификация | Spring Security + JWT (своя реализация)|
| Деплой         | Yandex Cloud + Docker + GitHub Actions |

## Структура проекта

```
1xvet/
├── CLAUDE.md
├── api/
│   └── specs/             ← OpenAPI YAML (единый источник правды для API)
│       ├── openapi.yaml   ← главный файл
│       ├── pet.yaml
│       ├── vet.yaml
│       ├── booking.yaml
│       ├── chat.yaml
│       └── auth.yaml
├── docs/
│   ├── product/           ← что строим
│   │   ├── features.md    ← все фичи из дизайна
│   │   ├── personas.md    ← целевая аудитория
│   │   └── roadmap.md     ← порядок реализации
│   ├── architecture/      ← как строим
│   │   ├── overview.md    ← общая архитектура
│   │   ├── stack.md       ← стек и обоснование
│   │   └── decisions.md   ← ADR
│   └── conventions/       ← правила разработки
│       └── coding.md
├── backend/               ← Kotlin + Spring Boot (контроллеры генерятся из спеки)
└── frontend/              ← Next.js (TS-клиент генерится из спеки)
```

## Ключевые экраны (из дизайна)

1. **Лендинг** — hero, соцдоказательство, шаги, превью врачей, отзывы
2. **Дашборд владельца** — питомцы, консультации, профиль питомца
3. **Поиск ветеринара** — фильтры, список, запись
4. **Профиль ветеринара** — инфо, слоты записи, отзывы
5. **Чат** — сайдбар бесед, сообщения, файлы/фото, typing
6. **Дашборд ветеринара** — расписание, входящие запросы, пациенты

## Две роли пользователей

- **Владелец питомца** — ищет врача, записывается, консультируется в чате, управляет питомцами
- **Ветеринар** — управляет расписанием, принимает/отклоняет запросы, ведёт чат-консультации

## Документация

- [Продуктовые фичи](docs/product/features.md) — детальное описание всех экранов
- [Целевая аудитория](docs/product/personas.md)
- [Роадмап](docs/product/roadmap.md)
- [Архитектура](docs/architecture/overview.md)
- [��тек и обоснование](docs/architecture/stack.md)
- [Архитектурные решения](docs/architecture/decisions.md)
- [Конвенции кода](docs/conventions/coding.md)

## Дизайн

Прототип: `docs/design/1xVet v2.html` (5 интерактивных экранов на React)

- Палитра: кремовый фон `#faf7f2`, терракотовый акцент `#c4622d`, тёплые тона
- Шрифты: Lora (заголовки), DM Sans (body)
- Стиль: тёплый, editorial, без "клинического" ощущения

## Команды

```bash
# Backend
cd backend
./gradlew build            # собрать + тесты + линтеры
./gradlew bootRun          # запустить приложение
./gradlew test             # тесты (Zonky embedded PG, без Docker)
./gradlew openApiGenerate  # сгенерировать контроллеры/DTO из OpenAPI
./gradlew jooqCodegen      # сгенерировать jOOQ классы (нужна БД)
./gradlew detekt           # статический анализ
./gradlew ktlintFormat     # автоформат кода

# Инфраструктура
docker compose up -d       # поднять PostgreSQL

# Frontend — TODO
```

**Важно:** Gradle требует Java 21 (настроено в `gradle.properties`).

## Конвенции (будут дополняться)

- Язык кода: английский (переменные, комментарии)
- Язык интерфейса: русский
- Git: conventional commits (feat:, fix:, docs:, refactor:)
- Ветки: feature/<name>, fix/<name>

# ИКС ВЕТ — PetTech SaaS Platform

Онлайн-платформа ветеринарной помощи. Владельцы питомцев получают консультации проверенных ветеринаров в чате — без
очередей, без стресса для животного, в любое время суток.

## Статус

Прод-стенд работает (`http://111.88.254.81:3000`), сейчас на пути на домен `xvet.ru` + HTTPS через nginx + Let's Encrypt (PR #28, ждёт покупки домена). MVP закрыт, Фаза 2 (бронирование, расписание, дашборды) закрыта, наводим observability и переходим к Фазе 3 (отзывы, уведомления, оплата).

## Стек

| Слой           | Технология                                              |
|----------------|---------------------------------------------------------|
| Backend        | Kotlin 2.0 + Spring Boot 3.4                            |
| Frontend       | Next.js 16 (React 19, TypeScript) + Tailwind CSS 4      |
| БД             | PostgreSQL (Yandex Managed PostgreSQL в проде)          |
| ORM            | Spring Data JPA (Hibernate)                             |
| Миграции       | Liquibase (SQL-формат)                                  |
| API            | REST через OpenAPI 3.1 (контроллер-интерфейсы генерим)  |
| Реалтайм       | REST polling каждые 3 сек (WebSocket — следующий шаг)   |
| Аутентификация | Spring Security + JWT (своя реализация)                 |
| Деплой         | Yandex Cloud VM + Docker + GitHub Actions               |
| Reverse proxy  | nginx + Let's Encrypt (на пути к xvet.ru)               |
| Observability  | Prometheus + Grafana + Loki + Promtail (на той же VM)   |

## Структура проекта

```
1xvet/
├── CLAUDE.md
├── api/
│   └── specs/                 ← OpenAPI YAML (единый источник правды)
│       ├── openapi.yaml
│       ├── auth.yaml
│       ├── pet.yaml
│       ├── vet.yaml
│       ├── booking.yaml       ← appointments
│       ├── chat.yaml
│       └── common.yaml
├── backend/                   ← Kotlin + Spring Boot (контроллеры генерим из спеки)
│   └── src/main/kotlin/com/xvet/
│       ├── auth/              ← JWT, регистрация, логин
│       ├── pet/               ← питомцы CRUD
│       ├── vet/               ← профиль вета, поиск
│       ├── schedule/          ← слоты + appointments (booking)
│       ├── chat/              ← беседы + сообщения (REST)
│       └── common/            ← SecurityConfig, GlobalExceptionHandler
├── frontend/                  ← Next.js (App Router) + Tailwind
│   ├── public/catsanddogs.png ← hero-портрет
│   └── src/
│       ├── app/               ← роуты
│       ├── components/ui/     ← Button, Card, Tag, Avatar, Icon и т.д.
│       └── lib/               ← api.ts (типы + клиент), auth.ts (хуки)
├── docs/
│   ├── product/
│   │   ├── features.md        ← все экраны и сценарии
│   │   ├── personas.md
│   │   └── roadmap.md         ← что сделано, что в очереди
│   ├── architecture/
│   │   ├── overview.md        ← общая схема, модули, деплой
│   │   ├── stack.md           ← обоснование выбора стека
│   │   └── decisions.md       ← ADR
│   └── conventions/
│       └── coding.md
├── monitoring/                ← Prometheus/Grafana/Loki/Promtail (docker-compose)
├── nginx/                     ← reverse proxy для xvet.ru (после домена)
├── scripts/
│   └── seed.sh                ← демо-данные для стенда
└── .github/workflows/
    ├── ci.yml                 ← тесты + линтеры на PR
    └── deploy.yml             ← workflow_dispatch → build → deploy
```

## Роли пользователей

- **Владелец питомца (OWNER)** — ищет врача, записывается, консультируется в чате, управляет питомцами
- **Ветеринар (VET)** — управляет расписанием (слотами), принимает брони, ведёт чат-консультации

## Документация

- [Роадмап](docs/product/roadmap.md) — что сделано/в очереди
- [Продуктовые фичи](docs/product/features.md) — детальное описание экранов
- [Целевая аудитория](docs/product/personas.md)
- [Архитектура](docs/architecture/overview.md)
- [Стек и обоснование](docs/architecture/stack.md)
- [Архитектурные решения (ADR)](docs/architecture/decisions.md)
- [Конвенции кода](docs/conventions/coding.md)
- [Observability stack](monitoring/README.md)
- [nginx reverse proxy](nginx/README.md)

## Команды

```bash
# Backend (из ./backend)
./gradlew build            # сборка + тесты + detekt + ktlint
./gradlew bootRun          # запустить локально
./gradlew test             # только тесты (Zonky embedded PG)
./gradlew openApiGenerate  # сгенерировать контроллер-интерфейсы из OpenAPI
./gradlew ktlintFormat     # автоформат
./gradlew detekt           # статанализ

# Инфраструктура
docker compose up -d       # поднять локальный PostgreSQL

# Frontend (из ./frontend)
npm run dev                # http://localhost:3000
npm run build              # production-сборка
npm run lint               # ESLint

# Данные для стенда
./scripts/seed.sh                          # против дев-стенда
./scripts/seed.sh http://localhost:8080    # против локального бэка
```

**Важно:** Gradle требует Java 21.

## Конвенции

- Язык кода: английский (переменные, комментарии)
- Язык интерфейса: русский
- Git: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- Branching: GitHub Flow, 1 PR = 1 фича (см. `docs/conventions/coding.md`)

# Архитектура

## Общая схема

**Модульный монолит** — один Spring Boot, код разделён по доменным модулям. Поверх — nginx-прокси (на стенде с доменом) и observability-стек.

```
                              ┌──────────────────────┐
        Клиент (браузер) ───► │  nginx (TLS)         │
                              │  xvet.ru / *.xvet.ru │
                              └─┬──────────────┬─────┘
                                │              │
                                ▼              ▼
                       ┌──────────────┐  ┌──────────────┐
                       │   Frontend   │  │   Backend    │
                       │   Next.js    │  │ Spring Boot  │
                       │     :3000    │  │    :8080     │
                       └──────────────┘  └───┬──────────┘
                                             │ JPA / JDBC
                                             ▼
                                      ┌──────────────┐
                                      │  PostgreSQL  │
                                      └──────────────┘

   Observability стек (рядом, отдельная docker-сеть):
   Promtail ──► Loki      Prometheus ──► /actuator/prometheus (8081)
                  └────────────┬────────────┘
                               ▼
                          Grafana :3001
```

## Backend-модули

| Пакет | Отвечает за |
|-------|-------------|
| `auth` | Регистрация, логин, JWT, роли OWNER/VET |
| `pet` | Питомцы: CRUD, привязка к владельцу |
| `vet` | Профиль вета, верификация, публичный поиск |
| `schedule` | Слоты расписания вета + бронирование (appointments) |
| `chat` | Беседы и сообщения через REST (WebSocket — следующая итерация) |
| `common` | SecurityConfig, GlobalExceptionHandler, CORS |

## Принципы

- Модули общаются через вызовы сервисов в одном процессе.
- Каждый модуль владеет своими таблицами; чужие таблицы не трогает напрямую.
- Если модуль вырастает — отделяется без переписывания бизнес-логики.

## Слои внутри модуля

```
schedule/
├── VetSlotEntity.kt       ← JPA-сущность
├── VetSlotRepository.kt   ← Spring Data JPA
├── VetSlotService.kt      ← бизнес-логика
├── BookingService.kt      ← booking-логика, тоже в этом пакете
├── BookingController.kt   ← реализация BookingApi (сгенерирована)
└── AppointmentEntity.kt
```

`Controller → Service → Repository`. Зависимости только вниз. Controllers тонкие — реализуют сгенерированный из OpenAPI интерфейс и пробрасывают вызов сервису.

## Аутентификация

**Spring Security + JWT**, своя реализация (см. `auth/`).

- `POST /api/auth/register` или `/login` → возвращает `{ token, user }`
- Клиент кладёт токен в `localStorage`, шлёт в `Authorization: Bearer <token>`
- `JwtFilter` парсит токен, кладёт `userId` как principal в SecurityContext
- В контроллерах достаём через `SecurityContextHolder`

JWT односторонний (без refresh-токена) — токен живёт 24 часа. Когда надо будет — добавим refresh.

## Реалтайм (чат)

**Сейчас:** REST + polling каждые 3 секунды. Фронт дёргает `GET /api/conversations/{id}/messages` по таймеру, отправляет через `POST`. Работает, проще в дебаге, легче на сети.

**В планах:** WebSocket-транспорт через Spring WebSocket / STOMP. UI чата уже спроектирован так, чтобы переход был прозрачен — менять только источник сообщений.

## API-first (OpenAPI)

YAML в `api/specs/` — единый источник правды для контрактов:

```
api/specs/
├── openapi.yaml      ← главный, импортит остальные
├── auth.yaml
├── pet.yaml
├── vet.yaml
├── booking.yaml
├── chat.yaml
└── common.yaml       ← общие ErrorResponse и т.п.
```

- Backend: `./gradlew openApiGenerate` собирает Kotlin-интерфейсы и DTO в `build/generated/openapi/`, контроллеры реализуют интерфейсы.
- Frontend: типы вручную дублируются в `frontend/src/lib/api.ts` (мало эндпоинтов — кодгенерация была бы лишней церемонией).

## Деплой (Yandex Cloud)

**Инфраструктура:**

| Компонент | Где |
|-----------|-----|
| Backend (Spring Boot) | docker-контейнер на VM |
| Frontend (Next.js) | docker-контейнер на той же VM |
| PostgreSQL | Yandex Managed PostgreSQL |
| Container Registry | Yandex Container Registry |
| Observability | Prometheus + Grafana + Loki + Promtail контейнеры на той же VM |

**Окружения:** одно — `production`. До PR #26 был отдельный `testing`-стейдж, выкинули как лишний слой.

**Сеть:** все контейнеры на shared docker network `xvet-net`, чтобы Prometheus мог скрейпить бэк по `xvet-backend:8081`, Promtail видел контейнерные лейблы и т.д.

**Деплой-пайплайн (GitHub Actions, `Deploy` workflow):**

```
workflow_dispatch вручную
  └─► build-backend  (gradle build + docker push)
  └─► build-frontend (npm build + docker push)
        └─► deploy   (SSH на VM → docker pull/run + docker compose up для monitoring)
```

Все контейнеры запускаются с `--label logging=promtail`, чтобы Promtail цеплял их логи.

## Хранение файлов

Не реализовано. Когда понадобится для чата — Yandex Object Storage (S3 API): фронт получает presigned URL у бэка и грузит файл напрямую в S3, бэк хранит только метаданные.

## Observability

`monitoring/` содержит docker-compose с четырьмя сервисами:

- **Prometheus** — скрейпит `/actuator/prometheus` каждые 15 сек, 30 дней истории.
- **Loki** — логи всех контейнеров с `logging=promtail` лейблом, 14 дней.
- **Promtail** — log shipper, цепляется к docker.sock.
- **Grafana** на `:3001` с pre-provisioned дашбордом `ИКС ВЕТ — Backend`: RPS, error rate, latency p50/p95/p99, топ 5xx-эндпоинтов, JVM heap, лента логов.

Подробности в `monitoring/README.md`.

## Масштабирование

**Текущая конфигурация (1 VM 2 vCPU / 4 GB):** хватает на первые несколько тысяч пользователей.

**Горизонтальное масштабирование:**
- REST API — stateless (JWT), добавляем инстанс + Yandex Application Load Balancer.
- Чат с WebSocket (когда будет): нужен Redis Pub/Sub для доставки сообщений между инстансами.
- БД — read replicas Managed PostgreSQL.
- Фронт — статика, легко в CDN.

**Вертикальный шаг:** 4 vCPU / 8 GB — двукратный прирост без архитектурных изменений.

## Что НЕ нужно на старте

- ❌ API Gateway — один бэкенд, нечего маршрутизировать
- ❌ Service discovery — нет распределённых сервисов
- ❌ Kafka / RabbitMQ — межмодульное общение синхронное
- ❌ Kubernetes — два контейнера на одной VM, docker достаточно
- ❌ Мультитенантность — один продукт

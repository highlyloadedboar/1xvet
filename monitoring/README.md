# Monitoring stack

Prometheus + Grafana + Loki + Promtail running next to the app on the same VM.
All services share the `xvet-net` docker network so they can talk by container
name. Only Grafana is exposed externally on port `3001`.

## What you get

- **Метрики** — Spring Boot отдаёт `/actuator/prometheus` на порту `8081`
  (внутренний, не наружу). Prometheus скрейпит каждые 15 секунд.
- **Логи** — Promtail цепляется к Docker socket, стримит логи всех
  контейнеров с лейблом `logging=promtail` в Loki.
- **Дашборд** — `ИКС ВЕТ — Backend` с RPS, error rate, latency p50/p95/p99,
  топ 5xx-эндпоинтов, JVM heap и логами бэкенда в одном экране.

## Доступ

- URL: `http://<VM>:3001`
- Логин: `admin`
- Пароль: переменная `GRAFANA_ADMIN_PASSWORD` (по умолчанию `admin` — поменяй
  в проде)

## Local

```sh
# Поднять сеть и стек локально
docker network create xvet-net 2>/dev/null || true
docker compose -f monitoring/docker-compose.yml up -d

# Чтобы Promtail видел логи приложения — запусти бэк в той же сети
# с лейблом logging=promtail:
docker run -d --name xvet-backend --network xvet-net \
  --label logging=promtail \
  -e SPRING_DATASOURCE_URL=... \
  cr.yandex/.../xvet-backend:tag
```

## Retention

- Prometheus: 30 дней (флаг `--storage.tsdb.retention.time=30d`)
- Loki: 14 дней (`limits_config.retention_period`)

Volumes для данных живут на хосте: `prometheus-data`, `loki-data`, `grafana-data`.

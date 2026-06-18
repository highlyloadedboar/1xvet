# nginx reverse proxy

Single-VM setup with nginx terminating TLS and routing by host/path:

- `https://xvet.ru` → frontend (`localhost:3000`)
- `https://xvet.ru/api/*` → backend (`localhost:8080`)
- `https://grafana.xvet.ru` → Grafana (`localhost:3001`)

## One-time setup on the VM

Делается один раз после того, как DNS уже резолвится в IP стенда.

```sh
# 1. nginx + certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. webroot directory for ACME challenge
sudo mkdir -p /var/www/certbot

# 3. The deploy workflow copies xvet.ru.conf to /etc/nginx/sites-available/
#    and enables it. So once the workflow has run at least once, just:
sudo nginx -t && sudo systemctl reload nginx

# 4. Request the cert (covers all three domains in one go)
sudo certbot --nginx \
  -d xvet.ru -d www.xvet.ru -d grafana.xvet.ru \
  --redirect --agree-tos -m <your-email>
```

`certbot --nginx` сам отредактирует `xvet.ru.conf` на VM, добавит
`listen 443 ssl` блоки, прописал `ssl_certificate*` и сделает 80→443
редирект. Авто-renew крутится через systemd timer `certbot.timer`.

> Если позже захочется поменять конфиг — правь файл в репо, прогоняй
> deploy. **Важно:** не теряй ssl-блоки, которые certbot добавил —
> они в `/etc/letsencrypt/options-ssl-nginx.conf` и подключаются
> через `include`, так что remote-edit certbot'а можно перетереть
> только локацией/proxy-настройками, ssl-часть он восстановит сам
> при следующем `certbot renew --post-hook` или ручном вызове.

## Что меняет deploy

Каждый прогон workflow `Deploy`:
1. Копирует `nginx/xvet.ru.conf` на VM в
   `/etc/nginx/sites-available/xvet.ru.conf`
2. Делает симлинк в `sites-enabled/`
3. `sudo nginx -t && sudo systemctl reload nginx`

То есть менять proxy_pass/правила можно через PR — деплой подхватит.

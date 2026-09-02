# Configuration

The deployment is configured through the `.env` file next to
`docker-compose.yml` (`/opt/zagros/.env` by default). Read and edit it with the
CLI rather than by hand:

```bash
sudo zagros env show
sudo zagros env set KEY value
sudo zagros restart        # .env is only re-read when the container is recreated
```

::: warning
`restart` (not `reload`) is what applies a `.env` change, because compose has
to recreate the container with the new values.
:::

## Identity and URLs

| Variable | Default | Meaning |
|---|---|---|
| `DOMAIN` | *(empty)* | Public hostname of the panel, without scheme or path. Drives the derived URLs below. |
| `PANEL_BASE_URL` | derived from `DOMAIN` | Explicit public URL of the panel when the derivation is not what you want. |
| `APP_BASE_URL` | `PANEL_BASE_URL` | Base URL used inside app-facing material. |
| `ZAGROS_PORTAL_TITLE` | `اشتراک من` | Title on the subscription portal page. |
| `ZAGROS_APP_NAME` | `Zagros` | Name shown to users. |
| `DASHBOARD_PATH` | `/dashboard/` | Where the dashboard is served. |

## HTTP bind and TLS

| Variable | Default | Meaning |
|---|---|---|
| `UVICORN_HOST` | `0.0.0.0` | Bind address — honoured verbatim. |
| `UVICORN_PORT` | `8000` | Panel port. |
| `UVICORN_UDS` | *(empty)* | Serve on a Unix socket instead of TCP. |
| `TLS_MODE` | `auto` | `auto` / `on` / `off` — whether the panel serves HTTPS itself. |
| `UVICORN_SSL_CERTFILE` | *(empty)* | Certificate file when TLS is on. |
| `UVICORN_SSL_KEYFILE` | *(empty)* | Key file when TLS is on. |
| `UVICORN_SSL_CA_CERTFILE` | *(empty)* | CA bundle for client verification. |
| `UVICORN_SSL_CA_TYPE` | `public` | Which CA set to trust. |
| `ZAGROS_HSTS` | `False` | Send HSTS headers. |
| `DEBUG` | `False` | Debug mode — never enable in production. |
| `DOCS` | `False` | Expose the OpenAPI docs. |

## Security

| Variable | Default | Meaning |
|---|---|---|
| `ZAGROS_SECRET_KEY` | *(required)* | Secret used to protect deployment state. Generate a long random value. |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Admin token lifetime. `0` disables expiry. |
| `SUDO_USERNAME` / `SUDO_PASSWORD` | *(empty)* | Bootstrap sudo admin, used when no admin exists yet. |

## Databases

Zagros keeps two stores: the **platform** database (users, cores, nodes,
settings) and a **legacy** database for the admin/auth tables inherited from
the older stack.

| Variable | Default | Meaning |
|---|---|---|
| `ZAGROS_DATABASE_URL` | `sqlite:////var/lib/zagros/zagros.db` | Platform database. |
| `SQLALCHEMY_DATABASE_URL` | `sqlite:///db.sqlite3` | Legacy database. |
| `SQLALCHEMY_POOL_SIZE` | `10` | Connection pool size. |
| `SQLIALCHEMY_MAX_OVERFLOW` | `30` | Extra connections allowed beyond the pool size. |

::: tip
The spelling `SQLIALCHEMY_MAX_OVERFLOW` is a typo that shipped in an early
release and is still accepted — keep it exactly like that, or the setting is
silently ignored.
:::

## Subscription and templates

| Variable | Default | Meaning |
|---|---|---|
| `SUBSCRIPTION_TEMPLATE` | `subscription/index.html` | Legacy (Marzban) setting, accepted but **not used** for the page subscribers see — that page is managed from *Subscriptions → subscription page template* in the panel (see [Custom subscription page](../examples/subscription-page.md)). Legacy alias: `SUBSCRIPTION_PAGE_TEMPLATE`. |
| `HOME_PAGE_TEMPLATE` | `home/index.html` | Template for the panel home page. |
| `CUSTOM_TEMPLATES_DIRECTORY` | *(empty)* | A directory searched **before** the built-in templates. |
| `CLASH_SUBSCRIPTION_TEMPLATE` | `clash/default.yml` | Clash profiles. |
| `SINGBOX_SUBSCRIPTION_TEMPLATE` | `singbox/default.json` | sing-box profiles. |
| `MUX_TEMPLATE` | `mux/default.json` | Mux settings. |
| `V2RAY_SUBSCRIPTION_TEMPLATE` | `v2ray/default.json` | v2ray JSON. |
| `USER_AGENT_TEMPLATE` | `user_agent/default.json` | Client detection rules. |
| `SUB_UPDATE_INTERVAL` | `12` | `profile-update-interval` header (hours). |
| `SUB_SUPPORT_URL` | `https://t.me/` | `support-url` header. |
| `SUB_PROFILE_TITLE` | `Subscription` | `profile-title` header. |

The page your subscribers see is normally chosen in the dashboard
(*Subscriptions → subscription page template*); these variables are the
deployment-level defaults it falls back to. See
[Subscriptions](./subscriptions.md).

## Notifications

| Variable | Default | Meaning |
|---|---|---|
| `TELEGRAM_API_TOKEN` | *(empty)* | Bot token. |
| `TELEGRAM_LOGGER_CHANNEL_ID` | `0` | Channel/chat that receives log messages. |
| `TELEGRAM_PROXY_URL` | *(empty)* | Proxy for Telegram calls. |
| `DISCORD_WEBHOOK_URL` | *(empty)* | Discord webhook for logs. |
| `WEBHOOK_SECRET` | *(empty)* | Secret used to sign outgoing webhooks. |
| `NOTIFY_STATUS_CHANGE`, `NOTIFY_USER_CREATED`, `NOTIFY_USER_UPDATED`, `NOTIFY_USER_DELETED`, `NOTIFY_USER_DATA_USED_RESET`, `NOTIFY_USER_SUB_REVOKED`, `NOTIFY_LOGIN` | `True` | Which events notify. |
| `NOTIFY_IF_DATA_USAGE_PERCENT_REACHED`, `NOTIFY_IF_DAYS_LEFT_REACHED` | `True` | Threshold notifications. |
| `RECURRENT_NOTIFICATIONS_TIMEOUT` | `180` | Seconds between retries. |
| `NUMBER_OF_RECURRENT_NOTIFICATIONS` | `3` | Retries after a failed send. |

## Users and jobs

| Variable | Default | Meaning |
|---|---|---|
| `USERS_AUTODELETE_DAYS` | `-1` | Delete users this many days past expiry (`-1` disables). |
| `USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS` | `False` | Also delete users who ran out of quota. |
| `ACTIVE_STATUS_TEXT`, `EXPIRED_STATUS_TEXT`, `LIMITED_STATUS_TEXT`, `DISABLED_STATUS_TEXT`, `ONHOLD_STATUS_TEXT` | `Active`, `Expired`, `Limited`, `Disabled`, `On-Hold` | Labels sent with notifications. |
| `DISABLE_RECORDING_NODE_USAGE` | `False` | Stop recording node usage. |
| `JOB_CORE_HEALTH_CHECK_INTERVAL` | `10` | Seconds between core health checks. |
| `JOB_RECORD_NODE_USAGES_INTERVAL` | `30` | Node usage collection. |
| `JOB_RECORD_USER_USAGES_INTERVAL` | `10` | User usage collection. |
| `JOB_REVIEW_USERS_INTERVAL` | `10` | Expiry/quota review. |
| `JOB_SEND_NOTIFICATIONS_INTERVAL` | `30` | Notification delivery. |

## Applying a change

```bash
sudo zagros env set JOB_REVIEW_USERS_INTERVAL 30
sudo zagros restart
sudo zagros status
```

If the panel does not come back, `zagros logs` is the fastest way to see why,
and `zagros doctor` checks the whole host.

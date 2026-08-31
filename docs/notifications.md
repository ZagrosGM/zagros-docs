# Notifications

Zagros can tell you (and your users) what happened, through three channels: a
Telegram bot for admins, Discord webhooks, and signed HTTP webhooks for your own
systems.

Delivery is a scheduled job (`JOB_SEND_NOTIFICATIONS_INTERVAL`, 30 seconds), so
an event is delivered within half a minute of happening.

## Telegram

| Variable | Purpose |
|---|---|
| `TELEGRAM_API_TOKEN` | Bot token — the bot does nothing without it. |
| `TELEGRAM_LOGGER_CHANNEL_ID` | Channel or chat that receives log messages. |
| `TELEGRAM_PROXY_URL` | Proxy for Telegram calls, when the panel cannot reach Telegram directly. |

The bot is an **admin** tool: it answers only to admins registered in the panel
(`/start` and `/help` to begin), and it can manage users from a chat — add data,
add time, change limits, edit notes — through the same code paths the dashboard
uses, so nothing the bot does bypasses validation.

## Discord

| Variable | Purpose |
|---|---|
| `DISCORD_WEBHOOK_URL` | Panel-wide Discord webhook for reports (status changes and the other events below). |
| per-admin Discord webhook | Set on the admin — their reports go there as well as to the global one. |

## Outgoing webhooks

Point Zagros at an endpoint of yours and it will POST the same events there.

| Variable | Purpose |
|---|---|
| `WEBHOOK_SECRET` | When set, every request carries it in `x-webhook-secret` so you can verify it is really the panel. |
| `RECURRENT_NOTIFICATIONS_TIMEOUT` | Seconds between retries (default 180). |
| `NUMBER_OF_RECURRENT_NOTIFICATIONS` | How many times to retry a delivery that did not succeed (default 3). |

::: tip
Always set `WEBHOOK_SECRET`. A webhook endpoint that trusts any POST is an
endpoint anyone can write to.
:::

## Which events notify

| Variable | Event |
|---|---|
| `NOTIFY_STATUS_CHANGE` | A user's status changed |
| `NOTIFY_USER_CREATED` | A user was created |
| `NOTIFY_USER_UPDATED` | A user was modified |
| `NOTIFY_USER_DELETED` | A user was deleted |
| `NOTIFY_USER_DATA_USED_RESET` | A user's consumption was reset |
| `NOTIFY_USER_SUB_REVOKED` | A subscription link was revoked |
| `NOTIFY_IF_DATA_USAGE_PERCENT_REACHED` | A user crossed a usage percentage |
| `NOTIFY_IF_DAYS_LEFT_REACHED` | A user came within N days of expiry |
| `NOTIFY_LOGIN` | An admin signed in |

Each one defaults to `True`; set it to `False` to silence that event.

## Reminders

Alongside event notifications, Zagros keeps **reminders** as first-class
records: a reminder belongs to a user, has a type (usage or expiry), an optional
threshold, and can expire itself. They are what drives the "you are about to run
out" message — a user is told once per reminder, not once per minute.

## Status labels

The words used in notifications are configurable — useful if your users read
them in another language:

`ACTIVE_STATUS_TEXT`, `EXPIRED_STATUS_TEXT`, `LIMITED_STATUS_TEXT`,
`DISABLED_STATUS_TEXT`, `ONHOLD_STATUS_TEXT`.

## Troubleshooting delivery

```bash
sudo zagros logs | grep -i notify
```

Look for the retry lines: three attempts, three minutes apart, is the default
behaviour — not a stuck queue. If a webhook never arrives, check that your
endpoint answers with a 2xx: anything else counts as a failed delivery.

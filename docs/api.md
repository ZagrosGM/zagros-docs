# REST API

Everything the dashboard does, the API does. It is the supported way to
integrate Zagros with your own billing, bot or provisioning scripts.

## Authentication

```bash
TOKEN=$(curl -s -X POST https://panel.example.com/api/admin/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=YOUR_ADMIN&password=YOUR_PASSWORD' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

curl -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/system
```

The token is a JWT with the lifetime set by
`JWT_ACCESS_TOKEN_EXPIRE_MINUTES`. When it expires you get a `401` — request a
new one.

## Three surfaces

| Surface | Prefix | Auth | What it is |
|---|---|---|---|
| Admin (legacy-compatible) | `/api/…` | admin token | Users, admins, system stats, inbounds, user templates. |
| Zagros admin | `/api/zagros/…` | **sudo** token | Nodes, cores, portal settings, certificates, subscription templates, presence, dashboard snapshot. |
| Subscription | `/sub/<token>` | the token itself, no login | What clients and browsers fetch — see [Subscriptions](./subscriptions.md). |

Most of `/api/zagros/*` is sudo-only by design: it changes how the panel is
deployed, not just which users exist. A normal admin gets `403` there.

## Commonly used endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/system` | Version, user counts, online count, bandwidth |
| `POST` | `/api/user` | Create a user |
| `GET` | `/api/user/{username}` | One user, including `subscription_url` and `links` |
| `PUT` | `/api/user/{username}` | Modify a user |
| `DELETE` | `/api/user/{username}` | Delete a user |
| `POST` | `/api/user/{username}/revoke_sub` | Rotate the subscription token |
| `GET` | `/api/zagros/nodes` | Nodes and their status |
| `GET` | `/api/zagros/cores` | Core states, versions and health |
| `GET`/`PUT` | `/api/zagros/settings/portal` | Portal and subscription settings |
| `GET` | `/api/zagros/users/online` | Per-user presence states **and** their counts |
| `GET` | `/api/zagros/subscription/templates` | Uploaded subscription page templates |
| `GET` | `/api/zagros/certificates` | The managed certificate store |

Interactive OpenAPI documentation can be enabled with `DOCS=true` (see
[Configuration](./configuration.md)) — leave it off in production.

## Worked example — create a user and hand out the link

```bash
# 1. create
curl -s -X POST https://panel.example.com/api/user \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
        "username": "alice",
        "status": "active",
        "proxies": {"shadowsocks": {}},
        "inbounds": {"shadowsocks": ["Shadowsocks TCP"]}
      }'

# 2. read back the subscription URL
curl -s -H "Authorization: Bearer $TOKEN" \
  https://panel.example.com/api/user/alice \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["subscription_url"])'
```

## Worked example — presence

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://panel.example.com/api/zagros/users/online
```

```json
{
  "states": {"alice": "online", "bob": "offline"},
  "counts": {"online": 1, "offline": 1, "unknown": 0},
  "collect_ts": 1788100766.1,
  "failed_cores": [],
  "probed_cores": 2,
  "window_seconds": 90
}
```

`counts` is the aggregate of `states`, so a dashboard tile can never disagree
with the per-user dots. `unknown` means a core's read failed — **not** that the
user is offline.

## Errors

| Code | Meaning |
|---|---|
| `401` | Missing/expired token — get a new one. |
| `403` | Authenticated but not allowed (for example, a non-sudo admin on `/api/zagros/*`, or asking for another admin's user). |
| `404` | No such object — deliberately indistinguishable cases (a wrong subscription path and a bad token both return this). |
| `422` | Validation failed; the response names the field. |
| `503` | The admin authentication stack is not available — the panel is still starting, or its database is unreachable. |

::: tip
Prefer the API over editing the database directly. The database holds derived
state (accounts pushed to cores, digests, baselines) that a direct write will
leave stale.
:::

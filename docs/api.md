# REST API

Zagros exposes two authenticated HTTP surfaces plus the public subscription and
client-login surfaces. This page is the integration contract for billing
systems, shops, bots and provisioning scripts.

## Base URL and authentication

Use the panel origin as the base URL; do **not** append `/api` when saving the
panel in an integration. For example: `https://panel.example.com`.

Obtain an admin token with form data:

```bash
TOKEN=$(curl -fsS -X POST https://panel.example.com/api/admin/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=YOUR_ADMIN' \
  --data-urlencode 'password=YOUR_PASSWORD' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
```

Every authenticated request then carries:

```http
Authorization: Bearer <access_token>
```

The response to a successful login contains `access_token` and
`token_type: "bearer"`. The JWT lifetime is
`JWT_ACCESS_TOKEN_EXPIRE_MINUTES`; request a new token after a `401`.
Operations on nodes, cores, deployment, backup, certificates and most
`/api/zagros/*` routes require a **sudo admin**. Ordinary admins can operate
only on users they own.

## API surfaces

| Surface | Path | Authentication | Purpose |
|---|---|---|---|
| Marzban-compatible admin | `/api/*` | admin JWT; some operations require sudo | Admins, users, Xray inbounds, system stats and compatibility nodes |
| Native Zagros admin | `/api/zagros/*` | normally sudo JWT | Multi-core, native nodes, portal, routing, backups, security and support |
| Subscription | `/<subscription_path>/<token>` | subscription token | Browser portal and client configuration delivery |
| App client | `/client/v1/*` | app credentials/access token | Login-mode profile and sealed core configuration delivery |

JSON requests use `Content-Type: application/json`. Login uses form data;
file/certificate/template/support uploads use `multipart/form-data`.
Byte fields are integer bytes, traffic-speed limits are integer Mbps, and
legacy `expire` values are Unix seconds (`0`/`null` means no expiry).
Timestamps in responses are ISO-8601 UTC strings.

## MirzaBot compatibility

### How to add Zagros

In MirzaBot, add the panel through its **Marzban/current API** path:

* URL: the Zagros panel origin, with no trailing `/api`;
* API generation: current/`version_panel = 2` (uses `proxies`, `inbounds` and
  Unix expiry values);
* credentials: a sudo admin if MirzaBot's node-management screens will be
  used; an ordinary admin is sufficient for that admin's users only;
* protocols/inbounds: copy the values returned by `GET /api/inbounds`.

No MirzaBot-specific header or Zagros plugin is required.

### Audited MirzaBot calls

The following is the complete set of calls made by `Marzban.php` in the
audited MirzaBot source. All are implemented by Zagros v1.0.4.

| Mirza operation | Method and exact path | Zagros response |
|---|---|---|
| Login | `POST /api/admin/token` | `{access_token, token_type}` |
| System totals | `GET /api/system` | system/user/traffic counters |
| List inbounds | `GET /api/inbounds` | protocol-keyed inbound arrays |
| Create user | `POST /api/user` | user object |
| Read user | `GET /api/user/{username}` | user object, links and public subscription URL |
| List users | `GET /api/users?status={status}` | `{users: [...], total}` |
| Modify user | `PUT /api/user/{username}` | updated user object |
| Delete user | `DELETE /api/user/{username}` | success detail |
| Reset user traffic | `POST /api/user/{username}/reset` | updated user object |
| Revoke subscription | `POST /api/user/{username}/revoke_sub` | updated user object with a new URL/credentials |
| Last subscription fetch (old Mirza profile) | `GET /api/user/{username}/sub_update?offset=0&limit=1` | `{updates: [{created_at, user_agent}], total}`; at most one latest snapshot |
| List nodes | `GET /api/nodes` | a direct JSON array |
| Read node | `GET /api/node/{id}` | Marzban-shaped native node object |
| Node traffic | `GET /api/nodes/usage` | `{usages: [...]}` |
| Modify node | `PUT /api/node/{id}` | updated node object |
| Reconnect node | `POST /api/node/{id}/reconnect` | success detail and node |
| Delete node | `DELETE /api/node/{id}` | `{}` |

Zagros does not restore Marzban's retired Xray-only node transport. These node
routes are compatibility aliases over Zagros' certificate-pinned native node
service and durable usage journal.

## User contract

### Create: `POST /api/user`

The smallest Xray example is:

```bash
curl -fsS -X POST https://panel.example.com/api/user \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "alice",
    "status": "active",
    "proxies": {"vless": {}},
    "inbounds": {"vless": ["VLESS TCP REALITY"]},
    "data_limit": 10737418240,
    "expire": 1798761600,
    "ip_limit": 1,
    "device_limit": 1
  }'
```

| Field | Type and rules | Meaning |
|---|---|---|
| `username` | string, 3–32 characters | Account identifier. Letters, digits, `_`, `-`, `@` and `.` are accepted. |
| `status` | `active` or `on_hold` | Create state. Omit for normal active creation. `on_hold` requires `on_hold_expire_duration` and no fixed expiry. |
| `proxies` | object | Xray protocol settings: `vmess`, `vless`, `trojan`, `shadowsocks`. `{}` settings generate credentials. |
| `inbounds` | object of protocol → tag array | Xray inbound selection. Omitted protocol tags default to all enabled inbounds for that selected proxy. |
| `core_access` | object of core id → inbound-tag array | Optional explicit multi-core grants. Omit for the panel's API-default policy; an explicit `{}` means no extra grants. |
| `expire` | integer Unix seconds, `0` or `null` | Expiry; zero/null is unlimited. |
| `data_limit` | integer bytes ≥ 0 | Total quota; zero/null is unlimited. |
| `data_limit_reset_strategy` | `no_reset`, `day`, `week`, `month`, `year` | Automatic quota reset schedule. |
| `ip_limit` | integer ≥ 0 | Maximum simultaneously observed source IPs across all cores/nodes; zero/null is unlimited. See [IP-limit semantics](#ip-limit-semantics). |
| `device_limit` | integer ≥ 0 | Maximum stable subscription-device enrollments; zero/null is unlimited. A positive value strictly requires `X-Device-ID` or `X-HWID`. See [Device/HWID semantics](#devicehwid-semantics). |
| `download_limit_mbps`, `upload_limit_mbps` | strict integer 0–100000 | Aggregate shaping limits; zero is unlimited. Numeric strings/fractions are rejected. |
| `note` | string up to 500 characters | Operator note. |
| `on_hold_expire_duration` | integer seconds | Duration that starts on first use for an on-hold account. |
| `on_hold_timeout` | ISO timestamp or null | Optional hold timeout metadata. |
| `next_plan` | object or null | `{data_limit, expire, add_remaining_traffic, fire_on_either}`. |

A new user needs at least one Xray proxy or one non-empty `core_access` grant.

### Read/list

* `GET /api/user/{username}` returns one user.
* `GET /api/users` returns `{users, total}` and accepts `offset`, `limit`,
  repeated `username`, `search`, repeated `admin` (sudo only), `status`, and
  comma-separated `sort` parameters.

Important response fields are:

```json
{
  "username": "alice",
  "status": "active",
  "used_traffic": 12345,
  "lifetime_used_traffic": 12345,
  "data_limit": 10737418240,
  "expire": 1798761600,
  "ip_limit": 1,
  "device_limit": 1,
  "proxies": {"vless": {"id": "...", "flow": ""}},
  "inbounds": {"vless": ["VLESS TCP REALITY"]},
  "core_access": {"sing-box": ["hy2-main"]},
  "links": ["vless://..."],
  "subscription_url": "https://sub.example.com/sub/test/<token>",
  "online_at": "2026-09-05T12:30:00Z",
  "sub_updated_at": "2026-09-05T12:29:00+00:00",
  "sub_last_user_agent": "v2rayNG/1.9"
}
```

`subscription_url` is already absolute when a public subscription origin is
configured. A bot must use it as returned rather than prefixing the panel URL.

### Modify and lifecycle

`PUT /api/user/{username}` is a partial update: omitted/null fields keep their
current values. Writable status values are `active`, `disabled`, and `on_hold`;
`limited` and `expired` are derived by Zagros. Explicit `core_access` replaces
the requested grants; omission keeps them.

| Method | Path | Result |
|---|---|---|
| `POST` | `/api/user/{username}/reset` | Reset current traffic and return the user |
| `POST` | `/api/user/{username}/revoke_sub` | Rotate subscription and Xray credentials; old links stop working |
| `GET` | `/api/user/{username}/usage?start=&end=` | Per-node traffic rows |
| `POST` | `/api/user/{username}/active-next` | Activate and consume `next_plan` |
| `PUT` | `/api/user/{username}/set-owner?admin_username=...` | Change owner; sudo only |
| `DELETE` | `/api/user/{username}` | Permanently remove user and all core accounts |
| `POST` | `/api/users/reset` | Reset every user's current traffic; sudo only |
| `GET` | `/api/users/usage?start=&end=` | Aggregate user/node traffic |
| `GET`/`DELETE` | `/api/users/expired` | List or delete users in an expiry range |

### IP-limit semantics

`ip_limit` is the cross-core online source-IP ceiling. Zagros unions exact,
authenticated account/IP observations from the local cores and native nodes;
the same IP using Xray and Hysteria2 still counts once for that user.

When a new address exceeds the ceiling, Zagros:

1. keeps the user and every account active;
2. chooses the newest overflow address, adds a timed nftables ban for that
   source on **managed VPN inbound ports only**, and closes its active tracked
   connections/conntrack entries;
3. applies the same address ban to every local core and paired native node;
4. removes the ban automatically when it expires.

The default detection interval is 5 seconds and the default ban duration is 15
minutes. Sudo admins can read/change both at `GET /api/zagros/security` and
`PUT /api/zagros/security/ip-limit`:

```json
{"ban_duration_minutes": 15, "review_interval_seconds": 5}
```

The dashboard and subscription HTTP service are deliberately outside the
firewall port sets, so a blocked client can still open its subscription page.
Active/history rows are available at
`GET /api/zagros/security/ip-bans?active_only=true`; a sudo admin can end one
with `DELETE /api/zagros/security/ip-bans/{id}` (it will be created again on a
later pass if the source is still an overflow address).

IP counting has unavoidable network limits: devices behind one public NAT IP
collapse to one identity, and a reverse proxy that hides the client source
prevents the core from distinguishing addresses. An IP-blind core may prove
online presence but does not contribute a fabricated address to `ip_limit`.

### Device/HWID semantics

`device_limit` is independent from online IPs. If it is positive, every
subscription portal/feed request and every official Client API delivery path
must send one stable identifier in either header:

```http
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
```

or

```http
X-HWID: 550e8400-e29b-41d4-a716-446655440000
```

The first `device_limit` distinct values enroll; a new value receives HTTP
`403` and no subscription/config data. Requests with no stable-ID header also
receive `403`. IP and User-Agent are never fallback HWIDs. Zagros stores an
HMAC-SHA-256 digest, a short display hint, timestamps, and the last User-Agent —
not the raw identifier.

Sudo management endpoints are:

* `GET /api/zagros/users/by-username/{username}/devices`
* `DELETE /api/zagros/users/by-username/{username}/devices/{device_id}`
* `DELETE /api/zagros/users/by-username/{username}/devices` (clear all)

This controls retrieval/enrollment, not already exported secrets: a user can
still manually copy a downloaded VPN configuration to another machine. The
official app should generate and securely persist one random ID per install.

## Mirza-compatible native node contract

The list endpoint returns an array, not the native `{nodes: [...]}` wrapper:

```json
[
  {
    "id": 7,
    "name": "Riga",
    "address": "203.0.113.7",
    "port": 62050,
    "api_port": 62051,
    "usage_coefficient": 1.25,
    "status": "connected",
    "message": null,
    "xray_version": "26.3.27",
    "agent_type": "zagros_native",
    "agent_version": "1.0.4",
    "last_seen": "2026-09-05T12:00:00+00:00"
  }
]
```

`PUT /api/node/{id}` accepts `name`, `address`, `port`, `api_port`,
`usage_coefficient`, and `add_as_new_host`. Native pairing/health owns
`status`, so attempts to set it return `422`. `message` is the native
`last_error`; `xray_version` comes from the last known native core inventory.

`GET /api/nodes/usage?start=<ISO>&end=<ISO>` returns:

```json
{
  "usages": [
    {"node_id": 7, "node_name": "Riga", "uplink": 1000, "downlink": 9000}
  ]
}
```

The values are bytes from Zagros' journal after the node's usage coefficient.
Omitting dates uses the legacy default range.

## Native Zagros endpoint map

The native API is larger than the Mirza compatibility layer. The generated
OpenAPI document is the field-level authority (`DOCS=true` exposes `/docs` and
`/openapi.json`); the complete family map is:

| Family | Endpoints |
|---|---|
| Cores | `GET /api/zagros/cores`, `/cores/registry`, `/cores/capability-matrix`, `/cores/traffic/totals`, `/cores/{core_id}`, `/cores/{core_id}/versions`, `/cores/{core_id}/logs`; lifecycle `POST .../install`, `uninstall`, `reinstall`, `start`, `stop`, `restart`, `enable`, `disable`, `update` |
| Inbounds/config studio | `GET /api/zagros/inbounds`; `/studio/{core_id}/raw`; wizard schema/suggest-port; preview/apply and wizard inbound create/update/delete/preview routes |
| Routing/outbounds | `/api/zagros/routing/sources`, `targets`, `rules`, `preview`, `deploy`, `runtime`; `/outbounds`, `/outbounds/schema`, `/outbounds/test`, `/outbounds/export`, `/outbounds/deploy`; share-URL/WireGuard parsers |
| Native nodes | CRUD at `/api/zagros/nodes`; installer, discover, pair, reconnect, heartbeat, sync; node core inventory/settings/lifecycle/versions/logs |
| Portal/subscriptions | `/api/zagros/settings/portal`; token/URL issue routes under `/users`; template list/upload/preview/starter/activate/delete |
| Presence/devices/sessions | `/api/zagros/users/online`, `/sessions`, `/devices`, `/client-sessions` plus revoke/delete routes |
| Certificates/network | `/api/zagros/certificates` including import, self-signed and ACME; `/settings/panel-network` test/save/apply/status |
| Users/operations | `/api/zagros/users/bulk-create`, `/users/delete-by-status`, dashboard snapshot and legacy migration |
| Backup/restore | `/api/zagros/backup/artifacts`, `/backup/create`, `/backup/service`; `/restore/upload`, `/restore/inspect`, `/restore/apply` |
| Security | `/api/zagros/security`, `/security/credentials`, `/security/sessions`, `/security/token-lifetime` |
| Support | `/api/zagros/support/config`, `/support/test`, `/support/ticket` |
| Advanced API defaults | `GET/PUT /api/zagros/settings/api-defaults` controls grants only when a create request omits `core_access`; the General-settings card is intentionally not exposed |

## Subscription paths

A configured path may contain safe slash-separated segments, for example
`sub/test`. The complete path is 1–32 characters; every segment starts with a
lowercase letter/digit and then uses lowercase letters, digits, `.`, `_`, or
`-`. Empty segments, `.`/`..`, and reserved first segments such as `api`,
`dashboard`, `statics`, `client`, `docs`, `redoc`, `openapi`, `favicon`, and
`health` are rejected.

The canonical URL is `/<configured-path>/<token>`. Stable compatibility aliases
`/sub/<token>` and `/zagros/sub/<token>` remain available. Changing one custom
path to another does **not** preserve the previous custom path.

## Errors

FastAPI errors use `{"detail": ...}` (validation errors use a detail array).

| Code | Meaning |
|---|---|
| `400` | Invalid operation or core-specific request |
| `401` | Missing, invalid or expired token |
| `403` | Authenticated but not allowed |
| `404` | Object/route not found; wrong subscription path and token are deliberately indistinguishable |
| `409` | Conflict, duplicate object or unsafe node transition |
| `413` | Upload exceeds the endpoint limit (support attachments are at most 10 MB) |
| `422` | Request schema/field validation failed |
| `502` | A node/core/upstream service rejected the operation |
| `503` | Required runtime/database/authentication service is unavailable |

::: tip
Prefer the API to direct database writes. Zagros also owns projections,
per-core accounts, sealed credentials, usage baselines and node state; a direct
SQL update leaves those derived states stale.
:::

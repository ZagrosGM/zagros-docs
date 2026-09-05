# Users

A user is one subscription: one link, one quota, one expiry, and an account on
every core assigned to them.

## Creating one

| Field | Notes |
|---|---|
| Username | 3–32 characters: letters, digits, `_`, `-`, `@`, `.`. |
| Proxies / inbounds | Which protocols and inbound tags this user gets. |
| Data limit | Total bytes, or unlimited. |
| Expiry | A date, or never. |
| IP limit | Maximum simultaneous source IPs across every core (`0` = unlimited). |
| Device limit / HWID | Maximum stable IDs allowed to retrieve the subscription (`0` = unlimited). |
| Status | `active` by default; creation also accepts `on_hold`. |

**Templates** store reusable inbound sets and limits.

**Users created by a bot or shop** (Mirza and other Marzban-style clients)
usually name only Xray proxies. When such a request omits `core_access`, the
panel applies its API-default policy. The General-settings card was removed in
v1.0.4; advanced operators can use
`GET/PUT /api/zagros/settings/api-defaults`. See the
[MirzaBot contract](./api.md#mirzabot-compatibility).

## Statuses

| Status | Meaning | Who sets it |
|---|---|---|
| `active` | Serving normally. | you |
| `disabled` | Turned off by hand. | you |
| `on_hold` | Created but not started (or paused). | you |
| `limited` | Out of traffic quota. | Zagros |
| `expired` | Past the expiry date. | Zagros |

IP overflow does **not** change status or suspend the account. Only the newest
overflow source is temporarily blocked.

## IP limit

`ip_limit` unions authenticated source IP observations from every local core
and paired native node. With a limit of `1`, the first active address remains
connected. A newer second address is blocked on every managed VPN inbound and
its active connections are closed. The default review interval is 5 seconds;
the default ban is 15 minutes and is configurable in **Settings → Security**.
It is removed automatically after expiry.

The firewall targets VPN listener ports only. Dashboard and subscription HTTP
remain reachable. NAT can collapse several devices into one public IP, and a
reverse proxy that hides source addresses prevents accurate counting.

## Device limit / HWID

`device_limit` controls subscription retrieval, independently of IPs. A
positive value makes `X-Device-ID` or `X-HWID` mandatory on subscription and
official Client API delivery requests. The first N stable IDs enroll; a new ID
gets HTTP 403. IP and User-Agent are never treated as a device ID.

The user editor lists enrolled device hints and lets an administrator remove
one or clear all. Zagros stores only a keyed digest, not the raw ID.

This cannot retract a configuration already exported and manually copied; it
limits future subscription/config delivery.

## Usage and reset

Usage is collected from every core and node and applied to one user quota. You
can reset current consumption at any time.

## Presence

A user is **online** when at least one core or node reports a live session.
An IP-blind core may prove presence without contributing a fabricated address
to `ip_limit`. If a core read fails, presence is unknown rather than offline.

## Subscription link

Each user has one link, copied from the user page. Revoking rotates the token
immediately. Multi-segment paths such as `sub/test` are supported. When Device
limit is active, clients fetching that link must send their stable-ID header.

See the [exact API semantics](./api.md#ip-limit-semantics).

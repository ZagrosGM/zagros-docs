# Users

A user is one subscription: one link, one quota, one expiry, and an account on
every core assigned to them.

## Creating one

| Field | Notes |
|---|---|
| Username | 3–32 characters: `a-z`, `0-9` and `_`. |
| Proxies / inbounds | Which protocols and which inbound tags this user gets. |
| Data limit | Total bytes, or unlimited. |
| Expiry | A date, or never. |
| Device limit | How many devices may be online at once (`0` = unlimited). |
| Status | `active` by default; you can create a user already `on_hold` or `disabled`. |

**Templates** (user templates) store a reusable set of inbounds and limits, so
creating the next user is one pick instead of ten fields.

**Users created by a bot or shop** (Mirza and other Marzban-style clients) do
not choose cores — their request only names xray proxies. Which other cores
such a user receives is set once, under *Settings → General → API defaults
(bots & shops)*: every enabled core (the default), xray only, or a fixed
selection. See [REST API](./api.md#bots-written-for-marzban--which-cores-a-user-gets).

## Statuses

| Status | Meaning | Who sets it |
|---|---|---|
| `active` | Serving normally. | you |
| `disabled` | Turned off by hand — no configuration material is issued. | you |
| `on_hold` | Created but not started (or paused) — the account exists, nothing is served. | you |
| `limited` | Out of quota **or** over the device limit. | Zagros |
| `expired` | Past the expiry date. | Zagros |

A user is reviewed every 10 seconds, so quota and expiry take effect within
seconds of being crossed — no manual sweep.

::: warning
`limited` is overloaded on purpose: running out of data and connecting too many
devices end in the same state, because both mean "this user cannot be served
right now". The reason is shown on the user's page.
:::

## Device limit

The count is the **union of every core's view**, not a per-protocol count:

* cores that see client IPs (WireGuard, OpenVPN, SoftEther, …) contribute their
  distinct IPs — one phone running three protocols from the same address is
  **one** device;
* cores that can only answer "is this account online" (Xray's stats API has no
  per-user IP table) contribute **one presence per online account** — an honest
  lower bound, never an invented number.

When the union exceeds the limit, the excess device is rejected the only way a
VPN platform can: the user is suspended until the count drops back. Only users
Zagros itself limited are revived automatically — a user who is also out of
quota, expired, or disabled by hand stays suspended.

## Usage and reset

Usage is collected from every core and every node (every 10s for users, 30s for
nodes) and applied to the quota. You can reset a user's consumption at any time.

## Presence (the *online* flag)

A user is **online** when at least one core or node reported a live session in
the last pass. Two honest caveats:

* For cores without per-IP session data, "online" means *counters grew since the
  previous sample* — an idle-but-connected client is not counted.
* When a core's read fails, presence is **unknown**, not *offline*: absence of
  evidence is not evidence of absence. The dashboard shows this explicitly.

## Subscription link

Each user has one link, copied from the user's page. Revoking rotates the token
immediately: every previously issued URL stops working, including ones already
delivered.

A user can override the panel-wide client auth mode — useful when one user
should use application login while everyone else uses links.

## Automatic deletion

With `USERS_AUTODELETE_DAYS` set, users are deleted that many days after
expiry (`-1` disables it). Include users who merely ran out of quota with
`USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS=true`.

::: tip
Deletion is forever and takes no backup of its own. Take one with
`zagros backup` before enabling it.
:::

# Introduction

Zagros is a control panel for VPN cores. It installs them, writes their
configuration, meters their traffic, and hands each user one subscription link
that works everywhere.

Unlike a single-protocol panel, Zagros treats every protocol as a **core** with
its own driver. The panel does not care whether a user arrives over VLESS,
WireGuard or an OpenVPN file: it provisions an account on whichever cores the
user is assigned to, and the subscription link presents whatever those cores
produced.

## The pieces

| Piece | What it is |
|---|---|
| **Panel** | A FastAPI service with a React dashboard. It owns the database, the API, the scheduled jobs and the local cores. |
| **Core** | One VPN protocol engine with a driver: Xray, sing-box, OpenVPN, WireGuard, SSH, SoftEther or PPTP. Cores run either on the panel host or on a node. |
| **Node** | Another server running the `zagros-node` agent. It runs cores locally and takes orders from the panel over a signed, certificate-pinned HTTPS control plane. |
| **Subscription** | One URL per user. Clients fetch configuration material from it; browsers get a portal page. |
| **Portal settings** | How that URL is shaped: public domain, scheme, port, subscription path, TLS certificate, and the page template. |

## How a user is served

1. You create a user and assign inbounds (or a template).
2. Zagros provisions an account on every core and inbound involved — on the
   panel host, and on every node that carries those cores.
3. The user receives one subscription URL, `/sub/<token>` by default.
4. When a client fetches it, Zagros returns the format that client understands
   (raw links, Clash Meta, sing-box). When a browser opens it, they get the
   portal page.
5. Usage, presence and source-IP observations come back from cores and nodes
   into the same pipelines: quota, IP limits, and the *online* indicator.
   Device/HWID enrollment is separate and happens when a subscription is
   retrieved.

## What changes when you add a node

A node is not a special case. It receives:

* **server identity** — the panel's CA, server keys and IPsec PSK, so a config
  pointing at the node keeps authenticating the same server;
* **accounts** — Xray through the configuration document, every other core
  through an explicit signed push;
* **bandwidth limits** — shaping is host-local, so the panel sends each node
  the decision its own limiter would have made;
* **collected telemetry** — online sessions and per-account usage deltas.

The node reports back to two ports:

| Port | Purpose |
|---|---|
| `62051` | Bootstrap/info: node id, certificate and its SHA-256 pin. |
| `62050` | Signed HTTPS control plane for everything else. |

Pairing is certificate-pinned: the installer prints the fingerprint, you
confirm it in the dashboard, and the panel trusts that node's certificate from
then on.

## Scheduled jobs

Everything that must stay true over time is a job, not a manual step:

| Job | Interval | Keeps true |
|---|---|---|
| Node accounts sync | 30s | every node has the current account list |
| Node reconnect | 45s | unpaired nodes finish pairing; failing nodes back off |
| Bandwidth sync | 60s | pushed limits match the panel's decisions |
| IP limits | 5s default | cross-core source-IP detection, timed VPN-port bans and unified online presence |
| Device/HWID limits | request-time | strict subscription enrollment with `X-Device-ID` / `X-HWID` |
| Core health check | 10s | a core that died is reported, and restarted where that is safe |
| Review users | 10s | expiry, quota and status transitions |

## Where to go next

* [Installation](./installation.md) — install the panel.
* [Configuration](./configuration.md) — every environment variable.
* [Command line](./cli.md) — what you can do from the host.
* [Nodes](./nodes.md) — add servers and serve traffic elsewhere.
* [Subscriptions](./subscriptions.md) — links, formats and the portal page.

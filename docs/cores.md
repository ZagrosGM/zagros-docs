# Cores

A **core** is one protocol engine with its own driver. Zagros ships seven:

| Core | Typical material |
|---|---|
| `xray` | VLESS, VMess, Trojan, Shadowsocks |
| `singbox` | Hysteria2, TUIC, and the sing-box protocol set |
| `openvpn` | `.ovpn` files |
| `wireguard` | `.conf` files and QR codes |
| `ssh` | SSH accounts |
| `softether` | SoftEther VPN |
| `pptp` | PPTP/L2TP (via the pinned accel-ppp build) |

The panel never hard-codes a protocol list anywhere else: inbounds, templates,
subscription formats and the dashboard all read what the drivers advertise.

## Capabilities

Drivers declare what they can do, and the interface follows — a control you
cannot use is not shown, and calling an unsupported operation raises a typed
error instead of failing later.

| Capability | Meaning |
|---|---|
| `USER_MANAGEMENT` | Create/update/delete accounts. |
| `SUSPEND_RESUME` | Cheap suspend without re-provisioning. |
| `USAGE_ACCOUNTING` | Per-account traffic counters. |
| `ONLINE_TRACKING` | Live sessions / online devices. |
| `HOT_RELOAD` | Apply configuration without a full restart. |
| `SERVICE_CONTROL` | Panel-controlled start/stop. |

## Installing and running a core

From the host:

```bash
sudo zagros cores                        # what is installed, and its state
sudo zagros cores install singbox
sudo zagros cores reload wireguard
sudo zagros cores uninstall pptp --purge
```

Or in the dashboard under **Cores**: install, start, stop, reload, open live
logs, and open its settings.

## Changing the version

Any core whose driver discovers releases from its own upstream repository can
be pinned to a **published release — higher or lower — or to a tag you type by
hand**. The installed release is marked in the list, and applying a change
keeps settings, data and accounts.

```bash
sudo zagros cores update xray --version v26.6.1
```

Cores that the operating system installs instead (rather than the panel) say so
in the interface instead of offering an empty picker.

## Inbounds

Cores expose **inbounds** — named entry points (a port with a protocol and
settings). Users are assigned to inbounds, and inbounds are what the
subscription material is built from.

* The inbound catalogue is shared by the panel and by every node, so the same
  inbound names mean the same thing everywhere.
* Hosts (the addresses a config points at) are managed per inbound; adding a
  node can add its address as a host automatically.
* An inbound can be enabled or disabled without deleting it, so stopping
  traffic through it never destroys configuration.

## Where cores run

| Location | Managed from | Notes |
|---|---|---|
| Panel host | **Cores** tab | The master's own cores. |
| A node | node → **Cores** tab | Identical layout; configured by sync. |

A node's core card deliberately offers no per-core *settings* or *update*: a
node is configured by sync, not by hand.

## Health

A core health check runs every 10 seconds. A core that died is reported (and
restarted where that is safe), and a core that is degraded says so on its card
instead of pretending to be healthy. Cores that fail to start surface their
logs in the same card — no SSH required.

::: tip
If a user's link does not work while the panel says everything is fine, check
the core's own state first: *running* is not the same as *serving*, and a core
that cannot bind its port reports it in the card.
:::

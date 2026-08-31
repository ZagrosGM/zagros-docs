# Nodes

A node is another server that runs cores for you. Traffic reaches users
directly through the node; the panel stays the place you configure, meter and
audit them.

## Ports

| Port | Direction | Purpose |
|---|---|---|
| `62050` | panel → node | Signed HTTPS control plane: configuration, accounts, limits, telemetry. |
| `62051` | panel → node | Bootstrap/info: node id, certificate and its SHA-256 pin. |

Both must be reachable **from the panel**. Nothing needs to reach the panel
from the node during normal operation.

## Add a node

1. **Nodes → Add node** in the dashboard. Give it a name, its public address,
   and (optionally) change the ports.
2. The panel returns a one-line installer command:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/ZagrosGM/zagros-scripts/<ref>/install-node.sh \
     | bash -s -- --panel-id <panel-id> --token <token> \
              --name <node-name> --address <node-address> \
              --port 62050 --api-port 62051
   ```

   The `<ref>` is the `zagros-scripts` tag matching your panel version, so a
   node installed a year from now runs the installer that shipped with it.
3. **Run it as root on the node server.** It installs Docker if needed, pulls
   the `zagros-node` image and starts the agent.
4. The installer prints a **TLS fingerprint**. Confirm it in the dashboard to
   finish pairing — this is certificate pinning, not a password.

::: warning
The registration token is single-use and is not shown again. If you lose it
before the node pairs, rotate it in the dashboard and run the new command.
:::

### If you do not confirm in time

Nothing is lost. A node that was added but not yet paired is re-checked every
**45 seconds**: the agent is discovered on its info port and paired with the
token automatically. There is also a **reconnect** button on every node card
for when waiting is not what you want, and pairing is re-proved after every
panel restart.

## What the node receives

| Pushed to the node | Why |
|---|---|
| Server identity (CA, server keys, IPsec PSK) | A config whose address points at the node keeps authenticating the same server instead of being handed a different PKI per node. |
| Accounts | Xray through the configuration document; every other core through an explicit signed push. |
| Bandwidth limits | Shaping is host-local (`tc`/`nft` only affect the machine carrying the packets), so the panel sends each node the decision its own limiter would have made. |
| Core configuration | Settings, inbounds and lifecycle are converged on install, on change, and at boot. |

## What the node reports

| Reported | Used for |
|---|---|
| Online sessions (`/v1/runtime/devices`) | Presence, device counts and the unified *online* flag. |
| Usage deltas (`/v1/runtime/usage`) | Quota, with the node's `usage_coefficient` applied and durable baselines so an agent restart cannot re-emit a whole cumulative counter. |
| Heartbeat + resource metrics | The node card: reachability, CPU, memory, uptime. |

## Cores on a node

Each node has its own **Cores** tab, laid out exactly like the master's:

* install, start, stop and reload a core;
* **change version** — pick a published release (higher or lower) or pin a tag;
  applying it keeps settings, data and accounts;
* live logs.

A node is configured by sync, not by hand — which is why a node's core card
offers no per-core *settings* or *update* buttons of its own.

## Health, backoff and failure

Healthy nodes are heartbeated sparingly (every 8th sweep). A failing node backs
off — 45s → 90s → 3m → 5m — so a down server is not hammered.

Two failures look similar but are not, and the dashboard says so:

| Situation | What the panel tells you |
|---|---|
| Heartbeat fails | Reconnect — the pairing is still valid. |
| The agent was reinstalled | The token must be **rotated**, because the old one is spent. |

## Removing a node

Delete it from the dashboard. The panel refuses to delete a **live** node
without revoking it first: an accepted signing key on a server nobody manages
any more is a liability. Revoke, then delete.

## Verifying a node really serves traffic

The only test that matters is traffic through it:

```bash
# an ss:// or vless:// link from the user's subscription, then:
curl --socks5 127.0.0.1:1080 https://api.ipify.org
```

The answer must be the **node's** IP, not the panel's. If a user on a node is
shown as offline or consumes no quota, the node's telemetry is not arriving —
check reachability of `62050` first.

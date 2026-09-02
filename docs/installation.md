# Installation

## Requirements

| Requirement | Notes |
|---|---|
| A Linux server | `x86_64`, with `root` or `sudo`. |
| Docker Engine + Docker Compose v2 | The installer offers to install them if missing. |
| Disk | Cores and their data live under `/var/lib/zagros`; a few GB is plenty. |
| Open ports | See the table below. |

| Port | Used by | Needed when |
|---|---|---|
| `8000` | Panel (HTTP) and the dashboard | always (configurable) |
| `80` | Certificate issuance (HTTP-01) and the subscription listener | you want ACME certificates or a dedicated subscription listener |
| `443` | Panel behind TLS, subscription listener | you want TLS |
| `62050` | Node control plane (signed HTTPS) | **on nodes**, reachable from the panel |
| `62051` | Node bootstrap/info | **on nodes**, reachable from the panel |

## One command

```bash
sudo bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/ZagrosGM/zagros-scripts/main/zagros.sh)" \
  -- install
```

Options:

| Option | Effect |
|---|---|
| `--database sqlite\|mysql\|mariadb\|postgresql` | pick the database backend (default: SQLite) |
| `--version <tag>` | pin one release instead of the floating `latest` image tag |

Without `--version` the panel runs the `latest` image tag, which every
**stable** release moves forward — so `sudo zagros update` follows releases
without any pinning. `zagros status` and `zagros version` always show which
release `latest` currently is on your host.

The bootstrap is deliberately thin: it fetches the management CLI that matches
the requested ref and hands over to it, so what you install is always the CLI
belonging to that release.

## What you end up with

| Path | Contents |
|---|---|
| `/opt/zagros/` | `docker-compose.yml` and `.env` — the deployment |
| `/var/lib/zagros/` | database, cores, certificates, keys, logs and backups |
| `/usr/local/bin/zagros` | the host management CLI |

::: tip
`.env` is the single source of truth for the deployment. Edit it with
`zagros env edit` — it is read by compose on every `up`.
:::

## First login

The installer prints the first sudo admin's credentials. If you missed them:

```bash
sudo zagros advanced create-admin
```

Then open `http://<your-server>:8000/dashboard/`. From here, the
[configuration](./configuration.md) page explains every variable, and
[nodes](./nodes.md) how to add more servers.

## Updating

```bash
sudo zagros update                      # follow the floating latest tag (stable releases)
sudo zagros update --version v1.0.0     # pin one release
```

`update` is not `docker compose pull`. It takes a backup first, pulls the new
image, runs migrations, and health-checks the result — **rolling back
automatically if the panel does not come back healthy**. To go back by hand:

```bash
sudo zagros advanced rollback            # previous version
sudo zagros advanced rollback --to
```

## Checking the result

```bash
sudo zagros status      # services, image, health and the core table
sudo zagros doctor      # full report: docker, db, cores, ports, dns, registry
sudo zagros health      # one-line composite probe (exit 1 when unhealthy)
sudo zagros logs        # follow the panel logs
```

## Removing it

```bash
sudo zagros advanced uninstall --yes
```

Removes containers, images, data and the CLI itself. Take a backup first if you
might want the data (`zagros backup`).

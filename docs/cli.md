# Command line

The `zagros` CLI manages the **host** — services, images, cores, environment,
backups. Everything user-facing lives in the dashboard or the
[API](./api.md).

Two tiers: the everyday commands are at the top level; the rest sit under
`advanced`. Advanced commands are also accepted at the top level, so older
scripts keep working.

## Everyday commands

| Command | What it does |
|---|---|
| `up` | start the panel (`compose up -d`) |
| `down` | stop and remove the panel containers |
| `restart` | recreate the panel — always applies `.env` edits |
| `status` | services, image, health and the core table |
| `logs [svc] [--tail N]` | follow the panel logs |
| `update [--version <tag>]` | pre-backup → pull → migrate → health, with automatic rollback; follows the `latest` image tag unless a release is pinned |
| `cores` | installed cores: state, version, health |
| `cores install\|update\|uninstall\|reload <core>` | manage one core (`--version X` pins a release) |
| `env [show\|edit\|get K\|set K V]` | the `.env` — the single source of truth |
| `backup [--logs]` | full backup: database, config, certificates, keys, cores |
| `restore <file\|latest>` | restore a backup |
| `version` | CLI, image tag (and the release behind `latest`), panel and newest-release versions |
| `help` | the help text |

### Cores

```bash
sudo zagros cores                        # table of installed cores
sudo zagros cores install singbox        # install a core
sudo zagros cores update xray --version v26.6.1
sudo zagros cores reload wireguard       # restart one core
sudo zagros cores uninstall pptp --purge # dependency-checked removal
```

### Environment

```bash
sudo zagros env show          # the effective .env
sudo zagros env get UVICORN_PORT
sudo zagros env set UVICORN_PORT 8000
sudo zagros restart           # applies the change
```

## Advanced commands

| Command | What it does |
|---|---|
| `install` | one-command install (`--database sqlite\|mysql\|mariadb\|postgresql`) |
| `uninstall [--yes]` | full removal of containers, images, data and the CLI |
| `rollback [--to <tag>]` | return to a previous version |
| `start` \| `stop` \| `reload` | finer service control than `up`/`down`/`restart` |
| `doctor [--json]` | full system report (docker/db/cores/ports/dns/registry) |
| `health` | quick composite probe, exit 1 on failure |
| `repair` | safe automatic fixes (directories, env, image, container, schema) |
| `shell` | exec into the panel container |
| `migrate` | run schema migrations now |
| `sync [--core X]` | re-apply every stored account to the enabled cores |
| `create-admin` | create a sudo or normal admin |
| `reset-admin` | reset an admin's password |
| `install-host-agent` | the Settings → Panel Network apply/rollback agent |
| `backup-service` | system-only bundle (compose, env, CLI state) |
| `clean [--keep N]` | prune old backups |
| `prune` | docker image prune + superseded image tags |

## Recipes

**Upgrade safely**

```bash
sudo zagros update && sudo zagros health
```

**Change the panel's port**

```bash
sudo zagros env set UVICORN_PORT 8443
sudo zagros restart
sudo zagros status
```

**Take a backup before touching anything**

```bash
sudo zagros backup            # prints the archive path
sudo zagros restore latest    # and back again if needed
```

**When something is off**

```bash
sudo zagros doctor --json | jq .
sudo zagros repair
```

::: tip
`zagros update` always takes a backup before it changes anything, and reverts
the image if the health check fails. That is why it is safe to run it without
thinking — but a `zagros backup` of your own before a big jump is never wrong.
:::

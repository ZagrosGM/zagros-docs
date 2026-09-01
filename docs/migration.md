# Migration

Two migrations are described here, and they are independent of each other:

1. **[Coming from another panel](#from-another-panel)** — Marzban, PasarGuard or
   3x-ui users land in Zagros.
2. **[Changing the database engine](#changing-the-database-engine)** — an
   existing Zagros install moves from SQLite to MySQL / MariaDB / PostgreSQL.

Read the whole of the section you need before running anything. Both procedures
take a backup first, and both are reversible up to the point where you delete
that backup.

---

## Before you start

Zagros keeps **two** databases, and this single fact explains most of what
follows:

| Database | Environment variable | What lives in it |
| --- | --- | --- |
| Legacy store | `SQLALCHEMY_DATABASE_URL` | users, proxies, hosts, admins, nodes — the Marzban-shaped tables behind `/api/users`, subscriptions and link generation |
| Platform store | `ZAGROS_DATABASE_URL` | multi-core state — cores, per-core provisioning, unified quota, devices, sessions, audit trail |

A user is only fully present when **both** halves exist. Any procedure that
copies one and not the other produces a panel that reports a healthy row count
and shows an empty user list.

Both URLs live in `/opt/zagros/.env`. Inspect them (secrets masked) with:

```bash
sudo zagros env show
```

---

## From another panel

### What can be imported

The importer identifies the source from the database itself, so you do not have
to be right about it — but these are the panels it understands:

| Source | Supported | Notes |
| --- | --- | --- |
| Marzban | ✅ | the reference source — users, proxies, hosts, admins, nodes, usage logs |
| PasarGuard | ✅ | Marzban-shaped schema; read by the same path |
| 3x-ui | ⚠️ partial | users and inbound clients import; admin password hashes cannot be verified, so admins arrive **without** a usable password |
| Zagros | ✅ | a Zagros backup archive — this is a restore, not an import |

Protocol coverage follows what the legacy store can represent: `vmess`,
`vless`, `trojan` and `shadowsocks`. A client on `hysteria2`, `tuic` or another
protocol outside that set is **reported as skipped**, never silently dropped —
recreate those users on a Zagros-native core after the import.

::: tip Old 3x-ui builds
Both 3x-ui layouts are handled: clients stored inside the `inbounds.settings`
JSON blob (older builds) and clients in a dedicated `client_inbounds` table
(newer builds).
:::

### Step 1 — take the database off the source server

On the **old** panel's server:

::: code-group

```bash [Marzban / PasarGuard]
sudo cp /var/lib/marzban/db.sqlite3 /root/legacy-source.db
```

```bash [3x-ui]
sudo cp /etc/x-ui/x-ui.db /root/legacy-source.db
```

```bash [Marzban on MySQL]
sudo docker exec marzban-mysql-1 mysqldump \
  -u root -p"$MYSQL_ROOT_PASSWORD" marzban > /root/marzban.sql
```

:::

You may also upload a `.zip`/`.tar.gz` of the old panel's data directory — the
importer looks inside the archive for a database or a `.sql` dump
(`db_backup.sql`, `backup.sql`, `marzban.sql`) on its own.

::: tip MySQL source
The reader consumes a **SQLite** file. If the source panel ran on MySQL,
convert the dump once:

```bash
pip install mysql-to-sqlite3
mysql2sqlite -f /root/legacy-source.db --mysql-database marzban \
             -u root -p"$MYSQL_ROOT_PASSWORD"
```
:::

### Step 2 — back up Zagros

```bash
sudo zagros backup
```

Do not skip this. The import writes into a live database.

### Step 3 — import through the dashboard

This is the supported route, and the one that auto-detects the source.

1. **Settings → Backup & Restore**
2. **Upload** the file from step 1 (`legacy-source.db`, `x-ui.db`, or an archive).
3. Zagros inspects it and reports what it found:

   ```
   detected source : marzban (confidence 1.0)
   users           : 338 to import, 4 skipped (unsupported protocol)
   admins          :   2 to import, 1 without a verifiable password hash
   hosts           :  11 to import
   nodes           :   3 to import (disabled — pair them manually afterwards)
   name conflicts  :   1  (existing "admin" — reported, not overwritten)
   ```

4. Review that report. **Nothing has been written yet** — inspection is always a
   dry run.
5. Press **Apply** to perform the import.

::: warning Read the report first
- **Name conflicts** are reported per row and never overwrite an existing user.
  Usernames are compared the way the database compares them (case-insensitively),
  and one rejected username does not abort the run — the remaining users still
  import.
- **Nodes** arrive disabled. Node pairing is certificate-pinned, so a copied
  node row cannot carry a valid pin — re-run `install-node.sh` on each node and
  confirm its fingerprint in the panel.
:::

### Alternative — the REST API

The same operation over HTTP, for scripted migrations. Authenticate as a sudo
admin first (see [API](./api.md)).

```bash
# 1) upload
curl -fsS -X POST https://panel.example.com/api/zagros/restore/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F 'file=@/root/legacy-source.db'

# 2) inspect — always a dry run
curl -fsS -X POST https://panel.example.com/api/zagros/restore/inspect \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"archive":"legacy-source.db","source":"marzban"}'

# 3) apply, once the report reads correctly
curl -fsS -X POST https://panel.example.com/api/zagros/restore/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"archive":"legacy-source.db","source":"marzban","dry_run":false}'
```

`source` accepts `zagros`, `marzban`, `pasarguard` or `3x-ui`. If you name the
wrong one and the file clearly belongs to another panel, the importer says so
instead of reporting zero users.

For a Marzban SQLite file already sitting on the panel's filesystem there is
also a direct endpoint:

```bash
curl -fsS -X POST https://panel.example.com/api/zagros/migrate/legacy \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"legacy_path":"/var/lib/zagros/legacy-source.db","dry_run":true}'
```

Set `"dry_run": false` to commit.

### Step 4 — verify

```bash
sudo zagros restart
sudo zagros status
```

Then check, in this order:

1. **Users page** — the count matches the import report.
2. **Open one user** — protocols and data limit survived.
3. **Copy its subscription link and open it** — the link must render. This is
   the check that proves both database halves agree; a user that lists but
   cannot deliver means only the platform side was written.
4. **Cores page** — no core reports `degraded`.

### What is *not* imported

| Not imported | Why | What to do |
| --- | --- | --- |
| Admin passwords (3x-ui) | the hash scheme cannot be verified | set new ones: `sudo zagros advanced reset-admin` |
| Node certificates | pins are per-install by design | re-run `install-node.sh` on each node |
| TLS certificates | paths and ownership differ | re-issue: see [Certificates](./certificates.md) |
| Subscription page templates | the template engine differs | see [Subscription page](../examples/subscription-page.md) |
| Telegram / notification settings | different configuration keys | see [Notifications](./notifications.md) |

---

## Changing the database engine

Use this when a Zagros install already running on **SQLite** outgrows it and
should move to **MySQL**, **MariaDB** or **PostgreSQL**.

The mechanism is deliberately boring: **back up on the old engine, point Zagros
at the new engine, restore the backup.** The backup archive is engine-neutral,
so it is also the supported way across engines.

::: warning Plan for downtime
The panel is stopped while the data moves. For a few hundred users this is
under a minute; size your maintenance window from your own row counts.
:::

### Step 1 — back up, and keep the raw files

```bash
sudo zagros backup
ls -la /var/lib/zagros/backups/
```

Copy the raw SQLite files aside as well — they are what you are converting, and
having them untouched is what makes this reversible:

```bash
sudo mkdir -p /root/zagros-sqlite-backup
sudo cp /var/lib/zagros/zagros.db /var/lib/zagros/legacy.db \
        /root/zagros-sqlite-backup/
sudo cp /var/lib/zagros/backups/*.tar.gz /root/zagros-sqlite-backup/
```

### Step 2 — stop the panel

```bash
sudo zagros down
```

Nothing may write to the databases while they are being moved.

### Step 3 — install the target engine and create **both** databases

::: code-group

```bash [MySQL]
sudo apt-get update && sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql

sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS zagros
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS zagros_legacy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zagros'@'%' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON zagros.*        TO 'zagros'@'%';
GRANT ALL PRIVILEGES ON zagros_legacy.* TO 'zagros'@'%';
FLUSH PRIVILEGES;
SQL
```

```bash [MariaDB]
sudo apt-get update && sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb

sudo mariadb <<'SQL'
CREATE DATABASE IF NOT EXISTS zagros
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS zagros_legacy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zagros'@'%' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON zagros.*        TO 'zagros'@'%';
GRANT ALL PRIVILEGES ON zagros_legacy.* TO 'zagros'@'%';
FLUSH PRIVILEGES;
SQL
```

```bash [PostgreSQL]
sudo apt-get update && sudo apt-get install -y postgresql
sudo systemctl enable --now postgresql

sudo -u postgres psql <<'SQL'
CREATE USER zagros WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE zagros        OWNER zagros;
CREATE DATABASE zagros_legacy OWNER zagros;
SQL
```

:::

Replace `CHANGE_ME` with a real password and reuse it in step 4.

::: danger Both databases, always
`zagros` **and** `zagros_legacy` must exist. Creating only one is the single
most common cause of a migrated panel that boots, authenticates, and then shows
no users.
:::

### Step 4 — point Zagros at the new engine

```bash
sudo zagros env set ZAGROS_DB_KIND mysql

sudo zagros env set ZAGROS_DATABASE_URL \
  'mysql+pymysql://zagros:CHANGE_ME@127.0.0.1:3306/zagros?charset=utf8mb4'

sudo zagros env set SQLALCHEMY_DATABASE_URL \
  'mysql+pymysql://zagros:CHANGE_ME@127.0.0.1:3306/zagros_legacy?charset=utf8mb4'
```

The URL pairs for every engine — these are exactly what the installer writes:

| Engine | `ZAGROS_DATABASE_URL` | `SQLALCHEMY_DATABASE_URL` |
| --- | --- | --- |
| SQLite | `sqlite:////var/lib/zagros/zagros.db` | `sqlite:////var/lib/zagros/legacy.db` |
| MySQL / MariaDB | `mysql+pymysql://zagros:PW@127.0.0.1:3306/zagros?charset=utf8mb4` | `mysql+pymysql://zagros:PW@127.0.0.1:3306/zagros_legacy?charset=utf8mb4` |
| PostgreSQL | `postgresql+psycopg://zagros:PW@127.0.0.1:5432/zagros` | `postgresql+psycopg://zagros:PW@127.0.0.1:5432/zagros_legacy` |

Set `ZAGROS_DB_KIND` to `sqlite`, `mysql`, `mariadb` or `postgresql` to match.

::: tip Password characters
The URL is parsed as a URL. Percent-encode `@`, `/`, `:`, `#` and `?` in the
password, or pick a password without them.
:::

### Step 5 — create the schema on the empty engine

```bash
sudo zagros up
sudo zagros logs --tail 50
```

On first boot against an empty database the panel runs its Alembic migrations
and creates every table. Confirm the schema converged:

```bash
sudo zagros advanced migrate
```

That command runs `alembic upgrade head`, prints the current revision and
finishes with a health check. It must report `migration complete & healthy`
before you continue.

### Step 6 — restore your data onto the new engine

The quickest route is the CLI, which restores the archive in place:

```bash
sudo zagros restore latest
```

Or name a specific archive:

```bash
sudo zagros restore /root/zagros-sqlite-backup/zagros-backup-XXXX.tar.gz
```

The dashboard route does the same thing with a report to read first:
**Settings → Backup & Restore → Upload**, select the archive, choose source
**`zagros`**, review the inspection report, then **Apply**.

Restoring a Zagros archive writes **both** stores, which is precisely why this
is the supported cross-engine route rather than a table-by-table copy.

### Step 7 — verify

```bash
sudo zagros status
sudo zagros advanced doctor
```

Then verify exactly as in the import procedure:

1. user count matches the old panel;
2. one user opens and shows the right protocols and limits;
3. that user's subscription link renders;
4. no core reports `degraded`;
5. every node shows `connected`.

Only once all five pass should you remove `/root/zagros-sqlite-backup`.

### Rolling back

Nothing destroyed the SQLite files, so a rollback is a configuration change:

```bash
sudo zagros down
sudo zagros env set ZAGROS_DB_KIND sqlite
sudo zagros env set ZAGROS_DATABASE_URL     'sqlite:////var/lib/zagros/zagros.db'
sudo zagros env set SQLALCHEMY_DATABASE_URL 'sqlite:////var/lib/zagros/legacy.db'
sudo cp /root/zagros-sqlite-backup/zagros.db /root/zagros-sqlite-backup/legacy.db \
        /var/lib/zagros/
sudo zagros up
```

---

## Installing straight onto MySQL / MariaDB

If you have not installed yet, pick the engine at install time and skip this
whole page:

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ZagrosGM/zagros-scripts/main/zagros.sh)" -- install --database mysql
```

`--database` accepts `sqlite`, `mysql`, `mariadb` or `postgresql`. The installer
provisions both databases, generates the credentials and writes both URLs.

---

## Troubleshooting

**`Access denied for user 'zagros'@'localhost'`**
The grant used `'zagros'@'%'` but the client connected over the local socket.
Keep `127.0.0.1` in the URL (not `localhost`), or add the matching
`'zagros'@'localhost'` grant.

**`Unknown database 'zagros_legacy'`**
Only one of the two databases was created. Go back to step 3.

**The panel boots but the user list is empty**
The platform store was written and the legacy store was not. Restore the Zagros
archive again (step 6) — restoring writes both halves.

**`Specified key was too long; max key length is 767 bytes` (MySQL/MariaDB)**
The database was created without `utf8mb4` / `utf8mb4_unicode_ci`. Drop it,
recreate it exactly as in step 3, and repeat from step 5.

**`sqlalchemy.exc.OperationalError: (2003, "Can't connect …")`**
The engine is not listening on the port in the URL:

```bash
sudo ss -ltnp | grep -E '3306|5432'
```

**The import reported users but the list is still empty**
Restart the panel (`sudo zagros restart`) and hard-reload the dashboard. If it
persists, run `sudo zagros advanced doctor` and check the legacy database URL.

For anything else, see [Troubleshooting](./troubleshooting.md).

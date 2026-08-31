# Backup and restore

A backup is one archive containing everything you would miss: the databases,
configuration, certificates, keys, and the cores' data.

## Take one

```bash
sudo zagros backup            # prints the archive path
sudo zagros backup --logs     # include the logs as well
```

Archives land in `/var/lib/zagros/backups`.

::: tip
`zagros update` takes a backup before it changes anything, so even an update you
did not plan for is covered. Keep your own before a large jump anyway.
:::

## Restore

```bash
sudo zagros restore latest
sudo zagros restore /var/lib/zagros/backups/zagros-backup-2026-08-30.tar.gz
sudo zagros status
```

Restore is **whole-panel**: it is for getting a deployment back, not for
importing a single user. To move one user between panels, use the
[API](./../docs/api.md).

## Only the system files

When you want the deployment without the data (to rebuild the same setup on a
fresh host after restoring the database elsewhere):

```bash
sudo zagros advanced backup-service
```

## Housekeeping

```bash
sudo zagros advanced clean --keep 7     # keep the newest 7 archives
sudo zagros advanced prune              # docker images and superseded tags
```

## Copy archives off the server

A backup on the same disk as the data is not a backup against disk failure.

```bash
rsync -av /var/lib/zagros/backups/ user@storage:/backups/zagros/
```

## Verify a backup is real

An archive you have never restored is a hypothesis:

```bash
tar -tzf /var/lib/zagros/backups/<archive>.tar.gz | head
```

Better: restore it on a throwaway host once, and check that
`zagros status` comes back healthy. That one rehearsal is what makes the
archive worth keeping.

## What is inside

| Content | Why it matters |
|---|---|
| Platform + legacy databases | Users, admins, settings, nodes |
| `.env` and compose file | The deployment — without it the data has no shape |
| Certificates and keys | Losing them means re-issuing, and pinned node certificates change |
| Cores' data and configuration | So a core comes back as it was, not as a fresh install |

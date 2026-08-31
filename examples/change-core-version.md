# Change a core version

Every core whose driver discovers releases from its own upstream repository can
be pinned to **any published release — higher or lower — or to a tag you type by
hand**. Settings, data and accounts survive.

## From the dashboard

1. Open **Cores** (on the panel, or on a node's **Cores** tab).
2. Choose **change version**.
3. Pick a release from the list — the installed one is marked — or type a tag.

The list comes from the core's own upstream repository, so it is the same
catalogue the project publishes. Cores that the operating system installs
instead say why they have no list, rather than showing an empty picker.

## From the host

```bash
sudo zagros cores                                  # current versions
sudo zagros cores update xray --version v26.6.1    # pin a release
sudo zagros cores reload xray                      # restart just this core
sudo zagros status                                 # confirm
```

## Downgrading

Pinning an older release is the same operation — pick it from the list. Zagros
does not treat "older" as an error, because the version you need is a decision
about your deployment, not about the panel.

## What is kept

| Kept | Notes |
|---|---|
| Settings and configuration | Re-applied after the change. |
| Data and accounts | Users are not re-provisioned; the core converges to the stored account list. |
| The core's start/stop state | A running core comes back running. |

## If the change fails

```bash
sudo zagros logs                 # the driver's own error is passed through
sudo zagros cores                # state and health per core
sudo zagros advanced sync        # re-apply every stored account to the cores
```

A core that cannot start reports it on its card, with its logs — no SSH needed.

::: tip
On a node, the same action is available, but a node is configured by sync: use
the node's **Cores** tab rather than editing files on that server, or the next
sync will overwrite what you did.
:::

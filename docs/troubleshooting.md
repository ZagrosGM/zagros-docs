# Troubleshooting

Start with the two commands that look at everything:

```bash
sudo zagros doctor      # docker, db, cores, ports, dns, registry
sudo zagros status      # services, image, health, core table
sudo zagros logs        # what the panel is saying right now
```

## Symptom → cause → fix

| Symptom | Likely cause | What to do |
|---|---|---|
| The panel does not come up | Port already taken, or a failed migration | `zagros logs`, then `zagros doctor`; `zagros repair` fixes the common ones (directories, env, image, container, schema) |
| `503 admin authentication stack unavailable` | The panel is still starting, or the database is unreachable | Wait for health, then `zagros doctor`; the reason is logged instead of swallowed |
| An error about the JWT secret being missing | Migrations have not run on this database | `zagros advanced migrate` |
| A node never pairs | Ports `62050`/`62051` not reachable, the token was already used, or the agent was reinstalled | Check reachability from the panel; if the agent was reinstalled, **rotate** the token (the old one is spent) |
| A node pairs but serves nothing | Its core has no configuration yet, or the account list has not converged | Open the node's **Cores** tab; accounts converge within 30 seconds — `zagros logs \| grep accounts` |
| A new user's config does not connect while old ones do | The node is serving a stale account list | Wait 30s (the sweep re-asserts), or force it: `sync` a node from the dashboard |
| A user on a node shows offline and consumes nothing | Node telemetry is not arriving | Check `62050` from the panel, then `DISABLE_RECORDING_NODE_USAGE` in `.env` |
| Installing sing-box/Xray on a node fails with `No module named 'app.studio.wizard'` | The node has a pre-v1.0.5 vendored driver that imports a panel-only wizard module | Upgrade the panel to 1.0.5 and the node agent to 0.3.3, then retry; node drivers now own their runtime defaults |
| sing-box is marked running but its stats listener is connection-refused | The process bound public listeners but not the configured v2ray/Clash control listener | In 1.0.5 control listeners and a real StatsService query are startup gates; inspect the start error instead of accepting a yellow partial state |
| Installing a node core ends with `Core '<core>' is already running` | The install convergence started it, then the dashboard sent a duplicate start | Fixed in 1.0.5: install/update carries one `start_after` decision and sends one lifecycle request |
| Fresh SoftEther occupies TCP 443 although SSTP is disabled | SoftEther's factory generic `Listener 443` is separate from `SstpEnable` | Apply the Studio document or restart SoftEther on 1.0.5; the factory listener is removed unless native management intentionally uses 443 |
| **Show QR** does nothing in the built-in portal | Invalid nested interactive HTML made the details toggle browser-dependent | Fixed in 1.0.5; hard-refresh any cached portal page |
| An existing user gets “No inbound is available” after a new Xray VLESS inbound is added | The edit path misread an empty selected-tag list as “exclude all”; a brand-new inbound may also have no legacy Host row yet | Upgrade to 1.0.5 and save the user's intended inbound selection once. Empty means all current inbounds, and delivery falls back to the public subscription host |
| "Online now" looks wrong for Xray | Source-IP visibility is missing or the online-stat RPC failed | v1.0.4 uses Xray's native online-IP map; older/failed backends fall back to traffic growth. Check the core version and whether a local proxy hides clients as `127.0.0.1` |
| Presence says *unknown* | A core's read failed, or the deployment has no online API | Not a bug: absence of evidence is not evidence of absence. Look at `failed_cores` in `/api/zagros/users/online` |
| Subscription URL returns links in a browser | You are not being treated as a browser | Send `Accept: text/html` and a browser `User-Agent`, or use `?format=` |
| My uploaded page template is ignored | The file is not on the server, or it failed to render | `docker compose logs zagros \| grep -i "subscription template"` — a broken template always falls back to the built-in page |
| Certificate issuance fails | Port 80 is taken, or no ACME client is installed | The interface names the provider it found (certbot / acme.sh / lego); free port 80 and retry |
| An update left the panel unhealthy | It should have rolled back by itself | `zagros advanced rollback`, and check `zagros logs` |
| Signing in says *session expired* although the password is right | An old token from a previous session was still in the browser; background pollers hit `401` a moment before the new sign-in landed | Fixed in 1.0.3 — sign out and in once. A genuinely wrong password now says so explicitly |
| Inbounds wizard: `['http_method', …] require header_type=http` on a TCP inbound | The form sent the HTTP-camouflage defaults with *header type: none* | Fixed in 1.0.3 — those fields are only shown (and sent) when header type is `http`; the path/Host/method/headers are ordinary wizard fields |
| A bot-created user only has the Xray core | Marzban-style clients do not send `core_access`, and the advanced API-default policy may be `none` | Inspect `GET /api/zagros/settings/api-defaults`; the General-page card was removed in 1.0.4. See [API](./api.md#mirzabot-compatibility) |
| The link a bot shows points at the panel address, not the subscription domain | Older builds built `subscription_url` from `.env` only | 1.0.3 derives it from *Settings → Subscription*; re-read the user (`GET /api/user/{username}`) |
| Support ticket fails with HTTP 404 | A pre-1.0.4 panel appended the retired `/api.php` path to the JavaScript Worker | Upgrade to 1.0.4. A base URL now resolves to `/api/ticket`; explicit legacy `.php` URLs remain supported |
| Support ticket returns HTTP 413 | The 10 MB panel/Worker attachment limit was exceeded | Attach a file of at most 10 MB; a self-hosted legacy PHP bot may impose a smaller server limit |
| Restoring a 3x-ui database says *request failed (500)* | An oversized per-user note (the client's IP history) overflowed a MySQL column | Fixed in 1.0.3 — the IP list is summarised; the Backup & restore page shows the real error text |

## Where things are

| Path | Contents |
|---|---|
| `/opt/zagros/` | `docker-compose.yml` and `.env` |
| `/var/lib/zagros/` | Database, cores, certificates, keys, logs, backups |
| `/usr/local/bin/zagros` | The host CLI |

## Testing like the client does

```bash
# what a client sees
curl -s -A "v2rayNG/1.8" https://panel.example.com/sub/TOKEN

# what a browser sees
curl -s -A "Mozilla/5.0 Chrome/120" -H "Accept: text/html" \
     https://panel.example.com/sub/TOKEN

# does traffic really leave through a node?
curl --socks5 127.0.0.1:1080 https://api.ipify.org
```

The last one must print the **node's** IP. If it prints the panel's IP, the user
is not going through the node at all.

## When you need to go deeper

```bash
sudo zagros shell                 # inside the panel container
sudo zagros advanced sync         # re-apply every stored account to the cores
sudo zagros doctor --json | jq .  # machine-readable full report
```

::: tip
Prefer `zagros repair` over hand-editing: it only makes changes it can justify
(directories, env, image, container, schema), and it says what it did.
:::

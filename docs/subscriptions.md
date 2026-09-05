# Subscriptions

Every user has one subscription URL. What comes back depends on who is asking —
and the same URL works for all of them.

```
https://panel.example.com/sub/<token>
```

The `sub` segment is the **subscription path**, configurable in
*Subscriptions → subscription path*. It may contain safe namespaces such as
`sub/test` (1–32 characters total). The stable `/sub/<token>` and
`/zagros/sub/<token>` aliases remain available; a previous *custom* path is not
retained after you change it.

## Who gets what

| Caller | Answer |
|---|---|
| A client (v2rayNG, Streisand, Nekoray, sing-box, …) | The link list, or a Clash / sing-box document when that is what the client wants. |
| A browser | The portal page — usage, links, QR codes, downloads. |
| Anyone with `?format=` | Exactly that format, regardless of the caller. |

Format detection uses the client's `User-Agent`, so the user does not choose
anything. `?format=clash`, `?format=clash-meta`, `?format=meta`, `?format=stash`,
`?format=sing-box`, `?format=yaml` and the raw form are accepted, which also lets
a browser fetch a document on purpose.

::: tip
Revoking a subscription rotates the token immediately — old URLs stop working
the moment you do it, including ones already delivered to users.
:::

## Headers sent with a subscription

| Header | Meaning |
|---|---|
| `subscription-userinfo` | `upload=…; download=…; total=…; expire=…` — clients show remaining quota from it |
| `profile-update-interval` | How often clients should refresh, in hours (`SUB_UPDATE_INTERVAL`) |
| `support-url` | Where to send the user for help (`SUB_SUPPORT_URL`) |
| `profile-title` | Profile name (`SUB_PROFILE_TITLE`) |

## Portal settings

*Subscriptions* in the dashboard is where the link is shaped:

| Setting | Effect |
|---|---|
| public domain / custom subdomain | The host part of every link |
| scheme and public port | `https://host:port`, when the port is not the scheme's default |
| subscription path | One or more safe URL segments before the token (`sub` by default), e.g. `sub/test`; 1–32 characters total |
| listener mode | `shared` (the panel's own port), `dedicated` (Zagros opens a second listener), or `external_proxy` (Nginx/Caddy owns the URL) |
| TLS certificate | A managed certificate for the dedicated listener |
| force HTTPS | Always advertise `https://` links |
| QR base URL | Override the host embedded in QR material for a specific entry point |
| client auth mode | `subscription_link` (the normal case) or `application_login` |

**Application login** changes what the subscription is: no configuration
material is emitted at all. The page offers the official app and the user signs
in inside it. Use it when you do not want links leaving your control.

Use **test configuration** in the same screen to see the exact URL Zagros will
generate before you save.

These settings shape *every* place a link appears: the dashboard's copy/QR
buttons, the portal page and the `subscription_url` field of the REST API
(`POST /api/user`, `GET /api/user/{username}`, `GET /api/users`). A bot that
reads that field therefore hands out the same link the panel shows — a
dedicated subscription domain or port is honoured without any bot-side
configuration.

## Designing the page

The portal page is yours to replace: upload an HTML template in
*Subscriptions → subscription page template* and subscribers see it instead
of the built-in page. The upload is validated (syntax plus a test render) and
becomes the active page at once; **preview** shows it with sample data or as
any real user; a template that fails to render later falls back to the
built-in page and the reason is shown next to the picker — a subscriber never
sees a broken page.

A template sees **everything the cores deliver**, not only share links:
`sections` carries the xray / sing-box links, the OpenVPN and WireGuard config
**files** (with `data_uri()` and `qr_svg()` helpers for download buttons and
QR codes), the SSH / SoftEther / PPTP credential tables and the cores' notes,
plus `import_links` for one-tap "add to app" buttons. Templates are Jinja2 and
render the way Marzban's do (no auto-escaping, the `bytesformat` / `datetime`
filters, `now()`), with <code v-pre>{{ user.links }}</code>,
<code v-pre>{{ user.subscription_url }}</code>, <code v-pre>{{ user.used_traffic }}</code>
and the rest of the Marzban names available — a Marzban template works
unchanged.

Two places to read:

* [Custom subscription page](../examples/subscription-page.md) — the complete
  variable reference, a multi-protocol example template and the API.
* The **download starter** button in the panel hands you a complete, working
  template that already renders every protocol with copy / QR / download /
  import buttons — edit its CSS and markup.

## Legacy URLs

`/zagros/sub/<token>` is kept as an alias of `/sub/<token>`: links issued by
older versions keep working, with no redirect and an identical payload.

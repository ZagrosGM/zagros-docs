# Subscriptions

Every user has one subscription URL. What comes back depends on who is asking —
and the same URL works for all of them.

```
https://panel.example.com/sub/<token>
```

The `sub` segment is the **subscription path**, configurable in
*Subscriptions → subscription path*. Already-issued links keep working forever,
because the old paths stay as aliases.

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
| subscription path | The URL segment before the token (`sub` by default) |
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

## Designing the page

The portal page is yours to replace: upload an HTML template, select it, and
subscribers see it instead of the built-in page. Templates are Jinja2 with
variables like <code v-pre>{{ user.username }}</code>, <code v-pre>{{ links }}</code> and
<code v-pre>{{ format_bytes(used_bytes) }}</code>, and a template that fails to render falls back
to the built-in page — a subscriber never sees a broken page.

Two places to read:

* [Custom subscription page](../examples/subscription-page.md) — a worked example,
  step by step.
* The **download starter** button in the panel hands you a complete, working
  template with the variables documented in a comment.

## Legacy URLs

`/zagros/sub/<token>` is kept as an alias of `/sub/<token>`: links issued by
older versions keep working, with no redirect and an identical payload.

# Custom subscription page

The page a subscriber sees when they open their subscription link in a browser
is a template you can replace. This page is the complete reference: how a
template is installed, every variable and helper it can use, a full
multi-protocol example, and what happens when something goes wrong.

Everything Zagros delivers is available to a template — xray and sing-box share
links, OpenVPN profiles and WireGuard configurations as **downloadable files**,
SSH / SoftEther / L2TP / SSTP / PPTP credentials, and the honest notes a core
emits — so one page can show every protocol a user has, in whatever design you
like.

[[toc]]

## How it works

1. **Get a starting point.** *Subscriptions → download starter* hands you a
   complete, working template that renders every protocol with copy buttons,
   QR codes, download buttons for config files and one-tap "add to app" links.
   Edit its CSS and markup freely. A template written for **Marzban** also
   works without changes (see [Marzban compatibility](#marzban-compatibility)).
2. **Upload it** in *Subscriptions → subscription page template*. Accepted:
   one `.html` / `.htm` file, UTF-8, at most **1 MB**. The upload is
   **validated** — the syntax is checked and the template is rendered once
   against a sample subscriber. A file that cannot render is **rejected with
   the line number** and nothing changes on the server. A valid file is stored
   and becomes the **active page immediately**; there is no separate save.
3. **Preview it.** The *preview* button renders the active (or any uploaded)
   template with sample data, or as any real user by username — exactly the
   HTML a subscriber's browser receives.
4. **Switch or remove.** The picker selects among uploaded files or the
   built-in page; deleting the active file switches back to the built-in page.

::: tip Fail-open by design
A template that renders at upload time but fails later (for example on a user
whose data hits a code path the sample did not) never breaks a subscriber's
page: the **built-in page is served instead**, the failure is logged, and the
reason (with the line number) is shown in the Subscriptions section next to the
picker until the template renders successfully again.
:::

::: warning What a template never replaces
* The **application-login** page. In that mode no configuration material may
  leave the panel, and an operator template cannot be audited for that — it is
  ignored for those users.
* The **client formats.** v2rayNG, Hiddify, Clash, sing-box and the other
  clients fetching the same URL still get their link list / YAML / JSON
  (`?format=links|clash-meta|sing-box`). The template only serves browsers.
:::

## Templates are Jinja2

Templates are rendered with [Jinja2](https://jinja.palletsprojects.com/en/stable/templates/)
using the same settings as Marzban's subscription page:

* **No auto-escaping.** What you print is emitted verbatim. That keeps share
  links intact inside `<script>` blocks, and it means **you** escape values you
  print inside HTML attributes or between tags when they could contain quotes
  or angle brackets: <code v-pre>{{ a.content | e }}</code>. Every value in the
  context is panel- or admin-controlled (usernames are constrained, links are
  URL-quoted); the single subscriber-controlled value, `user.sub_last_user_agent`,
  is escaped for you.
* **Undefined is silent.** A missing variable or attribute prints nothing and
  is false in `{% if %}`, even when chained (`user.admin.username`). Templates
  never fail on optional data.
* `{% include %}` and `{% extends %}` work between uploaded files, so a shared
  header or base layout can be a second upload.

Anything Jinja2 offers is available: `{% set %}`, `{% for %}` with `loop.*`,
`{% macro %}`, filters such as `round`, `length`, `join`, `replace`, `upper`,
`urlencode`, `tojson`, `e`, tests such as `is none` / `is defined`, and so on.

::: warning JavaScript that contains double curly braces
Jinja parses everything. Wrap client-side code that uses <code v-pre>{{ … }}</code> (Vue,
Alpine, Handlebars, template literals) in a raw block so it reaches the browser
unchanged:

```
{% raw %}
<div x-text="`${used} / ${total}`"></div>
{% endraw %}
```
:::

## Variable reference

Every name below is available at the top level of the template.

### Page and panel

| Variable | Type | Description |
|---|---|---|
| `brand` | string | Brand name from *Subscriptions*. |
| `app_name` | string | Application name from *Subscriptions*. |
| `support_url` | string or `None` | Support link from *Subscriptions*. |
| `subscription_url` | string | Absolute URL this page was fetched from, without query string — the link a client app imports. Also `user.subscription_url`. |
| `subscription_formats` | dict | The same URL in each format: `.links` (plain link list), `.clash` (`?format=clash-meta`), `.sing_box` (`?format=sing-box`). Empty strings when `subscription_url` is unknown. |
| `import_links` | dict | One-tap "add to app" deep links built from `subscription_url`, keyed by app id: `v2rayng`, `hiddify`, `streisand`, `happ`, `v2box`, `shadowrocket`, `nekobox`, `karing`, `sing-box`, `clash`, `stash`. Clash/Stash and sing-box receive their `?format=` URL, the rest the plain link list. Empty dict when `subscription_url` is unknown. |
| `apps` | list | Official app download entries from *Subscriptions*; each has `.platform` (`android` / `ios` / `windows` / `macos` / `linux`), `.name`, `.url`, `.primary` (bool). |
| `notes` | list of strings | Page-level notes emitted by the cores (for example a driver explaining why it could not build a link). |
| `generated_at` | datetime (UTC, aware) | When the page was assembled. |
| `lang` | string | Page language: the panel default, or the browser's `Accept-Language` primary tag (`fa`, `en`, …). |
| `direction` | string | `rtl` for `fa` / `ar` / `he`, otherwise `ltr`. |
| `page` | object | The whole page object (`page.title`, `page.kind`, `page.user`, `page.sections` …) for anything not listed. |

### Account shortcuts

| Variable | Type | Description |
|---|---|---|
| `used_bytes` | int | Traffic used in the current period, bytes. |
| `data_limit_bytes` | int or `None` | Quota in bytes; `None` = unlimited. |
| `remaining_bytes` | int or `None` | `data_limit_bytes − used_bytes` (never negative); `None` when unlimited. |
| `expire_at` | datetime (UTC, aware) or `None` | Expiry; `None` = never. |
| `online` | bool | Whether the user is currently connected. |

### `user`

One object answers both vocabularies: the Zagros names and the names Marzban
templates use.

**Zagros names**

| Attribute | Type | Description |
|---|---|---|
| `user.user_id` | int | Panel id. |
| `user.username` | string | Username. |
| `user.status` | string-like | `active` / `limited` / `expired` / `disabled` / `on_hold`. Compares as a string (`user.status == 'active'`) and also supports `.value`. |
| `user.online` | bool | Currently connected. |
| `user.used_bytes`, `user.data_limit_bytes`, `user.remaining_bytes`, `user.expire_at` | | Same values as the shortcuts above. |
| `user.usage_ratio` | float 0–1 or `None` | `used / limit`, capped at 1; `None` when unlimited. |
| `user.note` | string or `None` | Admin note on the user. |
| `user.data_limit_reset_strategy` | string-like | `no_reset` / `day` / `week` / `month` / `year`; supports `.value`. |
| `user.client_auth_mode` | string or `None` | Per-user override of the access mode, if any. |
| `user.created_at`, `user.online_at`, `user.sub_updated_at` | datetime or `None` | Creation, last seen online, last subscription fetch. |
| `user.sub_last_user_agent` | string or `None` | Last client User-Agent, **already HTML-escaped**. |

**Marzban names** (what a Marzban template reads)

| Attribute | Type | Description |
|---|---|---|
| `user.links` | list of strings | Every share link of every core, deduplicated — what Marzban's `user.links` holds. |
| `user.subscription_url` | string | Same as `subscription_url`. |
| `user.used_traffic` | int | Bytes used in the current period. |
| `user.lifetime_used_traffic` | int | Bytes used across resets. |
| `user.data_limit` | int or `None` | Quota in bytes. |
| `user.expire` | int (unix timestamp) or `None` | Expiry. |
| `user.status.value` | string | As above. |
| `user.data_limit_reset_strategy.value` | string | As above. |
| `user.proxies`, `user.inbounds`, `user.excluded_inbounds` | dict | Always empty — Zagros has no per-user inbound map. |
| `user.on_hold_expire_duration`, `user.on_hold_timeout`, `user.admin` | `None` | Present for compatibility. |

Any other attribute reads as undefined (prints nothing, is false), so
`{% if user.note %}` is all the defensiveness a template needs.

### `sections` — every protocol

`sections` is the complete delivery: one section per inbound of every core the
user has an account on, in the order the cores report them. This is the
variable to iterate when the page must show OpenVPN, WireGuard, SSH, SoftEther
or PPTP next to the share links.

**Section**

| Attribute | Type | Description |
|---|---|---|
| `section.protocol` | string | Protocol id — see the table below. |
| `section.title` | string | Human title, prefixed with the brand (`Zagros · WireGuard`). |
| `section.engine` | string | Recommended client family — see the table below. Empty when the core could not build the section. |
| `section.note` | string or `None` | A note about the whole section. |
| `section.inbound_tag` | string or `None` | The core inbound that produced it. |
| `section.artifacts` | list | What the section delivers — see *Artifact*. |

**Artifact**

| Attribute | Type | Description |
|---|---|---|
| `a.kind` | string | `link`, `file`, `fields` or `note` (compare with the string). |
| `a.label` | string | Display label (`VLESS Reality · DE`, `WireGuard configuration`, `OpenVPN profile`, `Authentication`, …). |
| `a.content` | string | For `link`: the share URL. For `file`: the file text. Empty otherwise. |
| `a.filename` | string or `None` | For `file`: suggested file name, e.g. `alice-wg0.conf`, `alice-udp1194.ovpn`. |
| `a.mime` | string | For `file`: `text/plain` (WireGuard) or `application/x-openvpn-profile` (OpenVPN). |
| `a.fields` | list | For `fields`: the credential rows — see *Field*. |
| `a.qr` | bool | The core recommends showing this artifact as a QR code (share links, WireGuard `.conf`). |
| `a.note` | string or `None` | For `note`: the text. For other kinds: an optional hint. |

**Field** (rows of a `fields` artifact)

| Attribute | Type | Description |
|---|---|---|
| `f.key` | string | Semantic id: `host`, `port`, `username`, `password`, `psk`, … |
| `f.label` | string | Display label. |
| `f.value` | string | The value. |
| `f.secret` | bool | Mask until the user reveals it (passwords, pre-shared keys). |
| `f.copyable` | bool | Offer a copy button. |

**Protocol and engine values by core**

| Core | `section.protocol` | `section.engine` | Artifacts |
|---|---|---|---|
| xray | `vless`, `vmess`, `trojan`, `shadowsocks` | `sing-box` | `link` (+`note` when a link cannot be built) |
| sing-box | `vless`, `vmess`, `trojan`, `shadowsocks`, `hysteria2`, `tuic` | `sing-box` | `link` (+`note`) |
| OpenVPN | `ovpn` | `openvpn` | `file` (.ovpn) + `fields` (Authentication, Server & security) + `note` |
| WireGuard | `wireguard` | `wireguard` | `file` (.conf, `qr=true`) + `fields` (Connection details) + `note` |
| SSH | `ssh` | `ssh` | `fields` + `note` |
| SoftEther | `softether`, `l2tp`, `l2tp_raw`, `sstp`, `ovpn` | `softether`, `l2tp-ipsec`, `l2tp`, `sstp`, `openvpn-clone` | `fields` (+`note`) |
| PPTP | `pptp` | `pptp` | `fields` + `note` |

Note that the xray core recommends the sing-box client family (its links are
standard share links that every v2ray-compatible client imports). When a core
cannot assemble a user's configuration, its section carries a single `note`
artifact explaining that, with an empty `engine`.

### `links` and `files` — flat views

Convenience lists derived from `sections`:

| Variable | Item attributes | Description |
|---|---|---|
| `links` | `protocol`, `title`, `label`, `url` | Every `link` artifact, in order. |
| `files` | `protocol`, `title`, `label`, `filename`, `mime`, `content`, `href` | Every `file` artifact; `href` is a ready `data:` URI for a download button. |

### Helpers

| Helper | Returns | Description |
|---|---|---|
| `format_bytes(v)` | string | `7.50 GB`, `512 B`; `∞` for `None`. |
| `format_date(v)` | string | `2026/09/25`; `—` for `None`. |
| `days_left(v)` | int or `None` | Whole days until a datetime **or unix timestamp** (negative when past); `None` for `None`. |
| `qr_svg(text, size=4, border=2)` | string | An inline `<svg>` QR code — no JavaScript, no external service. `size` is the pixel width of one module, `border` the quiet zone in modules. Returns `""` for empty text or text too long for a QR code (≈ 2.9 KB), so it can never break the page. |
| `data_uri(text, mime)` | string | `data:<mime>;base64,…` — a self-contained download `href` for a file artifact. |
| `now()` | naive UTC datetime | Marzban's global; `now().timestamp()` works. |

### Filters

| Filter | Description |
|---|---|
| `bytesformat` | Marzban's `readable_size`: `7.5 GB`; `∞` for `None` / undefined. |
| `datetime` | Marzban's: unix timestamp **or** datetime → `2026-09-25 14:48:59`. |
| `yaml`, `except`, `only` | Marzban's config filters (<code v-pre>{{ obj &#124; except('a', 'b') }}</code>). |
| `e` / `escape` | HTML-escape — use it on values placed inside attributes. |
| `urlencode`, `tojson`, `round`, `length`, `join`, … | Jinja2 built-ins. |

## Marzban compatibility

A Marzban subscription template works unchanged because the same filters and
globals exist and `user` answers the Marzban names. The typical snippets:

```html
{{ user.used_traffic | bytesformat }} / {% if not user.data_limit %}∞{% else %}{{ user.data_limit | bytesformat }}{% endif %}
{% if not user.expire %}∞{% else %}{{ user.expire | datetime }}{% endif %}
{% set current_timestamp = now().timestamp() %}
<span x-data="{status: '{{ user.status.value }}'}"></span>
const subLinks = "{{ user.links }}"
```

Differences to know about: `user.proxies` / `user.inbounds` are empty
dictionaries; Zagros has protocols Marzban never had (OpenVPN, WireGuard, SSH,
SoftEther, PPTP), and those are **not** in `user.links` — a Marzban template
shows only the share links until you add a `sections` loop like the one below.

## A complete multi-protocol template

The template below is intentionally compact but complete: account header,
subscription link with QR and import buttons, then one card per section with
copy/QR for links, a **download button** for every config file, a credential
table with masked secrets, and notes. Start from the starter in the panel for
the fully styled version.

```html
<!doctype html>
<html lang="{{ lang }}" dir="{{ direction }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ brand | e }} · {{ user.username | e }}</title>
<style>
  body { font: 15px/1.6 system-ui, sans-serif; margin: 0; padding: 20px; background: #f4f6fb; color: #111; }
  .card { max-width: 720px; margin: 0 auto 16px; background: #fff; border-radius: 14px; padding: 18px; }
  .url { display: block; direction: ltr; text-align: left; padding: 8px 10px; background: #f3f4f6;
         border-radius: 8px; font-size: 13px; word-break: break-all; }
  .btn { display: inline-block; padding: 6px 12px; margin: 4px 4px 0 0; border: 1px solid #ddd;
         border-radius: 8px; background: #fff; color: #111; text-decoration: none; font: inherit; cursor: pointer; }
  .qr svg { width: 160px; height: 160px; }
  td { padding: 6px 4px; border-top: 1px solid #eee; }
  .note { padding: 8px 10px; background: #fef9c3; border-radius: 8px; font-size: 13px; }
</style>
</head>
<body>

<div class="card">
  <h1>{{ brand | e }}</h1>
  <p>{{ user.username | e }} · {{ user.status }} · {% if online %}online{% else %}offline{% endif %}</p>
  <p>
    {{ format_bytes(used_bytes) }} / {{ format_bytes(data_limit_bytes) }}
    {% if remaining_bytes is not none %}— {{ format_bytes(remaining_bytes) }} left{% endif %}
  </p>
  <p>
    {% if expire_at %}
      expires {{ format_date(expire_at) }}
      {% set d = days_left(expire_at) %}({% if d >= 0 %}{{ d }} days left{% else %}expired{% endif %})
    {% else %}never expires{% endif %}
  </p>
  {% if user.usage_ratio is not none %}
    <progress max="100" value="{{ (user.usage_ratio * 100) | round(1) }}"></progress>
  {% endif %}
</div>

{% if subscription_url %}
<div class="card">
  <h2>Subscription link</h2>
  <code class="url">{{ subscription_url | e }}</code>
  <button class="btn" data-copy="{{ subscription_url | e }}">Copy</button>
  {% for app_id, href in import_links.items() %}
    <a class="btn" href="{{ href | e }}">{{ app_id }}</a>
  {% endfor %}
  <div class="qr">{{ qr_svg(subscription_url) }}</div>
  <p>Clash: <code class="url">{{ subscription_formats.clash | e }}</code>
     sing-box: <code class="url">{{ subscription_formats.sing_box | e }}</code></p>
</div>
{% endif %}

{% for section in sections %}
<div class="card">
  <h2>{{ section.title | e }}</h2>
  {% if section.note %}<p class="note">{{ section.note | e }}</p>{% endif %}

  {% for a in section.artifacts %}
    {% if a.kind == "link" %}
      <p>{{ a.label | e }}</p>
      <code class="url">{{ a.content | e }}</code>
      <button class="btn" data-copy="{{ a.content | e }}">Copy</button>
      {% if a.qr %}<div class="qr">{{ qr_svg(a.content) }}</div>{% endif %}

    {% elif a.kind == "file" %}
      <p>{{ a.label | e }}</p>
      <a class="btn" href="{{ data_uri(a.content, a.mime) }}" download="{{ a.filename | e }}">
        Download {{ a.filename | e }}
      </a>
      <button class="btn" data-copy="{{ a.content | e }}">Copy</button>
      {% if a.qr %}<div class="qr">{{ qr_svg(a.content) }}</div>{% endif %}

    {% elif a.kind == "fields" %}
      <p>{{ a.label | e }}</p>
      <table>
        {% for f in a.fields %}
        <tr>
          <td>{{ f.label | e }}</td>
          <td dir="ltr">
            {% if f.secret %}
              <span data-secret="{{ f.value | e }}">••••••••</span>
              <button class="btn" data-reveal>Show</button>
            {% else %}
              {{ f.value | e }}
            {% endif %}
            {% if f.copyable %}<button class="btn" data-copy="{{ f.value | e }}">Copy</button>{% endif %}
          </td>
        </tr>
        {% endfor %}
      </table>

    {% elif a.kind == "note" %}
      <p class="note">{{ a.note | e }}</p>
    {% endif %}
  {% endfor %}
</div>
{% endfor %}

{% if apps %}
<div class="card">
  <h2>Apps</h2>
  {% for app in apps %}<a class="btn" href="{{ app.url | e }}">{{ app.name | e }} ({{ app.platform }})</a>{% endfor %}
</div>
{% endif %}

{% for n in notes %}<p class="note">{{ n | e }}</p>{% endfor %}
{% if support_url %}<p><a href="{{ support_url | e }}">Support</a></p>{% endif %}

<script>
document.addEventListener("click", function (ev) {
  var copy = ev.target.closest("[data-copy]");
  if (copy) {
    navigator.clipboard.writeText(copy.getAttribute("data-copy"));
    copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1200);
  }
  var reveal = ev.target.closest("[data-reveal]");
  if (reveal) {
    var span = reveal.parentNode.querySelector("[data-secret]");
    var shown = span.getAttribute("data-shown") === "1";
    span.textContent = shown ? "••••••••" : span.getAttribute("data-secret");
    span.setAttribute("data-shown", shown ? "0" : "1");
    reveal.textContent = shown ? "Show" : "Hide";
  }
});
</script>
</body>
</html>
```

What this gives a subscriber with, say, a VLESS inbound, a WireGuard peer and an
SSH account: three cards — the VLESS link with copy and QR, a **Download
alice-wg0.conf** button plus its QR (WireGuard apps scan it directly), and an
SSH table with the password masked until revealed. Users without a given core
simply do not get that card.

### Recipes

**Only some protocols, or a custom order**

```html
{# only these protocols #}
{% for section in sections if section.protocol in ("vless", "hysteria2") %} … {% endfor %}

{# files first, then everything else #}
{% for proto in ["wireguard", "ovpn"] %}
  {% for section in sections if section.protocol == proto %} … {% endfor %}
{% endfor %}
{% for section in sections if section.protocol not in ("wireguard", "ovpn") %} … {% endfor %}
```

**Download buttons for every config file at the top of the page**

```html
{% for f in files %}
  <a href="{{ f.href }}" download="{{ f.filename | e }}">{{ f.title | e }} — {{ f.filename | e }}</a>
{% endfor %}
```

**A quota bar that handles "unlimited" correctly**

```html
{% if data_limit_bytes %}
  {% set pct = (used_bytes / data_limit_bytes * 100) | round(1) %}
  <div class="bar"><span style="width: {{ [pct, 100] | min }}%"></span></div>
{% else %}
  <p>{{ format_bytes(used_bytes) }} — unlimited</p>
{% endif %}
```

**Language switch inside one template**

```html
{% if lang == "fa" %}باقی‌مانده{% else %}Remaining{% endif %}
```

## Escaping checklist

Because nothing is escaped automatically:

* Values inside attributes: always `| e` (<code v-pre>href="{{ a.content | e }}"</code>,
  <code v-pre>data-copy="{{ f.value | e }}"</code>).
* Values between tags: `| e` when they may contain `<` or `&`
  (file contents, labels, notes).
* Values inside `<script>` strings: prefer `| tojson`
  (<code v-pre>const links = {{ user.links | tojson }};</code>) — it produces a valid, safe
  JavaScript literal. The Marzban idiom <code v-pre>"{{ user.links }}"</code> keeps working.
* `qr_svg(...)`, `data_uri(...)`, `import_links` values and `files[].href`
  are generated by the panel and are safe to print as they are (`import_links`
  values still take `| e` inside an attribute, as in the example).

## Verifying from a shell

```bash
# what a browser gets (the template)
curl -s -A "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36" \
     -H "Accept: text/html" https://panel.example.com/sub/TOKEN | grep -o "<title>.*</title>"

# what a client app gets (unchanged by the template)
curl -s -A "v2rayNG/1.8.5" https://panel.example.com/sub/TOKEN | head -c 120

# the panel's own diagnosis: active template and the last render failure
curl -s -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/zagros/subscription/templates
```

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/zagros/subscription/templates` | `{templates: [{name, size, modified_at}], active, active_exists, last_failure}` — `last_failure` is `{template, error, line, at}` or `null` |
| `POST` | `/api/zagros/subscription/templates` | multipart upload: `file`, optional `activate` (default `true`). Validated; `400` with `line N: …` on failure |
| `PUT` | `/api/zagros/subscription/templates/active` | `{"name": "x.html"}` to select, `{"name": null}` for the built-in page |
| `GET` | `/api/zagros/subscription/templates/preview?name=x.html[&username=u]` | rendered HTML; `422` with the reason when it cannot render; `404` for an unknown user |
| `DELETE` | `/api/zagros/subscription/templates/{name}` | delete; clears the selection when it was the active file |
| `GET` | `/api/zagros/subscription/templates/starter` | the starter template |

Templates live in `<data dir>/subscription-templates/` on the master
(`/var/lib/zagros/subscription-templates/` with the standard installer). The
legacy `SUBSCRIPTION_TEMPLATE` environment variable is not used.

## Limitations

* **One template for everyone.** Branch inside it (`{% if user.status ==
  'limited' %}`, `{% if lang == 'fa' %}`) rather than expecting per-user files.
* **No filesystem or network access** from a template; images, fonts and
  scripts must be inline or served from elsewhere.
* **QR codes are limited to about 2.9 KB of text** — long OpenVPN profiles
  return an empty string from `qr_svg` (offer the download instead; WireGuard
  configurations and share links fit).
* **The application-login page and the client formats** are never affected by
  a template (see above).

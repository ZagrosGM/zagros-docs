# Custom subscription page

Replace the page your subscribers see when they open their link in a browser.

## The five steps

1. **Download the starter** — *Subscriptions → download starter* gives you a
   complete, working template with the variables documented in a comment.
2. **Edit it** in any editor.
3. **Upload** it — `.html`/`.htm`, at most 256 KB.
4. **Select** it in the same card and save.
5. **Verify** with a browser-like request (below).

::: tip
A template that is missing or fails to render never breaks a subscriber's page:
the built-in page is served instead and the reason is logged. Feel free to
iterate — your users never see a mistake.
:::

## A minimal template

```html
<!doctype html>
<html dir="rtl"><head><meta charset="utf-8"><title>{{ brand }}</title></head>
<body>
  <h1>{{ user.username }}</h1>
  {% for link in links %}<p><a href="{{ link.url }}">{{ link.label }}</a></p>{% endfor %}
</body></html>
```

## Showing quota

Guard the unlimited case — dividing by `none` produces a misleading "0 B / 0%":

```html
{% if data_limit_bytes %}
  {% set pct = (used_bytes / data_limit_bytes * 100) | round(1) %}
  <div class="bar"><span style="width: {{ [pct, 100] | min }}%"></span></div>
  <p>{{ format_bytes(used_bytes) }} of {{ format_bytes(data_limit_bytes) }} ({{ pct }}%)</p>
{% else %}
  <p>{{ format_bytes(used_bytes) }} — unlimited</p>
{% endif %}
```

## Every kind of material

```html
{% for section in sections %}
  <h2>{{ section.title }} <small>{{ section.protocol }}</small></h2>
  {% if section.note %}<p class="muted">{{ section.note }}</p>{% endif %}
  {% for a in section.artifacts %}
    {% if a.kind == "link" %}
      <a href="{{ a.content }}">{{ a.label }}</a>
    {% elif a.kind == "file" %}
      <a download="{{ a.filename }}"
         href="data:{{ a.mime }};charset=utf-8,{{ a.content | urlencode }}">{{ a.filename }}</a>
    {% elif a.kind == "fields" %}
      <dl>{% for f in a.fields %}<dt>{{ f.label }}</dt><dd>{{ f.value }}</dd>{% endfor %}</dl>
    {% elif a.kind == "note" %}
      <p>{{ a.note }}</p>
    {% endif %}
  {% endfor %}
{% endfor %}
```

Files become `data:` URIs so the page stays self-contained — external assets are
deliberately unsupported, because the page must render for subscribers who can
barely reach the panel.

## The variables

| Variable | Notes |
|---|---|
| `brand`, `app_name`, `support_url`, `notes`, `generated_at` | Panel-level |
| `user` | `username`, `status`, `online`, `used_bytes`, `data_limit_bytes`, `expire_at`, `remaining_bytes` |
| `used_bytes`, `data_limit_bytes`, `remaining_bytes`, `expire_at`, `online` | Shortcuts to the same values |
| `sections` | `{protocol, title, engine, note, inbound_tag, artifacts[]}` |
| `links` | Flat `{protocol, title, label, url}` for every `link` artifact |
| `apps` | `{platform, name, url, primary}` — populated in application-login mode |
| `page` | The whole page, including `lang` and `direction` |
| `format_bytes(v)`, `format_date(v)` | `1.00 KB` / `∞`, `2026/08/30` / `—` |

Artifact kinds are strings, compared as `"link"`, `"file"`, `"fields"`, `"note"`.

## Verifying

```bash
# the user's subscription URL
curl -s -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/user/USERNAME \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["subscription_url"])'

# ask for it like a browser
curl -s -A "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36" \
     -H "Accept: text/html" https://panel.example.com/sub/TOKEN
```

If you get the built-in page instead of yours:

```bash
docker compose logs zagros | grep -i "subscription template"
```

## Current limitations

* **No QR helper** — templates receive link text, not QR images.
* **One template for everyone** — branch inside it
  (`{% if user.status == 'limited' %}`) rather than expecting per-user files.
* **No filesystem or network access** from a template.

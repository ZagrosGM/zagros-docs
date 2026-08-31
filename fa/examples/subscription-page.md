# صفحهٔ اشتراکِ دلخواه

صفحه‌ای را که مشترکان با باز‌کردنِ لینکشان در مرورگر می‌بینند، خودتان بسازید.

## پنج قدم

1. **قالبِ آغازین را بگیرید** — *Subscriptions → download starter* یک قالبِ کامل
   و کار به شما می‌دهد که متغیّرها در کامنتِ همان فایل توضیح داده شده‌اند.
2. در هر ویرایشگری **ویرایش** کنید.
3. **آپلود** کنید — فقط `.html`/`.htm`، حداکثر ۲۵۶ کیلوبایت.
4. در همان بخش آن را **انتخاب** و ذخیره کنید.
5. با یک درخواستِ شبیه‌سازی‌شدهٔ مرورگر **بررسی** کنید (پایین).

::: tip
قالبی که نباشد یا به خطا بخورد، هرگز صفحهٔ مشترک را خراب نمی‌کند: صفحهٔ داخلی سرو
می‌شود و علت در لاگ نوشته می‌شود. با خیالِ راحت امتحان کنید — کاربران اشتباهِ شما را
نمی‌بینند.
:::

## یک قالبِ کمینه

```html
<!doctype html>
<html dir="rtl"><head><meta charset="utf-8"><title>{{ brand }}</title></head>
<body>
  <h1>{{ user.username }}</h1>
  {% for link in links %}<p><a href="{{ link.url }}">{{ link.label }}</a></p>{% endfor %}
</body></html>
```

## نمایشِ سهمیه

حالتِ نامحدود را دستی بررسی کنید — تقسیم بر `none` یک «۰ B / ۰٪» ی گمراه‌کننده
می‌سازد:

```html
{% if data_limit_bytes %}
  {% set pct = (used_bytes / data_limit_bytes * 100) | round(1) %}
  <div class="bar"><span style="width: {{ [pct, 100] | min }}%"></span></div>
  <p>{{ format_bytes(used_bytes) }} از {{ format_bytes(data_limit_bytes) }} ({{ pct }}٪)</p>
{% else %}
  <p>{{ format_bytes(used_bytes) }} — نامحدود</p>
{% endif %}
```

## همهٔ انواعِ مادّه

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

فایل‌ها به‌شکلِ نشانیِ `data:` در می‌آیند تا صفحه بی‌نیاز از هر چیزِ خارجی بماند —
داراییِ خارجی عامدانه پشتیبانی نمی‌شود، چون صفحه باید برای مشترکی هم که به‌سختی به
پنل می‌رسد کامل باشد.

## متغیّرها

| متغیّر | نکته |
|---|---|
| `brand`، `app_name`، `support_url`، `notes`، `generated_at` | سطحِ پنل |
| `user` | `username`، `status`، `online`، `used_bytes`، `data_limit_bytes`، `expire_at`، `remaining_bytes` |
| `used_bytes`، `data_limit_bytes`، `remaining_bytes`، `expire_at`، `online` | میان‌برِ همان مقادیر |
| `sections` | `{protocol, title, engine, note, inbound_tag, artifacts[]}` |
| `links` | خروجیِ صافِ `{protocol, title, label, url}` برای هر artifactِ `link` |
| `apps` | `{platform, name, url, primary}` — در حالتِ ورود با برنامه پر می‌شود |
| `page` | کلِ صفحه، شامل `lang` و `direction` |
| `format_bytes(v)` و `format_date(v)` | `1.00 KB` / `∞`، و `2026/08/30` / `—` |

نوع‌های artifact رشته‌اند و با `"link"`، `"file"`، `"fields"`، `"note"` مقایسه
می‌شوند.

## بررسی

```bash
# نشانیِ اشتراکِ کاربر
curl -s -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/user/USERNAME \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["subscription_url"])'

# درخواست مثلِ مرورگر
curl -s -A "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36" \
     -H "Accept: text/html" https://panel.example.com/sub/TOKEN
```

اگر به‌جای صفحهٔ خودتان صفحهٔ داخلی را گرفتید:

```bash
docker compose logs zagros | grep -i "subscription template"
```

## محدودیت‌های فعلی

* **کمکی برای QR نیست** — قالب متنِ لینک را می‌گیرد، نه تصویرِ QR.
* **یک قالب برای همه** — درونِ همان قالب شرط بگذارید
  (`{% if user.status == 'limited' %}`) نه اینکه انتظارِ فایلِ جداگانه برای هر
  کاربر داشته باشید.
* **دسترسی به فایل‌سیستم یا شبکه** از درونِ قالب وجود ندارد.

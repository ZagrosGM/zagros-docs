# API

هر کاری که داشبورد می‌کند، API هم می‌کند. این راهِ پشتیبانی‌شده برای وصل‌کردنِ
زاگرس به صدورصورت‌حساب، ربات یا اسکریپتِ تأمینِ شماست.

## احراز هویت

```bash
TOKEN=$(curl -s -X POST https://panel.example.com/api/admin/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=YOUR_ADMIN&password=YOUR_PASSWORD' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

curl -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/system
```

توکن یک JWT است با عمرِ `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`. با انقضایش `401`
می‌گیرید — یک توکنِ جدید بگیرید.

## سه سطح

| سطح | پیشوند | احراز | چیست |
|---|---|---|---|
| ادمین (سازگار با قدیم) | `/api/…` | توکنِ ادمین | کاربران، ادمین‌ها، آمارِ سیستم، درگاه‌ها، قالبِ کاربر |
| ادمینِ زاگرس | `/api/zagros/…` | توکنِ **sudo** | نودها، هسته‌ها، تنظیماتِ پورتال، گواهی‌ها، قالب‌های اشتراک، حضور، نمایِ داشبورد |
| اشتراک | `/sub/<token>` | خودِ توکن، بدون ورود | همان که کلاینت‌ها و مرورگرها می‌گیرند — [اشتراک](./subscriptions.md) |

بیشترِ `/api/zagros/*` عامدانه فقط‌sudo است: آن‌ها تغییر می‌دهند پنل چگونه
مستقر شده، نه فقط اینکه چه کاربرانی هستند. ادمینِ معمولی اینجا `403` می‌گیرد.

## مسیرهای پُرمصرف

| متد | مسیر | کاربرد |
|---|---|---|
| `GET` | `/api/system` | نسخه، تعدادِ کاربران، تعدادِ آنلاین، پهنای‌باند |
| `POST` | `/api/user` | ساختِ کاربر |
| `GET` | `/api/user/{username}` | یک کاربر، با `subscription_url` و `links` |
| `PUT` | `/api/user/{username}` | ویرایشِ کاربر |
| `DELETE` | `/api/user/{username}` | حذفِ کاربر |
| `POST` | `/api/user/{username}/revoke_sub` | چرخشِ توکنِ اشتراک |
| `GET` | `/api/zagros/nodes` | نودها و وضعیتشان |
| `GET` | `/api/zagros/cores` | وضعیت، نسخه و سلامتِ هسته‌ها |
| `GET`/`PUT` | `/api/zagros/settings/portal` | تنظیماتِ پورتال و اشتراک |
| `GET` | `/api/zagros/users/online` | وضعیتِ حضورِ تک‌تکِ کاربران **و** جمعِ آن‌ها |
| `GET` | `/api/zagros/subscription/templates` | قالب‌های آپلود‌شدهٔ صفحهٔ اشتراک |
| `GET` | `/api/zagros/certificates` | انبارِ مدیریت‌شدهٔ گواهی‌ها |

مستنداتِ تعاملیِ OpenAPI با `DOCS=true` فعال می‌شود
([پیکربندی](./configuration.md)) — در production آن را خاموش بگذارید.

## یک نمونهٔ کامل — ساختِ کاربر و دادنِ لینک

```bash
# ۱. ساخت
curl -s -X POST https://panel.example.com/api/user \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
        "username": "alice",
        "status": "active",
        "proxies": {"shadowsocks": {}},
        "inbounds": {"shadowsocks": ["Shadowsocks TCP"]}
      }'

# ۲. خواندنِ نشانیِ اشتراک
curl -s -H "Authorization: Bearer $TOKEN" \
  https://panel.example.com/api/user/alice \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["subscription_url"])'
```

## نمونهٔ دوم — حضور

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://panel.example.com/api/zagros/users/online
```

```json
{
  "states": {"alice": "online", "bob": "offline"},
  "counts": {"online": 1, "offline": 1, "unknown": 0},
  "collect_ts": 1788100766.1,
  "failed_cores": [],
  "probed_cores": 2,
  "window_seconds": 90
}
```

`counts` همان جمعِ `states` است، پس یک عددِ کلی نمی‌تواند با نقطه‌های تک‌تکِ
کاربران ناسازگار شود. `unknown` یعنی خواندنِ یک هسته شکست خورده — **نه** اینکه
کاربر آفلاین است.

## خطاها

| کد | معنا |
|---|---|
| `401` | توکن نیست یا منقضی شده — توکنِ جدید بگیرید |
| `403` | احراز شده ولی مجاز نیست (مثلاً ادمینِ غیرِ sudo روی `/api/zagros/*`، یا درخواستِ کاربرِ ادمینِ دیگر) |
| `404` | چنین چیزی نیست — مواردی که عامدانه یکی نشان داده می‌شوند (مسیرِ اشتراکِ غلط و توکنِ غلط هر دو این را برمی‌گردانند) |
| `422` | خطای اعتبارسنجی؛ پاسخ نامِ فیلد را می‌گوید |
| `503` | زیرساختِ احرازِ ادمین در دسترس نیست — پنل هنوز بالا می‌آید، یا پایگاه‌داده در دسترس نیست |

::: tip
API را به ویرایشِ مستقیمِ پایگاه‌داده ترجیح دهید. پایگاه‌داده وضعیتِ مشتق‌شده‌ای
هم دارد (اکانت‌های فرستاده‌شده به هسته‌ها،digestها، پایه‌ها) که با نوشتنِ مستقیم
کهنه می‌ماند.
:::

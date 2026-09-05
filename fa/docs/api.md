# API REST

زاگرس دو سطح HTTP احرازشده، به‌علاوهٔ سطح عمومی اشتراک و ورودِ برنامه دارد. این
صفحه قرارداد یکپارچه‌سازی برای سامانهٔ فروش، ربات و اسکریپت‌های provisioning است.

## نشانی پایه و احراز هویت

نشانی پایه، origin پنل است؛ هنگام ذخیره در یکپارچه‌ساز `/api` را به انتهای آن
اضافه نکنید. نمونه: `https://panel.example.com`.

توکن ادمین را با form data بگیرید:

```bash
TOKEN=$(curl -fsS -X POST https://panel.example.com/api/admin/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=YOUR_ADMIN' \
  --data-urlencode 'password=YOUR_PASSWORD' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
```

در همهٔ درخواست‌های احرازشده این هدر را بفرستید:

```http
Authorization: Bearer <access_token>
```

پاسخ ورود موفق شامل `access_token` و `token_type: "bearer"` است. عمر JWT با
`JWT_ACCESS_TOKEN_EXPIRE_MINUTES` تعیین می‌شود؛ پس از `401` توکن تازه بگیرید.
عملیات نود، هسته، استقرار، پشتیبان، گواهی و بیشتر مسیرهای `/api/zagros/*` به
ادمین **sudo** نیاز دارند. ادمین عادی فقط کاربران تحت مالکیت خودش را مدیریت
می‌کند.

## سطح‌های API

| سطح | مسیر | احراز | کاربرد |
|---|---|---|---|
| ادمین سازگار با Marzban | `/api/*` | JWT ادمین؛ بعضی عملیات فقط sudo | ادمین‌ها، کاربران، inboundsِ Xray، آمار و نودهای سازگاری |
| ادمین بومی زاگرس | `/api/zagros/*` | معمولاً JWT ادمین sudo | چندهسته‌ای، نود بومی، پورتال، routing، پشتیبان، امنیت و پشتیبانی |
| اشتراک | `/<subscription_path>/<token>` | توکن اشتراک | تحویل پورتال مرورگر و کانفیگ کلاینت |
| کلاینت برنامه | `/client/v1/*` | اطلاعات ورود/توکن برنامه | پروفایل حالت login و تحویل امن کانفیگ هسته |

درخواست JSON باید `Content-Type: application/json` داشته باشد. ورود form data
است؛ آپلود فایل، گواهی، قالب و تیکت با `multipart/form-data` انجام می‌شود.
فیلدهای حجم برحسب بایت صحیح، محدودیت سرعت برحسب Mbps صحیح، و `expire` قدیمی
برحسب ثانیهٔ Unix است (`0`/`null` یعنی بدون انقضا). زمان‌های پاسخ ISO-8601 UTC
هستند.

## سازگاری با MirzaBot

### افزودن زاگرس به MirzaBot

پنل را از مسیر **Marzban/API فعلی** اضافه کنید:

* URL: origin پنل زاگرس، بدون `/api` در انتها؛
* نسل API: حالت فعلی یا `version_panel = 2` که از `proxies`، `inbounds` و زمان
  Unix استفاده می‌کند؛
* اطلاعات ورود: اگر صفحه‌های مدیریت نود MirzaBot را می‌خواهید، ادمین sudo؛ برای
  کاربرانِ متعلق به یک ادمین، همان ادمین عادی کافی است؛
* پروتکل/inbound: مقدارهای `GET /api/inbounds` را کپی کنید.

هیچ هدر اختصاصی MirzaBot یا افزونهٔ زاگرس لازم نیست.

### همهٔ فراخوانی‌های بررسی‌شدهٔ MirzaBot

جدول زیر مجموعهٔ کامل فراخوانی‌های `Marzban.php` در منبع بررسی‌شدهٔ MirzaBot
است. همه در زاگرس v1.0.4 پیاده شده‌اند.

| عملیات Mirza | متد و مسیر دقیق | پاسخ زاگرس |
|---|---|---|
| ورود | `POST /api/admin/token` | `{access_token, token_type}` |
| آمار سیستم | `GET /api/system` | شمارنده‌های سیستم، کاربر و ترافیک |
| فهرست inbounds | `GET /api/inbounds` | آرایه‌های inbound به تفکیک پروتکل |
| ساخت کاربر | `POST /api/user` | شیء کاربر |
| خواندن کاربر | `GET /api/user/{username}` | کاربر، لینک‌ها و نشانی عمومی اشتراک |
| فهرست کاربران | `GET /api/users?status={status}` | `{users: [...], total}` |
| ویرایش کاربر | `PUT /api/user/{username}` | کاربر به‌روزشده |
| حذف کاربر | `DELETE /api/user/{username}` | پیام موفقیت |
| صفرکردن مصرف | `POST /api/user/{username}/reset` | کاربر به‌روزشده |
| لغو اشتراک | `POST /api/user/{username}/revoke_sub` | کاربر با URL/اطلاعات اتصال تازه |
| آخرین دریافت اشتراک (پروفایل قدیمی Mirza) | `GET /api/user/{username}/sub_update?offset=0&limit=1` | `{updates: [{created_at, user_agent}], total}`؛ حداکثر یک snapshot آخر |
| فهرست نودها | `GET /api/nodes` | آرایهٔ مستقیم JSON |
| خواندن نود | `GET /api/node/{id}` | شیء نود بومی با شکل Marzban |
| ترافیک نود | `GET /api/nodes/usage` | `{usages: [...]}` |
| ویرایش نود | `PUT /api/node/{id}` | نود به‌روزشده |
| اتصال مجدد نود | `POST /api/node/{id}/reconnect` | پیام موفقیت و نود |
| حذف نود | `DELETE /api/node/{id}` | `{}` |

زاگرس transport قدیمی و صرفاً-Xray نود Marzban را برنمی‌گرداند. این مسیرها alias
سازگاری روی سرویس نود بومی زاگرس با certificate pinning و journal پایدار مصرف
هستند.

## قرارداد کاربر

### ساخت: `POST /api/user`

کمینهٔ نمونهٔ Xray:

```bash
curl -fsS -X POST https://panel.example.com/api/user \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "alice",
    "status": "active",
    "proxies": {"vless": {}},
    "inbounds": {"vless": ["VLESS TCP REALITY"]},
    "data_limit": 10737418240,
    "expire": 1798761600,
    "ip_limit": 1,
    "device_limit": 1
  }'
```

| فیلد | نوع و قاعده | معنا |
|---|---|---|
| `username` | رشتهٔ ۳ تا ۳۲ کاراکتر | شناسهٔ حساب؛ حروف، عدد، `_`، `-`، `@` و `.` پذیرفته می‌شود |
| `status` | `active` یا `on_hold` | وضعیت هنگام ساخت؛ برای حالت عادی حذفش کنید. `on_hold` به `on_hold_expire_duration` و نداشتن expiry ثابت نیاز دارد |
| `proxies` | object | تنظیم Xray برای `vmess`، `vless`، `trojan` و `shadowsocks`؛ تنظیم `{}` اطلاعات اتصال را خودکار می‌سازد |
| `inbounds` | نگاشت پروتکل به آرایهٔ tag | انتخاب inboundهای Xray؛ حذف tagها برای یک proxy انتخاب‌شده یعنی همهٔ inboundهای فعال همان پروتکل |
| `core_access` | نگاشت core id به آرایهٔ tag | grant صریح چندهسته‌ای؛ حذف فیلد یعنی policy پیش‌فرض API و `{}` صریح یعنی بدون grant اضافه |
| `expire` | ثانیهٔ صحیح Unix، `0` یا `null` | انقضا؛ صفر/null یعنی نامحدود |
| `data_limit` | عدد صحیح بایت ≥ ۰ | سهمیهٔ کل؛ صفر/null یعنی نامحدود |
| `data_limit_reset_strategy` | `no_reset`، `day`، `week`، `month`، `year` | برنامهٔ بازنشانی خودکار سهمیه |
| `ip_limit` | عدد صحیح ≥ ۰ | بیشینهٔ IP مبدأ همزمان در همهٔ هسته‌ها و نودها؛ صفر/null یعنی نامحدود. بخش [معنای سقف IP](#معنای-سقف-ip) را ببینید |
| `device_limit` | عدد صحیح ≥ ۰ | بیشینهٔ دستگاه‌های پایدار ثبت‌شده برای دریافت اشتراک؛ صفر/null یعنی نامحدود. مقدار مثبت هدر `X-Device-ID` یا `X-HWID` را اجباری می‌کند. بخش [معنای دستگاه/HWID](#معنای-دستگاهhwid) را ببینید |
| `download_limit_mbps`، `upload_limit_mbps` | عدد صحیح strict بین ۰ تا ۱۰۰۰۰۰ | سقف تجمیعی سرعت؛ صفر یعنی نامحدود. رشتهٔ عددی و اعشار رد می‌شود |
| `note` | رشته تا ۵۰۰ کاراکتر | یادداشت اپراتور |
| `on_hold_expire_duration` | ثانیهٔ صحیح | مدتی که با اولین استفاده برای حساب on-hold شروع می‌شود |
| `on_hold_timeout` | زمان ISO یا null | فرادادهٔ اختیاری توقف |
| `next_plan` | object یا null | `{data_limit, expire, add_remaining_traffic, fire_on_either}` |

کاربر تازه باید دست‌کم یک proxyِ Xray یا یک grant غیرخالی در `core_access` داشته
باشد.

### خواندن و فهرست

* `GET /api/user/{username}` یک کاربر می‌دهد.
* `GET /api/users` پاسخ `{users, total}` می‌دهد و پارامترهای `offset`، `limit`،
  `username` تکرارشونده، `search`، `admin` تکرارشونده (فقط sudo)، `status` و
  `sort` جداشده با comma را می‌پذیرد.

فیلدهای مهم پاسخ:

```json
{
  "username": "alice",
  "status": "active",
  "used_traffic": 12345,
  "lifetime_used_traffic": 12345,
  "data_limit": 10737418240,
  "expire": 1798761600,
  "ip_limit": 1,
  "device_limit": 1,
  "proxies": {"vless": {"id": "...", "flow": ""}},
  "inbounds": {"vless": ["VLESS TCP REALITY"]},
  "core_access": {"sing-box": ["hy2-main"]},
  "links": ["vless://..."],
  "subscription_url": "https://sub.example.com/sub/test/<token>",
  "online_at": "2026-09-05T12:30:00Z",
  "sub_updated_at": "2026-09-05T12:29:00+00:00",
  "sub_last_user_agent": "v2rayNG/1.9"
}
```

اگر origin عمومی اشتراک تنظیم باشد، `subscription_url` از قبل مطلق است. ربات
باید آن را همان‌طور که دریافت می‌کند استفاده کند و URL پنل را دوباره به آن
نچسباند.

### ویرایش و چرخهٔ عمر

`PUT /api/user/{username}` به‌روزرسانی جزئی است: فیلد حذف‌شده/null مقدار فعلی را
نگه می‌دارد. وضعیت‌های قابل نوشتن `active`، `disabled` و `on_hold` هستند؛
`limited` و `expired` را زاگرس محاسبه می‌کند. `core_access` صریح grantها را تغییر
می‌دهد و حذفش، مقدار فعلی را نگه می‌دارد.

| متد | مسیر | نتیجه |
|---|---|---|
| `POST` | `/api/user/{username}/reset` | صفرکردن مصرف فعلی و بازگرداندن کاربر |
| `POST` | `/api/user/{username}/revoke_sub` | چرخش اشتراک و اطلاعات Xray؛ لینک قدیمی فوراً از کار می‌افتد |
| `GET` | `/api/user/{username}/usage?start=&end=` | مصرف به تفکیک نود |
| `POST` | `/api/user/{username}/active-next` | فعال و مصرف‌کردن `next_plan` |
| `PUT` | `/api/user/{username}/set-owner?admin_username=...` | تغییر مالک؛ فقط sudo |
| `DELETE` | `/api/user/{username}` | حذف دائمی کاربر و همهٔ حساب‌های هسته |
| `POST` | `/api/users/reset` | صفرکردن مصرف فعلی همهٔ کاربران؛ فقط sudo |
| `GET` | `/api/users/usage?start=&end=` | مصرف تجمیعی کاربر/نود |
| `GET`/`DELETE` | `/api/users/expired` | فهرست یا حذف کاربران در بازهٔ انقضا |

### معنای سقف IP

`ip_limit` سقف IP مبدأ آنلاین و یکپارچه میان همهٔ هسته‌هاست. زاگرس مشاهده‌های
دقیق حساب/IP را از هسته‌های محلی و نودهای بومی اجتماع می‌کند؛ یک IP که همزمان
از Xray و Hysteria2 استفاده کند برای همان کاربر یک بار شمرده می‌شود.

وقتی آدرس تازه از سقف عبور کند، زاگرس:

1. کاربر و تمام حساب‌هایش را فعال نگه می‌دارد؛
2. فقط جدیدترین IP اضافه را با nftables روی **درگاه‌های inbound مدیریت‌شدهٔ
   VPN** موقتاً مسدود و اتصال‌های فعال/conntrack آن را قطع می‌کند؛
3. همین ban را روی همهٔ هسته‌های محلی و نودهای بومی paired اعمال می‌کند؛
4. پس از پایان زمان، IP را خودکار آزاد می‌کند.

فاصلهٔ تشخیص پیش‌فرض ۵ ثانیه و مدت ban پیش‌فرض ۱۵ دقیقه است. sudo هر دو را در
`GET /api/zagros/security` می‌خواند و با `PUT /api/zagros/security/ip-limit`
تغییر می‌دهد:

```json
{"ban_duration_minutes": 15, "review_interval_seconds": 5}
```

HTTP داشبورد و اشتراک عمداً عضو مجموعه‌درگاه firewall نیستند؛ بنابراین IP
مسدود هنوز صفحهٔ اشتراک را باز می‌کند. banهای فعال/تاریخی در
`GET /api/zagros/security/ip-bans?active_only=true` دیده می‌شوند و
`DELETE /api/zagros/security/ip-bans/{id}` یکی را پایان می‌دهد (اگر IP هنوز
اضافه باشد در چرخهٔ بعد دوباره ban می‌شود).

محدودیت شبکه‌ای شمارش IP باقی است: چند دستگاه پشت NAT عمومی یک IP دیده می‌شوند
و reverse proxy که IP واقعی را پنهان کند تفکیک را ناممکن می‌سازد. هستهٔ IP-blind
ممکن است حضور آنلاین را ثابت کند، اما آدرس ساختگی به `ip_limit` اضافه نمی‌شود.

### معنای دستگاه/HWID

`device_limit` از IP آنلاین کاملاً مستقل است. وقتی مثبت باشد، تمام درخواست‌های
صفحه/feed اشتراک و مسیرهای تحویل Client API رسمی باید یکی از این شناسه‌های
پایدار را بفرستند:

```http
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
```

یا:

```http
X-HWID: 550e8400-e29b-41d4-a716-446655440000
```

اولین `device_limit` مقدار متمایز ثبت می‌شوند؛ مقدار تازه HTTP `403` می‌گیرد و
هیچ اطلاعات اشتراک/config تحویل نمی‌شود. درخواست بدون هدر شناسهٔ پایدار نیز
`403` می‌گیرد. IP و User-Agent هرگز HWID جایگزین نیستند. زاگرس فقط digest نوع
HMAC-SHA-256، نمایش کوتاه، زمان‌ها و آخرین User-Agent را نگه می‌دارد، نه شناسهٔ
خام.

endpointهای مدیریت sudo:

* `GET /api/zagros/users/by-username/{username}/devices`
* `DELETE /api/zagros/users/by-username/{username}/devices/{device_id}`
* `DELETE /api/zagros/users/by-username/{username}/devices` (پاک‌کردن همه)

این کنترل، دریافت/ثبت را محدود می‌کند نه secret صادرشده را: کاربر همچنان
می‌تواند config دانلودشده را دستی روی دستگاه دیگری کپی کند. اپ رسمی باید برای
هر نصب یک شناسهٔ تصادفی بسازد و امن و پایدار نگه دارد.

## قرارداد نود بومی سازگار با Mirza

فهرست، آرایهٔ مستقیم است و wrapper بومی `{nodes: [...]}` ندارد:

```json
[
  {
    "id": 7,
    "name": "Riga",
    "address": "203.0.113.7",
    "port": 62050,
    "api_port": 62051,
    "usage_coefficient": 1.25,
    "status": "connected",
    "message": null,
    "xray_version": "26.3.27",
    "agent_type": "zagros_native",
    "agent_version": "1.0.4",
    "last_seen": "2026-09-05T12:00:00+00:00"
  }
]
```

`PUT /api/node/{id}` فیلدهای `name`، `address`، `port`، `api_port`،
`usage_coefficient` و `add_as_new_host` را می‌پذیرد. pairing/health بومی مالک
`status` است، بنابراین نوشتن آن `422` می‌دهد. `message` همان `last_error` بومی و
`xray_version` از آخرین inventory هسته‌های نود است.

`GET /api/nodes/usage?start=<ISO>&end=<ISO>` چنین پاسخی دارد:

```json
{
  "usages": [
    {"node_id": 7, "node_name": "Riga", "uplink": 1000, "downlink": 9000}
  ]
}
```

مقادیر بایت‌های journal زاگرس پس از اعمال ضریب مصرف نود هستند. حذف تاریخ‌ها بازهٔ
پیش‌فرض قدیمی را به‌کار می‌برد.

## نقشهٔ endpointهای بومی زاگرس

API بومی از لایهٔ Mirza بزرگ‌تر است. سند OpenAPI تولیدشده مرجع دقیق فیلدهاست
(`DOCS=true` مسیرهای `/docs` و `/openapi.json` را فعال می‌کند). نقشهٔ کامل خانواده‌ها:

| خانواده | endpointها |
|---|---|
| هسته‌ها | `GET /api/zagros/cores`، `/cores/registry`، `/cores/capability-matrix`، `/cores/traffic/totals`، `/cores/{core_id}`، نسخه‌ها و logها؛ lifecycle با `install`، `uninstall`، `reinstall`، `start`، `stop`، `restart`، `enable`، `disable`، `update` |
| Inbound/Config Studio | `/api/zagros/inbounds`، raw studio، wizard schema/suggest-port و مسیرهای preview/apply/create/update/delete |
| Routing/Outbound | خانواده‌های `/api/zagros/routing/*` و `/outbounds/*`، parser لینک share و پروفایل WireGuard |
| نود بومی | CRUD در `/api/zagros/nodes`؛ installer، discover، pair، reconnect، heartbeat، sync؛ inventory/settings/lifecycle/version/log هر هستهٔ نود |
| پورتال/اشتراک | `/api/zagros/settings/portal`؛ صدور token/URL زیر `/users`؛ list/upload/preview/starter/activate/delete قالب |
| حضور/دستگاه/session | `/api/zagros/users/online`، `/sessions`، `/devices`، `/client-sessions` و مسیرهای revoke/delete |
| گواهی/شبکه | `/api/zagros/certificates` شامل import، self-signed و ACME؛ تست/save/apply/status در `/settings/panel-network` |
| کاربر/عملیات | bulk create، حذف براساس status، dashboard snapshot و legacy migration |
| پشتیبان/بازیابی | artifactها، create و service زیر `/api/zagros/backup/*`؛ `/restore/upload`، `/restore/inspect`، `/restore/apply` |
| امنیت | `/api/zagros/security`، credentials، sessions و token lifetime |
| پشتیبانی | `/api/zagros/support/config`، `/support/test`، `/support/ticket` |
| پیش‌فرض پیشرفتهٔ API | `GET/PUT /api/zagros/settings/api-defaults` فقط وقتی create فاقد `core_access` است grant را تعیین می‌کند؛ کارت آن عامدانه در General نمایش داده نمی‌شود |

## مسیر اشتراک

مسیر می‌تواند چند segment امن داشته باشد؛ نمونه `sub/test`. طول کل مسیر ۱ تا ۳۲
کاراکتر است. هر segment با حرف کوچک/عدد شروع می‌شود و ادامه فقط حروف کوچک، عدد،
`.`، `_` یا `-` است. segment خالی، `.`/`..` و پیشوندهای رزروشده مانند `api`،
`dashboard`، `statics`، `client`، `docs`، `redoc`، `openapi`، `favicon` و `health`
رد می‌شوند.

URL اصلی `/<configured-path>/<token>` است. aliasهای پایدار `/sub/<token>` و
`/zagros/sub/<token>` باقی می‌مانند. عوض‌کردن یک مسیر سفارشی به مسیر دیگر، مسیر
سفارشی قبلی را حفظ نمی‌کند.

## خطاها

خطای FastAPI شکل `{"detail": ...}` دارد (اعتبارسنجی، آرایهٔ detail می‌دهد).

| کد | معنا |
|---|---|
| `400` | عملیات یا درخواست مخصوص هسته نامعتبر است |
| `401` | توکن موجود نیست، نامعتبر یا منقضی است |
| `403` | احراز شده ولی مجاز نیست |
| `404` | شیء/مسیر پیدا نشد؛ مسیر اشتراک غلط و توکن غلط عامدانه یکسان‌اند |
| `409` | تعارض، شیء تکراری یا انتقال ناامن وضعیت نود |
| `413` | آپلود از سقف endpoint بیشتر است (پیوست پشتیبانی حداکثر ۱۰ MB) |
| `422` | schema یا فیلد درخواست نامعتبر است |
| `502` | نود، هسته یا سرویس upstream عملیات را رد کرده است |
| `503` | runtime، پایگاه‌داده یا سرویس احراز لازم در دسترس نیست |

::: tip
به‌جای نوشتن مستقیم SQL از API استفاده کنید. زاگرس projectionها، حساب‌های هر
هسته، اطلاعات رمز‌شده، baselineهای مصرف و وضعیت نود را هم نگه می‌دارد؛ تغییر
مستقیم پایگاه‌داده این وضعیت‌های مشتق‌شده را کهنه می‌کند.
:::

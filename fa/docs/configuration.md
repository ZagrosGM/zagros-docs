# پیکربندی

تنظیماتِ استقرار در فایلِ `.env` کنارِ `docker-compose.yml` است (به‌طور پیش‌فرض
`/opt/zagros/.env`). آن را با خط‌فرمان بخوانید و ویرایش کنید، نه دستی:

```bash
sudo zagros env show
sudo zagros env set KEY value
sudo zagros restart        # .env فقط هنگامِ ساختِ دوبارهٔ کانتینر خوانده می‌شود
```

::: warning
این `restart` است که تغییرِ `.env` را اعمال می‌کند (نه `reload`)، چون compose باید
کانتینر را با مقادیرِ جدید از نو بسازد.
:::

## هویت و نشانی‌ها

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `DOMAIN` | *(خالی)* | نامِ عمومیِ پنل، بدون طرح و مسیر. مبنای نشانی‌های مشتق‌شدهٔ پایین. |
| `PANEL_BASE_URL` | مشتق از `DOMAIN` | نشانیِ عمومیِ پنل، وقتی مشتق‌شدن همان چیزی نیست که می‌خواهید. |
| `APP_BASE_URL` | `PANEL_BASE_URL` | نشانیِ پایه در مادّه‌ای که به برنامه داده می‌شود. |
| `ZAGROS_PORTAL_TITLE` | `اشتراک من` | عنوانِ صفحهٔ پورتالِ اشتراک. |
| `ZAGROS_APP_NAME` | `Zagros` | نامی که کاربر می‌بیند. |
| `DASHBOARD_PATH` | `/dashboard/` | جایی که داشبورد سرو می‌شود. |

## اتصالِ HTTP و TLS

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `UVICORN_HOST` | `0.0.0.0` | نشانیِ اتصال — همان‌طور که هست به‌کار می‌رود. |
| `UVICORN_PORT` | `8000` | پورتِ پنل. |
| `UVICORN_UDS` | *(خالی)* | سرو روی سوکتِ یونیکس به‌جای TCP. |
| `TLS_MODE` | `auto` | `auto` / `on` / `off` — آیا خودِ پنل HTTPS می‌دهد. |
| `UVICORN_SSL_CERTFILE` | *(خالی)* | فایلِ گواهی هنگامِ فعال‌بودنِ TLS. |
| `UVICORN_SSL_KEYFILE` | *(خالی)* | فایلِ کلید هنگامِ فعال‌بودنِ TLS. |
| `UVICORN_SSL_CA_CERTFILE` | *(خالی)* | دستهٔ CA برای تأییدِ کلاینت. |
| `UVICORN_SSL_CA_TYPE` | `public` | کدام مجموعهٔ CA اعتماد شود. |
| `ZAGROS_HSTS` | `False` | ارسالِ هدرِ HSTS. |
| `DEBUG` | `False` | حالتِ اشکال‌زدایی — هرگز در production. |
| `DOCS` | `False` | نمایشِ مستنداتِ OpenAPI. |

## امنیت

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `ZAGROS_SECRET_KEY` | *(لازم)* | کلیدی که وضعیتِ استقرار را محافظت می‌کند. مقداری بلند و تصادفی بسازید. |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | عمرِ توکنِ ادمین. `0` یعنی بی‌انقضا. |
| `SUDO_USERNAME` / `SUDO_PASSWORD` | *(خالی)* | ادمینِ sudo آغازین، وقتی هنوز ادمینی وجود ندارد. |

## پایگاه‌داده‌ها

زاگرس دو انبار دارد: پایگاه‌دادهٔ **پلتفرم** (کاربران، هسته‌ها، نودها، تنظیمات) و
یک پایگاه‌دادهٔ **قدیمی** برای جدول‌های ادمین/احراز‌هویتِ به‌جامانده.

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `ZAGROS_DATABASE_URL` | `sqlite:////var/lib/zagros/zagros.db` | پایگاه‌دادهٔ پلتفرم. |
| `SQLALCHEMY_DATABASE_URL` | `sqlite:///db.sqlite3` | پایگاه‌دادهٔ قدیمی. |
| `SQLALCHEMY_POOL_SIZE` | `10` | اندازهٔ استخرِ اتصال. |
| `SQLIALCHEMY_MAX_OVERFLOW` | `30` | اتصال‌های افزون بر استخر. |

::: tip
املای `SQLIALCHEMY_MAX_OVERFLOW` یک اشتباهِ تایپی است که از نسخه‌های اولیه مانده و
همچنان پذیرفته می‌شود — دقیقاً همین را به‌کار ببرید، وگرنه تنظیم بی‌صدا نادیده
گرفته می‌شود.
:::

## اشتراک و قالب‌ها

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `SUBSCRIPTION_TEMPLATE` | `subscription/index.html` | تنظیمِ قدیمیِ (مرزبان)؛ پذیرفته می‌شود اما برای صفحه‌ای که مشترکان می‌بینند **به کار نمی‌رود** — آن صفحه از *Subscriptions → subscription page template* در خودِ پنل مدیریت می‌شود (ببینید [صفحهٔ اشتراکِ دلخواه](../examples/subscription-page.md)). نامِ قدیمی: `SUBSCRIPTION_PAGE_TEMPLATE`. |
| `HOME_PAGE_TEMPLATE` | `home/index.html` | قالبِ صفحهٔ اصلیِ پنل. |
| `CUSTOM_TEMPLATES_DIRECTORY` | *(خالی)* | پوشه‌ای که **پیش از** قالب‌های داخلی جست‌وجو می‌شود. |
| `CLASH_SUBSCRIPTION_TEMPLATE` | `clash/default.yml` | پروفایلِ Clash. |
| `SINGBOX_SUBSCRIPTION_TEMPLATE` | `singbox/default.json` | پروفایلِ sing-box. |
| `MUX_TEMPLATE` | `mux/default.json` | تنظیماتِ Mux. |
| `V2RAY_SUBSCRIPTION_TEMPLATE` | `v2ray/default.json` | JSONِ v2ray. |
| `USER_AGENT_TEMPLATE` | `user_agent/default.json` | قواعدِ تشخیصِ کلاینت. |
| `SUB_UPDATE_INTERVAL` | `12` | هدرِ `profile-update-interval` (ساعت). |
| `SUB_SUPPORT_URL` | `https://t.me/` | هدرِ `support-url`. |
| `SUB_PROFILE_TITLE` | `Subscription` | هدرِ `profile-title`. |

صفحه‌ای که مشترکان می‌بینند معمولاً در داشبورد انتخاب می‌شود
(*Subscriptions → subscription page template*)؛ این متغیّرها پیش‌فرضِ سطحِ
استقرار هستند. [اشتراک](./subscriptions.md) را ببینید.

## اعلان‌ها

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `TELEGRAM_API_TOKEN` | *(خالی)* | توکنِ ربات. |
| `TELEGRAM_LOGGER_CHANNEL_ID` | `0` | کانال/گفتگویی که لاگ می‌گیرد. |
| `TELEGRAM_PROXY_URL` | *(خالی)* | پروکسی برای فراخوانیِ تلگرام. |
| `DISCORD_WEBHOOK_URL` | *(خالی)* | وب‌هوکِ دیسکورد برای لاگ. |
| `WEBHOOK_SECRET` | *(خالی)* | کلیدِ امضای وب‌هوک‌های خروجی. |
| `NOTIFY_STATUS_CHANGE`، `NOTIFY_USER_CREATED`، `NOTIFY_USER_UPDATED`، `NOTIFY_USER_DELETED`، `NOTIFY_USER_DATA_USED_RESET`، `NOTIFY_USER_SUB_REVOKED`، `NOTIFY_LOGIN` | `True` | کدام رخدادها اطلاع بدهند. |
| `NOTIFY_IF_DATA_USAGE_PERCENT_REACHED`، `NOTIFY_IF_DAYS_LEFT_REACHED` | `True` | اعلان‌های آستانه‌ای. |
| `RECURRENT_NOTIFICATIONS_TIMEOUT` | `180` | فاصلهٔ تلاشِ مجدد (ثانیه). |
| `NUMBER_OF_RECURRENT_NOTIFICATIONS` | `3` | تعدادِ تلاش پس از ارسالِ ناموفق. |

## کاربران و کارها

| متغیّر | پیش‌فرض | معنا |
|---|---|---|
| `USERS_AUTODELETE_DAYS` | `-1` | حذفِ کاربران، این‌قدر روز پس از انقضا (`-1` یعنی غیرفعال). |
| `USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS` | `False` | حذفِ کاربرانی که سهمیه‌شان تمام شده. |
| `ACTIVE_STATUS_TEXT`، `EXPIRED_STATUS_TEXT`، `LIMITED_STATUS_TEXT`، `DISABLED_STATUS_TEXT`، `ONHOLD_STATUS_TEXT` | `Active`، `Expired`، `Limited`، `Disabled`، `On-Hold` | برچسب‌های فرستاده‌شده با اعلان. |
| `DISABLE_RECORDING_NODE_USAGE` | `False` | توقفِ ثبتِ مصرفِ نود. |
| `JOB_CORE_HEALTH_CHECK_INTERVAL` | `10` | فاصلهٔ بررسیِ سلامتِ هسته. |
| `JOB_RECORD_NODE_USAGES_INTERVAL` | `30` | جمع‌آوریِ مصرفِ نود. |
| `JOB_RECORD_USER_USAGES_INTERVAL` | `10` | جمع‌آوریِ مصرفِ کاربر. |
| `JOB_REVIEW_USERS_INTERVAL` | `10` | بازبینیِ انقضا و سهمیه. |
| `JOB_SEND_NOTIFICATIONS_INTERVAL` | `30` | تحویلِ اعلان‌ها. |

## اعمالِ یک تغییر

```bash
sudo zagros env set JOB_REVIEW_USERS_INTERVAL 30
sudo zagros restart
sudo zagros status
```

اگر پنل برنگشت، `zagros logs` سریع‌ترین راهِ دیدنِ علت است و `zagros doctor`
کلِ میزبان را بررسی می‌کند.

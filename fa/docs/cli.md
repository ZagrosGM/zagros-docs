# خط فرمان

خط‌فرمانِ `zagros` **میزبان** را مدیریت می‌کند — سرویس‌ها، ایمیج‌ها، هسته‌ها،
محیط، پشتیبان‌ها. هرچه مربوط به کاربران است در داشبورد یا
[API](./api.md) است.

دو سطح دارد: دستوراتِ روزمره در سطحِ اصلی، و بقیه زیر `advanced`. دستوراتِ
`advanced` در سطحِ اصلی هم پذیرفته می‌شوند، پس اسکریپت‌های قدیمی همچنان کار
می‌کنند.

## دستوراتِ روزمره

| دستور | کار |
|---|---|
| `up` | راه‌اندازیِ پنل (`compose up -d`) |
| `down` | توقف و حذفِ کانتینرهای پنل |
| `restart` | ساختِ دوبارهٔ پنل — همیشه تغییراتِ `.env` را اعمال می‌کند |
| `status` | سرویس‌ها، ایمیج، سلامت و جدولِ هسته‌ها |
| `logs [svc] [--tail N]` | دنبال‌کردنِ لاگِ پنل |
| `update` | پشتیبان ← کشیدن ← migration ← سلامت، با بازگشتِ خودکار |
| `cores` | هسته‌های نصب‌شده: وضعیت، نسخه، سلامت |
| `cores install\|update\|uninstall\|reload <core>` | مدیریتِ یک هسته (`--version X` یک نسخه را پین می‌کند) |
| `env [show\|edit\|get K\|set K V]` | فایلِ `.env` — تنها مرجعِ تنظیمات |
| `backup [--logs]` | پشتیبانِ کامل: پایگاه‌داده، پیکربندی، گواهی‌ها، کلیدها، هسته‌ها |
| `restore <file\|latest>` | بازگردانیِ یک پشتیبان |
| `version` | نسخهٔ CLI، ایمیج، پنل و آخرین انتشار |
| `help` | راهنما |

### هسته‌ها

```bash
sudo zagros cores                        # جدولِ هسته‌های نصب‌شده
sudo zagros cores install singbox        # نصبِ یک هسته
sudo zagros cores update xray --version v26.6.1
sudo zagros cores reload wireguard       # راه‌اندازیِ دوبارهٔ یک هسته
sudo zagros cores uninstall pptp --purge # حذف با بررسیِ وابستگی
```

### محیط

```bash
sudo zagros env show          # .env مؤثر
sudo zagros env get UVICORN_PORT
sudo zagros env set UVICORN_PORT 8000
sudo zagros restart           # اعمالِ تغییر
```

## دستوراتِ advanced

| دستور | کار |
|---|---|
| `install` | نصبِ یک‌دستوری (`--database sqlite\|mysql\|mariadb\|postgresql`) |
| `uninstall [--yes]` | حذفِ کاملِ کانتینرها، ایمیج‌ها، داده‌ها و خودِ CLI |
| `rollback [--to <tag>]` | بازگشت به نسخهٔ قبلی |
| `start` \| `stop` \| `reload` | کنترلِ ظریف‌تر از `up`/`down`/`restart` |
| `doctor [--json]` | گزارشِ کاملِ سیستم (داکر/دیتابیس/هسته‌ها/پورت‌ها/DNS/رجیستری) |
| `health` | بررسیِ ترکیبیِ سریع؛ خروجی ۱ در صورتِ ناسالمی |
| `repair` | تعمیرهای خودکارِ امن (پوشه‌ها، env، ایمیج، کانتینر، schema) |
| `shell` | ورود به کانتینرِ پنل |
| `migrate` | اجرای migration همین حالا |
| `sync [--core X]` | اعمالِ دوبارهٔ همهٔ اکانت‌ها روی هسته‌های فعال |
| `create-admin` | ساختِ ادمینِ sudo یا معمولی |
| `reset-admin` | بازنشانیِ رمزِ ادمین |
| `install-host-agent` | ایجنتِ اعمال/بازگشتِ Settings → Panel Network |
| `backup-service` | بستهٔ فقط‌سیستمی (compose، env، وضعیتِ CLI) |
| `clean [--keep N]` | حذفِ پشتیبان‌های قدیمی |
| `prune` | پاک‌سازیِ ایمیج‌های داکر و تگ‌های منسوخ |

## چند دستورِ آماده

**ارتقای امن**

```bash
sudo zagros update && sudo zagros health
```

**تغییرِ پورتِ پنل**

```bash
sudo zagros env set UVICORN_PORT 8443
sudo zagros restart
sudo zagros status
```

**پشتیبان پیش از هر تغییر**

```bash
sudo zagros backup            # مسیرِ آرشیو را چاپ می‌کند
sudo zagros restore latest    # و اگر لازم شد برگرداندن
```

**وقتی چیزی درست نیست**

```bash
sudo zagros doctor --json | jq .
sudo zagros repair
```

::: tip
`zagros update` همیشه پیش از تغییر پشتیبان می‌گیرد و اگر بررسیِ سلامت شکست بخورد
ایمیج را برمی‌گرداند. برای همین بی‌فکر هم امن است — اما یک `zagros backup`ِ
خودتان پیش از یک جهشِ بزرگ هیچ‌وقت بد نیست.
:::

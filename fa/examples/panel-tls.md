# TLS برای پنل

دو راه برای سروِس‌دادنِ HTTPS، که معمولاً یکی از آن‌ها برای شما درست است.

## گزینهٔ ۱ — یک reverse proxy TLS را خاتمه می‌دهد (توصیه‌شده)

پنل روی پورتِ خودش HTTPِ ساده می‌دهد؛ Nginx، Caddy یا Traefik جلوی آن مالکِ گواهی
است. این کم‌حیرت‌کننده‌ترین چیدمان است: تمدید، HTTP/2 و گواهی‌های سرویس‌های دیگر
همه یک‌جا می‌مانند.

```bash
sudo zagros env set TLS_MODE off       # یا auto — پروکسی نقطهٔ پایانیِ TLS است
sudo zagros env set UVICORN_PORT 8000
sudo zagros restart
```

بعد پروکسی را به `127.0.0.1:8000` وصل کنید و بگذارید `443` را سرو کند.

::: warning
وقتی پروکسی جلو است، نشانیِ **عمومی** را به زاگرس بگویید (`DOMAIN`، یا
`PANEL_BASE_URL`)، وگرنه لینک‌هایی که می‌سازد به `http://127.0.0.1:8000` اشاره
می‌کنند.
:::

## گزینهٔ ۲ — خودِ پنل TLS می‌دهد

وقتی چیزِ دیگری به آن پورت نیاز ندارد.

```bash
sudo zagros env set TLS_MODE on
sudo zagros env set UVICORN_PORT 443
sudo zagros env set UVICORN_SSL_CERTFILE /path/to/fullchain.pem
sudo zagros env set UVICORN_SSL_KEYFILE  /path/to/privkey.pem
sudo zagros env set ZAGROS_HSTS true
sudo zagros restart
sudo zagros status
```

`TLS_MODE=auto` (پیش‌فرض) وقتی هر دو فایلِ گواهی و کلید تنظیم شده باشند TLS را
فعال می‌کند و در غیر این صورت HTTPِ ساده — وقتی یک `.env` در یک محیط پشتِ پروکسی
و در محیطی دیگر مستقیم به‌کار می‌رود، به‌درد می‌خورد.

## پشتِ سوکتِ یونیکس

اگر پروکسی روی همان میزبان است، یک سوکت اصلاً پورتی را باز نمی‌کند:

```bash
sudo zagros env set UVICORN_UDS /var/lib/zagros/panel.sock
sudo zagros restart
```

## بررسی

```bash
curl -sI https://panel.example.com/dashboard/ | head -1
sudo zagros doctor        # پورت، TLS و اینکه چه چیزی گوش می‌دهد
```

## دام‌ها

| نشانه | علت |
|---|---|
| لینک‌ها به `127.0.0.1` اشاره می‌کنند | در حالی که پروکسی جلو است، `DOMAIN`/`PANEL_BASE_URL` تنظیم نشده |
| هشدارِ گواهی در مرورگر | گواهی نامی را که کاربر باز می‌کند پوشش نمی‌دهد — برای همان نام صادر کنید |
| محتوای ترکیبی روی پورتال | لینک‌های اشتراک پیش از رفتن به HTTPS ساخته شده‌اند؛ لینکِ کاربر را لغو و دوباره صادر کنید |

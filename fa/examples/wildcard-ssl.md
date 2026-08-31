# گواهی wildcard

یک گواهیِ wildcard (`*.example.com`) همهٔ زیردامنه‌ها را یک‌جا پوشش می‌دهد — وقتی
هر نود یا هر نقطهٔ ورود نامِ خودش را دارد به‌کار می‌آید.

## چرا داشبورد نمی‌تواند آن را صادر کند

اعتبارسنجیِ HTTP-01 مالکیتِ **یک نام** را با سرو‌کردنِ یک فایل روی پورتِ ۸۰ ثابت
می‌کند. یک wildcard نامِ واحادی ندارد که فایلی برایش سرو شود، برای همین ACME
**DNS-01** می‌خواهد: باید بتوانید خودکار یک رکوردِ TXT بسازید. پنل مشخّصاتِ DNS شما
را ندارد، پس این کار را برایتان نمی‌کند.

## صدور با کلاینتِ خودتان

با `acme.sh` و یک تأمین‌کنندهٔ DNS که API دارد:

```bash
# یک‌بار: مشخّصاتِ تأمین‌کنندهٔ DNS
export CF_Token="..."
export CF_Zone_ID="..."

acme.sh --issue --dns dns_cf -d 'example.com' -d '*.example.com' \
        --cert-file  /var/lib/zagros/certs/wildcard/cert.pem \
        --key-file   /var/lib/zagros/certs/wildcard/key.pem \
        --fullchain-file /var/lib/zagros/certs/wildcard/fullchain.pem
```

`certbot` و `lego` هم با پلاگین‌های DNS خودشان همین کار را می‌کنند.

## وارد‌کردن به انبارِ مدیریت‌شده

فایل‌ها را زیرِ پوشهٔ داده (`/var/lib/zagros`) بگذارید و در **Certificates**
اضافه کنید تا داشبورد هم از آن‌ها خبر داشته باشد — بعد این گواهی را می‌توان مثل
بقیه برای پنل یا شنوندهٔ اشتراک انتخاب کرد.

::: warning
گواهیِ وارد‌شده فهرست می‌شود و از نظرِ انقضا بررسی می‌شود، اما **تمدیدش با
شماست**: هرچه صادرش کرده باید تمدیدش هم بکند، و معمولاً جواب همان یک خط cron است.
:::

```bash
# تمدید با همان کلاینت، بعد بازخوانیِ پنل
acme.sh --renew -d 'example.com' --force
sudo zagros restart
```

## استفاده

| کجا | چطور |
|---|---|
| پنل | `UVICORN_SSL_CERTFILE` / `UVICORN_SSL_KEYFILE` ← `zagros restart` |
| شنوندهٔ اشتراک | **Subscriptions → TLS certificate** ← انتخابش کنید |
| نودها | هر نود TLSِ کنترل‌پلنِ خودش را دارد؛ پنل همان گواهی را پین می‌کند، به گواهیِ شما نیازی نیست |

## بررسی

```bash
openssl s_client -connect panel.example.com:443 -servername panel.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates
sudo zagros doctor
```

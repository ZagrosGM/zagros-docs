# مهاجرت

در این صفحه دو مهاجرت شرح داده شده که کاملاً مستقل از هم هستند:

۱. **[آمدن از پنلی دیگر](#از-پنل-دیگر)** — انتقال کاربران Marzban، PasarGuard یا 3x-ui به زاگرس.
۲. **[تغییر موتور دیتابیس](#تغییر-موتور-دیتابیس)** — یک نصب موجود زاگرس از SQLite به MySQL / MariaDB / PostgreSQL منتقل می‌شود.

پیش از اجرای هر دستوری، کل بخش مورد نیازتان را بخوانید. هر دو روش ابتدا پشتیبان می‌گیرند و هر دو تا زمانی که آن پشتیبان را پاک نکرده‌اید برگشت‌پذیرند.

---

## پیش از شروع

زاگرس **دو** دیتابیس دارد، و همین یک نکته بیشتر دستورهای این صفحه را توضیح می‌دهد:

| دیتابیس | متغیر محیطی | چه چیزی در آن است |
| --- | --- | --- |
| مخزن legacy | `SQLALCHEMY_DATABASE_URL` | کاربران، پروکسی‌ها، هاست‌ها، مدیران، نودها — همان جدول‌های Marzban-shaped پشت `/api/users`، اشتراک‌ها و ساخت لینک |
| مخزن platform | `ZAGROS_DATABASE_URL` | وضعیت چندهسته‌ای — هسته‌ها، provisioning هر هسته، سهمیهٔ یکپارچه، دستگاه‌ها، نشست‌ها، ردّ ممیزی |

یک کاربر تنها وقتی کامل است که **هر دو نیمه** وجود داشته باشند. هر روشی که یکی را کپی کند و دیگری را نه، پنلی می‌سازد که تعداد ردیف‌ها را سالم گزارش می‌دهد ولی فهرست کاربران خالی است.

هر دو آدرس در `/opt/zagros/.env` هستند. با این دستور ببینیدشان (مقادیر حساس ماسک می‌شوند):

```bash
sudo zagros env show
```

---

## از پنل دیگر

### چه چیزی قابل انتقال است

وارد‌کننده منبع را از روی خودِ دیتابیس تشخیص می‌دهد، پس لازم نیست حتماً درست حدس بزنید — ولی این‌ها پنل‌هایی هستند که می‌شناسد:

| منبع | پشتیبانی | توضیح |
| --- | --- | --- |
| Marzban | ✅ | منبع مرجع — کاربران، پروکسی‌ها، هاست‌ها، مدیران، نودها، گزارش مصرف |
| PasarGuard | ✅ | ساختار جدولی مشابه Marzban؛ با همان مسیر خوانده می‌شود |
| 3x-ui | ⚠️ ناقص | کاربران و کلاینت‌های inbound منتقل می‌شوند؛ هش گذرواژهٔ مدیران قابل راستی‌آزمایی نیست، پس مدیران **بدون** گذرواژهٔ قابل استفاده می‌آیند |
| Zagros | ✅ | آرشیو پشتیبان زاگرس — این بازگردانی است، نه واردکردن |

پوشش پروتکل‌ها به آن‌چه مخزن legacy می‌تواند نمایش دهد محدود است: `vmess`، `vless`، `trojan` و `shadowsocks`. کلاینتی روی `hysteria2`، `tuic` یا هر پروتکل خارج از این مجموعه **به‌عنوان رد‌شده گزارش می‌شود**، نه اینکه بی‌صدا حذف شود — آن کاربران را پس از انتقال روی یک هستهٔ بومی زاگرس بسازید.

::: tip نسخه‌های قدیمی 3x-ui
هر دو ساختار 3x-ui پشتیبانی می‌شوند: کلاینت‌های ذخیره‌شده داخل JSON ستون `inbounds.settings` (نسخه‌های قدیمی‌تر) و کلاینت‌ها در جدول جداگانهٔ `client_inbounds` (نسخه‌های جدیدتر).
:::

### گام ۱ — گرفتن دیتابیس از سرور مبدأ

روی سرور پنل **قدیمی**:

::: code-group

```bash [Marzban / PasarGuard]
sudo cp /var/lib/marzban/db.sqlite3 /root/legacy-source.db
```

```bash [3x-ui]
sudo cp /etc/x-ui/x-ui.db /root/legacy-source.db
```

```bash [Marzban روی MySQL]
sudo docker exec marzban-mysql-1 mysqldump \
  -u root -p"$MYSQL_ROOT_PASSWORD" marzban > /root/marzban.sql
```

:::

می‌توانید یک `.zip`/`.tar.gz` از پوشهٔ دادهٔ پنل قدیمی هم آپلود کنید — وارد‌کننده خودش داخل آرشیو دنبال دیتابیس یا فایل `.sql` می‌گردد (`db_backup.sql`، `backup.sql`، `marzban.sql`).

::: tip منبع MySQL
خواننده یک فایل **SQLite** می‌خواهد. اگر پنل مبدأ روی MySQL بوده، یک‌بار تبدیلش کنید:

```bash
pip install mysql-to-sqlite3
mysql2sqlite -f /root/legacy-source.db --mysql-database marzban \
             -u root -p"$MYSQL_ROOT_PASSWORD"
```
:::

### گام ۲ — پشتیبان‌گیری از زاگرس

```bash
sudo zagros backup
```

از این گام نگذرید. واردکردن روی یک دیتابیس زنده می‌نویسد.

### گام ۳ — واردکردن از طریق داشبورد

این مسیر پشتیبانی‌شده است و منبع را خودکار تشخیص می‌دهد.

۱. **تنظیمات ← پشتیبان‌گیری و بازگردانی**
۲. فایل گام ۱ را **آپلود** کنید (`legacy-source.db`، `x-ui.db` یا یک آرشیو).
۳. زاگرس آن را بررسی می‌کند و گزارش می‌دهد:

   ```
   detected source : marzban (confidence 1.0)
   users           : 338 to import, 4 skipped (unsupported protocol)
   admins          :   2 to import, 1 without a verifiable password hash
   hosts           :  11 to import
   nodes           :   3 to import (disabled — pair them manually afterwards)
   name conflicts  :   1  (existing "admin" — reported, not overwritten)
   ```

۴. گزارش را بخوانید. **هنوز هیچ چیز نوشته نشده** — بررسی همیشه dry-run است.
۵. دکمهٔ **Apply** را بزنید تا واردکردن انجام شود.

::: warning اول گزارش را بخوانید
- **تداخل نام** برای هر ردیف گزارش می‌شود و هرگز کاربر موجود را بازنویسی نمی‌کند. نام‌های کاربری همان‌طور که دیتابیس مقایسه می‌کند (بدون حساسیت به بزرگی و کوچکی حروف) مقایسه می‌شوند و یک نام رد‌شده کل عملیات را متوقف نمی‌کند — بقیهٔ کاربران وارد می‌شوند.
- **نودها** غیرفعال وارد می‌شوند. جفت‌شدن نود مبتنی بر پین گواهی است، پس یک ردیف نودِ کپی‌شده نمی‌تواند پین معتبر داشته باشد — روی هر نود دوباره `install-node.sh` را اجرا کنید و اثر انگشتش را در پنل تأیید کنید.
:::

### مسیر جایگزین — REST API

همان عملیات از طریق HTTP، برای مهاجرت‌های اسکریپتی. ابتدا به‌عنوان مدیر sudo احراز هویت کنید (به [API](./api.md) نگاه کنید).

```bash
# ۱) آپلود
curl -fsS -X POST https://panel.example.com/api/zagros/restore/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F 'file=@/root/legacy-source.db'

# ۲) بررسی — همیشه dry-run
curl -fsS -X POST https://panel.example.com/api/zagros/restore/inspect \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"archive":"legacy-source.db","source":"marzban"}'

# ۳) اعمال، وقتی گزارش درست بود
curl -fsS -X POST https://panel.example.com/api/zagros/restore/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"archive":"legacy-source.db","source":"marzban","dry_run":false}'
```

مقدار `source` می‌تواند `zagros`، `marzban`، `pasarguard` یا `3x-ui` باشد. اگر منبع را اشتباه انتخاب کنید و فایل آشکارا متعلق به پنل دیگری باشد، وارد‌کننده همین را می‌گوید به‌جای اینکه صفر کاربر گزارش کند.

برای یک فایل SQLite مربوط به Marzban که از قبل روی فایل‌سیستم پنل است، یک endpoint مستقیم هم وجود دارد:

```bash
curl -fsS -X POST https://panel.example.com/api/zagros/migrate/legacy \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"legacy_path":"/var/lib/zagros/legacy-source.db","dry_run":true}'
```

برای اعمال نهایی `"dry_run": false` بگذارید.

### گام ۴ — راستی‌آزمایی

```bash
sudo zagros restart
sudo zagros status
```

سپس به همین ترتیب بررسی کنید:

۱. **صفحهٔ کاربران** — تعداد با گزارش واردکردن بخواند.
۲. **یک کاربر را باز کنید** — پروتکل‌ها و سقف داده سالم مانده باشند.
۳. **لینک اشتراکش را کپی و باز کنید** — لینک باید رندر شود. این همان بررسی‌ای است که ثابت می‌کند هر دو نیمهٔ دیتابیس هماهنگ‌اند؛ کاربری که در فهرست هست ولی تحویل نمی‌دهد یعنی فقط سمت platform نوشته شده است.
۴. **صفحهٔ هسته‌ها** — هیچ هسته‌ای `degraded` نباشد.

### چه چیزی منتقل **نمی‌شود**

| منتقل نمی‌شود | چرا | چه کار کنید |
| --- | --- | --- |
| گذرواژهٔ مدیران (3x-ui) | شیوهٔ هش قابل راستی‌آزمایی نیست | گذرواژهٔ تازه بگذارید: `sudo zagros advanced reset-admin` |
| گواهی نودها | پین‌ها ذاتاً مخصوص هر نصب‌اند | روی هر نود `install-node.sh` را دوباره اجرا کنید |
| گواهی‌های TLS | مسیرها و مالکیت‌ها فرق دارند | دوباره صادر کنید: [گواهی‌ها](./certificates.md) |
| قالب صفحهٔ اشتراک | موتور قالب متفاوت است | [صفحهٔ اشتراک](../examples/subscription-page.md) |
| تنظیمات تلگرام / اعلان‌ها | کلیدهای پیکربندی متفاوت‌اند | [اعلان‌ها](./notifications.md) |

---

## تغییر موتور دیتابیس

وقتی از این استفاده کنید که یک نصب زاگرس روی **SQLite** بزرگ‌تر از توان آن شده و باید به **MySQL**، **MariaDB** یا **PostgreSQL** برود.

سازوکار عمداً ساده است: **روی موتور قدیمی پشتیبان بگیر، زاگرس را به موتور جدید وصل کن، پشتیبان را بازگردان.** آرشیو پشتیبان مستقل از موتور است، پس همین مسیر پشتیبانی‌شدهٔ تغییر موتور هم هست.

::: warning برای قطعی برنامه‌ریزی کنید
پنل هنگام جابه‌جایی داده‌ها خاموش است. برای چند صد کاربر این کمتر از یک دقیقه است؛ پنجرهٔ نگهداری‌تان را از تعداد ردیف‌های خودتان حساب کنید، نه از این عدد.
:::

### گام ۱ — پشتیبان بگیرید و فایل‌های خام را نگه دارید

```bash
sudo zagros backup
ls -la /var/lib/zagros/backups/
```

فایل‌های خام SQLite را هم کنار بگذارید — همان چیزی هستند که دارید تبدیل می‌کنید، و دست‌نخورده ماندنشان چیزی است که این کار را برگشت‌پذیر می‌کند:

```bash
sudo mkdir -p /root/zagros-sqlite-backup
sudo cp /var/lib/zagros/zagros.db /var/lib/zagros/legacy.db \
        /root/zagros-sqlite-backup/
sudo cp /var/lib/zagros/backups/*.tar.gz /root/zagros-sqlite-backup/
```

### گام ۲ — پنل را خاموش کنید

```bash
sudo zagros down
```

هنگام جابه‌جایی، هیچ چیز نباید روی دیتابیس‌ها بنویسد.

### گام ۳ — موتور مقصد را نصب و **هر دو** دیتابیس را بسازید

::: code-group

```bash [MySQL]
sudo apt-get update && sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql

sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS zagros
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS zagros_legacy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zagros'@'%' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON zagros.*        TO 'zagros'@'%';
GRANT ALL PRIVILEGES ON zagros_legacy.* TO 'zagros'@'%';
FLUSH PRIVILEGES;
SQL
```

```bash [MariaDB]
sudo apt-get update && sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb

sudo mariadb <<'SQL'
CREATE DATABASE IF NOT EXISTS zagros
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS zagros_legacy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zagros'@'%' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON zagros.*        TO 'zagros'@'%';
GRANT ALL PRIVILEGES ON zagros_legacy.* TO 'zagros'@'%';
FLUSH PRIVILEGES;
SQL
```

```bash [PostgreSQL]
sudo apt-get update && sudo apt-get install -y postgresql
sudo systemctl enable --now postgresql

sudo -u postgres psql <<'SQL'
CREATE USER zagros WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE zagros        OWNER zagros;
CREATE DATABASE zagros_legacy OWNER zagros;
SQL
```

:::

به‌جای `CHANGE_ME` گذرواژهٔ واقعی بگذارید و همان را در گام ۴ استفاده کنید.

::: danger همیشه هر دو دیتابیس
`zagros` **و** `zagros_legacy` هر دو باید وجود داشته باشند. ساختن فقط یکی، رایج‌ترین علت پنلی است که بالا می‌آید، احراز هویت می‌کند و بعد هیچ کاربری نشان نمی‌دهد.
:::

### گام ۴ — زاگرس را به موتور جدید وصل کنید

```bash
sudo zagros env set ZAGROS_DB_KIND mysql

sudo zagros env set ZAGROS_DATABASE_URL \
  'mysql+pymysql://zagros:CHANGE_ME@127.0.0.1:3306/zagros?charset=utf8mb4'

sudo zagros env set SQLALCHEMY_DATABASE_URL \
  'mysql+pymysql://zagros:CHANGE_ME@127.0.0.1:3306/zagros_legacy?charset=utf8mb4'
```

جفت آدرس‌ها برای هر موتور — دقیقاً همان چیزی که نصب‌کننده می‌نویسد:

| موتور | `ZAGROS_DATABASE_URL` | `SQLALCHEMY_DATABASE_URL` |
| --- | --- | --- |
| SQLite | `sqlite:////var/lib/zagros/zagros.db` | `sqlite:////var/lib/zagros/legacy.db` |
| MySQL / MariaDB | `mysql+pymysql://zagros:PW@127.0.0.1:3306/zagros?charset=utf8mb4` | `mysql+pymysql://zagros:PW@127.0.0.1:3306/zagros_legacy?charset=utf8mb4` |
| PostgreSQL | `postgresql+psycopg://zagros:PW@127.0.0.1:5432/zagros` | `postgresql+psycopg://zagros:PW@127.0.0.1:5432/zagros_legacy` |

مقدار `ZAGROS_DB_KIND` را متناسب با آن روی `sqlite`، `mysql`، `mariadb` یا `postgresql` بگذارید.

::: tip کاراکترهای گذرواژه
این رشته به‌عنوان URL تجزیه می‌شود. کاراکترهای `@`، `/`، `:`، `#` و `?` را در گذرواژه percent-encode کنید، یا گذرواژه‌ای بدون آن‌ها انتخاب کنید.
:::

### گام ۵ — ساخت اسکیما روی موتور خالی

```bash
sudo zagros up
sudo zagros logs --tail 50
```

در نخستین اجرا روی دیتابیس خالی، پنل مهاجرت‌های Alembic را اجرا می‌کند و همهٔ جدول‌ها را می‌سازد. همگرایی اسکیما را تأیید کنید:

```bash
sudo zagros advanced migrate
```

این دستور `alembic upgrade head` را اجرا می‌کند، نسخهٔ فعلی را چاپ می‌کند و با یک بررسی سلامت تمام می‌شود. پیش از ادامه باید `migration complete & healthy` گزارش کند.

### گام ۶ — بازگرداندن داده‌ها روی موتور جدید

سریع‌ترین مسیر CLI است که آرشیو را همان‌جا بازمی‌گرداند:

```bash
sudo zagros restore latest
```

یا نام آرشیو مشخصی را بدهید:

```bash
sudo zagros restore /root/zagros-sqlite-backup/zagros-backup-XXXX.tar.gz
```

مسیر داشبورد همین کار را با یک گزارش قابل مرور انجام می‌دهد: **تنظیمات ← پشتیبان‌گیری و بازگردانی ← آپلود**، آرشیو را انتخاب کنید، منبع را **`zagros`** بگذارید، گزارش بررسی را بخوانید و بعد **Apply** بزنید.

بازگرداندن آرشیو زاگرس **هر دو** مخزن را می‌نویسد، و دقیقاً به همین دلیل مسیر پشتیبانی‌شدهٔ تغییر موتور همین است و نه کپی جدول‌به‌جدول.

### گام ۷ — راستی‌آزمایی

```bash
sudo zagros status
sudo zagros advanced doctor
```

سپس دقیقاً مثل روش واردکردن بررسی کنید:

۱. تعداد کاربران با پنل قدیمی بخواند؛
۲. یک کاربر باز شود و پروتکل‌ها و سقف‌های درست را نشان دهد؛
۳. لینک اشتراک همان کاربر رندر شود؛
۴. هیچ هسته‌ای `degraded` نباشد؛
۵. همهٔ نودها `connected` باشند.

تنها وقتی هر پنج مورد پاس شد، `/root/zagros-sqlite-backup` را پاک کنید.

### برگشت به عقب

هیچ چیز فایل‌های SQLite را از بین نبرده، پس برگشت فقط یک تغییر پیکربندی است:

```bash
sudo zagros down
sudo zagros env set ZAGROS_DB_KIND sqlite
sudo zagros env set ZAGROS_DATABASE_URL     'sqlite:////var/lib/zagros/zagros.db'
sudo zagros env set SQLALCHEMY_DATABASE_URL 'sqlite:////var/lib/zagros/legacy.db'
sudo cp /root/zagros-sqlite-backup/zagros.db /root/zagros-sqlite-backup/legacy.db \
        /var/lib/zagros/
sudo zagros up
```

---

## نصب مستقیم روی MySQL / MariaDB

اگر هنوز نصب نکرده‌اید، موتور را همان موقع نصب انتخاب کنید و کلاً این صفحه را رد کنید:

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ZagrosGM/zagros-scripts/main/zagros.sh)" -- install --database mysql
```

گزینهٔ `--database` مقادیر `sqlite`، `mysql`، `mariadb` یا `postgresql` را می‌پذیرد. نصب‌کننده هر دو دیتابیس را می‌سازد، اطلاعات ورود را تولید و هر دو آدرس را می‌نویسد.

---

## رفع اشکال

**`Access denied for user 'zagros'@'localhost'`**
دسترسی برای `'zagros'@'%'` داده شده ولی کلاینت از طریق سوکت محلی وصل شده است. در آدرس `127.0.0.1` را نگه دارید (نه `localhost`)، یا دسترسی متناظر `'zagros'@'localhost'` را هم اضافه کنید.

**`Unknown database 'zagros_legacy'`**
فقط یکی از دو دیتابیس ساخته شده. به گام ۳ برگردید.

**پنل بالا می‌آید ولی فهرست کاربران خالی است**
مخزن platform نوشته شده و مخزن legacy نه. آرشیو زاگرس را دوباره بازگردانید (گام ۶) — بازگردانی هر دو نیمه را می‌نویسد.

**`Specified key was too long; max key length is 767 bytes` (MySQL/MariaDB)**
دیتابیس بدون `utf8mb4` / `utf8mb4_unicode_ci` ساخته شده. آن را حذف کنید، دقیقاً مطابق گام ۳ بسازید و از گام ۵ تکرار کنید.

**`sqlalchemy.exc.OperationalError: (2003, "Can't connect …")`**
موتور روی پورت مندرج در آدرس گوش نمی‌دهد:

```bash
sudo ss -ltnp | grep -E '3306|5432'
```

**واردکردن کاربران را گزارش داد ولی فهرست هنوز خالی است**
پنل را ری‌استارت کنید (`sudo zagros restart`) و داشبورد را hard-reload کنید. اگر باقی ماند، `sudo zagros advanced doctor` را اجرا و آدرس دیتابیس legacy را بررسی کنید.

برای هر چیز دیگر، [رفع اشکال](./troubleshooting.md) را ببینید.

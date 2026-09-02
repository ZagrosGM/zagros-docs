# صفحهٔ اشتراکِ دلخواه

صفحه‌ای که مشترک با بازکردنِ لینکِ اشتراکش در مرورگر می‌بیند، یک قالب است که
می‌توانید آن را با قالبِ خودتان عوض کنید. این صفحه مرجعِ کاملِ آن است: قالب چطور
نصب می‌شود، هر متغیّر و تابعِ کمکی‌ای که در قالب در دسترس است، یک نمونهٔ کاملِ
چندپروتکلی، و این‌که وقتی چیزی خراب شود چه اتفاقی می‌افتد.

هر چیزی که زاگرس تحویلِ کاربر می‌دهد در قالب در دسترس است — لینک‌های اشتراکِ
xray و sing-box، پروفایل‌های OpenVPN و کانفیگ‌های WireGuard به‌صورتِ **فایلِ
قابلِ دانلود**، مشخصاتِ اتصالِ SSH / SoftEther / L2TP / SSTP / PPTP، و
یادداشت‌هایی که هسته‌ها می‌فرستند — پس یک صفحه می‌تواند همهٔ پروتکل‌های کاربر را،
با هر طراحی‌ای که بخواهید، نشان بدهد.

[[toc]]

## روشِ کار

۱. **یک نقطهٔ شروع بردارید.** *Subscriptions → download starter* یک قالبِ کامل و
کارا به شما می‌دهد که همهٔ پروتکل‌ها را با دکمهٔ کپی، کد QR، دکمهٔ دانلود برای
فایل‌های کانفیگ و لینک‌های «افزودن به برنامه» رندر می‌کند. CSS و HTML آن را آزادانه
ویرایش کنید. قالبی که برای **مرزبان** نوشته شده هم بدون تغییر کار می‌کند (بخشِ
[سازگاری با مرزبان](#سازگاری-با-مرزبان)).

۲. **آپلود کنید** در *Subscriptions → subscription page template*. ورودیِ مجاز:
یک فایلِ `.html` / `.htm`، با کدگذاریِ UTF-8، حداکثر **۱ مگابایت**. آپلود
**اعتبارسنجی** می‌شود — نحوِ قالب بررسی می‌شود و قالب یک بار با یک مشترکِ نمونه
رندر می‌شود. فایلی که رندر نشود **با شمارهٔ خط رد می‌شود** و هیچ‌چیز روی سرور عوض
نمی‌شود. فایلِ سالم ذخیره می‌شود و **همان لحظه صفحهٔ فعال** می‌شود؛ ذخیرهٔ جداگانه‌ای
در کار نیست.

۳. **پیش‌نمایش بگیرید.** دکمهٔ *preview* قالبِ فعال (یا هر قالبِ آپلودشده) را با دادهٔ
نمونه، یا با نامِ کاربریِ هر کاربرِ واقعی رندر می‌کند — دقیقاً همان HTMLای که مرورگرِ
مشترک دریافت می‌کند.

۴. **عوض کنید یا حذف کنید.** انتخاب‌گر بینِ فایل‌های آپلودشده و صفحهٔ داخلی
جابه‌جا می‌شود؛ حذفِ فایلِ فعال، صفحه را به صفحهٔ داخلی برمی‌گرداند.

::: tip خطا هرگز به مشترک نمی‌رسد
قالبی که هنگامِ آپلود رندر شده اما بعداً به خطا بخورد (مثلاً روی کاربری که داده‌اش
مسیری را طی می‌کند که نمونه طی نکرده بود) هرگز صفحهٔ مشترک را خراب نمی‌کند: **صفحهٔ
داخلی به‌جای آن سرو می‌شود**، خطا لاگ می‌شود، و علتش (با شمارهٔ خط) در بخشِ
Subscriptions کنارِ انتخاب‌گر نمایش داده می‌شود تا وقتی که قالب دوباره با موفقیت
رندر شود.
:::

::: warning چیزهایی که قالب هرگز جایگزینشان نمی‌شود
* **صفحهٔ ورود با برنامه** (application-login). در آن حالت هیچ بایتی از اطلاعاتِ
  پیکربندی نباید از پنل خارج شود و قالبِ اپراتور را نمی‌شود از این نظر ممیزی کرد —
  برای آن کاربران قالب نادیده گرفته می‌شود.
* **فرمت‌های کلاینت‌ها.** v2rayNG، Hiddify، Clash، sing-box و بقیهٔ کلاینت‌هایی که
  همین نشانی را می‌گیرند، همچنان فهرستِ لینک / YAML / JSON خودشان را می‌گیرند
  (`?format=links|clash-meta|sing-box`). قالب فقط به مرورگرها سرو می‌شود.
:::

## قالب‌ها Jinja2 هستند

قالب‌ها با [Jinja2](https://jinja.palletsprojects.com/en/stable/templates/) و با
همان تنظیماتی رندر می‌شوند که مرزبان صفحهٔ اشتراکش را رندر می‌کند:

* **بدون auto-escape.** هرچه چاپ کنید عیناً در خروجی می‌آید. این باعث می‌شود
  لینک‌های اشتراک داخلِ بلوک‌های `<script>` سالم بمانند، و یعنی مقدارهایی را که داخلِ
  attributeهای HTML یا بینِ تگ‌ها چاپ می‌کنید و ممکن است شاملِ نقل‌قول یا `<` باشند
  **خودتان** escape می‌کنید: <code v-pre>{{ a.content | e }}</code>. همهٔ مقدارهای
  context تحتِ کنترلِ پنل یا ادمین‌اند (نامِ کاربری محدود است، لینک‌ها URL-quote
  شده‌اند)؛ تنها مقداری که مشترک کنترلش می‌کند، `user.sub_last_user_agent`، از قبل
  برایتان escape شده است.
* **متغیّرِ تعریف‌نشده ساکت است.** متغیّر یا attribute‌ای که وجود ندارد چیزی چاپ
  نمی‌کند و در `{% if %}` نادرست است، حتی به‌صورتِ زنجیره‌ای (`user.admin.username`).
  قالب هرگز روی دادهٔ اختیاری به خطا نمی‌خورد.
* `{% include %}` و `{% extends %}` بینِ فایل‌های آپلودشده کار می‌کنند، پس یک
  header مشترک یا layout پایه می‌تواند یک آپلودِ دوم باشد.

هرچه Jinja2 دارد در دسترس است: `{% set %}`، `{% for %}` با `loop.*`،
`{% macro %}`، فیلترهایی مثلِ `round`، `length`، `join`، `replace`، `upper`،
`urlencode`، `tojson`، `e`، تست‌هایی مثلِ `is none` / `is defined` و غیره.

::: warning جاوااسکریپتی که آکولادِ دوتایی دارد
Jinja همه‌چیز را parse می‌کند. کدِ سمتِ کلاینتی را که از <code v-pre>{{ … }}</code> استفاده می‌کند
(Vue، Alpine، Handlebars، template literal) داخلِ بلوکِ raw بگذارید تا دست‌نخورده
به مرورگر برسد:

```
{% raw %}
<div x-text="`${used} / ${total}`"></div>
{% endraw %}
```
:::

## مرجعِ متغیّرها

همهٔ نام‌های زیر در سطحِ بالای قالب در دسترس‌اند.

### صفحه و پنل

| متغیّر | نوع | توضیح |
|---|---|---|
| `brand` | رشته | نامِ برند از *Subscriptions*. |
| `app_name` | رشته | نامِ برنامه از *Subscriptions*. |
| `support_url` | رشته یا `None` | لینکِ پشتیبانی از *Subscriptions*. |
| `subscription_url` | رشته | نشانیِ مطلقی که این صفحه از آن گرفته شده، بدون query string — همان لینکی که برنامهٔ کلاینت وارد می‌کند. همچنین `user.subscription_url`. |
| `subscription_formats` | dict | همان نشانی در هر فرمت: `.links` (فهرستِ لینکِ ساده)، `.clash` (`?format=clash-meta`)، `.sing_box` (`?format=sing-box`). وقتی `subscription_url` معلوم نباشد رشته‌های خالی. |
| `import_links` | dict | لینک‌های «افزودن به برنامه» با یک لمس، ساخته‌شده از `subscription_url`، با کلیدِ شناسهٔ برنامه: `v2rayng`، `hiddify`، `streisand`، `happ`، `v2box`، `shadowrocket`، `nekobox`، `karing`، `sing-box`، `clash`، `stash`. Clash/Stash و sing-box نشانیِ `?format=` خودشان را می‌گیرند، بقیه فهرستِ لینکِ ساده را. وقتی `subscription_url` معلوم نباشد dict خالی. |
| `apps` | فهرست | دانلودهای برنامهٔ رسمی از *Subscriptions*؛ هرکدام `.platform` (`android` / `ios` / `windows` / `macos` / `linux`)، `.name`، `.url`، `.primary` (بولی). |
| `notes` | فهرستِ رشته | یادداشت‌های سطحِ صفحه از هسته‌ها (مثلاً توضیحِ درایوری که نتوانسته لینکی بسازد). |
| `generated_at` | datetime (UTC، aware) | زمانِ ساختِ صفحه. |
| `lang` | رشته | زبانِ صفحه: پیش‌فرضِ پنل، یا تگِ اصلیِ `Accept-Language` مرورگر (`fa`، `en`، …). |
| `direction` | رشته | `rtl` برای `fa` / `ar` / `he`، وگرنه `ltr`. |
| `page` | شیء | کلِ شیءِ صفحه (`page.title`، `page.kind`، `page.user`، `page.sections` …) برای هرچه در فهرست نیست. |

### میان‌برهای حساب

| متغیّر | نوع | توضیح |
|---|---|---|
| `used_bytes` | int | ترافیکِ مصرف‌شده در دورهٔ جاری، بایت. |
| `data_limit_bytes` | int یا `None` | سهمیه به بایت؛ `None` = نامحدود. |
| `remaining_bytes` | int یا `None` | `data_limit_bytes − used_bytes` (هرگز منفی نمی‌شود)؛ `None` وقتی نامحدود است. |
| `expire_at` | datetime (UTC، aware) یا `None` | انقضا؛ `None` = هرگز. |
| `online` | بولی | آیا کاربر هم‌اکنون متصل است. |

### `user`

یک شیء به هر دو واژگان پاسخ می‌دهد: نام‌های زاگرس و نام‌هایی که قالب‌های مرزبان
به‌کار می‌برند.

**نام‌های زاگرس**

| attribute | نوع | توضیح |
|---|---|---|
| `user.user_id` | int | شناسهٔ پنل. |
| `user.username` | رشته | نامِ کاربری. |
| `user.status` | رشته‌مانند | `active` / `limited` / `expired` / `disabled` / `on_hold`. مثلِ رشته مقایسه می‌شود (`user.status == 'active'`) و `.value` هم دارد. |
| `user.online` | بولی | هم‌اکنون متصل است. |
| `user.used_bytes`، `user.data_limit_bytes`، `user.remaining_bytes`، `user.expire_at` | | همان مقدارهای میان‌برهای بالا. |
| `user.usage_ratio` | float بینِ ۰ و ۱ یا `None` | `used / limit`، سقفِ ۱؛ `None` وقتی نامحدود است. |
| `user.note` | رشته یا `None` | یادداشتِ ادمین روی کاربر. |
| `user.data_limit_reset_strategy` | رشته‌مانند | `no_reset` / `day` / `week` / `month` / `year`؛ `.value` هم دارد. |
| `user.client_auth_mode` | رشته یا `None` | بازنویسیِ حالتِ دسترسی برای این کاربر، اگر باشد. |
| `user.created_at`، `user.online_at`، `user.sub_updated_at` | datetime یا `None` | زمانِ ساخت، آخرین باری که آنلاین دیده شده، آخرین دریافتِ اشتراک. |
| `user.sub_last_user_agent` | رشته یا `None` | آخرین User-Agent کلاینت، **از قبل HTML-escape شده**. |

**نام‌های مرزبان** (چیزی که قالبِ مرزبان می‌خواند)

| attribute | نوع | توضیح |
|---|---|---|
| `user.links` | فهرستِ رشته | همهٔ لینک‌های اشتراکِ همهٔ هسته‌ها، بدون تکرار — همان چیزی که `user.links` مرزبان دارد. |
| `user.subscription_url` | رشته | همان `subscription_url`. |
| `user.used_traffic` | int | بایتِ مصرف‌شده در دورهٔ جاری. |
| `user.lifetime_used_traffic` | int | بایتِ مصرف‌شده در کلِ ریست‌ها. |
| `user.data_limit` | int یا `None` | سهمیه به بایت. |
| `user.expire` | int (timestamp یونیکس) یا `None` | انقضا. |
| `user.status.value` | رشته | مثلِ بالا. |
| `user.data_limit_reset_strategy.value` | رشته | مثلِ بالا. |
| `user.proxies`، `user.inbounds`، `user.excluded_inbounds` | dict | همیشه خالی — زاگرس نگاشتِ inbound به‌ازای کاربر ندارد. |
| `user.on_hold_expire_duration`، `user.on_hold_timeout`، `user.admin` | `None` | برای سازگاری وجود دارند. |

هر attribute دیگری تعریف‌نشده خوانده می‌شود (چیزی چاپ نمی‌کند، نادرست است)، پس
`{% if user.note %}` تمامِ احتیاطی است که یک قالب لازم دارد.

### `sections` — همهٔ پروتکل‌ها

`sections` تحویلِ کامل است: یک بخش به‌ازای هر inbound از هر هسته‌ای که کاربر روی
آن حساب دارد، به ترتیبی که هسته‌ها گزارش می‌کنند. وقتی صفحه باید OpenVPN،
WireGuard، SSH، SoftEther یا PPTP را کنارِ لینک‌های اشتراک نشان بدهد، روی همین
متغیّر حلقه بزنید.

**Section**

| attribute | نوع | توضیح |
|---|---|---|
| `section.protocol` | رشته | شناسهٔ پروتکل — جدولِ پایین. |
| `section.title` | رشته | عنوانِ خوانا، با پیشوندِ برند (`Zagros · WireGuard`). |
| `section.engine` | رشته | خانوادهٔ کلاینتِ پیشنهادی — جدولِ پایین. وقتی هسته نتوانسته بخش را بسازد خالی است. |
| `section.note` | رشته یا `None` | یادداشتی دربارهٔ کلِ بخش. |
| `section.inbound_tag` | رشته یا `None` | inbound هسته‌ای که آن را تولید کرده. |
| `section.artifacts` | فهرست | چیزی که بخش تحویل می‌دهد — بخشِ *Artifact*. |

**Artifact**

| attribute | نوع | توضیح |
|---|---|---|
| `a.kind` | رشته | `link`، `file`، `fields` یا `note` (با رشته مقایسه کنید). |
| `a.label` | رشته | برچسبِ نمایشی (`VLESS Reality · DE`، `WireGuard configuration`، `OpenVPN profile`، `Authentication`، …). |
| `a.content` | رشته | برای `link`: نشانیِ اشتراک. برای `file`: متنِ فایل. در بقیه خالی. |
| `a.filename` | رشته یا `None` | برای `file`: نامِ پیشنهادیِ فایل، مثلاً `alice-wg0.conf`، `alice-udp1194.ovpn`. |
| `a.mime` | رشته | برای `file`: `text/plain` (WireGuard) یا `application/x-openvpn-profile` (OpenVPN). |
| `a.fields` | فهرست | برای `fields`: ردیف‌های مشخصات — بخشِ *Field*. |
| `a.qr` | بولی | هسته توصیه می‌کند این artifact به‌صورتِ QR هم نمایش داده شود (لینک‌های اشتراک، `.conf` وایرگارد). |
| `a.note` | رشته یا `None` | برای `note`: متن. برای بقیه: راهنمای اختیاری. |

**Field** (ردیف‌های یک artifact از نوعِ `fields`)

| attribute | نوع | توضیح |
|---|---|---|
| `f.key` | رشته | شناسهٔ معنایی: `host`، `port`، `username`، `password`، `psk`، … |
| `f.label` | رشته | برچسبِ نمایشی. |
| `f.value` | رشته | مقدار. |
| `f.secret` | بولی | تا وقتی کاربر آشکارش نکرده پنهان بماند (رمزها، کلیدهای پیش‌اشتراکی). |
| `f.copyable` | بولی | دکمهٔ کپی داشته باشد. |

**مقدارهای protocol و engine به تفکیکِ هسته**

| هسته | `section.protocol` | `section.engine` | Artifactها |
|---|---|---|---|
| xray | `vless`، `vmess`، `trojan`، `shadowsocks` | `sing-box` | `link` (+`note` وقتی لینک ساخته نشود) |
| sing-box | `vless`، `vmess`، `trojan`، `shadowsocks`، `hysteria2`، `tuic` | `sing-box` | `link` (+`note`) |
| OpenVPN | `ovpn` | `openvpn` | `file` (.ovpn) + `fields` (Authentication، Server & security) + `note` |
| WireGuard | `wireguard` | `wireguard` | `file` (.conf، با `qr=true`) + `fields` (Connection details) + `note` |
| SSH | `ssh` | `ssh` | `fields` + `note` |
| SoftEther | `softether`، `l2tp`، `l2tp_raw`، `sstp`، `ovpn` | `softether`، `l2tp-ipsec`، `l2tp`، `sstp`، `openvpn-clone` | `fields` (+`note`) |
| PPTP | `pptp` | `pptp` | `fields` + `note` |

توجه کنید که هستهٔ xray خانوادهٔ کلاینتِ sing-box را توصیه می‌کند (لینک‌هایش
لینک‌های اشتراکِ استاندارد‌اند که هر کلاینتِ سازگار با v2ray وارد می‌کند). وقتی
هسته‌ای نتواند پیکربندیِ کاربر را بسازد، بخشِ آن فقط یک artifact از نوعِ `note` با
توضیحِ موضوع دارد و `engine` آن خالی است.

### `links` و `files` — نماهای تخت

فهرست‌های راحتی که از `sections` ساخته می‌شوند:

| متغیّر | attributeهای هر عضو | توضیح |
|---|---|---|
| `links` | `protocol`، `title`، `label`، `url` | همهٔ artifactهای `link`، به ترتیب. |
| `files` | `protocol`، `title`، `label`، `filename`، `mime`، `content`، `href` | همهٔ artifactهای `file`؛ `href` یک `data:` URI آماده برای دکمهٔ دانلود است. |

### توابعِ کمکی

| تابع | خروجی | توضیح |
|---|---|---|
| `format_bytes(v)` | رشته | `7.50 GB`، `512 B`؛ برای `None` علامتِ `∞`. |
| `format_date(v)` | رشته | `2026/09/25`؛ برای `None` علامتِ `—`. |
| `days_left(v)` | int یا `None` | تعدادِ روزِ کامل تا یک datetime **یا timestamp یونیکس** (وقتی گذشته باشد منفی)؛ برای `None` مقدارِ `None`. |
| `qr_svg(text, size=4, border=2)` | رشته | یک `<svg>` درون‌خطیِ QR — بدون جاوااسکریپت، بدون سرویسِ بیرونی. `size` پهنای هر ماژول به پیکسل و `border` حاشیهٔ خالی به ماژول است. برای متنِ خالی یا متنی که برای QR زیادی بلند است (حدودِ ۲٫۹ کیلوبایت) رشتهٔ خالی برمی‌گرداند، پس هرگز صفحه را خراب نمی‌کند. |
| `data_uri(text, mime)` | رشته | `data:<mime>;base64,…` — یک `href` خودکفا برای دانلودِ یک artifact فایل. |
| `now()` | datetime بدونِ منطقهٔ زمانی (UTC) | تابعِ سراسریِ مرزبان؛ `now().timestamp()` کار می‌کند. |

### فیلترها

| فیلتر | توضیح |
|---|---|
| `bytesformat` | همان `readable_size` مرزبان: `7.5 GB`؛ برای `None` / تعریف‌نشده `∞`. |
| `datetime` | همان فیلترِ مرزبان: timestamp یونیکس **یا** datetime ← `2026-09-25 14:48:59`. |
| `yaml`، `except`، `only` | فیلترهای کانفیگِ مرزبان (<code v-pre>{{ obj &#124; except('a', 'b') }}</code>). |
| `e` / `escape` | HTML-escape — روی مقدارهایی که داخلِ attribute می‌گذارید به‌کار ببرید. |
| `urlencode`، `tojson`، `round`، `length`، `join`، … | فیلترهای داخلیِ Jinja2. |

## سازگاری با مرزبان

قالبِ اشتراکِ مرزبان بدون تغییر کار می‌کند چون همان فیلترها و توابعِ سراسری وجود
دارند و `user` به نام‌های مرزبان پاسخ می‌دهد. تکه‌کدهای رایج:

```html
{{ user.used_traffic | bytesformat }} / {% if not user.data_limit %}∞{% else %}{{ user.data_limit | bytesformat }}{% endif %}
{% if not user.expire %}∞{% else %}{{ user.expire | datetime }}{% endif %}
{% set current_timestamp = now().timestamp() %}
<span x-data="{status: '{{ user.status.value }}'}"></span>
const subLinks = "{{ user.links }}"
```

تفاوت‌هایی که باید بدانید: `user.proxies` / `user.inbounds` دیکشنریِ خالی‌اند؛
زاگرس پروتکل‌هایی دارد که مرزبان هرگز نداشت (OpenVPN، WireGuard، SSH، SoftEther،
PPTP) و آن‌ها در `user.links` **نیستند** — قالبِ مرزبان فقط لینک‌های اشتراک را نشان
می‌دهد تا وقتی که حلقه‌ای روی `sections` مثلِ نمونهٔ زیر به آن اضافه کنید.

## یک قالبِ کاملِ چندپروتکلی

قالبِ زیر عمداً فشرده اما کامل است: سربرگِ حساب، لینکِ اشتراک با QR و دکمه‌های
افزودن به برنامه، سپس یک کارت به‌ازای هر بخش با کپی/QR برای لینک‌ها، **دکمهٔ دانلود**
برای هر فایلِ کانفیگ، جدولِ مشخصات با رمزهای پنهان، و یادداشت‌ها. برای نسخهٔ کاملاً
استایل‌شده از starter داخلِ پنل شروع کنید.

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
  .btn { display: inline-block; padding: 6px 12px; margin: 4px 0 0 4px; border: 1px solid #ddd;
         border-radius: 8px; background: #fff; color: #111; text-decoration: none; font: inherit; cursor: pointer; }
  .qr svg { width: 160px; height: 160px; }
  td { padding: 6px 4px; border-top: 1px solid #eee; }
  .note { padding: 8px 10px; background: #fef9c3; border-radius: 8px; font-size: 13px; }
</style>
</head>
<body>

<div class="card">
  <h1>{{ brand | e }}</h1>
  <p>{{ user.username | e }} · {{ user.status }} · {% if online %}آنلاین{% else %}آفلاین{% endif %}</p>
  <p>
    {{ format_bytes(used_bytes) }} / {{ format_bytes(data_limit_bytes) }}
    {% if remaining_bytes is not none %}— {{ format_bytes(remaining_bytes) }} باقی‌مانده{% endif %}
  </p>
  <p>
    {% if expire_at %}
      انقضا {{ format_date(expire_at) }}
      {% set d = days_left(expire_at) %}({% if d >= 0 %}{{ d }} روز مانده{% else %}منقضی شده{% endif %})
    {% else %}بدون انقضا{% endif %}
  </p>
  {% if user.usage_ratio is not none %}
    <progress max="100" value="{{ (user.usage_ratio * 100) | round(1) }}"></progress>
  {% endif %}
</div>

{% if subscription_url %}
<div class="card">
  <h2>لینک اشتراک</h2>
  <code class="url">{{ subscription_url | e }}</code>
  <button class="btn" data-copy="{{ subscription_url | e }}">کپی</button>
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
      <button class="btn" data-copy="{{ a.content | e }}">کپی</button>
      {% if a.qr %}<div class="qr">{{ qr_svg(a.content) }}</div>{% endif %}

    {% elif a.kind == "file" %}
      <p>{{ a.label | e }}</p>
      <a class="btn" href="{{ data_uri(a.content, a.mime) }}" download="{{ a.filename | e }}">
        دانلود {{ a.filename | e }}
      </a>
      <button class="btn" data-copy="{{ a.content | e }}">کپی</button>
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
              <button class="btn" data-reveal>نمایش</button>
            {% else %}
              {{ f.value | e }}
            {% endif %}
            {% if f.copyable %}<button class="btn" data-copy="{{ f.value | e }}">کپی</button>{% endif %}
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
  <h2>برنامه‌ها</h2>
  {% for app in apps %}<a class="btn" href="{{ app.url | e }}">{{ app.name | e }} ({{ app.platform }})</a>{% endfor %}
</div>
{% endif %}

{% for n in notes %}<p class="note">{{ n | e }}</p>{% endfor %}
{% if support_url %}<p><a href="{{ support_url | e }}">پشتیبانی</a></p>{% endif %}

<script>
document.addEventListener("click", function (ev) {
  var copy = ev.target.closest("[data-copy]");
  if (copy) {
    navigator.clipboard.writeText(copy.getAttribute("data-copy"));
    copy.textContent = "کپی شد"; setTimeout(function () { copy.textContent = "کپی"; }, 1200);
  }
  var reveal = ev.target.closest("[data-reveal]");
  if (reveal) {
    var span = reveal.parentNode.querySelector("[data-secret]");
    var shown = span.getAttribute("data-shown") === "1";
    span.textContent = shown ? "••••••••" : span.getAttribute("data-secret");
    span.setAttribute("data-shown", shown ? "0" : "1");
    reveal.textContent = shown ? "نمایش" : "پنهان";
  }
});
</script>
</body>
</html>
```

نتیجه برای مشترکی که مثلاً یک inbound از نوعِ VLESS، یک peer وایرگارد و یک حسابِ
SSH دارد: سه کارت — لینکِ VLESS با کپی و QR، دکمهٔ **دانلودِ alice-wg0.conf** به
همراهِ QR آن (برنامه‌های وایرگارد مستقیماً اسکنش می‌کنند)، و جدولِ SSH که رمزش تا
وقتی آشکار نشده پنهان است. کاربرانی که هسته‌ای را ندارند، آن کارت را هم نمی‌بینند.

### دستورِ پخت‌ها

**فقط بعضی پروتکل‌ها، یا ترتیبِ دلخواه**

```html
{# فقط این پروتکل‌ها #}
{% for section in sections if section.protocol in ("vless", "hysteria2") %} … {% endfor %}

{# اول فایل‌ها، بعد بقیه #}
{% for proto in ["wireguard", "ovpn"] %}
  {% for section in sections if section.protocol == proto %} … {% endfor %}
{% endfor %}
{% for section in sections if section.protocol not in ("wireguard", "ovpn") %} … {% endfor %}
```

**دکمهٔ دانلود برای همهٔ فایل‌های کانفیگ در بالای صفحه**

```html
{% for f in files %}
  <a href="{{ f.href }}" download="{{ f.filename | e }}">{{ f.title | e }} — {{ f.filename | e }}</a>
{% endfor %}
```

**نوارِ مصرفی که «نامحدود» را درست مدیریت می‌کند**

```html
{% if data_limit_bytes %}
  {% set pct = (used_bytes / data_limit_bytes * 100) | round(1) %}
  <div class="bar"><span style="width: {{ [pct, 100] | min }}%"></span></div>
{% else %}
  <p>{{ format_bytes(used_bytes) }} — نامحدود</p>
{% endif %}
```

**دو زبان در یک قالب**

```html
{% if lang == "fa" %}باقی‌مانده{% else %}Remaining{% endif %}
```

## چک‌لیستِ escape

چون هیچ‌چیز خودکار escape نمی‌شود:

* مقدارهای داخلِ attribute: همیشه `| e` (<code v-pre>href="{{ a.content | e }}"</code>،
  <code v-pre>data-copy="{{ f.value | e }}"</code>).
* مقدارهای بینِ تگ‌ها: `| e` وقتی ممکن است `<` یا `&` داشته باشند (محتوای فایل،
  برچسب‌ها، یادداشت‌ها).
* مقدارهای داخلِ رشته‌های `<script>`: ترجیحاً `| tojson`
  (<code v-pre>const links = {{ user.links | tojson }};</code>) — یک literal معتبر و امنِ
  جاوااسکریپت می‌سازد. اصطلاحِ مرزبانیِ <code v-pre>"{{ user.links }}"</code> هم همچنان کار می‌کند.
* خروجیِ `qr_svg(...)`، `data_uri(...)`، مقدارهای `import_links` و `files[].href`
  را پنل می‌سازد و همان‌طور که هستند امنِ چاپ‌اند (مقدارهای `import_links` داخلِ
  attribute همچنان `| e` می‌گیرند، مثلِ نمونه).

## بررسی از خطِ فرمان

```bash
# چیزی که مرورگر می‌گیرد (قالب)
curl -s -A "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36" \
     -H "Accept: text/html" https://panel.example.com/sub/TOKEN | grep -o "<title>.*</title>"

# چیزی که برنامهٔ کلاینت می‌گیرد (قالب روی آن اثری ندارد)
curl -s -A "v2rayNG/1.8.5" https://panel.example.com/sub/TOKEN | head -c 120

# تشخیصِ خودِ پنل: قالبِ فعال و آخرین خطای رندر
curl -s -H "Authorization: Bearer $TOKEN" https://panel.example.com/api/zagros/subscription/templates
```

## API

| متد | مسیر | کاربرد |
|---|---|---|
| `GET` | `/api/zagros/subscription/templates` | `{templates: [{name, size, modified_at}], active, active_exists, last_failure}` — `last_failure` یا `{template, error, line, at}` است یا `null` |
| `POST` | `/api/zagros/subscription/templates` | آپلودِ multipart: `file`، و `activate` اختیاری (پیش‌فرض `true`). اعتبارسنجی می‌شود؛ در صورتِ خطا `400` با `line N: …` |
| `PUT` | `/api/zagros/subscription/templates/active` | `{"name": "x.html"}` برای انتخاب، `{"name": null}` برای صفحهٔ داخلی |
| `GET` | `/api/zagros/subscription/templates/preview?name=x.html[&username=u]` | HTML رندرشده؛ `422` با علت وقتی رندر نشود؛ `404` برای کاربرِ ناشناخته |
| `DELETE` | `/api/zagros/subscription/templates/{name}` | حذف؛ اگر فایلِ فعال بود انتخاب پاک می‌شود |
| `GET` | `/api/zagros/subscription/templates/starter` | قالبِ starter |

قالب‌ها روی مستر در `<data dir>/subscription-templates/` نگه‌داری می‌شوند (با
نصب‌کنندهٔ استاندارد: `/var/lib/zagros/subscription-templates/`). متغیّرِ محیطیِ
قدیمیِ `SUBSCRIPTION_TEMPLATE` استفاده نمی‌شود.

## محدودیت‌ها

* **یک قالب برای همه.** داخلِ همان قالب شرط بگذارید (`{% if user.status ==
  'limited' %}`، `{% if lang == 'fa' %}`) نه این‌که انتظارِ فایلِ جداگانه به‌ازای هر
  کاربر داشته باشید.
* **دسترسی به فایل‌سیستم یا شبکه** از داخلِ قالب وجود ندارد؛ تصویر، فونت و اسکریپت
  باید درون‌خطی باشند یا از جای دیگری سرو شوند.
* **کدهای QR حداکثر حدودِ ۲٫۹ کیلوبایت متن** می‌گیرند — برای پروفایل‌های بلندِ
  OpenVPN تابعِ `qr_svg` رشتهٔ خالی برمی‌گرداند (به‌جایش دانلود بگذارید؛ کانفیگ‌های
  وایرگارد و لینک‌های اشتراک جا می‌شوند).
* **صفحهٔ ورود با برنامه و فرمت‌های کلاینت‌ها** هرگز تحتِ تأثیرِ قالب نیستند (بالا).

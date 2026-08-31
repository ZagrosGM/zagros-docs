import { defineConfig } from 'vitepress'

const enSidebar = [
  {
    text: 'Getting started',
    items: [
      { text: 'Introduction', link: '/docs/introduction' },
      { text: 'Installation', link: '/docs/installation' },
      { text: 'Configuration', link: '/docs/configuration' },
      { text: 'Command line', link: '/docs/cli' },
    ],
  },
  {
    text: 'Running it',
    items: [
      { text: 'Nodes', link: '/docs/nodes' },
      { text: 'Cores', link: '/docs/cores' },
      { text: 'Users', link: '/docs/users' },
      { text: 'Subscriptions', link: '/docs/subscriptions' },
      { text: 'Admins', link: '/docs/admins' },
      { text: 'Certificates', link: '/docs/certificates' },
    ],
  },
  {
    text: 'Integrations',
    items: [
      { text: 'REST API', link: '/docs/api' },
      { text: 'Notifications', link: '/docs/notifications' },
      { text: 'Troubleshooting', link: '/docs/troubleshooting' },
    ],
  },
  {
    text: 'Examples',
    items: [
      { text: 'Issue an SSL certificate', link: '/examples/issue-ssl-certificate' },
      { text: 'TLS for the panel', link: '/examples/panel-tls' },
      { text: 'Wildcard certificates', link: '/examples/wildcard-ssl' },
      { text: 'Change a core version', link: '/examples/change-core-version' },
      { text: 'Block traffic with routing', link: '/examples/routing-blocking' },
      { text: 'Backup and restore', link: '/examples/backup' },
      { text: 'Custom subscription page', link: '/examples/subscription-page' },
    ],
  },
]

const faSidebar = [
  {
    text: 'شروع',
    items: [
      { text: 'آشنایی', link: '/fa/docs/introduction' },
      { text: 'نصب', link: '/fa/docs/installation' },
      { text: 'پیکربندی', link: '/fa/docs/configuration' },
      { text: 'خط فرمان', link: '/fa/docs/cli' },
    ],
  },
  {
    text: 'کار با پنل',
    items: [
      { text: 'نودها', link: '/fa/docs/nodes' },
      { text: 'هسته‌ها', link: '/fa/docs/cores' },
      { text: 'کاربران', link: '/fa/docs/users' },
      { text: 'اشتراک', link: '/fa/docs/subscriptions' },
      { text: 'ادمین‌ها', link: '/fa/docs/admins' },
      { text: 'گواهی‌نامه‌ها', link: '/fa/docs/certificates' },
    ],
  },
  {
    text: 'یکپارچه‌سازی',
    items: [
      { text: 'API', link: '/fa/docs/api' },
      { text: 'اعلان‌ها', link: '/fa/docs/notifications' },
      { text: 'عیب‌یابی', link: '/fa/docs/troubleshooting' },
    ],
  },
  {
    text: 'نمونه‌ها',
    items: [
      { text: 'صدور گواهی SSL', link: '/fa/examples/issue-ssl-certificate' },
      { text: 'TLS برای پنل', link: '/fa/examples/panel-tls' },
      { text: 'گواهی wildcard', link: '/fa/examples/wildcard-ssl' },
      { text: 'تغییر نسخهٔ هسته', link: '/fa/examples/change-core-version' },
      { text: 'مسدودسازی با مسیریابی', link: '/fa/examples/routing-blocking' },
      { text: 'پشتیبان‌گیری و بازگردانی', link: '/fa/examples/backup' },
      { text: 'صفحهٔ اشتراکِ دلخواه', link: '/fa/examples/subscription-page' },
    ],
  },
]

export default defineConfig({
  title: 'Zagros',
  description: 'One panel. Every core. Full control.',
  // Relative by default so a built copy can be opened straight from disk.
  // CI sets DOCS_BASE to the Pages subpath (/zagros-docs/) so asset URLs are
  // correct at every page depth.
  base: process.env.DOCS_BASE || './',
  outDir: 'site',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0f766e' }],
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      dir: 'ltr',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/docs/introduction' },
          { text: 'Examples', link: '/examples/issue-ssl-certificate' },
          { text: 'API', link: '/docs/api' },
        ],
        sidebar: enSidebar,
        outlineTitle: 'On this page',
        docFooter: { prev: 'Previous', next: 'Next' },
        search: { provider: 'local' },
      },
    },
    fa: {
      label: 'فارسی',
      lang: 'fa',
      dir: 'rtl',
      themeConfig: {
        nav: [
          { text: 'مستندات', link: '/fa/docs/introduction' },
          { text: 'نمونه‌ها', link: '/fa/examples/issue-ssl-certificate' },
          { text: 'API', link: '/fa/docs/api' },
        ],
        sidebar: faSidebar,
        outlineTitle: 'در این صفحه',
        docFooter: { prev: 'قبلی', next: 'بعدی' },
        search: {
          provider: 'local',
          options: {
            locales: {
              fa: {
                translations: {
                  button: { buttonText: 'جستجو', buttonAriaLabel: 'جستجو در مستندات' },
                  modal: {
                    noResultsText: 'نتیجه‌ای یافت نشد',
                    resetButtonTitle: 'پاک کردن',
                    footer: { selectText: 'انتخاب', navigateText: 'پیمایش', closeText: 'بستن' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ZagrosGM/Zagros' },
    ],
    footer: {
      message: 'Released under the AGPL-3.0 license.',
      copyright: 'Zagros — one panel, every core.',
    },
  },
})

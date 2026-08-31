# Zagros documentation

The documentation site for **Zagros**, the multi-core VPN control panel.

Published at → **https://zagrosgm.github.io/zagros-docs/**

## Contents

Two complete, mirrored sets of pages:

| | English | فارسی |
|---|---|---|
| Home | `index.md` | `fa/index.md` |
| Docs | `docs/*.md` | `fa/docs/*.md` |
| Examples | `examples/*.md` | `fa/examples/*.md` |

* **Docs** — introduction, installation, configuration, command line, nodes,
  cores, users, subscriptions, admins, certificates, REST API, notifications,
  troubleshooting.
* **Examples** — issue an SSL certificate, TLS for the panel, wildcard
  certificates, change a core version, block traffic with routing, backup and
  restore, custom subscription page.

## Working on it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # output in ./site
npm run preview
```

Pages are plain Markdown with the default VitePress theme. The sidebar lives in
`.vitepress/config.mts` — add a page there too, in **both** locales, or it will
exist but be unreachable.

### Locales

`root` is English (`/`), `fa` is Persian (`/fa/`, right-to-left). Keep them in
step: a change to one is a change to the other.

### Jinja examples

Zagros subscription templates use Jinja2, and Vue also interpolates `{{ }}`.
Inside a **fenced** code block it is safe; in **inline** code wrap it as
`<code v-pre>{{ variable }}</code>`.

## Deployment

`.github/workflows/deploy-pages.yml` builds on every push to `main` and
publishes `site/` to GitHub Pages. It sets `DOCS_BASE=/zagros-docs/` so asset
URLs are absolute — the default `./` is only for opening a build straight from
disk.

## License

AGPL-3.0 — the same license as the panel itself.

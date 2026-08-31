# TLS for the panel

Two ways to serve HTTPS, and one of them is usually right for you.

## Option 1 — a reverse proxy terminates TLS (recommended)

The panel serves plain HTTP on its own port; Nginx, Caddy or Traefik in front of
it owns the certificate. This is the least surprising setup: renewal, HTTP/2 and
certificates for other services all stay in one place.

```bash
sudo zagros env set TLS_MODE off       # or auto — the proxy is the TLS endpoint
sudo zagros env set UVICORN_PORT 8000
sudo zagros restart
```

Then point your proxy at `127.0.0.1:8000` and let it serve `443`.

::: warning
When a proxy is in front, tell Zagros your **public** URL
(`DOMAIN`, or `PANEL_BASE_URL`), or the links it generates will point at
`http://127.0.0.1:8000`.
:::

## Option 2 — the panel serves TLS itself

Use this when nothing else needs the port.

```bash
sudo zagros env set TLS_MODE on
sudo zagros env set UVICORN_PORT 443
sudo zagros env set UVICORN_SSL_CERTFILE /path/to/fullchain.pem
sudo zagros env set UVICORN_SSL_KEYFILE  /path/to/privkey.pem
sudo zagros env set ZAGROS_HSTS true
sudo zagros restart
sudo zagros status
```

`TLS_MODE=auto` (the default) enables TLS when both certfile and keyfile are
set, and plain HTTP otherwise — handy when the same `.env` is used behind a
proxy in one environment and directly in another.

## Behind a Unix socket

If the proxy runs on the same host, a socket avoids exposing a port at all:

```bash
sudo zagros env set UVICORN_UDS /var/lib/zagros/panel.sock
sudo zagros restart
```

## Checking it

```bash
curl -sI https://panel.example.com/dashboard/ | head -1
sudo zagros doctor        # reports the port, TLS and what is listening
```

## Traps

| Symptom | Cause |
|---|---|
| Links point at `127.0.0.1` | `DOMAIN`/`PANEL_BASE_URL` is unset while a proxy is in front |
| Certificate warning in the browser | The certificate does not cover the name users open — issue one for that exact name |
| Mixed content on the portal | The subscription links were generated before you switched to HTTPS; revoke and re-issue the user's link |

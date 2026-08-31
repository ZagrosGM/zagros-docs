# Certificates

Zagros manages TLS certificates for two different things:

| Used for | Where it is chosen |
|---|---|
| The **panel** itself (HTTPS on `UVICORN_PORT`) | `UVICORN_SSL_CERTFILE` / `UVICORN_SSL_KEYFILE` in `.env` |
| The **subscription listener** (the URLs your users get) | *Subscriptions → TLS certificate* |

Both read from the same managed certificate store, so a certificate issued once
can be used in either place.

## The managed store

Certificates live under the data directory (`/var/lib/zagros`) and are listed in
the dashboard with what matters about them: expiry, whether the private key is
present, and whether the certificate covers the name you are about to use it
for.

* **Managed** certificates are the ones Zagros issued and renews by itself.
* Others you imported are listed too, but renewal is yours.

## Issuing one

The dashboard drives ACME for you. Zagros detects which ACME client is
available on the host and uses it:

| Provider | Detected as |
|---|---|
| `certbot` | certbot (EFF) |
| `acme.sh` | acme.sh |
| `lego` | lego (go-acme) |

If none is installed, the interface says so instead of failing later.

::: warning
HTTP-01 validation needs **port 80** free and reachable from the Internet.
Zagros probes port 80 before it starts, and tells you when something else is
already listening — stop that service for the minute issuance takes, or use a
DNS-based flow with your own client.
:::

Renewal is a scheduled job, so a managed certificate is renewed before it
expires without you being involved.

## Wildcard certificates

A wildcard (`*.example.com`) cannot be issued over HTTP-01 — it needs DNS-01.
If you need one, issue it with your ACME client of choice and import it into the
managed store; see [Wildcard certificates](../examples/wildcard-ssl.md).

## Choosing one for the panel

```bash
sudo zagros env set TLS_MODE on
sudo zagros env set UVICORN_SSL_CERTFILE /var/lib/zagros/certs/live/example.com/fullchain.pem
sudo zagros env set UVICORN_SSL_KEYFILE  /var/lib/zagros/certs/live/example.com/privkey.pem
sudo zagros restart
sudo zagros status
```

Behind a reverse proxy, leave `TLS_MODE` off (or `auto`) and let the proxy
terminate TLS — the panel then serves plain HTTP on the port you chose.

## Choosing one for subscription links

In *Subscriptions*, pick a managed certificate under **TLS certificate**. It is
required when the subscription listener is `dedicated` with HTTPS, and optional
when an external reverse proxy terminates TLS for you.

## Expiry is not silent

Certificates nearing expiry show up in the dashboard and in
`zagros doctor`. Renewal happens automatically for managed ones; for imported
certificates, treat the warning as your reminder.

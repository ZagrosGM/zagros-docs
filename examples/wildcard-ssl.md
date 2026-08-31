# Wildcard certificates

A wildcard certificate (`*.example.com`) covers every subdomain at once — handy
when each node or each entry point gets its own name.

## Why the dashboard cannot issue one

HTTP-01 validation proves control of **one name** by serving a file on port 80.
A wildcard has no single name to serve a file for, so ACME requires **DNS-01**:
you must be able to create a TXT record automatically. The panel does not hold
your DNS credentials, so it does not do this for you.

## Issue it with your own client

With `acme.sh` and a DNS provider that has an API:

```bash
# one-time: credentials for your DNS provider
export CF_Token="..."
export CF_Zone_ID="..."

acme.sh --issue --dns dns_cf -d 'example.com' -d '*.example.com' \
        --cert-file  /var/lib/zagros/certs/wildcard/cert.pem \
        --key-file   /var/lib/zagros/certs/wildcard/key.pem \
        --fullchain-file /var/lib/zagros/certs/wildcard/fullchain.pem
```

`certbot` and `lego` do the same with their own DNS plugins.

## Import it into the managed store

Copy the files under the data directory (`/var/lib/zagros`) and add them in
**Certificates** so the dashboard knows about them — then the certificate can be
selected for the panel or for the subscription listener like any other.

::: warning
An imported certificate is listed and checked for expiry, but **renewal is
yours**: whatever issued it must also renew it, and a cron entry is the usual
answer.
:::

```bash
# renew with the same client, then reload the panel
acme.sh --renew -d 'example.com' --force
sudo zagros restart
```

## Using it

| Where | How |
|---|---|
| Panel | `UVICORN_SSL_CERTFILE` / `UVICORN_SSL_KEYFILE` → `zagros restart` |
| Subscription listener | **Subscriptions → TLS certificate** → pick it |
| Nodes | Each node terminates its own control-plane TLS; the panel pins that certificate, it does not need yours |

## Checking it

```bash
openssl s_client -connect panel.example.com:443 -servername panel.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates
sudo zagros doctor
```

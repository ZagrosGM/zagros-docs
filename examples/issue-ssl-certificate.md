# Issue an SSL certificate

The panel can issue and renew a certificate for you through ACME.

## Before you start

* The domain must already point at this server.
* **Port 80 must be free and reachable** — HTTP-01 validation uses it. Zagros
  probes the port first and tells you if something else is listening.
* One of the supported ACME clients must be installed: `certbot`, `acme.sh` or
  `lego`. The dashboard shows which one it found.

## From the dashboard

1. Open **Certificates → Issue**.
2. Enter the domain (for example `panel.example.com`).
3. Pick the provider, or leave it on automatic.
4. Wait for validation to finish — a managed certificate appears in the list
   with its expiry date.

The certificate is stored under the data directory and is eligible for
**automatic renewal**; you do not have to come back to it.

## Use it for the panel

```bash
sudo zagros env set TLS_MODE on
sudo zagros env set UVICORN_SSL_CERTFILE /var/lib/zagros/certs/live/panel.example.com/fullchain.pem
sudo zagros env set UVICORN_SSL_KEYFILE  /var/lib/zagros/certs/live/panel.example.com/privkey.pem
sudo zagros restart
sudo zagros status
```

## Use it for subscription links

In **Subscriptions → TLS certificate**, select it. This is what makes
`https://` subscription URLs work when the subscription listener is dedicated.

## When issuance fails

| Message | Fix |
|---|---|
| port 80 is busy | Stop the other service for the minute it takes, then retry. |
| no ACME provider found | Install `certbot`, `acme.sh` or `lego`. |
| domain does not resolve | Point the DNS record at this server first; validation happens from the Internet, not from your browser. |

```bash
sudo zagros logs          # the client's own error is passed through
sudo zagros doctor        # checks ports and DNS
```

::: tip
Renewal is a scheduled job. If a certificate is close to expiry and renewal has
not happened, `zagros doctor` reports it — check that port 80 is still free,
because renewal needs it too.
:::

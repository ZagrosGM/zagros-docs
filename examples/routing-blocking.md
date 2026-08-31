# Block traffic with routing

Routing rules let you decide what a user's traffic is allowed to reach — block
categories of destinations, send some traffic through a different outbound, or
leave everything as-is.

## Where rules live

Routing is configured in **Routing** and applied by the cores that support it
(Xray and sing-box). A rule is an ordered list: the first match wins, and
everything that matches nothing uses the default outbound.

## Typical shapes

**Block a domain**

```json
{"type": "field", "domain": ["geosite:category-ads"], "outboundTag": "block"}
```

**Block a network range**

```json
{"type": "field", "ip": ["10.0.0.0/8", "192.168.0.0/16"], "outboundTag": "block"}
```

**Send a country's traffic through a specific outbound**

```json
{"type": "field", "domain": ["geosite:google"], "outboundTag": "proxy-eu"}
```

**Block by port** (a common request on shared servers)

```json
{"type": "field", "port": "25", "network": "tcp", "outboundTag": "block"}
```

::: warning
Rules are evaluated per connection, and "block" means the connection is
refused — the client sees a timeout, not an explanation. Say so in the user's
note if you block something they will notice.
:::

## Applying and verifying

```bash
sudo zagros cores reload xray        # apply to the running core
sudo zagros status                   # core came back healthy?
```

Then test from a client:

```bash
curl --socks5 127.0.0.1:1080 https://example.com   # should be blocked
curl --socks5 127.0.0.1:1080 https://api.ipify.org # should still work
```

## Traps

| Symptom | Cause |
|---|---|
| Nothing is blocked | An earlier rule already matched, or the core does not support routing |
| Everything is blocked | Your rule is too broad — a bare `{}` rule matches everything |
| The core will not start after a change | A rule references an outbound that does not exist; the core's logs name it |

Rules are validated before they are written, so a syntactically broken rule
never reaches the core — but a rule that is valid and too broad is still your
call.

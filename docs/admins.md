# Admins

Zagros supports several admins with different scopes, so a reseller or a
colleague can manage their own users without seeing yours.

## Two kinds

| Kind | Can |
|---|---|
| **sudo** | Everything: other admins, nodes, cores, portal settings, the panel's own network settings. |
| normal | Their own users, plus exactly the panel sections their [permission matrix](#permissions) grants — within the limits you set. |

Admin **management** (creating/removing admins, promoting to sudo) stays
sudo-only. Everything else under `/api/zagros/*` — nodes, cores, portal
settings, subscription templates, certificates, applications — is available to
a normal admin whose permission matrix allows it; by default (no matrix
stored) a normal admin may use every section.

## Creating one

In the dashboard under **Admins**, or from the host:

```bash
sudo zagros advanced create-admin      # prompts for name, sudo flag and password
sudo zagros advanced reset-admin       # reset a password
```

Fields:

| Field | Meaning |
|---|---|
| username / password | Sign-in credentials. |
| is sudo | Full access. |
| max users | Cap on how many users this admin may own (`0`/empty = unlimited). |
| expire at | Date after which the admin cannot log in or manage anything. |
| traffic alloc limit (GB) | Cap on the **sum** of their users' data limits. |
| traffic consume limit (GB) | Cap on the **sum** of their users' lifetime usage — crossing it suspends all of their users. |
| telegram id / discord webhook | Where this admin's notifications go. |
| permissions | Per-section access matrix + allowed inbounds for non-sudo admins (see below). Unset = every section, all inbounds. |

## Permissions

A non-sudo admin's reach is one document, editable any time from the same
dialog:

* **Panel sections** — for each of the eighteen sections (`overview`, `users`,
  `templates`, `subscriptions`, `applications`, `nodes`, `cores`, `routing`,
  `outbounds`, `inbounds`, `hosts`, `dns`, `certificates`, `monitoring`,
  `statistics`, `support`, `settings`, `advanced`) pick one level:

  | Level | The admin can |
  |---|---|
  | **Hidden** | Not see the section at all — it disappears from the navigation and cannot be deep-linked. |
  | **View only** | Read it; every write is rejected (403). |
  | **View + edit** | Use it fully. |

* **Allowed inbounds** — either all inbounds, or an explicit tag list. A
  restricted admin sees only those inbounds in the Users/Templates pickers,
  and the API rejects user creates/modifies that name anything outside the
  list (an *empty* inbound selection — "all" — is also rejected for them, so
  a restricted admin can never escalate to everything).

Enforcement lives in the API, not the interface: the dashboard merely mirrors
what the server already enforces. sudo admins always have full access and can
edit another sudoer's account — including demoting it to normal. A sudo admin
cannot demote **themselves** (the last sudoer must not lock everyone out); do
that from another sudo account or `zagros-cli`.

See the [API contract for the document](./api.md#admin-permissions) if you
provision admins from a bot.

::: tip
The two traffic caps answer different questions: *alloc* limits what an admin
may **sell**, *consume* limits what their users may **use**. The second one
protects you from an admin whose users turn out to be very busy.
:::

## The bootstrap admin

`SUDO_USERNAME` and `SUDO_PASSWORD` in `.env` create a sudo admin when none
exists yet. Use it to get in the first time, then create a real admin and
remove the variables — a password sitting in a file on disk is a liability.

`zagros-cli admin import-from-env` imports those credentials explicitly when you
want to.

## Sessions

Admin tokens are JWTs whose lifetime is `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
(1440 by default — one day; `0` disables expiry). Signing out, or the token
expiring, returns the dashboard to the login screen.

## Ownership

Every user has an owner. A normal admin sees only their own users; a sudo admin
sees everyone. This is enforced by the API, not by the interface — a normal
admin asking for someone else's user gets a 403, not an empty list that hides
the truth.

::: warning
Deleting an admin does not delete their users: the users stay, with their
configurations intact, and become visible to a sudo admin. Reassign ownership
first if that is not what you want.
:::

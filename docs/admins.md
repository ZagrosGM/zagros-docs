# Admins

Zagros supports several admins with different scopes, so a reseller or a
colleague can manage their own users without seeing yours.

## Two kinds

| Kind | Can |
|---|---|
| **sudo** | Everything: other admins, nodes, cores, portal settings, the panel's own network settings. |
| normal | Only the users they own — and within the limits you set for them. |

Most of the Zagros admin surface (`/api/zagros/*` — nodes, cores, portal
settings, subscription templates, certificates) is **sudo only**. A normal
admin simply does not see it.

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

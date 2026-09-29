# Applications

An **application** is one official client app: a white-label build of the
Zagros client, bound to your panel. The Applications page is where you create
it, brand it, bind users to it and build installable artifacts for every
platform — without a local development environment.

## Concepts

| Concept | Meaning |
|---|---|
| Application | One branded client app with its own id, keys, icon and builds. |
| Grant | A user bound to an application; only granted users can sign in to it. |
| App credentials | The username/password a subscriber types into the app. |
| Build | One queued build job producing installable artifacts per platform. |
| Target | One platform/arch/artifact triple inside a build. |
| Builder | Where a build runs: the panel host (master) or an external SSH host. |

## Creating an application

In **Applications → New application**:

| Field | Notes |
|---|---|
| Name | 1–128 characters; shown in the dashboard and used for artifact slugs. |
| API base URL | Where the app's Client API lives — normally your panel origin. |
| Default language | `fa` by default; the app's first-run UI language. |

The response (and the app card) shows the **application id**
(`2751dadd-…`-shaped public id). Copy it into integrations that address the
application through the REST API.

### Launcher icon

Upload a square PNG (max 1 MB) on the app card. It is embedded into Android
builds as the launcher icon — no rebuild-side branding work is needed.

### Public keys

Each application has a **signing** key and a **config** key (each with a kid
such as `sig-384254b5ee751179`). These are already public — they are safe to
copy into build configurations and are used to verify sealed deliveries; the
private halves never leave the panel's key store.

## Users, grants and login

An application does nothing until users are **granted** to it:

* In the **Users** dialog, *Issue app credentials* binds the user and creates
  their login.
* Credentials look like `u16.mgyhjnml` / one generated password. The password
  is shown **once** — the panel stores only a hash.
* Switching a user away from application login revokes their app authorities;
  granting them again restores access without a new bind.

When a subscriber forgets their app password, two self-service paths rotate it:

1. The **Users** dialog → *Reissue* (admin-side).
2. The **portal page** — when the user's effective mode is application login,
   the page offers a *reissue* button; the new pair is shown once on a green
   card. Old app logins die the moment it is pressed.

See [Users → Delivery mode](./users.md#delivery-mode-access-mode) for how the
panel decides who logs in to apps and who follows a subscription link.

## Building the app

**Trigger build** opens the build wizard.

### Source and version

| Mode | Behaviour |
|---|---|
| **Simple** | Resolves the latest revision of the allowlisted app + SDK repositories automatically (`POST /api/zagros/builds/resolve-source`). Always current, nothing to pin. |
| **Advanced** | You pin the exact repository URLs and commits for both the app and the SDK — reproducible builds. |

*Version* is your app's version string (e.g. `1.0.0`). The panel also assigns
a monotonic per-application **build number** automatically.

### Targets

One row per platform/arch/artifact:

| Platform | Arch (typical) | Artifact |
|---|---|---|
| `android` | `arm64-v8a`, `armeabi-v7a`, `x86_64` | `apk`, `aab` |
| `windows` | host arch | `zip` (exe + DLL bundle) |
| `linux` | `amd64`, `arm64` | `tar.gz` |
| `macos` | host arch | `tar.gz` |
| `ios` | `arm64` | `ipa` |

The wizard auto-switches the artifact when you change the platform and
disables combinations the pipeline does not produce.

### Build on: master or external

| Option | Meaning |
|---|---|
| **Master server** | The build runs on the host the panel runs on. Simplest; uses the panel's disk/CPU. |
| **External server** | A separate Linux host reached over SSH. *Test host* probes it first (the probe credentials are used for that probe only and are never persisted); prerequisites are installed automatically. |

Both paths enforce a **resource guard**: a build is refused up-front with
`resources_insufficient` when the host lacks the configured minimum free
memory/disk (a swapfile up to ~4 GB is created automatically when RAM is
short, and builds run under a CPU/memory cap). Thresholds and the kill switch
are environment variables on the builder
(`ZAGROS_GUARD_MIN_MEMORY_MB`, `ZAGROS_GUARD_MIN_DISK_MB`,
`ZAGROS_GUARD_DISABLE=1`).

### Credentials

The wizard's *Credentials* step attaches secrets to a build:

* **Private git tokens** — for builds from private repositories.
* **External-server host credentials** — stored explicitly as a separate step
  after a successful probe.

Credentials are decrypted **only inside the worker that executes the build**
and never appear in logs or in the produced bundle.

### Watching a build

The build list shows one row per queued job (`android/arm64-v8a/apk — …`) with
its status. Opening a build shows per-target status, progress, failure codes,
logs and the artifact table (name, sha256, size). The dashboard polls until the
build leaves `queued/running`.

## Artifacts and downloads

| Platform | Artifact name (typical) |
|---|---|
| android | `{slug}-{arch}.apk` / `{slug}-{arch}.aab` |
| windows | `{slug}-windows-{arch}.zip` |
| linux | `{slug}-linux-{arch}.tar.gz` |
| macos | `{slug}-macos-{arch}.tar.gz` |
| ios | `{slug}.ipa` |

Download from the build detail dialog, or straight from the API:

```
GET /api/zagros/builds/{build_id}/artifacts/{platform}/{arch}/{filename}
```

Every artifact row carries a `sha256` — verify the download against it.

## Sources and mirrors

Build sources are **allowlisted** (`ZAGROS_BUILD_SOURCE_ALLOWLIST`,
`ZAGROS_BUILD_SDK_ALLOWLIST`). The defaults are the official
`ZagrosGM/Zagros-VPN` app repository and its SDK sibling. Air-gapped panels
typically point these at local git mirrors; the resolve cache holds five
minutes (`ZAGROS_BUILD_DEFAULT_SOURCE_JSON` names the pinned default).

## Builds from the REST API

The wizard drives the same endpoints a bot can:

| Step | Endpoint |
|---|---|
| Create application | `POST /api/zagros/applications` |
| Resolve Simple-mode sources | `POST /api/zagros/builds/resolve-source` |
| Probe an external host | `POST /api/zagros/builds/external-host-probe` |
| Queue a build | `POST /api/zagros/applications/{id}/builds` |
| Poll one build | `GET /api/zagros/builds/{build_id}` |
| List builds | `GET /api/zagros/builds` |
| Cancel | `POST /api/zagros/builds/{build_id}/cancel` |
| Logs / artifacts | `GET /api/zagros/builds/{build_id}/logs` · `/artifacts` |
| Download artifact | `GET /api/zagros/builds/{build_id}/artifacts/{platform}/{arch}/{filename}` |
| Build credentials | `POST/GET /api/zagros/build-credentials`, `/rotate`, `/revoke` |
| External workers | `POST/GET /api/zagros/builder/workers`, `/register-token` |

A minimal queued build:

```bash
curl -fsS -X POST "https://panel.example.com/api/zagros/applications/$APP_ID/builds" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
    "version": "1.0.0",
    "source_repo": "https://github.com/ZagrosGM/Zagros-VPN.git",
    "source_revision": "<commit>",
    "sdk_source_repo": "https://github.com/ZagrosGM/Zagros-VPN-SDK.git",
    "sdk_source_revision": "<commit>",
    "targets": [{"platform": "android", "arch": "arm64-v8a", "artifact": "apk"}]
  }'
```

`Advanced` wizard mode is exactly this body; `Simple` fills the four source
fields from `resolve-source`.

## When a build fails

| `failure_code` | Meaning |
|---|---|
| `resources_insufficient` | The host lacks free memory/disk (guard). Free space or raise the thresholds. |
| `provision_failed` / `provision_unsupported` | The build host could not be prepared / the platform is unsupported there. |
| `worker_error` | The worker rejected the job remotely (guard/allowlist mismatch). |

Open the build for the full failure message and logs; the job row names the
failing target.

::: tip
Building five platforms at once is five jobs, not one. Queue the platforms you
will actually ship; each target is independently downloadable when it
finishes.
:::

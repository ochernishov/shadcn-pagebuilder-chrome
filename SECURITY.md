# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub Security Advisories for this repository. Do not open a public issue for vulnerabilities involving Native Messaging, filesystem writes, permissions, or data exposure.

Include affected version, reproduction steps, expected impact, and any suggested mitigation.

## Security model

- The context menu is shown on the configured HTTP/HTTPS pattern, while page access is temporary and user-initiated through Chrome's `activeTab` permission.
- Region selection is injected only after the user clicks **+ Screenshot** and is removed before the PNG is captured.
- No remote JavaScript is loaded.
- The Native Messaging host accepts only `choose-directory` and `export` actions.
- Every export receives a random collision-checked six-digit directory with owner-only permissions.
- Export directory names are normalized before filesystem access.
- Exported files are created with owner-only permissions.
- Every export root receives a deny-by-default `Collector/.gitignore` so generated packages are not accidentally committed.
- The bundled skill resolves only an exact `Collector/<six-digit-number>/` path in the current directory or its parents.
- Provider credentials and paid component source code are out of scope and must never be stored by the project.
- `.env`, `Collector/`, `.page-collector/`, build output, release archives, logs, and editor metadata are ignored by the repository.

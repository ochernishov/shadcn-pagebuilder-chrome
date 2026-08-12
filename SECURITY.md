# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub Security Advisories for this repository. Do not open a public issue for vulnerabilities involving Native Messaging, filesystem writes, permissions, or data exposure.

Include affected version, reproduction steps, expected impact, and any suggested mitigation.

## Security model

- The extension only runs on the configured host pattern.
- No remote JavaScript is loaded.
- The Native Messaging host accepts one `export` action.
- Export directory names are normalized before filesystem access.
- Exported files are created with owner-only permissions.
- Provider credentials and paid component source code are out of scope and must never be stored by the project.

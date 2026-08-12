# Project instructions

## Scope

Shadcn Page Collector consists of a Chrome Manifest V3 extension and a local Node.js Native Messaging host.

## Commands

- Build: `npm run build`
- Tests: `npm run check`
- Native Host: `npm run install:host` (the ID is derived from `EXTENSION_PUBLIC_KEY`)

## Conventions

- Never add paid Shadcn Blocks source code or credentials.
- Read configurable names, host patterns, and export paths from `.env`.
- `extension/` is the source; `dist/extension/` is generated and must not be edited manually.
- Preserve Chrome Manifest V3 compatibility and never add remote code.
- Update `README.md`, `CHANGELOG.md`, and `docs/ARCHITECTURE.md` after meaningful behavior changes.
- Keep `skills/shadcn-collector/` compatible with both Codex and Claude Code; validate it after edits.
- Keep all user-facing strings in `extension/i18n.js`; English is the default locale.
- Store stable `typeKey` values instead of localized labels in block data.
- Never commit `.env`, `dist/`, paid block source, or fonts without a permissive redistribution license.

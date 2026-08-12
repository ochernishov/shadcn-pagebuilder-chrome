# Changelog

## [Unreleased] — 2026-08-12

## [0.4.1] — 2026-08-12

### Fixed

- The macOS installer reads the browser application name from `.env` instead of hardcoding Google Chrome.

## [0.4.0] — 2026-08-12

### Added

- Chrome Manifest V3 extension with a side panel, keyboard shortcut, and context menu.
- Structured block collection and coding-agent-ready Markdown generation.
- Local Native Messaging host for atomic JSON and Markdown exports.
- Environment-driven builds and a stable Chrome extension ID.
- Automated Native Host export tests.
- Interface and Markdown export in English, Russian, French, Italian, and Chinese.
- Compact bottom language switcher with locally persisted selection.
- Optional visible-tab PNG references for each collected block.
- Multiple saved projects and pages in one local workspace.
- Double-click macOS installer and reproducible GitHub Release ZIP packaging.

### Fixed

- Replaced unsupported `Alt+Command+B` with the valid macOS shortcut `Command+Shift+K`.
- New blocks infer a semantic type from their slug and title instead of defaulting to Hero.
- Discard immediately closes the pending block card and clears `pendingCapture` across panels.
- `[hidden]` now reliably hides the capture card and settings instead of being overridden by `display: grid`.
- Removed `sidePanel.open()` from runtime code. The shortcut and toolbar icon use Chrome's `_execute_action`; context-menu capture signals pending work with a badge.

### Changed

- English is now the default locale and extension version is `0.4.0`.
- Typography uses the bundled Geologica variable Google Font under the SIL OFL, without network requests.
- The service worker is named `collector-worker.js` to avoid stale worker error records during development.

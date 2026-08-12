# Changelog

## [Unreleased] — 2026-08-12

## [0.8.1] — 2026-08-12

### Fixed

- Restored `Command+Shift+K` as a dedicated active-page capture command instead of Chrome's `_execute_action`, so the shortcut no longer opens or closes the side panel.
- An already open panel now clears the capture badge as soon as it receives the shortcut capture.
- Side-panel page and screenshot buttons now request optional website access after the user's click instead of failing with `No active web page`.
- Project folder selection now allows only one native macOS picker at a time, preventing repeated clicks from queuing duplicate dialogs.
- Long project paths and translated controls no longer widen the Chrome side panel or push settings content off-screen.

### Changed

- Project settings now collapse into a persistent one-line summary showing project, page, route, and Create/Edit intent; choosing a project folder collapses the settings automatically.
- The page workspace now shows the page name followed by explicit **Add current page** and **Add screenshot** actions; the redundant `CURRENT PAGE` label and circular item counter were removed.
- Opening the side panel no longer captures the active tab automatically. Capture happens only through the dedicated button, keyboard command, or context menu.
- Installation and update instructions now require verifying the capture command in `chrome://extensions/shortcuts` and document the **Add current page** fallback.

## [0.8.0] — 2026-08-12

### Added

- Public-repository data boundary, permission reference, complete macOS installation/update/removal guide, and exact screenshot brief.
- Automatic deny-by-default `Collector/.gitignore` for local page specifications and screenshots.

### Changed

- Built-in project and page names now switch completely across EN, RU, FR, IT, and ZH, while user-entered names and real folder names remain untouched.
- The canonical `shadcn-collector` skill is now written in English for public Codex and Claude Code installations.
- Release archives now include changelog and security documentation.

## [0.7.0] — 2026-08-12

### Added

- Collision-checked six-digit Collector IDs and isolated `<project>/Collector/<id>/` export folders.
- Persistent export result card with the package number, path, and Copy number action.
- Shared global `shadcn-collector` skill for Codex and Claude Code.
- Deterministic skill resolver that validates and opens the exact numbered package from the current project.

### Changed

- The macOS installer now installs the Native Host and the shared coding-agent skill together.
- Release archives now include the canonical skill source.

## [0.6.0] — 2026-08-12

### Added

- Source-neutral capture on any configured HTTP or HTTPS website.
- **+ Screenshot** action with an in-page drag selector, precise PNG cropping, automatic outline insertion, and expandable local preview.
- Explicit `source` and `visual-reference` item kinds in specification version 3.
- Localized region-selection and agent-decision instructions in EN, RU, FR, IT, and ZH.

### Changed

- Subscription and source-access decisions now belong to the implementation agent, not the Collector.
- New captures store factual source metadata instead of generating a Shadcn Blocks registry command.
- The extension uses temporary `activeTab` access and does not request persistent all-sites host permission.
- Exported instructions tell agents to use official installers only when authorized and otherwise create an original implementation from the visible reference.

## [0.5.0] — 2026-08-12

### Added

- Always-visible project context with native macOS folder selection.
- Create/Edit page intent and target route in the stored and exported specification.
- Expandable saved blocks with source link, registry metadata, install command, notes, and screenshot status.

### Fixed

- Capturing an already saved source URL now expands the existing entry instead of showing another New Block card.

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

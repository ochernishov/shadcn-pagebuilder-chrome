# Changelog

## 2026-08-15 — Единый порядок инструкций и скиллов

### Fixed
- **Claude Code не видел правил проекта**: инструкции лежали только в `AGENTS.md`, а он читает `CLAUDE.md`. Добавлен симлинк — не копия, копия расходится молча.

## [Unreleased]

### Fixed

- Exported `page-spec.json` no longer keeps a stale `screenshotPath` when a block's screenshot data is missing at export time.
- The context-menu capture error is now logged in English, matching the rest of the worker's log messages.
- `scripts/package-release.mjs` referenced the renamed `docs/` folder and made `npm run package` fail with `ENOENT`.
- The GitHub Release install steps described a Control-click bypass for `Install on macOS.command` that recent macOS no longer offers; the README now gives the working `xattr -dr com.apple.quarantine` Terminal command.

### Documentation

- Folded the released 0.10.0 documentation notes out of the Unreleased section and refreshed the architecture outlook to point at the GitHub Project roadmap.
- The intentionally unpublished local screenshot variant (`* - 1.jpg`) is now ignored by Git so it cannot be committed accidentally.

## [0.10.0] — 2026-08-12

### Documentation

- Replaced the obsolete seven-PNG screenshot brief with 13 named JPEG slots covering workflow selection, project and Chrome setup, both capture modes, page editing, export, agent handoff, and localization.
- Added a screenshot manifest that tracks every public image slot, its intended use, target framing, and readiness without committing private captures or placeholders.
- Translated the screenshot-production brief into Russian while preserving all public JPEG filenames in English.
- Replaced the standalone screenshot gallery with real images embedded alongside installation, collection, editing, agent handoff, and localization instructions.

### Changed

- Simplified project settings to one current page collection: folder, page name, target route, and Create/Edit intent.
- A successful **Finish page** now preserves the exported Collector number while clearing the finished blocks, page draft, page screenshots, and page settings. Failed exports leave all working data untouched.
- Legacy multi-page workspace state migrates to its active specification and is then removed from browser storage.
- Chrome's generated manifest now reads the release version from `package.json`, preventing extension and ZIP version drift.

### Removed

- Removed **Saved pages**, **+ Project**, and **+ Page**, which duplicated folder selection and allowed unfinished browser workspaces to accumulate.

### Fixed

- Native Messaging now reads and writes complete length-prefixed payloads across multiple pipe chunks, preventing large page exports from failing near the 64 KiB boundary with a JSON control-character error.

## [0.9.2] — 2026-08-12

### Fixed

- Selected-area screenshots now request Chrome's exact optional `<all_urls>` capability required by `captureVisibleTab()`, instead of the insufficient `*://*/*` match pattern that produced an `Either the '<all_urls>' or 'activeTab' permission is required` error after region selection.

### Changed

- Context-menu visibility (`ALLOWED_HOST_PATTERN`) and screenshot permission (`CAPTURE_HOST_PERMISSION`) are now separate environment settings.

## [0.9.1] — 2026-08-12

### Added

- Expanded page items now include an editable implementation-notes field with an explicit save action and `Command+Enter` / `Ctrl+Enter` shortcut.

### Changed

- Revised notes are persisted in the active page specification and automatically used by copied prompts and subsequent JSON/Markdown exports.

## [0.9.0] — 2026-08-12

### Added

- Independent **Page** and **One block** workflows with an accessible tab switcher below the application title.
- Standalone block preparation and agent-ready structured JSON copying, with an additional PNG clipboard representation when a screenshot is included and supported.
- Persisted per-workflow capture drafts, so switching modes does not alter the collected page or lose unfinished work.

### Changed

- Project settings, page ordering, prompt export, and numbered Collector packages are shown only in **Page** mode; **One block** requires no project setup.

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

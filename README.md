# Shadcn Page Collector

Collect blocks and visual references from any website, arrange a page outline, and hand the result to Codex, Claude Code, or another coding agent as a numbered local package.

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![CI](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml/badge.svg)](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20RU%20%7C%20FR%20%7C%20IT%20%7C%20中文-17211c)](#languages)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff5c35)](LICENSE)

> Shadcn Page Collector is not affiliated with shadcn/ui, Shadcn Blocks, or any other source library. It captures only what the user can already see and never bypasses subscriptions, authentication, paywalls, or licensing restrictions.

## What it does

The extension separates visual research from implementation. While browsing component libraries, galleries, or ordinary websites, you can save source pages, selected text, notes, and screenshots into an ordered page specification. Clicking **Finish page** creates a package such as `Collector/482731/` inside the chosen project. The included `shadcn-collector` skill lets a coding agent open that exact package by number and implement it.

```text
Chrome reference collection
        ↓
<project>/Collector/482731/
        ↓
$shadcn-collector 482731
        ↓
Codex or Claude Code implements the page
```

## Features

- Capture a source page from any HTTP or HTTPS website with `⇧⌘K` on macOS, `Alt+Shift+B` elsewhere, the extension icon, or the context menu.
- Add an optional visible-tab screenshot to a captured source.
- Click **+ Screenshot**, drag over any visible area, and add the cropped PNG as its own ordered visual reference.
- Store source URL, title, hostname, selected text, semantic section type, position, and implementation notes.
- Mix installable blocks and screenshot-only references in the same page.
- Reorder, remove, expand, preview, and reopen every saved item.
- Detect duplicate source URLs and open the existing item instead of adding it twice.
- Manage multiple projects and pages in one local workspace.
- Select the real project directory with the native macOS folder picker.
- Mark a page as **Create** or **Edit** and preserve its target route.
- Export `PAGE_SPEC.md`, `page-spec.json`, and PNG references into an isolated six-digit package.
- Install the shared `shadcn-collector` skill for both Codex and Claude Code.
- Use the complete interface and exported instructions in English, Russian, French, Italian, or Chinese.
- Keep browser state, project paths, notes, screenshots, and finished packages local.

## Free, paid, and unavailable sources

Collector records factual references; it does not decide what the implementation agent is allowed to install.

| Source situation | What Collector saves | What the coding agent should do |
|---|---|---|
| Free or open-source library | Visible page metadata, URL, notes, optional screenshot | Use an official package or registry when compatible with the project and license |
| Paid library you own | The same visible reference data; legacy official install metadata is preserved when present | Use the official installer only if the user's local environment is already authorized |
| Paid library you do not own | URL, visible screenshot, selected text, and design intent only | Create an original implementation from the visible reference; do not bypass access controls or copy proprietary code |
| Ordinary website, gallery, or app | A selected screenshot region, URL, and notes | Recreate the relevant idea as an original, project-specific implementation |

No library API key is required by Collector. Credentials remain in the user's authorized project or official library tooling and are never copied into a collection.

## Install on macOS

### From a GitHub Release

Requirements: macOS, Google Chrome, and [Node.js 20 or newer](https://nodejs.org/).

1. Download `Shadcn-Page-Collector-v0.8.0.zip` from the latest GitHub Release.
2. Unzip the archive.
3. Double-click **Install on macOS.command**. If macOS blocks it, Control-click the file, choose **Open**, and confirm once.
4. Chrome opens `chrome://extensions`. Enable **Developer mode**.
5. Click **Load unpacked** and select the `extension` folder inside the unzipped archive.
6. Pin the extension if desired, then restart Codex or Claude Code once so it discovers the installed skill.

The installer copies the Native Messaging host into `~/Library/Application Support/Shadcn Page Collector/` and installs the same public skill into `~/.codex/skills/shadcn-collector/` and `~/.claude/skills/shadcn-collector/`. The downloaded archive may be removed after Chrome has loaded the extension.

Chrome Web Store distribution is not included yet, so the one remaining browser step is **Load unpacked**.

### From source

```bash
git clone https://github.com/ochernishov/shadcn-pagebuilder-chrome.git
cd shadcn-pagebuilder-chrome
cp .env.example .env
npm run setup
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `dist/extension`.

The public SPKI key in `.env.example` only keeps the unpacked extension ID stable. It is intentionally public and is not a credential.

### Update or remove

For an update, replace the release folder, run **Install on macOS.command** again, and click **Reload** on the extension card in `chrome://extensions`.

To remove Collector completely:

1. Remove the extension from `chrome://extensions`.
2. From the downloaded package or source checkout, run `node scripts/uninstall-host.mjs`.
3. Finished `Collector/` folders are user data and are not deleted automatically.

## Usage

1. Open the collector and choose a project folder.
2. Enter the page name, route, and **Create/Edit** intent.
3. Open a block, component, or reference page.
4. Press `⇧⌘K`, click the extension icon, or use **Add to Shadcn Page Collector** in the context menu.
5. Choose the semantic section type, position, notes, and whether to include a screenshot; then click **Add block** or **Discard**.
6. For an arbitrary visual fragment, click **+ Screenshot**, drag a rectangle on the page, and release.
7. Expand items to inspect their source, notes, install metadata, and screenshot. Reorder or remove them as needed.
8. Click **Finish page**, then copy the six-digit Collector number.
9. Open the same project in Codex or Claude Code and invoke the skill with that number.

## Exported package

With a selected project directory:

```text
<project>/
└── Collector/
    ├── .gitignore
    └── 482731/
        ├── PAGE_SPEC.md
        ├── page-spec.json
        └── references/
            ├── 01-hero.png
            └── 02-visual-reference.png
```

Without a selected directory, the configured fallback is `~/Documents/Page Collector/<project>/Collector/<number>/`.

Every **Finish page** click creates a new collision-checked number. `Collector/.gitignore` ignores all generated packages by default so URLs, notes, local paths, and screenshots are not accidentally committed to the target project. Remove or change that local ignore file only when you deliberately want to version a sanitized collection.

## Use with Codex or Claude Code

Open the selected project directory in the agent and use any supported form:

```text
$shadcn-collector 482731
/shadcn-collector 482731
Shadcn Collector 482731
Collector 482731
```

The skill:

1. resolves only the exact `Collector/482731/` folder in the current project or its parents;
2. validates `collectionId` in `page-spec.json`;
3. reads `PAGE_SPEC.md`, structured JSON, and every PNG in `references/`;
4. checks project instructions and existing design-system code;
5. uses authorized official installers when available, otherwise creates an original implementation from visible references;
6. verifies the finished page with the repository's lint, typecheck, tests, and visual workflow.

The canonical public skill is included at [`skills/shadcn-collector/`](skills/shadcn-collector/). It does not scan the home directory, sibling projects, credentials, or browser data.

## Languages

English is the default. The bottom switcher supports:

| Switch | Language |
|---|---|
| EN | English |
| RU | Русский |
| FR | Français |
| IT | Italiano |
| 中文 | 简体中文 |

The selected locale controls every system label, status message, semantic section name, context-menu title, and exported Markdown instruction. Built-in placeholder names such as **Landing Page** also follow the locale. Names entered by the user and real folder names are intentionally preserved exactly as written.

## Screenshots

The final images are being prepared. The expandable tabs define the public sequence; exact filenames and redaction rules are in [`docs/screenshots/README.md`](docs/screenshots/README.md).

<details open>
<summary><strong>1. Project setup</strong></summary>

Project folder selection, page name, target route, and Create/Edit intent.

Planned file: `docs/screenshots/01-project-setup.png`
</details>

<details>
<summary><strong>2. Capture a source block</strong></summary>

A library detail page with the pending source card, section type, notes, screenshot option, Discard, and Add block.

Planned file: `docs/screenshots/02-source-capture.png`
</details>

<details>
<summary><strong>3. Capture an arbitrary region</strong></summary>

The rectangle selector on a normal website and the resulting cropped reference.

Planned file: `docs/screenshots/03-region-capture.png`
</details>

<details>
<summary><strong>4. Arrange a mixed page</strong></summary>

An outline containing installable sources and visual-only references with expanded details.

Planned file: `docs/screenshots/04-page-outline.png`
</details>

<details>
<summary><strong>5. Finish and copy the Collector number</strong></summary>

The successful export card with a demo six-digit ID and sanitized path.

Planned file: `docs/screenshots/05-finish-page.png`
</details>

<details>
<summary><strong>6. Hand off to a coding agent</strong></summary>

Codex or Claude Code resolving the same number and summarizing the package.

Planned file: `docs/screenshots/06-agent-skill.png`
</details>

<details>
<summary><strong>7. Five complete interface languages</strong></summary>

One contact sheet showing EN, RU, FR, IT, and 中文 with the same system-managed page name translated in every frame.

Planned file: `docs/screenshots/07-languages.png`
</details>

## What is public and what stays local

| Safe and expected in this repository | Must remain local and is ignored |
|---|---|
| Extension, Native Host, build scripts, tests, documentation | `.env` and any credentials or tokens |
| Canonical `shadcn-collector` skill | `Collector/` packages and `.page-collector/` state |
| `.env.example` with non-secret defaults and the public extension key | Personal project paths, private URLs, notes, selected text, screenshots |
| Geologica font under the SIL Open Font License | Paid/proprietary component source code and library credentials |
| Sanitized documentation screenshots | Chrome profile data, account information, and unsanitized captures |

The extension has no analytics, remote backend, advertising, or account system. See [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

## Permissions

| Permission | Why it is needed |
|---|---|
| `activeTab` | Temporary access after an explicit user action |
| `scripting` | Inject and remove the rectangle-selection overlay |
| `storage`, `unlimitedStorage` | Store workspace data and explicitly captured PNGs locally |
| `sidePanel` | Show the Collector interface |
| `nativeMessaging` | Choose a macOS folder and write the finished local package |
| `contextMenus`, `commands` | User-initiated capture actions |

The manifest has no persistent `host_permissions`. Source websites continue to make their own normal browser requests; Collector does not add network requests or upload collected data.

## Configuration and development

Copy `.env.example` to `.env`; never commit `.env`. Available variables configure the app name, Native Host name, stable public extension key, allowed context-menu URL pattern, fallback export directory, default route, Chrome application, Collector directory, and Codex/Claude skill locations.

```bash
npm run build
npm run check
npm run install:host
npm run package
```

Source files live in `extension/`; `dist/extension/` and `release/` are generated and ignored. After rebuilding, click **Reload** for the unpacked extension on `chrome://extensions`.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) for implementation and contribution details.

## License

Project code is available under the [MIT License](LICENSE). The bundled Geologica variable font is licensed under the SIL Open Font License; see [`extension/fonts/OFL.txt`](extension/fonts/OFL.txt).

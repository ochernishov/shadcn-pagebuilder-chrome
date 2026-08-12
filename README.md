# Shadcn Page Collector

Turn visual references from any website into an implementation-ready page specification for Codex, Claude Code, or another coding agent.

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![CI](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml/badge.svg)](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff5c35)](LICENSE)

Shadcn Page Collector lets you collect source pages from component libraries or ordinary websites, attach precisely cropped visual references, describe the intended adaptation, reorder the page, and export both structured JSON and a Markdown prompt.

> This project is not affiliated with Shadcn Blocks or shadcn/ui. It stores block metadata and your design intent. It does not scrape, copy, or redistribute paid source code.

## Why it exists

Design selection and implementation are different jobs. This extension preserves source URLs, visible references, section roles, order, and adaptation notes without deciding whether a library is free, paid, or available in the user's environment. The coding agent makes that decision later: it may use an authorized official installer or create an original implementation from the visible reference.

## Features

- Capture a source page from any HTTP or HTTPS website with `⇧⌘K` on macOS or `Alt+Shift+B` elsewhere.
- Capture a page, selection, or link from the Chrome context menu.
- Automatically infer semantic section types such as Hero, Dashboard, Pricing, or FAQ.
- Add a visual-only reference by clicking **+ Screenshot**, dragging over any visible page area, and saving the resulting cropped PNG as an ordered page item.
- Reorder and remove collected blocks.
- Maintain multiple projects and pages in one local workspace.
- Choose the real local project folder through the native macOS folder picker.
- Mark each page task as Create or Edit and preserve its target route.
- Attach an optional visible-tab PNG reference to every selected source.
- Expand every collected item to revisit its source URL, notes, screenshot status, and local image preview. Legacy registry metadata remains visible when present.
- Detect an already collected source URL and open its saved entry instead of presenting it as new.
- Export `page-spec.json` and `PAGE_SPEC.md` through a local Native Messaging host.
- Copy the generated coding-agent prompt directly to the clipboard.
- Switch instantly between English, Russian, French, Italian, and Chinese.
- Keep all project data local in Chrome storage and the selected export directory.

## Screenshot tour

The final screenshots are being prepared. Each expandable tab below defines the exact frame that will replace the placeholder description. See [the local screenshot brief](docs/screenshots/README.md) for filenames and capture requirements.

<details open>
<summary><strong>1. Capture a block</strong></summary>

A component-library detail page with the extension side panel open. The frame should show the detected source title and domain, inferred section type, position, and implementation notes.

Planned file: `docs/screenshots/01-capture-block.png`
</details>

<details>
<summary><strong>2. Capture any visual reference</strong></summary>

The region-selection overlay on a normal website, followed by the cropped reference expanded in the Current Page outline.

Planned file: `docs/screenshots/02-capture-region.png`
</details>

<details>
<summary><strong>3. Build the page outline</strong></summary>

A populated Current Page list with several semantic sections in order and the move/remove controls visible.

Planned file: `docs/screenshots/03-page-outline.png`
</details>

<details>
<summary><strong>4. Switch language</strong></summary>

The bottom language switcher changing the complete interface and existing block labels without losing the collected data.

Planned file: `docs/screenshots/04-language-switcher.png`
</details>

<details>
<summary><strong>5. Export for a coding agent</strong></summary>

The generated `PAGE_SPEC.md` beside `page-spec.json`, showing source metadata, adaptation notes, and implementation instructions.

Planned file: `docs/screenshots/05-export.png`
</details>

## Install on macOS — release package

1. Download `Shadcn-Page-Collector-v0.6.0.zip` from the latest GitHub Release.
2. Unzip it and double-click **Install on macOS.command**.
3. Chrome opens `chrome://extensions`; enable **Developer mode**.
4. Click **Load unpacked** and select the `extension` folder inside the unzipped package.

The installer copies the Native Messaging host into `~/Library/Application Support/Shadcn Page Collector/`. The downloaded package can be removed after Chrome has loaded the extension. Node.js 20+ is currently required by the local export host.

## Install from source

Requirements:

- Google Chrome or another Chromium browser with Side Panel support.
- macOS and Node.js 20+ for the included Native Messaging export host.

```bash
git clone https://github.com/ochernishov/shadcn-pagebuilder-chrome.git
cd shadcn-pagebuilder-chrome
cp .env.example .env
npm run setup
```

Then:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist/extension` directory.

The public extension key keeps the unpacked extension ID stable. It is not a secret. The Native Messaging installer derives the ID automatically.

## Usage

1. Open a component, block, design reference, or ordinary website.
2. Press the shortcut or click the extension icon.
3. Choose the section type and add adaptation notes.
4. Leave **Include screenshot reference** enabled when the full visible tab will help the target model.
5. To save only a precise fragment, click **+ Screenshot**, drag over the desired page area, and release. The cropped reference is added immediately and the pending source card is cleared.
6. Add source items and visual references in any combination.
7. Choose the local project folder, set the page name, route, and Create/Edit task.
8. Create or switch projects/pages from the project section.
9. Expand saved items to revisit their source and preview captured images.
10. Reorder the collected outline if needed.
11. Click **Finish page** to export files, or **Copy prompt** to use the Markdown immediately.

When a project folder is selected, exports are written to:

```text
<Project>/.page-collector/<Page>/
```

Without a selected project folder, the fallback location is:

```text
~/Documents/Page Collector/<Project>/<Page>/
├── PAGE_SPEC.md
├── page-spec.json
└── references/
    ├── 01-hero1.png
    └── 02-feature12.png
```

## Languages

English is the default. The compact switcher at the bottom of the side panel supports:

| Code | Language |
|---|---|
| EN | English |
| RU | Русский |
| FR | Français |
| IT | Italiano |
| 中文 | 中文 |

The selected locale is saved locally. It controls the interface, semantic block labels, context-menu title, status messages, and exported Markdown.

## Configuration

Copy `.env.example` to `.env`. Do not commit `.env`.

| Variable | Purpose |
|---|---|
| `APP_NAME` | Extension and local companion name |
| `NATIVE_HOST_NAME` | Chrome Native Messaging host identifier |
| `EXTENSION_PUBLIC_KEY` | Public SPKI key used for a stable extension ID |
| `EXPORT_DIRECTORY` | Root export directory |
| `ALLOWED_HOST_PATTERN` | HTTP/HTTPS pages shown in the capture context menu; the public default is all websites |
| `DEFAULT_PROJECT` | Initial project name |
| `DEFAULT_PAGE` | Initial page name |
| `DEFAULT_ROUTE` | Initial route |
| `CHROME_EXTENSIONS_URL` | Browser extension-management page opened by the installer |
| `CHROME_APP_NAME` | macOS browser application name used by the installer |
| `PROJECT_EXPORT_DIRECTORY` | Subdirectory created inside a selected project folder |

## Development

```bash
npm run build
npm run check
npm run install:host
npm run package
```

Source files live in `extension/`. The `dist/extension/` directory is generated and must not be edited manually.

After rebuilding, reload the unpacked extension on `chrome://extensions`.

The extension uses `activeTab`: it receives temporary access only after the user opens the extension or chooses its context-menu command. It does not request persistent access to every website.

## Privacy and security

The extension has no analytics, remote backend, or account system. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## License

Project code is available under the [MIT License](LICENSE). The bundled Geologica variable font is licensed separately under the SIL Open Font License; see [`extension/fonts/OFL.txt`](extension/fonts/OFL.txt).

# Shadcn Page Collector

Turn visual block selection into an implementation-ready page specification for Codex, Claude Code, or another coding agent.

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![CI](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml/badge.svg)](https://github.com/ochernishov/shadcn-pagebuilder-chrome/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff5c35)](LICENSE)

Shadcn Page Collector lets you browse [Shadcn Blocks](https://www.shadcnblocks.com/), capture the blocks you want, describe how each block should be adapted, reorder the page, and export both structured JSON and a Markdown prompt.

> This project is not affiliated with Shadcn Blocks or shadcn/ui. It stores block metadata and your design intent. It does not scrape, copy, or redistribute paid source code.

## Why it exists

Design selection and implementation are different jobs. This extension preserves the decisions made while browsing a component library—source URL, registry ID, section role, order, and adaptation notes—so a coding agent receives a precise specification instead of a vague screenshot request.

## Features

- Capture the active Shadcn Block with `⇧⌘K` on macOS or `Alt+Shift+B` elsewhere.
- Capture a page, selection, or link from the Chrome context menu.
- Automatically infer semantic section types such as Hero, Dashboard, Pricing, or FAQ.
- Reorder and remove collected blocks.
- Export `page-spec.json` and `PAGE_SPEC.md` through a local Native Messaging host.
- Copy the generated coding-agent prompt directly to the clipboard.
- Switch instantly between English, Russian, French, Italian, and Chinese.
- Keep all project data local in Chrome storage and the selected export directory.

## Screenshot tour

The final screenshots are being prepared. Each expandable tab below defines the exact frame that will replace the placeholder description. See [the local screenshot brief](docs/screenshots/README.md) for filenames and capture requirements.

<details open>
<summary><strong>1. Capture a block</strong></summary>

The Shadcn Blocks detail page with the extension side panel open. The frame should show the detected block title, registry ID, inferred section type, position, and implementation notes.

Planned file: `docs/screenshots/01-capture-block.png`
</details>

<details>
<summary><strong>2. Build the page outline</strong></summary>

A populated Current Page list with several semantic sections in order and the move/remove controls visible.

Planned file: `docs/screenshots/02-page-outline.png`
</details>

<details>
<summary><strong>3. Switch language</strong></summary>

The bottom language switcher changing the complete interface and existing block labels without losing the collected data.

Planned file: `docs/screenshots/03-language-switcher.png`
</details>

<details>
<summary><strong>4. Export for a coding agent</strong></summary>

The generated `PAGE_SPEC.md` beside `page-spec.json`, showing source metadata, adaptation notes, and implementation instructions.

Planned file: `docs/screenshots/04-export.png`
</details>

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

1. Open a specific block detail page on Shadcn Blocks.
2. Press the shortcut or click the extension icon.
3. Choose the section type and add adaptation notes.
4. Add the block and repeat for the rest of the page.
5. Reorder the collected outline if needed.
6. Click **Finish page** to export files, or **Copy prompt** to use the Markdown immediately.

By default, exports are written to:

```text
~/Documents/Page Collector/<Project>/<Page>/
├── PAGE_SPEC.md
└── page-spec.json
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
| `ALLOWED_HOST_PATTERN` | Pages on which capture is available |
| `DEFAULT_PROJECT` | Initial project name |
| `DEFAULT_PAGE` | Initial page name |
| `DEFAULT_ROUTE` | Initial route |

## Development

```bash
npm run build
npm run check
npm run install:host
```

Source files live in `extension/`. The `dist/extension/` directory is generated and must not be edited manually.

After rebuilding, reload the unpacked extension on `chrome://extensions`.

## Privacy and security

The extension has no analytics, remote backend, or account system. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## License

Project code is available under the [MIT License](LICENSE). The bundled Geologica variable font is licensed separately under the SIL Open Font License; see [`extension/fonts/OFL.txt`](extension/fonts/OFL.txt).

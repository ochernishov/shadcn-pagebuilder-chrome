# Shadcn Page Collector architecture

## Data flow

```text
Any HTTP/HTTPS source page
  -> Chrome action / context menu
  -> background service worker
  -> side panel + chrome.storage.local
  -> Native Messaging
  -> Node.js local host
  -> page-spec.json + PAGE_SPEC.md
  -> Codex / Claude Code
```

## Component boundaries

### Chrome extension

The extension records only factual source metadata: URL, title, hostname, slug, selected text, capture time, and user instructions. It does not classify subscriptions or invent an installation command. The shortcut and toolbar icon use Chrome's built-in `_execute_action`, which opens the side panel safely. The panel then requests metadata for the active tab. The context menu stores a pending source and displays a badge without calling `sidePanel.open()`.

The extension manages multiple projects/pages, selected local project directories, Create/Edit intent, routes, semantic section types, ordering, expandable source metadata, and screenshots stored separately from the JSON specification. A pending source whose URL already exists is deduplicated and opens the saved entry.

Manual region capture uses the temporary `activeTab` grant and the `scripting` permission. After the explicit **+ Screenshot** click, the service worker injects an isolated Shadow DOM selection overlay into the active page. The user drags a rectangle; the overlay is removed before `captureVisibleTab` runs. The side panel crops the PNG using the captured viewport-to-image scale, adds a `visual-reference` item, and clears the automatically detected pending source. No persistent all-sites host permission is requested.

Source access is intentionally deferred. The exported agent instructions require the implementation agent to inspect its own authorized registries and credentials. When official source access is unavailable, the agent must create an original implementation from the visible reference without bypassing access controls or copying proprietary code.

### Native Messaging host

The host accepts `choose-directory` and `export` actions. On macOS, `choose-directory` opens the native folder picker. Export normalizes directory names and writes JSON, Markdown, and optional PNG references with owner-only permissions into `<project>/.page-collector/<page>/`. The launcher provides the fallback root and project subdirectory through its environment. Installation copies the host into Application Support so it does not depend on the downloaded repository or release directory.

### Build configuration

`scripts/build.mjs` reads `.env`, replaces template tokens, copies static files, and creates a self-contained Chrome bundle in `dist/extension`.

## Specification format

JSON is the source of truth and supports future exporters. Markdown is a derived representation for a coding agent. Each item contains `kind` (`source` or `visual-reference`), source URL and hostname, slug, semantic type key, capture timestamp, and user instructions. Screenshot items also contain an ID and relative PNG path. Registry IDs and CLI commands are optional legacy or externally supplied metadata, never requirements of the neutral capture model.

## Localization

`extension/i18n.js` is the single source of interface and export strings for EN, RU, FR, IT, and ZH. English is the default. Block data stores a stable `typeKey`, so changing language translates an existing outline and export without changing the JSON structure.

## Potential next versions

- Drag-and-drop block ordering.
- Optional element-aware capture in addition to rectangular region selection.
- Coding-agent launch after export.

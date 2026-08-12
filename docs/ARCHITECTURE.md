# Shadcn Page Collector architecture

## Data flow

```text
Shadcn Blocks page
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

The extension records only the URL, title, slug, selected text, and derived registry command. The shortcut and toolbar icon use Chrome's built-in `_execute_action`, which opens the side panel safely. The panel then requests metadata for the active tab. The context menu stores a pending block and displays a badge without calling `sidePanel.open()`.

The extension manages multiple projects/pages, semantic block types, ordering, and optional screenshot references. Screenshots are stored separately from the JSON specification and are only captured after an explicit checked option and user click. It does not extract or store paid block source code.

### Native Messaging host

The host accepts one `export` action, normalizes directory names, and writes JSON, Markdown, and optional PNG references with owner-only permissions. The launcher provides the root export directory through its environment. Installation copies the host into Application Support so it does not depend on the downloaded repository or release directory.

### Build configuration

`scripts/build.mjs` reads `.env`, replaces template tokens, copies static files, and creates a self-contained Chrome bundle in `dist/extension`.

## Specification format

JSON is the source of truth and supports future exporters. Markdown is a derived representation for a coding agent. Each block contains its source URL, slug, registry ID, CLI command, semantic type key, and user instructions.

## Localization

`extension/i18n.js` is the single source of interface and export strings for EN, RU, FR, IT, and ZH. English is the default. Block data stores a stable `typeKey`, so changing language translates an existing outline and export without changing the JSON structure.

## Potential next versions

- Screenshot references for selected sections.
- Multiple saved projects and pages.
- Drag-and-drop block ordering.
- Explicit Shadcn MCP integration and coding-agent launch.

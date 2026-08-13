# Shadcn Page Collector architecture

## Data flow

```text
Any HTTP/HTTPS source page
  -> Chrome action / context menu
  -> background service worker
  -> side panel + chrome.storage.local
  -> Native Messaging
  -> Node.js local host
  -> Collector/<six-digit-number>/
  -> global shadcn-collector skill
  -> Codex / Claude Code
```

## Component boundaries

### Chrome extension

The extension records only factual source metadata: URL, title, hostname, slug, selected text, capture time, and user instructions. It does not classify subscriptions or invent an installation command. The toolbar icon uses Chrome's action behavior to open the side panel. The `capture-block` keyboard command records the active page without opening or closing the panel; an already open panel receives the pending capture through storage changes, while a closed panel is signaled with a badge. The context menu follows the same pending-capture path. Runtime code never calls `sidePanel.open()`.

The extension manages one current page specification: its selected local project directory, Create/Edit intent, route, semantic section types, ordering, expandable source metadata, editable implementation notes, and screenshots stored separately from the JSON specification. Saving notes updates the current specification through the normal persistence path, so copied prompts and later JSON/Markdown exports use the revised value. A pending source whose URL already exists is deduplicated and opens the saved entry. Legacy multi-page workspace data is reduced to its active specification during hydration and the obsolete workspace record is removed.

The side panel has two persisted workflows. `page` mode owns the single current page specification, Native Host export, and its own pending draft. `single` mode owns a separate pending draft and one prepared standalone item. Switching modes swaps the active draft through `workflowDrafts` without modifying the page outline. A standalone item is copied as structured JSON; when it has a screenshot and the browser supports multi-format clipboard writes, the same clipboard item also exposes the PNG representation. This path does not invoke Native Messaging or create a Collector folder.

After the Native Host confirms a successful page export, the extension keeps the returned Collector number and directory visible but replaces the current page with a clean default specification. It removes only screenshots referenced by the exported page, clears the page draft and expanded item, and reopens project settings. A failed export never resets working data, and the independent **One block** result remains untouched.

Keyboard and context-menu captures use the temporary `activeTab` grant. A side-panel click does not provide that grant, so **Add current page** and **Add screenshot** synchronously request the configurable `CAPTURE_HOST_PERMISSION` value from `optional_host_permissions`. Its public default is `<all_urls>` because Chrome requires either that exact permission or a temporary `activeTab` grant for `captureVisibleTab()`. `ALLOWED_HOST_PATTERN` remains a separate context-menu visibility pattern. Chrome prompts only after the explicit click, retains an accepted permission, and lets the user revoke it later.

Manual region capture also uses the `scripting` permission. After the explicit **Add screenshot** click and permission grant, the service worker injects an isolated Shadow DOM selection overlay into the active page. The user drags a rectangle; the overlay is removed before `captureVisibleTab` runs. The side panel crops the PNG using the captured viewport-to-image scale, adds a `visual-reference` item, and clears the automatically detected pending source.

Source access is intentionally deferred. The exported agent instructions require the implementation agent to inspect its own authorized registries and credentials. When official source access is unavailable, the agent must create an original implementation from the visible reference without bypassing access controls or copying proprietary code.

### Native Messaging host

The host accepts `choose-directory` and `export` actions. On macOS, `choose-directory` opens the native folder picker. Every export allocates a collision-checked six-digit ID and creates an owner-only directory at `<project>/Collector/<id>/`. JSON, Markdown, and PNG references from different exports are never mixed. The ID is persisted as `collectionId` in JSON, prepended to Markdown, and returned to the side panel for display and copying.

Without a selected project directory, the fallback is `<export-root>/<project>/Collector/<id>/`. The launcher provides both roots through its environment. Installation copies the host into Application Support so it does not depend on the downloaded repository or release directory.

The host creates `Collector/.gitignore` with a deny-by-default rule. Finished specifications and screenshots are local workflow artifacts and do not enter a target repository unless a user explicitly changes that rule after sanitizing the package.

### Shared coding-agent skill

The canonical skill lives at `skills/shadcn-collector/` in this repository and ships in release archives. The installer copies the same skill to the environment-configured Codex and Claude Code global skill directories. Its deterministic resolver accepts exactly six digits and searches only `Collector/<id>/` in the current directory and its parents. It validates `page-spec.json` before the agent reads or implements the package.

### Build configuration

`scripts/build.mjs` reads `.env`, replaces template tokens, copies static files, and creates a self-contained Chrome bundle in `dist/extension`.

## Specification format

JSON is the source of truth and supports future exporters. Markdown is a derived representation for a coding agent. Each item contains `kind` (`source` or `visual-reference`), source URL and hostname, slug, semantic type key, capture timestamp, and user instructions. Screenshot items also contain an ID and relative PNG path. Registry IDs and CLI commands are optional legacy or externally supplied metadata, never requirements of the neutral capture model.

Standalone clipboard JSON uses `kind: "single-block"`, a schema version, factual source metadata, a stable `typeKey` plus localized label, implementation notes, screenshot presence, and the source-access policy. Screenshot base64 is never embedded in JSON.

At export time, the host adds the package-level `collectionId` and `exportedAt` fields.

## Localization

`extension/i18n.js` is the single source of interface and export strings for EN, RU, FR, IT, and ZH. English is the default. Block data stores a stable `typeKey`, so changing language translates an existing outline and export without changing the JSON structure. Built-in project and page placeholders carry stable label keys and follow the selected locale; user-entered values and real directory names remain unchanged.

## Potential next versions

Planned work is tracked as epics and sub-issues in the repository's GitHub Project. Current direction, in short: stay local-first and capture-focused; deepen the bridge to coding agents (element-aware capture, drag-and-drop ordering, MCP resource export, edit-mode diff context) rather than generate code inside the extension.

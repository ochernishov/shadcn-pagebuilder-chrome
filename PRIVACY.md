# Privacy

Shadcn Page Collector is local-first.

## Data collected

The extension stores selected local project paths, project names, page names, Create/Edit mode, target routes, selected language, source metadata, ordering, notes that you enter, and screenshots that you explicitly request.

Page collections and the standalone **One block** result are stored separately. Switching modes does not send or merge their data.

## Where data is stored

- Working state: `chrome.storage.local` in your browser profile.
- Finished exports: isolated `Collector/<six-digit-number>/` directories inside the selected project, or inside the fallback directory configured by `EXPORT_DIRECTORY`.

The Native Host creates `Collector/.gitignore` with a deny-by-default rule. Generated packages, URLs, notes, local paths, and screenshots therefore stay out of the target project's Git history unless the user deliberately changes that file.

Screenshots capture either the visible content area when you click **Add block** with the screenshot option enabled, or the page rectangle you explicitly select after clicking **Add screenshot**. They remain local and are exported as PNG references.

In **One block** mode, **Copy for agent** writes structured JSON to the system clipboard. When the prepared block includes a screenshot and Chrome supports multi-format clipboard data, the same explicit copy action also writes the PNG representation. The screenshot is not embedded as base64 in the JSON and is never uploaded by Collector.

## Website access

The extension does not require permanent website access at installation. The configured HTTP/HTTPS pattern is an optional permission that Chrome requests only when you explicitly click **Add current page** or **Add screenshot** in the side panel. If you decline, no page is captured. Chrome retains an accepted permission until you revoke it in the extension settings. The keyboard shortcut and context menu use Chrome's temporary `activeTab` access.

## Network activity

The extension has no analytics, telemetry, advertising, account system, or remote application backend. It does not upload collected specifications.

Normal browsing requests made by source websites are controlled by those websites and Chrome, not this extension.

## Source library content

The collector records visible reference metadata such as page URL, hostname, slug, selected text, and screenshots. It does not determine subscription ownership, extract hidden source code, bypass access controls, or redistribute paid source code.

The globally installed skill reads a numbered package only when invoked from that project. Its resolver does not scan the home directory, sibling projects, credentials, or browser data.

## Public repository boundary

The public repository contains application source, tests, documentation, the canonical agent skill, non-secret configuration examples, a public extension identity key, and the OFL-licensed font. It must not contain `.env`, credentials, browser state, personal project paths, private URLs, collected notes, captured screenshots, generated `Collector/` packages, or proprietary component source code.

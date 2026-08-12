# Privacy

Shadcn Page Collector is local-first.

## Data collected

The extension stores selected local project paths, project names, page names, Create/Edit mode, target routes, selected language, source metadata, ordering, notes that you enter, and screenshots that you explicitly request.

## Where data is stored

- Working state: `chrome.storage.local` in your browser profile.
- Finished exports: isolated `Collector/<six-digit-number>/` directories inside the selected project, or inside the fallback directory configured by `EXPORT_DIRECTORY`.

The Native Host creates `Collector/.gitignore` with a deny-by-default rule. Generated packages, URLs, notes, local paths, and screenshots therefore stay out of the target project's Git history unless the user deliberately changes that file.

Screenshots capture either the visible content area when you click **Add block** with the screenshot option enabled, or the page rectangle you explicitly select after clicking **+ Screenshot**. They remain local and are exported as PNG references.

## Network activity

The extension has no analytics, telemetry, advertising, account system, or remote application backend. It does not upload collected specifications.

Normal browsing requests made by source websites are controlled by those websites and Chrome, not this extension.

## Source library content

The collector records visible reference metadata such as page URL, hostname, slug, selected text, and screenshots. It does not determine subscription ownership, extract hidden source code, bypass access controls, or redistribute paid source code.

The globally installed skill reads a numbered package only when invoked from that project. Its resolver does not scan the home directory, sibling projects, credentials, or browser data.

## Public repository boundary

The public repository contains application source, tests, documentation, the canonical agent skill, non-secret configuration examples, a public extension identity key, and the OFL-licensed font. It must not contain `.env`, credentials, browser state, personal project paths, private URLs, collected notes, captured screenshots, generated `Collector/` packages, or proprietary component source code.

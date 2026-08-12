# Privacy

Shadcn Page Collector is local-first.

## Data collected

The extension stores selected local project paths, project names, page names, Create/Edit mode, target routes, selected language, source metadata, ordering, notes that you enter, and screenshots that you explicitly request.

## Where data is stored

- Working state: `chrome.storage.local` in your browser profile.
- Finished exports: the directory configured by `EXPORT_DIRECTORY` through the local Native Messaging host.

Screenshots capture either the visible content area when you click **Add block** with the screenshot option enabled, or the page rectangle you explicitly select after clicking **+ Screenshot**. They remain local and are exported as PNG references.

## Network activity

The extension has no analytics, telemetry, advertising, account system, or remote application backend. It does not upload collected specifications.

Normal browsing requests made by source websites are controlled by those websites and Chrome, not this extension.

## Source library content

The collector records visible reference metadata such as page URL, hostname, slug, selected text, and screenshots. It does not determine subscription ownership, extract hidden source code, bypass access controls, or redistribute paid source code.
